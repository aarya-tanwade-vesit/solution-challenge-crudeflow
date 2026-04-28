"""
NEMO CrudeFlow — Module 2: Risk Engine
========================================
Calculates maritime risk scores based on chokepoints, weather, and geopolitics.
"""

from __future__ import annotations

from typing import Any

from app.optimization.constants import CHOKEPOINTS, RISK_WEIGHTS
from app.optimization.utils import pct, weighted_sum


def calculate_risk(
    base_risk: float,
    weather_severity: float,
    congestion_score: float,
    insurance_increase_pct: float,
    traversed_passages: list[str] | None = None,
    risk_weights_override: dict[str, float] | None = None,
) -> dict[str, Any]:
    """
    Calculate weighted risk score and identify high-risk segments.
    """
    weights = {**RISK_WEIGHTS, **(risk_weights_override or {})}
    
    passages = traversed_passages or []

    # Calculate chokepoint contribution
    choke_delta = 0.0
    for passage in passages:
        # Search in CHOKEPOINTS by display name or key
        found = False
        for key, data in CHOKEPOINTS.items():
            if data["display"].lower() == passage.lower() or key.lower() == passage.lower():
                choke_delta += data["geopolitical_delta"]
                found = True
                break
    
    # Components for weighted sum
    components = {
        "geopolitical": base_risk + choke_delta,
        "weather": weather_severity,
        "congestion": congestion_score,
        "insurance": insurance_increase_pct,
        "chokepoint": choke_delta,
    }
    
    final_score = pct(weighted_sum(components, weights))
    
    return {
        "weightedRiskScore": final_score,
        "breakdown": components,
        "weights": weights,
        "chokePointPenalty": choke_delta,
        "riskDelta": final_score - base_risk,
    }
