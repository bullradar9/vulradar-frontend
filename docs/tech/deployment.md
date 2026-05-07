# Despliegue e infraestructura

> **Para qué sirve este documento.** Cómo se despliega cada componente del sistema, qué servicios contratamos, costes actuales, configuración. Si caes en producción, sabes dónde tocar.

---

## Servicios contratados

| Servicio | Plan | Coste | Región |
|---|---|---|---|
| Supabase | Free | 0 € | Frankfurt (EU) |
| Railway | Hobby | ~$10/mes | EU West (Amsterdam) |
| GitHub | Free | 0 € | — |
| Lovable | Free | 0 € | — |

**Total**: ~$10/mes con uso actual.

---

## Despliegue del Scan Processor (Railway)

### Cómo se despliega

1. Push a `main` en GitHub (`https://github.com/jose99segura/scan-processor`).
2. Railway detecta el push automáticamente.
3. Railway construye el Dockerfile multi-stage:
   - **Stage 1**: build de TypeScript con Node 20 slim.
   - **Stage 2**: runtime con Node 20 slim + Grype 0.85.0 preinstalado + BD de Grype pre-cargada.
4. Despliegue automático.
5. URL pública: `https://scan-processor-production.up.railway.app`.

### Dockerfile (multi-stage)

Características clave:

- Grype instalado en `/usr/local/bin/grype`.
- BD de Grype pre-cargada en build-time (`grype db update`).
- Cache de Grype en `/var/cache/grype` con `GRYPE_DB_CACHE_DIR`.
- Usuario no-root (`app`) con home dir.
- `HEALTHCHECK` añadido para Railway.

### Variables de entorno en Railway

Configuradas en el dashboard de Railway:

```
SUPABASE_URL=https://aqsdyoonbvofolugtxyz.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_***
NODE_ENV=production
LOG_LEVEL=info
```

> Lista completa de env vars (incluyendo opcionales con default) en [`scan-processor.md`](./scan-processor.md).

---

## Despliegue de la base de datos

El schema completo vive en `scan-processor/supabase/schema.sql`. Se aplica manualmente vía Supabase Studio → SQL Editor cuando hay cambios.

> **Pendiente**: automatizar migraciones SQL versionadas (no urgente para MVP, pero buena práctica antes de tener varios clientes en producción).

---

## Distribución del agente

`agent.exe` se sube a Supabase Storage. Es descargable desde el frontend con un `config.yaml` personalizado por tenant.

Detalle en [`agent.md`](./agent.md).

---

## Datos en tránsito

- **Agente → Processor**: HTTPS (cert managed por Railway).
- **Processor → Supabase**: HTTPS (cert managed por Supabase).
- **Processor → APIs externas** (endoflife.date, CISA): HTTPS.

## Datos en reposo

- **Supabase**: encriptación AES-256 at-rest (incluida en cualquier plan).
- **Storage**: igualmente encriptado.

## Localización (NIS2 / GDPR)

- **Supabase**: Frankfurt (`eu-central-1`). ✅
- **Railway**: EU West (Amsterdam). ✅
- **Sin transferencia a EE.UU.** en datos de cliente. ✅

---

## Smoke test post-deploy

Después de cada deploy, comprobar que el processor responde:

```bash
curl https://scan-processor-production.up.railway.app/health
```

Esperado: `{"ok":true,"timestamp":"..."}`.

> Más comandos de diagnóstico en [`../runbook.md`](../runbook.md).

---

## Compliance pendiente

- [ ] Política de privacidad pública.
- [ ] DPA template para empresas con departamento legal exigente.
- [ ] Auditoría de logs (quién accede a qué).
- [ ] Backup automático (Supabase Pro lo incluye, Free no — ahora mismo no hay backups).
- [ ] Rotación periódica de `service_role_key`.
- [ ] Code signing del agent.exe (~$200/año).

---

## Mejoras de infraestructura por fase

### Necesario antes de tener 5+ clientes pagando
- Cron jobs automáticos (3 jobs: `sync-cisa-kev`, `sync-software-versions`, `grype db update`).
- Caché de endoflife.date en Supabase (TTL 24h).
- Auth real en frontend (migrar fuera de `service_role_key`).
- Code signing del .exe.
- HMAC firmado entre agente y processor.

### Necesario antes de tener 50+ clientes
- Cola asíncrona (BullMQ + Redis).
- Workers separados del API.
- Métricas y observabilidad (Grafana Cloud o similar).
- Plan Supabase Pro ($25/mes con backups).
- Status page pública.

### Necesario antes de tener 200+ clientes
- Multi-instancia Railway con sharding por tenant.
- Pre-aggregation de KPIs en materialized views.
- Política de retención formal de scans.
- Pen-testing externo.

---

## Decisiones técnicas relevantes

Detalle en [`../decisions.md`](../decisions.md):

- Supabase + Railway en lugar de AWS / GCP / Azure (simplicidad operacional para MVP).
- Localización 100% UE (NIS2/GDPR + argumento de marketing).
- Mono-servicio (Grype y processor en mismo container) para simplificar deploy.
- Pipeline síncrono sin colas en MVP.
