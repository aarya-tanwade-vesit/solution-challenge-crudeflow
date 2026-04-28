import json
import urllib.error
import urllib.request
from datetime import UTC, datetime
from typing import Any

from app.core.config import settings
from app.services import activity_service, dashboard_service, decision_service, fleet_service, simulation_service, system_service


def _safe(obj: Any, max_chars: int = 20000) -> str:
    text = json.dumps(obj, ensure_ascii=True, default=str)
    return text[:max_chars]


def _build_app_context(decision_id: str | None) -> dict[str, Any]:
    decision = None
    decision_source = "mockFallback"
    if decision_id:
        decision, decision_source = decision_service.get_decision(decision_id)

    kpis, kpi_source = dashboard_service.kpis()
    summary, summary_source = dashboard_service.summary()
    fleet_summary, fleet_summary_source = fleet_service.summary()
    fleet_vessels, fleet_vessels_source = fleet_service.vessels(status=None, ownership=None, q=None)
    system_status, system_source = system_service.status()
    activity, activity_source = activity_service.list_activity()
    decisions, decisions_source = decision_service.list_decisions(status="all")
    scenarios, scenarios_source = simulation_service.scenarios()

    return {
        "decision": decision,
        "kpis": kpis,
        "dashboardSummary": summary,
        "fleetSummary": fleet_summary,
        "fleet": fleet_vessels,
        "systemStatus": system_status,
        "activity": activity,
        "decisions": decisions,
        "simulationScenarios": scenarios,
        "sources": {
            "decision": decision_source,
            "kpis": kpi_source,
            "dashboardSummary": summary_source,
            "fleetSummary": fleet_summary_source,
            "fleet": fleet_vessels_source,
            "systemStatus": system_source,
            "activity": activity_source,
            "decisions": decisions_source,
            "simulationScenarios": scenarios_source,
        },
    }


def _fallback_structured(message: str, app_ctx: dict[str, Any]) -> tuple[dict[str, Any], str]:
    decision = app_ctx.get("decision")
    if decision:
        top_factor = (decision.get("reasoningFactors") or [{}])[0].get("factor", "risk-adjusted impact")
        answer = f"{decision.get('recommendation', 'Proceed with the recommended route.')} (confidence {decision.get('confidence', 78)}%)."
        reason = f"Dominant factor: {top_factor}. Decision: {decision.get('title', 'N/A')}."
        impact = (
            f"Cost {decision.get('costImpact', 0):,} USD; delay {decision.get('delayHoursImpact', 0)}h; "
            f"risk delta {decision.get('riskDelta', 0)}."
        )
        confidence = int(decision.get("confidence", 78))
    else:
        answer = "No single decision selected. I analyzed live dashboard, fleet, risk, and simulation context."
        reason = "Route, risk, congestion, and buffer trends were combined from app-wide data."
        impact = "Use /decisions selection for vessel-specific recommendation and quantified impact."
        confidence = 78

    return {
        "message": answer,
        "structured": {
            "answer": answer,
            "reason": reason,
            "impact": impact,
            "nextActions": [
                "Approve/reject the top decision in Decision Engine",
                "Inspect map route overlays and affected vessels",
                "Run Simulation Lab what-if before final commitment",
            ],
            "usedData": ["kpis", "fleet", "decisions", "systemStatus", "activity", "simulationScenarios"],
        },
        "citations": (decision or {}).get("evidence", [])[:3] if decision else [],
        "confidence": confidence,
        "rawModel": "fallback",
        "debugPromptEcho": message[:400],
        "asOf": datetime.now(UTC).isoformat(),
    }, "mockFallback"


def _ask_gemma_structured(message: str, app_ctx: dict[str, Any]) -> tuple[dict[str, Any], str] | None:
    if not settings.gemma4_api_key:
        return None

    prompt = (
        "You are NEMO Copilot for maritime crude logistics. "
        "You MUST answer ONLY as minified JSON with keys: "
        "answer (string), reason (string), impact (string), nextActions (string[]), usedData (string[]), confidence (number 0-100). "
        "No markdown, no prose outside JSON.\n"
        f"User question: {message}\n"
        f"Decision context: {_safe(app_ctx.get('decision'))}\n"
        f"App data snapshot: {_safe({k: app_ctx[k] for k in ['kpis','dashboardSummary','fleetSummary','fleet','systemStatus','activity','decisions','simulationScenarios']})}"
    )

    body = {
        "model": settings.gemma4_model,
        "temperature": 0.2,
        "messages": [
            {"role": "system", "content": "Return strict JSON only."},
            {"role": "user", "content": prompt},
        ],
    }
    req = urllib.request.Request(
        settings.gemma4_api_url,
        data=json.dumps(body).encode("utf-8"),
        method="POST",
        headers={
            "Authorization": f"Bearer {settings.gemma4_api_key}",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=settings.gemma4_timeout_seconds) as resp:
            payload = json.loads(resp.read().decode("utf-8"))
        content = payload["choices"][0]["message"]["content"]
        parsed = json.loads(content)
        structured = {
            "answer": str(parsed.get("answer", "")),
            "reason": str(parsed.get("reason", "")),
            "impact": str(parsed.get("impact", "")),
            "nextActions": [str(x) for x in (parsed.get("nextActions") or [])][:6],
            "usedData": [str(x) for x in (parsed.get("usedData") or [])][:20],
        }
        confidence = int(parsed.get("confidence", 75))
        confidence = max(0, min(100, confidence))
        return {
            "message": structured["answer"],
            "structured": structured,
            "citations": (app_ctx.get("decision") or {}).get("evidence", [])[:3] if app_ctx.get("decision") else [],
            "confidence": confidence,
            "rawModel": settings.gemma4_model,
            "asOf": datetime.now(UTC).isoformat(),
        }, "gemma4"
    except (urllib.error.URLError, urllib.error.HTTPError, json.JSONDecodeError, KeyError, ValueError):
        return None


def answer_query(message: str, decision_id: str | None = None, context: dict[str, Any] | None = None) -> tuple[dict[str, Any], str]:
    app_ctx = _build_app_context(decision_id)
    gemma_response = _ask_gemma_structured(message, app_ctx)
    data, source = gemma_response or _fallback_structured(message, app_ctx)
    return {
        "conversationId": (context or {}).get("conversationId") or f"conv-{int(datetime.now(UTC).timestamp())}",
        **data,
    }, source

