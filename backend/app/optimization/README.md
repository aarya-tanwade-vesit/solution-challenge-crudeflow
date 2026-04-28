# NEMO CrudeFlow — Module 2 (Optimization & Intelligence)

This module contains the "brain" of the NEMO CrudeFlow platform, responsible for maritime optimization, risk assessment, and refinery continuity logic.

## Folder Structure

```
optimization/
├── maritime_router.py     # Searoute-based routing logic
├── cost_engine.py         # Deterministic fuel, hire, and demurrage math
├── risk_engine.py         # Weighted maritime risk assessment
├── refinery_engine.py     # Refinery inventory and buffer prediction
├── scoring_engine.py      # Multi-criteria decision scoring (0-100)
├── comparison_engine.py   # Strategy generation and ranking (Options A-D)
├── optimizer_engine.py    # OR-Tools CP-SAT mathematical optimization
├── intervention_engine.py # Infeasibility recovery planning
├── diagnosis_engine.py    # Binding constraint analysis
├── schemas.py             # Pydantic models for API and internal logic
├── constants.py           # Operational parameters and chokepoint data
├── utils.py               # Shared geo and math helpers
├── example_runner.py      # Standalone demo script
└── README.md              # This file
```

## Key Engines

### 1. Maritime Routing
Uses `searoute` to calculate nautical distances and ETAs based on vessel speed and regional chokepoints.

### 2. Cost Engine
Calculates the Total Landed Cost (TLC) of crude including:
- **Fuel Cost**: Based on distance, speed, and consumption.
- **Hire Cost**: Time-charter equivalent (TCE) for the voyage duration.
- **Demurrage**: Projected anchorage wait times based on port occupancy.
- **War Risk**: Insurance premiums triggered by chokepoint transits.

### 3. Risk Engine
Computes a **Weighted Risk Score** [0-100] by combining geopolitical tensions, weather severity, port congestion, and chokepoint-specific penalties.

### 4. Refinery Engine
Predicts the **Buffer Days Remaining** at the receiving refinery. It calculates if the vessel will arrive before the refinery runs out of crude inventory.

### 5. Optimizer (OR-Tools)
Uses the Google OR-Tools CP-SAT solver to find the mathematically optimal route strategy that satisfies hard constraints (e.g., `buffer > 2 days`, `risk < 80`).

## API Endpoints

- `POST /api/v1/optimization/analyze`: Deep dive into a single route strategy.
- `POST /api/v1/optimization/compare`: Rank multiple strategies (A, B, C, D).
- `POST /api/v1/optimization/optimize`: Solve for the best route under constraints.
- `POST /api/v1/optimization/recover`: Find recovery actions (e.g., throughput reduction) for infeasible states.
- `POST /api/v1/optimization/diagnose`: Explain why a system state is infeasible.

## Running the Demo

To test the logic without the API, run:
```bash
python -m app.optimization.example_runner
```
(Ensure your `PYTHONPATH` includes the `backend` directory).
