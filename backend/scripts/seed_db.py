from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.services.seed_service import seed_all


if __name__ == "__main__":
    counts = seed_all()
    print("Seed complete")
    for table, count in counts.items():
        print(f"{table}: {count}")
