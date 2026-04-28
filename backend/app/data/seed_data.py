from __future__ import annotations

from datetime import UTC, datetime, timedelta, timezone
from typing import Any

from app.utils.geo_validation import distance_nm, route_length_nm


IST = timezone(timedelta(hours=5, minutes=30))
NOW = datetime.now(UTC)


def iso(hours: float = 0) -> str:
    return (NOW + timedelta(hours=hours)).isoformat()


def iso_ist(hours: float = 0) -> str:
    return (NOW + timedelta(hours=hours)).astimezone(IST).isoformat()


PORTS: list[dict[str, Any]] = [
    {"id": "port-kochi", "name": "Kochi Port", "shortName": "Kochi", "country": "India", "position": [9.9687, 76.2393], "kind": "port", "congestionPct": 68, "vesselsWaiting": 5, "avgWaitHours": 22, "jettyOccupancyPct": 81, "weatherStatus": "Moderate swell", "strikeRisk": 12, "isBpclHub": True},
    {"id": "port-mumbai-jnpt", "name": "Mumbai Port / JNPT", "shortName": "Mumbai", "country": "India", "position": [18.9433, 72.9486], "kind": "port", "congestionPct": 84, "vesselsWaiting": 9, "avgWaitHours": 38, "jettyOccupancyPct": 92, "weatherStatus": "Light swell", "strikeRisk": 18, "isBpclHub": True},
    {"id": "port-sikka", "name": "Jamnagar / Sikka", "shortName": "Jamnagar", "country": "India", "position": [22.4236, 69.8062], "kind": "port", "congestionPct": 47, "vesselsWaiting": 3, "avgWaitHours": 11, "jettyOccupancyPct": 59, "weatherStatus": "Clear", "strikeRisk": 6, "isBpclHub": False},
    {"id": "port-fujairah", "name": "Fujairah", "shortName": "Fujairah", "country": "UAE", "position": [25.1749, 56.3587], "kind": "port", "congestionPct": 58, "vesselsWaiting": 12, "avgWaitHours": 24, "jettyOccupancyPct": 73, "weatherStatus": "Clear", "strikeRisk": 8, "isBpclHub": False},
    {"id": "port-ras-tanura", "name": "Ras Tanura", "shortName": "Ras Tanura", "country": "Saudi Arabia", "position": [26.6387, 50.1706], "kind": "terminal", "congestionPct": 35, "vesselsWaiting": 4, "avgWaitHours": 9, "jettyOccupancyPct": 54, "weatherStatus": "Clear", "strikeRisk": 5, "isBpclHub": False},
    {"id": "port-basrah", "name": "Basrah / Al Basrah Oil Terminal", "shortName": "Basrah", "country": "Iraq", "position": [29.7950, 48.8150], "kind": "terminal", "congestionPct": 45, "vesselsWaiting": 6, "avgWaitHours": 14, "jettyOccupancyPct": 65, "weatherStatus": "Clear", "strikeRisk": 7, "isBpclHub": False},
    {"id": "port-novorossiysk", "name": "Novorossiysk", "shortName": "Russia", "country": "Russia", "position": [44.7243, 37.7675], "kind": "port", "congestionPct": 32, "vesselsWaiting": 3, "avgWaitHours": 10, "jettyOccupancyPct": 45, "weatherStatus": "Choppy", "strikeRisk": 4, "isBpclHub": False},
    {"id": "port-houston", "name": "Houston / Galveston", "shortName": "USA", "country": "USA", "position": [29.3013, -94.7977], "kind": "port", "congestionPct": 42, "vesselsWaiting": 6, "avgWaitHours": 15, "jettyOccupancyPct": 60, "weatherStatus": "Clear", "strikeRisk": 5, "isBpclHub": False},
    {"id": "port-hormuz", "name": "Strait of Hormuz Region", "shortName": "Hormuz", "country": "Oman/UAE", "position": [26.3500, 56.6500], "kind": "chokepoint", "congestionPct": 0, "vesselsWaiting": 0, "avgWaitHours": 0, "jettyOccupancyPct": 0, "weatherStatus": "Transit advisory", "strikeRisk": 35, "isBpclHub": False},
]


PORT_INDEX = {port["id"]: port for port in PORTS}


ROUTES: list[dict[str, Any]] = [
    {
        "id": "route-russia-sikka",
        "routeCode": "R001",
        "name": "Novorossiysk to Sikka",
        "originPortId": "port-novorossiysk",
        "destinationPortId": "port-sikka",
        "waypoints": [
            (44.7, 37.8), (40.0, 26.0), (33.0, 24.0), (31.0, 32.5), (29.0, 33.0), (20.0, 39.0), (12.0, 44.0), (14.0, 52.0), (20.0, 62.0), (22.42, 69.80)
        ],
        "tradeLane": "Russia to India West Coast",
    },
    {
        "id": "route-basrah-mumbai",
        "routeCode": "R002",
        "name": "Basrah to Mumbai/JNPT",
        "originPortId": "port-basrah",
        "destinationPortId": "port-mumbai-jnpt",
        "waypoints": [
            (30.1, 48.9), (28.6, 50.1), (27.18, 51.22), (26.57, 53.36), (26.19, 54.39), (26.13, 55.34), (26.4, 56.4), (26.51, 56.54), (26.42, 56.76), (25.96, 56.93), (25.5, 57.1), (24.0, 59.0), (23.45, 61.55), (22.84, 64.44), (22.57, 65.72), (22.3, 67.0), (20.80, 69.59), (20.0, 70.0), (19.0, 72.4), (18.94, 72.80)
        ],
        "tradeLane": "Iraq to India West Coast",
    },
    {
        "id": "route-fujairah-kochi",
        "routeCode": "R003",
        "name": "Fujairah to Kochi",
        "originPortId": "port-fujairah",
        "destinationPortId": "port-kochi",
        "waypoints": [
            (25.17, 56.35), (24.0, 59.0), (21.4, 62.3), (19.4, 64.9), (17.5, 66.2), (15.6, 67.5), (13.7, 69.9), (12.6, 71.4), (9.96, 76.23)
        ],
        "tradeLane": "UAE to South India",
    },
    {
        "id": "route-usa-mumbai",
        "routeCode": "R004",
        "name": "Houston to Mumbai",
        "originPortId": "port-houston",
        "destinationPortId": "port-mumbai-jnpt",
        "waypoints": [
            [29.3423, -94.7696], [29.3379, -94.6878], [29.3068, -94.6251], [29.1479, -94.3779], [29.1321, -93.6685], [29.13, -93.214], [28.867366, -92.411602], [28.782322, -92.151777], [28.645662, -91.842882], [28.515764, -91.549269], [28.409415, -91.308884], [27.998808, -90.380776], [27.783021, -89.893027], [27.727009, -89.766422], [27.22807, -88.638654], [27.0444, -88.2235], [27.029745, -88.194005], [26.617905, -87.365118], [26.367057, -86.86025], [26.280286, -86.685611], [25.874468, -85.868843], [25.160345, -84.431568], [24.3, -82.7], [24.2187, -81.825], [24.504, -80.8143], [24.513328, -80.797078], [24.7537, -80.3533], [25.114792, -80.029414], [25.594487, -78.144881], [25.857341, -77.112232], [25.8588, -77.1065], [25.946026, -76.61827], [26.002864, -76.300128], [26.067607, -76.327093], [26.346963, -75.657688], [26.452033, -75.405913], [26.891691, -74.352383], [27.014868, -74.057221], [27.091075, -73.87461], [27.108831, -73.832064], [27.330978, -73.299744], [27.41841, -73.090234], [27.531894, -72.818299], [27.804838, -72.164258], [27.822254, -72.122525], [28.422096, -70.685156], [28.704929, -70.007418], [28.765464, -69.862361], [29.103898, -69.051387], [29.1243, -69.0025], [29.303401, -68.396402], [29.613372, -67.347424], [30.079066, -65.771462], [30.338901, -64.892149], [31.103811, -62.303605], [31.186227, -62.024698], [31.784301, -60.000749], [32.424706, -57.833543], [32.4371, -57.7916], [32.454415, -57.742406], [33.912816, -53.598858], [34.6437, -51.5223], [34.829318, -50.002027], [35.006266, -48.55276], [35.433693, -45.051994], [35.448318, -44.932205], [36.050314, -40.00166], [36.1836, -38.91], [36.271266, -35.95958], [36.330185, -33.976613], [36.448298, -30.001492], [36.5022, -28.1874], [36.409169, -23.891026], [36.408059, -23.839759], [36.378758, -22.486564], [36.324949, -20.001544], [36.29, -18.3875], [36.201224, -15.087759], [36.143675, -12.948729], [36.134522, -12.608538], [36.040957, -9.130793], [36.035528, -8.929005], [36.033084, -8.838176], [36.015813, -8.196204], [35.995663, -7.447269], [35.95, -5.75], [35.968819, -5.354867], [35.97289, -5.269383], [36.0, -4.7], [36.156455, -3.683043], [36.158352, -3.670714], [36.220888, -3.264225], [36.324512, -2.590675], [36.377724, -2.244793], [36.473171, -1.62439], [36.666667, -0.366667], [37.2, 3.1], [37.4, 7.5], [37.4851, 10.1431], [37.489085, 10.372293], [37.5, 11.0], [37.454891, 11.172235], [37.283186, 11.827836], [37.215493, 12.086301], [37.212689, 12.097004], [37.209117, 12.110644], [36.907095, 13.263819], [36.4, 15.2], [36.086854, 16.726588], [35.845726, 17.902084], [35.126694, 21.407365], [34.8, 23.0], [34.187436, 24.926664], [34.011915, 25.478721], [33.748752, 26.306431], [33.328, 27.6298], [33.219565, 27.927542], [33.115811, 28.212434], [32.863395, 28.905525], [32.316071, 30.408377], [31.7, 32.1], [31.298117, 32.387159], [30.945814, 32.306671], [30.318359, 32.382202], [30.213982, 32.557983], [29.7, 32.6], [27.9, 33.75], [27.0, 34.5], [23.6, 37.0], [20.75, 38.9], [16.3, 41.2], [15.0, 42.0], [12.7, 43.3], [12.40439, 43.746586], [12.0, 45.0], [13.0, 51.0], [14.030876, 54.187058], [14.6921, 56.2313], [15.644932, 59.44496], [16.2661, 61.54], [16.551398, 62.6071], [17.128701, 64.766386], [17.527476, 66.257926], [17.707, 66.9294], [17.911613, 67.795105], [18.43269, 69.999749], [19.0, 72.4], [18.941361, 72.80777]
        ],
        "tradeLane": "USA to India West Coast via Suez",
    },
]


ROUTE_INDEX = {route["id"]: route for route in ROUTES}


for route in ROUTES:
    route["lengthNm"] = route_length_nm(route["waypoints"])
    route["origin"] = PORT_INDEX[route["originPortId"]]["shortName"]
    route["destination"] = PORT_INDEX[route["destinationPortId"]]["shortName"]


def _interpolate_position(route_waypoints: list[tuple[float, float]], progress_pct: float) -> tuple[float, float, float]:
    if len(route_waypoints) < 2:
        lat, lon = route_waypoints[0]
        return lat, lon, 0.0

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

    lat, lon = route_waypoints[-1]
    heading = _bearing_degrees(route_waypoints[-2], route_waypoints[-1])
    return round(lat, 4), round(lon, 4), heading


def _bearing_degrees(start: tuple[float, float], end: tuple[float, float]) -> float:
    lat_delta = end[0] - start[0]
    lon_delta = end[1] - start[1]
    if lat_delta == 0 and lon_delta == 0:
        return 0.0
    import math

    angle = math.degrees(math.atan2(lon_delta, lat_delta))
    return round((angle + 360.0) % 360.0, 1)


def _hours_to_eta(route_id: str, progress_pct: float, speed_knots: float, delay_hours: int) -> float:
    route = ROUTE_INDEX[route_id]
    remaining_nm = route["lengthNm"] * (1 - progress_pct / 100)
    transit_hours = remaining_nm / max(speed_knots, 0.1)
    return round(transit_hours + delay_hours, 1)


def _build_vessel(vessel_id: str, name: str, imo: str, mmsi: str, type: str, dwt: int, gt: int, nt: int, length: int, ownership: str, status: str, speed_knots: float, progress_pct: float, risk_score: int, delay_prob: int, route_id: str, cargo_bbl: int, daily_rate: int, recommended_route_override: list[list[float]] = None) -> dict[str, Any]:
    route = ROUTE_INDEX[route_id]
    lat, lon, heading = _interpolate_position(route["waypoints"], progress_pct)
    
    # Calculate remaining distance for ETA
    total_dist = sum(distance_nm(route["waypoints"][i-1][0], route["waypoints"][i-1][1], route["waypoints"][i][0], route["waypoints"][i][1]) for i in range(1, len(route["waypoints"])))
    target_dist = total_dist * (progress_pct / 100.0)
    
    # Truncate currentRoute to start from current position + remaining waypoints
    traversed = 0
    next_waypoint_idx = 1
    for i in range(1, len(route["waypoints"])):
        leg = distance_nm(route["waypoints"][i-1][0], route["waypoints"][i-1][1], route["waypoints"][i][0], route["waypoints"][i][1])
        if traversed + leg >= target_dist:
            next_waypoint_idx = i
            break
        traversed += leg
    full_route = [[round(w[0], 4), round(w[1], 4)] for w in route["waypoints"]]
    pos = [round(lat, 4), round(lon, 4)]
    
    # Custom recommended routes for demo
    rec_route = None
    if vessel_id == "v-volgograd":
        rec_route = [pos, [20.08, 64.5], [20.0, 70.0], [18.94, 72.8]]
    elif vessel_id == "v-houston-voyager":
        # Houston diversion to Kochi
        rec_route = [pos, [16.5, 73.2], [13.8, 74.5], [9.96, 76.23]]
    
    # Split full route into past and future
    split_idx = int((len(full_route) - 1) * progress_pct / 100)
    past_route = full_route[:split_idx+1]
    # Add exact current position as the bridge between past and future
    if pos not in past_route:
        past_route.append(pos)
    
    # Remaining route starts from current position to the remaining waypoints
    future_route = [pos] + full_route[split_idx+1:]
    
    destination = PORT_INDEX[route["destinationPortId"]]
    origin = PORT_INDEX[route["originPortId"]]

    return {
        "id": vessel_id,
        "name": name,
        "imo": imo,
        "mmsi": mmsi,
        "flag": "IN", # Defaulting to IN for these vessels or keep original logic if I had it
        "type": type,
        "dwt": dwt,
        "gt": gt,
        "nt": nt,
        "length": length,
        "isBpcl": ownership == "BPCL",
        "ownership": ownership,
        "status": status,
        "speedKnots": speed_knots,
        "headingDeg": heading,
        "position": pos,
        "progressPct": progress_pct,
        "origin": origin["shortName"],
        "destination": destination["shortName"],
        "destinationCoords": full_route[-1],
        "etaUtc": "2026-05-01T12:00:00Z", # Placeholder or calculate
        "etaIst": "2026-05-01T17:30:00Z", # Placeholder or calculate
        "riskScore": risk_score,
        "delayProbability": delay_prob,
        "routeId": route_id,
        "pastRoute": past_route,
        "currentRoute": future_route,
        "recommendedRoute": rec_route if rec_route else (recommended_route_override if recommended_route_override else full_route),
        "cargoVolumeBbl": cargo_bbl,
        "vesselDailyRate": daily_rate,
        "confidence": 88 if risk_score < 70 else 74,
        "lastUpdateMin": 1
    }


# High-fidelity refined fleet (4 Ships)
VESSELS: list[dict[str, Any]] = [
    _build_vessel(
        vessel_id="v-volgograd", 
        name="MT Volgograd", 
        imo="9827311", 
        mmsi="419001234", 
        type="VLCC", 
        dwt=318000, 
        gt=162000, 
        nt=105000, 
        length=333, 
        ownership="Chartered", 
        status="onTrack", 
        speed_knots=12.6, 
        progress_pct=85.0, 
        risk_score=24, 
        delay_prob=15, 
        route_id="route-russia-sikka", 
        cargo_bbl=2150000, 
        daily_rate=48000,
        recommended_route_override=[[18.2223, 59.0372], [20.0838, 64.5005], [20.0761, 65.0053], [20.0, 70.0], [19.0, 72.4], [18.9433, 72.9486]]
    ),
    _build_vessel(vessel_id="v-basrah-star", name="MT Basrah Star", imo="9764328", mmsi="419005678", type="Suezmax", dwt=158000, gt=81000, nt=52000, length=274, ownership="BPCL", status="delayed", speed_knots=10.8, progress_pct=40.0, risk_score=62, delay_prob=58, route_id="route-basrah-mumbai", cargo_bbl=980000, daily_rate=32000),
    _build_vessel(vessel_id="v-fujairah-king", name="MT Fujairah King", imo="9652431", mmsi="419009999", type="Aframax", dwt=112000, gt=64000, nt=40200, length=246, ownership="BPCL", status="highRisk", speed_knots=13.9, progress_pct=65.0, risk_score=78, delay_prob=64, route_id="route-fujairah-kochi", cargo_bbl=720000, daily_rate=24000),
    _build_vessel(vessel_id="v-houston-voyager", name="MT Houston Voyager", imo="9542180", mmsi="419002222", type="VLCC", dwt=302000, gt=156000, nt=98000, length=330, ownership="Chartered", status="critical", speed_knots=14.2, progress_pct=92.0, risk_score=91, delay_prob=79, route_id="route-usa-mumbai", cargo_bbl=2050000, daily_rate=52000),
]


RISK_ZONES: list[dict[str, Any]] = [
    {
        "id": "rz-hormuz",
        "name": "Strait of Hormuz",
        "type": "geopolitical",
        "severity": "critical",
        "polygon": [(26.55, 55.45), (26.85, 56.10), (26.70, 57.05), (26.20, 57.35), (25.65, 56.90), (25.55, 55.95), (26.00, 55.35)],
        "description": "Energy chokepoint with elevated security advisories and insurance shocks.",
        "reason": "Geopolitical escalation",
        "confidence": 92,
        "vesselsAffected": 4,
        "expiryTime": iso(72),
    },
    {
        "id": "rz-aden",
        "name": "Gulf of Aden",
        "type": "piracy",
        "severity": "high",
        "polygon": [(14.75, 43.00), (15.00, 48.50), (13.50, 51.80), (11.80, 50.80), (11.50, 45.00), (12.50, 42.80)],
        "description": "Security corridor requiring convoy monitoring and insurance watch.",
        "reason": "Piracy and drone activity",
        "confidence": 86,
        "vesselsAffected": 1,
        "expiryTime": iso(96),
    },
    {
        "id": "rz-suez",
        "name": "Suez Canal",
        "type": "congestion",
        "severity": "medium",
        "polygon": [(31.20, 32.05), (30.95, 32.50), (30.30, 32.55), (29.90, 32.20), (30.10, 31.95), (30.80, 31.95)],
        "description": "Canal and anchorage delay zone affecting Europe-India arrivals.",
        "reason": "Convoy and anchorage congestion",
        "confidence": 79,
        "vesselsAffected": 1,
        "expiryTime": iso(48),
    },
    {
        "id": "rz-bab",
        "name": "Bab-el-Mandeb",
        "type": "geopolitical",
        "severity": "high",
        "polygon": [(13.60, 42.20), (13.40, 43.40), (12.80, 43.70), (12.15, 43.10), (12.25, 42.20), (12.90, 41.90)],
        "description": "Red Sea gateway with missile and drone exposure risk.",
        "reason": "Security corridor risk",
        "confidence": 70,
        "vesselsAffected": 1,
        "expiryTime": iso(120),
    },
    {
        "id": "rz-cyclone",
        "name": "Arabian Sea Cyclone Cell",
        "type": "weather",
        "severity": "medium",
        "polygon": [(18.50, 65.20), (19.80, 67.50), (18.70, 70.80), (15.80, 71.20), (14.80, 68.20), (16.10, 65.00)],
        "description": "Monsoon-season low pressure cell with swell and route-speed penalties.",
        "reason": "Weather disruption",
        "confidence": 70,
        "vesselsAffected": 2,
        "expiryTime": iso(60),
    },
    {
        "id": "rz-red-sea",
        "name": "Red Sea Security Corridor",
        "type": "geopolitical",
        "severity": "high",
        "polygon": [(18.80, 40.80), (18.80, 43.50), (15.20, 43.80), (13.20, 42.80), (13.00, 40.80), (16.20, 39.90)],
        "description": "Northbound and southbound tanker traffic under elevated security watch.",
        "reason": "Missile and drone risk",
        "confidence": 70,
        "vesselsAffected": 1,
        "expiryTime": iso(144),
    },
]


HISTORICAL_MATCHES: list[dict[str, Any]] = [
    {"id": "hm-suez-2021", "position": [29.9, 32.5], "date": "2021-03-23", "title": "Suez blockage 2021", "summary": "Canal closure caused widespread convoy delays and rerouting via Cape. Total transit halt for 6 days.", "match": 91},
    {"id": "hm-hormuz-2019", "position": [26.2, 56.3], "date": "2019-06-13", "title": "Hormuz tensions 2019", "summary": "Insurance spikes and tanker security alerts in the Gulf. Two-day transit restriction.", "match": 94},
    {"id": "hm-red-sea", "position": [12.6, 47.8], "date": "2024-01-12", "title": "Red Sea attacks", "summary": "Security corridor disruption shifted tanker flows to longer southern routes. Increased hijack risk.", "match": 81},
    {"id": "hm-tauktae", "position": [21.5, 69.2], "date": "2021-05-17", "title": "Cyclone Tauktae", "summary": "Western India offshore operations disrupted by severe weather. Western port closures for 48h.", "match": 74},
    {"id": "hm-gulf-incidents", "position": [25.5, 58.5], "date": "2023-04-29", "title": "Gulf tanker incidents", "summary": "Localized tanker delays and escort requirements around Gulf chokepoints.", "match": 79},
]


DECISIONS: list[dict[str, Any]] = [
    {
        "id": "d-001",
        "title": "Divert MT Houston Voyager to Kochi Port",
        "category": "reroute",
        "priority": "critical",
        "status": "pending",
        "createdAt": iso(-2),
        "vesselId": "v-houston-voyager",
        "vesselName": "MT Houston Voyager",
        "cause": "Mumbai Port congestion index at 84% with 9 vessels waiting",
        "oneLineReason": "Diverting to Kochi avoids a projected 38h demurrage window while securing critical crude supply.",
        "reasoning": ["Mumbai congestion exceeds operational threshold", "Kochi has available jetty slots (D+1)", "Refinery buffer at Mumbai can sustain with current inventory"],
        "reasoningFactors": [
            {"factor": "Port Congestion", "weight": 0.45, "direction": "negative", "summary": "Mumbai wait time at 38h"},
            {"factor": "Demurrage Cost", "weight": 0.25, "direction": "negative", "summary": "Estimated $180K/day if waiting"},
            {"factor": "Route Delta", "weight": 0.20, "direction": "neutral", "summary": "Minimal deviation from current track"},
            {"factor": "Refinery Buffer", "weight": 0.10, "direction": "positive", "summary": "Kochi buffer at 2.1 days"},
        ],
        "confidenceBreakdown": {"riskSignal": 94, "delayForecast": 88, "costEstimate": 85, "bufferPrediction": 91},
        "evidence": [
            {"id": "e-001", "type": "port", "source": "Mumbai Port Control", "summary": "Berth availability restricted due to draft maintenance.", "confidence": 95, "timestamp": iso(-4)},
            {"id": "e-002", "type": "ais", "source": "AIS Stream", "summary": "Increasing tanker density at Mumbai outer anchorage.", "confidence": 92, "timestamp": iso(-1)},
        ],
        "alternatives": [
            {"id": "a-001", "label": "Maintain Mumbai destination", "deltaDelayHours": 38, "deltaCost": 280000, "deltaRisk": 42, "rejectionReason": "Incurs high demurrage and inventory risk.", "feasible": True},
            {"id": "a-002", "label": "Slow steam to Mumbai", "deltaDelayHours": 12, "deltaCost": 90000, "deltaRisk": 15, "rejectionReason": "Arrives too late for Mumbai refinery slate.", "feasible": True},
        ],
        "comparison": {"current": {"delayHours": 38, "cost": 280000, "risk": 91, "bufferDays": 1.2}, "recommended": {"delayHours": 4, "cost": 45000, "risk": 18, "bufferDays": 3.4}},
        "effect": "-34h delay, -$235K combined cost impact",
        "recommendation": "Divert MT Houston Voyager to Kochi Port immediately",
        "alternativeCount": 2,
        "confidence": 70,
        "costImpact": -235000,
        "delayHoursImpact": -34,
        "riskDelta": -73,
        "bufferImpactDays": 2.2,
        "source": "live",
    },
    {
        "id": "d-002",
        "title": "Divert MT Volgograd to Mumbai Port",
        "category": "reroute",
        "priority": "high",
        "status": "pending",
        "createdAt": iso(-5),
        "vesselId": "v-volgograd",
        "vesselName": "MT Volgograd",
        "cause": "Sikka Port Strike / Labor Disruption",
        "oneLineReason": "Sikka is currently closed due to a sudden port strike. Diverting to Mumbai secures the Russian crude delivery with minimal delay.",
        "reasoning": ["Sikka Port Control issued a closure notice (D+3)", "Mumbai has available jetty slots (D+2)", "Russian crude feedstock is critical for Mumbai refinery slate"],
        "reasoningFactors": [
            {"factor": "Port Strike Risk", "weight": 0.55, "direction": "negative", "summary": "Sikka port closed indefinitely"},
            {"factor": "Refinery Supply", "weight": 0.30, "direction": "positive", "summary": "Critical Russian crude feedstock"},
            {"factor": "Route Deviation", "weight": 0.15, "direction": "neutral", "summary": "Mumbai is a secondary hub for this parcel"},
        ],
        "confidenceBreakdown": {"riskSignal": 94, "delayForecast": 85, "costEstimate": 88, "bufferPrediction": 91},
        "evidence": [
            {"id": "e-003", "type": "news", "source": "Reuters Maritime", "summary": "Unions at Sikka Port announce indefinite labor strike.", "confidence": 98, "timestamp": iso(-2)},
            {"id": "e-004", "type": "port", "source": "Sikka Port Control", "summary": "All berthing operations suspended until further notice.", "confidence": 100, "timestamp": iso(-1)},
        ],
        "alternatives": [
            {"id": "a-003", "label": "Anchorage wait at Sikka", "deltaDelayHours": 144, "deltaCost": 680000, "deltaRisk": 82, "rejectionReason": "Indefinite wait time with high demurrage exposure.", "feasible": True},
        ],
        "comparison": {"current": {"delayHours": 144, "cost": 680000, "risk": 24, "bufferDays": 3.5}, "recommended": {"delayHours": 12, "cost": 120000, "risk": 15, "bufferDays": 2.8}},
        "effect": "-132h delay, -$560K combined cost savings",
        "recommendation": "Divert to Mumbai Port to avoid Sikka labor disruption",
        "alternativeCount": 1,
        "confidence": 70,
        "costImpact": -560000,
        "delayHoursImpact": -132,
        "riskDelta": -9,
        "bufferImpactDays": -0.7,
        "source": "live",
    },
    {
        "id": "d-003",
        "title": "Prioritize MT Fujairah King at Kochi jetty",
        "category": "throughput",
        "priority": "medium",
        "status": "pending",
        "createdAt": iso(-1),
        "vesselId": "v-fujairah-king",
        "vesselName": "MT Fujairah King",
        "cause": "High risk status and regional congestion",
        "oneLineReason": "Accelerated discharge reduces risk-adjusted insurance exposure in high-density corridors.",
        "reasoning": ["Vessel status is High Risk", "Kochi jetty slot available D+2", "Minimizes dwell time in contested waters"],
        "confidenceBreakdown": {"riskSignal": 78, "delayForecast": 82, "costEstimate": 75, "bufferPrediction": 81},
        "evidence": [{"id": "e-004", "type": "security", "source": "Regional Security Hub", "summary": "Elevated drone risk alerts in Gulf approach.", "confidence": 82, "timestamp": iso(-1)}],
        "alternatives": [{"id": "a-004", "label": "Maintain current sequence", "deltaDelayHours": 24, "deltaCost": 120000, "deltaRisk": 15, "rejectionReason": "Prolongs exposure in high-risk zone.", "feasible": True}],
        "comparison": {"current": {"delayHours": 24, "cost": 120000, "risk": 78, "bufferDays": 2.4}, "recommended": {"delayHours": 4, "cost": 40000, "risk": 32, "bufferDays": 2.2}},
        "effect": "-20h exposure reduction",
        "recommendation": "Prioritize MT Fujairah King for next available jetty slot",
        "alternativeCount": 1,
        "confidence": 70,
        "costImpact": -80000,
        "delayHoursImpact": -20,
        "riskDelta": -46,
        "bufferImpactDays": -0.2,
        "source": "live",
    },
]


SCENARIOS: list[dict[str, Any]] = [
    {"id": "baseline", "name": "Baseline Operations", "description": "Normal operating profile across active fleet.", "severity": "normal"},
    {"id": "hormuz-blockade", "name": "Hormuz Blockade", "description": "Active demo scenario: security closure around Hormuz with insurance and delay shocks.", "severity": "critical"},
    {"id": "arabian-cyclone", "name": "Arabian Cyclone", "description": "Weather disruption across the Arabian Sea approach lanes.", "severity": "warning"},
    {"id": "port-strike", "name": "Port Strike", "description": "Labor disruption and berth capacity loss at receiving terminals.", "severity": "warning"},
    {"id": "insurance-surge", "name": "Insurance Surge", "description": "War-risk and cargo cover price shock.", "severity": "warning"},
]


INSIGHTS: list[dict[str, Any]] = [
    {"id": "ins-001", "kind": "warning", "title": "Kochi congestion likely to increase demurrage in 48h", "body": "Queue growth and high-risk arrivals are converging around the Kochi berth plan.", "confidence": 70, "impact": "$420K exposure", "suggestedAction": "Prioritize MT Bharat discharge"},
    {"id": "ins-002", "kind": "opportunity", "title": "MT Horizon speed adjustment can save landed cost", "body": "Slow steaming aligns ETA with berth window and reduces fuel plus anchorage cost.", "confidence": 70, "impact": "$196K savings", "suggestedAction": "Approve schedule action"},
    {"id": "ins-003", "kind": "benchmark", "title": "Fleet ETA reliability is above 30-day average", "body": "Five of eight active vessels remain within confidence bands despite regional risk.", "confidence": 70, "impact": "+7% reliability", "suggestedAction": "Keep current fleet monitoring cadence"},
    {"id": "ins-004", "kind": "observation", "title": "Arabian Sea weather risk easing after 72h", "body": "Cyclone cell weakens in the current demo forecast envelope.", "confidence": 70, "impact": "Lower route disruption", "suggestedAction": "Recalculate after next model update"},
]


ANOMALIES: list[dict[str, Any]] = [
    {"id": "an-001", "metric": "Demurrage", "entity": "MT Bharat", "severity": "critical", "hoursAgo": 2, "delta": "+38%", "description": "Demurrage forecast exceeded configured critical band.", "rootCause": "Kochi berth prioritization conflict", "recommendedAction": "Advance discharge slot"},
    {"id": "an-002", "metric": "Risk Index", "entity": "Hormuz corridor", "severity": "high", "hoursAgo": 5, "delta": "+21", "description": "Geopolitical risk and insurance inputs moved together.", "rootCause": "Security advisory plus market quote change", "recommendedAction": "Review reroute candidates"},
    {"id": "an-003", "metric": "ETA Reliability", "entity": "Mumbai-bound fleet", "severity": "medium", "hoursAgo": 13, "delta": "-9%", "description": "ETA confidence reduced due to port queue growth.", "rootCause": "Berth availability slippage", "recommendedAction": "Slow steam delayed arrivals"},
    {"id": "an-004", "metric": "ESG Idle Burn", "entity": "MT Horizon", "severity": "low", "hoursAgo": 28, "delta": "+6%", "description": "Idle burn trend increased at anchorage.", "rootCause": "Waiting state near Fujairah", "recommendedAction": "Apply speed plan"},
]


def moved_position(vessel: dict[str, Any]) -> list[float]:
    route = ROUTE_INDEX[vessel["routeId"]]
    offset_pct = ((datetime.now(UTC).minute % 6) - 3) * 0.06
    adjusted_progress = max(0.0, min(99.5, vessel["progressPct"] + offset_pct))
    lat, lon, _ = _interpolate_position(route["waypoints"], adjusted_progress)
    return [lat, lon]
