from fastapi import APIRouter

from app.schemas.common import api_response
from app.services import activity_service

router = APIRouter()


@router.get("")
def get_activity():
    data, source = activity_service.list_activity()
    return api_response(data, source)

