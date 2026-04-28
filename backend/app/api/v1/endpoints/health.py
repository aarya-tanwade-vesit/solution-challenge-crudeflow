from fastapi import APIRouter

from app.core.database import db_available
from app.schemas.common import api_response

router = APIRouter()


@router.get("/health")
def health():
    db_ok = db_available()
    return api_response({"status": "ok", "database": "connected" if db_ok else "unavailable", "service": "crudeflow-backend"}, "neon" if db_ok else "mockFallback")

