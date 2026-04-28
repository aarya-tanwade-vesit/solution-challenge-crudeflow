from __future__ import annotations

from typing import Any

from app.optimization.optimizer_service import optimize


class OptimizationEngine:
    def optimize(self, payload: dict[str, Any] | None = None) -> dict[str, Any]:
        return optimize(payload)

