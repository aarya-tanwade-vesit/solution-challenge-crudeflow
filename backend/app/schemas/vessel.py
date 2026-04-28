from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, ConfigDict


class Vessel(BaseModel):
    model_config = ConfigDict(extra="allow")

    id: str
    name: str
    imo: str
    mmsi: str
    flag: str
    type: str
    status: Literal["onTrack", "delayed", "highRisk", "critical"]
    ownership: Literal["BPCL", "Chartered"]
    position: List[float]
    origin: str
    destination: str
    etaUtc: str
    etaIst: str
    riskScore: int
    delayProbability: int
    confidence: int

