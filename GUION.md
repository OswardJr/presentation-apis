# Guion — Control de APIs (≈20 min · 9 slides)

**Presenta:** Osward · **Gestión:** Sebastian · **Docs:** Orbit  

---

## Narrativa correcta (importante)

**Orbit (Online Enterprises / Esteban / info@)** gasta units al **preparar módulos**. Muchos de esos flujos **ya guardan en Supabase** para no volver a pegarle a Ahrefs. Eso es inversión de plataforma + cache — se monitorea, no se trata como desperdicio.

**Accesos SeoLab (MCP)** gasta en consultas ad-hoc (Claude / OpenAI / Codex) que **no dejan el mismo activo reutilizable** en Orbit. Ese fue el burn del mes anterior (60%).

Frase ancla:
> “No es Orbit vs el equipo. Es gasto que se cachea vs gasto que se evapora.”

---

## Números

| | Mes anterior (11 jun–11 jul) | Ciclo actual (11–19 jul) |
|---|---|---|
| **Total API units** | **406.833** | **86.251** |
| **/día** | 13.561 | 10.781 |
| **MCP %** | **60%** | **46%** |
| **Accesos · MCP** | **244.492** | **39.878** |
| **Orbit · módulos** | 162.341 | **46.373** |

- Accesos = `accesos@seolabagency.com` · Miembro · MCP  
- Orbit = `info@seolabagency.com` · Propietario · Esteban · Supabase Edge  
- Asesino MCP: `matching-terms` → **13.250 units/call**

---

## 1. Portada
> “El CSV separa dos mundos: MCP ad-hoc bajo Accesos vs Orbit que invierte y cachea en Supabase.”

## 2. Semrush (breve)
36.370 → 0 · 98,7% invisible. Ahrefs al menos deja Token creator + scope.

## 3. CSV comparativo (3 min)
> “El mes pasado: 406 mil. Accesos MCP solo 244 mil — 60%. OpenAI MCP lideró.”

Si Orbit lidera este ciclo:
> “Puede verse alto — es preparación de módulos. La diferencia es que ese dato queda en Supabase. MCP no.”

## 4. Dos lógicas (2.5 min)
Nombrar emails.  
> “Mismo cupo, dos lógicas: Orbit reutiliza; MCP consume y listo.”

## 5. Endpoints + IP (2 min)
matching-terms / organic-keywords. MCP sin IP; Orbit AWS US.  
> “Cortamos el patrón MCP caro. Orbit lo afinamos con cache, no lo apagamos.”

## 6. MCP reglas (2 min)
Techo Accesos. Preferir Orbit. matching-terms con limit.  
> “Orbit se monitorea; MCP se techa.”

## 7. Política (1.5 min)
4 pilares + créditos UI Casual ambos.

## 8. Acciones (2 min)
1. Tope key Accesos MCP  
2. Prohibir matching-terms masivo  
3. Orbit = vía preferida (cache)  
4. Inventario MCP clients (Esteban)  
5. Cerrar Semrush  
6. Alertas Orbit si sync innecesario — sin frenar prep legítima  

## 9. Cierre
> “Atacar MCP ad-hoc. Orbit invierte y cachea. Techo al primero; preferir el segundo.”

---

## Si preguntan “¿entonces Esteban / Orbit también?”
Sí gasta — en sync de módulos. Muchos resultados ya están en BD. Eso baja reconsultas futuras. El incendio del ciclo anterior fue **MCP Accesos**, no “Orbit sin control”.
