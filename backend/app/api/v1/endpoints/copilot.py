from fastapi import APIRouter

from app.schemas.common import api_response
from app.schemas.decision import CopilotQuery
from app.services import copilot_service

router = APIRouter()


@router.post("/query")
def query(payload: CopilotQuery):
    data, source = copilot_service.answer_query(payload.message, payload.decisionId, {**payload.context, "conversationId": payload.conversationId})
    return api_response(data, source)

