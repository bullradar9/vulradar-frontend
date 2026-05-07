# Base de datos

> **Para qué sirve este documento.** El schema completo de la base de datos, cómo está implementada la multi-tenancy, y cómo se gestionan las claves de acceso a Supabase.

---

## Resumen

PostgreSQL gestionado por Supabase, ubicado en Frankfurt (EU). Multi-tenancy implementada vía Row Level Security (RLS).

---

## Tecnología

| Aspecto | Valor |
|---|---|
| Servicio | Supabase (managed) |
| Motor | PostgreSQL 15+ |
| Región | Frankfurt (`eu-central-1`) |
| Plan actual | Free |
| Project ID | `aqsdyoonbvofolugtxyz` |
| Multi-tenancy | Row Level Security (RLS) por `tenant_id = auth.uid()` (modelo MVP, ver D021) |
| Storage | Supabase Storage (para distribuir `agent.exe`) |

---

## Tablas

| Tabla | Propósito | Multi-tenant |
|---|---|---|
| `devices` | Equipos registrados de clientes | Sí (`tenant_id`) |
| `scans` | Histórico de scans con status | Sí |
| `device_inventory` | Software instalado por equipo | Sí |
| `client_alerts` | Alertas generadas (CVE/EOL/OUTDATED) | Sí |
| `software_versions` | Última versión estable conocida | No (global) |
| `cisa_kev` | Lista de CVEs activamente explotados | No (global) |

---

## Schema completo

### `devices`

```sql
CREATE TABLE devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  agent_id UUID NOT NULL UNIQUE,
  device_name TEXT NOT NULL,
  os TEXT NOT NULL,                  -- 'windows' | 'macos' | 'linux'
  os_version TEXT,
  architecture TEXT,                 -- 'x64' | 'arm64' | 'x86'
  agent_version TEXT,
  agent_pubkey TEXT,                 -- futuro: clave pública RSA del agente
  last_scanned TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_devices_tenant ON devices(tenant_id);
```

### `scans`

```sql
CREATE TABLE scans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  sbom_path TEXT,                    -- ruta en Supabase Storage (opcional en MVP)
  software_count INTEGER NOT NULL DEFAULT 0,
  alerts_generated INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'processing'
    CHECK (status IN ('processing','completed','failed')),
  error_msg TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
```

### `device_inventory`

```sql
CREATE TABLE device_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  scan_id UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
  software_name TEXT NOT NULL,        -- nombre canónico (limpio)
  software_name_raw TEXT NOT NULL,    -- nombre original sin normalizar
  version TEXT,
  publisher TEXT,
  install_path TEXT,
  sha256 TEXT,
  purl TEXT,
  source TEXT NOT NULL DEFAULT 'unknown',
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, device_id, software_name, version)
);
```

### `client_alerts`

```sql
CREATE TABLE client_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  scan_id UUID NOT NULL REFERENCES scans(id),
  alert_type TEXT NOT NULL CHECK (alert_type IN ('cve','eol','outdated')),
  software_name TEXT NOT NULL,
  software_version TEXT,
  -- CVE-specific
  cve_id TEXT,
  cvss_score NUMERIC(3,1),
  cvss_severity TEXT,
  in_cisa_kev BOOLEAN DEFAULT FALSE,
  fix_version TEXT,
  description TEXT,
  -- EOL-specific
  eol_date DATE,
  latest_version TEXT,
  -- OUTDATED-specific
  latest_stable TEXT,
  versions_behind INTEGER,
  -- Common
  priority_score NUMERIC(3,1) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open','acknowledged','patched','ignored')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, device_id, alert_type, software_name, cve_id)
);

CREATE INDEX idx_alerts_priority ON client_alerts(tenant_id, priority_score DESC)
  WHERE status = 'open';
```

**Unicidad de alertas**: la unique key garantiza que si el agente reescanea y encuentra el mismo CVE, no se duplica — se hace upsert. El status (`open`/`acknowledged`/`patched`/`ignored`) se preserva entre scans.

### `software_versions` (global)

```sql
CREATE TABLE software_versions (
  product TEXT PRIMARY KEY,
  latest_stable TEXT NOT NULL,
  latest_date DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

14 productos sincronizados desde endoflife.date (verificado 2026-05-07).

### `cisa_kev` (global)

```sql
CREATE TABLE cisa_kev (
  cve_id TEXT PRIMARY KEY,
  vendor_project TEXT,
  product TEXT,
  vulnerability_name TEXT,
  date_added DATE,
  short_description TEXT,
  required_action TEXT,
  due_date DATE,
  known_ransomware_use TEXT,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

1.587 CVEs sincronizados (mayo 2026).

---

## Multi-tenancy y Row Level Security

> **Modelo MVP (estado actual, 2026-05): `tenant_id = auth.uid()`.** Cada usuario de `auth.users` es su propio tenant. No hay tabla `user_profiles` ni custom JWT hook. Esto es deuda técnica consciente documentada en [D021](../decisions.md#d021-20260507-modelo-de-tenancy-mvp-tenant_id--authuid). El modelo objetivo sigue siendo JWT claim (D015), pero su implementación se difiere hasta que un piloto pida multi-usuario.

La multi-tenancy se implementa en 3 capas:

1. **Datos**: cada tabla tenant-aware tiene `tenant_id` (UUID). Foreign keys en cascada para borrado.
2. **API**: el processor recibe `tenant_id` del agente. Sin verificación criptográfica todavía (deuda técnica).
3. **BD**: Row Level Security filtra automáticamente. La política compara `tenant_id` con el `auth.uid()` del usuario logueado.

### Políticas RLS reales

```sql
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_tenant_alerts" ON client_alerts
  FOR ALL TO authenticated
  USING (tenant_id = auth.uid())
  WITH CHECK (tenant_id = auth.uid());
-- Y políticas equivalentes para devices, scans, device_inventory.
```

Las **tablas globales** (`software_versions`, `cisa_kev`) tienen RLS habilitado con política `SELECT` para el rol `public` (lectura universal, no requiere autenticación).

### Defensa contra hijacking de devices

Si alguien intenta re-registrar un `agent_id` desde otro `tenant_id`, el endpoint `POST /api/devices/register` devuelve HTTP 403 antes del upsert.

---

## Claves de acceso a Supabase

| Clave | Permisos | Quién la usa | Riesgo si filtra |
|---|---|---|---|
| `service_role_key` | Bypass total RLS | Solo el Scan Processor (backend) | Catastrófico (acceso total a TODO) |
| `anon key` | Respeta RLS | Frontend público | Bajo (solo ve lo que RLS permite) |
| `publishable key` | Para uso en navegador con RLS | Frontend (claves nuevas Supabase) | Bajo |

### ⚠️ Estado actual: Lovable usa `service_role_key`

Lovable está usando la `service_role_key` temporalmente porque el frontend solo lo usa el equipo interno. Esto es **inseguro para uso público**: en cuanto se exponga la URL de Lovable a clientes, hay que migrar a `anon key` con autenticación real.

**Bloqueante**: antes de compartir URL pública con clientes.

### TODO crítico

Rotar `service_role_key` periódicamente. La actual puede haber aparecido en chats privados durante desarrollo. No es catastrófico (chats privados), pero rotación es buena práctica.

---

## Encriptación

- **En reposo**: encriptación AES-256 en Supabase (incluida en cualquier plan).
- **Storage**: igualmente encriptado.
- **En tránsito** (procesador → Supabase): HTTPS gestionado por Supabase.

---

## Localización de datos (NIS2/GDPR)

- **Supabase**: Frankfurt (`eu-central-1`). ✅
- **Sin transferencia a EE.UU.** en datos de cliente. ✅
- **Sub-procesadores**: pendiente documentar si llega cliente con DPO exigente (DPA).

---

## Compliance pendiente

- [ ] Política de privacidad pública.
- [ ] DPA template para empresas con departamento legal.
- [ ] Auditoría de logs (quién accede a qué).
- [ ] Backup automático (Supabase Pro lo incluye, Free no — ahora mismo no hay backups).
- [ ] Rotación periódica de `service_role_key`.

---

## Schema en el repo

El schema completo vive en `scan-processor/supabase/schema.sql`. Se aplica manualmente vía Supabase Studio → SQL Editor cuando hay cambios.

---

## Decisiones técnicas relevantes

Detalle en [`../decisions.md`](../decisions.md):

- Multi-tenancy via RLS de PostgreSQL (mejor que filtrar a nivel de aplicación).
- Service role key solo en backend, nunca expuesta al frontend.
- Tablas globales (`software_versions`, `cisa_kev`) sin tenant_id porque son datos compartidos por todos los clientes.
- Unicidad de alertas por `(tenant_id, device_id, alert_type, software_name, cve_id)` para upsert idempotente.
