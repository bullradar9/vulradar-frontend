# Glosario

> **Para qué sirve este documento.** Diccionario rápido de los términos del proyecto. Cuando leas algo y no recuerdes qué es, búscalo aquí. Si te encuentras un término nuevo que no está, añádelo.

---

## Vulnerabilidades y CVEs

**CVE** (*Common Vulnerabilities and Exposures*)
Código único asignado a cada vulnerabilidad de seguridad descubierta. Formato: `CVE-2023-38831`. Hay más de 250.000. Es el lenguaje universal de la ciberseguridad.

**CVSS** (*Common Vulnerability Scoring System*)
Puntuación de gravedad de un CVE, de 0 a 10. 9.0+ es crítico, 7.0-8.9 es alto, 4.0-6.9 es medio. Calculado por el NIST según factores como impacto y facilidad de explotación.

**EPSS** (*Exploit Prediction Scoring System*)
Probabilidad (0-100%) de que un CVE sea explotado en los próximos 30 días, calculada por modelos estadísticos. Complementa al CVSS.

**KEV** (*Known Exploited Vulnerabilities*)
Catálogo de la CISA (gobierno EE.UU.) con CVEs que **se sabe** están siendo explotados activamente por delincuentes en ataques reales. ~1.500 entradas. Es la lista negra urgente.

**EOL** (*End of Life*)
Fecha en que el creador de un producto deja de dar soporte de seguridad. Después de esa fecha, los nuevos fallos no se arreglan. Ejemplo: Windows 7 está EOL desde 2020.

**Zero-day**
Vulnerabilidad recién descubierta para la que aún no existe parche. El nombre viene de "el vendedor tiene 0 días para arreglarlo antes de que se haga pública".

---

## Identificación de software

**CPE** (*Common Platform Enumeration*)
Formato estándar para identificar software de forma única. Ejemplo: `cpe:2.3:a:google:chrome:120.0:*:*:*:*:*:*:*`. Lo usa el NIST. Es el formato necesario para hacer matching contra software comercial Windows.

**purl** (*Package URL*)
Otro formato de identificación, más usado en open source. Ejemplo: `pkg:npm/lodash@4.17.4`. Funciona bien para ecosistemas conocidos (npm, pypi, deb), pero `pkg:generic` no funciona con escáneres como Grype.

**SBOM** (*Software Bill of Materials*)
"Lista de ingredientes" de software. Documento que describe todos los componentes instalados. Es el formato estándar para comunicarse con escáneres como Grype.

**CycloneDX**
Estándar de formato SBOM mantenido por OWASP.

---

## Fuentes de datos y herramientas

**NIST**
National Institute of Standards and Technology. Agencia gubernamental EE.UU. que mantiene la NVD.

**NVD** (*National Vulnerability Database*)
La base de datos del NIST con todos los CVEs catalogados. Fuente primaria mundial.

**CISA**
Cybersecurity and Infrastructure Security Agency. Agencia de ciberseguridad del gobierno estadounidense que mantiene el catálogo KEV.

**ENISA**
European Union Agency for Cybersecurity. Agencia europea de ciberseguridad. Mantiene la EUVD (European Vulnerability Database).

**EUVD** (*European Vulnerability Database*)
Base de datos europea de vulnerabilidades, alternativa/complementaria a NVD, mantenida por ENISA.

**GHSA** (*GitHub Security Advisories*)
Base de datos de advisories de GitHub. Solapa con OSV y NVD.

**OSV** (*Open Source Vulnerabilities*)
Base de datos de vulnerabilidades de Google, complementaria a NVD. Especialmente buena para librerías open source.

**Grype**
Escáner de vulnerabilidades open source de Anchore. Apache 2.0. Recibe SBOMs y devuelve CVEs.

**endoflife.date**
Sitio web comunitario que cataloga fechas de EOL de productos software. Tiene API JSON gratuita.

**MSRC**
Microsoft Security Response Center. Fuente oficial de vulnerabilidades de productos Microsoft.

**CERT**
Computer Emergency Response Team. Equipos nacionales que publican alertas de seguridad. En Europa: BSI (Alemania), INCIBE (España), CERT-FR (Francia).

---

## Regulación

**NIS2** (*Network and Information Systems Directive 2*)
Directiva europea de ciberseguridad de 2022, transpuesta a leyes nacionales en 2024-2025. Obliga a muchas empresas (incluyendo PyMEs en sectores críticos) a tener vigilancia de ciberseguridad. **Es nuestro mercado.**

**Artículo 21 NIS2**
Sección de NIS2 que enumera las medidas de gestión de riesgos exigibles. Es la lista que el informe PDF debe cubrir.

**CRA** (*Cyber Resilience Act*)
Regulación europea (vigente desde septiembre 2026) que obliga a notificar vulnerabilidades explotadas en productos digitales.

**DORA** (*Digital Operational Resilience Act*)
Regulación europea para el sector financiero, complementaria a NIS2.

**GDPR** (*General Data Protection Regulation*)
Reglamento general de protección de datos europeo. Obliga a que los datos personales se procesen en la UE (entre otras cosas).

---

## Arquitectura del sistema

**Agente / Agente endpoint**
Programa que corre en el ordenador del cliente. Lee qué software tiene instalado y lo reporta al backend.

**Backend / Scan Processor**
Servidor que recibe los datos del agente, consulta APIs externas y cruza con base de datos propia para generar alertas.

**Frontend cliente**
La web a la que entra el cliente final para ver sus alertas, equipos y descargar el informe NIS2.

**Frontend admin**
La web interna que usa el equipo de VulnRadar para gestionar tenants, supervisar el sistema, etc.

**Tenant**
Un cliente. En el sistema, identificado por un `tenant_id` UUID.

**Multi-tenancy**
Diseño que permite que múltiples clientes (tenants) compartan la misma infraestructura sin verse entre sí.

**RLS** (*Row Level Security*)
Función de PostgreSQL/Supabase que filtra automáticamente las filas que un usuario puede ver según su identidad.

**Lovable**
Plataforma de generación de aplicaciones web con IA. Usada para construir los frontends actuales.

**i18n** (*Internationalization*)
Soporte multi-idioma del producto. El frontend nuevo (Next.js) soporta inglés (default) y español, gestionados con `next-intl` y persistencia en cookie `NEXT_LOCALE`.

**Locale**
Identificador del idioma activo (`en`, `es`). Determina qué catálogo de traducción se carga y el atributo `<html lang>` del documento.

---

## Términos de negocio

**SaaS** (*Software as a Service*)
Modelo de negocio donde el cliente paga una suscripción mensual/anual por usar el software.

**B2B** (*Business to Business*)
Venta entre empresas (no a consumidor final).

**MVP** (*Minimum Viable Product*)
Versión mínima del producto que permite empezar a venderlo y aprender.

**Piloto**
Cliente con condiciones especiales (gratis, descuento) a cambio de feedback. Útil para validar el producto antes de cobrar.

**Churn**
Tasa de clientes que se dan de baja. Métrica clave de SaaS.

**ARR** (*Annual Recurring Revenue*)
Ingresos recurrentes anuales. Cómo se mide una empresa SaaS.

**MRR** (*Monthly Recurring Revenue*)
Ingresos recurrentes mensuales.

**ACV** (*Annual Contract Value*)
Valor anual del contrato de un cliente.

**CAC** (*Customer Acquisition Cost*)
Coste de adquirir un cliente nuevo.

**LTV** (*Lifetime Value*)
Valor total que generará un cliente a lo largo de su vida útil.

**MSP** (*Managed Service Provider*)
Empresa que da servicio TI gestionado a otras empresas. Canal natural para llegar a PyMEs.

**GTM** (*Go-To-Market*)
Estrategia de cómo llegar al mercado y vender.

**PLG** (*Product-Led Growth*)
Estrategia de crecimiento donde el producto se vende solo (self-service, freemium), sin equipo comercial pesado.

---

## Seguridad y producto

**Falso positivo**
Alerta generada cuando no había problema real. Erosiona la confianza del cliente.

**Falso negativo**
Vulnerabilidad real que no detectamos.

**Skip silencioso**
Estrategia de cuando no podemos decidir con seguridad: no generamos alerta en lugar de inventar una.

**Threat intelligence (TI)**
Información sobre amenazas: qué CVEs están siendo explotados, qué vulnerabilidades acaban de salir, qué grupos atacan a qué sectores.

**Supply chain (cadena de suministro de software)**
Riesgo derivado de los componentes y librerías que tu software incorpora. Si una librería que usas tiene un fallo, tú tienes un fallo.

**Patch management**
Disciplina de mantener el software actualizado con los parches de seguridad.

**VulnOps**
Disciplina operativa de gestión de vulnerabilidades. Término introducido por el paper CSA/SANS de 2026.

---

## Estándares de versiones

**SemVer** (*Semantic Versioning*)
Convención de versionado X.Y.Z donde X=major, Y=minor, Z=patch. Estándar en open source.

**CalVer** (*Calendar Versioning*)
Versionado basado en fechas (ej. Ubuntu 24.04 = año.mes).
