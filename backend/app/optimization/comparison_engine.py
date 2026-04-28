"""
NEMO CrudeFlow — Module 2: Comparison Engine
==============================================
Generates and compares multiple route strategies.
"""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

from app.optimization.constants import OPTION_LABELS, PORTS
from app.optimization.cost_engine import calculate_cost
from app.optimization.refinery_engine import calculate_refinery_impact
from app.optimization.risk_engine import calculate_risk
from app.optimization.scoring_engine import calculate_score
from app.optimization.schemas import CompareRequest, ComparisonResult, RouteBreakdown


from app.optimization.maritime_router import MaritimeRouter

router = MaritimeRouter()

def compare_options(request: CompareRequest) -> ComparisonResult:
    """
    Generate all options and rank them.
    """
    options: list[RouteBreakdown] = []
    
    # Strategy A: Normal Route
    options.append(_build_option(request, "A", 1.0, 0.0, 1.0, ["Strait of Hormuz"]))
    
    # Strategy B: Wait / Hold
    options.append(_build_option(request, "B", 1.0, 48.0, 0.8, ["Fujairah Holding"]))
    
    # Strategy C: Fujairah Staging
    options.append(_build_option(request, "C", 1.05, 12.0, 0.6, ["Fujairah Staging"]))
    
    # Strategy D: Emergency Logistics
    options.append(_build_option(request, "D", 1.15, 24.0, 0.4, ["Alternate Corridor"]))

    ranked = sorted(options, key=lambda x: x.finalRouteScore, reverse=True)
    best = ranked[0]

    comparison_table = [
        {
            "option": opt.optionId,
            "label": opt.label,
            "score": opt.finalRouteScore,
            "cost": opt.totalRouteCostUsd,
            "risk": opt.weightedRiskScore,
            "delay": opt.etaHours,
            "buffer": opt.refineryBufferDays,
        }
        for opt in ranked
    ]

    return ComparisonResult(
        rankedOptions=ranked,
        recommendedOptionId=best.optionId,
        recommendedLabel=best.label,
        comparisonTable=comparison_table,
        summary=f"Recommended strategy is {best.label} with a score of {best.finalRouteScore:.1f}.",
        asOf=datetime.now(UTC).isoformat(),
    )


def _build_option(
    request: CompareRequest,
    option_id: str,
    dist_factor: float,
    extra_delay: float,
    risk_factor: float,
    passages: list[str],
) -> RouteBreakdown:
    # 1. Routing - Real Maritime Routing
    # For now, we use the router for the baseline and then apply factors
    # In a full impl, we'd route via specific waypoints for B/C/D
    route_res = router.calculate_route([request.origin, request.destination], request.vesselSpeedKnots)
    
    dist = route_res.distance_nm * dist_factor
    base_eta = dist / request.vesselSpeedKnots
    total_eta = base_eta + extra_delay
    
    # 2. Risk
    risk_res = calculate_risk(
        base_risk=request.geopoliticalRisk, # Use geopolitical as baseline
        weather_severity=request.weatherRisk,
        congestion_score=request.portCongestion,
        insurance_increase_pct=request.insurancePremiumIncreasePct,
        traversed_passages=passages,
        risk_weights_override=request.riskWeights
    )
    
    # 3. Cost
    cost_res = calculate_cost(
        eta_hours=total_eta,
        delay_hours=total_eta - route_res.eta_hours,
        vessel_type=request.vesselType,
        speed_knots=request.vesselSpeedKnots,
        cargo_bbl=request.cargoBbl,
        traversed_passages=passages,
        baseline_cost_usd=500000, # Estimated baseline
        port_occupancy_pct=request.portCongestion
    )
    
    # 4. Refinery
    refinery_res = calculate_refinery_impact(
        current_inventory_bbl=request.currentInventoryBbl,
        daily_consumption_bbl=request.dailyConsumptionBbl,
        eta_hours=total_eta,
        cargo_bbl=request.cargoBbl,
        incoming_other_bbl=0.0 # Could be extended
    )
    
    # 5. Scoring
    score_res = calculate_score(
        cost_usd=cost_res.totalRouteCostUsd,
        baseline_cost_usd=500000,
        risk_score=risk_res["weightedRiskScore"],
        delay_hours=total_eta - route_res.eta_hours,
        buffer_days=refinery_res["bufferDays"],
        min_buffer_days=request.minimumBufferDays,
        congestion_score=request.portCongestion,
        label=OPTION_LABELS.get(option_id, "Unknown"),
        passages=passages
    )
    
    return RouteBreakdown(
        optionId=option_id, # type: ignore
        label=OPTION_LABELS.get(option_id, "Unknown"),
        distanceNm=dist,
        etaHours=total_eta,
        etaDays=total_eta / 24.0,
        traversedPassages=passages,
        fuelCostUsd=cost_res.fuelCostUsd,
        vesselHireCostUsd=cost_res.vesselHireCostUsd,
        demurrageCostUsd=cost_res.demurrageCostUsd,
        warRiskPremiumUsd=cost_res.warRiskPremiumUsd,
        totalRouteCostUsd=cost_res.totalRouteCostUsd,
        costDeltaVsBaselineUsd=cost_res.costDeltaVsBaselineUsd,
        weightedRiskScore=risk_res["weightedRiskScore"],
        geopoliticalRisk=risk_res["breakdown"]["geopolitical"],
        weatherRisk=risk_res["breakdown"]["weather"],
        congestionRisk=risk_res["breakdown"]["congestion"],
        insuranceRisk=risk_res["breakdown"]["insurance"],
        chokePointPenalty=risk_res["chokePointPenalty"],
        riskDeltaVsBaseline=risk_res["riskDelta"],
        inventoryAtArrivalBbl=refinery_res["inventoryAtArrivalBbl"],
        postArrivalInventoryBbl=refinery_res["postArrivalInventoryBbl"],
        refineryBufferDays=refinery_res["bufferDays"],
        shortageBbl=refinery_res["shortageBbl"],
        shortageRisk=refinery_res["shortageRisk"],
        consumedBeforeArrivalBbl=refinery_res["consumedBeforeArrivalBbl"],
        finalRouteScore=score_res["finalRouteScore"],
        decisionLabel=score_res["explanation"].split(".")[0],
        explanation=score_res["explanation"],
        scoreBreakdown=score_res["scoreBreakdown"],
        notes=route_res.warnings,
        mapCoordinates=route_res.map_coordinates,
        routingProvider=route_res.routing_provider
    )
