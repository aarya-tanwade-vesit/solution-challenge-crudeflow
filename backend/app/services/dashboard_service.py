from datetime import UTC, datetime
from typing import Any

from app.data.seed_data import PORTS, VESSELS
from app.services import map_service


from app.optimization import risk_engine, integration_orchestrator, constants

def _risk_inputs() -> dict[str, int]:
    # In a real app, these would come from live feeds
    return {"geopolitical": 82, "weather": 54, "congestion": 76, "insurance": 71}


def kpis(workspace_id: str = "bpcl-mumbai") -> tuple[dict[str, Any], str]:
    inputs = _risk_inputs()
    # Use real risk engine
    risk_score = risk_engine.calculate_risk(
        inputs["geopolitical"], 
        inputs["weather"], 
        inputs["congestion"], 
        inputs["insurance"],
        traversed_passages=["Strait of Hormuz", "Red Sea Security Corridor"],
    )
    
    # Calculate real-ish demurrage based on fleet state
    congestion_factor = 1 + max(p["congestionPct"] for p in PORTS) / 100
    delayed_vessels = [v for v in VESSELS if v["status"] in {"delayed", "highRisk", "critical"}]
    demurrage = round(sum((v["delayProbability"] / 100) * 36 * v["vesselDailyRate"] / 24 * congestion_factor for v in delayed_vessels))
    
    # Refinery logic from Module 2 constants
    current_inventory = 2_450_000
    incoming = sum(v["cargoVolumeBbl"] for v in VESSELS if v["ownership"] == "BPCL") * 0.34
    committed = 1_200_000
    daily_consumption = float(constants.REFINERY_DAILY_CONSUMPTION_BBL)
    buffer_days = round((current_inventory + incoming - committed) / daily_consumption, 1)
    
    production_risk = min(
        100,
        round((5 - min(buffer_days, 5)) * 13 + risk_score["weightedRiskScore"] * 0.45),
    )
    cost_of_inaction = round(demurrage + production_risk * 8500 + 180000)
    
    as_of = datetime.now(UTC).isoformat()
    payload = {
        "demurrageForecast": {
            "id": "demurrage", 
            "label": "Demurrage Liability Forecast", 
            "value": demurrage, 
            "currency": "USD", 
            "trend": "up", 
            "trendPercentage": 18, 
            "impact": "High congestion at Mumbai and Kochi is increasing tanker wait-time exposure.", 
            "color": "red", 
            "status": "warning", 
            "confidence": 86, 
            "explanation": "delayHours * vesselDailyRate * congestionFactor across delayed vessels", 
            "updatedAt": as_of, 
            "breakdown": [{"vesselName": v["name"], "waitTime": round(v["delayProbability"] / 100 * 36), "dailyRate": v["vesselDailyRate"], "forecast": round(v["delayProbability"] / 100 * 36 * v["vesselDailyRate"] / 24 * congestion_factor)} for v in delayed_vessels], 
            "portCongestion": "high"
        },
        "bufferDaysRemaining": {
            "id": "buffer", 
            "label": "Buffer Days Remaining", 
            "value": buffer_days, 
            "unit": "Days", 
            "trend": "down", 
            "trendPercentage": 5, 
            "impact": "Refinery system can absorb several days of disruption, but margin is tightening.", 
            "color": "amber", 
            "status": "warning", 
            "confidence": 88, 
            "explanation": "(currentInventoryBbl + incomingBbl - committedUsageBbl) / dailyConsumptionBbl", 
            "updatedAt": as_of, 
            "currentInventory": current_inventory, 
            "dailyConsumption": daily_consumption, 
            "incomingShipments": [{"vesselName": v["name"], "etaDate": v["etaUtc"], "cargoVolume": v["cargoVolumeBbl"]} for v in VESSELS[:4]], 
            "riskThreshold": 5
        },
        "maritimeRiskIndex": {
            "id": "risk", 
            "label": "Maritime Risk Index", 
            "value": round(risk_score["weightedRiskScore"]), 
            "unit": "%", 
            "trend": "up", 
            "trendPercentage": 12, 
            "impact": "Geopolitical and congestion risk are the dominant contributors.", 
            "color": "blue", 
            "status": "warning", 
            "confidence": 84, 
            "explanation": "Weighted average of geopolitics, weather, congestion, and insurance.", 
            "updatedAt": as_of, 
            "breakdown": {**inputs, "weights": {"geopolitical": 0.4, "weather": 0.2, "congestion": 0.2, "insurance": 0.2}}, 
            "affectedVessels": [v["name"] for v in delayed_vessels], 
            "riskZones": ["Strait of Hormuz", "Red Sea Security Corridor"]
        },
        "costOfInaction": {
            "id": "inaction", 
            "label": "Cost of Inaction", 
            "value": cost_of_inaction, 
            "currency": "USD", 
            "unit": "/day", 
            "trend": "up", 
            "trendPercentage": 25, 
            "impact": "Financial exposure escalates if route and berth decisions remain pending.", 
            "color": "purple", 
            "status": "critical", 
            "confidence": 82, 
            "explanation": "riskPenalty + demurrage + productionLoss", 
            "updatedAt": as_of, 
            "breakdown": {"demurrageDaily": demurrage, "productionLossDaily": production_risk * 8500, "opportunityCostDaily": 180000}, 
            "delayDays": 3, 
            "projectedCost": cost_of_inaction * 3
        },
        "asOf": as_of,
        "workspaceId": workspace_id,
        "isSimulated": False,
    }
    return payload, "module2-engine"


def summary() -> tuple[dict[str, Any], str]:
    kpi_data, source = kpis()
    affected_routes = [
        {"routeCode": "R001", "routeName": "Ras Tanura → Kochi", "disruptionReason": "Hormuz risk", "delayHours": 42, "riskScore": 86, "impactedVessels": 2, "status": "critical"},
        {"routeCode": "R002", "routeName": "Basrah → Mumbai", "disruptionReason": "Port congestion", "delayHours": 24, "riskScore": 62, "impactedVessels": 1, "status": "warning"},
        {"routeCode": "R003", "routeName": "Fujairah → Jamnagar", "disruptionReason": "Normal watch", "delayHours": 4, "riskScore": 31, "impactedVessels": 1, "status": "normal"},
    ]
    return {"status": "warning", "kpis": kpi_data, "affectedRoutes": affected_routes, "impactTrajectory": [{"hour": h, "avgDelayHours": 12 + h * 0.8, "productionRisk": 41 + h * 0.5} for h in range(0, 49, 6)], "asOf": datetime.now(UTC).isoformat()}, source


def operations() -> tuple[dict[str, Any], str]:
    fleet_payload, source = map_service.fleet()
    return {"vessels": fleet_payload["vessels"], "count": fleet_payload["count"], "asOf": fleet_payload["asOf"]}, source


def decision_engine_preview(decisions: list[dict[str, Any]]) -> tuple[dict[str, Any], str]:
    pending = [d for d in decisions if d["status"] == "pending"]
    top = sorted(pending, key=lambda d: (d["priority"] == "critical", d["confidence"]), reverse=True)[0]
    return {"pendingCount": len(pending), "criticalCount": len([d for d in pending if d["priority"] == "critical"]), "topDecision": top}, "mockFallback"

