# Decisiones (ADRs)

> **Para qué sirve este documento.** Registro cronológico de las decisiones importantes del proyecto, con su razón. Útil para no volver a debatir lo mismo y para que cualquier persona nueva entienda *por qué* algo es como es.
>
> **Cómo se mantiene**: solo se añade, no se reescribe. Si una decisión cambia, se añade una nueva entrada con la fecha y la razón del cambio, dejando la anterior como contexto histórico.

---

## Formato de cada decisión

> **[ID-AAAAMMDD] Título corto**
> *Estado*: vigente / superada / en revisión
> *Contexto*: qué situación llevó a la decisión
> *Decisión*: qué se decidió
> *Razones*: por qué
> *Consecuencias*: qué implica (positivas y negativas)
> *Cuándo reconsiderar*: en qué condiciones revisar esta decisión

---

## Decisiones de producto y negocio

### [D001-20260101] Foco geográfico inicial: España

*Estado*: vigente
*Contexto*: tentación de abrir varios mercados europeos a la vez (briefing original mencionaba estrategia dual DE/FR + ES/IT/Benelux).
*Decisión*: enfocar el primer año en España. Otros países solo después de validar product-market fit en uno.
*Razones*:
1. Idioma nativo del equipo.
2. Contexto cultural y regulatorio que conocemos.
3. Menor coste de adquisición y soporte.
4. Equipo bootstrapped a tiempo parcial — abrir varios países a la vez es inviable.
*Cuándo reconsiderar*: cuando tengamos 50+ clientes pagando en España con churn estable.

### [D002-20260101] Cliente objetivo principal: PyME, no mid-market financiero

*Estado*: vigente
*Contexto*: el briefing original proponía dos pistas paralelas (mid-market financiero DE/FR a 999-2999€/mes + PyMEs a 49-299€/mes). Con equipo de 2 personas a tiempo parcial, sostener dos GTM distintos es inviable.
*Decisión*: foco exclusivo en PyME (49-299€/mes) hasta tener tracción.
*Razones*:
1. La PyME es el hueco de mercado real (las grandes ya tienen Tenable/Qualys).
2. Mid-market financiero requiere ISO 27001, presencia en eventos sectoriales, referencias del sector y ciclos de venta de 2-4 meses. Inviable sin recursos.
3. PyME permite product-led growth y self-service.
*Cuándo reconsiderar*: si en los pilotos descubrimos que los MSPs revenden mejor el producto a mid-market que vender directo a PyME.

### [D003-20260101] Frontends construidos con Lovable (provisional)

*Estado*: vigente con cautela
*Contexto*: los frontends (cliente y admin) se construyeron usando Lovable.
*Decisión*: mantener Lovable mientras estemos en fase de validación y los primeros pilotos. Migrar a Next.js cuando aparezca disparador.
*Razones*:
1. Velocidad de iteración alta.
2. Coste cero hasta volumen significativo.
3. Suficiente para los primeros 5-10 clientes.
*Consecuencias*: deuda técnica acumulada. El código generado no siempre es óptimo para producción a largo plazo. Auth provisional con `service_role_key` (inseguro para público).
*Cuándo reconsiderar*: cuando tengamos 10+ clientes pagando, o cuando aparezca limitación bloqueante.

### [D004-20260101] Filosofía "skip silencioso"

*Estado*: vigente
*Contexto*: cuando el sistema no puede decidir con seguridad si algo es vulnerable, hay dos opciones: generar alerta dudosa o no generar alerta.
*Decisión*: cuando no podamos decidir con seguridad, **NO generar alerta**.
*Razones*:
1. Para un producto de compliance vendido a PyMEs, los falsos positivos erosionan la confianza más rápido que los falsos negativos hieren la reputación.
2. Si un cliente recibe alertas inventadas o erróneas, deja de confiar en TODAS las alertas.
3. Si recibe menos alertas pero todas correctas, acaba ampliando el uso.
*Aplica en*: versión que no se puede parsear, software no en tabla curada, API externa que falla, match dudoso.
*Consecuencias aceptadas*: 25-40% de falsos negativos iniciales (mejorables con la tabla curada creciendo).
*Objetivo*: <5% falsos positivos.

### [D005-20260101] Sin LLMs en runtime

*Estado*: vigente
*Contexto*: tentación de usar LLMs para auto-categorizar software no reconocido o explicar CVEs en lenguaje natural.
*Decisión*: NO usar LLMs en runtime del producto.
*Razones*:
1. Lentos (1-5s por inferencia).
2. Caros (acumula con cada scan).
3. No deterministas.
4. Alucinan (riesgo grave en compliance).
*Sí aceptable*: uso offline para acelerar la creación de la tabla curada o sugerir mappings de software no visto. Decisión final humana.

### [D006-20260101] Localización europea de datos

*Estado*: vigente
*Contexto*: NIS2 y GDPR exigen procesamiento en UE para datos de clientes europeos.
*Decisión*: toda la infraestructura en regiones EU (Frankfurt o Amsterdam principalmente).
*Razones*:
1. Cumplimiento regulatorio.
2. Argumento de marketing claro: "100% datos en UE".
3. Latencia mejor para clientes europeos.
*Cuándo reconsiderar*: nunca, mientras el target sea Europa.

### [D007-20260101] Documentación como única fuente de verdad

*Estado*: vigente
*Contexto*: el Project de Claude llegó a contener documentos que describían un sistema distinto al real, generando confusión.
*Decisión*:
1. La carpeta `docs/` del repo Git es la **única fuente de verdad**.
2. El Project de Claude es un **espejo selectivo** que se actualiza desde el repo, nunca al revés.
3. Cuando se detecte una divergencia entre documentación y realidad, **se arregla la documentación**, no se vive con ella.
*Consecuencias*: cada cambio importante en código requiere actualizar la doc correspondiente en el mismo PR.

---

## Decisiones técnicas

### [D008] Grype como motor de matching CVE

*Estado*: vigente
*Contexto*: hay que elegir motor para detectar CVEs a partir del software del cliente.
*Alternativas consideradas*: motor propio, Vulners.com (comercial), OSV.dev, Wazuh (plataforma completa).
*Decisión*: Grype + tabla curada propia.
*Razones*:
1. Coste cero (Apache 2.0).
2. 150.000+ CVEs ya con matching resuelto, ahorrando 6-12 meses de desarrollo.
3. Mantenido por Anchore.
4. Acepta CycloneDX nativo.
5. Funciona offline tras `db update`.
6. La cobertura mediocre en Windows comercial (50-65%) la compensamos con la tabla curada.
*Cuándo reconsiderar*: si tenemos 20+ clientes y muchas quejas de cobertura, evaluar Vulners.com como motor complementario.

### [D009] CPE 2.3 en lugar de pkg:generic

*Estado*: vigente
*Contexto*: necesidad de identificar software comercial Windows en SBOMs para que Grype lo matchee con CVEs.
*Validado empíricamente*: 2025-05-03.
*Resultados*:
- `pkg:generic/google/chrome@120.0` → 0 matches.
- `pkg:npm/lodash@4.17.4` → 10 matches.
- CPE 2.3 directo → 781 matches en SBOM de prueba.
*Decisión*: el agente emite CPE 2.3 en cada componente cuando esté en la tabla curada. Los purls genéricos no sirven.

### [D010] 3 pilares de detección (CVE + EOL + OUTDATED)

*Estado*: vigente y crítico
*Contexto*: hallazgo del análisis de mercado: CVEs recientes son raros en software de PyME. Si solo se mostraran CVEs, el dashboard estaría vacío durante meses, y un dashboard vacío es invendible.
*Decisión*: sostener la propuesta de valor sobre 3 pilares:
- **CVE** (Grype + KEV): cubre el riesgo agudo y crítico.
- **EOL** (endoflife.date): cubre la deuda técnica acumulada.
- **OUTDATED** (tabla `software_versions`): cubre la higiene básica.
*Razones*: garantizan que **siempre haya hallazgos accionables**, lo cual hace al producto vendible.
**No eliminar pilares** aunque parezcan redundantes. Es la diferencia entre "producto vendible" y "demo vacía".

### [D011] Pipeline síncrono en MVP, sin colas

*Estado*: vigente
*Alternativa*: BullMQ + Redis + workers separados desde el día 1.
*Decisión*: pipeline síncrono dentro del request HTTP.
*Razones*:
1. MVP necesita simplicidad de despliegue.
2. Un scan tarda 5-30 segundos, aceptable.
3. Las colas añaden complejidad operacional.
4. Si un cliente se queja de timeout, ahí evaluamos.
*Cuándo reconsiderar*: cuando un cliente se queje O cuando los scans superen 60s habitualmente O al pasar de 50 clientes simultáneos.

### [D012] Tabla curada como `//go:embed` dentro del agente

*Estado*: vigente
*Alternativas*: tabla servida desde el processor (descargada periódicamente), tabla en archivo separado distribuido con el agente.
*Decisión*: embebida en el binario con `//go:embed`.
*Razones*:
1. Un solo archivo a distribuir = más simple para el cliente.
2. No depende de conectividad para arrancar.
3. Versión de tabla = versión de binario, sin sincronización rara.
4. Cambios requieren recompilación, lo que fuerza testing.
*Trade-off aceptado*: tabla duplicada físicamente entre `agent/` y `scan-processor/data/`. Deuda temporal hasta consolidar.

### [D013] Auto-registro de devices con UUID v4

*Estado*: vigente
*Alternativas*: Device ID configurado manualmente, Device ID derivado de hardware (MAC, serial).
*Decisión*: auto-registro en primera ejecución, idempotente.
*Razones*:
1. Cliente solo configura `tenant_id`. Cero fricción.
2. Idempotencia: si `agent_id` ya existe en BD, devuelve `device_id` existente.
3. Defensa multi-tenant: si alguien intenta re-registrar `agent_id` desde otro tenant → HTTP 403.
*No usamos hardware ID*: cambia cuando el cliente reinstala Windows o cambia de portátil.

### [D014] Stack TypeScript en el processor, Go en el agente

*Estado*: vigente
*Decisión*: agente en Go, processor en Node.js + TypeScript.
*Razones*:
1. Para el agente: Go es ideal — binario único, cross-compile, sin runtime.
2. Para el processor: Node + TypeScript ofrece ecosistema más amplio (Stripe, generación de PDFs, integraciones futuras).
*Decisión derivada*: para generar PDFs, **NO usar React PDF**. Usar HTML+CSS renderizado con Gotenberg o Puppeteer/Chromium (mucho más mantenible).

### [D015] Service role key solo en backend, RLS en frontend (objetivo)

*Estado*: vigente como dirección, no como estado actual
*Contexto*: separación de responsabilidades de claves Supabase.
*Decisión*:
- **Processor**: usa `service_role_key` y bypassa RLS. Escribe como sistema.
- **Frontend** (objetivo): usará `anon_key` + JWT con `tenant_id` claim. Las RLS policies filtran automáticamente.
*Estado actual*: Lovable está usando temporalmente `service_role_key`. Inseguro para uso público. Bloqueante antes de URL pública compartida.
*Nota 2026-05-07*: el modelo "JWT con `tenant_id` claim" está diferido — el MVP usa `tenant_id = auth.uid()` como simplificación. Ver [D021](#d021-20260507-modelo-de-tenancy-mvp-tenant_id--authuid) para contexto y plan de migración.

### [D016] Dedupe in-memory antes de upsert de alertas

*Estado*: vigente
*Contexto*: Grype a veces emite el mismo CVE varias veces (distintas ramas de matchers CPE). PostgreSQL rechaza un `ON CONFLICT` con dos filas que apunten al mismo conflict-target.
*Decisión*: dedupe en memoria por `(tenant, device, alert_type, software_name, cve_id)` conservando el `priority_score` máximo. Luego upsert.
*Lugar*: `src/services/persistence.ts` en `upsertAlerts`.

### [D017] Defensa multi-tenant contra hijacking de devices

*Estado*: vigente
*Caso*: el mismo `agent_id` intenta auto-registrarse desde otro `tenant_id`.
*Decisión*: HTTP 403 `tenant_mismatch`.
*Razón*: evita que un cliente "secuestre" un device de otro si averigua el `agent_id` ajeno.
*Lugar*: `POST /api/devices/register`, antes del upsert.

### [D018] Bug Windows: OSVersion combina DisplayVersion + CurrentBuild

*Estado*: vigente
*Bug*: `ProductName` en el registro Windows dice "Windows 10" incluso en Windows 11.
*Decisión*: combinar `DisplayVersion` (ej: `25H2`) + `CurrentBuild` (ej: `26200`). Si `CurrentBuild >= 22000`, es Win11.
*Lugar*: `agent/internal/sysinfo/`.

### [D019] .NET 5+ usa CPE distinto a .NET Framework

*Estado*: vigente
*Contexto*: NVD usa CPEs distintos:
- `cpe:2.3:a:microsoft:.net_framework:*` para .NET Framework (1-4.x).
- `cpe:2.3:a:microsoft:.net:*` para .NET 5+ (Core/moderno).
*Decisión*: en la construcción del CPE, si `canonical == "dotnet"` y `version major >= 5`, usar `.net`. Si no, `.net_framework`.
*Lugar*: `agent/internal/mappings/mappings.go`.

### [D020] Mono-servicio: Grype y processor en mismo container

*Estado*: vigente
*Decisión*: Grype binario y processor Node viven en el mismo container Docker.
*Razones*:
1. Simplifica deploy en Railway.
2. Evita comunicación entre containers (latencia, complejidad de red).
3. La BD de Grype (~100 MB) está en el mismo filesystem que la app.
*Trade-off aceptado*: actualizar la BD de Grype requiere rebuild del container.

### [D021-20260507] Modelo de tenancy MVP: tenant_id = auth.uid()

*Estado*: vigente como deuda conocida. Supera operativamente la dirección descrita en D015 mientras no haya cliente que requiera multi-usuario.
*Contexto*: D015 y `tech/database.md` describían un modelo de tenancy basado en JWT claim (`auth.jwt() ->> 'tenant_id'`) con tabla intermedia user→tenant. La implementación real (verificada 2026-05-07 sobre el proyecto Supabase `aqsdyoonbvofolugtxyz` con MCP) usa `tenant_id = auth.uid()` directamente en todas las RLS policies. No existe tabla `user_profiles` ni custom JWT hook. Cada usuario es su propio tenant.
*Decisión*: aceptar el modelo "1 user = 1 tenant" como estado del MVP. Documentar la divergencia, no enmascararla. Construir el frontend contra el modelo real.
*Razones*:
1. Fase 0 sin clientes pagando — implementar el modelo multi-usuario antes de validar producto es over-engineering.
2. Equipo de 2 personas a tiempo parcial — el custom JWT hook + tabla `user_profiles` + reescritura de RLS + migración de datos cuesta 2-4 días que no construyen valor para el primer cliente.
3. La RLS actual sigue siendo segura: cada usuario solo ve sus datos. El único límite es que no se puede compartir un tenant entre varios usuarios.
4. Coherente con el patrón cultural ya establecido (D003 Lovable provisional, D004 skip silencioso, D011 sin colas): aceptar simplificación consciente y documentada en lugar de la solución perfecta antes de tiempo.
*Consecuencias*:
- Imposible dar acceso de un asesor externo a los datos de una PyME sin compartir credenciales (inaceptable a largo plazo).
- Si un cliente pide multi-usuario, hay migración bajo presión.
- La doc (`tech/database.md`, D015) debe corregirse para reflejar la realidad con un puntero explícito a este ADR (incluido en el mismo PR que crea D021).
*Plan de migración a modelo JWT claim* (cuando se dispare):
1. Crear tabla `user_profiles (user_id PK → auth.users, tenant_id, role)`.
2. Backfill: por cada `auth.users`, insertar fila con `tenant_id = user_id` (preserva los datos existentes sin tocar las filas de las tablas de negocio).
3. Implementar `custom_access_token_hook` PL/pgSQL que añade `tenant_id` al JWT desde `user_profiles`.
4. Registrar el hook en Supabase Dashboard → Auth → Hooks.
5. Reescribir 4 policies: `tenant_id = (auth.jwt() ->> 'tenant_id')::uuid`.
6. UI de "Settings → Miembros" (invitar email a un tenant existente).
*Cuándo reconsiderar*: primer piloto que pida multi-usuario, O antes de abrir registro público (porque el modelo "1 user = 1 tenant" hace muy difícil añadir multi-usuario sin migración disruptiva una vez hay clientes de pago).

### [D022-20260507] Multi-idioma del producto: EN default + ES desde día 1

*Estado*: vigente. Supera **DP003**.
*Contexto*: DP003 dejaba abierto si arrancar el producto solo en español o ya con inglés. Al scaffoldear el reemplazo del frontend Lovable (Next.js 15) se integró i18n en la primera versión.
*Decisión*: el frontend nuevo soporta `en` y `es`. **Default = `en`** (cookie `NEXT_LOCALE`). Selector visible en la pantalla de login y en el header de la app. La documentación interna (`docs/`) y el copy del agente siguen en español.
*Razones*:
1. NIS2 es regulación europea — el mercado natural va más allá de España.
2. Coste marginal de i18n al scaffoldear es bajo (`next-intl` + dos catálogos JSON); retrofitear más adelante con copy ya escrito en ES sería más costoso.
3. EN como default no perjudica al cliente español: el switcher persiste en cookie y el copy ES es first-class, no traducción mecánica.
4. Permite enseñar la URL a prospects no españoles (PT, IT, DE) sin re-trabajo.
*Consecuencias*:
- Cada copy nuevo debe añadirse a `messages/en.json` y `messages/es.json`. Falta de paridad la detecta TypeScript (`next-intl` la tipa) — no se acepta merge sin las dos claves.
- Errores de server actions se traducen vía `getTranslations()` server-side.
- Mientras Lovable siga vivo, ese frontend queda solo en español — no se sincroniza con los catálogos.
*Cuándo reconsiderar*: si el primer piloto serio exige un tercer idioma (p.ej. PT), basta con añadirlo al array `locales` y crear `messages/pt.json`.

---

## Decisiones pendientes de tomar

> Cuando se decidan, se mueven a la sección de "vigentes" con su ID definitivo.

### [DP001] Pricing definitivo

*Pregunta abierta*: ¿49€/99€/299€/Enterprise se confirma o se ajusta?
*Bloqueante*: necesita validación con los primeros 5 prospects. No casarse con esta estructura antes de tener feedback.

### [DP002] Posicionamiento del agente: opcional u obligatorio

*Pregunta abierta*: ¿el agente es una pieza opcional que enriquece la plataforma, o es obligatorio para que el producto funcione?
*Trade-offs*:
- Opcional: onboarding más fácil, menor barrera de entrada, menos precisión.
- Obligatorio: producto más fiel a Qualys, mayor barrera de entrada, mejor precisión.

### [DP004] Cuándo migrar el frontend de Lovable

*Pregunta abierta*: ¿qué disparador concreto activa la migración a Next.js?
*Candidatos*:
- 10+ clientes pagando.
- Limitación bloqueante (rendimiento, seguridad, due diligence técnica).
- Cliente importante exige URL en dominio propio con auth profesional.

### [DP005] Code signing del agent.exe

*Pregunta abierta*: ¿asumimos los ~$200/año de code signing antes del primer cliente o esperamos?
*Recomendación*: **antes del primer cliente serio**. SmartScreen mostrando "editor desconocido" es un blocker grave de UX en empresas.
