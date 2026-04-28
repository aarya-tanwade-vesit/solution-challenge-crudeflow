"""
NEMO CrudeFlow — Module 2 Pydantic Schemas
============================================
Request / response contracts for all Module 2 API endpoints.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field

VesselType = Literal["VLCC", "Suezmax", "Aframax", "Panamax"]


class VesselSchema(BaseModel):
    vesselId: str = "V-2024-NEMO-01"
    vesselName: str = "NEMO Voyager"
    vesselType: VesselType = "VLCC"
    speedKnots: float = 12.5
    cargoBbl: float = 1_200_000


class RouteSchema(BaseModel):
    origin: str = "Ras Tanura"
    destination: str = "Kochi"
    distanceNm: float = 1420.0
    baselineEtaHours: float = 113.6
    baselineRiskScore: float = 42.0
    baselineCostUsd: int = 485_000


class RefinerySchema(BaseModel):
    refineryId: str = "R-KOCHI-01"
    currentInventoryBbl: float = 620_000
    dailyConsumptionBbl: float = 180_000
    minimumBufferDays: float = 2.5
    incomingCargoFromOtherVessels: float = 0.0


class RiskWeightsSchema(BaseModel):
    geopolitical: float = 0.35
    weather: float = 0.20
    congestion: float = 0.22
    insurance: float = 0.14
    chokepoint: float = 0.09


class RiskInputsSchema(BaseModel):
    insurance: float = 0.0  # % increase
    piracy: float = 0.0
    threatLevel: int = 1


class BaseOptimizationRequest(BaseModel):
    vesselId: str = "V-2024-NEMO-01"
    vesselName: str = "NEMO Voyager"
    vesselType: VesselType = "VLCC"
    vesselSpeedKnots: float = 12.5
    cargoBbl: float = 1_200_000
    
    origin: str = "Ras Tanura"
    destination: str = "Kochi"
    
    currentInventoryBbl: float = 2_450_000
    dailyConsumptionBbl: float = 630_000
    minimumBufferDays: float = 3.0
    
    portCongestion: float = 45.0
    weatherRisk: float = 15.0
    geopoliticalRisk: float = 40.0
    insurancePremiumIncreasePct: float = 0.0
    
    riskWeights: dict[str, float] = Field(default_factory=dict)

class AnalyzeRequest(BaseOptimizationRequest):
    pass

class CompareRequest(BaseOptimizationRequest):
    pass

class OptimizeRequest(BaseOptimizationRequest):
    minBufferDaysOverride: float | None = None
    maxRiskScore: float | None = None
    maxEtaDays: float | None = None

class RecoverRequest(BaseOptimizationRequest):
    pass

class DiagnoseRequest(BaseOptimizationRequest):
    pass


class RouteBreakdown(BaseModel):
    optionId: Literal["A", "B", "C", "D"]
    label: str
    distanceNm: float
    etaHours: float
    etaDays: float
    traversedPassages: list[str]
    
    # Costs
    fuelCostUsd: int
    vesselHireCostUsd: int
    demurrageCostUsd: int
    warRiskPremiumUsd: int
    totalRouteCostUsd: int
    costDeltaVsBaselineUsd: int
    
    # Risk
    weightedRiskScore: float
    geopoliticalRisk: float
    weatherRisk: float
    congestionRisk: float
    insuranceRisk: float
    chokePointPenalty: float
    riskDeltaVsBaseline: float
    
    # Refinery
    inventoryAtArrivalBbl: float
    postArrivalInventoryBbl: float
    refineryBufferDays: float
    shortageBbl: float
    shortageRisk: float
    consumedBeforeArrivalBbl: float
    
    # Decision
    finalRouteScore: float
    decisionLabel: str
    explanation: str
    scoreBreakdown: dict[str, float]
    notes: list[str] = Field(default_factory=list)
    mapCoordinates: list[list[float]] = Field(default_factory=list)
    routingProvider: str = "heuristic"


class ComparisonResult(BaseModel):
    rankedOptions: list[RouteBreakdown]
    recommendedOptionId: str
    recommendedLabel: str
    comparisonTable: list[dict[str, Any]]
    summary: str
    asOf: str


class OptimizationResult(BaseModel):
    selectedOptionId: str
    selectedLabel: str
    objectiveValue: float
    solverStatus: str
    solverEngine: str
    constraints: dict[str, Any]
    rejectedOptions: list[dict[str, Any]]
    rankedOptions: list[RouteBreakdown]
    validation: dict[str, Any]
    summary: str
    asOf: str


class InterventionPlan(BaseModel):
    interventionId: str
    label: str
    description: str
    fixedCostUsd: int
    variableCostUsd: int
    totalCostUsd: int
    bufferGainDays: float
    feasibilityRestored: bool
    notes: str


class RecoveryResult(BaseModel):
    originallyFeasible: bool
    feasibilityRestored: bool
    interventionsApplied: list[InterventionPlan]
    recoveryPlanCostUsd: int
    postRecoveryBufferDays: float
    summary: str
    asOf: str


class DiagnosisResult(BaseModel):
    infeasibilityReason: str
    bindingConstraints: list[dict[str, Any]]
    systemFailureMode: str
    recommendedInterventionStack: list[str]
    fallbackEscalation: str
    severity: str
    estimatedImpactUsd: int
    details: dict[str, Any]
    asOf: str
