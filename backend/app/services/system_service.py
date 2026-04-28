from datetime import UTC, datetime
from typing import Any


def status() -> tuple[dict[str, Any], str]:
    contributors = [
        {"category": "Geopolitical", "severity": "high", "score": 82, "description": "Hormuz corridor risk escalation"},
        {"category": "Weather", "severity": "medium", "score": 54, "description": "Arabian Sea cyclone cell under watch"},
        {"category": "Port Congestion", "severity": "high", "score": 76, "description": "Mumbai and Kochi berth pressure"},
        {"category": "Insurance / Cost", "severity": "medium", "score": 71, "description": "War-risk surcharge elevated"},
    ]
    system_score = round(82 * 0.35 + 54 * 0.25 + 76 * 0.25 + 71 * 0.15)
    level = "critical" if system_score >= 70 else "warning" if system_score >= 40 else "normal"
    return {
        "status": level,
        "systemScore": system_score,
        "lastUpdated": datetime.now(UTC).isoformat(),
        "riskContributors": contributors,
        "affectedEntities": [
            {"name": "MT Rajput", "type": "Vessel", "riskChange": 15, "current": 86},
            {"name": "MT Bharat", "type": "Vessel", "riskChange": 18, "current": 91},
            {"name": "Kochi Port", "type": "Port", "riskChange": 7, "current": 68},
        ],
        "affectedRoutes": [
            {"from": "Ras Tanura", "to": "Kochi", "risk": "HIGH"},
            {"from": "Basrah", "to": "Mumbai", "risk": "MEDIUM"},
            {"from": "Abu Dhabi", "to": "Kochi", "risk": "HIGH"},
        ],
        "impactProjection": {"avgDelay": "+2.3 days", "productionRisk": "ELEVATED", "confidence": 84},
        "suggestedFocus": [
            {"action": "Review MT Rajput reroute", "priority": "high", "link": "/decisions"},
            {"action": "Protect Kochi berth sequence", "priority": "high", "link": "/simulation"},
            {"action": "Monitor Arabian Sea cyclone cell", "priority": "medium", "link": "/map"},
        ],
        "explanation": "System score is a weighted blend of geopolitical, weather, congestion, and insurance signals.",
    }, "mockFallback"

