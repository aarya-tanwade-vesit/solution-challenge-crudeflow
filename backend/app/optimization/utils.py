from __future__ import annotations

import math
from datetime import datetime, timedelta
from decimal import ROUND_HALF_UP, Decimal
from typing import Any, Iterable


def clamp(value: float, low: float = 0.0, high: float = 100.0) -> float:
    return max(low, min(high, float(value)))


def normalize_weights(weights: dict[str, float]) -> dict[str, float]:
    clean = {key: max(0.0, float(value)) for key, value in weights.items()}
    total = sum(clean.values()) or 1.0
    return {key: value / total for key, value in clean.items()}


def round2(value: float | Decimal) -> float:
    return float(Decimal(str(value)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))


def round_usd(value: float | Decimal) -> int:
    return int(Decimal(str(value)).quantize(Decimal("1"), rounding=ROUND_HALF_UP))


def to_decimal(value: float | int | str | Decimal) -> Decimal:
    return Decimal(str(value))


def safe_divide(numerator: float, denominator: float, default: float = 0.0) -> float:
    return numerator / denominator if denominator else default


def haversine_nm(origin: tuple[float, float], destination: tuple[float, float]) -> float:
    lon1, lat1 = origin
    lon2, lat2 = destination
    lon1, lat1, lon2, lat2 = map(math.radians, [lon1, lat1, lon2, lat2])
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    return 3440.065 * 2 * math.asin(math.sqrt(a))


def route_distance_nm(coordinates: Iterable[list[float]]) -> float:
    points = [tuple(point) for point in coordinates]
    return sum(haversine_nm(points[index], points[index + 1]) for index in range(len(points) - 1))


def congestion_multiplier(congestion: float) -> Decimal:
    return Decimal("1") + (to_decimal(clamp(congestion, 0, 100)) / Decimal("100"))


def as_map_coordinates(lon_lat: list[list[float]]) -> list[list[float]]:
    return [[lat, lon] for lon, lat in lon_lat]


def passage_display(passages: list[str], chokepoints: dict[str, dict[str, float | str]]) -> list[str]:
    labels: list[str] = []
    for passage in passages:
        normalized = passage.lower().replace("-", "_").replace(" ", "_")
        label = chokepoints.get(normalized, {}).get("display")
        labels.append(str(label or passage))
    return sorted(set(labels))


# --- Module 2 Additions ---

def pct(val: float) -> float:
    return round2(clamp(val, 0, 100))


def weighted_sum(components: dict[str, float], weights: dict[str, float]) -> float:
    norm_w = normalize_weights(weights)
    return sum(components.get(k, 0.0) * norm_w.get(k, 0.0) for k in weights)


def buffer_at_arrival(
    current_inventory_bbl: float,
    daily_consumption_bbl: float,
    eta_days: float,
    incoming_bbl: float,
) -> dict[str, Any]:
    consumed = daily_consumption_bbl * eta_days
    inventory_at_arrival = current_inventory_bbl - consumed
    post_arrival = max(0, inventory_at_arrival) + incoming_bbl
    buffer_days = safe_divide(inventory_at_arrival, daily_consumption_bbl)
    
    return {
        "inventoryAtArrivalBbl": round2(inventory_at_arrival),
        "postArrivalInventoryBbl": round2(post_arrival),
        "bufferDays": round2(buffer_days),
        "shortageBbl": round2(max(0, -inventory_at_arrival)),
        "shortageRisk": 100.0 if inventory_at_arrival < 0 else 0.0,
        "consumedBeforeArrivalBbl": round2(consumed)
    }


def normalize(val: float, max_val: float) -> float:
    if max_val <= 0: return 0.0
    return clamp(val / max_val, 0, 1)


def score_from_penalty(penalty: float) -> float:
    # 0 penalty = 100 score, 1 penalty = 0 score
    return pct((1.0 - clamp(penalty, 0, 1)) * 100.0)


def build_explanation(
    label: str,
    score: float,
    delay_h: float,
    risk_score: float,
    buffer_days: float,
    cost_delta: int,
    passages: list[str],
) -> str:
    parts = [f"{label} strategy scores {score:.1f}/100."]
    
    if delay_h > 0:
        parts.append(f"Incurs {delay_h/24:.1f} days delay.")
    else:
        parts.append("Maintains optimal arrival schedule.")
        
    if risk_score > 40:
        parts.append(f"Elevated risk due to {', '.join(passages) or 'regional factors'}.")
    
    if buffer_days < 2.0:
        parts.append(f"CRITICAL: Refinery buffer drops to {buffer_days:.1f} days.")
    elif buffer_days < 4.0:
        parts.append(f"Caution: Tight refinery buffer ({buffer_days:.1f} days).")
        
    if cost_delta > 0:
        parts.append(f"Additional cost of ${cost_delta:,} vs baseline.")
        
    return " ".join(parts)
