# Guion — Uso y control de APIs (≈20 min)

**Presenta:** Osward  
**Gestión:** Sebastian Castaño  
**Docs:** todo en Orbit  
**Deck:** esta web (Vercel) · datos en `/data/apis-usage.json`  
**Caso Semrush:** informe interno 13 jul 2026 · preparado para Robert Virona / SeoLab

---

## Antes de empezar (2 min prep)

- Abre la presentación en pantalla completa.
- Ten Orbit abierto: monitores Ahrefs y Semrush (Leaders).
- Números clave:

### Semrush (informe 13 jul — horas Bogotá)
| Extremo | Saldo |
|---|---|
| Vie mañana | ~36.370 |
| Vie 4:56 p.m. (fin pruebas) | 36.000 |
| Sáb 5:58 a.m. | 20.340 (−15.660 sin log) |
| Lun 9:25 a.m. | 100 (−20.240 sin log) |
| Lun ~9:26 a.m. | 0 (−100 verificación directa) |

- **Explicadas:** 460 (360 pruebas + 100 verificación) = **1,3%**
- **Sin rastro interno:** 35.900 = **98,7%**
- Hipótesis (no confirmada): Position Tracking · 100/gestión + 100/keyword

### Ahrefs (snapshot deck)
- API: **86.251 / 400.000** (~21.6%)
- Esta key Orbit: **46.373** (~54% del workspace)
- Brand Radar UI: ~7.200 / 300 (alerta)

---

## 1. Portada (30–45 s)

> “Hoy no venimos a hablar de Google gratis. Venimos a poner reglas sobre las APIs que sí nos cuestan — y a evitar que se nos vuelva a acabar un cupo sin darnos cuenta, como pasó con Semrush.”

---

## 2. Caso Semrush — cifras (2 min)

> “El informe del 13 de julio es claro: el saldo pasó de treinta y seis mil trescientos setenta a cero en tres días. De esa caída, solo cuatrocientas sesenta units están 100% explicadas en nuestros logs. El 98,7% — treinta y cinco mil novecientas — no dejó ningún rastro en los sistemas de la agencia.”

Enfatiza: no es estimación; cada punto es lectura real de `countapiunits`.

---

## 3. Dos golpes (1.5–2 min)

> “No fue un goteo. Fueron dos caídas concretas: quince mil seiscientas sesenta en unas trece horas entre el viernes noche y el sábado; y veinte mil doscientas cuarenta en el resto del fin de semana. En ambos tramos: cero llamadas nuestras registradas.”

Explicado:
- Viernes: 11 pruebas al activar Semrush como 2ª fuente → **360** units (sí en log).
- Lunes: verificación directa Position Tracking → **100** units (fuera del proxy; por eso tampoco quedó en el log de plataforma).

> “Eso último es clave: yo mismo comprobé que una llamada directa a Semrush es invisible para nuestro monitoreo.”

---

## 4. Hipótesis + descartes (1.5–2 min)

Di con cuidado — **no es confirmación**:

> “La hipótesis de trabajo más fuerte es la API de Position Tracking: cien units por gestión y cien por keyword. Una campaña de 150 a 200 keywords consume del orden de 15 a 20 mil de un saque — el tamaño de cada golpe. Confirmamos que la key sí tiene acceso a esa API.”

Descartado del lado agencia (recítalo):
- Sin cron propio Semrush
- Sin tareas programadas relacionadas
- Sin flujos/integraciones que llamen Semrush

Siguiente (pide acción al room):
1. Actividad de API en semrush.com  
2. ¿Quién más tiene la key?  
3. Soporte Semrush con saldos 36.000 / 20.340 / 100  

---

## 5. Aprendizajes (1 min)

> “Cuatro consecuencias para la política: uno, lo que no pasa por el proxy no existe para nosotros. Dos, el patrón fue de lote, no de goteo. Tres, inventario de keys ya. Cuatro, Ahrefs estaba bien — el riesgo es el modelo, no solo Semrush.”

---

## 6. Agenda — 8 puntos (45 s)

> “Con eso en la mesa, los ocho puntos: costo, fuentes, excepciones, MCP, qué controlamos, tools de terceros, mi rol, protocolo de gasto fantasma.”

---

## 7. Ahrefs ahora (2 min)

> “Ahrefs hoy está holgado: poco más del 21% del cupo API. El riesgo no es el porcentaje actual: es un pico sin dueño, como Semrush.”

Desglose: ~54% esta key Orbit / ~46% otras keys·UI·MCP.  
Pay-as-you-go off. Brand Radar UI fuera de control (~7.200/300).

---

## 8–13. Política (puntos 01–08) — ~8 min

Misma estructura de la deck. Frases ancla:

**Costo:** “Reducir costo = dejar de pagar queries que no aportan decisión.”  
**Fuentes:** “Orbit es la fuente de verdad; GSC/GA4 fuera de foco de costo.”  
**Excepciones:** “Sí, con dueño: Sebastian + yo; ventana temporal.”  
**MCP:** “Útil, no voraz. Preferir cache Orbit; nunca barridos masivos.”  
**Control:** “Si la key es de la empresa, el gasto es de la empresa — aunque lo dispare un plugin o una terminal.”  
**Terceros / Esteban:** “IDEs y llamadas directas entran al mismo régimen.”  
**Rol:** “Vigilo, investigo picos, propongo rotar keys, reporto con cifras.”  
**Protocolo:** “Si el saldo cae y el log está vacío → gasto fuera del proxy. Inventario de keys, aislar, pedir desglose al vendor.”

---

## 14. Cierre (45 s)

> “Semrush: 36.370 a cero, y casi todo invisible. Ahrefs todavía tiene margen. Usémoslo para dejar el sistema puesto: todo por proxy, keys inventariadas, Orbit como verdad.”

Abre a preguntas.

---

## Preguntas probables

**¿Fue culpa de la agencia?**  
No hay evidencia en nuestros sistemas. Descartamos automatizaciones internas. La causa real solo la ve Semrush (o quien usó la key fuera).

**¿Confirmado Position Tracking?**  
No. Hipótesis de trabajo: calza en tamaño y en silencio del log.

**¿Por qué gastaste las últimas 100?**  
Verificación de acceso a Position Tracking (pedido Categorías por estado). Lectura de gestión que sí cobra 100. Menor frente a 35.900 ya perdidas; documentado.

**¿Ahrefs está en riesgo?**  
Hoy no por saldo. Sí por el mismo riesgo estructural: keys compartidas + llamadas fuera de proxy.

**¿Dónde documentamos?**  
Orbit. Esta web es la exposición.

---

## Timing sugerido

| Bloque | Min |
|---|---|
| Portada + caso Semrush (cifras, golpes, hipótesis, aprendizajes) | 7 |
| Agenda + Ahrefs | 3 |
| Política 8 puntos | 7 |
| Cierre + preguntas | resto |
