from datetime import UTC, datetime
from typing import Any
from uuid import uuid4


def now_iso() -> str:
    return datetime.now(UTC).isoformat()


def api_response(data: Any, source: str = "mockFallback", success: bool = True) -> dict:
    return {
        "success": success,
        "timestamp": now_iso(),
        "requestId": str(uuid4()),
        "source": source,
        "data": data,
    }

