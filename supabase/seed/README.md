# Seed data — solo desarrollo

Datos sintéticos para probar la UI con un tenant que tenga variedad realista de devices y alertas. **No es schema** (DDL); es **DML** atado a un `tenant_id` específico.

## Reglas

- ⚠️ **NO ejecutar en tenants de producción.** El SQL inserta filas con `tenant_id` hardcodeado de `jose99segura@gmail.com`. Si lo aplicas en producción, contaminas el tenant.
- **No es idempotente.** Cada ejecución genera UUIDs nuevos y añade más devices/alertas. Para resetear, borra a mano los rows seedeados (filtra por `device_name IN ('nuc-marketing','laptop-ana','laptop-luis','desktop-old','srv-files','nuevo-portatil','desktop-clean')`).
- **Schema vive en otro repo.** Las tablas (`devices`, `scans`, `client_alerts`, `cisa_kev`, `software_versions`) están definidas en `scan-processor/supabase/schema.sql`. Aquí solo metemos datos.

## Por qué este SQL vive en `frontend/`

- Es DML, no DDL.
- Los datos sirven para probar **UI states** del frontend (devices con muchas alertas, sin scan, limpios, etc.).
- El equipo de scan-processor no lo necesita — tiene su propia ingesta sintética del agente.
- Coherente con D023 (pendiente): *"Schema en scan-processor; seeds dev en el repo del consumer."*

## Cómo aplicar

### Opción A: vía MCP (Claude Code o similar)
```
mcp__supabase__apply_migration(name="dev_seed_devices_alerts", query=<contenido del .sql>)
```

### Opción B: vía Supabase Studio
1. Abrir SQL Editor del proyecto: https://supabase.com/dashboard/project/aqsdyoonbvofolugtxyz/sql/new
2. Pegar el contenido de `0001_dev_devices_and_alerts.sql`.
3. Run.

## Qué crea

7 devices nuevos en el tenant `7c66a774-2839-4793-8e10-bfa75bd1013a` (junto a los reales que ya hubiera):

| device | OS | last_scanned | open | crit | KEV | notas |
|---|---|---|---:|---:|---:|---|
| `nuc-marketing` | Win 11 23H2 x64 | hace 2h | 12 | 1 | 1 | Reciente, agente al día |
| `laptop-ana` | Win 11 23H2 x64 | ayer | 23 | 3 | 0 | Reciente, varias críticas |
| `laptop-luis` | Win 11 23H2 arm64 | hace 2 días | 5 | 0 | 0 | Reciente, pocas alertas |
| `desktop-old` | Win 10 22H2 x64 | hace 12 días | 40 | 11 | 1 | Olvidado, agente viejo (0.4.1) |
| `srv-files` | Win 10 22H2 x64 | hace 21 días | 3 | 1 | 0 | Olvidado server |
| `nuevo-portatil` | Win 11 24H2 arm64 | NULL | 0 | 0 | 0 | Registrado, sin scan |
| `desktop-clean` | Win 11 23H2 x64 | hace 3h | 0 | 0 | 0 | 5 alertas en `patched` |

Software canónicos alineados con la tabla curada del agente (`docs/tech/agent.md`) y con datos reales pre-existentes en el tenant (`nodejs`, `acrobat-reader`, etc.).

## `0002_dev_patched_critical_history.sql` — historial de alertas resueltas

Datos **estrictamente sintéticos** para alimentar la métrica *"Tiempo medio de resolución de alertas críticas"* del Informe NIS2 (Artículo 21.2.f).

- Crea **1 device adicional** llamado `synthetic-patched-history` (marca obvia de "no es real") + **1 scan** + **25 alertas** con `status='patched'` y `priority_score >= 9.0`.
- Las alertas se reparten en los últimos 90 días con tiempos de resolución variados: 8 rápidas (1-3 días), 10 medias (4-10 días), 7 lentas (15-30 días). Media teórica ≈ 9,5 días.
- Mezcla realista de software (chrome, firefox, office, dotnet).
- **No modifica schema**. La tabla `client_alerts` no tiene un flag `is_synthetic`, y este seed *no lo añade*. La marca de "sintético" es exclusivamente:
  1. Comentario al inicio del SQL.
  2. Esta sección del README.
  3. El `device_name = 'synthetic-patched-history'`, que permite filtrar y borrar a mano si hace falta.

Para resetear sólo este seed:

```sql
DELETE FROM public.client_alerts WHERE device_id IN (
  SELECT id FROM public.devices
  WHERE tenant_id = '7c66a774-2839-4793-8e10-bfa75bd1013a'
    AND device_name = 'synthetic-patched-history'
);
DELETE FROM public.scans WHERE device_id IN (
  SELECT id FROM public.devices
  WHERE tenant_id = '7c66a774-2839-4793-8e10-bfa75bd1013a'
    AND device_name = 'synthetic-patched-history'
);
DELETE FROM public.devices
WHERE tenant_id = '7c66a774-2839-4793-8e10-bfa75bd1013a'
  AND device_name = 'synthetic-patched-history';
```

## Verificación post-seed

```sql
-- Total devices del tenant (existentes + 7 seedeados)
SELECT count(*) FROM public.devices
WHERE tenant_id = '7c66a774-2839-4793-8e10-bfa75bd1013a';

-- Breakdown por device
SELECT d.device_name,
       count(*) FILTER (WHERE ca.status='open') AS open,
       count(*) FILTER (WHERE ca.status='open' AND ca.cvss_severity='critical') AS critical,
       count(*) FILTER (WHERE ca.status='open' AND ca.in_cisa_kev=TRUE) AS kev
FROM public.devices d
LEFT JOIN public.client_alerts ca ON ca.device_id = d.id
WHERE d.tenant_id = '7c66a774-2839-4793-8e10-bfa75bd1013a'
GROUP BY d.id, d.device_name
ORDER BY d.device_name;
```
