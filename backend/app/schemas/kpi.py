from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, ConfigDict


class KpiMetric(BaseModel):
    model_config = ConfigDict(extra="allow")

    id: str
    label: str
    value: float
    currency: Optional[str] = None
    unit: Optional[str] = None
    trend: Literal["up", "down", "neutral"]
    trendPercentage: float
    impact: str
    color: Literal["red", "amber", "blue", "purple"]
    status: Literal["normal", "warning", "critical"]
    confidence: int
    explanation: str
    updatedAt: str


class KpiPayload(BaseModel):
    demurrageForecast: Dict[str, Any]
    bufferDaysRemaining: Dict[str, Any]
    maritimeRiskIndex: Dict[str, Any]
    costOfInaction: Dict[str, Any]
    revenueAtRisk: Dict[str, Any]
    productionRisk: Dict[str, Any]
    asOf: str
    workspaceId: str
    isSimulated: bool = False

