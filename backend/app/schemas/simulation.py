from typing import Any, Dict, Optional

from pydantic import BaseModel, ConfigDict


class SimulationRunRequest(BaseModel):
    model_config = ConfigDict(extra="allow")

    scenarioId: str = "hormuz-blockade"
    workspaceId: str = "bpcl-mumbai"
    targetVessel: str = "fleet"
    day: float = 1
    sliders: Dict[str, Any] = {}


class SaveScenarioRequest(BaseModel):
    name: str
    description: str = ""
    scenarioId: str = "hormuz-blockade"
    sliders: Dict[str, Any] = {}
    targetVessel: str = "fleet"

