# Frontends

> **Para qué sirve este documento.** Documenta el estado actual de los frontends sin invertir tiempo en describir lo que se va a tirar. Los frontends actuales son **provisionales**.

---

## Resumen

Dos frontends construidos en Lovable (plataforma low-code generada con IA):

- **Dashboard cliente**: visualización para el cliente final (alertas, equipos, descarga de informes).
- **Dashboard admin**: gestión interna de tenants y supervisión.

Ambos están **conectados directamente a Supabase** vía Supabase JS client.

---

## Tecnología

| Aspecto | Valor |
|---|---|
| Plataforma | Lovable |
| Tipo | Low-code generado con IA |
| Conexión a BD | Directa a Supabase (Supabase JS client) |
| Auth actual | `service_role_key` (provisional, inseguro para público) |
| Auth objetivo | Supabase Auth + JWT con `tenant_id` claim |

---

## Estado actual

- MVP construido para validación con clientes y uso interno.
- Conectado a Supabase real (no mock).
- Distribución del agente integrada: descarga de `agent.exe` + `config.yaml` personalizado por tenant.
- El cliente recibe el `tenant_id` rellenado en el `config.yaml` desde el frontend.

---

## Limitaciones

- **No es producto definitivo.** Lovable se mantiene mientras estemos en validación.
- **Auth provisional**: usa `service_role_key`, lo cual **es inseguro para uso público**. Bloqueante antes de compartir URL pública con clientes.
- **No es escalable a largo plazo**: cuando haya 5-10 clientes pagando, considerar reescribir.

---

## Roadmap del frontend

Cuando llegue el momento de migrar fuera de Lovable, stack probable:

- **Framework**: Next.js (a confirmar cuando llegue el momento).
- **Auth**: Supabase Auth con `tenant_id` en JWT claims.
- **Hosting**: Vercel EU u otro proveedor EU compliant.

**Disparador del cambio**: cualquiera de los siguientes.
- 10+ clientes pagando.
- Limitación bloqueante (rendimiento, seguridad, due diligence técnica de un cliente).
- Cliente importante exige una URL en dominio propio con auth profesional.

### Estado del reemplazo (2026-05-07)

El reemplazo de Lovable está **scaffoldeado** en este repo (`frontend/`), aún sin desplegar:

- **Next.js 15** + React 19, App Router, Server Components.
- **Auth**: Supabase Auth con cliente SSR (`@supabase/ssr`). Modelo de tenancy = `tenant_id = auth.uid()` (ver [D021](../decisions.md#d021-20260507-modelo-de-tenancy-mvp-tenant_id--authuid)).
- **i18n**: `next-intl` con `en` (default) y `es`, persistencia en cookie `NEXT_LOCALE`. Selector en login y header. Ver [D022](../decisions.md#d022-20260507-multi-idioma-del-producto-en-default--es-desde-día-1).
- **UI**: Tailwind + tokens propios (`bg-bg`, `text-text`, severidad), iconografía `lucide-react`, fuentes IBM Plex.

Lovable y este scaffold conviven hasta que el reemplazo cubra todas las features. Lovable sigue siendo el frontend en uso para clientes.

---

## Filosofía

No documentar mucho aquí. Hasta que Lovable se sustituya, este archivo se mantiene corto a propósito: invertir tiempo en documentar código provisional que se va a tirar es desperdicio.

Cuando se migre el frontend, este archivo se reemplaza con un `frontends.md` real.

---

## Decisiones relevantes

Detalle en [`../decisions.md`](../decisions.md):

- Frontends en Lovable durante fase de validación.
- Migración al stack definitivo cuando aparezca disparador.
