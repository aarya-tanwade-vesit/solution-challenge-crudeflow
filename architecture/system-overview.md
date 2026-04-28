# System Overview

## Components

- **Web Client (Next.js)** - operator workflows and visual analytics.
- **API Layer (FastAPI)** - operational data, decision lifecycle, AI context services.
- **Data Source Layer** - seeded data for demo mode, PostgreSQL-ready interface for production.
- **AI Layer** - structured copilot responses using Gemma/Gemini-compatible integrations.

## Interaction Pattern

Frontend reads via API contracts, manages local interaction state, and pushes action events (like route approvals) that update operational views and KPIs.

## Scalability Notes

- Stateless app containers on Cloud Run.
- Managed database (Cloud SQL/PostgreSQL) for persistent state.
- Secret Manager for key material.
- Artifact Registry for immutable image promotion.

