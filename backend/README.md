# NEMO CrudeFlow Backend

FastAPI backend for Module 1: stable screen-first APIs for the CrudeFlow frontend.

## What This Module Provides

- Dashboard KPIs, operations rows, and decision preview
- Maritime map fleet, ports, risk zones, historical matches, vessel tracks, and route comparison
- Decision queue, detail, approve/reject, and NEMO Copilot mock responses
- Simulation scenarios, run endpoint, saved scenarios, and strategic options A/B/C
- Module 2 optimization endpoints for reroute decisions and demo-safe route recommendations
- Fleet summary, vessel table/detail, and mock export jobs
- Analytics insights, anomalies, metrics, scenario comparison, and mock export jobs
- Neon Postgres support with graceful mock fallback

## Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Create `.env`:

```env
DATABASE_URL=postgresql+psycopg://USER:PASSWORD@HOST/neondb?sslmode=require
APP_NAME=NEMO CrudeFlow API
APP_ENV=development
API_V1_PREFIX=/api/v1
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

If `DATABASE_URL` is missing or Neon is unreachable, every endpoint still returns demo data with `"source": "mockFallback"`.

## Seed Neon

```bash
cd backend
python scripts/seed_db.py
```

The seed is idempotent and creates these demo tables:

- `vessels`
- `routes`
- `ports`
- `risk_zones`
- `alerts`
- `decisions`
- `simulation_scenarios`
- `analytics_snapshots`

Each table stores a simple `id` plus `payload jsonb`, keeping Module 1 demo-friendly while preserving realistic API behavior.

## Run

```bash
cd backend
python scripts/dev_server.py
```

The dev launcher scopes reload watching to `app/` and `scripts/`, so the server does not restart repeatedly when `.venv` packages change.

Swagger docs:

```txt
http://localhost:8000/docs
```

Health check:

```txt
http://localhost:8000/api/v1/health
```

## Endpoint Groups

- `GET /api/v1/health`
- `GET /api/v1/system/status`
- `GET /api/v1/activity`
- `GET /api/v1/dashboard/summary`
- `GET /api/v1/dashboard/kpis`
- `GET /api/v1/dashboard/operations`
- `GET /api/v1/dashboard/decision-engine`
- `GET /api/v1/map/fleet`
- `GET /api/v1/map/ports`
- `GET /api/v1/map/risk-zones`
- `GET /api/v1/map/historical-matches`
- `GET /api/v1/map/vessels/{vessel_id}/track`
- `GET /api/v1/map/vessels/{vessel_id}/route-comparison`
- `GET /api/v1/decisions`
- `GET /api/v1/decisions/{decision_id}`
- `POST /api/v1/decisions/{decision_id}/approve`
- `POST /api/v1/decisions/{decision_id}/reject`
- `POST /api/v1/copilot/query`
- `GET /api/v1/simulation/scenarios`
- `POST /api/v1/simulation/run`
- `GET /api/v1/simulation/saved`
- `POST /api/v1/simulation/saved`
- `DELETE /api/v1/simulation/saved/{scenario_id}`
- `POST /api/v1/optimization/analyze`
- `POST /api/v1/optimization/compare`
- `POST /api/v1/optimization/optimize`
- `POST /api/v1/optimization/recover`
- `POST /api/v1/optimization/diagnose`
- `POST /api/v1/optimization/reroute`
- `GET /api/v1/optimization/demo`
- `GET /api/v1/fleet/summary`
- `GET /api/v1/fleet/vessels`
- `GET /api/v1/fleet/vessels/{vessel_id}`
- `POST /api/v1/fleet/export`
- `GET /api/v1/analytics/summary`
- `GET /api/v1/analytics/insights`
- `GET /api/v1/analytics/anomalies`
- `GET /api/v1/analytics/metrics`
- `GET /api/v1/analytics/scenario-comparison`
- `POST /api/v1/analytics/export`

## Response Wrapper

All endpoints return:

```json
{
  "success": true,
  "timestamp": "2026-04-27T...",
  "requestId": "...",
  "source": "neon",
  "data": {}
}
```

`source` is `"neon"` when data comes from Neon and `"mockFallback"` when generated from local demo data.
