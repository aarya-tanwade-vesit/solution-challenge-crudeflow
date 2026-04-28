from app.optimization.models import OptimizationRequest, ScoredOption


def downstream_recommendations(option: ScoredOption, request: OptimizationRequest) -> list[dict[str, object]]:
    recommendations: list[dict[str, object]] = []
    buffer_pressure = request.refinery.minimumBufferDays - option.refineryBufferDays

    if option.delayHours >= 24:
        recommendations.append(
            {
                "mode": "temporary_storage",
                "action": "Reserve coastal tankage near Kochi for staggered discharge.",
                "priority": "high" if buffer_pressure > 0 else "medium",
                "estimatedCostUsd": round(85_000 + max(0, option.delayHours - 24) * 1_800),
            }
        )
    if buffer_pressure > 0:
        recommendations.append(
            {
                "mode": "alternate_refinery",
                "action": "Divert replacement crude allocation to Mumbai or Mangalore until Kochi buffer recovers.",
                "priority": "critical",
                "estimatedCostUsd": round(buffer_pressure * request.refinery.shutdownCostUsdPerDay * 0.08),
            }
        )
        recommendations.append(
            {
                "mode": "rail_transfer",
                "action": "Pre-book rail rake capacity for product balancing from west coast terminals.",
                "priority": "high",
                "estimatedCostUsd": 120_000,
            }
        )
    if option.strategy == "time":
        recommendations.append(
            {
                "mode": "truck_fallback",
                "action": "Keep short-haul truck contracts warm for high-priority refined product demand.",
                "priority": "medium",
                "estimatedCostUsd": 65_000,
            }
        )
    if option.strategy == "risk":
        recommendations.append(
            {
                "mode": "berth_coordination",
                "action": "Lock a buffered Kochi arrival window and avoid peak port occupancy periods.",
                "priority": "high",
                "estimatedCostUsd": 40_000,
            }
        )
    return recommendations
