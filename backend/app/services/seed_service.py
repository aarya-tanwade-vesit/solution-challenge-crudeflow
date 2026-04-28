import json
from typing import Any

from sqlalchemy import text

from app.core.database import db_session
from app.data.seed_data import ANOMALIES, DECISIONS, HISTORICAL_MATCHES, INSIGHTS, PORTS, RISK_ZONES, ROUTES, SCENARIOS, VESSELS


TABLES = ["vessels", "routes", "ports", "risk_zones", "alerts", "decisions", "simulation_scenarios", "analytics_snapshots"]


def create_tables() -> None:
    with db_session() as session:
        if session is None:
            raise RuntimeError("DATABASE_URL is not configured")
        for table in TABLES:
            session.execute(text(f"""
                create table if not exists {table} (
                    id text primary key,
                    payload jsonb not null,
                    created_at timestamptz not null default now(),
                    updated_at timestamptz not null default now()
                )
            """))


def _upsert(table: str, item_id: str, payload: dict[str, Any]) -> None:
    with db_session() as session:
        if session is None:
            raise RuntimeError("DATABASE_URL is not configured")
        session.execute(
            text(f"""
                insert into {table} (id, payload, updated_at)
                values (:id, cast(:payload as jsonb), now())
                on conflict (id) do update set payload = excluded.payload, updated_at = now()
            """),
            {"id": item_id, "payload": json.dumps(payload)},
        )


def _delete_missing(table: str, expected_ids: set[str]) -> None:
    with db_session() as session:
        if session is None:
            raise RuntimeError("DATABASE_URL is not configured")
        rows = session.execute(text(f"select id from {table}")).fetchall()
        existing_ids = {row[0] for row in rows}
        stale_ids = existing_ids - expected_ids
        if stale_ids:
            for stale_id in stale_ids:
                session.execute(
                    text(f"delete from {table} where id = :id"),
                    {"id": stale_id},
                )


def seed_all() -> dict[str, int]:
    create_tables()
    counts = {"vessels": 0, "ports": 0, "risk_zones": 0, "decisions": 0, "simulation_scenarios": 0, "analytics_snapshots": 0, "alerts": 0, "routes": 0}
    for item in VESSELS:
        _upsert("vessels", item["id"], item)
        counts["vessels"] += 1
    for item in PORTS:
        _upsert("ports", item["id"], item)
        counts["ports"] += 1
    for item in ROUTES:
        _upsert("routes", item["id"], item)
        counts["routes"] += 1
    for item in RISK_ZONES:
        _upsert("risk_zones", item["id"], item)
        counts["risk_zones"] += 1
    for item in DECISIONS:
        _upsert("decisions", item["id"], item)
        counts["decisions"] += 1
    for item in SCENARIOS:
        _upsert("simulation_scenarios", item["id"], item)
        counts["simulation_scenarios"] += 1
    analytics_payload = {"id": "snapshot-current", "insights": INSIGHTS, "anomalies": ANOMALIES}
    _upsert("analytics_snapshots", "snapshot-current", analytics_payload)
    counts["analytics_snapshots"] = 1
    for item in HISTORICAL_MATCHES:
        _upsert("alerts", item["id"], item)
        counts["alerts"] += 1
    _delete_missing("vessels", {item["id"] for item in VESSELS})
    _delete_missing("ports", {item["id"] for item in PORTS})
    _delete_missing("routes", {item["id"] for item in ROUTES})
    _delete_missing("risk_zones", {item["id"] for item in RISK_ZONES})
    _delete_missing("decisions", {item["id"] for item in DECISIONS})
    _delete_missing("simulation_scenarios", {item["id"] for item in SCENARIOS})
    _delete_missing("alerts", {item["id"] for item in HISTORICAL_MATCHES})
    _delete_missing("analytics_snapshots", {"snapshot-current"})
    return counts
