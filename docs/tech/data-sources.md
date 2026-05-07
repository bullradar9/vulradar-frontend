# Fuentes externas de datos

> **Para qué sirve este documento.** Explica de dónde sacamos los datos de vulnerabilidades y cómo funciona el matching software → CVE. Es la pieza más conceptualmente importante del sistema. Lo lee gente de producto y de tecnología indistintamente.

---

## Las 3 fuentes

El sistema usa 3 fuentes distintas para responder a las 3 preguntas del pipeline. Cada una funciona de forma diferente.

| Fuente | Datos | Cómo se consume | Llamada por scan |
|---|---|---|---|
| **NVD vía Grype** | ~250.000 CVEs | BD local en el processor | No |
| **endoflife.date** | Fechas de fin de soporte | API HTTP en vivo | Sí |
| **CISA KEV** | ~1.587 CVEs explotados activamente | Tabla local en Supabase | No |

---

## Fuente 1: NVD vía Grype (CVEs mundiales)

| Aspecto | Valor |
|---|---|
| Datos | ~250.000 CVEs catalogados con CVSS y CPEs |
| Mantenedor | NIST (gobierno EE.UU.) + comunidad |
| Cómo se consume | Grype tiene su BD descargada local (~100 MB) |
| Llamada por scan | NO — todo local, ejecución como subproceso |
| Actualización | Manual al rebuildar Docker (deuda técnica) |
| Coste | 0 € |
| Licencia Grype | Apache 2.0 |

### Por qué Grype

Construir un motor propio de matching CVE costaría 6-12 meses. Grype lo tiene resuelto, agrega NVD + GHSA + Alpine + Debian + RHEL, y funciona offline tras `db update`.

Detalle de la decisión en [`../decisions.md`](../decisions.md).

---

## Fuente 2: endoflife.date (programas abandonados)

| Aspecto | Valor |
|---|---|
| Datos | Fechas de fin de soporte por producto y versión |
| Mantenedor | Comunidad de voluntarios |
| Cómo se consume | API JSON pública (`https://endoflife.date/api/{producto}/{ciclo}.json`) |
| Llamada por scan | Sí, en vivo |
| Timeout | 5s, skip silencioso si falla |
| Actualización | En vivo, sin caché (deuda técnica) |
| Coste | 0 € |

### Riesgos

- **Sin SLA**: es proyecto comunitario.
- **Si cae, perdemos el pilar EOL** durante el rato que esté caído.
- **Sin caché**: dependemos de cada llamada. Pendiente cachear en Supabase con TTL 24h.

---

## Fuente 3: CISA KEV (CVEs activamente explotados)

| Aspecto | Valor |
|---|---|
| Datos | 1.587 CVEs (mayo 2026) con prueba de explotación activa |
| Mantenedor | CISA (gobierno EE.UU.) |
| Cómo se consume | Tabla `cisa_kev` en Supabase |
| Llamada por scan | NO — consulta SQL local |
| Actualización | Script `sync-cisa-kev.ts` (manual hoy, deuda técnica) |
| Multiplicador | ×1.5 en `priority_score` cuando un CVE está en KEV |
| Coste | 0 € |

### Importancia

Un CVE en KEV significa que delincuentes lo están usando **ahora mismo** en ataques reales. Es el subconjunto crítico que el cliente debe parchear primero. Por eso el multiplicador en el scoring.

---

## El problema central: matching software → vulnerabilidad

Esta es la pieza más difícil técnicamente del sistema. Vulnerabilidades catalogadas por NVD usan el formato **CPE 2.3** (`cpe:2.3:a:google:chrome:120.0.6099.109:*:*:*:*:*:*:*`). El software detectado en el ordenador del cliente tiene un nombre sucio (`Google Chrome (x64)`). Hay que conectar uno con el otro.

### Hallazgo crítico validado empíricamente

Validamos el 2025-05-03:

| Tipo de identificador | Resultado en Grype |
|---|---|
| `pkg:generic/google/chrome@120.0` | **0 matches** ❌ |
| `pkg:npm/lodash@4.17.4` | 10 matches ✅ |
| `cpe:2.3:a:google:chrome:120.0:*:*:*:*:*:*:*` | **781 matches** ✅ |

**Conclusión**: Grype matchea por (a) **purl de ecosistema conocido** (`pkg:npm`, `pkg:pypi`, `pkg:deb`, etc.) o (b) **CPE 2.3**. El tipo `pkg:generic` es ignorado silenciosamente.

**Implicación**: para software Windows comercial necesitamos CPE 2.3. De ahí la tabla curada en el agente.

---

## La solución: tabla curada de mappings

El agente lleva una tabla embebida con los productos más comunes. Cada entrada incluye:

- `pattern`: regex para detectar el software por nombre.
- `canonical_name`: nombre limpio (`chrome`, `firefox`, etc.).
- `vendor`: fabricante (`google`, `mozilla`).
- `purl_template`: para informe técnico.
- `cpe`: plantilla CPE 2.3 con `*` en posición de versión.

Cuando el agente detecta `Google Chrome 120.0.6099.109`, sustituye el `*` por la versión real y emite:

```
cpe:2.3:a:google:chrome:120.0.6099.109:*:*:*:*:*:*:*
```

Detalle del agente y la tabla en [`agent.md`](./agent.md).

### Estado actual de la tabla curada

- **35 productos cubiertos** (Chrome, Firefox, Office, Teams, Adobe, etc.).
- En un PC típico de desarrollador: 12 de 84 paquetes (14% de cobertura CPE).
- 53 paquetes detectados sin match en tabla → solo reciben evaluación EOL/OUTDATED.
- 12 paquetes son VC++ Redistributables (colapsan a `vcredist`, sin CPE — NVD no los tiene).

**Para escalar**: la tabla debe crecer a 200+ productos según los pilotos cliente vayan revelando software vertical (gestores de farmacia, ERPs sectoriales, etc.).

---

## Cobertura realista esperada

Basada en datos reales y experiencia del equipo:

| Categoría | Cobertura CVE esperable |
|---|---|
| Linux con dpkg/rpm | 90-95% |
| Open source mainstream (Chrome, Firefox, Node, Python) | 80-90% |
| Software Windows comercial top-50 (Office, Adobe, Zoom) | 70-85% |
| Software Windows comercial long-tail | 30-50% |
| Software empresarial nicho/vertical | 10-30% |
| macOS apps mainstream | 75-85% |

**Para un equipo Windows típico de PyME**: detectaremos correctamente el 60-75% del software vulnerable real.

Esto suena bajo, pero es **infinitamente mejor que el 0% que tienen hoy**, y es competitivo con herramientas enterprise mal configuradas.

**Falsos positivos esperables**: <5% (gracias a la filosofía "skip silencioso si no hay certeza").

---

## Por qué los 3 pilares juntos son la propuesta de valor

CVEs recientes son raros en software de PyME. Si solo se mostraran CVEs, el dashboard de muchos clientes estaría **vacío** durante meses, y un dashboard vacío es invendible.

Los 3 pilares juntos garantizan que **siempre haya hallazgos accionables**:

- **CVE** (Grype): cubre el riesgo agudo y crítico.
- **EOL** (endoflife.date): cubre la deuda técnica acumulada (software abandonado por su fabricante).
- **OUTDATED** (tabla `software_versions`): cubre la higiene básica (versiones obsoletas pero aún soportadas).

Eliminar uno de los pilares en busca de "simplicidad" sería un error fatal.

Detalle de la decisión en [`../decisions.md`](../decisions.md).

---

## Recursos externos

| Recurso | URL |
|---|---|
| NVD (NIST) | https://nvd.nist.gov/ |
| Grype (Anchore) | https://github.com/anchore/grype |
| endoflife.date | https://endoflife.date/ |
| CISA KEV catalog | https://www.cisa.gov/known-exploited-vulnerabilities-catalog |
| CycloneDX spec | https://cyclonedx.org/specification/overview/ |
| CPE 2.3 spec | https://nvd.nist.gov/products/cpe |
