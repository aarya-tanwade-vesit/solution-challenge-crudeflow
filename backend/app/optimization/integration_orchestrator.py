from typing import Any
from datetime import datetime
from app.data.seed_data import VESSELS
from app.optimization import schemas, comparison_engine

def get_vessel_optimization_payload(vessel_id: str, sliders: dict[str, Any] | None = None) -> schemas.CompareRequest:
    """
    Bridges the gap between raw vessel data and the Module 2 Optimization schemas.
    """
    vessel = next((v for v in VESSELS if v["id"] == vessel_id), VESSELS[0])
    
    # Default values or slider overrides
    vessel_speed = sliders.get("vesselSpeed", 12.5) if sliders else 12.5
    port_congestion = sliders.get("portCongestion", 35) if sliders else 35
    risk_level = sliders.get("riskLevel", 40) if sliders else 40
    
    return schemas.CompareRequest(
        vesselId=vessel["id"],
        vesselName=vessel["name"],
        origin=vessel["origin"],
        destination=vessel["destination"],
        vesselType=vessel["type"],
        vesselSpeedKnots=vessel_speed,
        portCongestion=port_congestion,
        weatherRisk=round(risk_level * 0.4),
        geopoliticalRisk=risk_level,
        insurancePremiumIncreasePct=8.5 if risk_level > 50 else 2.0,
        currentInventoryBbl=2450000,
        dailyConsumptionBbl=630000,
        minimumBufferDays=3.0
    )

def generate_decision_data(vessel_id: str) -> dict[str, Any]:
    """
    Generates a full decision record with Module 2 optimization evidence.
    """
    payload = get_vessel_optimization_payload(vessel_id)
    result = comparison_engine.compare_options(payload)
    
    return {
        "id": f"dec-{vessel_id}-{int(datetime.now().timestamp())}",
        "vesselId": vessel_id,
        "vesselName": payload.vesselName,
        "type": "RE-ROUTE",
        "priority": "critical" if result.rankedOptions[0].shortageRisk else "high",
        "status": "pending",
        "confidence": round(result.rankedOptions[0].finalRouteScore),
        "source": "Module 2 Optimization Engine",
        "summary": result.rankedOptions[0].decisionLabel,
        "description": result.rankedOptions[0].explanation,
        "evidence": [
            {
                "id": "e1",
                "type": "trade-offs",
                "label": "Strategy Comparison",
                "data": result.model_dump()["rankedOptions"]
            },
            {
                "id": "e2",
                "type": "risk-breakdown",
                "label": "Risk Assessment",
                "data": {
                    "score": result.rankedOptions[0].weightedRiskScore,
                    "premium": result.rankedOptions[0].warRiskPremiumUsd
                }
            }
        ]
    }
