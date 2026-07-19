# Guion — Control de APIs (≈20 min · 9 slides)

**Presenta:** Osward · **Gestión:** Sebastian · **Docs:** Orbit  

---

## Hallazgo estrella (memorizar)

| | Mes anterior (11 jun–11 jul) | Ciclo actual (11–19 jul) |
|---|---|---|
| **Total API units** | **406.833** | **86.251** |
| **/día** | 13.561 | 10.781 |
| **MCP %** | **60%** | **46%** |
| **Accesos SeoLab** (MCP) | **244.492** | **39.878** |
| **Online Enterprises** (Orbit/Esteban) | 162.341 | **46.373** |

- Accesos = `accesos@seolabagency.com` · Miembro · Claude / OpenAI / Codex MCP  
- Online Ent. = `info@seolabagency.com` · Propietario · Esteban · Orbit/Supabase  
- Llamada asesina: `keywords-explorer/matching-terms` → **13.250 units** (MCP, sin IP)

---

## 1. Portada
> “El gasto ya tiene nombre. Semrush fue el detonante; el CSV de Ahrefs muestra el resto.”

## 2. Semrush (breve)
36.370 → 0 · 98,7% invisible. Contraste: Semrush sin log vs Ahrefs con Token creator + scope MCP.

## 3. CSV comparativo (3 min) — atacar
> “El mes pasado nos comimos 406 mil units. Accesos MCP solo: 244 mil — el 60%. OpenAI MCP lideró.”

> “Este ciclo, en 8 días, ya van 86 mil a ~10.800/día — el 80% del ritmo del mes que se evaporó. Orbit ahora lidera por poco, pero MCP sigue en 40 mil.”

Mostrar sparks / barras.

## 4. Usuarios y canales (2.5 min)
Nombrar emails y roles. Scope `apiv3-mcp` vs `apiv3`.  
> “No es ‘la API de la empresa’ en abstracto: es Accesos con OpenAI MCP y Esteban con Orbit.”

## 5. Endpoints + IP (2.5 min)
matching-terms, organic-keywords, top-pages.  
> “MCP no deja IP — satélite. Orbit deja AWS US Supabase. LatAm solo aparece en lecturas de saldo a 0 units.”

Dos matching-terms el 13 jul = 26.500 units.

## 6. MCP reglas (2 min)
Techo en key Accesos. Prohibir matching-terms masivo. Separar clientes MCP. Proxy para clientes.

## 7. Política (1.5 min)
4 pilares + créditos UI Casual $20 ambos usuarios.

## 8. Acciones (2 min)
Dueños en voz alta: tope Accesos, ban matching-terms masivo, techo Orbit, inventario MCP, Semrush, proxy.

## 9. Cierre
> “Accesos MCP quemó el mes. Orbit también gasta — pero con log. Techos por key.”

---

## Si preguntan “¿culpa de Esteban?”
Orbit gasta (Supabase Edge, organic-keywords). Es trabajo de plataforma. El burn descontrolado del mes anterior fue **mayoritariamente MCP bajo Accesos**, no el panel UI.
