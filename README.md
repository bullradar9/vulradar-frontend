# VulnRadar EU — Frontend cliente

Frontend del cliente final de VulnRadar EU: panel de gestión de vulnerabilidades y cumplimiento NIS2 para PyMEs europeas. Stack: **Next.js 15 (App Router) + TypeScript + Tailwind CSS + Supabase SSR**.

> Este repo sustituye el frontend provisional de Lovable (ver [`docs/decisions.md`](./docs/decisions.md), D003 / DP004).

---

## Requisitos

- **Node.js 20.x LTS** o superior.
- npm (incluido con Node).

---

## Arrancar en local

```bash
# 1. Instalar dependencias
npm install

# 2. Crear archivo de entorno local
cp .env.example .env.local
# y completar las variables (URL del proyecto Supabase + publishable key)

# 3. Arrancar el dev server
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). Sin sesión, redirige a `/login`.

### Otros scripts

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con HMR. |
| `npm run build` | Build de producción. |
| `npm run start` | Sirve el build de producción. |
| `npm run lint` | Lint con `eslint-config-next`. |
| `npm run typecheck` | Comprobación de tipos sin emitir (`tsc --noEmit`). |

---

## Estructura

| Carpeta / archivo | Para qué sirve |
|---|---|
| `app/` | Rutas y layouts (App Router). |
| `app/(auth)/login/` | Pantalla de login pública. |
| `app/(app)/` | Layout autenticado (sidebar + topbar). Rutas dentro requieren sesión. |
| `app/(app)/dashboard/` | Dashboard del cliente (placeholder en commit 1). |
| `components/ui/` | Primitivos de UI reutilizables (vacío de momento). |
| `lib/supabase/` | Clientes Supabase para browser, server components y middleware. |
| `lib/utils.ts` | `cn()` para combinar clases Tailwind. |
| `types/database.ts` | Tipos TypeScript generados desde el schema real de Supabase. |
| `middleware.ts` | Refresca la cookie de sesión Supabase en cada request. |
| `app/globals.css` | Variables CSS de la paleta + reset Tailwind. |
| `tailwind.config.ts` | Mapeo de variables CSS a utilidades Tailwind. |

---

## Variables de entorno

Solo las que viven en `.env.local` (no commiteado). Plantilla en `.env.example`.

| Variable | Para qué |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publishable key (respeta RLS). |
| `NEXT_PUBLIC_PROCESSOR_URL` | URL del scan-processor. Sin uso en commit 1. |

---

## Documentación del proyecto

La documentación completa vive en [`docs/`](./docs/):

- [`docs/README.md`](./docs/README.md) — punto de entrada.
- [`docs/product/product.md`](./docs/product/product.md) — visión, mercado, pricing.
- [`docs/tech/architecture.md`](./docs/tech/architecture.md) — arquitectura general.
- [`docs/tech/database.md`](./docs/tech/database.md) — schema de la BD.
- [`docs/decisions.md`](./docs/decisions.md) — decisiones técnicas (ADRs).
- [`docs/roadmap.md`](./docs/roadmap.md) — estado y próximos pasos.

El backend (scan-processor + agente Go) vive en otro repo. Enlace pendiente de añadir.
