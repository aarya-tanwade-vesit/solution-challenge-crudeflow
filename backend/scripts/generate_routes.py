# Add the project root and backend folder to sys.path
import sys
import os
base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(base_dir)
sys.path.append(os.path.join(base_dir, "app"))

try:
    from app.optimization.maritime_router import MaritimeRouter
    from app.optimization.constants import PORTS as OPT_PORTS
except ImportError as e:
    print(f"Import error: {e}")
    sys.exit(1)

router = MaritimeRouter()

routes_to_fix = [
    ("Ras Tanura", "Kochi"),
    ("Basrah", "Mumbai"),
    ("Fujairah", "Jamnagar"),
    ("Abu Dhabi", "Kochi"),
    ("Singapore", "Mumbai"),
    ("Rotterdam", "Mumbai"),
    ("Mina Al Ahmadi", "Mumbai"),
]

print("Fixed Routes:\n")

for origin, dest in routes_to_fix:
    try:
        res = router.calculate_route([origin, dest], 12.0)
        # Convert to [lat, lon] for seed_data
        lat_lons = [[p[0], p[1]] for p in res.map_coordinates]
        print(f"# {origin} -> {dest}")
        print(f"waypoints = {lat_lons}")
        print("-" * 20)
    except Exception as e:
        print(f"Error for {origin} -> {dest}: {e}")
