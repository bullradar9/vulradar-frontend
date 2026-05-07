# Roadmap

> **Para qué sirve este documento.** Captura dónde está el proyecto exactamente hoy y qué viene después. Se actualiza conforme avanza el desarrollo.
>
> **Filosofía**: sin fechas concretas (porque las fechas mienten en proyectos a tiempo parcial). En su lugar, **criterios de "hecho"** para cada bloque, así se sabe cuándo pasar al siguiente.

---

## Estado actual (hoy)

- **MVP funcional desplegado** con 0-2 usuarios probando.
- **Equipo**: 2 personas trabajando a tiempo parcial.
- **Pista financiera**: larga económicamente (otro trabajo cubre necesidades), pero existe presión competitiva.
- **Bloqueante principal**: cero conversaciones de validación con clientes potenciales reales todavía.

### Lo que existe y funciona end-to-end

- **Agente Go** (`agent.exe`): lee software del registro Windows, genera SBOM CycloneDX 1.5, lo envía al backend. Validado con métricas reales: 84 paquetes detectados, 12 con CPE válido, 93 alertas generadas.
- **Scan Processor** (Node.js + TypeScript + Fastify): recibe SBOMs, ejecuta pipeline de 3 pasos (CVE/EOL/OUTDATED), persiste alertas. Desplegado en Railway EU West (Amsterdam).
- **Base de datos** (Supabase Frankfurt): schema completo con multi-tenancy via RLS, datos reales (devices, scans, alertas).
- **Fuentes externas integradas**: Grype + NVD local, endoflife.date, CISA KEV.
- **Frontends Lovable**: dashboards cliente y admin conectados a Supabase. Distribución del agente integrada (descarga `agent.exe` + `config.yaml` por tenant).

### Lo que falta para el primer cliente

- **Validación comercial** (cero conversaciones documentadas con prospects reales).
- **Generación del informe NIS2 en PDF** (diferenciador clave del producto).
- **Code signing del agent.exe** (~$200/año, evita SmartScreen).
- **Auth real en frontend** (migrar fuera de `service_role_key`).
- **Cron jobs automáticos** para sincronizar fuentes externas.
- **Caché de endoflife.date** para no depender de la API en cada scan.

### Lo que falta para los primeros 5 clientes

- **HMAC firmado** entre agente y procesador.
- **`grype db update` automático** (hoy solo en build-time).
- **Crecimiento de la tabla curada** (35 → 100+ productos).
- **Política de privacidad pública** y DPA template.

---

## Fases del roadmap

### 🛑 Fase 0 — Validación comercial (BLOQUEANTE)

**Por qué es bloqueante**: cualquier desarrollo adicional sin validación de cliente es construir a ciegas. El error #1 a evitar es perfeccionar el producto antes de tener gente dispuesta a pagar.

**Tareas:**
- [ ] Lista de 10 prospects concretos (nombre y apellidos, no perfiles teóricos).
- [ ] 5 conversaciones de 30 min con prospects reales.
- [ ] Documentar feedback en `docs/sales-notes.md` (a crear).
- [ ] Identificar al menos 1 PyME comprometida a probar el producto.

**Criterio de "hecho":** ≥3 de 5 prospects confirman dolor real + ≥1 acepta probar el producto en las próximas 4 semanas.

**Si no se cumple:** replantear producto o cliente objetivo. No saltar a la siguiente fase.

---

### 🧹 Fase 0.5 — Limpieza y orden interno (en paralelo a Fase 0)

**Por qué ahora**: estás haciendo las conversaciones de validación y el desarrollo está parado. Es el momento perfecto para arreglar la casa.

**Tareas:**
- [x] Estructura de `docs/` definida.
- [x] Documentación al día (`README.md`, `glossary.md`, `product/product.md`, todos los `tech/*.md`, `decisions.md`, `roadmap.md`, `runbook.md`).
- [ ] Inventario del repositorio: lista de scripts, qué hace cada uno, si funciona, si se usa.
- [ ] Decidir qué se conserva, qué se mueve a `archive/`, qué se borra.
- [ ] Repo del agente subido a GitHub (hoy solo está en local).
- [ ] Convenciones básicas de Git para 2 personas (ramas, commits, revisión).

**Criterio de "hecho":** cualquier persona nueva (incluido un Claude nuevo) puede leer el README + arquitectura y entender el sistema en 15 minutos.

---

### 🎯 Fase 1 — Pilotos (después de Fase 0)

**Solo arrancar si**: hay ≥1 PyME comprometida a probar.

**Tareas:**
- [ ] Generar el informe NIS2 en PDF (mínimo viable, plantilla básica del Artículo 21).
- [ ] Code signing del `agent.exe` (~$200/año).
- [ ] Auth real en frontend (Supabase Auth + JWT con `tenant_id`).
- [ ] Cron jobs automáticos:
  - `sync-cisa-kev` diario.
  - `sync-software-versions` diario.
  - `grype db update` diario (con rebuild Docker).
- [ ] Onboarding del piloto (instalación, configuración, primer scan).
- [ ] Soporte directo del piloto (canal de comunicación abierto, feedback semanal).

**Criterio de "hecho":** 3 pilotos activos generando alertas reales y compartiendo feedback semanal documentado.

---

### 💰 Fase 2 — Primeros pagos

**Solo arrancar si**: ≥2 pilotos están dispuestos a pagar y ≥1 ya ha pagado.

**Tareas:**
- [ ] Cerrar pricing definitivo (DP001 en `decisions.md`).
- [ ] Implementar facturación (Stripe).
- [ ] HMAC firmado entre agente y procesador.
- [ ] Caché de endoflife.date en Supabase (TTL 24h).
- [ ] Landing page con caso de éxito real (no inventado).
- [ ] Contenido educativo NIS2 (1 post quincenal en LinkedIn como mínimo).
- [ ] Política de privacidad pública.

**Criterio de "hecho":** 5 clientes pagando con churn 0 a los 3 meses.

---

### 📈 Fase 3 — Tracción inicial (10 clientes)

**Tareas:**
- [ ] Partnership con 2-3 asesorías o MSPs.
- [ ] Asistencia a 2-3 eventos de PyME / ciberseguridad locales.
- [ ] Crecimiento de la tabla curada con software encontrado en pilotos (objetivo: 100-150 productos).
- [ ] Tabla `unmatched_software` para revisión humana.
- [ ] Métricas básicas de producto (qué se usa, qué no).
- [ ] DPA template para clientes con DPO exigente.

**Criterio de "hecho":** 10 clientes pagando con MRR ≥500€ y churn <5% mensual.

---

### 🚢 Fase 4 — Escalado a 50 clientes

**Solo arrancar si**: la economía unitaria funciona (CAC <100€, LTV >600€).

**Tareas:**
- [ ] Cola asíncrona (BullMQ + Redis).
- [ ] Workers separados del API.
- [ ] Soporte cliente formalizado.
- [ ] Métricas y observabilidad (Grafana Cloud o similar).
- [ ] Plan Supabase Pro ($25/mes con backups).
- [ ] Status page pública.
- [ ] Marketing digital de pago.
- [ ] Soporte macOS y Linux (los stubs ya están).
- [ ] Posibles expansiones a Italia/Portugal.
- [ ] Tier Pro y Business definidos.

**Criterio de "hecho":** 50 clientes pagando con MRR ≥3.000€.

---

### 🌍 Fase 5 — Diversificación geográfica y de producto

**Solo arrancar si**: España está en piloto automático (proceso de venta repetible sin intervención manual).

Tareas a definir entonces, no antes.

---

## Deuda técnica conocida

> Lista consolidada. Severidad y plazo según fase del roadmap.

| Item | Severidad | Cuándo arreglar |
|------|-----------|-----------------|
| `software-mappings.json` duplicado en agent y processor | Baja | Cuando se mueva al agente como única fuente |
| Tabla `software_versions` con solo 14 productos | Media | Antes del primer piloto |
| `grype db update` no automático | Alta | Antes del primer piloto en producción |
| Cron jobs `sync-cisa-kev` / `sync-software-versions` no programados | Alta | Antes del primer piloto en producción |
| Sin auth real del agente (solo UUIDs) | Alta | Antes del primer piloto pagado |
| Sin firma digital del .exe (code signing) | Alta | Antes de cliente real serio (~$200/año) |
| Lovable usa `service_role_key` (no Auth real) | Alta | Antes de URL pública compartida |
| Pipeline síncrono (sin colas) | Baja | Cuando un cliente se queje de latencia |
| Sin reintentos en agente | Baja | Cuando aparezca el problema |
| Sin caché de endoflife.date | Media | Antes de tener 5+ clientes |
| `service_role_key` apareció en chats privados | Media | Rotar antes de cliente real |
| Sin auto-cierre de alertas resueltas | Media | Cuando un cliente parchee y pregunte |
| Sin política de retención (¿guardar scans 30/90/365 días?) | Baja | Cuando llenemos plan free de Supabase |
| Stubs darwin/linux no implementados | Baja | Cuando un piloto lo pida |
| Repo del agente solo en local | Media | Antes del primer piloto |
| Schema SQL aplicado a mano | Baja | Cuando haya >3 cambios pendientes |
| Migraciones aplicadas a Supabase sin nombre (sólo timestamp `20260503203201` y `20260503204634`) | Baja | Próximo cambio de schema — añadir `name` para trazabilidad |
| `device_inventory` vacía pese a 1 scan `completed` y 79 alertas — investigar si bug del processor o seed parcial | Media | Antes del primer piloto (las alertas dependen del inventario para auditoría) |
| Verificar si el frontend Lovable usa `anon key` o `publishable key` (nomenclatura nueva Supabase) y unificar terminología en docs | Baja | Al hacer setup del nuevo frontend |

---

## Compliance pendiente

- [ ] Política de privacidad pública.
- [ ] DPA template para empresas con departamento legal.
- [ ] Auditoría de logs (quién accede a qué).
- [ ] Backup automático (Supabase Pro lo incluye, Free no — ahora mismo no hay backups).
- [ ] Rotación periódica de `service_role_key`.

---

## Errores mentales a evitar

Estos vienen de la documentación previa y siguen siendo aplicables:

1. **Perfeccionar el producto antes de tener clientes.** El producto ya funciona suficientemente bien. Más cobertura no convertirá no-clientes en clientes.

2. **Construir mejor Grype / mejor agente.** No. La diferenciación está en frontend + informe NIS2 + precio + canal, no en el motor de detección.

3. **Añadir LLMs al runtime.** Tentación grande, error grave (ver D005 en `decisions.md`).

4. **Construir auth elaborada antes del primer cliente.** Auth básica con UUIDs es suficiente para los pilotos. Lo demás puede esperar.

5. **Microservicios, Kubernetes, event sourcing.** Nada de esto antes de 100 clientes pagando.

6. **Integración con SIEM/Slack/Teams.** Las PyMEs no usan SIEM. Esto puede esperar 6 meses como mínimo.

7. **Estrategia dual con mid-market financiero alemán.** No con 2 personas a tiempo parcial. España + PyME hasta validar.

8. **Documentar features futuras como si ya existieran.** Causa el problema que estamos resolviendo ahora mismo. Mantener `tech/` factual.

9. **Saltarse Fase 0.** El error más probable: ver el sistema funcionando, sentirse productivo, y seguir construyendo en lugar de hablar con clientes.

---

## Checkpoint mensual

> Recomendación: cada primer lunes de mes, revisar este documento.

**Preguntas a responderse:**
- ¿En qué fase del roadmap estamos hoy?
- ¿Qué criterios de "hecho" están cumplidos?
- ¿Qué deuda técnica nueva ha aparecido este mes?
- ¿Qué errores mentales estamos a punto de cometer?
- ¿Qué hay que añadir/corregir en `decisions.md`?

Si la fase no avanza durante 2 checkpoints seguidos, parar y diagnosticar por qué.
