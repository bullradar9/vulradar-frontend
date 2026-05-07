# Agente endpoint

> **Para qué sirve este documento.** Todo lo necesario para entender, ejecutar, modificar y distribuir el agente Go que corre en los PCs de los clientes.

---

## Resumen

Programa que se instala en el ordenador del cliente. Lee el software instalado del registro de Windows, lo limpia, lo identifica con CPE 2.3 cuando es posible, genera un SBOM CycloneDX 1.5 y lo envía al backend (Scan Processor) para análisis.

---

## Tecnología

| Aspecto | Valor |
|---|---|
| Lenguaje | Go 1.22+ |
| Despliegue | Binario único `agent.exe` |
| Distribución | Subido a Supabase Storage, descargable desde frontend |
| Tamaño aproximado | ~10 MB |
| Repo Git | Pendiente de subir (solo en local) |
| Dependencias | `golang.org/x/sys/windows/registry`, `gopkg.in/yaml.v3` |
| SO soportados | Solo Windows (stubs darwin/linux no funcionales) |

---

## Estructura del repositorio

```
agent/
├── go.mod
├── agent.exe                          # Binario compilado
├── config.yaml                        # Config local (tenant_id, processor_url, device_id)
├── agent_id.txt                       # UUID del agente, generado en primera ejecución
├── cmd/
│   └── agent/main.go                  # Entry point
└── internal/
    ├── collector/
    │   ├── collector.go               # Interfaz Collector (multi-SO)
    │   ├── windows.go                 # Implementación Windows (registro)
    │   ├── darwin.go                  # Stub macOS (no funcional)
    │   └── linux.go                   # Stub Linux (no funcional)
    ├── mappings/
    │   ├── mappings.go                # Cleanup + lookup + construcción CPE
    │   └── software-mappings.json     # Tabla curada (35 productos), //go:embed
    ├── sbom/
    │   └── sbom.go                    # Builder CycloneDX 1.5
    ├── transport/
    │   └── http.go                    # POST /api/scans + POST /api/devices/register
    ├── config/
    │   └── config.go                  # YAML loader + UUID v4 + persistencia
    └── sysinfo/
        └── windows.go                 # Hostname, OS, arquitectura, versión OS
```

---

## Flujo de ejecución

1. **Carga de config** desde `config.yaml`:
   - `processor_url`: URL del backend en Railway.
   - `tenant_id`: UUID del cliente (configurado por admin al instalar).
   - `device_id`: UUID del equipo (vacío en primera ejecución).

2. **Generación o carga de `agent_id`** desde `agent_id.txt` (UUID v4).

3. **Detección de hardware**: hostname, OS, arquitectura, versión OS.
   - **Bug Windows conocido**: `ProductName` del registro dice "Windows 10" incluso en Windows 11. Solución implementada: combinar `DisplayVersion` + `CurrentBuild`. Si `CurrentBuild >= 22000`, es Win11.

4. **Auto-registro** (solo si `device_id` está vacío):
   - `POST /api/devices/register` con `agent_id`, `tenant_id`, info hardware.
   - Recibe `device_id` del backend.
   - Guarda `device_id` en `config.yaml` (preserva comentarios YAML).
   - **Idempotente**: re-ejecutar con mismo `agent_id` no crea duplicados.
   - **Defensa multi-tenant**: HTTP 403 si `agent_id` existe con otro `tenant_id`.

5. **Lectura del registro de Windows**:
   - `HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall` (apps x64).
   - `HKLM\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall` (apps x86).
   - Extrae `DisplayName`, `DisplayVersion`, `Publisher`, `InstallLocation`.
   - Descarta hotfixes (KB######), updates, componentes ocultos (`SystemComponent=1`, `ParentKeyName != ""`).
   - Dedupe por `DisplayName@DisplayVersion`.

6. **Aplicación de cleanup patterns** sobre cada nombre detectado:
   - Quita sufijos de arquitectura: `(x64)`, `(64-bit)`, `arm64`.
   - Quita sufijos de idioma: `(en-US)`, `(es-ES)`.
   - Quita versiones embebidas en nombre.

7. **Lookup en tabla curada** (`software-mappings.json` embebido con `//go:embed`):
   - Si nombre matchea regex → genera CPE 2.3 sustituyendo `*` por versión real.
   - Si no matchea → emite componente sin CPE (irá solo a EOL/OUTDATED).
   - Filtra entradas sin versión (skip silencioso, log).

8. **Construcción del SBOM CycloneDX 1.5** con todos los componentes.

9. **Envío** `POST /api/scans` con el SBOM completo.

10. **Pausa al cierre** (UX): espera Enter antes de cerrar (cliente final hace doble-click sobre el .exe).

---

## Tabla curada de mappings

35 entradas en la versión actual. Cada entrada tiene:

```json
{
  "pattern": "^Google Chrome($| |\\(|\\b)",
  "canonical_name": "chrome",
  "vendor": "google",
  "purl_template": "pkg:generic/google/chrome@{version}",
  "cpe": "cpe:2.3:a:google:chrome:*:*:*:*:*:*:*:*"
}
```

El `*` en posición 5 del CPE es la versión, sustituida por el agente en runtime.

### Productos cubiertos

Chrome, Firefox, Edge, Office, Teams, OneDrive, Visual C++ Redistributable, .NET, Zoom, Slack, Adobe Acrobat, 7-Zip, WinRAR, VLC, Notepad++, Git, GitHub Desktop, Python, Node.js, VS Code, Visual Studio, IntelliJ, PyCharm, Docker Desktop, TeamViewer, AnyDesk, Dropbox, Spotify, OBS Studio, PuTTY, FileZilla, Wireshark, OpenSSL.

### Casos especiales

- **vcredist**: 12 entradas distintas en registro colapsan a `vcredist` con CPE null (NVD no tiene CPE para este producto).
- **GitHub Desktop**: CPE null (no existe en NVD).
- **.NET Framework vs .NET 5+**: usan CPEs distintos. Si `canonical == "dotnet"` y `version major >= 5`, usar `cpe:2.3:a:microsoft:.net`. Si no, `cpe:2.3:a:microsoft:.net_framework`.

---

## Métricas reales

Sobre un PC Windows típico de desarrollador:

| Métrica | Valor |
|---|---|
| Software detectado en registro | 84 paquetes |
| Filtrados (sin versión) | 7 (8.3%) |
| Emitidos al SBOM | 77 (91.7%) |
| Con CPE válido (matchearon tabla) | 12 (14.3%) |

---

## Distribución del agente

1. El equipo de VulnRadar genera el binario `agent.exe` localmente con `go build`.
2. Se sube a Supabase Storage en el bucket de distribución.
3. Cuando un cliente se registra, el frontend genera un `config.yaml` personalizado con su `tenant_id` y permite descargar:
   - `agent.exe` (binario común para todos).
   - `config.yaml` (personalizado por tenant).
4. El cliente coloca ambos archivos en la misma carpeta y ejecuta `agent.exe`.

---

## Limitaciones conocidas

- **Solo Windows**: stubs `darwin.go` y `linux.go` no funcionan.
- **Cobertura CPE**: 14.3% inicial. Crece con la tabla curada (objetivo: 200+ productos).
- **Sin reintentos**: si `POST /api/scans` falla, el agente sale con exit code 1.
- **Sin auth real**: solo UUIDs (`agent_id`, `tenant_id`) + defensa multi-tenant en register endpoint. Pendiente HMAC firmado.
- **Sin firma digital del .exe**: SmartScreen muestra "editor desconocido". Pendiente code signing (~$200/año). Bloqueante para clientes serios.
- **Sin tabla curada compartida**: la tabla está duplicada en `agent/` y `scan-processor/data/`. Deuda técnica.

---

## Comandos útiles

```bash
# Compilar
cd agent
go build -o agent.exe ./cmd/agent

# Ejecutar
./agent.exe

# Compilación cross-platform desde Linux/macOS hacia Windows
GOOS=windows GOARCH=amd64 go build -o agent.exe ./cmd/agent
```

---

## Decisiones técnicas relevantes

Detalle en [`../decisions.md`](../decisions.md):

- Tabla curada como `//go:embed` (compilada en el binario, no descargada).
- Auto-registro idempotente con UUID v4.
- CPE 2.3 en lugar de `pkg:generic` (validación empírica del 2025-05-03).
- Sin reintentos en MVP (suficiente para arrancar).
