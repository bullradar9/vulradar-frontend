# VulnRadar EU — Producto y Negocio

> **Para qué sirve este documento.** Captura la visión del producto, a quién se vende, cómo se diferencia y cómo se monetiza. Tono **aspiracional pero responsable**: describe a dónde queremos ir, no inventa métricas que aún no tenemos.

---

## 1. Visión

VulnRadar EU es la plataforma que permite a una PyME europea cumplir con NIS2 sin necesidad de un equipo de ciberseguridad y sin pagar herramientas enterprise.

**En una frase**: "Qualys low-cost para PyMEs europeas obligadas por NIS2".

**En una frase para el cliente final** (que no conoce Qualys): "Detectamos qué software tienes vulnerable y generamos el informe NIS2 que te pide el auditor, por menos de lo que cuesta una cena al mes."

---

## 2. El problema que resolvemos

### NIS2 obliga, pero las herramientas existentes no encajan con la PyME

La directiva europea NIS2 (vigente desde octubre 2024, transposiciones nacionales en curso) obliga a empresas en sectores críticos a:
- Implementar medidas de gestión de riesgos cibernéticos.
- Notificar incidentes en plazos estrictos (24h).
- Demostrar compliance ante auditoría.
- Pagar multas (hasta 10M€ o 2% facturación global) si no cumplen.

El alcance es masivo: incluye PyMEs, no solo grandes. Cientos de miles de empresas en España, Italia, Francia, Alemania, etc.

**Pero las herramientas existentes no son una opción para una PyME**:

| | Empresa grande (Tenable, Qualys, Rapid7) | PyME |
|--|----|----|
| Presupuesto | 15-200K€/año | Muy limitado |
| Personal TI | Equipo de 5-50 | 0-1 personas, a menudo externalizado |
| Conocimiento técnico | Alto | Bajo o nulo |
| Tiempo para configurar | Semanas con consultores | Cero |
| Tipo de informe necesario | Técnico y detallado | Para gerente, en español, accionable |

**Conclusión**: hoy, la mayoría de PyMEs europeas hace **nada** en gestión de vulnerabilidades. Saben que tienen que cumplir NIS2 pero no saben cómo.

---

## 3. Nuestra solución

### El producto en una frase

Un SaaS web de detección de vulnerabilidades + generador de informes NIS2, con agente endpoint opcional, instalable en 5 minutos sin conocimientos técnicos, desde 49€/mes.

### Cómo funciona

**Sin agente endpoint** (entrada más sencilla):
1. El cliente declara su stack (sistema operativo, software principal) en el frontend.
2. La plataforma cruza ese stack con feeds externos (NVD, CISA KEV, vendor advisories) y nuestra base de datos.
3. Genera dashboard de alertas priorizadas y descarga del informe NIS2.

**Con agente endpoint** (más completo):
1. El cliente instala el agente Go en sus equipos Windows.
2. El agente lee el software realmente instalado y lo reporta a la plataforma.
3. La plataforma cruza el inventario real con threat intelligence y prioriza con precisión quirúrgica.
4. Mismo dashboard + informe NIS2, pero con datos verificados, no declarados.

### Cómo se vende

1. Dueño de PyME oye hablar de NIS2 (o recibe carta de su asesor).
2. Pregunta a Google "cumplir NIS2 sin gastar miles de euros".
3. Encuentra nuestra web.
4. Se registra, declara su stack o instala el agente.
5. En 30 minutos tiene dashboard con alertas + informe PDF.
6. Empieza a pagar mensualmente.

### Cómo nos diferenciamos

**No nos diferenciamos en el motor técnico** (Grype, NVD, CISA KEV son los mismos datos que usa todo el mundo).

Nos diferenciamos en:

1. **Precio**: 49-299€/mes vs 5.000-15.000€/mes de Tenable/Qualys.
2. **Idioma**: español primero, traducido a lenguaje no-técnico.
3. **Informe NIS2 automático**: el cliente solo descarga el PDF que necesita el auditor.
4. **Onboarding sin fricción**: sin agente, en 5 minutos. Con agente, en 30.
5. **Localización europea**: datos en UE, marketing claro de cumplimiento GDPR/NIS2.

---

## 4. Mercado objetivo

### Tamaño potencial

- ~25 millones de PyMEs en la UE.
- Estimación conservadora: 5% afectadas por NIS2 directamente o como proveedores = ~1,25 millones de empresas.
- Captar 0.1% en 3 años → 1.250 clientes × 49€/mes × 12 = ~735.000€ ARR.
- Captar 1% en 5 años → 12.500 clientes × 49€/mes × 12 = ~7,3M€ ARR.

> Estas cifras son **proyecciones**, no validaciones. Antes de invertir en escalar hace falta confirmar product-market fit con los primeros 10 clientes pagando.

### Sectores prioritarios para enfocar primero

1. **Asesorías y gestorías** (recomiendan a sus clientes y son canal indirecto).
2. **MSPs pequeños** (revenden a sus PyMEs, multiplican el alcance).
3. **Industria manufacturera mediana** (sujetos directos a NIS2, dolor claro).
4. **Salud** (clínicas, laboratorios pequeños).
5. **Energía descentralizada** (instaladores fotovoltaicos, etc.).

### Geografía

Por orden de prioridad:

1. **España**: mercado natural, idioma nativo, presencia de equipo.
2. **Italia y Portugal**: mercados similares culturalmente, baja competencia.
3. **Francia**: mercado grande, requiere localización completa.
4. **Alemania**: mercado más grande pero requiere madurez del producto y referencias.

> **Nota estratégica**: en una primera fase nos enfocamos solo en España. Abrir más países sin haber validado en uno es el error clásico de proyectos bootstrapped.

---

## 5. Modelo de pricing (propuesta inicial, sujeta a validación)

| Tier | Precio | Equipos / Assets | Features |
|------|--------|------------------|----------|
| **Free** | 0€/mes | 3 | Escaneo básico, sin informe NIS2 |
| **Starter** | 49€/mes | hasta 25 | Todo lo básico + informe NIS2 mensual |
| **Pro** | 99€/mes | hasta 100 | + Alertas email + soporte prioritario |
| **Business** | 299€/mes | hasta 500 | + Multi-sede + API |
| **Enterprise** | A medida | Ilimitado | + SSO + SLA |

**Punto de entrada esperado**: tier Starter a 49€/mes.

> **Importante**: estos precios son hipótesis. Los primeros pilotos confirmarán o ajustarán los tramos. No casarse con esta estructura antes de tener feedback real.

---

## 6. Estrategia Go-To-Market

### Fase 0 — Validación (estado actual)

**Antes de invertir más en construcción**, conseguir 5-10 conversaciones con clientes potenciales reales (no contactos teóricos):
- 2-3 IT managers de PyMEs sector NIS2.
- 2-3 asesorías o MSPs que ya tratan con PyMEs.
- 1-2 CISOs de mid-market que confirman que Tenable/Qualys les queda grande.

**Objetivo**: validar que el dolor es real, que pagarían por la solución, y a qué precio.

**Criterio de salida**: al menos 1 PyME con compromiso firme de probar el producto.

### Fase 1 — Pilotos (siguientes 3 meses tras validación)

- 3-5 pilotos gratuitos (3-6 meses gratis a cambio de feedback honesto).
- Documentar todo el feedback en `docs/sales-notes.md` (a crear cuando llegue el momento).
- Construir lo que falta del producto **basado en los pilotos**, no en suposiciones.

### Fase 2 — Primeros pagos (meses 4-6 tras validación)

- Convertir 2-3 pilotos en clientes pagando (49€/mes).
- Lanzar landing page con casos de éxito reales.
- Empezar contenido educativo sobre NIS2 (LinkedIn, blog).
- Objetivo: 10 clientes pagando.

### Fase 3 — Tracción inicial (meses 7-12)

- Partnership con 2-3 asesorías que recomienden a sus clientes.
- Asistir a 2-3 eventos de pequeñas empresas.
- Empezar marketing digital de pago si la unit economics lo permiten.

### Fase 4 — Escalado (a partir del año 1)

- Considerar apertura a Italia/Portugal.
- Considerar tier Pro y Business.
- Considerar canal indirecto (MSPs como revendedores).

---

## 7. Ventajas competitivas defendibles (a construir)

### Foso 1: Tabla curada de software europeo
Los productos verticales (gestores de farmacia, ERPs sectoriales, software de notarías) no aparecen en herramientas internacionales. Conforme acumulamos clientes, nuestra tabla cubre más software vertical europeo, lo que mejora cobertura y valor para el siguiente cliente.

### Foso 2: Informe NIS2 perfeccionado con auditores reales
Los primeros 20 clientes nos enseñarán qué quiere ver un auditor NIS2 español. Eso pasa al PDF y se vuelve diferenciador defendible.

### Foso 3: Onboarding instantáneo
Mientras Tenable requiere días de consultor para configurar, nosotros tenemos al cliente generando alertas en 30 minutos. Esto es UX que cuesta meses replicar.

### Foso 4: Precio agresivo
Una vez tenemos volumen, los costes marginales son bajos. Una empresa enterprise no puede bajar a 50€/mes sin canibalizar su negocio principal.

### Foso 5: Canal indirecto vía asesorías y MSPs
Construir relaciones con asesorías locales que recomiendan a sus clientes es lento pero defensible: una vez la relación está establecida, otros competidores tienen que romperla.

---

## 8. Riesgos del negocio

### Riesgo 1: La PyME no entiende NIS2
**Mitigación**: marketing educativo. Posts, webinars, partnerships con asesorías que ya hablan con PyMEs.

### Riesgo 2: NIS2 no se ejecuta con multas reales
Si los gobiernos europeos no multan, la presión desaparece y nadie compra.
**Mitigación**: posicionarse también como "ciberseguridad básica para PyMEs", independiente de NIS2. La propuesta de valor de saber qué tienes vulnerable existe sin la regulación.

### Riesgo 3: Microsoft/Google lanzan algo gratis
**Mitigación**: lo gratis casi siempre es genérico y mal localizado. Foco en español + informe NIS2 + soporte.

### Riesgo 4: Clientes se dan de baja al primer scan limpio
Si un cliente arregla las alertas iniciales y se da de baja, churn alto.
**Mitigación**: los CVE/EOL nunca se acaban — siempre hay nuevas vulnerabilidades, software que llega a EOL, versiones que se vuelven obsoletas. El recordatorio mensual del informe NIS2 (que el auditor pide cada año) ancla la suscripción.

### Riesgo 5: Equipo bootstrapped a tiempo parcial
Velocidad de ejecución limitada. Riesgo de que un competidor con más recursos llegue antes a un nicho donde no estamos plantando bandera.
**Mitigación**: priorización brutal. No construir lo que no genera ventas. Mantener alcance pequeño y profundo en lugar de amplio y superficial.

---

## 9. Métricas que importan

### Métricas de producto (cuando haya usuarios)
- **Tiempo de instalación del agente** — objetivo: <5 minutos.
- **Tiempo de primer scan** — objetivo: <30 minutos desde registro.
- **Falsos positivos reportados** — objetivo: <5%.
- **Cobertura de detección** — objetivo: >60% de software con CPE.

### Métricas de negocio
- **MRR / ARR**.
- **Churn mensual** — objetivo: <5%.
- **CAC** — objetivo en 6 meses: <100€.
- **LTV** — objetivo: >12 meses, >600€.
- **Ratio LTV/CAC** — objetivo: >6.

### Métricas de validación (las que importan AHORA)
- **Conversaciones reales con prospects en último mes** — objetivo inmediato: 5.
- **Prospects que confirman dolor** — objetivo: 3+ de cada 5.
- **Pilotos comprometidos** — objetivo en 4 semanas: 1+.

---

## 10. La pregunta clave para hoy

**¿Tenemos ya 1 PyME comprometida a probar el producto?**

- **Si sí**: el siguiente paso es construir el frontend mínimo + PDF NIS2 e instalar en sus equipos.
- **Si no**: dedicar 1-2 semanas a buscar 1 antes de seguir construyendo. El feedback del primer cliente real vale más que 3 meses de desarrollo en abstracto.

> Esta pregunta se mantiene en la cabeza del equipo. Cada decisión de roadmap pasa por aquí: ¿esto nos acerca al primer cliente o nos aleja?
