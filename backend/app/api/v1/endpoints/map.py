from fastapi import APIRouter, HTTPException

from app.schemas.common import api_response
from app.services import map_service

router = APIRouter()


@router.get("/fleet")
def fleet():
    data, source = map_service.fleet()
    return api_response(data, source)


@router.get("/ports")
def ports():
    data, source = map_service.ports()
    return api_response(data, source)


@router.get("/risk-zones")
def risk_zones():
    data, source = map_service.risk_zones()
    return api_response(data, source)


@router.get("/historical-matches")
def historical_matches():
    data, source = map_service.historical_matches()
    return api_response(data, source)


@router.get("/vessels/{vessel_id}/track")
def track(vessel_id: str):
    data, source = map_service.vessel_track(vessel_id)
    if data is None:
        raise HTTPException(status_code=404, detail="Vessel not found")
    return api_response(data, source)


@router.get("/vessels/{vessel_id}/route-comparison")
def route_comparison(vessel_id: str):
    data, source = map_service.route_comparison(vessel_id)
    if data is None:
        raise HTTPException(status_code=404, detail="Vessel not found")
    return api_response(data, source)

