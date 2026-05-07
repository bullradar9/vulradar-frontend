# Compliance europea — Estudio de mercado para VulnRadar EU

> **Para qué sirve este documento.** Análisis del marco regulatorio europeo de ciberseguridad relevante para VulnRadar, enfocado a dimensionar el mercado real en los **dos mercados iniciales** del proyecto: España y Luxemburgo. Cubre NIS2 (regulación principal), pero también CRA, ENS, ISO 27001 y DORA, que abren mercados adyacentes con el mismo producto técnico.
>
> No es un manual jurídico exhaustivo; es la información que necesitas para hablar con prospects sin meter la pata, ajustar las hipótesis de negocio en `product/product.md`, y diseñar el sistema de plantillas del informe.
>
> **Fecha**: mayo 2026.
> **Fuentes principales**: textos oficiales (Directiva 2022/2555, Reglamento 2022/2554, Reglamento 2024/2847, Real Decreto 311/2022, ISO 27001:2022), INCIBE, CCN, ILR Luxembourg, HCPN, Comisión Europea, Anteproyecto de Ley de Coordinación y Gobernanza de la Ciberseguridad (España, ene 2025), Bill of Law 8364 (Luxemburgo, mar 2024), prensa especializada.

---

## TL;DR — Lo importante en una pantalla

VulnRadar no es "la herramienta NIS2 para PyMEs". Es **"la herramienta de gestión de vulnerabilidades multi-norma para PyMEs europeas"**. El mismo motor técnico cubre 4 vectores de venta:

| Norma | Cliente típico | Driver de compra | Mercado España + LU |
|---|---|---|---|
| **NIS2** | PyME mediana en sector crítico | Multa hasta 10M€ + transposición pendiente | ~12K obligados directos + 30-50K proveedores |
| **CRA** | Fabricante de software/hardware UE | Reporting obligatorio desde sept 2026 | Decenas de miles (sin tamaño mínimo) |
| **ENS** | Proveedor de AAPP española | Sin certificación = no licita | Decenas de miles (solo España) |
| **ISO 27001 A.8.8** | Startup B2B / fintech / SaaS | Cliente corporativo lo exige | Miles |

**DORA** (sector financiero) **no es tu mercado** pero **sí es vector de presión** sobre proveedores ICT del financiero (especialmente en Luxemburgo). Genera demanda sin que tú tengas que cumplir DORA.

**Mensaje clave**: estos mercados son **complementarios, no excluyentes**. Una empresa puede estar en varios a la vez. En Fase 0, no preguntes solo "¿NIS2 te aplica?" — pregunta también por CRA, ENS e ISO 27001. Multiplica el pool de prospects sin tocar el producto.

---

## 1. NIS2 en una página

La **Directiva (UE) 2022/2555**, conocida como NIS2, es la norma europea de ciberseguridad que sustituye a la NIS1 de 2016. Entró en vigor el **16 de enero de 2023**, con plazo de transposición a las legislaciones nacionales hasta el **17 de octubre de 2024**.

Lo que hace operativamente:

- **Amplía el alcance**: pasa de unos pocos sectores ("operadores de servicios esenciales" de NIS1) a **18 sectores críticos** organizados en dos anexos.
- **Introduce la "regla del tamaño" (size-cap rule)**: cualquier mediana o gran empresa de los sectores listados queda dentro automáticamente, sin que un regulador la designe a dedo (cambio fundamental respecto a NIS1).
- **Clasifica entidades en dos categorías**: *esenciales* e *importantes*, con regímenes de supervisión y sanciones distintos pero con **las mismas obligaciones técnicas**.
- **Endurece multas**: hasta 10M€ o 2% de facturación global para esenciales; hasta 7M€ o 1,4% para importantes.
- **Hace personalmente responsable a la dirección**: pueden ser inhabilitados temporalmente.
- **Plazos estrictos de notificación**: alerta temprana en 24h, notificación formal en 72h, informe final en 1 mes.
- **Obliga a vigilar la cadena de suministro**: las entidades obligadas tienen que auditar a sus proveedores.

**Por qué importa para tu producto**: el último punto abre la puerta a vender más allá de los obligados directos. Un proveedor TI de un hospital obligado va a recibir requerimientos de seguridad como condición contractual aunque él mismo no esté obligado por tamaño.

---

## 2. Quién entra en NIS2 — la lógica común UE

Hay **tres condiciones** que se aplican a la vez. Si las tres se cumplen, la empresa está obligada.

### 2.1. Condición de ubicación

La empresa presta servicios o desarrolla actividades en la UE. No importa dónde tenga la sede social: si opera en mercado europeo, aplica.

### 2.2. Condición de sector

#### Anexo I — Sectores de alta criticidad

Si una empresa de estos sectores supera el tamaño de gran empresa, es **entidad esencial**. Si es mediana, es **entidad importante**.

1. **Energía**: electricidad, redes urbanas de calor/frío, petróleo, gas, **hidrógeno** (nuevo en NIS2).
2. **Transporte**: aéreo, ferroviario, marítimo, por carretera.
3. **Banca**: entidades de crédito.
4. **Infraestructuras de mercados financieros**: gestores de plataformas de negociación, contrapartes centrales.
5. **Sanidad**: hospitales, laboratorios de referencia, fabricación de productos farmacéuticos básicos, fabricantes de productos sanitarios críticos.
6. **Agua potable**: suministradores y distribuidores.
7. **Aguas residuales**: empresas que recogen, eliminan o tratan aguas residuales urbanas, domésticas o industriales (nuevo en NIS2).
8. **Infraestructura digital**: IXP, DNS, TLD, **cloud computing**, centros de datos, CDN, prestadores de servicios de confianza, redes públicas de comunicaciones electrónicas.
9. **Gestión de servicios TIC (B2B)**: proveedores de servicios gestionados (MSP) y proveedores de servicios de seguridad gestionados (MSSP). **Importante para tu canal indirecto.**
10. **Administración pública**: central y regional/autonómica.
11. **Espacio**: operadores de infraestructuras terrestres.

#### Anexo II — Otros sectores críticos

Empresas de estos sectores son **entidades importantes** salvo designación contraria.

12. Servicios postales y de mensajería.
13. Gestión de residuos.
14. Fabricación, producción y distribución de productos químicos.
15. Producción, transformación y distribución de alimentos (limitado a distribución mayorista y producción/transformación industrial; *no* incluye restaurantes, panaderías, comercios).
16. **Fabricación**: productos sanitarios y de diagnóstico in vitro; productos informáticos/electrónicos/ópticos; equipos eléctricos; maquinaria; vehículos de motor; otro material de transporte.
17. **Proveedores digitales**: marketplaces, motores de búsqueda, plataformas de redes sociales.
18. **Investigación**: organizaciones e institutos de investigación.

### 2.3. Condición de tamaño (regla general)

Por defecto, NIS2 solo aplica a **medianas y grandes empresas** según la Recomendación 2003/361/CE:

| Tamaño | Empleados | Volumen de negocio | Balance |
|--------|-----------|--------------------|---------|
| **Mediana** | 50 a 249 | hasta 50M€ | hasta 43M€ |
| **Grande** | ≥ 250 | > 50M€ | > 43M€ |

Una empresa entra en "mediana" si supera **50 empleados** O **10M€** de facturación. Las **microempresas y pequeñas** (< 50 empleados Y < 10M€) quedan fuera por regla general.

### 2.4. Excepciones — entran sin importar el tamaño

- Proveedores de redes públicas de comunicaciones electrónicas.
- Prestadores de servicios de confianza (firmas electrónicas, certificados).
- Registros de TLD y proveedores de DNS.
- Únicos proveedores en un Estado miembro de un servicio esencial.
- Entidades cuya interrupción afecte al orden público, seguridad o salud pública.
- Entidades calificadas como críticas bajo la Directiva CER (UE) 2022/2557.
- Administración pública.
- Cualquier entidad que el Estado designe específicamente.

### 2.5. Esenciales vs Importantes — diferencia práctica

| | Esenciales | Importantes |
|--|---|---|
| Quiénes | Grandes empresas Anexo I + casos especiales | Resto: medianas Anexo I, todas Anexo II salvo designación |
| Supervisión | Proactiva (auditorías programadas) | Reactiva (cuando hay sospecha) |
| Multa máxima | 10M€ o 2% facturación global | 7M€ o 1,4% facturación global |
| Obligaciones técnicas | **Las mismas** (Artículo 21) | **Las mismas** (Artículo 21) |

**Detalle clave**: las obligaciones técnicas son iguales. La diferencia es cómo te vigila el Estado. Para tu producto esto es bueno: la propuesta de valor es idéntica para esenciales e importantes.

---

## 3. España — estado de transposición y mercado NIS2

### 3.1. Estado de la transposición (mayo 2026)

- **Octubre 2024**: España incumplió el plazo de transposición.
- **Noviembre 2024**: Comisión Europea abrió procedimiento de infracción contra 23 países, incluida España.
- **14 de enero de 2025**: Consejo de Ministros aprobó el **Anteproyecto de Ley de Coordinación y Gobernanza de la Ciberseguridad**.
- **7 de mayo de 2025**: Comisión envió **dictamen motivado** a España. Siguiente escalón: TJUE con multas coercitivas al Estado.
- **Mayo 2026**: el anteproyecto **sigue pendiente de tramitación parlamentaria**.
- **Estimación**: entrada en vigor a lo largo de 2026, con plazos de cumplimiento ajustados.

**Wavestone (ene 2026) clasifica a España en "nivel 2"** de madurez europea: borrador presentado pero no aprobado. Junto con Luxemburgo, Francia, Países Bajos, Polonia, Bulgaria y UK. Por detrás de Bélgica, Alemania, Italia, etc. (nivel 4).

**Particularidades del anteproyecto español**:
- Crea el **Centro Nacional de Ciberseguridad (CNC)**.
- Reparte competencias entre Interior, Defensa (CCN) y Transformación Digital.
- INCIBE-CERT como CSIRT de referencia para sector privado, CCN-CERT para público.
- Añade al **Anexo II español** la **seguridad privada** y la **investigación científica** (no en la directiva).
- Plazo de **3 meses** para autoidentificarse desde aprobación, con sanción si no se hace.

### 3.2. Tamaño del mercado español NIS2

| Fuente | Estimación España | Comentario |
|---|---|---|
| Evolutio (datos Seguridad Social, dic 2024) | **33.072 empresas** > 50 empleados en sectores NIS2 | Cota superior, no filtra subsectores exactos |
| Gobierno de España (anteproyecto, ene 2025) | **~5.700 empresas** | Cifra oficial. Base del impacto económico |
| Computing / IT User (mar 2026) | **~5.760 empresas** | Misma fuente actualizada |
| Inversión total estimada | **2.250M€** | Estimación oficial de impacto |

**La cifra oficial española de 5.700-5.760 es la que importa para tu mercado *directo*.**

**Mercado directo (obligados directos)**: ~5.700 empresas.
- A 49€/mes Starter: 5.700 × 49 × 12 = **3,35M€** TAM teórico.
- Captar 5%: 285 clientes = **167K€ ARR**.
- Captar 10%: 570 clientes = **335K€ ARR**.

**Mercado indirecto (proveedores de obligados)**: estimación de orden de magnitud, ~30-50K PyMEs proveedoras.
- A 49€/mes: 40K × 49 × 12 = **23,5M€** TAM teórico.

### 3.3. Sectores prioritarios España vs realidad NIS2

Comparado con tu lista actual en `product/product.md`:

| Tu prioridad actual | Estatus en NIS2 | Recomendación |
|---|---|---|
| Asesorías y gestorías | **No están en NIS2 directamente** | Mantener como canal, no como cliente directo primario |
| MSPs pequeños | **Anexo I sector 9** (obligados directos) | **Subir a #1**: doble papel canal + cliente |
| Industria manufacturera mediana | **Anexo II sector 16** (importantes) | Mantener prioridad alta |
| Salud (clínicas, laboratorios) | **Anexo I sector 5** | Sector con dolor regulatorio acumulado. Buena prioridad |
| Energía descentralizada (instaladores fotovoltaicos) | Solo **operadores**, no instaladores | **Bajar prioridad** |

**Sectores españoles que tu plan no menciona y son interesantes**:

- **Aguas residuales** (Anexo I sector 7): operadores de EDARs, sector poco maduro digitalmente, baja competencia.
- **Servicios postales y mensajería** (Anexo II sector 12): operadores logísticos medianos.
- **Investigación** (Anexo II sector 18): centros tecnológicos privados, fundaciones de I+D.
- **Seguridad privada**: añadida por anteproyecto español, mercado muy fragmentado.

---

## 4. Luxemburgo — estado de transposición y mercado NIS2

> **Lectura previa**: Luxemburgo es un país de 670K habitantes, pero su tejido empresarial está muy concentrado en sectores NIS2 (financiero, ICT, espacio). El TAM absoluto es pequeño, pero la densidad de empresas obligadas por habitante es de las más altas de la UE.

### 4.1. Estado de la transposición (mayo 2026)

- **13 de marzo de 2024**: Gobierno luxemburgués depositó en la Cámara de Diputados el **Projet de loi 8364** ("Projet de loi concernant des mesures destinées à assurer un niveau élevé de cybersécurité").
- **8 de octubre de 2024**: Consejo de Estado emitió dictamen sobre el borrador.
- **9 de diciembre de 2024**: Comisión de Instituciones discutió el dictamen.
- **17 de octubre de 2024**: Luxemburgo incumplió el plazo de transposición.
- **Noviembre 2024**: Comisión Europea abrió procedimiento de infracción.
- **7 de mayo de 2025**: Comisión envió **dictamen motivado** a Luxemburgo.
- **Mayo 2026**: ley sigue pendiente de aprobación parlamentaria; Wavestone clasifica a Luxemburgo en "nivel 2" de madurez. Estimaciones de prensa especializada apuntan a votación a finales de 2025 o 2026, con calendario tentativo:
  - Q1 2026: empresas en alcance.
  - Abril 2026: autoregistro en portal ILR.
  - Enero 2027: controles de gobernanza obligatorios.
  - Enero 2028: cumplimiento técnico completo.

### 4.2. Quién supervisa qué en Luxemburgo

A diferencia de España (donde habrá un único CNC coordinando), **Luxemburgo divide la supervisión** según el sector:

| Autoridad | Sectores supervisados |
|---|---|
| **ILR** (Institut Luxembourgeois de Régulation) | Mayoría de sectores: energía, transporte, agua, salud, infraestructura digital (excepto financiero), AAPP, espacio, postal, residuos, química, alimentación, fabricación, proveedores digitales, investigación |
| **CSSF** (Commission de Surveillance du Secteur Financier) | Banca, infraestructuras de mercados financieros, infraestructura digital y gestión TIC **cuando estos sirven al sector financiero** |
| **HCPN** (Haut-Commissariat à la Protection Nationale / ANSSI) | Coordinación estratégica nacional |

**Implicación práctica para ti**: la mayoría de tus prospects en Luxemburgo se registrarán en el portal ILR. Pero los que sirven al sector financiero (que son muchos en Lux) reportarán a CSSF, que tiene exigencias más severas (DORA además de NIS2).

### 4.3. Tamaño del mercado luxemburgués NIS2

| Fuente | Estimación Luxemburgo | Comentario |
|---|---|---|
| Estimación oficial (Bill 8364, prensa) | **6.000 a 8.000 entidades** en alcance | Pasa de ~1.000 con NIS1 a 6-8K con NIS2 |
| ILR / Comisión Europea | Pendiente publicación oficial | El plazo del 17 abr 2025 para notificar números a la Comisión se cumplió tarde |

**Comparación reveladora**:
- España: 5.700 obligados con 48M de habitantes = **1 obligado / 8.400 habitantes**.
- Luxemburgo: ~7.000 obligados con 670K habitantes = **1 obligado / ~95 habitantes**.

**Luxemburgo tiene aproximadamente 88 veces más densidad de empresas obligadas por habitante que España.** En la práctica significa que cualquier empresa B2B mediana luxemburguesa está dentro.

**TAM Luxemburgo a precio Starter (49€/mes)**:
- 7.000 × 49 × 12 = **4,1M€** TAM teórico directo.
- Captar 5%: 350 clientes = **205K€ ARR**.
- Captar 10%: 700 clientes = **412K€ ARR**.

**Aunque Luxemburgo es 1/7 del mercado español en absoluto, las cifras son comparables porque la densidad es mucho mayor.**

### 4.4. Particularidades del mercado luxemburgués

**Sectores dominantes en Luxemburgo dentro de NIS2**:

1. **Sector financiero**: dominante. Bancos, fondos, gestoras, fintechs. Casi todos están sujetos también a **DORA** (ver sección 7).
2. **ICT service management**: muchísimos MSPs y MSSPs especializados en servicios al sector financiero.
3. **Espacio**: SES, Luxgovsat, etc.
4. **Cloud computing y data centers**: presencia notable de hyperscalers y proveedores europeos.
5. **Administración pública**: incluye municipios > 50.000 habitantes (en la práctica, Ciudad de Luxemburgo y Esch-sur-Alzette).

**Lo que NO domina** (y conviene saber para no perder tiempo):
- Industria manufacturera grande: muy poca.
- Energía: ENOVOS, Creos y poco más.
- Transporte: limitado.

**Implicación para tu prospección**: en Luxemburgo, **pivotar hacia sectores ICT y proveedores del financiero**. Olvidar industria manufacturera. Las clínicas y laboratorios sí cuentan pero son pocos.

### 4.5. Particularidades técnicas del Bill 8364

Diferencias relevantes respecto a la directiva pura:

- **Multas máximas reducidas para entidades importantes**: hasta 7M€ o 1,4% (igual que la directiva, sin endurecer pero tampoco suavizar).
- Añade los **laboratorios nacionales de referencia** designados bajo la Ley de 1 agosto 2018 (notificación de enfermedades) al Anexo I sector 5.
- **SERIMA**: plataforma del ILR para que las entidades hagan análisis de riesgo según metodología **MONARC NC3** (estándar luxemburgués).
- **Incluye municipios > 50.000 habitantes** explícitamente.
- Procedimiento sancionador escalonado: avisos → planes de mejora → penalizaciones diarias → multas → prohibición de servicio.

**Implicación para tu producto**: si en algún momento llegas a serio en Luxemburgo, considera **integración con SERIMA y compatibilidad con MONARC**. No es bloqueante para empezar, pero es lo que el ILR va a esperar.

---

## 5. Comparativa NIS2: España vs Luxemburgo

| Dimensión | España | Luxemburgo |
|---|---|---|
| **Habitantes** | 48M | 670K |
| **Empresas obligadas (estimación oficial)** | 5.700 | 6.000-8.000 |
| **Densidad (obligados / habitante)** | 1 / 8.400 | 1 / 95 |
| **Inversión total estimada** | 2.250M€ | No publicado |
| **Idioma de venta** | Español | Francés / Inglés / Alemán |
| **Estado transposición (mayo 2026)** | Anteproyecto en trámite | Bill 8364 en comisión |
| **Autoridad** | CNC + Interior + CCN + INCIBE | ILR + CSSF + HCPN |
| **Sectores dominantes en alcance** | Manufactura, salud, MSPs | Financiero, ICT, espacio |
| **Idioma del informe NIS2** | Español obligatorio | FR / EN aceptable, mejor multilingüe |
| **Coste medio ciberseguridad PyME** | 24-30K€/año | Significativamente mayor (mercado financiero) |
| **Competencia local** | Audidat, EQA, ISEC, S2 Grupo, Entelgy, Edorteam, Delbion | Big Four (Deloitte, PwC, EY, KPMG), Telindus, POST Cyberforce |
| **Sensibilidad al precio** | Alta (PyME pequeña) | Más baja (cliente medio gana más) |
| **Diferencia clave** | Volumen | Densidad y poder adquisitivo |

### 5.1. Implicaciones estratégicas

**Para España**:
- Tu propuesta de valor de "49€/mes" tiene sentido porque la PyME mediana española ya gasta 24-30K€/año en ciberseguridad y le sobra poco margen para herramientas adicionales.
- El mercado es de volumen: muchas empresas pequeñas con dolor moderado. PLG y self-service son la vía.
- El idioma español es ventaja defensible.

**Para Luxemburgo**:
- Tu precio de 49€/mes puede ser **demasiado barato** para parecer serio en Luxemburgo. El mercado luxemburgués está acostumbrado a Big Four cobrando 5-figure mensual. Una herramienta a 49€ puede leerse como "low-quality" cuando para España se lee como "asequible".
- Posible variante de pricing: tier "Lux Pro" a 199-299€/mes con soporte en francés, multi-idioma, y compatibilidad SERIMA.
- El mercado es de densidad y calidad: pocas empresas, alto poder adquisitivo. Ventas más consultivas.
- **Inglés y francés** son obligatorios. El alemán es nice-to-have.
- DORA es un competidor regulatorio: muchas empresas financieras dirán "ya estamos haciendo DORA, NIS2 va incluido". Hay que saber matizar (ver sección 7).

**Recomendación de fasado**:

1. **Fase 0-1 (validación + pilotos): España solo.** No abrir Luxemburgo todavía. Luxemburgo requiere material en FR/EN, conocimiento de SERIMA/MONARC, y posiblemente otro pricing. Distrae si no hay aún tracción en España.
2. **Fase 2 (10 clientes pagando España): explorar Luxemburgo selectivamente.** Aprovechar que el equipo está físicamente allí: 5-10 conversaciones con MSPs locales y consultoras pequeñas que quieran revender. Usar Luxemburgo como **canal**, no como mercado directo todavía.
3. **Fase 3 (50 clientes España): abrir Luxemburgo formalmente** con landing en FR/EN, integración SERIMA, y pricing diferenciado.

---

## 6. CRA — Cyber Resilience Act

> **El más interesante de los mercados adyacentes.** Probablemente abre más oportunidad que NIS2 fuera de los obligados directos clásicos. Y tiene un deadline concreto a septiembre 2026 que genera urgencia comercial real.

### 6.1. Qué es CRA

El **Reglamento (UE) 2024/2847**, conocido como Cyber Resilience Act (CRA), es la primera regulación europea horizontal sobre **ciberseguridad de productos**. Establece requisitos obligatorios de ciberseguridad para "productos con elementos digitales" (hardware o software) que se ponen en el mercado UE.

- **Tipo**: Reglamento (aplica directo, sin transposición).
- **Entró en vigor**: 10 de diciembre de 2024.
- **Plenamente aplicable**: 11 de diciembre de 2027.
- **Hito intermedio crítico**: **11 de septiembre de 2026** — empieza la obligación de notificar **vulnerabilidades activamente explotadas** en 24h a ENISA.
- **Hito intermedio**: 11 de junio de 2026 — empieza el régimen de notificación de organismos de evaluación de la conformidad.

### 6.2. A quién afecta

A diferencia de NIS2, **no hay umbral de tamaño**. CRA aplica a:

- **Fabricantes** de productos con elementos digitales que se ponen en el mercado UE.
- **Importadores y distribuidores** de esos productos.
- **Open source stewards** que mantienen software de forma comercial.

"Producto con elementos digitales" se define muy ampliamente: cualquier hardware o software cuyo uso previsto incluye conexión directa o indirecta de datos a un dispositivo o red.

**Ejemplos de a quién aplica directamente**:
- Fabricantes de software de gestión vertical (gestores de farmacia, ERPs sectoriales, software de notarías, etc.).
- Fabricantes de IoT (cámaras, sensores, dispositivos conectados).
- Desarrolladores de aplicaciones móviles comerciales.
- Fabricantes de routers, switches, equipos de red.
- Fabricantes de productos médicos digitales.
- Cualquier empresa que ponga producto digital en el mercado UE, sin importar tamaño.

**Quedan fuera**:
- Software open source no monetizado.
- Productos ya regulados por normativas sectoriales específicas (algunos médicos clase III, automoción, aviación).
- Servicios SaaS puros (regulados por NIS2 si entran).

### 6.3. Qué exige CRA

Los requisitos esenciales se agrupan en categorías. Los más relevantes para tu producto:

- **Diseño y desarrollo seguro** ("secure by design").
- **Vulnerability handling**: proceso documentado para identificar, gestionar y reportar vulnerabilidades durante toda la vida útil del producto.
- **SBOM (Software Bill of Materials)** obligatorio: lista de componentes del producto, mantenida y actualizada.
- **Período de soporte declarado**: el fabricante debe declarar cuánto tiempo dará parches de seguridad (mínimo 5 años recomendado).
- **Notificación obligatoria**:
  - Vulnerabilidades **activamente explotadas**: alerta en 24h a ENISA + CSIRT nacional.
  - Notificación completa en 72h.
  - Informe final 14 días después de tener parche disponible.
  - Aplica también a productos legacy ya en mercado.

### 6.4. Por qué CRA es relevantísimo para VulnRadar

El requisito de "vulnerability handling con SBOM y monitorización continua" es **literalmente lo que produce VulnRadar**. Con un pequeño ajuste de plantilla, tu producto resuelve la parte técnica que CRA exige.

**Comparación NIS2 vs CRA como mercados para ti**:

| | NIS2 | CRA |
|---|---|---|
| Filosofía | Operativa interna del cliente | Producto que vende el cliente |
| Tamaño mínimo | 50 empleados / 10M€ | **Sin tamaño mínimo** |
| Sectores | 18 críticos | Cualquier producto digital |
| Deadline real | Pendiente de transposición | **11 sept 2026** (firme) |
| Lo que pide tu producto | Inventario interno + scan | SBOM del producto + monitorización |

**Implicación**: en España hay miles de pequeños fabricantes de software vertical que **no entran en NIS2** (porque tienen 10-30 empleados y < 10M€) pero **sí entran en CRA**. Y tienen un deadline duro a 4 meses. Es un mercado que tu plan actual ignora completamente.

### 6.5. Mensaje de venta CRA

> "En septiembre de 2026 todo fabricante de software que vende en la UE tiene que poder reportar vulnerabilidades activamente explotadas en 24 horas a ENISA. Para hacerlo necesitas SBOM y monitorización continua. Si no los tienes, no puedes cumplir. VulnRadar te genera el SBOM, te monitoriza contra NVD/CISA KEV continuamente, y te avisa el día que una vulnerabilidad de tu producto entra en KEV. Sin esto, te enfrentas a multas y a tu producto retirado del mercado."

### 6.6. Implicación para el producto

Para servir a fabricantes (CRA) tu producto necesita un **modo "fabricante de producto"** además del modo "operador interno" actual:

- **Modo operador (NIS2/ENS/ISO)**: el cliente instala el agente en sus PCs/servidores, escaneamos su software, generamos informe.
- **Modo fabricante (CRA)**: el cliente sube el SBOM de su producto, monitorizamos los componentes contra NVD/KEV, alertamos cuando aparece CVE explotado en alguno de los componentes que ellos usan.

El motor técnico es **el mismo** (matching CPE/purl contra fuentes externas). La diferencia es de UX y de plantilla del informe. Es trabajo de aplicación, no de motor.

---

## 7. DORA — Digital Operational Resilience Act

> **No es tu mercado, pero sí es vector de presión** sobre proveedores ICT del financiero, especialmente en Luxemburgo.

### 7.1. Qué es DORA

El **Reglamento (UE) 2022/2554**, conocido como Digital Operational Resilience Act (DORA), es la regulación europea de resiliencia operativa digital del sector financiero.

- **Tipo**: Reglamento (aplica directo).
- **Aplicable desde**: **17 de enero de 2025** (sin periodo de gracia).
- **Filosofía**: deep & narrow — pocas entidades pero requisitos muy detallados.

### 7.2. A quién afecta

- 21 categorías de entidades financieras: bancos, aseguradoras, gestoras (UCITS, AIFM), entidades de pago, empresas de inversión, plataformas de negociación, depositarios centrales, contrapartes centrales, proveedores de cripto, etc.
- **Proveedores ICT terceros** que sirven a entidades financieras (cloud, software, datacenters, plataformas de análisis).
- De estos proveedores ICT, una lista muy reducida (~19 a noviembre 2025) son designados como **CTPP — Critical ICT Third-Party Providers** y están bajo supervisión directa de las autoridades europeas (EBA, ESMA, EIOPA).

### 7.3. Relación DORA ↔ NIS2

**DORA es lex specialis sobre NIS2** (Art. 1.2 DORA + Art. 4 NIS2):

- Una entidad financiera que cumple DORA **automáticamente** satisface sus obligaciones equivalentes de NIS2.
- DORA prevalece donde solapa.
- NIS2 sigue aplicando en lo que DORA no cubra (raro).

### 7.4. Diferencias prácticas relevantes

| | DORA | NIS2 |
|---|---|---|
| Notificación incidentes | **4h** alerta inicial | 24h alerta inicial |
| Resilience testing | **TLPT obligatorio cada 3 años** | "Recomendado" |
| Contratos con proveedores ICT | Art. 30: cláusulas muy prescriptivas | Más genérico |
| Sanciones | 1% facturación diaria mundial (CTPPs) | 10M€ o 2% (esenciales) |
| Multa entidad financiera | A través de NCAs financieras | A través de autoridad nacional ciber |

### 7.5. Por qué DORA importa para VulnRadar

**No es tu mercado directo**:
- Las entidades DORA grandes pagan a Tenable/Qualys/Big Four. No comprarían VulnRadar a 49€/mes.
- DORA exige cosas que tu producto no hace (TLPT, contractual frameworks Art. 30, RTOs/RPOs documentados).
- Los compradores DORA tienen presupuesto enterprise.

**Pero genera demanda lateral**:
- En Luxemburgo el sector financiero domina. Sus **proveedores ICT** (que son tus targets reales en Luxemburgo) **NO están automáticamente cubiertos por DORA** salvo que sean designados CTPP. Esos proveedores están sujetos a NIS2 directamente como "gestión de servicios TIC" del Anexo I sector 9.
- Sus clientes financieros les exigirán cláusulas DORA Art. 30 en el contrato. Una de esas cláusulas pide demostrar gestión continua de vulnerabilidades.

**Mensaje de venta para Luxemburgo aprovechando DORA**:

> "Si das servicio TIC a un banco luxemburgués, tu cliente te va a pedir cláusulas DORA Art. 30 en el contrato. Una de esas cláusulas exige que demuestres gestión continua de vulnerabilidades. VulnRadar te genera el informe que pide tu cliente cada mes."

Esto convierte a DORA en **driver de venta indirecto** sin que tengas que cumplir DORA tú ni tu producto tenga que hacer nada específico de DORA.

---

## 8. ENS — Esquema Nacional de Seguridad

> **Específico de España. Mercado adyacente importante para tu canal indirecto.**

### 8.1. Qué es ENS

El **Real Decreto 311/2022** (que actualiza el RD 3/2010) regula el Esquema Nacional de Seguridad: el marco normativo obligatorio en España que rige la ciberseguridad de los sistemas de información de la Administración Pública y, por extensión, de las empresas que les prestan servicios.

- **Tipo**: norma nacional española.
- **Plazo de adaptación de proveedores**: vencido el 2 de mayo de 2024.
- **Autoridad técnica**: Centro Criptológico Nacional (CCN). Las certificaciones formales las emiten entidades acreditadas por ENAC.

### 8.2. A quién afecta

- **Toda la Administración Pública española**: estatal, autonómica, local, organismos públicos, entidades de derecho público, universidades públicas.
- **Empresas privadas que prestan servicios a la AAPP**: contratistas tecnológicos, proveedores TI, consultoras, prestadores de servicios digitales. Es **obligatorio para licitar** con AAPP.
- **Empresas que manejan información clasificada** o prestan servicios a operadores críticos.

### 8.3. Tres niveles según criticidad

| Nivel | Cuándo aplica | Gestión de vulnerabilidades | Auditoría |
|---|---|---|---|
| **Bajo** | Impacto limitado | Recomendada | Voluntaria |
| **Medio** | Impacto grave | **Obligatoria, documentada** | Cada 2 años |
| **Alto** | Impacto muy grave o infraestructura crítica | **Obligatoria, con SLAs** | Cada 2 años |

**Lo relevante para ti**: niveles Medio y Alto exigen explícitamente **gestión de vulnerabilidades documentada con auditoría externa cada 2 años**. Es exactamente lo que VulnRadar produce en automático.

### 8.4. Tamaño del mercado ENS

No hay cifra oficial agregada, pero estimaciones:

- **AAPP española**: ~8.000 entidades públicas (ministerios, CCAA, ayuntamientos, organismos autónomos).
- **Proveedores tecnológicos de AAPP**: decenas de miles. Incluye consultoras, MSPs, integradores, fabricantes de software vertical, empresas de mantenimiento.
- **Por sector privado afectado por extensión**: cualquier empresa que quiera licitación pública. En España es un mercado masivo (compra pública supera 90.000M€/año).

### 8.5. Por qué ENS es relevante para VulnRadar

1. **Mercado adyacente con menos competencia low-cost que NIS2**. Las consultoras (Audidat, EQA, ISEC) viven principalmente del ENS, no de NIS2. Un producto que les complementa encaja en su catálogo.
2. **ENS y NIS2 están alineados intencionadamente**: el anteproyecto español apunta a que cumplir ENS Alto = cumplir gran parte de NIS2.
3. **Driver de compra concreto y no opinable**: "sin certificación ENS no licitas con AAPP". A diferencia de NIS2 (multa potencial), aquí el dolor es inmediato (perdiste el contrato).

### 8.6. Implicación para el informe

El informe debe tener un modo **"ENS Medio"** y **"ENS Alto"** en español, mapeado a las 75 medidas del ENS organizadas en marco de gestión, marco operacional y medidas de protección. La medida específica de gestión de vulnerabilidades es **op.exp.4 (Mantenimiento) y op.exp.5 (Gestión de cambios)** dentro del marco operacional.

### 8.7. Mensaje de venta ENS

> "Si trabajas con la Administración Pública española, ENS Medio o Alto te exige gestión continua de vulnerabilidades documentada. Sin esto, no puedes licitar y tus contratos actuales pueden rescindirse. VulnRadar te genera el informe que pide la auditoría ENS cada 2 años, en automático y por menos del 1% de lo que pagas en consultoría."

---

## 9. ISO 27001:2022 — Anexo A 8.8

> **Voluntario pero muy demandado. Mercado internacional, no requiere localización por país.**

### 9.1. Qué es ISO 27001

**ISO/IEC 27001:2022** es el estándar internacional para Sistemas de Gestión de Seguridad de la Información (SGSI). Voluntario, certificable.

- **Última versión**: 2022 (la versión 2013 quedó obsoleta el 31 de octubre de 2025).
- **Quién certifica**: entidades de certificación acreditadas (AENOR, BSI, Bureau Veritas, etc.).
- **Validez**: 3 años con auditorías anuales de seguimiento.

### 9.2. Por qué importa el control A.8.8

El Anexo A 8.8 — **"Management of Technical Vulnerabilities"** — exige textualmente:

> "La organización obtendrá información sobre las vulnerabilidades técnicas de los sistemas de información en uso, evaluará su exposición a dichas vulnerabilidades y tomará las medidas apropiadas."

Lo que el auditor pide ver:

- **Política documentada** de gestión de vulnerabilidades con SLAs (típicamente: crítica en 14 días, alta en 30 días).
- **Inventario de activos** mantenido y actualizado.
- **Escaneos periódicos** (mensuales o más frecuentes para sistemas internet-facing).
- **Priorización por CVSS** documentada.
- **Evidencia de cierre** de vulnerabilidades cross-referenced contra los SLAs.
- **Audit trail** de actividades de gestión de vulnerabilidades.

**Tu producto produce todo esto en automático**.

### 9.3. A quién afecta

ISO 27001 es voluntario, pero en la práctica **lo exige el mercado**:

- Cualquier startup B2B que venda a corporaciones.
- Fintechs y proveedores de pagos.
- Proveedores SaaS con clientes enterprise.
- Empresas que quieren licitar con grandes corporaciones (no solo AAPP).
- Consultoras que quieren credibilidad.

### 9.4. Tamaño del mercado ISO 27001

En España hay miles de empresas certificadas en ISO 27001. En Luxemburgo (mercado financiero) la certificación es prácticamente obligatoria de facto para proveedores ICT serios.

**Característica importante**: ISO 27001 es **internacional**. Tu producto sirve igual en España, Luxemburgo, Francia, Alemania. Mensaje uniforme. **No requiere localización por país** (salvo idioma del informe, que con plantilla en EN ya cubre la mayoría del mercado).

### 9.5. Por qué ISO 27001 es relevante para VulnRadar

1. **Mercado más grande que NIS2 fuera de los sectores críticos**: cualquier startup B2B ambiciosa lo persigue.
2. **Driver de compra claro**: "el cliente nos lo exige para firmar el contrato".
3. **Los compradores son técnicos**, entienden el producto sin necesidad de educar en regulación.
4. **Mensaje uniforme UE**, no requiere transposición local.
5. **Compatible con NIS2, ENS, CRA, DORA**: es el "common denominator". Una empresa puede usar VulnRadar para varios de estos a la vez.

### 9.6. Implicación para el informe

El informe debe tener un modo **"ISO 27001 A.8.8 Evidence"** en EN/ES, mapeado a los criterios de auditoría que cita el Anexo A 8.8.

### 9.7. Mensaje de venta ISO 27001

> "Si tu cliente corporativo te pide ISO 27001, el control A.8.8 sobre gestión de vulnerabilidades es uno de los más complicados de evidenciar. Necesitas escaneos periódicos documentados, priorización por CVSS, SLAs de remediación y evidencia de cierre. VulnRadar te lo da todo en automático, listo para el auditor."

---

## 10. Posicionamiento multi-norma — la oportunidad real

VulnRadar resuelve un problema técnico (gestión de vulnerabilidades de software instalado o de componentes de producto) que **múltiples normativas exigen** con matices distintos. La consecuencia estratégica es:

### 10.1. Mensaje de cabecera revisado

**Antes**: "Qualys low-cost para PyMEs europeas obligadas por NIS2."

**Ahora**: "Gestión de vulnerabilidades automatizada para PyMEs europeas. Cumple los requisitos técnicos de NIS2, CRA, ENS e ISO 27001. Desde 49€/mes."

### 10.2. Sistema de plantillas de informe

Diseña el informe **desde el principio como sistema de plantillas**, no como un PDF estático único:

| Plantilla | Audiencia | Campos clave del mapeo |
|---|---|---|
| **NIS2 Art. 21.2.e** | Obligados NIS2 | Cumplimiento de gestión y divulgación de vulnerabilidades del Artículo 21 |
| **CRA Art. 14** | Fabricantes | SBOM + vulnerabilidades activamente explotadas + soporte declarado |
| **ENS Medio / Alto** | Proveedores AAPP España | Medidas op.exp.4 y op.exp.5 + cumplimiento por nivel |
| **ISO 27001 A.8.8** | Empresas certificadas | Política, escaneos, priorización CVSS, SLAs, evidencia cierre |

El motor técnico es **el mismo** (matching CPE/purl contra NVD/KEV/EOL/OUTDATED). Lo que cambia es el frontend del informe.

### 10.3. Pool de prospects multiplicado

En las primeras conversaciones de validación, no preguntes solo por NIS2. Aplica este filtro en orden:

1. ¿Eres mediana o grande en sector NIS2? → **NIS2** (5.700 + 6-8K)
2. ¿Vendes producto digital al mercado UE? → **CRA** (sin tamaño mínimo, decenas de miles)
3. ¿Licitas con la Administración Pública española? → **ENS** (decenas de miles)
4. ¿Tienes o quieres certificación ISO 27001? → **ISO A.8.8** (miles)
5. ¿Eres proveedor ICT del sector financiero? → **DORA indirecto + NIS2** (especialmente Luxemburgo)

Si responde "sí" a cualquiera de las 5, eres prospect viable. Si responde "sí" a varias, mejor: presupuesto multiplicado.

### 10.4. TAM combinado revisado

Reemplaza la cifra de "1,25M empresas afectadas en UE" del `product/product.md` actual por algo más realista y útil:

| Vector | Mercado (España + Luxemburgo) | Comentario |
|---|---|---|
| NIS2 directo | ~12K | Cifra oficial combinada |
| NIS2 indirecto (proveedores) | 30-50K | Estimación de orden de magnitud |
| CRA (fabricantes) | Decenas de miles | Sin tamaño mínimo |
| ENS | Decenas de miles | Solo España, pero masivo |
| ISO 27001 | Miles | España + Luxemburgo combinado |

**Pool razonable de prospects técnicamente viables**: del orden de **100K empresas** entre ambos países, con solapamientos. Captar 0,5% en 3 años (500 clientes) = 294K€ ARR a precio Starter.

---

## 11. Las 10 medidas del Artículo 21 NIS2 (referencia técnica)

> Esto es lo que el cliente NIS2 tendrá que demostrar al auditor (ILR, CSSF, INCIBE, según país y sector). Tu informe NIS2 PDF debe cubrir estos puntos.

1. Políticas de **análisis de riesgos** y de seguridad de los sistemas de información.
2. **Gestión de incidentes** (prevención, detección, respuesta).
3. **Continuidad del negocio**, gestión de copias de seguridad, recuperación ante desastres.
4. **Seguridad de la cadena de suministro**.
5. Seguridad en la **adquisición, desarrollo y mantenimiento** de redes y sistemas, incluyendo **gestión y divulgación de vulnerabilidades**.
6. Políticas y procedimientos para **evaluar la eficacia** de las medidas.
7. **Prácticas básicas de ciberhigiene y formación**.
8. Políticas de **criptografía** y, en su caso, cifrado.
9. **Seguridad de los recursos humanos**, control de acceso, gestión de activos.
10. **Autenticación multifactor** o continua, comunicaciones seguras, sistemas seguros de comunicación de emergencia.

**Tu producto cubre directamente los puntos 1, 2 y 5**. Específicamente el punto 5 es **textualmente lo que hace VulnRadar**.

Mensaje de venta limpio:
> "Este informe documenta el cumplimiento del Artículo 21.2.e de la Directiva (UE) 2022/2555: gestión y divulgación de vulnerabilidades."

---

## 12. Competencia y posicionamiento

### 12.1. España

- **Tenable, Qualys, Rapid7**: enterprise. Fuera del rango de la PyME.
- **Wazuh**: open source. Gratis pero requiere conocimiento técnico.
- **Audidat, EQA, ISEC Auditors, S2 Grupo, Entelgy**: consultoras locales que venden auditorías 3-8K€ puntuales. **Canal, no competencia**. Viven principalmente del ENS.
- **Edorteam, Delbion**: consultoras de adecuación NIS2. Aliados.
- **Plataformas de compliance generalista** (Audidat plataforma, Factorial IT): cubren papeleo, no detección técnica. Complementarios.

### 12.2. Luxemburgo

- **Big Four (Deloitte, PwC, EY, KPMG)**: presencia masiva. Servicios NIS2/DORA a 5-figure mensual o por proyecto. **No competencia directa** (rango de precio distinto), pero **referente mental del cliente**.
- **Telindus**: integrador local fuerte. Vende SOC/MDR. Posible canal para revender si tu producto encaja en su catálogo.
- **POST Cyberforce**: división de ciberseguridad de POST Luxembourg. MSP grande. Posible canal.
- **EBRC** (European Business Reliance Centre): proveedor de cloud y servicios gestionados. Otro posible canal.
- **Excellium / NRB**: consultoras medianas con foco en compliance y SOC.
- **Boutiques especializadas**: aparecen muchas con foco en CSSF + NIS2. Suelen ser 2-10 personas, exactamente el perfil que podría revender VulnRadar.

### 12.3. Posicionamiento por país

**España**: "Lo que el consultor archiva en un PDF muerto, VulnRadar te lo mantiene vivo cada mes por menos del 1% del coste de la consultoría. Cumple NIS2, ENS e ISO 27001 con un solo informe."

**Luxemburgo**: "VulnRadar complementa tu adecuación NIS2 con gestión continua de vulnerabilidades. Es el módulo técnico que falta entre la auditoría anual y la herramienta enterprise. Compatible con ILR, MONARC, requisitos del Artículo 21.2.e y cláusulas DORA Art. 30."

Notar la diferencia de tono: en España se vende ahorro vs consultora; en Luxemburgo se vende complementariedad con consultora (porque la consultora ya está pagada).

---

## 13. Riesgos del mercado

### 13.1. Riesgos comunes a todos los vectores

- **Multas reales no se materializan**: si los reguladores no multan visiblemente, la urgencia se evapora. Mitigación: posicionar como "ciberseguridad básica" más allá de regulación, y diversificar entre 4 vectores reduce dependencia de uno solo.
- **Cliente confunde normativas**: las PyMEs mezclan RGPD, NIS2, ENS, ISO. Necesario mensaje educativo claro.
- **Competidor low-cost antes de validar**: Audidat ya tiene "Experta IA NIS2"; en Luxemburgo Big Four pueden lanzar producto de menor precio. Velocidad en ejecución.

### 13.2. Riesgos específicos por vector

**NIS2**:
- Transposición lenta = urgencia diluida.
- En España, fragmentación geográfica por CCAA.

**CRA**:
- Mercado nuevo, todavía sin best practices establecidas. Riesgo de desviarte construyendo features que el regulador acabe no exigiendo.
- Plazo de 11 sept 2026 puede ser revisado. Si se retrasa, urgencia se diluye.
- Open source stewards y fabricantes pequeños no están seguros de si les aplica → confusión.

**ENS**:
- Solo España, no escala a Luxemburgo.
- Sector competido por consultoras grandes.

**ISO 27001**:
- Voluntario → no hay urgencia regulatoria.
- Cliente típico es más sofisticado técnicamente y puede tener herramientas internas o usar Wazuh.

**DORA (indirecto)**:
- Requiere educar al cliente sobre la diferencia DORA / NIS2 / proveedor ICT. Más fricción.

### 13.3. Riesgos específicos España vs Luxemburgo

Idénticos a los descritos en sección 5. No se repiten aquí.

---

## 14. Acciones concretas para tu plan

### 14.1. Para hablar con los primeros prospects (Fase 0)

**Marco común:**
- No empieces por una norma concreta. Empieza por "¿sabes qué software tienes vulnerable hoy?". La regulación es el cierre, no la apertura.
- Aplica el filtro de 5 preguntas (sección 10.3) para clasificar al prospect en uno o varios vectores.
- Pregunta cuánto pagaron por su última consultoría de ciberseguridad. Si pagaron 5-8K€, sabes que el presupuesto existe.

**España específico:**
- Empezar por Madrid + Cataluña + País Vasco.
- Sectores prioritarios: MSPs, salud (clínicas medianas), manufactura mediana, fabricantes de software vertical (CRA), proveedores de AAPP (ENS).
- Mensaje: "No esperes al BOE, cuando salga será tarde."

**Luxemburgo específico (si decides explorarlo en paralelo)**:
- Aprovechar que estás físicamente ahí. **Eventos clave**: Cybersecurity Week Luxembourg, ICT Spring, eventos del CLUSIL.
- Sectores prioritarios: MSPs locales (Telindus partners, EBRC partners), proveedores TIC del financiero, fundaciones de investigación, fabricantes de software vertical (CRA).
- Mensaje: "Complemento técnico al servicio de adecuación NIS2 que ya estás contratando, con cobertura de cláusulas DORA Art. 30 si tu cliente es financiero."
- **No vender directamente al sector financiero grande**: están saturados con DORA y Big Four.

### 14.2. Cambios sugeridos en `product/product.md`

1. **Reemplazar la cifra "1,25M empresas afectadas en UE"** por la tabla multi-vector de la sección 10.4.
2. **Cambiar el "para qué sirve"**: VulnRadar cubre NIS2 + CRA + ENS + ISO 27001 técnicamente, no solo NIS2.
3. **Subir MSPs a prioridad #1** (obligados directos por Anexo I sector 9).
4. **Bajar "energía descentralizada"** — instaladores fotovoltaicos no entran directamente.
5. **Añadir** "fabricantes de software vertical" como segmento CRA.
6. **Añadir** "proveedores de AAPP" como segmento ENS.
7. **Reordenar geografía**: España como mercado primario; Luxemburgo como mercado secundario complementario.
8. **Añadir explícitamente "Cumple NIS2 Art. 21.2.e, CRA Art. 14, ENS op.exp.4-5 e ISO 27001 A.8.8"** en pricing y copy.

### 14.3. Cambios sugeridos en el informe (cuando lo construyas)

- **Diseñar como sistema de plantillas**, no como PDF único. Las 4 plantillas:
  - NIS2 Art. 21.2.e (ES)
  - CRA Art. 14 (ES + EN)
  - ENS Medio / Alto (ES)
  - ISO 27001 A.8.8 (ES + EN)
- Cada plantilla cita la norma concreta + apartado + texto exacto del control.
- Reconocer honestamente lo que el cliente sigue necesitando para cumplir el resto de la norma → abre puerta a partnerships con consultoras.

### 14.4. Pregunta clave del cliente real

> "¿Esto me sirve para pasar la inspección / auditoría / certificación?"

Respuesta honesta:
> "Sirve para cumplir el control técnico de gestión de vulnerabilidades, que es uno de los obligatorios. Para los otros vas a necesitar otras cosas, pero este es el más técnico y el que más cuesta tener al día. Si lo tienes con nosotros, te quitamos un tercio del trabajo del auditor."

---

## 15. Resumen ejecutivo en 10 frases

1. NIS2 está en vigor a nivel UE desde enero 2023 pero **ni España ni Luxemburgo la han transpuesto** todavía en mayo 2026; ambos países tienen **dictamen motivado** de la Comisión Europea.
2. **5.700 empresas españolas** y **6-8K luxemburguesas** están en alcance directo de NIS2.
3. **CRA aplica desde sept 2026** sin tamaño mínimo a cualquier fabricante de producto digital UE — abre un mercado de decenas de miles que NIS2 deja fuera.
4. **ENS es obligatorio en España** para licitar con AAPP — decenas de miles de empresas afectadas, mercado adyacente sin competencia low-cost.
5. **ISO 27001 A.8.8** es voluntario pero el mercado lo exige; mercado universal sin necesidad de localización.
6. **DORA no es tu mercado pero genera demanda lateral** sobre proveedores ICT del financiero, especialmente en Luxemburgo.
7. Pool de prospects técnicamente viables en España + Luxemburgo: del orden de **100K empresas** sumando vectores, vs los 12K de NIS2 directo.
8. Tu producto cubre **literalmente los controles técnicos** de los 4 vectores principales con el mismo motor; el trabajo extra es de plantilla, no de motor.
9. **Recomendación de fasado**: España como mercado primario para validación; Luxemburgo como mercado secundario que se abre formalmente solo tras 10 clientes pagando en España.
10. **El riesgo principal no es de mercado** sino de timing y dispersión: si pierdes 3 meses haciendo material en 3 idiomas y 4 plantillas perfectas en lugar de tener 5 conversaciones reales en español con prospects en Madrid, pierdes la ventana. Fase 0 ya, en español, en España, con el mensaje multi-norma como ventaja narrativa pero un único informe en MVP.
