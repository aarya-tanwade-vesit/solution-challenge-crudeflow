from __future__ import annotations

from decimal import Decimal


PORTS: dict[str, tuple[float, float]] = {
    "Ras Tanura": (50.1575, 26.6441),
    "Ras Tanura Anchorage": (50.55, 26.48),
    "Basrah": (48.8167, 29.6833),
    "Fujairah": (56.3667, 25.1167),
    "Fujairah Staging": (56.55, 25.08),
    "Fujairah Holding": (56.7, 25.25),
    "Strait of Hormuz": (56.35, 26.55),
    "Gulf of Oman": (58.75, 24.55),
    "Arabian Sea": (64.0, 18.0),
    "Lakshadweep Holding": (72.0, 11.5),
    "Kochi": (76.2383, 9.9675),
    "Kochi Outer Anchorage": (76.05, 9.75),
    "Mumbai": (72.8386, 18.9556),
    "Jamnagar": (69.72, 22.47),
    "Sikka": (69.8062, 22.4236),
    "Chennai": (80.2707, 13.0827),
    "Abu Dhabi": (54.6071, 24.4748),
    "Singapore": (103.8403, 1.2644),
    "Rotterdam": (4.0508, 51.9550),
    "Mina Al Ahmadi": (48.1800, 29.0500),
}

PORT_ALIASES: dict[str, str] = {
    "Kochi SPM": "Kochi",
    "Kochi, IN": "Kochi",
    "Ras Tanura, SA": "Ras Tanura",
    "Mumbai BPCL": "Mumbai",
    "Mumbai, IN": "Mumbai",
    "Mumbai Port (JNPT)": "Mumbai",
    "Basrah Oil Terminal": "Basrah",
}

FUEL_CONSUMPTION_MT_PER_DAY: dict[str, Decimal] = {
    "VLCC": Decimal("92"),
    "Suezmax": Decimal("60"),
    "Aframax": Decimal("42"),
    "Panamax": Decimal("36"),
    "default": Decimal("55"),
}

DAILY_HIRE_RATE_USD: dict[str, Decimal] = {
    "VLCC": Decimal("48000"),
    "Suezmax": Decimal("38000"),
    "Aframax": Decimal("26000"),
    "Panamax": Decimal("22000"),
    "default": Decimal("35000"),
}

DEMURRAGE_RATE_USD_PER_DAY: dict[str, Decimal] = {
    "VLCC": Decimal("55000"),
    "Suezmax": Decimal("42000"),
    "Aframax": Decimal("30000"),
    "Panamax": Decimal("26000"),
    "default": Decimal("40000"),
}

CRUDE_VALUE_USD_PER_BBL = Decimal("84")
DEFAULT_FUEL_PRICE_USD_PER_MT = Decimal("620")
REFINERY_DAILY_CONSUMPTION_BBL = Decimal("630000")

CHOKEPOINTS: dict[str, dict[str, float | str]] = {
    "ormuz": {
        "display": "Strait of Hormuz",
        "geopolitical_delta": 32,
        "insurance_premium_pct": 2.8,
        "risk_multiplier": 3.4,
    },
    "babalmandab": {
        "display": "Bab-el-Mandeb",
        "geopolitical_delta": 26,
        "insurance_premium_pct": 2.1,
        "risk_multiplier": 2.8,
    },
    "suez": {
        "display": "Suez Canal",
        "geopolitical_delta": 12,
        "insurance_premium_pct": 0.6,
        "risk_multiplier": 1.2,
    },
    "gibraltar": {
        "display": "Gibraltar",
        "geopolitical_delta": 6,
        "insurance_premium_pct": 0.3,
        "risk_multiplier": 1.1,
    },
    "malacca": {
        "display": "Malacca Strait",
        "geopolitical_delta": 8,
        "insurance_premium_pct": 0.4,
        "risk_multiplier": 1.1,
    },
    "gulf_of_aden": {
        "display": "Gulf of Aden",
        "geopolitical_delta": 20,
        "insurance_premium_pct": 1.6,
        "risk_multiplier": 2.2,
    },
}

RISK_WEIGHTS: dict[str, float] = {
    "geopolitical": 0.35,
    "weather": 0.20,
    "congestion": 0.22,
    "insurance": 0.14,
    "chokepoint": 0.09,
}

SCORING_WEIGHTS: dict[str, float] = {
    "cost": 0.22,
    "risk": 0.30,
    "delay": 0.18,
    "buffer": 0.20,
    "congestion": 0.10,
}

OPTION_LABELS: dict[str, str] = {
    "A": "Normal Route",
    "B": "Wait / Hold",
    "C": "Fujairah Staging",
    "D": "Emergency Logistics",
}

INTERVENTION_COSTS: dict[str, Decimal] = {
    "throughput_reduction": Decimal("42000"),
    "emergency_inventory_fixed": Decimal("120000"),
    "emergency_inventory_per_bbl": Decimal("2.80"),
    "rail_truck_fixed": Decimal("185000"),
    "rail_truck_per_bbl": Decimal("4.20"),
    "alternate_port_fixed": Decimal("95000"),
    "cargo_split_fixed": Decimal("280000"),
    "cargo_split_per_bbl": Decimal("1.60"),
    "weather_wait_per_day": Decimal("35000"),
}

