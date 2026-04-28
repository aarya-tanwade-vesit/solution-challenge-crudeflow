import requests

r = requests.get('http://localhost:8000/api/v1/map/fleet')
d = r.json()
vessels = d.get('data', {}).get('vessels', [])
print(f"Vessel count: {len(vessels)}")
for v in vessels:
    name = v.get('name', '?')
    pos = v.get('position', '?')
    heading = v.get('headingDeg', '?')
    status = v.get('status', '?')
    route = v.get('routeId', '?')
    progress = v.get('progressPct', '?')
    route_len = len(v.get('currentRoute', []))
    print(f"  {name:<20s}  pos={pos}  heading={heading}  status={status}  progress={progress}%  route_pts={route_len}")
