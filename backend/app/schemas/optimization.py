from typing import Any

from pydantic import BaseModel, ConfigDict


class RerouteOptimizationRequest(BaseModel):
    model_config = ConfigDict(extra="allow")

    vesselId: str | None = None
    scenario: str | None = None
    currentRouteId: str | None = None
    riskWeights: dict[str, float] | None = None
    refineryBufferDays: float | None = None
    portCongestion: float | None = None
    weatherRisk: float | None = None
    insurancePremiumIncrease: float | None = None

    def to_engine_payload(self) -> dict[str, Any]:
        payload = self.model_dump(exclude_none=True)
        engine_payload: dict[str, Any] = {}

        if self.vesselId:
            engine_payload["vesselId"] = self.vesselId
        if self.portCongestion is not None:
            engine_payload["congestion"] = self.portCongestion
            engine_payload["portOccupancyPct"] = self.portCongestion
        if self.weatherRisk is not None:
            engine_payload["weatherSeverity"] = self.weatherRisk
        if self.insurancePremiumIncrease is not None:
            engine_payload["insuranceIncreasePct"] = self.insurancePremiumIncrease
        if self.refineryBufferDays is not None:
            engine_payload["refinery"] = {"inventoryDays": self.refineryBufferDays}
        if self.riskWeights:
            engine_payload["riskWeights"] = self.riskWeights

        route_metadata = {key: payload[key] for key in ("scenario", "currentRouteId") if key in payload}
        if route_metadata:
            engine_payload["module2Context"] = route_metadata

        for key, value in payload.items():
            if key not in {
                "vesselId",
                "scenario",
                "currentRouteId",
                "riskWeights",
                "refineryBufferDays",
                "portCongestion",
                "weatherRisk",
                "insurancePremiumIncrease",
            }:
                engine_payload[key] = value

        return engine_payload
