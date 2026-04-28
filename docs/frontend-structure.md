# Frontend Structure

Primary frontend stack: **Next.js + React + TypeScript + Tailwind + Leaflet**

## Key Directories

- `frontend/app/` - route-level pages (dashboard, map, decisions, simulation, etc.)
- `frontend/components/` - reusable UI, map, dashboard, decision, simulation modules
- `frontend/contexts/` - global state (KPIs, decisions, simulation)
- `frontend/lib/` - API clients and domain helpers
- `frontend/public/` - static assets

## Operational Modules

- Dashboard and KPI cards
- Maritime intelligence map (current vs optimized routes)
- Decision Engine (approve/reject)
- Simulation Lab (what-if analysis)
- Copilot panel (structured AI guidance)

