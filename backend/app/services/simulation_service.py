from datetime import UTC, datetime
from typing import Any

from app.data.seed_data import SCENARIOS, VESSELS
from app.services.db_utils import fetch_json_rows, upsert_json_row

_saved: dict[str, dict[str, Any]] = {}


DEFAULT_SLIDERS = {"vesselSpeed": 9, "portCongestion": 60, "riskLevel": 85, "refineryThroughput": 70, "jettyAvailable": True, "inventoryCapacity": 40, "dischargeRate": 5000, "insuranceMultiplier": 1.8, "fuelPriceUsd": 720}


def scenarios() -> tuple[dict[str, Any], str]:
    rows, source = fetch_json_rows("simulation_scenarios")
    return {"scenarios": rows or SCENARIOS, "activeDemoScenario": "hormuz-blockade", "asOf": datetime.now(UTC).isoformat()}, source


def run(params: dict[str, Any]) -> tuple[dict[str, Any], str]:
    sliders = {**DEFAULT_SLIDERS, **(params.get("sliders") or {})}
    day = float(params.get("day") or 1)
    congestion_factor = 1 + (sliders["portCongestion"] - 25) / 100
    speed_factor = 12 / max(float(sliders["vesselSpeed"]), 6)
    risk_factor = 1 + (sliders["riskLevel"] - 30) / 120
    jetty_factor = 1 if sliders["jettyAvailable"] else 1.6
    throughput_gap = max(0, 100 - sliders["refineryThroughput"]) / 100
    buffer_days = max(0.1, round(6.2 - (0.12 * congestion_factor * speed_factor * jetty_factor / max(sliders["refineryThroughput"] / 85, 0.4)) * day, 1))
    demurrage = round(45000 * congestion_factor * jetty_factor * risk_factor * day)
    revenue_loss = round(180000 * throughput_gap * day)
    risk_index = min(100, round(sliders["riskLevel"] * 0.6 + sliders["portCongestion"] * 0.25 + (100 - sliders["refineryThroughput"]) * 0.4))
    fleet_state = []
    for v in VESSELS:
        delay = round(max(0, (sliders["portCongestion"] - 30) * 0.45 + (sliders["riskLevel"] - 40) * 0.25))
        fleet_state.append({"vesselId": v["id"], "vessel": v["name"], "type": v["type"], "cargo": v["cargoType"], "routeProgress": min(100, round(50 + day * 2)), "status": "At Risk" if v["riskScore"] > 70 else "Transit", "delayHours": delay, "demurrageUsd": round(v["vesselDailyRate"] / 24 * delay)})
    strategic = [
        {"id": "A", "name": "Cost Optimized", "focus": "Minimize fuel + demurrage", "delayHours": 96, "costDeltaUsd": -340000, "riskScore": 58, "bufferImpactDays": -0.9, "summary": "Cheapest path but slower recovery.", "recommended": False},
        {"id": "B", "name": "Time Optimized", "focus": "Restore refinery feed fastest", "delayHours": -28, "costDeltaUsd": 420000, "riskScore": 64, "bufferImpactDays": 0.8, "summary": "Protects production continuity at premium cost.", "recommended": False},
        {"id": "C", "name": "Risk Optimized", "focus": "Minimize geopolitical exposure", "delayHours": 42, "costDeltaUsd": 110000, "riskScore": 24, "bufferImpactDays": 0.4, "summary": "Best resilience-adjusted decision.", "recommended": True},
    ]
    return {
        "simulationId": f"sim-{int(datetime.now(UTC).timestamp())}",
        "scenarioId": params.get("scenarioId", "hormuz-blockade"),
        "horizonDays": 30,
        "day": day,
        "sliders": sliders,
        "kpis": {"bufferDaysRemaining": {"baseline": 6.2, "simulated": buffer_days, "delta": round(buffer_days - 6.2, 1)}, "demurrageCost": {"baseline": 0, "simulated": demurrage, "delta": demurrage}, "revenueAtRisk": {"baseline": 0, "simulated": revenue_loss, "delta": revenue_loss}, "maritimeRiskScore": {"baseline": 28, "simulated": risk_index, "delta": risk_index - 28}},
        "fleetState": fleet_state,
        "strategicOptions": strategic,
        "impactDamage": {"financialDamageUsd": demurrage + revenue_loss, "opportunityCostUsd": round((demurrage + revenue_loss) * 0.35), "refineryStarvationProbability": max(0, round((2.5 - buffer_days) * 18)), "totalExposureUsd": round((demurrage + revenue_loss) * 1.35)},
        "cascadingImpacts": ["Kochi berth queue expansion", "Demurrage on following vessels", "Tank ullage pressure at BPCL", "Rail dispatch bottleneck", "Product shipment delay risk"],
        "simulatedDecision": {"title": "Simulation crisis: adopt Risk Optimized Option C", "confidence": 90, "recommendation": "Send option C to Decision Engine", "riskDelta": -43},
        "asOf": datetime.now(UTC).isoformat(),
    }, "mockFallback"


def saved() -> tuple[dict[str, Any], str]:
    return {"savedScenarios": list(_saved.values()), "count": len(_saved), "asOf": datetime.now(UTC).isoformat()}, "mockFallback"


def save(payload: dict[str, Any]) -> tuple[dict[str, Any], str]:
    item_id = f"sc-{int(datetime.now(UTC).timestamp())}"
    item = {**payload, "id": item_id, "createdAt": datetime.now(UTC).isoformat()}
    _saved[item_id] = item
    source = upsert_json_row("simulation_scenarios", item_id, item)
    return item, source


def delete(item_id: str) -> tuple[dict[str, Any], str]:
    existed = _saved.pop(item_id, None) is not None
    return {"id": item_id, "deleted": existed, "asOf": datetime.now(UTC).isoformat()}, "mockFallback"

