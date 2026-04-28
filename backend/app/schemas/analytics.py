from typing import Any, Dict, Optional

from pydantic import BaseModel


class AnalyticsExportRequest(BaseModel):
    format: str = "pdf"
    activeTab: str = "financial"
    timeRange: str = "7d"
    filters: Dict[str, Any] = {}

