from fastapi import APIRouter, Query

from app.schemas.analytics import AnalyticsExportRequest
from app.schemas.common import api_response
from app.services import analytics_service

router = APIRouter()


@router.get("/summary")
def summary():
    data, source = analytics_service.summary()
    return api_response(data, source)


@router.get("/insights")
def insights():
    data, source = analytics_service.insights()
    return api_response(data, source)


@router.get("/anomalies")
def anomalies(windowHours: int = Query(default=48)):
    data, source = analytics_service.anomalies(windowHours)
    return api_response(data, source)


@router.get("/metrics")
def metrics(metric: str | None = None, timeRange: str = "7d"):
    data, source = analytics_service.metrics(metric, timeRange)
    return api_response(data, source)


@router.get("/scenario-comparison")
def scenario_comparison():
    data, source = analytics_service.scenario_comparison()
    return api_response(data, source)


@router.post("/export")
def export(payload: AnalyticsExportRequest):
    data, source = analytics_service.export_job(payload.format, payload.activeTab)
    return api_response(data, source)

