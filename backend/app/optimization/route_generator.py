from app.optimization.constraints import clamp, pct
from app.optimization.maritime_router import sea_route
from app.optimization.models import OptimizationRequest, RouteCandidate


def _buffer_after_delay(request: OptimizationRequest, delay_hours: float) -> float:
    return round(max(0, request.refinery.inventoryDays - delay_hours / 24), 2)


def _candidate(
    request: OptimizationRequest,
    option: str,
    name: str,
    strategy: str,
    route: list[str],
    distance_factor: float,
    delay_hours: float,
    risk_factor: float,
    congestion_factor: float,
    stability: float,
    eta_confidence: float,
    notes: list[str],
    restrictions: list[str] | None = None,
) -> RouteCandidate:
    maritime_route = sea_route(route, speed_knot=max(8, request.route.distanceNm / max(request.route.etaHours, 1)), restrictions=restrictions)
    distance = round(maritime_route.distance_nm * distance_factor)
    weather_drag = request.weatherSeverity / 100 * 10
    eta_hours = round(maritime_route.duration_hours * distance_factor + delay_hours + weather_drag, 1)
    fuel_cost = round(request.route.baselineCostUsd * distance_factor * (request.fuelCostUsdPerTon / 720))
    demurrage = round(max(0, delay_hours) / 24 * request.demurrageUsdPerDay)
    risk_score = pct(request.riskLevel * risk_factor + request.weatherSeverity * 0.18)
    congestion = pct(request.congestion * congestion_factor + request.portOccupancyPct * 0.22)
    insurance = round(request.route.baselineCostUsd * (request.insuranceIncreasePct / 100) * (risk_score / 100) * 0.18)
    buffer_days = _buffer_after_delay(request, max(0, eta_hours - request.route.etaHours))
    return RouteCandidate(
        option=option,  # type: ignore[arg-type]
        name=name,
        strategy=strategy,  # type: ignore[arg-type]
        route=route,
        geometry=maritime_route.coordinates,
        routingProvider=maritime_route.provider,
        traversedPassages=maritime_route.traversed_passages,
        feasible=maritime_route.feasible,
        validationWarnings=maritime_route.warnings,
        distanceNm=distance,
        etaHours=eta_hours,
        delayHours=round(eta_hours - request.route.etaHours, 1),
        fuelCostUsd=fuel_cost,
        demurrageUsd=demurrage,
        insurancePremiumUsd=insurance,
        portCongestionScore=congestion,
        riskScore=risk_score,
        riskExposureHours=round(eta_hours * risk_score / 100, 1),
        refineryBufferDays=buffer_days,
        refineryBufferImpactDays=round(buffer_days - request.refinery.inventoryDays, 2),
        stabilityScore=clamp(stability, 0, 1),
        etaConfidence=clamp(eta_confidence, 0, 1),
        notes=notes,
    )


def generate_route_candidates(request: OptimizationRequest) -> list[RouteCandidate]:
    origin = request.route.origin
    destination = request.route.destination
    delay_pressure = request.delayProbability * 20
    occupancy_delay = max(0, request.portOccupancyPct - 60) * 0.35

    return [
        _candidate(
            request,
            "A",
            "Cost Optimized - Hormuz Normal Route",
            "cost",
            [origin, "Ras Tanura Anchorage", "Strait of Hormuz", "Arabian Sea", destination],
            1.0,
            delay_pressure + occupancy_delay,
            0.98,
            1.05,
            0.72,
            0.78,
            ["Lowest sailing distance and fuel burn.", "Retains exposure around Hormuz and Kochi berth queues."],
        ),
        _candidate(
            request,
            "B",
            "Time Optimized - Fujairah Bunker and Priority Berth",
            "time",
            [origin, "Fujairah", "Arabian Sea Fast Lane", "Priority Kochi Berth", destination],
            1.06,
            max(0, delay_pressure * 0.35 - 8),
            0.86,
            0.82,
            0.8,
            0.86,
            ["Uses Fujairah staging and priority berth slot.", "Higher bunker and port handling cost."],
        ),
        _candidate(
            request,
            "C",
            "Risk Optimized - Fujairah Staging and Buffered Arrival",
            "risk",
            [origin, "Fujairah", "Lakshadweep Holding Window", destination],
            1.04,
            max(8, delay_pressure * 0.45),
            0.52,
            0.7,
            0.9,
            0.9,
            ["Uses a real sea route with staging outside the Gulf.", "Reduces time spent in high-risk waters after Hormuz transit."],
        ),
        _candidate(
            request,
            "D",
            "Port Holding Pattern - Fujairah Delay Then Kochi",
            "holding",
            [origin, "Fujairah Holding", "Arabian Sea", "Kochi Outer Anchorage", destination],
            1.03,
            delay_pressure + 24 + occupancy_delay,
            0.74,
            0.92,
            0.68,
            0.74,
            ["Waits for berth availability before committing to final leg.", "Protects port queue position but increases demurrage."],
        ),
    ]
