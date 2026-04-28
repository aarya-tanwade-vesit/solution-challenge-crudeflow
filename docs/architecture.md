# NEMO CrudeFlow Architecture

NEMO CrudeFlow is a two-tier platform:

- `frontend/` - Next.js 16 UI for analytics, simulation, and operations workflows.
- `backend/` - FastAPI service exposing `api/v1` intelligence and decision APIs.

## High-Level Flow

1. Operator interacts with dashboard/map/decision engine in the frontend.
2. Frontend requests data from backend APIs (`/api/v1/*`), proxied in development.
3. Backend composes fleet, risk, KPI, and optimization responses.
4. Simulation and decision actions update UI state and trigger recomputation.
5. AI Copilot queries aggregate operational context and returns structured guidance.

## Core Domains

- **Fleet Intelligence** - vessel states, routes, disruptions.
- **Decision Engine** - approve/reject operational recommendations.
- **Simulation Lab** - what-if scenarios and KPI impact analysis.
- **Optimization Layer** - route/risk/cost calculations and alternatives.
- **Copilot Layer** - contextual AI responses using platform state.

## Deployment Topology (Google Cloud Target)

- Frontend container on Cloud Run.
- Backend container on Cloud Run.
- Database on Cloud SQL (or managed PostgreSQL like Neon for demo).
- Secrets in Secret Manager.
- Images stored in Artifact Registry.

