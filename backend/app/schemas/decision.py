from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, ConfigDict


class DecisionAction(BaseModel):
    actionBy: Optional[str] = None
    reason: Optional[str] = None


class CopilotQuery(BaseModel):
    decisionId: Optional[str] = None
    message: str
    conversationId: Optional[str] = None
    context: Dict[str, Any] = {}


class DecisionRecord(BaseModel):
    model_config = ConfigDict(extra="allow")

    id: str
    title: str
    status: str
    priority: str
    recommendation: str
    confidence: int

