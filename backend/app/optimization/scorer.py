from app.optimization.constraints import clamp
from app.optimization.models import OptimizationRequest, RouteCandidate, ScoredOption


WEIGHTS = {
    "delay": 0.14,
    "risk": 0.32,
    "cost": 0.16,
    "buffer": 0.18,
    "congestion": 0.1,
    "insurance": 0.07,
    "stability": 0.05,
}


def _weights(request: OptimizationRequest) -> dict[str, float]:
    weights = {**WEIGHTS, **{key: value for key, value in request.riskWeights.items() if key in WEIGHTS and value >= 0}}
    total = sum(weights.values()) or 1
    return {key: value / total for key, value in weights.items()}


def _norm(value: float, high: float) -> float:
    return clamp(value / high, 0, 1)


def score_candidate(candidate: RouteCandidate, request: OptimizationRequest) -> ScoredOption:
    total_cost = candidate.fuelCostUsd + candidate.demurrageUsd + candidate.insurancePremiumUsd
    baseline_cost = request.route.baselineCostUsd
    cost_delta = round(total_cost - baseline_cost)
    risk_delta = round(candidate.riskScore - request.route.baselineRisk, 1)
    risk_reduction = round(max(0, request.route.baselineRisk - candidate.riskScore), 1)
    buffer_shortfall = max(0, request.refinery.minimumBufferDays - candidate.refineryBufferDays)
    weights = _weights(request)

    penalty = (
        weights["delay"] * _norm(max(0, candidate.delayHours), 96)
        + weights["risk"] * _norm(candidate.riskScore, 100)
        + weights["cost"] * _norm(max(0, cost_delta), baseline_cost * 0.5)
        + weights["buffer"] * _norm(buffer_shortfall, request.refinery.minimumBufferDays)
        + weights["congestion"] * _norm(candidate.portCongestionScore, 100)
        + weights["insurance"] * _norm(candidate.insurancePremiumUsd, baseline_cost * 0.2)
        + weights["stability"] * (1 - candidate.stabilityScore)
    )
    score = round(100 * (1 - clamp(penalty, 0, 1)), 2)
    if candidate.strategy == "risk" and risk_reduction >= 12 and candidate.refineryBufferDays >= request.refinery.minimumBufferDays:
        score = round(min(100, score + 6), 2)
    confidence = round(clamp((candidate.etaConfidence * 0.48) + (candidate.stabilityScore * 0.34) + ((100 - candidate.riskScore) / 100 * 0.18), 0.45, 0.97), 2)
    objective = round(penalty * 10_000, 2)

    explanation = (
        f"{candidate.name} scores {score:.1f} by balancing {candidate.delayHours:.1f}h delay, "
        f"{risk_reduction:.1f} risk-point reduction, and {candidate.refineryBufferDays:.1f} buffer days."
    )
    return ScoredOption(
        option=candidate.option,
        name=candidate.name,
        strategy=candidate.strategy,
        score=score,
        objectiveValue=objective,
        confidence=confidence,
        route=candidate.route,
        geometry=candidate.geometry,
        routingProvider=candidate.routingProvider,
        traversedPassages=candidate.traversedPassages,
        validation={
            "feasible": candidate.feasible,
            "routingProvider": candidate.routingProvider,
            "distanceNm": candidate.distanceNm,
            "etaHours": candidate.etaHours,
            "traversedPassages": candidate.traversedPassages,
            "warnings": candidate.validationWarnings,
            "objectiveInputs": {
                "delayHours": candidate.delayHours,
                "riskScore": candidate.riskScore,
                "costDeltaUsd": cost_delta,
                "refineryBufferDays": candidate.refineryBufferDays,
                "portCongestionScore": candidate.portCongestionScore,
                "insurancePremiumUsd": candidate.insurancePremiumUsd,
                "weights": weights,
            },
        },
        delayHours=candidate.delayHours,
        costDelta=cost_delta,
        riskDelta=risk_delta,
        riskReduction=risk_reduction,
        refineryBufferDays=candidate.refineryBufferDays,
        refineryBufferImpactDays=candidate.refineryBufferImpactDays,
        etaConfidence=candidate.etaConfidence,
        tradeoffs={
            "delay": candidate.delayHours,
            "costDeltaUsd": cost_delta,
            "riskDelta": risk_delta,
            "bufferImpactDays": candidate.refineryBufferImpactDays,
            "congestionScore": candidate.portCongestionScore,
            "insurancePremiumUsd": candidate.insurancePremiumUsd,
        },
        explanation=explanation,
        logistics=[],
    )
