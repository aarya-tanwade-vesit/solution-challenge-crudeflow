"""
NEMO CrudeFlow — Module 2: Diagnosis Engine
=============================================
Explains why the system is infeasible.
"""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

from app.optimization.schemas import DiagnoseRequest, DiagnosisResult


def diagnose_failure(request: DiagnoseRequest) -> DiagnosisResult:
    """
    Diagnose binding constraints and system failure modes.
    """
    # Check inventory vs consumption
    inventory_days = request.refinery.currentInventoryBbl / request.refinery.dailyConsumptionBbl
    eta_days = request.route.baselineEtaHours / 24.0
    
    reasons = []
    binding = []
    
    if inventory_days < eta_days:
        reasons.append("Inventory depletion before arrival")
        binding.append({
            "constraint": "Refinery Buffer",
            "value": f"{inventory_days:.1f} days",
            "threshold": f"{eta_days:.1f} days",
            "gap": f"{eta_days - inventory_days:.1f} days"
        })
        
    if request.route.baselineRiskScore > 80:
        reasons.append("Excessive route risk")
        binding.append({
            "constraint": "Maritime Risk",
            "value": request.route.baselineRiskScore,
            "threshold": 80,
            "gap": request.route.baselineRiskScore - 80
        })

    return DiagnosisResult(
        infeasibilityReason="; ".join(reasons) if reasons else "Multiple operational constraint violations",
        bindingConstraints=binding,
        systemFailureMode="Buffer Exhaustion" if inventory_days < eta_days else "Risk Breach",
        recommendedInterventionStack=["throughput_reduction", "emergency_inventory"],
        fallbackEscalation="Regional Supply Chain Manager",
        severity="critical" if inventory_days < 2 else "high",
        estimatedImpactUsd=5200000, # Example fixed daily shutdown cost
        details={
            "inventoryDays": inventory_days,
            "etaDays": eta_days,
            "shortfall": max(0, eta_days - inventory_days)
        },
        asOf=datetime.now(UTC).isoformat()
    )
