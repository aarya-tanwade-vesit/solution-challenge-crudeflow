"""
NEMO CrudeFlow — Module 2: Refinery Engine
============================================
Calculates refinery inventory levels and buffer days based on ETA.
"""

from __future__ import annotations

from typing import Any

from app.optimization.utils import buffer_at_arrival


def calculate_refinery_impact(
    current_inventory_bbl: float,
    daily_consumption_bbl: float,
    eta_hours: float,
    cargo_bbl: float,
    incoming_other_bbl: float = 0.0,
) -> dict[str, Any]:
    """
    Predict inventory state at the time of vessel arrival.
    """
    eta_days = eta_hours / 24.0
    impact = buffer_at_arrival(
        current_inventory_bbl=current_inventory_bbl,
        daily_consumption_bbl=daily_consumption_bbl,
        eta_days=eta_days,
        incoming_bbl=cargo_bbl + incoming_other_bbl,
    )
    
    return impact
