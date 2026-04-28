"""
NEMO CrudeFlow — Module 2: Intervention Engine
================================================
Calculates recovery plans when no feasible route is found.
"""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

from app.optimization.constants import INTERVENTION_COSTS
from app.optimization.schemas import InterventionPlan, RecoverRequest, RecoveryResult


def find_recovery_plan(request: RecoverRequest) -> RecoveryResult:
    """
    Find the smallest intervention making the system feasible.
    """
    # For demo: assume we are recovering from a buffer shortage
    shortfall_days = max(0.0, request.refinery.minimumBufferDays - (request.refinery.currentInventoryBbl / request.refinery.dailyConsumptionBbl))
    
    interventions: list[InterventionPlan] = []
    
    if shortfall_days > 0:
        # 1. Throughput reduction
        needed_pct = shortfall_days / 0.033 # Simplified from constant
        cost = float(INTERVENTION_COSTS["throughput_reduction"]) * needed_pct
        interventions.append(InterventionPlan(
            interventionId="throughput_reduction",
            label="Throughput Reduction",
            description=f"Reduce refinery throughput by {needed_pct:.1f}% to stretch buffer.",
            fixedCostUsd=0,
            variableCostUsd=int(cost),
            totalCostUsd=int(cost),
            bufferGainDays=shortfall_days,
            feasibilityRestored=True,
            notes="Impacts product delivery schedules."
        ))
        
        # 2. Emergency inventory
        needed_bbl = shortfall_days * request.refinery.dailyConsumptionBbl
        cost = float(INTERVENTION_COSTS["emergency_inventory_fixed"]) + (needed_bbl * float(INTERVENTION_COSTS["emergency_inventory_per_bbl"]))
        interventions.append(InterventionPlan(
            interventionId="emergency_inventory",
            label="Emergency Inventory Draw",
            description=f"Draw {needed_bbl:,.0f} barrels from strategic reserves.",
            fixedCostUsd=int(INTERVENTION_COSTS["emergency_inventory_fixed"]),
            variableCostUsd=int(needed_bbl * float(INTERVENTION_COSTS["emergency_inventory_per_bbl"])),
            totalCostUsd=int(cost),
            bufferGainDays=shortfall_days,
            feasibilityRestored=True,
            notes="High cost but preserves throughput."
        ))

    # Rank by total cost
    interventions.sort(key=lambda x: x.totalCostUsd)
    
    applied = [interventions[0]] if interventions else []
    
    return RecoveryResult(
        originallyFeasible=shortfall_days <= 0,
        feasibilityRestored=len(applied) > 0,
        interventionsApplied=applied,
        recoveryPlanCostUsd=sum(i.totalCostUsd for i in applied),
        postRecoveryBufferDays=request.refinery.minimumBufferDays,
        summary="Recovery plan generated to restore refinery feasibility.",
        asOf=datetime.now(UTC).isoformat()
    )
