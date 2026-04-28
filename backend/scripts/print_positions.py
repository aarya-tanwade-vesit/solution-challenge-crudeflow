import sys
sys.path.insert(0, '.')
from app.data.seed_data import VESSELS, ROUTE_INDEX

for v in VESSELS:
    route = ROUTE_INDEX[v['routeId']]
    name = v['name']
    pos = v['position']
    progress = v['progressPct']
    heading = v['headingDeg']
    route_id = v['routeId']
    isBpcl = v['ownership'] == 'BPCL'
    print(f"{name} | lat={pos[0]}, lon={pos[1]} | progress={progress}% | heading={heading} | isBpcl={isBpcl} | route={route_id}")
