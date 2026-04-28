from __future__ import annotations

from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.data.seed_data import PORTS, ROUTE_INDEX, VESSELS
from app.utils.geo_validation import distance_nm, is_point_on_land, validate_vessel_positions


def main() -> None:
    vessel_report = validate_vessel_positions(VESSELS, ROUTE_INDEX, max_distance_nm=35)
    port_results = []
    port_violations = []

    for port in PORTS:
        lat, lon = port["position"]
        is_land = is_point_on_land(lat, lon)
        endpoint_distances = []
        for route in ROUTE_INDEX.values():
            for waypoint in route["waypoints"]:
                endpoint_distances.append(distance_nm(lat, lon, waypoint[0], waypoint[1]))
        nearest_endpoint_nm = round(min(endpoint_distances), 2) if endpoint_distances else None
        record = {
            "portId": port["id"],
            "portName": port["name"],
            "onLand": is_land,
            "kind": port["kind"],
            "nearestRouteEndpointNm": nearest_endpoint_nm,
        }
        port_results.append(record)
        if port["kind"] != "chokepoint" and (nearest_endpoint_nm is None or nearest_endpoint_nm > 25):
            port_violations.append(record)

    print("NEMO CrudeFlow geospatial validation")
    print(f"vessels checked: {vessel_report['vesselsChecked']}")
    print(f"land violations: {len(vessel_report['landViolations'])}")
    print(f"route distance violations: {len(vessel_report['routeDistanceViolations'])}")
    print(f"ports checked: {len(port_results)}")
    print(f"port shoreline/ocean anomalies: {len(port_violations)}")

    if vessel_report["landViolations"]:
        print("\nVessel land violations:")
        for item in vessel_report["landViolations"]:
            print(f"- {item['vesselName']} ({item['vesselId']})")

    if vessel_report["routeDistanceViolations"]:
        print("\nVessel route corridor violations:")
        for item in vessel_report["routeDistanceViolations"]:
            print(
                f"- {item['vesselName']} ({item['vesselId']}): "
                f"{item['routeDistanceNm']} nm from route"
            )

    if port_violations:
        print("\nPort shoreline/ocean anomalies:")
        for item in port_violations:
            print(f"- {item['portName']} ({item['portId']})")


if __name__ == "__main__":
    main()
