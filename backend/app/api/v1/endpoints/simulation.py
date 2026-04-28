from fastapi import APIRouter

from app.schemas.common import api_response
from app.schemas.simulation import SaveScenarioRequest, SimulationRunRequest
from app.services import simulation_service

router = APIRouter()


@router.get("/scenarios")
def scenarios():
    data, source = simulation_service.scenarios()
    return api_response(data, source)


@router.post("/run")
def run(payload: SimulationRunRequest):
    data, source = simulation_service.run(payload.model_dump())
    return api_response(data, source)


@router.get("/saved")
def saved():
    data, source = simulation_service.saved()
    return api_response(data, source)


@router.post("/saved")
def save(payload: SaveScenarioRequest):
    data, source = simulation_service.save(payload.model_dump())
    return api_response(data, source)


@router.delete("/saved/{scenario_id}")
def delete(scenario_id: str):
    data, source = simulation_service.delete(scenario_id)
    return api_response(data, source)

