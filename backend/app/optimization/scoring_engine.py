"""
NEMO CrudeFlow — Module 2: Scoring Engine
===========================================
Normalizes costs, risks, and delays into a single decision score.
"""

from __future__ import annotations

from typing import Any

from app.optimization.constants import SCORING_WEIGHTS
from app.optimization.utils import build_explanation, normalize, score_from_penalty


def calculate_score(
    cost_usd: float,
    baseline_cost_usd: float,
    risk_score: float,
    delay_hours: float,
    buffer_days: float,
    min_buffer_days: float,
    congestion_score: float,
    label: str,
    passages: list[str],
) -> dict[str, Any]:
    """
    Score a route candidate [0-100].
    """
    # Normalize inputs [0-1] where 1 is worst
    n_cost = normalize(max(0, cost_usd - baseline_cost_usd), baseline_cost_usd * 0.5)
    n_risk = normalize(risk_score, 100)
    n_delay = normalize(max(0, delay_hours), 168) # 1 week max normalization
    n_buffer = normalize(max(0, min_buffer_days - buffer_days), min_buffer_days)
    n_congestion = normalize(congestion_score, 100)

    penalty = (
        SCORING_WEIGHTS["cost"] * n_cost +
        SCORING_WEIGHTS["risk"] * n_risk +
        SCORING_WEIGHTS["delay"] * n_delay +
        SCORING_WEIGHTS["buffer"] * n_buffer +
        SCORING_WEIGHTS["congestion"] * n_congestion
    )

    final_score = score_from_penalty(penalty)
    
    explanation = build_explanation(
        label=label,
        score=final_score,
        delay_h=delay_hours,
        risk_score=risk_score,
        buffer_days=buffer_days,
        cost_delta=int(cost_usd - baseline_cost_usd),
        passages=passages
    )

    return {
        "finalRouteScore": final_score,
        "explanation": explanation,
        "scoreBreakdown": {
            "cost": n_cost,
            "risk": n_risk,
            "delay": n_delay,
            "buffer": n_buffer,
            "congestion": n_congestion
        }
    }
