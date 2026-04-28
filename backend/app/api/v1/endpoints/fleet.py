from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from app.schemas.common import api_response
from app.services import fleet_service, map_service

router = APIRouter()


class ExportRequest(BaseModel):
    format: str = "pdf"


@router.get("/summary")
def summary():
    data, source = fleet_service.summary()
    return api_response(data, source)


@router.get("/vessels")
def vessels(status: str | None = None, ownership: str | None = None, q: str | None = None):
    data, source = fleet_service.vessels(status, ownership, q)
    return api_response(data, source)


@router.get("/vessels/{vessel_id}")
def vessel(vessel_id: str):
    data, source = map_service.vessel_by_id(vessel_id)
    if data is None:
        raise HTTPException(status_code=404, detail="Vessel not found")
    return api_response(data, source)


@router.post("/export")
def export(payload: ExportRequest):
    data, source = fleet_service.export_job(payload.format)
    return api_response(data, source)

