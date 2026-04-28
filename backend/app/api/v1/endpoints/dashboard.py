from fastapi import APIRouter

from app.schemas.common import api_response
from app.services import dashboard_service, decision_service

router = APIRouter()


@router.get("/summary")
def summary():
    data, source = dashboard_service.summary()
    return api_response(data, source)


@router.get("/kpis")
def kpis(workspaceId: str = "bpcl-mumbai"):
    data, source = dashboard_service.kpis(workspaceId)
    return api_response(data, source)


@router.get("/operations")
def operations():
    data, source = dashboard_service.operations()
    return api_response(data, source)


@router.get("/decision-engine")
def decision_engine():
    decisions_data, _ = decision_service.list_decisions("pending")
    data, source = dashboard_service.decision_engine_preview(decisions_data["decisions"])
    return api_response(data, source)

