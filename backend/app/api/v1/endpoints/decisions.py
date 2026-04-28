from fastapi import APIRouter, HTTPException, Query

from app.schemas.common import api_response
from app.schemas.decision import DecisionAction
from app.services import decision_service

router = APIRouter()


@router.get("")
def list_decisions(status: str | None = Query(default=None)):
    data, source = decision_service.list_decisions(status)
    return api_response(data, source)


@router.get("/{decision_id}")
def get_decision(decision_id: str):
    data, source = decision_service.get_decision(decision_id)
    if data is None:
        raise HTTPException(status_code=404, detail="Decision not found")
    return api_response(data, source)


@router.post("/{decision_id}/approve")
def approve(decision_id: str, payload: DecisionAction = DecisionAction()):
    data, source = decision_service.set_status(decision_id, "approved", by=payload.actionBy or "Demo Operator")
    if data is None:
        raise HTTPException(status_code=404, detail="Decision not found")
    return api_response(data, source)


@router.post("/{decision_id}/reject")
def reject(decision_id: str, payload: DecisionAction = DecisionAction()):
    data, source = decision_service.set_status(decision_id, "rejected", reason=payload.reason or "Operator override")
    if data is None:
        raise HTTPException(status_code=404, detail="Decision not found")
    return api_response(data, source)

