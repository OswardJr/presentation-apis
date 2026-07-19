# Guion — Control de APIs (≈20 min · 8 slides)

**Presenta:** Osward · **Gestión:** Sebastian · **Docs:** Orbit  
**URL:** presentation-apis (Vercel)

---

## Números a memorizar

**Semrush (10–13 jul):** 36.370 → 0 · 460 explicadas · **35.900 (98,7%) sin log** · golpes −15.660 y −20.240  
**Ahrefs:** 86.251 / 400.000 (**21,6%**) · esta key Orbit **46.373 (~54%)** · resto **~39.878 (~46%)** · Brand Radar ~7.200/300

---

## 1. Portada (30 s)

> “Semrush nos avisó. Ahrefs todavía tiene margen. Hoy: qué pasó, por qué se gasta, cómo usar MCP, y reglas en Orbit.”

---

## 2. Caso Semrush (3 min) — una sola slide

> “De 36.370 a cero en tres días. Solo el 1,3% está en nuestros logs. El 98,7% fue invisible: dos golpes grandes, no un goteo.”

Hipótesis (di “no confirmada”): Position Tracking · 100/gestión + 100/keyword.  
Lección: **fuera del proxy = no existe para nosotros.**

---

## 3. Por qué tanto gasto Ahrefs (3–4 min)

> “No es misterio total: la API nos dice el corte. ~54% es la key de Orbit. ~46% es todo lo demás: UI, otras keys, MCP.”

Drivers a decir:
1. **Orbit** — agentes (smart reports, keywords, competitors, content gap, forecast, backlinks). Mín. 50 units/call.  
2. **Fuera de esa key** — sin inventario de keys no hay dueño.  
3. **Estructura de precio** — muchas filas + campos caros = burn.  
4. **Brand Radar** — otro cupo, mismo síntoma (~7.200 vs 300).

> “21% del mes no es crisis. El riesgo es un pico sin dueño, como Semrush.”

Para cerrar la duda fina: revisar en Ahrefs **Account → API keys** el uso por key (MCP vs Orbit vs otras) y en Orbit el call log por endpoint.

---

## 4. MCP — sí hay recomendaciones (3 min)

Principio:

> “MCP de Ahrefs gasta el mismo cupo que la API. Un agente en bucle puede quemar miles de units en minutos.”

Reglas (recita 4–5):
- Cache Orbit primero  
- Una pregunta = consulta acotada  
- Dev con targets de prueba  
- select + limit bajos  
- No key MCP ilimitada compartida  
- Trabajo de clientes → proxy Orbit  

Acciones: inventariar keys MCP, **poner tope mensual por key**, revocar sin uso, alinear con Esteban.

---

## 5. Política en 4 pilares (2 min)

No leas ocho puntos sueltos. Agrupa:
- Control/fuentes · Costo/excepciones · MCP/terceros · Monitoreo  

Excepciones: Sebastian + tú · Orbit · ventana temporal.

---

## 6. Operación (2 min)

Tu rol + Esteban (IDEs) + protocolo:

> “Si el saldo cae y el log está vacío → gasto fuera del proxy. Inventario de keys, aislar, pedir desglose al vendor.”

Umbrales: 50 / 75 / 90 · hoy 21,6%.

---

## 7. Acciones de la semana (2 min)

Pide dueños en voz alta:
1. Inventario keys — Osward  
2. Techos MCP — Osward + Esteban  
3. Cerrar Semrush (panel + soporte) — Gestión  
4. Brand Radar — Osward  
5. Proxy obligatorio — Equipo  
6. Recarga Semrush — Sebastian  

---

## 8. Cierre (30 s)

> “Proxy + techos + dueños. Si gasta units, debe tener dueño, límite y log.”

---

## Timing

| Slide | Min |
|---|---|
| Portada + Semrush | 3.5 |
| Gasto Ahrefs + MCP | 7 |
| Política + operación | 4 |
| Acciones + cierre + Q&A | resto |
