from __future__ import annotations

from typing import Any, Iterable

from geopy.distance import geodesic
from global_land_mask import globe
from shapely.geometry import LineString, Point, Polygon


Coordinate = tuple[float, float]


def is_point_on_land(lat: float, lon: float) -> bool:
    return bool(globe.is_land(lat, lon))


def distance_nm(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    return float(geodesic((lat1, lon1), (lat2, lon2)).nautical)


def point_to_segment_distance_nm(point: Coordinate, start: Coordinate, end: Coordinate, samples: int = 24) -> float:
    distances = []
    for idx in range(samples + 1):
        ratio = idx / samples
        sample = (
            start[0] + (end[0] - start[0]) * ratio,
            start[1] + (end[1] - start[1]) * ratio,
        )
        distances.append(distance_nm(point[0], point[1], sample[0], sample[1]))
    return min(distances)


def is_vessel_near_route(vessel_point: Coordinate, route_waypoints: list[Coordinate], max_distance_nm: float = 35) -> bool:
    if len(route_waypoints) < 2:
        return False
    min_distance = min(
        point_to_segment_distance_nm(vessel_point, route_waypoints[idx], route_waypoints[idx + 1])
        for idx in range(len(route_waypoints) - 1)
    )
    return min_distance <= max_distance_nm


def vessel_route_distance_nm(vessel_point: Coordinate, route_waypoints: list[Coordinate]) -> float:
    if len(route_waypoints) < 2:
        return float("inf")
    return min(
        point_to_segment_distance_nm(vessel_point, route_waypoints[idx], route_waypoints[idx + 1])
        for idx in range(len(route_waypoints) - 1)
    )


def route_length_nm(route_waypoints: Iterable[Coordinate]) -> float:
    points = list(route_waypoints)
    if len(points) < 2:
        return 0.0
    return round(
        sum(
            distance_nm(points[idx][0], points[idx][1], points[idx + 1][0], points[idx + 1][1])
            for idx in range(len(points) - 1)
        ),
        1,
    )


def build_route_line(route_waypoints: list[Coordinate]) -> LineString:
    return LineString([(lon, lat) for lat, lon in route_waypoints])


def point_in_risk_zone(point: Coordinate, polygon: list[Coordinate]) -> bool:
    zone = Polygon([(lon, lat) for lat, lon in polygon])
    return zone.contains(Point(point[1], point[0]))


def validate_vessel_positions(vessels: list[dict[str, Any]], routes: dict[str, dict[str, Any]], max_distance_nm: float = 35) -> dict[str, Any]:
    results: list[dict[str, Any]] = []
    land_violations = []
    route_violations = []

    for vessel in vessels:
        lat, lon = vessel["position"]
        route = routes.get(vessel["routeId"])
        on_land = is_point_on_land(lat, lon)
        near_route = bool(route) and is_vessel_near_route((lat, lon), route["waypoints"], max_distance_nm)
        route_distance = vessel_route_distance_nm((lat, lon), route["waypoints"]) if route else float("inf")
        record = {
            "vesselId": vessel["id"],
            "vesselName": vessel["name"],
            "routeId": vessel.get("routeId"),
            "onLand": on_land,
            "nearRoute": near_route,
            "routeDistanceNm": None if route_distance == float("inf") else round(route_distance, 2),
        }
        results.append(record)
        if on_land:
            land_violations.append(record)
        if route and not near_route:
            route_violations.append(record)

    return {
        "vesselsChecked": len(vessels),
        "landViolations": land_violations,
        "routeDistanceViolations": route_violations,
        "results": results,
    }
