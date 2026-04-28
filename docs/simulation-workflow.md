# Simulation Workflow

The Simulation Lab lets operators run scenario-based forecasting before committing decisions.

## Workflow

1. Select scenario (risk/cost/time/emergency profile).
2. Review predicted KPI impact and operational side effects.
3. Compare route alternatives and disruption exposure.
4. Feed selected action back into Decision Engine.

## State Coordination

- Frontend simulation state lives in `frontend/contexts/simulation-context.tsx`.
- KPI overlays are managed in `frontend/contexts/kpi-context.tsx`.
- Decision approvals can update route visuals and KPI outputs.

## Intended Outcome

Reduce real-world demurrage and disruption by validating decisions before execution.

