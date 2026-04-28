from __future__ import annotations

import warnings
from dataclasses import dataclass
from typing import Any

from app.optimization.constants import CHOKEPOINTS, PORT_ALIASES, PORTS
from app.optimization.utils import as_map_coordinates, haversine_nm, passage_display, round2


@dataclass(frozen=True)
class MaritimeRoute:
    route_name: str
    route: list[str]
    route_coordinates: list[list[float]]
    map_coordinates: list[list[float]]
    distance_nm: float
    eta_hours: float
    eta_days: float
    routing_provider: str
    passages_traversed: list[str]
    passage_labels: list[str]
    warnings: list[str]


class MaritimeRouter:
    provider = "searoute-py"

    def resolve_port(self, name: str) -> tuple[float, float]:
        canonical = PORT_ALIASES.get(name, name)
        if canonical not in PORTS:
            raise KeyError(f"Unknown port '{name}'. Add it to optimization.constants.PORTS.")
        return PORTS[canonical]

    def calculate_route(
        self,
        route: list[str],
        vessel_speed_knots: float,
        route_name: str = "Maritime route",
        restrictions: list[str] | None = None,
    ) -> MaritimeRoute:
        try:
            return self._calculate_with_searoute(route, vessel_speed_knots, route_name, restrictions)
        except Exception as exc:
            return self._fallback_route(route, vessel_speed_knots, route_name, str(exc))

    def _calculate_with_searoute(
        self,
        route: list[str],
        vessel_speed_knots: float,
        route_name: str,
        restrictions: list[str] | None,
    ) -> MaritimeRoute:
        import searoute as sr

        coordinates: list[list[float]] = []
        total_distance = 0.0
        total_duration = 0.0
        passages: list[str] = []
        route_warnings: list[str] = []

        for origin, destination in zip(route, route[1:]):
            with warnings.catch_warnings(record=True) as caught:
                warnings.simplefilter("always")
                feature: dict[str, Any] = sr.searoute(
                    self.resolve_port(origin),
                    self.resolve_port(destination),
                    units="naut",
                    speed_knot=max(vessel_speed_knots, 1),
                    append_orig_dest=True,
                    restrictions=restrictions or ["northwest"],
                    return_passages=True,
                )

            route_warnings.extend(str(item.message) for item in caught)
            segment_coords = feature.get("geometry", {}).get("coordinates", []) or []
            if coordinates and segment_coords:
                segment_coords = segment_coords[1:]
            coordinates.extend([[float(lon), float(lat)] for lon, lat in segment_coords])
            properties = feature.get("properties", {})
            total_distance += float(properties.get("length") or 0)
            total_duration += float(properties.get("duration_hours") or 0)
            passages.extend([str(passage) for passage in properties.get("traversed_passages") or []])

        if not coordinates:
            raise RuntimeError("searoute returned no coordinates")

        eta_days = total_duration / 24
        normalized_passages = sorted(set(p.lower().replace(" ", "_").replace("-", "_") for p in passages))
        extra_warnings = self._business_warnings(route, normalized_passages, route_name)
        return MaritimeRoute(
            route_name=route_name,
            route=route,
            route_coordinates=coordinates,
            map_coordinates=as_map_coordinates(coordinates),
            distance_nm=round2(total_distance),
            eta_hours=round2(total_duration),
            eta_days=round2(eta_days),
            routing_provider=self.provider,
            passages_traversed=normalized_passages,
            passage_labels=passage_display(normalized_passages, CHOKEPOINTS),
            warnings=route_warnings + extra_warnings,
        )

    def _fallback_route(self, route: list[str], vessel_speed_knots: float, route_name: str, reason: str) -> MaritimeRoute:
        coordinates = [[*self.resolve_port(name)] for name in route]
        distance = sum(haversine_nm(tuple(coordinates[i]), tuple(coordinates[i + 1])) for i in range(len(coordinates) - 1))
        eta_hours = distance / max(vessel_speed_knots, 1)
        return MaritimeRoute(
            route_name=route_name,
            route=route,
            route_coordinates=coordinates,
            map_coordinates=as_map_coordinates(coordinates),
            distance_nm=round2(distance),
            eta_hours=round2(eta_hours),
            eta_days=round2(eta_hours / 24),
            routing_provider="geodesic-fallback",
            passages_traversed=[],
            passage_labels=[],
            warnings=[f"searoute-py fallback used: {reason}"],
        )

    @staticmethod
    def _business_warnings(route: list[str], passages: list[str], route_name: str) -> list[str]:
        warnings_out: list[str] = []
        if route[0] in {"Ras Tanura", "Basrah"} and "ormuz" in passages:
            warnings_out.append(
                "Origin is inside the Gulf; Hormuz transit is structurally unavoidable unless cargo is sourced outside the Gulf."
            )
        if "Emergency" in route_name:
            warnings_out.append("Maritime leg ends at alternate discharge port; downstream logistics are required.")
        return warnings_out

