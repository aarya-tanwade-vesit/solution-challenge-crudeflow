import searoute
import json

# Volgograd [lng, lat]
origin = [59.0372, 18.2223]
# Mumbai [lng, lat]
destination = [72.9486, 18.9433]

route = searoute.searoute(origin, destination)
coords = route['geometry']['coordinates']
lat_lng_coords = [[p[1], p[0]] for p in coords]

print(json.dumps(lat_lng_coords))
