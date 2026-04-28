# API Overview

Backend base path: `/api/v1`

## Key API Areas

- `GET /dashboard/kpis` - KPI cards and operational summary.
- `GET /dashboard/summary` - high-level operational snapshot.
- `GET /fleet/vessels` - fleet list and status distribution.
- `GET /fleet/ports` - monitored ports and congestion context.
- `GET /decisions` - decision queue with recommendation metadata.
- `POST /decisions/{id}/status` - approve/reject route or ops decisions.
- `POST /copilot/query` - structured AI assistant response payload.
- `GET /system/status` - backend health/status information.

## Response Shape

Most endpoints follow a success envelope with timestamp/source metadata and domain payload.

## API Contracts

- Keep API consumers typed via `frontend/lib/api/*`.
- Treat `backend/app/api/v1/*` as source of truth for endpoint behavior.

