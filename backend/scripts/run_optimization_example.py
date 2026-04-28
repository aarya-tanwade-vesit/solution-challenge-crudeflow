import json
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.optimization.optimizer_service import optimize_route_payload


if __name__ == "__main__":
    result = optimize_route_payload(
        {
            "vesselId": "NEMO-DEMO-002",
            "vesselName": "MT Arabian Pearl",
            "route": {
                "origin": "Ras Tanura",
                "destination": "Kochi",
                "distanceNm": 1780,
                "etaHours": 168,
                "baselineRisk": 72,
                "baselineCostUsd": 2_850_000,
            },
            "riskLevel": 82,
            "congestion": 68,
            "weatherSeverity": 39,
            "insuranceIncreasePct": 42,
            "delayProbability": 0.62,
            "portOccupancyPct": 78,
            "refinery": {
                "name": "Kochi Refinery",
                "inventoryDays": 7.0,
                "minimumBufferDays": 3.0,
                "dailyCrudeDemandBbl": 310_000,
            },
        }
    )
    print(json.dumps(result["sampleOutput"], indent=2))
