from fastapi import APIRouter

from app.api.v1.endpoints import activity, analytics, copilot, dashboard, decisions, fleet, health, map, optimization, simulation, system

api_router = APIRouter()
api_router.include_router(health.router, tags=["core"])
api_router.include_router(system.router, prefix="/system", tags=["system"])
api_router.include_router(activity.router, prefix="/activity", tags=["activity"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(map.router, prefix="/map", tags=["map"])
api_router.include_router(decisions.router, prefix="/decisions", tags=["decisions"])
api_router.include_router(copilot.router, prefix="/copilot", tags=["copilot"])
api_router.include_router(simulation.router, prefix="/simulation", tags=["simulation"])
api_router.include_router(optimization.router, prefix="/optimization", tags=["optimization"])
api_router.include_router(fleet.router, prefix="/fleet", tags=["fleet"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
