# Control de APIs — Presentación

Deck interna (≈20 min) sobre uso, control y reducción de APIs de pago.  
Diseño oscuro / neon, datos desde JSON, lista para Vercel.

## Stack

- Vite + React + TypeScript
- Datos: `public/data/apis-usage.json` (extensible a más APIs)
- Guion: [`GUION.md`](./GUION.md)

## Local

```bash
npm install
npm run dev
```

Actualizar Ahrefs (no sube la key al repo):

```bash
cp .env.example .env.local
# pega AHREFS_API_KEY en .env.local
npm run refresh:ahrefs
```

## Vercel

1. Importa el repo `presentation-apis`
2. Framework preset: Vite
3. Build: `npm run build` · Output: `dist`
4. No hace falta env en Vercel para la deck (usa el JSON estático)

## Contenido

- Caso detonante: **Semrush** (paquete agotado en ~3 días; módulo en Orbit)
- Foco actual: **Ahrefs** (units workspace vs API key vs UI)
- Próximo: OpenRouter / APIs de contenido en Orbit
- Fuera de foco de costo: GSC / GA4

Documentación operativa: **Orbit**. Gestión: Sebastian Castaño. Monitoreo: Osward.
