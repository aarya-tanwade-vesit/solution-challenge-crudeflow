from datetime import UTC, datetime, timedelta
from typing import Any


def list_activity() -> tuple[dict[str, Any], str]:
    now = datetime.now(UTC)
    events = [
        {"id": "evt-001", "type": "decision", "title": "Reroute recommendation generated", "description": "NEMO generated a critical reroute action for MT Rajput.", "timestamp": (now - timedelta(minutes=3)).isoformat(), "metadata": {"vesselName": "MT Rajput", "decisionId": "d-001"}, "read": False, "actionLink": "/decisions"},
        {"id": "evt-002", "type": "alert", "title": "Kochi buffer warning", "description": "Projected buffer fell below warning threshold under current disruption.", "timestamp": (now - timedelta(minutes=8)).isoformat(), "metadata": {"location": "Kochi"}, "read": False, "actionLink": "/dashboard"},
        {"id": "evt-003", "type": "simulation", "title": "Hormuz scenario ready", "description": "Simulation scenario seeded with strategic options A/B/C.", "timestamp": (now - timedelta(minutes=18)).isoformat(), "metadata": {"location": "Hormuz"}, "read": True, "actionLink": "/simulation"},
        {"id": "evt-004", "type": "update", "title": "Port status updated", "description": "Mumbai congestion adjusted to 84% in demo model.", "timestamp": (now - timedelta(minutes=24)).isoformat(), "metadata": {"location": "Mumbai"}, "read": True},
    ]
    return {"events": events, "unreadCount": len([e for e in events if not e["read"]]), "asOf": now.isoformat()}, "mockFallback"

