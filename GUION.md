# Guion — Uso y control de APIs (≈20 min)

**Presenta:** Osward  
**Gestión:** Sebastian Castaño  
**Docs:** todo en Orbit  
**Deck:** esta web (Vercel) · datos en `/data/apis-usage.json`

---

## Antes de empezar (2 min prep)

- Abre la presentación en pantalla completa.
- Ten Orbit abierto en otra pestaña: monitores Ahrefs y Semrush (Leaders).
- Números clave a memorizar (snapshot 19 jul 2026):
  - **Ahrefs API:** 86,251 / 400,000 → **~21.6%**
  - **Esta API key (Orbit):** 46,373 → **~54%** del consumo del workspace
  - **Resto (UI / otras keys / MCP):** ~39,878 → **~46%**
  - **Brand Radar:** ~7,200 / 300 (alerta fuerte)
  - **Semrush:** caso detonante — paquete prepago **agotado en ~3 días**

Si actualizaste datos: `npm run refresh:ahrefs` (key solo en `.env.local`).

---

## 1. Portada (30–45 s)

> “Hoy no venimos a hablar de Google gratis. Venimos a poner reglas sobre las APIs que sí nos cuestan dinero — y a evitar que se nos vuelva a acabar un cupo sin darnos cuenta.”

Menciona: 20 minutos, docs en Orbit, tú operas, Sebastian gestiona.

---

## 2. Por qué estamos aquí — Semrush (2–2.5 min)

**Mensaje:** esto ya pasó.

> “El detonante es Semrush. Modelo prepago: compras units, no hay reset mensual como Ahrefs. Se nos acabó el paquete en unos tres días. Cuando el saldo llega a cero, las herramientas con fuente Semrush fallan hasta recargar.”

Tres aprendizajes (dígalos tal cual):

1. Sin monitoreo en tiempo real, un prepago se evapora.
2. Hay que medir consumo real (balance antes/después), no estimaciones a ciegas.
3. Cache + límites por herramienta son obligatorios.

Cierra el slide: “Por eso ya existe el módulo en Orbit: `/leaders/semrush-api-usage`.”

---

## 3. Agenda — 8 puntos (45 s)

No leas la lista entera. Di:

> “Son ocho puntos accionables: costo, fuentes de datos, excepciones, MCP, qué controlamos, tools de terceros, mi rol, y el protocolo de alertas. Ahrefs es el ejemplo vivo; el marco aplica al resto.”

---

## 4. Ahrefs ahora — números (2 min)

> “Ahrefs hoy está holgado: poco más del 21% del cupo de API del mes. Eso no significa que podamos relajarnos — significa que todavía podemos instalar el hábito antes del próximo susto.”

Destaca el desglose:

> “De lo consumido en el workspace, esta key —la del ecosistema Orbit— se lleva cerca del 54%. El otro 46% es UI, otras keys o MCP. Esa separación es importante: si hay un pico, primero preguntamos ¿fue Orbit o fue otra cosa?”

Menciona: plan Standard 2022, reset 12 ago 2026, pay-as-you-go **deshabilitado** (bien).

---

## 5. Quién consume + panel UI (1.5 min)

Cruza API con panel:

- Créditos UI SeoLab 41/600 — tranquilidad relativa en interfaz.
- Rank Tracker y Site Audit OK.
- **Brand Radar** — pásalo con tono serio:

> “Aquí hay una bandera roja: Brand Radar está órdenes de magnitud por encima del plan base. No es el mismo cupo que la API, pero es señal de uso descontrolado o mal dimensionado. Hay que revisar quién lo dispara.”

Sobre IP/país:

> “Ahrefs no nos da geo en el endpoint de límites. Lo vamos a enriquecer desde logs de Orbit. El JSON de esta presentación ya está preparado para cargar samples de IP y país.”

---

## 6. Reducción de costos (2 min)

No sermonees. Dale reglas cortas:

1. Cache primero  
2. Targets de prueba en desarrollo  
3. Campos mínimos (mín. 50 units/request en Ahrefs)  
4. Cap por API key  
5. Pay-as-you-go off  
6. UI ≠ API — se miden aparte  

> “Reducir costo no es ‘usar menos Ahrefs’. Es dejar de pagar por queries que no aportan decisión.”

---

## 7. Fuentes de datos en Orbit (1 min)

> “La fuente de verdad del consumo es Orbit, no capturas sueltas de pantalla. Leaders ya tiene monitores para Ahrefs y Semrush. OpenRouter y generación de contenido entran después en el mismo molde. GSC y GA4 quedan fuera del foco de costo.”

---

## 8. Excepciones (1 min)

> “Sí habrá excepciones — auditorías grandes, demos, backfills — pero con dueño. Autorizan gestión y operación: Sebastian + yo. Proceso: solicitud en Orbit, justificación, ventana temporal, revisión post-uso.”

---

## 9. MCP (1–1.5 min)

> “MCP es potente y peligroso al mismo tiempo. Una sesión de IDE mal configurada puede parecer ‘productividad’ y ser un burn silencioso.”

Regla de oro:

> “Preferir cache / datos de Orbit; en desarrollo, targets de prueba; nunca barridos masivos sin límite.”

Docs del uso correcto: Orbit.

---

## 10. Qué controla la empresa (1 min)

Lista corta: Ahrefs (activo), Semrush (en vigilancia por el incidente), OpenRouter/contenido (siguiente).  
Fuera: GSC/GA4.

> “Si la key o la cuenta es de la empresa, el gasto es de la empresa — aunque lo dispare un plugin.”

---

## 11. Terceros / Esteban (1 min)

> “Con Esteban hay que alinear IDEs, extensiones y entornos que puedan llamar APIs con keys compartidas. No hay zona gris porque ‘es solo mi Cursor’.”

---

## 12. Tu rol (1 min)

Di en primera persona:

> “Mi rol: vigilar monitores, snapshots, investigar picos, proponer límites o rotar keys, y reportar a Sebastian con datos — no con sensaciones.”

---

## 13. Protocolo de gasto fantasma (1.5–2 min)

Umbrales API Ahrefs: 50% moderado · 75% atención · 90% crítico.  
Hoy ~22% → verde, pero el protocolo existe para cuando no lo sea.

Pasos (recítalos):

1. Detectar pico  
2. Call log por endpoint/label/source  
3. Aislar key (límite o rotación)  
4. Avisar a gestión  
5. Documentar en Orbit y ajustar  

> “El objetivo no es castigar: es que un gasto raro no dure tres días otra vez.”

---

## 14. Roadmap + cierre (1 min)

> “Esta deck está pensada para ir cargando más APIs en el JSON. Hoy Ahrefs con datos vivos; Semrush como caso; después OpenRouter y geo desde logs.”

Cierre fuerte:

> “Controlar APIs es proteger presupuesto y continuidad del SEO. Semrush nos avisó. Ahrefs todavía tiene margen. Usémoslo para dejar el sistema puesto.”

Abre a preguntas.

---

## Preguntas probables (respuestas cortas)

**¿Por qué no cortamos Ahrefs ya?**  
Porque está al ~22% y es la fuente SEO principal. El movimiento correcto es gobernanza, no apagar.

**¿Quién puede pedir más cupo?**  
Gestión. Pay-as-you-go sigue off a propósito.

**¿Y si MCP necesita datos ya?**  
Que pase por Orbit/cache o por una excepción temporal con límite.

**¿Dónde queda documentado?**  
Orbit. Esta web es la exposición; Orbit es la norma operativa.

**¿Cómo actualizo los números de la deck?**  
`AHREFS_API_KEY` en `.env.local` → `npm run refresh:ahrefs` → redeploy. La key nunca va al repo.

---

## Timing sugerido

| Bloque        | Minutos |
|---------------|---------|
| Portada + por qué (Semrush) | 3.5 |
| Agenda + Ahrefs números     | 4.5 |
| Costos + fuentes + excepciones | 4 |
| MCP + control + terceros    | 3.5 |
| Rol + protocolo + cierre    | 4 |
| Preguntas                   | resto |
