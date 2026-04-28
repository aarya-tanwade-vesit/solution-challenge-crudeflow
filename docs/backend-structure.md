# Backend Structure

Primary backend stack: **FastAPI + Pydantic + SQLAlchemy-ready services**

## Key Directories

- `backend/app/main.py` - FastAPI app bootstrap
- `backend/app/api/v1/` - versioned HTTP routers
- `backend/app/services/` - domain services (dashboard, fleet, decisions, copilot)
- `backend/app/optimization/` - risk/route optimization logic
- `backend/app/core/` - app settings, CORS, shared config
- `backend/app/data/` - seed/mock data and constants

## Service Domains

- Dashboard/KPI composition
- Fleet and route intelligence
- Decision lifecycle
- Simulation data feeds
- AI copilot query handling

## Runtime

- Local dev: `backend/scripts/dev_server.py`
- Container/prod: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

