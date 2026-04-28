from fastapi import APIRouter

from app.optimization import (
    comparison_engine,
    diagnosis_engine,
    intervention_engine,
    optimizer_engine,
    schemas,
)
from app.schemas.common import api_response

router = APIRouter()


@router.post("/analyze")
def analyze(payload: schemas.AnalyzeRequest):
    # For now, analyze uses comparison logic to get the best current estimate
    res = comparison_engine.compare_options(payload)  # type: ignore
    return api_response(res.rankedOptions[0].model_dump(), "module2-analyze")


@router.post("/compare")
def compare(payload: schemas.CompareRequest):
    res = comparison_engine.compare_options(payload)
    return api_response(res.model_dump(), "module2-compare")


@router.post("/optimize")
def optimize(payload: schemas.OptimizeRequest):
    res = optimizer_engine.optimize_options(payload)
    return api_response(res.model_dump(), "module2-optimize")


@router.post("/recover")
def recover(payload: schemas.RecoverRequest):
    res = intervention_engine.find_recovery_plan(payload)
    return api_response(res.model_dump(), "module2-recover")


@router.post("/diagnose")
def diagnose(payload: schemas.DiagnoseRequest):
    res = diagnosis_engine.diagnose_failure(payload)
    return api_response(res.model_dump(), "module2-diagnose")


@router.get("/demo")
def demo():
    # Return a demo comparison
    payload = schemas.CompareRequest()
    res = comparison_engine.compare_options(payload)
    return api_response(res.model_dump(), "module2-demo")
