from __future__ import annotations

from typing import Any

from app.optimization.comparison_engine import ComparisonEngine
from app.optimization.diagnosis_engine import DiagnosisEngine
from app.optimization.intervention_engine import InterventionEngine
from app.optimization.optimizer_engine import OptimizerEngine
from app.optimization.schemas import OptimizationEnvelope, OptimizationRequest, RouteAnalysis


comparison_engine = ComparisonEngine()
optimizer_engine = OptimizerEngine()
intervention_engine = InterventionEngine()
diagnosis_engine = DiagnosisEngine()


def build_request(payload: dict[str, Any] | OptimizationRequest | None = None) -> OptimizationRequest:
    if isinstance(payload, OptimizationRequest):
        return payload
    normalized = dict(payload or {})
    if "portCongestion" not in normalized and "portOccupancy" in normalized:
        normalized["portCongestion"] = normalized["portOccupancy"]
    if "weatherRisk" not in normalized and "weatherSeverity" in normalized:
        normalized["weatherRisk"] = normalized["weatherSeverity"]
    if "insurancePremiumIncreasePct" not in normalized and "insuranceIncreasePct" in normalized:
        normalized["insurancePremiumIncreasePct"] = normalized["insuranceIncreasePct"]
    if "vesselSpeedKnots" not in normalized and "vesselSpeed" in normalized:
        normalized["vesselSpeedKnots"] = normalized["vesselSpeed"]
    if "refineryBufferDays" in normalized and "currentInventoryBbl" not in normalized:
        daily = float(normalized.get("dailyConsumptionBbl") or 310_000)
        normalized["currentInventoryBbl"] = float(normalized["refineryBufferDays"]) * daily
    refinery = normalized.pop("refinery", None)
    if isinstance(refinery, dict):
        if "inventoryDays" in refinery and "currentInventoryBbl" not in normalized:
            daily = float(normalized.get("dailyConsumptionBbl") or 310_000)
            normalized["currentInventoryBbl"] = float(refinery["inventoryDays"]) * daily
        if "minimumBufferDays" in refinery:
            normalized["minimumBufferDays"] = refinery["minimumBufferDays"]
    route = normalized.pop("route", None)
    if isinstance(route, dict):
        normalized.setdefault("origin", route.get("origin"))
        normalized.setdefault("destination", route.get("destination"))
        if route.get("etaHours") and "baselineEtaDays" not in normalized:
            normalized["baselineEtaDays"] = float(route["etaHours"]) / 24
    return OptimizationRequest.model_validate(normalized)


def analyze(payload: dict[str, Any] | None = None) -> dict[str, Any]:
    request = build_request(payload)
    route = comparison_engine.analyze_current_route(request)
    analysis = RouteAnalysis(
        routeName=route.route_name,
        routeCoordinates=route.route_coordinates,
        mapCoordinates=route.map_coordinates,
        distanceNm=route.distance_nm,
        etaHours=route.eta_hours,
        etaDays=route.eta_days,
        routingProvider=route.routing_provider,
        passagesTraversed=route.passage_labels,
        warnings=route.warnings,
    )
    return OptimizationEnvelope(request=request, analysis=analysis).model_dump()


def compare(payload: dict[str, Any] | None = None) -> dict[str, Any]:
    request = build_request(payload)
    options = comparison_engine.compare(request)
    return OptimizationEnvelope(request=request, options=options).model_dump()


def optimize(payload: dict[str, Any] | None = None) -> dict[str, Any]:
    request = build_request(payload)
    options = comparison_engine.compare(request)
    decision = optimizer_engine.optimize(request, options)
    recovery = None if decision.selectedOption else intervention_engine.recover(request, options)
    diagnosis = diagnosis_engine.diagnose(decision, recovery)
    return OptimizationEnvelope(
        request=request,
        options=options,
        decision=decision,
        recovery=recovery,
        diagnosis=diagnosis,
    ).model_dump()


def recover(payload: dict[str, Any] | None = None) -> dict[str, Any]:
    request = build_request(payload)
    options = comparison_engine.compare(request)
    decision = optimizer_engine.optimize(request, options)
    recovery = intervention_engine.recover(request, options)
    return OptimizationEnvelope(request=request, options=options, decision=decision, recovery=recovery).model_dump()


def diagnose(payload: dict[str, Any] | None = None) -> dict[str, Any]:
    request = build_request(payload)
    options = comparison_engine.compare(request)
    decision = optimizer_engine.optimize(request, options)
    recovery = None if decision.selectedOption else intervention_engine.recover(request, options)
    diagnosis = diagnosis_engine.diagnose(decision, recovery)
    return OptimizationEnvelope(
        request=request,
        options=options,
        decision=decision,
        recovery=recovery,
        diagnosis=diagnosis,
    ).model_dump()


def module1_integration_hook(payload: dict[str, Any] | None = None) -> tuple[dict[str, Any], str]:
    data = optimize(payload)
    decision = data.get("decision") or {}
    selected = decision.get("selectedRoute") or (data.get("options") or [{}])[0]
    options = data.get("options") or []
    legacy_alternatives = [
        {
            "option": option["option"],
            "name": f"{option['option']} - {option['optionName']}",
            "strategy": option["strategy"],
            "score": option["routeQualityScore"],
            "objectiveValue": option["finalRouteScore"],
            "confidence": max(0.5, min(0.96, option["routeQualityScore"] / 100)),
            "route": option["route"],
            "geometry": option["routeCoordinates"],
            "routingProvider": option["routingProvider"],
            "traversedPassages": option["passagesTraversed"],
            "validation": {
                "feasible": option["decisionLabel"] != "Constraint Breach",
                "routingProvider": option["routingProvider"],
                "distanceNm": option["distanceNm"],
                "etaHours": option["etaHours"],
                "traversedPassages": option["passagesTraversed"],
                "warnings": option["warnings"],
                "objectiveInputs": {
                    "delayHours": option["delayHours"],
                    "riskScore": option["weightedRiskScore"],
                    "costDeltaUsd": option["validation"].get("costDeltaUsd", 0),
                    "refineryBufferDays": option["refineryBufferDays"],
                    "portCongestionScore": data["request"]["portCongestion"],
                    "insurancePremiumUsd": option["warRiskPremium"],
                },
            },
            "delayHours": option["delayHours"],
            "costDelta": option["validation"].get("costDeltaUsd", 0),
            "riskDelta": option["weightedRiskScore"] - data["request"]["geopoliticalRisk"],
            "riskReduction": max(0, data["request"]["geopoliticalRisk"] - option["weightedRiskScore"]),
            "refineryBufferDays": option["refineryBufferDays"],
            "refineryBufferImpactDays": option["refineryImpact"]["bufferDeltaDays"],
            "etaConfidence": max(0.5, min(0.96, option["routeQualityScore"] / 100)),
            "tradeoffs": {
                "delay": option["delayHours"],
                "costDeltaUsd": option["validation"].get("costDeltaUsd", 0),
                "riskScore": option["weightedRiskScore"],
                "bufferDays": option["refineryBufferDays"],
            },
            "explanation": option["explanation"],
            "logistics": option["downstreamLogistics"],
        }
        for option in options
    ]
    legacy = {
        "recommendedOption": selected.get("option"),
        "confidence": max(0.5, min(0.96, selected.get("routeQualityScore", 80) / 100)),
        "reason": selected.get("explanation", "Optimization complete."),
        "alternatives": legacy_alternatives,
        "tradeoffs": {item["option"]: item["tradeoffs"] for item in legacy_alternatives},
        "impact": {
            "delayHours": selected.get("delayHours", 0),
            "costDelta": selected.get("validation", {}).get("costDeltaUsd", 0),
            "riskReduction": max(0, data["request"]["geopoliticalRisk"] - selected.get("weightedRiskScore", 0)),
            "riskDelta": selected.get("weightedRiskScore", 0) - data["request"]["geopoliticalRisk"],
            "refineryBufferDays": selected.get("refineryBufferDays", 0),
            "bufferImpactDays": selected.get("refineryImpact", {}).get("bufferDeltaDays", 0),
            "downstreamActions": len(selected.get("downstreamLogistics", [])),
        },
        "recommendedRoute": selected.get("route", []),
        "generatedRoutes": options,
        "solver": decision.get("solver", "ortools-cp-sat"),
        "sampleOutput": data,
    }
    return legacy, "optimizationEngine:searoute-py:ortools"


def optimize_route_payload(payload: dict[str, Any] | None = None) -> dict[str, Any]:
    return optimize(payload)


def optimize_route(request: OptimizationRequest) -> dict[str, Any]:
    return optimize(request.model_dump())
