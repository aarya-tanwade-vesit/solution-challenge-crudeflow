"""
NEMO CrudeFlow — Module 2: Cost Engine
========================================
Deterministic maritime cost calculation.
"""

from __future__ import annotations

from decimal import Decimal
from typing import Any

from app.optimization.constants import (
    DAILY_HIRE_RATE_USD,
    DEFAULT_FUEL_PRICE_USD_PER_MT,
    DEMURRAGE_RATE_USD_PER_DAY,
    FUEL_CONSUMPTION_MT_PER_DAY,
)
from app.optimization.utils import congestion_multiplier, round_usd, to_decimal


def calculate_cost(
    eta_hours: float,
    delay_hours: float,
    vessel_type: str,
    speed_knots: float,
    cargo_bbl: float,
    traversed_passages: list[str],
    baseline_cost_usd: int,
    port_occupancy_pct: float,
) -> Any:
    """
    Calculate fuel, hire, demurrage, and war-risk costs.
    """
    eta_days = to_decimal(eta_hours / 24.0)
    delay_days = max(Decimal("0"), to_decimal(delay_hours / 24.0))
    
    # 1. Fuel Cost
    consumption_base = FUEL_CONSUMPTION_MT_PER_DAY.get(vessel_type, FUEL_CONSUMPTION_MT_PER_DAY["default"])
    # Speed penalty: fuel consumption typically cube of speed (simplified linear factor for now)
    speed_factor = to_decimal(speed_knots / 12.5) 
    fuel_cost = round_usd(eta_days * consumption_base * DEFAULT_FUEL_PRICE_USD_PER_MT * speed_factor)
    
    # 2. Vessel Hire
    hire_rate = DAILY_HIRE_RATE_USD.get(vessel_type, DAILY_HIRE_RATE_USD["default"])
    vessel_hire_cost = round_usd(eta_days * hire_rate)
    
    # 3. Demurrage (Congestion based)
    demurrage_rate = DEMURRAGE_RATE_USD_PER_DAY.get(vessel_type, DEMURRAGE_RATE_USD_PER_DAY["default"])
    mult = congestion_multiplier(port_occupancy_pct)
    demurrage_cost = round_usd(delay_days * demurrage_rate * mult)
    
    # 4. War Risk / Insurance
    # In this demo, we assume war risk is handled in the risk engine or added as a flat premium here
    war_risk_premium = 0 # Can be added if needed
    
    total_cost = fuel_cost + vessel_hire_cost + demurrage_cost + war_risk_premium
    
    class CostResult:
        def __init__(self, fuel, hire, demur, war, total, baseline):
            self.fuelCostUsd = fuel
            self.vesselHireCostUsd = hire
            self.demurrageCostUsd = demur
            self.warRiskPremiumUsd = war
            self.totalRouteCostUsd = total
            self.costDeltaVsBaselineUsd = total - baseline
            
    return CostResult(fuel_cost, vessel_hire_cost, demurrage_cost, war_risk_premium, total_cost, baseline_cost_usd)
