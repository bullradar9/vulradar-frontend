# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Lo primero que tienes que saber

Este repo contiene **dos cosas**:

1. **`docs/`** — fuente de verdad documental del proyecto entero (no solo del frontend).
2. **El scaffold del reemplazo del frontend Lovable**, en Next.js 15 + Supabase. Aún no desplegado.

El frontend que está hoy en producción **no vive aquí**: está construido en **Lovable** (plataforma low-code) y se conecta directamente a Supabase. Cuando este reemplazo cubra las features, se sustituye Lovable. Detalle en `docs/tech/frontends.md` y `docs/decisions.md`.

## Qué es VulnRadar EU

SaaS de gestión de vulnerabilidades + compliance NIS2 para PyMEs europeas (50–500 empleados). El cliente instala un agente Windows (Go), el agente envía un SBOM a un Scan Processor en Railway EU, y los resultados se guardan en Supabase EU. El frontend solo consume Supabase.

Resumen completo: `docs/README.md`. Arquitectura: `docs/tech/architecture.md`.

## Backend con el que se integra el frontend

- **Supabase EU (Frankfurt)** — PostgreSQL + Auth + Storage. Project ref: `aqsdyoonbvofolugtxyz` (en `.mcp.json`).
- **Multi-tenancy por RLS**: las policies filtran por `auth.jwt() ->> 'tenant_id'`. Cualquier query desde el frontend depende de que ese claim esté en el JWT del usuario.
- **Estado actual de auth (provisional, inseguro)**: el frontend en Lovable usa `service_role_key`. Bloqueante antes de exponer URL pública. El reemplazo debe usar Supabase Auth con `tenant_id` inyectado en el JWT (vía `user_profiles` + Custom Access Token Hook, o `raw_app_meta_data`).
- **Localización UE estricta**: Supabase Frankfurt, Railway Amsterdam. Cualquier dependencia o hosting nuevo tiene que ser EU-compliant (ver `docs/decisions.md`).

## Producto: principios irrenunciables

Estos vienen de `docs/decisions.md` y afectan al diseño de UI/UX:

- **3 pilares de detección** que el dashboard tiene que mostrar: **CVE**, **EOL** y **OUTDATED**. Son contractuales — eliminar o esconder uno romperia la promesa de "el dashboard nunca está vacío".
- **Skip silencioso**: cuando no hay certeza sobre una alerta, no se genera. Los falsos positivos erosionan más la confianza que los falsos negativos. Tenlo en cuenta al diseñar listados/filtros: no inventes alertas para llenar pantalla.
- **KEV (CISA Known Exploited Vulnerabilities)**: las alertas marcadas KEV llevan multiplicador ×1.5 en `priority_score`. Hay que destacarlas visualmente.
- **Distribución del agente desde el frontend**: el cliente descarga `agent.exe` + un `config.yaml` con su `tenant_id` ya rellenado. Es un flujo del frontend, no un detalle del backend.

## Reglas de trabajo con la documentación

`docs/` es la fuente de verdad declarada. Reglas tomadas de `docs/README.md`:

1. Si el código diverge de `docs/`, **se arregla la documentación en el mismo PR**, no después.
2. Cada decisión técnica relevante se añade a `docs/decisions.md` (no se reescriben las antiguas, se añaden nuevas).
3. Cada término nuevo va a `docs/glossary.md` aunque parezca obvio.
4. `docs/tech/` es factual ("lo que existe hoy"). `docs/product/` puede ser aspiracional pero etiquetado como tal.

## Acceso a Supabase desde Claude Code

`.mcp.json` registra el servidor MCP de Supabase. Está habilitado en `.claude/settings.local.json`. Tienes acceso a herramientas `mcp__supabase__*`:

- Antes de cambios de schema: `list_tables`, `list_migrations`.
- Para debugging: `get_logs`, `get_advisors`.
- `apply_migration` y `execute_sql` impactan el proyecto remoto directamente — confirma con el usuario antes de usarlos.

No existe entorno local de Supabase montado en esta carpeta. Si se monta, documentarlo aquí.

## Convenciones de comunicación

El usuario escribe y prefiere respuestas en **español**. La documentación del proyecto está en español. El **producto (UI)** soporta inglés (default) y español — ver D022.

## Stack actual del scaffold

- **Framework**: Next.js 15 (App Router, RSC) + React 19.
- **Package manager**: npm. Node ≥ 20.
- **Lenguaje**: TypeScript strict.
- **UI**: Tailwind 3.4 + tokens propios (`bg-bg`, `text-text`, severidad), `lucide-react`, IBM Plex.
- **Datos**: Supabase Auth + RLS vía `@supabase/ssr` (`lib/supabase/{client,server,middleware}.ts`). Cliente Supabase **siempre** desde estos helpers — nunca importar `@supabase/supabase-js` directo.
- **Tenancy actual**: `tenant_id = auth.uid()` en todas las RLS (D021). No hay tabla `user_profiles` ni custom JWT hook todavía.
- **i18n**: `next-intl` v4 sin routing por URL.
  - `i18n/config.ts` — `locales`, `defaultLocale = "en"`, `LOCALE_COOKIE = "NEXT_LOCALE"`, `isLocale()`. Importable desde client y server.
  - `i18n/request.ts` — `getRequestConfig` server-only. **No** importarlo desde componentes cliente.
  - `messages/{en,es}.json` — catálogos. Cualquier copy nuevo debe estar en **ambos** (D022). En server: `getTranslations()`. En client: `useTranslations()`.
  - `app/actions/locale.ts` — server action `setLocale(next)` que escribe cookie y revalida.
  - `components/LocaleSwitcher.tsx` — selector cliente.
  - Errores de server actions: traducir con `getTranslations("...errors")`, no devolver strings hardcoded.

## Comandos

| Comando | Para qué |
|---|---|
| `npm run dev` | Servidor de desarrollo Next. |
| `npm run build` | Build de producción. Falla si falta una clave de traducción tipada. |
| `npm run typecheck` | `tsc --noEmit`. |
| `npm run lint` | `next lint`. |

## Variables de entorno

`.env.local` (copiar de `.env.example`):
- `NEXT_PUBLIC_SUPABASE_URL` — URL del proyecto Supabase EU (`aqsdyoonbvofolugtxyz`).
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon key. **Nunca** `service_role` en el frontend.

## Pendiente (no implementado todavía)

- Distribución del agente: descarga de `agent.exe` y generación de `config.yaml` con `tenant_id` rellenado.
- Migración a modelo JWT claim cuando se requiera multi-usuario (plan en D021).
