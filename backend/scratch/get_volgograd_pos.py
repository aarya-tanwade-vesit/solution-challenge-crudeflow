from app.utils.geo_validation import distance_nm
import math

def _bearing_degrees(start, end):
    lat_delta = end[0] - start[0]
    lon_delta = end[1] - start[1]
    if lat_delta == 0 and lon_delta == 0:
        return 0.0
    angle = math.degrees(math.atan2(lon_delta, lat_delta))
    return round((angle + 360.0) % 360.0, 1)

def _interpolate_position(route_waypoints, progress_pct):
    if len(route_waypoints) < 2:
        return route_waypoints[0][0], route_waypoints[0][1], 0.0

    progress = max(0.0, min(progress_pct, 100.0)) / 100
    segments = []
    total_nm = 0.0
    for idx in range(len(route_waypoints) - 1):
        start = route_waypoints[idx]
        end = route_waypoints[idx + 1]
        seg_nm = distance_nm(start[0], start[1], end[0], end[1])
        segments.append((start, end, seg_nm))
        total_nm += seg_nm

    target_nm = total_nm * progress
    traversed = 0.0
    for start, end, seg_nm in segments:
        next_traversed = traversed + seg_nm
        if target_nm <= next_traversed or seg_nm == 0:
            ratio = 0.0 if seg_nm == 0 else (target_nm - traversed) / seg_nm
            lat = start[0] + (end[0] - start[0]) * ratio
            lon = start[1] + (end[1] - start[1]) * ratio
            heading = _bearing_degrees(start, end)
            return round(lat, 4), round(lon, 4), heading
        traversed = next_traversed
    return route_waypoints[-1][0], route_waypoints[-1][1], 0.0

waypoints = [(44.7, 37.8), (40.0, 26.0), (33.0, 24.0), (31.0, 32.5), (29.0, 33.0), (20.0, 39.0), (12.0, 44.0), (14.0, 52.0), (20.0, 62.0), (22.42, 69.80)]
lat, lon, _ = _interpolate_position(waypoints, 85.0)
print(f"Position: [{lat}, {lon}]")
