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

## 2. Caso Semrush + contraste de modelos (3 min)

> “De 36.370 a cero en tres días. Solo el 1,3% está en nuestros logs. El 98,7% fue invisible.”

Cierra con el contraste ([doc Ahrefs créditos](https://help.ahrefs.com/en/articles/6061657-ahrefs-usage-based-pricing-for-credit-based-plans)):

> “Semrush es un paquete prepago de units sin reset. Ahrefs Standard 2022 tiene **dos medidores**: créditos de interfaz (cobro por usuario) y API units (cupo mensual que sí resetea). No son lo mismo.”

---

## 3. Gasto Ahrefs — dos medidores (3–4 min)

> “Standard 2022 es plan credit-based legacy — no el Standard Unlimited nuevo.”

**Medidor 1 — API units:** 86.251 / 400.000 (21,6%) · Orbit ~54% · resto keys/MCP ~46%.

**Medidor 2 — Créditos UI:** 1 crédito al abrir reporte / filtrar / pedir datos (no Site Audit ni Rank Tracker).
| Usuario | Créditos | Nivel | Cobro |
|---|---|---|---|
| Accesos SeoLab | 41/600 | Casual (6–100) | ~$20/mes |
| Online Enterprises | 12 | Casual | ~$20/mes |

Power = 101–600 → $60/mes. El plan incluye 1 Power. Pay-as-you-go créditos **off** (bien).  
Brand Radar ~7.200/300 = tercer cupo.

> “21% de API no es crisis. El riesgo es pico sin dueño + usuarios que suben de Casual a Power sin control.”

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
