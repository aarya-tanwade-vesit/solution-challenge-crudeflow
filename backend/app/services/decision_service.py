from datetime import UTC, datetime
from typing import Any

from app.data.seed_data import DECISIONS
from app.services.db_utils import fetch_json_row, fetch_json_rows, upsert_json_row

_memory_decisions = {d["id"]: dict(d) for d in DECISIONS}


from app.optimization import integration_orchestrator

def list_decisions(status: str | None = None) -> tuple[dict[str, Any], str]:
    rows, source = fetch_json_rows("decisions")
    decisions = rows
    
    if not decisions:
        # Fall back to static DECISIONS seed data (all 4 active vessels)
        decisions = list(_memory_decisions.values())
        source = "mockFallback"
    
    if status and status != "all":
        decisions = [d for d in decisions if d.get("status") == status]
        
    metrics = {
        "approvalRate": 74,
        "avgConfidence": round(sum(d["confidence"] for d in decisions) / max(len(decisions), 1)),
        "avgCostSaved": 522000,
        "avgResponseTimeMinutes": 18,
        "totalCostSavedYTD": 4_720_000,
    }
    return {"decisions": decisions, "metrics": metrics, "count": len(decisions), "asOf": datetime.now(UTC).isoformat()}, source


def get_decision(decision_id: str) -> tuple[dict[str, Any] | None, str]:
    row, source = fetch_json_row("decisions", decision_id)
    if row:
        return row, source
    return _memory_decisions.get(decision_id), "mockFallback"


def set_status(decision_id: str, status: str, by: str | None = None, reason: str | None = None) -> tuple[dict[str, Any] | None, str]:
    decision, source = get_decision(decision_id)
    if not decision:
        return None, source
    decision = dict(decision)
    decision["status"] = status
    decision["resolvedAt"] = datetime.now(UTC).isoformat()
    if by:
        decision["approvedBy"] = by
    if reason:
        decision["rejectionReason"] = reason
    _memory_decisions[decision_id] = decision
    db_source = upsert_json_row("decisions", decision_id, decision)
    return decision, db_source if db_source == "neon" else source

