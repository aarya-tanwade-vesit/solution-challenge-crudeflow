import searoute
import json

# Houston [lng, lat]
origin = [-94.7977, 29.3013]
# Mumbai [lng, lat]
destination = [72.9486, 18.9433]

route = searoute.searoute(origin, destination)
# The route is a GeoJSON Feature
# We want the coordinates: [lng, lat]

coords = route['geometry']['coordinates']
# Convert to [lat, lng] for our backend format
lat_lng_coords = [[p[1], p[0]] for p in coords]

print(json.dumps(lat_lng_coords))
