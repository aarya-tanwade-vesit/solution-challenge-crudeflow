from datetime import UTC, datetime
from typing import Any
from uuid import uuid4

from app.services.map_service import fleet, vessel_by_id


def summary() -> tuple[dict[str, Any], str]:
    data, source = fleet()
    vessels = data["vessels"]
    return {
        "totalFleet": len(vessels),
        "onTrack": len([v for v in vessels if v["status"] == "onTrack"]),
        "delayed": len([v for v in vessels if v["status"] == "delayed"]),
        "highRisk": len([v for v in vessels if v["status"] in {"highRisk", "critical"}]),
        "bpcl": len([v for v in vessels if v["ownership"] == "BPCL"]),
        "chartered": len([v for v in vessels if v["ownership"] == "Chartered"]),
        "asOf": datetime.now(UTC).isoformat(),
    }, source


def vessels(status: str | None = None, ownership: str | None = None, q: str | None = None) -> tuple[dict[str, Any], str]:
    data, source = fleet()
    items = data["vessels"]
    if status and status != "all":
        items = [v for v in items if v["status"] == status]
    if ownership and ownership != "all":
        items = [v for v in items if v["ownership"].lower() == ownership.lower()]
    if q:
        needle = q.lower()
        items = [v for v in items if needle in v["name"].lower() or needle in v["imo"] or needle in v["origin"].lower() or needle in v["destination"].lower()]
    return {"vessels": items, "count": len(items), "filters": {"status": status or "all", "ownership": ownership or "all", "query": q or ""}, "asOf": datetime.now(UTC).isoformat()}, source


def export_job(format_: str = "pdf") -> tuple[dict[str, Any], str]:
    return {
        "jobId": f"export-{uuid4()}",
        "status": "queued",
        "format": format_,
        "fileName": f"crudeflow-fleet-report.{format_}",
        "estimatedReadySeconds": 8,
        "includes": ["fleetSummary", "vesselRows", "delayedVessels", "highRiskVessels", "recommendedActions"],
        "asOf": datetime.now(UTC).isoformat(),
    }, "mockFallback"

