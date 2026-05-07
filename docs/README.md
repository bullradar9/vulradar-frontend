# VulnRadar EU — Documentación

> **Para qué sirve este documento.** Es el punto de entrada. En 5 minutos sabes qué es VulnRadar, en qué punto está, y a dónde ir según lo que necesites.

---

## Qué es VulnRadar EU

Plataforma SaaS de gestión de vulnerabilidades y compliance NIS2 para PyMEs europeas.

**En una frase**: el "Qualys low-cost" para empresas que no pueden pagar las herramientas enterprise.

**Cliente objetivo**: PyMEs de 50 a 500 empleados en sectores afectados por NIS2 (manufactura, salud, energía, transporte, banca, MSPs, asesorías).

**Propuesta de valor para el cliente final**:
1. Saber qué software tienes vulnerable, sin tener que entender de ciberseguridad.
2. Generar el informe NIS2 que pide el auditor, en español, automáticamente.
3. Instalación en 5 minutos, precio entre 49€ y 299€/mes.

---

## Cómo está montado el sistema (vista de pájaro)

```
[Cliente]                       [Nuestra infra]                [Externo]

Frontend cliente  ─────►  Backend (APIs + BD)  ─────►   NVD, CISA KEV,
                                  ▲                       endoflife.date,
                                  │                       vendor RSS
Frontend admin    ─────►          │
                                  │
Agente endpoint   ─────►          │
(opcional)
```

**3 componentes principales:**
- **Frontends** (cliente y admin) — construidos con Lovable.
- **Backend** — consulta APIs externas y cruza con base de datos propia.
- **Agente endpoint** — Go + Grype, lee software instalado y enriquece la plataforma con inventario real.

Los detalles de cada componente están en `tech/`.

---

## Cómo navegar esta documentación

### Si vienes a entender el negocio
- [`product/product.md`](./product/product.md) — visión, mercado, pricing, GTM.

### Si vienes a entender la tecnología
- [`tech/architecture.md`](./tech/architecture.md) — vista de pájaro técnica.
- [`tech/agent.md`](./tech/agent.md) — el agente Go.
- [`tech/scan-processor.md`](./tech/scan-processor.md) — el backend.
- [`tech/frontends.md`](./tech/frontends.md) — los frontends Lovable.
- [`tech/database.md`](./tech/database.md) — BD y schema.
- [`tech/data-sources.md`](./tech/data-sources.md) — de dónde sacamos los datos de vulnerabilidades.
- [`tech/deployment.md`](./tech/deployment.md) — cómo se despliega.

### Si vienes a operar el sistema
- [`runbook.md`](./runbook.md) — cómo desplegar, qué hacer cuando se rompe algo.

### Si te encuentras un término que no conoces
- [`glossary.md`](./glossary.md) — diccionario.

### Si te preguntas "¿por qué hicimos esto así?"
- [`decisions.md`](./decisions.md) — registro de decisiones técnicas (ADRs).

### Si quieres saber qué falta y qué viene
- [`roadmap.md`](./roadmap.md) — estado actual y próximos pasos.

### Si buscas material antiguo
- [`archive/`](./archive/) — versiones anteriores de la documentación, análisis previos. No es fuente de verdad, está aquí solo para consulta histórica.

---

## Reglas para mantener esta documentación viva

1. **Esta documentación es la fuente de verdad.** Si lo que está aquí difiere de la realidad del código, **arregla la documentación**, no las cabezas de quienes la leen.

2. **Cada decisión técnica importante se añade a `decisions.md`** con su razón. No se reescribe lo viejo, se añade lo nuevo.

3. **Cada término que aparece y no está en `glossary.md` se añade.** Da igual que parezca obvio para quien lo escribe.

4. **`tech/` es factual** ("esto es lo que existe hoy"). **`product/` puede ser aspiracional** ("a esto queremos llegar"), pero claramente etiquetado.

5. **El Project de Claude es un espejo selectivo de esta carpeta**, no una segunda fuente de verdad. Cuando se actualiza algo aquí, se sube la versión nueva al Project.

---

## Estado actual del proyecto

> Para el detalle, ver [`roadmap.md`](./roadmap.md).

- **MVP desplegado** con 0-2 usuarios probando.
- **Equipo**: 2 personas trabajando a tiempo parcial.
- **Prioridad inmediata**: validación con clientes potenciales antes de seguir construyendo.
