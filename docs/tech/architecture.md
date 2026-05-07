# Arquitectura técnica — vista de pájaro

> **Para qué sirve este documento.** Es la entrada al lado técnico. En 5 minutos sabes qué piezas componen el sistema, cómo se hablan entre ellas, y a qué archivo ir si quieres profundizar.
>
> **Filosofía**: este documento es **factual**. Si algo cambia en el código, este documento se actualiza en el mismo PR.

---

## Diagrama del sistema

```
[Cliente Windows]                [Nuestra infra EU]                 [Servicios externos]

   ┌─────────────────┐
   │  AGENTE (Go)    │
   │  agent.exe      │  HTTPS POST
   │                 │ ─────────────────►  ┌──────────────────────┐
   │  Lee registro   │                     │  SCAN PROCESSOR       │
   │  Genera SBOM    │                     │  Railway EU West      │
   │  Envía datos    │                     │  Node.js + TS         │  HTTPS GET
   └─────────────────┘                     │  + Grype binario      │ ───────────────► endoflife.date
                                           │  + Fastify            │
                                           └─────────┬────────────┘
                                                     │ SQL
                                                     ▼
                                           ┌──────────────────────┐
                                           │  SUPABASE EU          │
                                           │  Frankfurt            │  ◄─── sync diario manual ── CISA KEV
                                           │  PostgreSQL + RLS     │
                                           │  + Storage            │
                                           └──────────┬───────────┘
                                                      │
                                                      │ Supabase JS client
                                                      ▼
                                           ┌──────────────────────┐
                                           │  FRONTENDS (Lovable)  │
                                           │  Dashboard cliente    │
                                           │  Dashboard admin      │
                                           └──────────────────────┘
```

---

## Componentes

| Componente | Tecnología | Función | Documento |
|---|---|---|---|
| **Agente endpoint** | Go 1.22+ | Corre en el PC del cliente. Lee software instalado, genera SBOM, lo envía. | [`agent.md`](./agent.md) |
| **Scan Processor** | Node.js 20 + TypeScript + Fastify | Recibe SBOMs, ejecuta el pipeline de análisis (CVE/EOL/OUTDATED), persiste alertas. | [`scan-processor.md`](./scan-processor.md) |
| **Base de datos** | PostgreSQL en Supabase EU | Datos del cliente con multi-tenancy via RLS. | [`database.md`](./database.md) |
| **Frontends** | Lovable | Dashboards cliente y admin. **Provisional** hasta migrar. | [`frontends.md`](./frontends.md) |

## Servicios externos

| Servicio | Cómo se consume | Función | Detalle |
|---|---|---|---|
| **Grype + NVD** | Binario local en el processor | Motor de matching CVE | [`data-sources.md`](./data-sources.md) |
| **endoflife.date** | API HTTP en cada scan | Fechas de fin de soporte | [`data-sources.md`](./data-sources.md) |
| **CISA KEV** | Sync manual a tabla local | CVEs activamente explotados | [`data-sources.md`](./data-sources.md) |

---

## Flujo de datos extremo a extremo

Caso de uso real, validado en producción.

```
1. Cliente descarga agent.exe + config.yaml desde el frontend
   (config.yaml ya tiene tenant_id rellenado)

2. Cliente ejecuta agent.exe (doble-click)

3. Agente:
   - Genera agent_id con UUID v4 → guarda en agent_id.txt
   - Lee registro Windows → encuentra ~84 paquetes
   - Aplica cleanup → emite ~77 (filtra los sin versión)
   - Para 12, encuentra match en tabla curada → construye CPE 2.3
   - POST /api/devices/register → recibe device_id, guarda en config.yaml
   - POST /api/scans con SBOM CycloneDX

4. Scan Processor (Railway):
   - Crea scan con status=processing
   - Persiste inventario (~77 filas en device_inventory)
   - Pipeline:
     • Grype: 76-90 CVEs encontrados (variable según versión BD Grype)
     • EOL: ~1 alerta (.NET, etc.)
     • OUTDATED: ~0-2 alertas
     • Enriquecimiento KEV: marca CVEs con multiplicador ×1.5 priority_score
   - Upsert ~80-93 alertas
   - Status=completed
   - HTTP 200 al agente

5. Agente: muestra resumen al cliente, pausa al cierre

6. Cliente abre el frontend → ve dashboard con sus alertas reales
```

### Métricas reales del flujo

Validado en producción (Railway EU + Supabase EU), sobre un PC Windows típico de desarrollador:

| Métrica | Local (dev) | Railway (prod) |
|---------|-------------|----------------|
| Software detectado en registro | 84 | 84 |
| Software emitido al SBOM | 77 | 77 |
| Con CPE válido | 12 | 12 |
| Total alertas | 93 | 79 |
| CVEs (Grype) | 90 | 76 |
| EOL | 1 | 1 |
| OUTDATED | 2 | 2 |
| KEV-flagged (score 10) | 4 | 4 |

> La diferencia local vs Railway en CVEs se debe a la versión de la BD de Grype dentro del container Railway (cargada en build-time) frente a la BD local con actualizaciones más recientes. Es deuda técnica conocida — ver [`roadmap.md`](../roadmap.md).

---

## Latencia y tamaños típicos

| Métrica | Valor |
|---|---|
| Tiempo de scan completo del cliente | < 2 minutos |
| Tiempo de respuesta del processor (síncrono) | 5-30 segundos |
| Tamaño del SBOM enviado | ~50-200 KB |
| Tamaño del agente.exe | ~10 MB |
| BD de Grype en el container | ~100 MB |

---

## Decisiones arquitectónicas clave

Las razones detrás de las decisiones están en [`../decisions.md`](../decisions.md). Resumen:

- **3 pilares de detección** (CVE + EOL + OUTDATED): garantizan que el dashboard nunca esté vacío. Eliminar uno sería un error fatal de producto.
- **Pipeline síncrono sin colas**: simple, suficiente para MVP. Cuando un cliente se queje de latencia, evaluamos colas asíncronas.
- **Sin LLMs en runtime**: lentos, caros, no deterministas, alucinan.
- **Filosofía "skip silencioso"**: cuando no hay certeza, no se genera alerta. Falsos positivos erosionan más la confianza que falsos negativos.
- **Multi-tenancy por RLS**: PostgreSQL filtra automáticamente por `tenant_id` del JWT.
- **Localización 100% UE**: Supabase Frankfurt, Railway Amsterdam.

---

## Si vienes a profundizar

- ¿Cómo lee el agente el software del cliente? → [`agent.md`](./agent.md)
- ¿Qué hace el pipeline en detalle? → [`scan-processor.md`](./scan-processor.md)
- ¿Cómo está modelada la BD? → [`database.md`](./database.md)
- ¿De dónde vienen los CVEs? → [`data-sources.md`](./data-sources.md)
- ¿Cómo se despliega? → [`deployment.md`](./deployment.md)
- ¿Qué hago si algo se rompe? → [`../runbook.md`](../runbook.md)
