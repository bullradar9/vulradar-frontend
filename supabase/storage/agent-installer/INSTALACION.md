# Agente VulnRadar — Guía de instalación

Esta guía explica cómo instalar el agente VulnRadar en un equipo Windows. El agente lee la lista de software instalado en el sistema, la envía a VulnRadar para análisis, y el equipo aparece en tu panel con las vulnerabilidades detectadas.

La instalación inicial dura unos 10 minutos y requiere permisos de administrador. Una vez instalado, el agente se ejecuta como usuario normal y cada escaneo se completa en menos de 2 minutos.

---

## Lo que necesitas

- Un equipo con Windows 10 o Windows 11 (x64 o arm64).
- El archivo `vulnradar-agent.zip` descargado desde tu cuenta de VulnRadar.
- Acceso saliente por HTTPS (puerto 443). El agente solo se comunica con nuestro procesador en la UE.
- **Permisos de administrador** para la copia inicial y para conceder permisos de escritura. Después del setup, el agente se ejecuta sin admin.

---

## Contenido del ZIP

Al descomprimir `vulnradar-agent.zip` verás tres archivos:

| Archivo | Función |
|---|---|
| `agent.exe` | El escáner. ~10 MB. |
| `config.yaml` | La configuración de tu cuenta. **No lo edites.** |
| `INSTALACION.md` | Este documento. |

El `config.yaml` está personalizado para tu cuenta. Si alguien ajeno se hace con él, podría instalar el agente en su máquina y aparecería como un equipo en tu panel. **No** puede leer tus datos — pero sí puede ensuciar tu inventario. Trátalo como información privada.

---

## Pasos de instalación

### 1. Copia los archivos a ProgramData (requiere admin)

Coloca el agente en la ubicación estándar de Windows para datos de aplicación compartidos:

```
C:\ProgramData\VulnRadar\
```

`ProgramData` está oculto por defecto en el Explorador de archivos. Para verlo: **Vista → Mostrar elementos ocultos**. También puedes pegar la ruta directamente en la barra de direcciones.

Dos formas de copiar:

**Opción A — Explorador de archivos:**

1. Crea la carpeta `C:\ProgramData\VulnRadar\` (te aparecerá un aviso UAC).
2. Copia `agent.exe`, `config.yaml` e `INSTALACION.md` dentro (UAC otra vez).

**Opción B — PowerShell como administrador (recomendada):**

Abre PowerShell como administrador (tecla Windows → escribe "powershell" → click derecho → **Ejecutar como administrador**), y ejecuta:

```powershell
$src = "<ruta-de-la-carpeta-descomprimida>\*"
$dst = "C:\ProgramData\VulnRadar"
New-Item -ItemType Directory -Force -Path $dst | Out-Null
Copy-Item -Path $src -Destination $dst -Recurse -Force
```

Reemplaza `<ruta-de-la-carpeta-descomprimida>` con la ubicación donde descomprimiste el archivo.

### 2. Concede permisos de escritura a los usuarios (requiere admin)

El agente escribe su archivo de identidad (`agent_id.txt`) y actualiza `config.yaml` en cada escaneo. Por defecto, las subcarpetas de `ProgramData` solo permiten escritura a administradores. Concede permiso de Modificación a todos los usuarios para que el agente pueda ejecutarse sin admin a partir de ahora.

En la misma PowerShell de administrador:

```powershell
icacls "C:\ProgramData\VulnRadar" /grant Users:(OI)(CI)M /T
```

Deberías ver `Se procesaron correctamente N archivos`. Esto es un paso único.

### 3. Ejecuta el agente

Ahora cualquier usuario de la máquina puede ejecutarlo. Abre `C:\ProgramData\VulnRadar\` y haz doble clic en `agent.exe`. Se abrirá una ventana de consola.

### 4. Aviso de SmartScreen de Windows

La primera vez que ejecutes el agente, Windows mostrará probablemente una pantalla azul que dice "Windows protegió tu PC". Esto ocurre porque el binario aún no está firmado digitalmente (estamos en ello).

Para continuar:

1. Pulsa **Más información**.
2. Pulsa **Ejecutar de todas formas**.

Windows recuerda tu decisión y no volverá a preguntar en ejecuciones posteriores.

### 5. Espera al primer escaneo

El agente:

1. Detecta tu hardware (nombre del equipo, OS, arquitectura).
2. Se registra con VulnRadar (crea una entrada de equipo en tu cuenta).
3. Lee la lista de software instalado desde el registro de Windows.
4. Envía todo al procesador.
5. Muestra un resumen y espera a que pulses Enter para cerrarse.

Tiempo total: típicamente menos de 2 minutos en un PC normal.

### 6. Verifica que funcionó

Abre tu panel de VulnRadar. El equipo debería aparecer en **Equipos** con el nombre de esta máquina. Las alertas (si se detectó alguna) aparecen en cuanto se completa el escaneo.

Si el equipo no aparece, consulta **Resolución de problemas** más abajo.

---

## Escaneos programados — semanales

Para protección continua, programa el agente para que se ejecute semanalmente. NIS2 no exige escaneos diarios, y la frecuencia semanal cubre la deriva típica del inventario de software en una PyME; puedes ajustarla más tarde si lo necesitas.

1. Abre el **Programador de tareas** (tecla Windows → escribe "programador de tareas").
2. **Crear tarea básica**.
3. Nombre: `VulnRadar Escaneo Semanal`.
4. Desencadenador: **Semanalmente**. Elige un día y hora en que la máquina esté encendida pero sin uso intensivo.
5. Acción: **Iniciar un programa**.
6. Programa: `C:\ProgramData\VulnRadar\agent.exe`.
7. (Opcional) En la pestaña **Configuración** de la tarea, activa **Ejecutar la tarea lo antes posible si se pierde un inicio programado** para que el escaneo se ejecute igualmente si el PC estaba apagado.

El agente puede ejecutarse de forma repetida sin riesgo. Cada ejecución refresca el inventario y actualiza alertas.

---

## Resolución de problemas

### El equipo no aparece en mi panel

- Comprueba que el agente terminó sin errores. Lee la salida de consola antes de pulsar Enter.
- Verifica que el HTTPS saliente funciona: abre `https://www.google.com` desde la misma máquina.
- Confirma que `agent.exe`, `config.yaml` y el `agent_id.txt` recién creado están todos en `C:\ProgramData\VulnRadar\`.
- Si el problema persiste, contáctanos en `bullradar9@gmail.com` con la salida de consola.

### El agente dice "Permission denied" o no puede escribir `agent_id.txt`

Probablemente saltaste el paso 2 (el comando `icacls`). Vuelve a ejecutarlo desde una PowerShell de administrador.

### SmartScreen bloquea el agente cada vez

Windows debería recordar tu decisión. Si sigue bloqueándolo:

1. Click derecho en `agent.exe` → **Propiedades**.
2. Al final de la pestaña **General**, marca **Desbloquear**.
3. Pulsa **Aceptar**.

### El agente dice "tenant mismatch" o HTTP 403

Significa que el `agent_id.txt` de la carpeta se generó para una cuenta distinta de VulnRadar. Suele ocurrir cuando la carpeta se copió desde otra máquina o desde la instalación de otro cliente.

Solución: borra `C:\ProgramData\VulnRadar\agent_id.txt`. El agente generará uno nuevo en la próxima ejecución.

### La ventana de consola se cierra inmediatamente

El agente espera a que pulses Enter antes de cerrarse, así que un cierre rápido significa que hubo un error al arrancar. Abre un Símbolo del sistema, navega a `C:\ProgramData\VulnRadar\` y ejecuta `agent.exe` desde ahí para ver el mensaje de error.

---

## Archivos que crea el agente

Tras la primera ejecución verás dos archivos nuevos en `C:\ProgramData\VulnRadar\`:

| Archivo | Función |
|---|---|
| `agent_id.txt` | ID único de esta máquina. Consérvalo. |
| `config.yaml` | Ahora también contiene `device_id`, rellenado por el procesador. |

Para "resetear" este equipo y volverlo a registrar desde cero, borra ambos archivos. La siguiente ejecución registrará un equipo nuevo en tu cuenta; el anterior permanecerá en tu panel hasta que lo elimines manualmente.

---

## Actualización del agente

Cuando se publique una nueva versión de `agent.exe`, recibirás un aviso y una descarga nueva desde VulnRadar. Para actualizar:

1. Descarga el nuevo `vulnradar-agent.zip`.
2. Copia **solo** el nuevo `agent.exe` en `C:\ProgramData\VulnRadar\`, sustituyendo al anterior. Conserva tu `config.yaml` y `agent_id.txt` existentes.
3. Ejecuta el nuevo `agent.exe` para verificar.

La actualización **no** requiere admin: el paso 2 de la instalación inicial (`icacls`) concedió permisos de Modificación a todos los usuarios sobre la carpeta y sus archivos, así que cualquier usuario puede sobrescribir `agent.exe`.

Sustituir los archivos de configuración haría que el agente se registre como un equipo nuevo, dejando el anterior huérfano en tu panel.

---

## Desinstalación

El agente no se instala en sentido tradicional — es un ejecutable autónomo. Para eliminarlo:

1. Como administrador, borra `C:\ProgramData\VulnRadar\` y todo su contenido.
2. Elimina la tarea programada del Programador de tareas si la creaste.
3. (Opcional) Borra el equipo de tu panel de VulnRadar si no quieres que permanezca en el historial de inventario.

---

## Privacidad

El agente recopila:

- La lista de software instalado desde el registro de Windows: nombre, versión, fabricante.
- Información básica de hardware: nombre del equipo, versión del OS, arquitectura.

**No** recopila:

- Archivos personales, documentos, historial de navegación ni procesos en ejecución.
- Tráfico de red.
- Credenciales de usuario.

Todos los datos se procesan en la UE: la base de datos en Frankfurt y el procesador en Ámsterdam.

---

## Soporte

Preguntas o incidencias: `bullradar9@gmail.com`.
