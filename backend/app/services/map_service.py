from datetime import UTC, datetime, timedelta
from typing import Any

from app.data.seed_data import HISTORICAL_MATCHES, PORTS, RISK_ZONES, VESSELS, moved_position
from app.services.db_utils import fetch_json_row, fetch_json_rows


def _map_vessel(v: dict[str, Any]) -> dict[str, Any]:
    out = dict(v)
    out["position"] = moved_position(v)
    out["statusLabel"] = {"onTrack": "On track", "delayed": "Delayed", "highRisk": "High risk", "critical": "Critical", "normal": "Normal"}.get(v.get("status", ""), "Unknown")
    out["isBpcl"] = v["ownership"] == "BPCL"
    out["asOf"] = datetime.now(UTC).isoformat()
    out["explanation"] = f"{v['name']} is tracking {v['origin']} to {v['destination']} with {v['riskScore']}/100 composite risk."
    return out


def fleet() -> tuple[dict[str, Any], str]:
    rows, source = fetch_json_rows("vessels")
    vessels = rows or VESSELS
    return {"vessels": [_map_vessel(v) for v in vessels], "count": len(vessels), "asOf": datetime.now(UTC).isoformat()}, source


def ports() -> tuple[dict[str, Any], str]:
    rows, source = fetch_json_rows("ports")
    return {"ports": rows or PORTS, "count": len(rows or PORTS), "asOf": datetime.now(UTC).isoformat()}, source


def risk_zones() -> tuple[dict[str, Any], str]:
    rows, source = fetch_json_rows("risk_zones")
    return {"riskZones": rows or RISK_ZONES, "count": len(rows or RISK_ZONES), "asOf": datetime.now(UTC).isoformat()}, source


def historical_matches() -> tuple[dict[str, Any], str]:
    return {"historicalMatches": HISTORICAL_MATCHES, "count": len(HISTORICAL_MATCHES), "asOf": datetime.now(UTC).isoformat()}, "mockFallback"


def vessel_by_id(vessel_id: str) -> tuple[dict[str, Any] | None, str]:
    row, source = fetch_json_row("vessels", vessel_id)
    if row:
        return _map_vessel(row), source
    item = next((v for v in VESSELS if v["id"] == vessel_id), None)
    return (_map_vessel(item) if item else None), "mockFallback"


def vessel_track(vessel_id: str) -> tuple[dict[str, Any] | None, str]:
    vessel, source = vessel_by_id(vessel_id)
    if not vessel:
        return None, source
    now = datetime.now(UTC)
    current_route = vessel["currentRoute"]
    points = []
    for idx, coords in enumerate(current_route):
        points.append({
            "timestamp": (now + timedelta(hours=(idx - 1) * 12)).isoformat(),
            "position": coords,
            "speedKnots": max(vessel["speedKnots"] - idx * 0.4, 0),
            "confidence": max(96 - idx * 6, 70),
            "segment": "past" if idx == 0 else "future",
        })
    return {"vesselId": vessel_id, "vesselName": vessel["name"], "track": points, "projectionConfidence": 84, "asOf": now.isoformat()}, source


def route_comparison(vessel_id: str) -> tuple[dict[str, Any] | None, str]:
    vessel, source = vessel_by_id(vessel_id)
    if not vessel:
        return None, source
    risk_savings = max(vessel["riskScore"] - 24, 0)
    return {
        "vesselId": vessel_id,
        "vesselName": vessel["name"],
        "currentRoute": vessel["currentRoute"],
        "recommendedRoute": vessel["recommendedRoute"],
        "summary": {
            "etaDeltaHours": 18 if vessel["status"] in {"highRisk", "critical"} else 4,
            "costDeltaUsd": -245000 if vessel["riskScore"] > 60 else -42000,
            "riskDelta": -risk_savings,
            "fuelDeltaTons": 38,
            "confidence": vessel["confidence"],
        },
        "explanation": "Comparison is a Module 1 deterministic route intelligence mock; optimizer arrives in Module 2.",
        "asOf": datetime.now(UTC).isoformat(),
    }, source

