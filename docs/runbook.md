# Runbook operativo

> **Para qué sirve este documento.** Lo que necesitas tener a mano cuando algo se rompe o cuando ejecutas operaciones rutinarias. Comandos, queries SQL útiles, plantilla de troubleshooting.
>
> **Cómo crece**: cada vez que algo se rompe y se arregla, se añade aquí cómo se diagnostica y se soluciona. Con el tiempo, se convierte en la memoria operacional del equipo.

---

## Comandos rutinarios

### Smoke test del processor

```bash
curl https://scan-processor-production.up.railway.app/health
```

Esperado: `{"ok":true,"timestamp":"..."}`.

### Local development

```bash
# Procesador
cd scan-processor
npm install
npm run dev          # tsx watch con recarga automática

# Agente (Windows o cross-compile)
cd agent
go build -o agent.exe ./cmd/agent
./agent.exe
```

### Test del scanner sin Supabase

```bash
cd scan-processor
npx tsx --env-file=.env test-fixtures/test-grype-only.ts
```

### Sincronizar fuentes externas (manual)

Hasta que estén automatizadas vía cron:

```bash
cd scan-processor
npx tsx --env-file=.env src/jobs/sync-cisa-kev.ts
npx tsx --env-file=.env src/jobs/sync-software-versions.ts
```

### Actualizar la BD de Grype

Hasta que esté automatizado, requiere rebuild del Docker:

1. Push a `main` (Railway hace rebuild → `grype db update` en build-time).
2. Verificar deploy con smoke test.

---

## Queries SQL útiles

Todas se ejecutan en Supabase Studio → SQL Editor.

### Total alertas activas por device

```sql
SELECT device_id, COUNT(*) AS alertas
FROM client_alerts
WHERE status = 'open'
GROUP BY device_id;
```

### KEV-flagged críticas (lo más urgente)

```sql
SELECT software_name, cve_id, priority_score, device_id
FROM client_alerts
WHERE in_cisa_kev = true AND status = 'open'
ORDER BY priority_score DESC;
```

### Último scan por device

```sql
SELECT device_id, MAX(started_at) AS ultimo_scan, status
FROM scans
GROUP BY device_id, status
ORDER BY ultimo_scan DESC;
```

### Scans fallidos recientes

```sql
SELECT id, device_id, error_msg, started_at
FROM scans
WHERE status = 'failed'
ORDER BY started_at DESC
LIMIT 20;
```

### Devices que no han escaneado en 7+ días

```sql
SELECT id, device_name, tenant_id, last_scanned
FROM devices
WHERE last_scanned < NOW() - INTERVAL '7 days'
   OR last_scanned IS NULL
ORDER BY last_scanned NULLS FIRST;
```

### Distribución de alertas por tipo

```sql
SELECT alert_type, status, COUNT(*) AS total
FROM client_alerts
GROUP BY alert_type, status
ORDER BY alert_type, status;
```

### Software más vulnerable (CVE count por software)

```sql
SELECT software_name, COUNT(*) AS cves
FROM client_alerts
WHERE alert_type = 'cve' AND status = 'open'
GROUP BY software_name
ORDER BY cves DESC
LIMIT 20;
```

---

## Troubleshooting

> Plantilla para rellenar conforme aparezcan problemas reales en producción. La idea es que la próxima vez que pase, no haya que diagnosticar desde cero.

### El processor no responde

**Síntomas**: `curl /health` falla o tarda >30s.

**Diagnóstico**:
1. ¿Railway está caído? Ver status: https://railway.app/status
2. ¿Logs de Railway muestran errores? Dashboard → Logs.
3. ¿El último deploy ha fallado? Dashboard → Deployments.

**Soluciones probables**:
- Si Railway está caído: esperar.
- Si el deploy ha fallado: revisar logs de build, normalmente es problema con env vars o Dockerfile.
- Si el container se reinicia en bucle: revisar `lib/config.ts` (Zod hace `process.exit(1)` si una env var crítica falta).

### Grype no encuentra CVEs en CPEs que sabemos están en NVD

**Síntomas**: el agente envía CPE 2.3 válido, pero Grype no devuelve CVEs.

**Diagnóstico**:
1. ¿La BD de Grype está actualizada? Comprobar fecha de build del container Railway.
2. ¿El CPE está bien formado? Ejecutar `grype` localmente con el SBOM como prueba.
3. ¿NVD tiene ese producto? Buscar el CPE manualmente en https://nvd.nist.gov/products/cpe/search.

**Soluciones probables**:
- Si la BD está vieja: rebuild del Docker.
- Si el CPE está mal: revisar la entrada en `software-mappings.json`.
- Si NVD no tiene el producto: aceptar (skip silencioso). Ej: GitHub Desktop.

### endoflife.date no responde

**Síntomas**: el pipeline genera 0 alertas EOL durante un rato.

**Diagnóstico**:
1. ¿endoflife.date está caído? Probar `curl https://endoflife.date/api/python.json`.
2. ¿El timeout de 5s es suficiente? Si la API está lenta, sube `EOL_TIMEOUT_MS`.

**Soluciones probables**:
- Si está caído: aceptar la pérdida temporal del pilar EOL (skip silencioso por diseño).
- Pendiente: cachear respuestas en Supabase con TTL 24h para no depender en cada scan.

### El agente sale con exit code 1

**Síntomas**: el cliente reporta que `agent.exe` se cierra inmediatamente.

**Diagnóstico**:
1. ¿El cliente ha rellenado bien el `config.yaml`? Revisar `tenant_id`.
2. ¿El processor está accesible? Ver smoke test arriba.
3. ¿La defensa multi-tenant está rechazando el `agent_id`? Buscar en logs del processor: HTTP 403 en `/api/devices/register`.

**Soluciones probables**:
- Si `tenant_id` está mal: regenerar `config.yaml` desde el frontend.
- Si HTTP 403: el `agent_id` ya existe con otro `tenant_id`. Borrar `agent_id.txt` para regenerar.

### Alertas duplicadas en `client_alerts`

**Síntomas**: el mismo CVE aparece dos veces en el dashboard.

**Diagnóstico**:
1. ¿La unique key está bien definida? Revisar schema de `client_alerts`.
2. ¿Hay variantes del `software_name` que escapan a la unique key? (ej: distintos casing).

**Soluciones probables**:
- El dedupe in-memory en `persistence.ts` debería evitar esto. Si pasa, revisar `software_name` raw vs canónico.

---

## Checklist post-deploy

Cuando hagas push a `main` y Railway haga el deploy automático:

- [ ] Smoke test de `/health` responde 200.
- [ ] Probar un scan completo desde el agente local contra Railway.
- [ ] Comprobar en Supabase Studio que el último scan tiene `status='completed'`.
- [ ] Comprobar logs en Railway sin errores nuevos.

---

## Operaciones programadas

> Estado actual: todas manuales. Pendiente automatizar con cron jobs.

| Tarea | Frecuencia objetivo | Quién la ejecuta hoy |
|---|---|---|
| `sync-cisa-kev` | Diario a las 6 AM UTC | Manual |
| `sync-software-versions` | Diario a las 7 AM UTC | Manual |
| `grype db update` | Diario a las 5 AM UTC | Manual (rebuild Docker) |
| Backup de Supabase | Diario | No hay (plan Free) |
| Revisión de scans fallidos | Semanal | Manual |

---

## Contactos de emergencia

- **Railway support**: https://help.railway.com/
- **Supabase support**: https://supabase.com/support
- **Repo principal**: https://github.com/jose99segura/scan-processor

---

## Cómo contribuir a este runbook

Cada vez que se rompa algo en producción y lo soluciones:

1. Añade un caso al apartado **Troubleshooting** con: síntomas, diagnóstico, solución.
2. Si has descubierto una query SQL útil para diagnosticar, añádela al apartado de queries.
3. Si has añadido una operación nueva, documéntala arriba.

El runbook crece y se vuelve más útil con cada incidencia.
