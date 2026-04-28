from typing import Any

from sqlalchemy import text

from app.core.database import db_session


JSON_TABLES = {
    "vessels",
    "routes",
    "ports",
    "risk_zones",
    "alerts",
    "decisions",
    "simulation_scenarios",
    "analytics_snapshots",
}


def fetch_json_rows(table: str) -> tuple[list[dict[str, Any]], str]:
    if table not in JSON_TABLES:
        return [], "mockFallback"
    try:
        with db_session() as session:
            if session is None:
                return [], "mockFallback"
            rows = session.execute(text(f"select payload from {table} order by id")).mappings().all()
            return [dict(row["payload"]) for row in rows], "neon"
    except Exception:
        return [], "mockFallback"


def fetch_json_row(table: str, item_id: str) -> tuple[dict[str, Any] | None, str]:
    if table not in JSON_TABLES:
        return None, "mockFallback"
    try:
        with db_session() as session:
            if session is None:
                return None, "mockFallback"
            row = session.execute(text(f"select payload from {table} where id = :id"), {"id": item_id}).mappings().first()
            return (dict(row["payload"]) if row else None), "neon"
    except Exception:
        return None, "mockFallback"


def upsert_json_row(table: str, item_id: str, payload: dict[str, Any]) -> str:
    if table not in JSON_TABLES:
        return "mockFallback"
    try:
        with db_session() as session:
            if session is None:
                return "mockFallback"
            session.execute(
                text(
                    f"""
                    insert into {table} (id, payload, updated_at)
                    values (:id, cast(:payload as jsonb), now())
                    on conflict (id) do update set payload = excluded.payload, updated_at = now()
                    """
                ),
                {"id": item_id, "payload": __import__("json").dumps(payload)},
            )
            return "neon"
    except Exception:
        return "mockFallback"

def clear_table(table: str) -> None:
    if table not in JSON_TABLES:
        return
    try:
        with db_session() as session:
            if session is None:
                return
            session.execute(text(f"truncate table {table} cascade"))
    except Exception as e:
        print(f"Error clearing table {table}: {e}")
