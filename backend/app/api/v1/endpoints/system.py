from fastapi import APIRouter

from app.schemas.common import api_response
from app.services import system_service

router = APIRouter()


@router.get("/status")
def get_status():
    data, source = system_service.status()
    return api_response(data, source)

