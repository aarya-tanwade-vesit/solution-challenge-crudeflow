"""
NEMO CrudeFlow — Module 2 Example Runner
==========================================
Standalone script to test and demonstrate the optimization engine.
"""

from __future__ import annotations

import json
from app.optimization import comparison_engine, schemas


def run_demo():
    print("--- NEMO CrudeFlow Module 2 Demo ---")
    
    # 1. Setup request
    request = schemas.CompareRequest()
    print(f"Analyzing route: {request.route.origin} -> {request.route.destination}")
    print(f"Vessel: {request.vessel.vesselName} ({request.vessel.vesselType})")
    
    # 2. Run comparison
    result = comparison_engine.compare_options(request)
    
    print(f"\nRecommended Strategy: {result.recommendedLabel}")
    print(f"Summary: {result.summary}")
    
    print("\nComparison Table:")
    print(f"{'Option':<10} | {'Score':<10} | {'Cost (USD)':<12} | {'Risk (%)':<10} | {'Buffer (d)':<10}")
    print("-" * 65)
    for row in result.comparisonTable:
        print(f"{row['label']:<10} | {row['score']:<10.1f} | {row['cost']:<12,} | {row['risk']:<10.1f} | {row['buffer']:<10.1f}")

    print("\nFull breakdown for recommended option:")
    best = result.rankedOptions[0]
    print(json.dumps(best.model_dump(), indent=2))


if __name__ == "__main__":
    run_demo()
