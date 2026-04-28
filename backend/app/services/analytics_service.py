from datetime import UTC, datetime
from typing import Any
from uuid import uuid4

from app.data.seed_data import ANOMALIES, INSIGHTS


def insights() -> tuple[dict[str, Any], str]:
    return {"insights": INSIGHTS, "count": len(INSIGHTS), "asOf": datetime.now(UTC).isoformat()}, "mockFallback"


def anomalies(window_hours: int = 48) -> tuple[dict[str, Any], str]:
    items = [a for a in ANOMALIES if a["hoursAgo"] <= window_hours]
    return {"anomalies": items, "count": len(items), "windowHours": window_hours, "asOf": datetime.now(UTC).isoformat()}, "mockFallback"


def summary() -> tuple[dict[str, Any], str]:
    payload = {
        "financial": {"totalLandedCostUsd": 73_200_000, "avgCostPerBarrel": 77.4, "demurrageMtdUsd": 1_800_000, "grossMarginPerBarrel": 18.6, "warRiskPremiumUsd": 420_000},
        "operations": {"etaVarianceHours": 18, "jettyOccupancyPct": 78, "dischargeRateBblHr": 12400, "bufferDays": 4.2},
        "risk": {"maritimeRiskIndex": 67, "routeSecurity": 54, "weatherImpact": "Moderate", "delayProbability48h": 34},
        "esg": {"fleetCiiRating": "B", "scope3EmissionsTons": 12400, "greenVesselsPct": 42, "esgScore": 72},
        "recommendations": ["Review berth scheduling", "Approve MT Horizon slow steaming", "Monitor Hormuz reroute candidates"],
        "asOf": datetime.now(UTC).isoformat(),
    }
    return payload, "mockFallback"


def metrics(metric: str | None = None, time_range: str = "7d") -> tuple[dict[str, Any], str]:
    labels = ["D-6", "D-5", "D-4", "D-3", "D-2", "D-1", "Now"]
    payload = {
        "timeRange": time_range,
        "series": {
            "landedCost": [{"name": labels[i], "value": 72.5 + i * 0.18} for i in range(len(labels))],
            "demurrage": [{"name": labels[i], "value": 0.3 + i * 0.25} for i in range(len(labels))],
            "riskIndex": [{"name": labels[i], "value": 55 + i * 2} for i in range(len(labels))],
            "bufferDays": [{"name": labels[i], "value": round(5.6 - i * 0.23, 1)} for i in range(len(labels))],
        },
        "contributors": {
            "demurrage": [{"name": "MT Rajput", "value": "24h wait", "impact": "$450K"}, {"name": "MT Horizon", "value": "18h wait", "impact": "$315K"}],
            "risk": [{"name": "MT Bharat", "value": "Kochi/Hormuz", "impact": "91%"}, {"name": "MT Rajput", "value": "Hormuz", "impact": "86%"}],
        },
        "asOf": datetime.now(UTC).isoformat(),
    }
    if metric:
        payload["requestedMetric"] = metric
    return payload, "mockFallback"


def scenario_comparison() -> tuple[dict[str, Any], str]:
    return {
        "scenarios": [
            {"id": "baseline", "name": "Current Plan", "tag": "baseline", "costUsd": 1_820_000, "delayHours": 74, "riskScore": 67, "bufferDays": 3.1, "outcomes": ["High demurrage exposure", "No route disruption"]},
            {"id": "cost", "name": "Cost Optimized", "tag": "alternative", "costUsd": 1_260_000, "delayHours": 92, "riskScore": 59, "bufferDays": 2.8, "outcomes": ["Lowest cost", "Tighter buffer"]},
            {"id": "risk", "name": "Risk Optimized", "tag": "recommended", "costUsd": 1_410_000, "delayHours": 68, "riskScore": 32, "bufferDays": 4.0, "outcomes": ["Recommended", "Best resilience-adjusted result"]},
        ],
        "asOf": datetime.now(UTC).isoformat(),
    }, "mockFallback"


def export_job(format_: str = "pdf", active_tab: str = "financial") -> tuple[dict[str, Any], str]:
    return {"jobId": f"analytics-export-{uuid4()}", "status": "queued", "format": format_, "activeTab": active_tab, "estimatedReadySeconds": 10, "asOf": datetime.now(UTC).isoformat()}, "mockFallback"

