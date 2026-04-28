# Optimization Engine

NEMO CrudeFlow optimization combines route, delay, risk, and cost signals to support operator decisions.

## Inputs

- Vessel route context
- Congestion and chokepoint pressure
- Weather severity and geopolitical risk
- Insurance and delay impact factors

## Outputs

- Weighted risk score
- Route alternatives
- Cost/delay tradeoff estimates
- Recommendation payload used by Decision Engine

## Where It Lives

- Backend optimization logic: `backend/app/optimization/`
- Decision integration: `backend/app/services/decision_service.py`
- KPI integration: `backend/app/services/dashboard_service.py`

