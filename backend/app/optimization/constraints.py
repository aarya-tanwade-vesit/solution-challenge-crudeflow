from app.optimization.models import OptimizationRequest, RouteCandidate


def clamp(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))


def pct(value: float) -> float:
    return clamp(value, 0, 100)


def route_is_operationally_valid(candidate: RouteCandidate, request: OptimizationRequest) -> bool:
    if not candidate.feasible:
        return False
    if candidate.distanceNm <= 0 or candidate.etaHours <= 0:
        return False
    if candidate.refineryBufferDays < 0:
        return False
    if candidate.portCongestionScore > 95 and candidate.strategy != "holding":
        return False
    max_delay = max(96, request.route.etaHours * 0.8)
    return candidate.delayHours <= max_delay


def apply_operational_guards(candidate: RouteCandidate, request: OptimizationRequest) -> RouteCandidate:
    min_buffer = request.refinery.minimumBufferDays
    shutdown_pressure = max(0, min_buffer - candidate.refineryBufferDays)
    if shutdown_pressure > 0:
        candidate.notes.append(f"Refinery buffer breaches target by {shutdown_pressure:.1f} days.")
        candidate.riskScore = pct(candidate.riskScore + shutdown_pressure * 8)
    if candidate.delayHours > 48:
        candidate.notes.append("Delay creates material demurrage exposure.")
    if candidate.riskScore < request.route.baselineRisk - 20:
        candidate.notes.append("Meaningfully reduces maritime risk exposure.")
    return candidate
