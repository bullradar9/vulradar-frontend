# Scan Processor (backend)

> **Para qué sirve este documento.** Todo lo necesario para entender, ejecutar, modificar y desplegar el backend Node.js que recibe SBOMs del agente y ejecuta el pipeline de análisis.

---

## Resumen

Servidor HTTP que recibe SBOMs del agente, los procesa contra Grype + endoflife.date + tabla propia de versiones, y genera alertas en Supabase.

---

## Tecnología

| Aspecto | Valor |
|---|---|
| Lenguaje | Node.js 20+ con TypeScript |
| Framework HTTP | Fastify |
| Validación | Zod |
| Logging | Pino (structured logging) |
| Motor CVE | Grype 0.85.0 (binario externo, escrito en Go por Anchore) |
| Despliegue | Docker en Railway EU West (Amsterdam) |
| URL pública | `https://scan-processor-production.up.railway.app` |
| Repo Git | `https://github.com/jose99segura/scan-processor` |

---

## Estructura del repositorio

```
scan-processor/
├── package.json                       # Node 20+, Fastify, Zod, Pino
├── tsconfig.json
├── Dockerfile                         # Multi-stage con Grype 0.85.0 preinstalado
├── .dockerignore
├── .env.example
├── data/
│   └── software-mappings.json         # Copia de la tabla (deuda: duplicada con agent/)
├── supabase/
│   └── schema.sql                     # Schema completo con RLS
├── test-fixtures/
│   ├── sample-sbom.json
│   └── test-grype-only.ts             # Harness sin Supabase
└── src/
    ├── index.ts                       # Entry point (Fastify)
    ├── routes/
    │   ├── scans.ts                   # POST /api/scans
    │   └── devices.ts                 # POST /api/devices/register
    ├── services/
    │   ├── pipeline.ts                # Orquestador de los 3 pasos
    │   ├── grype.ts                   # Wrapper de Grype como subproceso
    │   ├── eol.ts                     # Cliente endoflife.date
    │   ├── versions.ts                # Comparación de versiones robusta
    │   ├── scoring.ts                 # Cálculo de priority_score
    │   └── persistence.ts             # Upsert en Supabase con dedupe
    ├── jobs/
    │   ├── sync-cisa-kev.ts           # Descarga CISA KEV → tabla cisa_kev
    │   └── sync-software-versions.ts  # endoflife.date → tabla software_versions
    ├── lib/
    │   ├── config.ts                  # Validación env vars con Zod (al cargar módulo)
    │   ├── logger.ts                  # Pino logger
    │   └── supabase.ts                # Cliente Supabase (service_role)
    └── types/
        └── domain.ts                  # Tipos del dominio (hand-written)
```

---

## Endpoints HTTP

### `POST /api/scans`

Recibe un SBOM CycloneDX 1.5 y ejecuta el pipeline completo de análisis.

**Request body** (validado con Zod):

```json
{
  "agent_id": "uuid",
  "tenant_id": "uuid",
  "device_id": "uuid",
  "sbom": {
    "bomFormat": "CycloneDX",
    "specVersion": "1.5",
    "version": 1,
    "metadata": { ... },
    "components": [ ... ]
  }
}
```

**Flujo**:

1. Crea registro `scans` con `status='processing'`.
2. Persiste inventario en `device_inventory` (fire-and-forget, no bloquea alertas).
3. Ejecuta `runAnalysisPipeline` (3 pasos independientes).
4. Hace upsert de alertas en `client_alerts`.
5. Marca scan como `completed`.
6. Actualiza `last_scanned` en `devices`.

**Response**:

```json
{
  "scan_id": "uuid",
  "status": "completed",
  "software_count": 77,
  "alerts_generated": 79
}
```

**Latencia típica**: 5-30 segundos (síncrono, sin colas).

### `POST /api/devices/register`

Registra un nuevo equipo o devuelve el `device_id` existente si el `agent_id` ya estaba.

- **Idempotente**: mismo `agent_id` → mismo `device_id`.
- **Defensa multi-tenant**: si `agent_id` existe con otro `tenant_id`, devuelve HTTP 403.

### `GET /health`

Health check para Railway. Devuelve `{"ok": true, "timestamp": "..."}`.

---

## Pipeline de análisis (`pipeline.ts`)

Tres pasos **independientes**: si Grype falla, EOL y OUTDATED siguen funcionando. Los errores se acumulan en `result.errors` pero no abortan el pipeline.

### Paso 1: CVE (Grype + CISA KEV)

1. Escribe el SBOM a un archivo temporal.
2. Ejecuta `grype sbom:archivo.json -o json --quiet` como subproceso (timeout 60s).
3. Parsea el JSON de output.
4. Para cada match, consulta tabla `cisa_kev` en Supabase para enriquecer con flag `in_cisa_kev`.
5. Calcula `priority_score` con multiplicador KEV (×1.5).
6. Limpia archivo temporal.

### Paso 2: EOL (endoflife.date)

1. Para cada componente del SBOM con nombre canónico conocido (lista hardcodeada en `EOL_PRODUCT_MAP`), llama a `https://endoflife.date/api/{producto}/{ciclo}.json`.
2. Timeout 5s, skip silencioso si falla.
3. Genera alerta solo si está EOL ya o estará en próximos 365 días.
4. Calcula `priority_score` según proximidad a fecha EOL.

**Productos cubiertos en `EOL_PRODUCT_MAP`**: Windows, macOS, Ubuntu, Debian, Node.js, Python, PHP, Office, PostgreSQL, MySQL, Redis, Chrome (slug `googlechrome`), Firefox.

### Paso 3: OUTDATED (tabla `software_versions`)

1. Carga toda la tabla `software_versions` de Supabase (~200 registros).
2. Para cada componente, compara versión instalada vs `latest_stable`.
3. Si está atrás, calcula `versions_behind` y `priority_score` (2.0-6.0 según diferencia de major version).
4. Skip silencioso si la versión no se puede parsear.

---

## Comparación de versiones (`versions.ts`)

**Soporta**:
- SemVer estándar: `1.2.3`, `1.2.3-beta`, `1.2.3+build`.
- Cuatro segmentos: `16.0.19929.20090` (Office).
- Sufijos de arquitectura: `3.14-64` → `3.14`.
- Build numbers entre paréntesis: `6.7.8 (32670)` → `6.7.8`.
- CalVer simple: `2025.2`.

**No soporta** (devuelve `null` = skip silencioso):
- Hashes de commit: `2026.01.24-997c2cb`.
- Strings opacos.

---

## Cálculo de priority_score (`scoring.ts`)

### CVE
```
score = cvss × multiplicador, capado a 10
multiplicador = 1.5 si está en CISA KEV
multiplicador = 1.0 si no
```

### EOL

| Estado | Score |
|--------|-------|
| Ya EOL | 9.0 |
| EOL en < 30 días | 8.0 |
| EOL en < 90 días | 7.0 |
| EOL en < 180 días | 6.0 |
| EOL en < 365 días | 5.0 |
| EOL en > 365 días | 4.0 |

### OUTDATED

| Versiones atrás | Score |
|-----------------|-------|
| 1 versión major | 2.0 |
| 2 | 3.0 |
| 3 | 4.0 |
| 4-5 | 5.0 |
| 6+ | 6.0 |

---

## Persistencia (`persistence.ts`)

### `upsertAlerts`

- Upsert en `client_alerts` con `onConflict: 'tenant_id,device_id,alert_type,software_name,cve_id'`.
- **Dedupe in-memory antes del upsert**: Grype a veces emite el mismo CVE varias veces (distintas ramas de matchers CPE). PostgreSQL rechaza `ON CONFLICT` con dos filas que apunten al mismo conflict-target. Solución: dedupe por la unique key conservando `priority_score` máximo.

### `upsertInventory`

- Upsert en `device_inventory` por `(tenant_id, device_id, software_name, version)`.
- Lee `install_path`, `source`, `raw_name`, `SHA-256` de `sbom.components[].properties` / `.hashes`.

---

## Variables de entorno

| Variable | Obligatoria | Default | Descripción |
|----------|-------------|---------|-------------|
| `SUPABASE_URL` | Sí | — | URL del proyecto Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Sí | — | Service role key (bypass RLS) |
| `PORT` | No | 3000 | Puerto HTTP |
| `NODE_ENV` | No | development | development / production / test |
| `LOG_LEVEL` | No | info | debug / info / warn / error |
| `GRYPE_PATH` | No | /usr/local/bin/grype | Ruta al binario Grype |
| `GRYPE_TIMEOUT_MS` | No | 60000 | Timeout de Grype (60s) |
| `EOL_API_BASE` | No | https://endoflife.date/api | Base URL endoflife.date |
| `EOL_TIMEOUT_MS` | No | 5000 | Timeout endoflife.date (5s) |
| `CISA_KEV_URL` | No | URL oficial CISA | URL del JSON CISA KEV |

`config.ts` valida con Zod **al cargar el módulo** y `process.exit(1)` si falla. Cualquier import transitorio dispara la validación.

---

## Comandos útiles

```bash
# Desarrollo
npm install
npm run dev          # tsx watch con recarga automática
npm run build        # tsc → dist/
npm run start        # node dist/index.js (producción)
npm run typecheck    # tsc --noEmit

# Sincronizar fuentes externas (manual)
npx tsx --env-file=.env src/jobs/sync-cisa-kev.ts
npx tsx --env-file=.env src/jobs/sync-software-versions.ts

# Test ad-hoc del scanner sin Supabase
npx tsx --env-file=.env test-fixtures/test-grype-only.ts
```

---

## Limitaciones conocidas

- **Pipeline síncrono**: sin colas, sin workers. Si un cliente tiene un SBOM enorme, podría timeout. Aceptable hasta el primer cliente que se queje.
- **Mono-servicio**: Grype y processor en el mismo contenedor. Simplifica deploy pero acopla ambos.
- **`grype db update` no automático**: solo en build-time del Docker. La BD de Grype se queda estática hasta el siguiente deploy.
- **Cron jobs no programados**: `sync-cisa-kev` y `sync-software-versions` se ejecutan a mano. Pendiente automatizar.
- **Sin caché de endoflife.date**: cada scan llama a la API. Riesgo si la API cae.

---

## Decisiones técnicas relevantes

Detalle en [`../decisions.md`](../decisions.md):

- Stack TypeScript en lugar de Go (compatibilidad con futura migración del frontend, ecosistema más amplio para integraciones).
- Grype como motor de matching (Apache 2.0, Anchore lo mantiene, Apache 2.0).
- Pipeline síncrono en MVP, sin colas.
- Dedupe in-memory antes del upsert (evita conflicto de Grype emitiendo el mismo CVE varias veces).
- Service role key solo en backend, nunca expuesta al frontend.
