import searoute as sr
import json

def test_searoute():
    try:
        origin = [50.1575, 26.6441]  # Ras Tanura
        destination = [76.2393, 9.9687]  # Kochi
        
        print(f"Origin: {origin}")
        print(f"Destination: {destination}")
        
        route = sr.searoute(origin, destination, units="naut")
        print("Success!")
        print(f"Distance: {route.properties['length']} {route.properties['units']}")
        # print(json.dumps(route, indent=2))
    except Exception as e:
        print(f"Failed: {e}")

if __name__ == "__main__":
    test_searoute()
