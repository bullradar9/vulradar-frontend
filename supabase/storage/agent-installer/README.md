# supabase/storage/agent-installer

Espejo versionado del bucket privado `agent-installer` en Supabase Storage.

Estos archivos se distribuyen al cliente final dentro del ZIP que genera el Route Handler `app/api/download-agent/route.ts`. El handler descarga estos archivos de Storage en cada petición — no del repo. Este directorio es la **fuente de verdad para futuras ediciones**, no la copia operativa.

## Archivos

| Archivo | Para qué |
|---|---|
| `INSTALLATION.md` | Guía de instalación en inglés (locale `en`). |
| `INSTALACION.md` | Guía de instalación en español (locale `es`). |

> El binario `agent.exe` también vive en el bucket pero **no** se versiona aquí — pesa ~10 MB y se compila desde el repo del agente. Cuando salga una versión nueva, se sube a Storage directamente.

## Cómo aplicar cambios

Mientras no haya CI que sincronice el bucket automáticamente, el flujo es manual:

1. Editar el archivo en este directorio.
2. Commitear el cambio (queda en `git log`).
3. Subir el archivo modificado a Supabase Storage **sustituyendo** la versión anterior:
   - Supabase Studio → Storage → `agent-installer` → click sobre el archivo → **Replace** (o borrar + subir).
4. Probar el flujo de descarga end-to-end (login → botón → ZIP) para confirmar que el archivo nuevo llega al cliente.

> ⚠️ **Mantener paridad ES/EN.** D022 compromete bilingüismo desde día 1. Si editas una de las dos guías, la otra debe reflejar el mismo cambio en el mismo PR. Las secciones, su orden y su contenido equivalente deben coincidir.

## Acceso

Bucket privado. Política RLS `authenticated_can_download_agent_installer` en `storage.objects` permite SELECT a cualquier usuario autenticado. No hay política para INSERT/UPDATE/DELETE — esos requieren `service_role` (Supabase Studio).
