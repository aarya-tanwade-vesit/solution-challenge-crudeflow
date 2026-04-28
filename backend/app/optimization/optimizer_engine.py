"""
NEMO CrudeFlow — Module 2: Optimizer Engine
=============================================
Uses OR-Tools CP-SAT to select the best option under constraints.
"""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

from ortools.sat.python import cp_model

from app.optimization.comparison_engine import compare_options
from app.optimization.schemas import OptimizeRequest, OptimizationResult


def optimize_options(request: OptimizeRequest) -> OptimizationResult:
    """
    Select the best option mathematically.
    """
    # 1. Generate options
    comparison = compare_options(request) # type: ignore
    options = comparison.rankedOptions
    
    # 2. Setup OR-Tools model
    model = cp_model.CpModel()
    
    # Decision variables: chosen[i] is true if option i is selected
    chosen = [model.NewBoolVar(f"choose_{opt.optionId}") for opt in options]
    
    # Constraint: Choose exactly one option
    model.Add(sum(chosen) == 1)
    
    # Optional constraints
    min_buffer = request.minBufferDaysOverride or request.minimumBufferDays
    
    for i, opt in enumerate(options):
        # Buffer constraint
        if opt.refineryBufferDays < min_buffer:
            model.Add(chosen[i] == 0)
        
        # Max Risk constraint
        if request.maxRiskScore and opt.weightedRiskScore > request.maxRiskScore:
            model.Add(chosen[i] == 0)
            
        # Max ETA constraint
        if request.maxEtaDays and opt.etaDays > request.maxEtaDays:
            model.Add(chosen[i] == 0)

    # Objective: Maximize score (or minimize -score)
    # We use integer scores for CP-SAT
    objective_terms = []
    for i, opt in enumerate(options):
        score_int = int(opt.finalRouteScore * 100)
        objective_terms.append(chosen[i] * score_int)
    
    model.Maximize(sum(objective_terms))
    
    # 3. Solve
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 1.0
    status = solver.Solve(model)
    
    status_name = solver.StatusName(status)
    
    if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
        selected_idx = -1
        for i in range(len(options)):
            if solver.Value(chosen[i]):
                selected_idx = i
                break
        
        selected = options[selected_idx]
        rejected = [
            {"id": opt.optionId, "score": opt.finalRouteScore, "reason": "Optimized out"}
            for i, opt in enumerate(options) if i != selected_idx
        ]
        
        return OptimizationResult(
            selectedOptionId=selected.optionId,
            selectedLabel=selected.label,
            objectiveValue=float(solver.ObjectiveValue()) / 100.0,
            solverStatus=status_name,
            solverEngine="OR-Tools CP-SAT",
            constraints={
                "minBufferDays": min_buffer,
                "maxRiskScore": request.maxRiskScore,
                "maxEtaDays": request.maxEtaDays
            },
            rejectedOptions=rejected,
            rankedOptions=options,
            validation={"feasible": True},
            summary=f"Solver selected {selected.label} as the optimal strategy.",
            asOf=datetime.now(UTC).isoformat()
        )
    else:
        # Infeasible
        return OptimizationResult(
            selectedOptionId="None",
            selectedLabel="Infeasible",
            objectiveValue=0.0,
            solverStatus=status_name,
            solverEngine="OR-Tools CP-SAT",
            constraints={
                "minBufferDays": min_buffer,
                "maxRiskScore": request.maxRiskScore,
                "maxEtaDays": request.maxEtaDays
            },
            rejectedOptions=[],
            rankedOptions=options,
            validation={"feasible": False},
            summary="No feasible solution found under current constraints.",
            asOf=datetime.now(UTC).isoformat()
        )
