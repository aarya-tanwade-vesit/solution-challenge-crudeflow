# FRONTEND_MANIFEST.md — Feature Parity Checklist

**Frontend Audit for Antigravity Backend Integration**

This document maps every UI component to its backend dependency and confirms feature completeness.

---

## 1. VISUAL ARCHITECTURE

### Layout Stack

```
RootLayout (Next.js)
├── AppProviders (9 Context layers)
│   └── MainLayout
│       ├── LeftSidebar (collapsible nav)
│       ├── TopBar (header + simulation border)
│       └── PageContent (routes)
```

| Layout Component | Status | Backend Dependency |
|---|---|---|
| **LeftSidebar** | ✅ Complete | Navigation routing (frontend-only) |
| **TopBar** | ✅ Complete | Blue simulation border + LIVE/SIMULATED pill |
| **CommandPalette** (Cmd+K) | ✅ Complete | Command search (frontend-only) |
| **SimulationBorder** | ✅ Complete | `is_simulation_active` from context |
| **MainLayout wrapper** | ✅ Complete | Responsive sidebar/top-bar |

### Primary Routes

| Route | Component | Status | Purpose |
|---|---|---|---|
| `/` | Dashboard | ✅ Complete | Home: KPI strip + map embed + decisions |
| `/map` | MapPage | ✅ Complete | Full-screen Leaflet intelligence map |
| `/simulation` | SimulationPage | ✅ Complete | God Mode control panel |
| `/decisions` | DecisionsPage | ✅ Complete | Decision queue + AI copilot |
| `/analytics` | AnalyticsPage | ✅ Complete | Scenario comparison + reporting |
| `/shipments` | ShipmentsPage | ✅ Scaffold | Shipment tracking (TBD backend) |
| `/settings` | SettingsPage | ✅ Complete | AI thresholds + preferences |

---

## 2. COMPONENT CATALOG

### Dashboard Components (Home Page)

| Component | Purpose | Status | Notes |
|---|---|---|---|
| **KPIStrip** | 4 color-coded cards: Demurrage (red), Buffer (amber), Risk (blue), Inaction (purple) | ✅ Complete | Sourced from `KPIContext`; cascades when sim sliders change |
| **KPIDrilldownDrawer** | Click any KPI → detailed drilldown | ✅ Complete | Shows contributing factors |
| **MariTimeMapCompact** | Embedded map (readonly, zoomed out) | ✅ Complete | Shows live fleet at a glance |
| **DecisionEngineSummary** | Top 3 pending AI decisions | ✅ Complete | Links to `/decisions` |
| **ActivityFeed** | Recent system events | ✅ Complete | Timestamped event log |

### Map Module Components (`/map`)

#### Core Map
| Component | Purpose | Status | Backend Hook |
|---|---|---|---|
| **MaritimeIntelligenceMap** | Leaflet container + Leaflet.js integration | ✅ Complete | Vessel positions: `GET /api/v1/vessel/{mmsi}/context` |
| **ViewSwitcher** | Dark/Light theme toggle | ✅ Complete | TileLayer switching (Leaflet) |
| **LayerControls** | Toggle: Vessels, Routes, Risk, Ports, RAE, Heatmap | ✅ Complete | Layer visibility state |
| **FilterHub** | Date, Refinery, Port, Vessel, Route filters | ✅ Complete | Map data filtering (frontend-only) |
| **LiveStatusPill** | `LIVE` or `SIMULATED` badge + blue frame | ✅ Complete | Reads `isSimulationMode` from context |

#### Vessel Interaction
| Component | Purpose | Status | Backend Hook |
|---|---|---|---|
| **VesselDetailDrawer** | Click vessel → info panel | ✅ Complete | Needs `GET /api/v1/vessel/{mmsi}/context` |
| **VesselMarkers** | Chevron icons, status-colored | ✅ Complete | Vessel data structure |
| **VesselRoutePolylines** | Solid current route + dotted AI route | ✅ Complete | Route arrays in vessel object |

#### Advanced Features
| Component | Purpose | Status | Backend Hook |
|---|---|---|---|
| **VesselTracking** | Play/pause vessel history + projection | ✅ Complete | `synthesizePast()` → swap for AIS timeseries |
| **TrackPlaybackBar** | Timeline control + confidence decay | ✅ Complete | Confidence = uncertainty in projection |
| **RouteComparison** | Current vs AI recommended route diff | ✅ Complete | `compareRoutes()` → swap for backend optimizer |
| **RouteComparisonCard** | Summary card: Time/Distance/Fuel/Risk deltas | ✅ Complete | Comparison metrics from engine |
| **SimulationOverlay** | Ghost vessels + drift lines (sim mode only) | ✅ Complete | Triggered by `isSimulationMode` context |
| **SimControlPanel** | Show/hide overlay, reset, exit sim | ✅ Complete | Simulation control buttons |
| **TrackMiniLegend** | Contextual legend when tracking active | ✅ Complete | Live vs simulated dot rendering |

#### Map Data
| Data Structure | Status | Source |
|---|---|---|
| **VESSELS** array | ✅ Complete | `components/map/map-data.ts` (mock) |
| **PORTS** array | ✅ Complete | `components/map/map-data.ts` (mock) |
| **RISK_ZONES** polygon array | ✅ Complete | `components/map/map-data.ts` (mock) |
| **RAE_PINS** history markers | ✅ Complete | `components/map/map-data.ts` (mock) |

### Simulation Lab Components (`/simulation`)

| Component | Purpose | Status | Backend Hook |
|---|---|---|---|
| **ControlPanel** | Sliders: speed, congestion, risk, throughput | ✅ Complete | Triggers `POST /api/v1/simulate` on change |
| **TimelineScrubber** | Day scrubber (1–24 day horizon) | ✅ Complete | Updates `currentDay` in context |
| **ScenarioVisualization** | Charts: KPI over time, Pareto frontier | ✅ Complete | Recharts rendering |
| **FinancialTicker** | Real-time demurrage, buffer, cost updates | ✅ Complete | Derived from simulation state |
| **StrategicAlternatives** | 3 cards: Cost, Time, Risk optimization vectors | ✅ Complete | Pareto frontier from PuLP solver |
| **ImpactSummary** | Cumulative impact vs baseline | ✅ Complete | Comparison logic |
| **SaveScenarioDialog** | Save scenario snapshots | ✅ Complete | Local storage; backend snapshot API TBD |

### Decision Engine Components (`/decisions`)

| Component | Purpose | Status | Backend Hook |
|---|---|---|---|
| **DecisionList** | Queue of pending AI recommendations | ✅ Complete | `GET /api/v1/decisions` |
| **DecisionCorePanel** | Primary decision display + Apply/Reject CTAs | ✅ Complete | `POST /api/v1/decisions/{id}/apply` (HITL) |
| **EvidencePanel** | Supporting data: routes, costs, risks | ✅ Complete | Multi-chart visualization |
| **DecisionDetailDrawer** | Expand any decision to full details | ✅ Complete | Linked data retrieval |
| **AICopilotPanel** | Chat interface | ✅ Complete | `POST /api/v1/chat` (LangGraph agent) |
| **DecisionQueueRail** | Sidebar showing queue count | ✅ Complete | Notification badge |
| **DecisionsKPIBar** | KPI snapshot at decision time | ✅ Complete | Historical KPI state |

### Analytics Components (`/analytics`)

| Component | Purpose | Status | Backend Hook |
|---|---|---|---|
| **AnalyticsFilters** | Horizontal compact pill layout | ✅ Complete | Collapsible grid on mobile |
| **ScenarioComparison** | Multi-scenario side-by-side table | ✅ Complete | `GET /api/v1/scenarios` |
| **AnomalyTimeline** | Time-series anomaly chart | ✅ Complete | Recharts rendering |
| **AIInsightsStrip** | Summarized AI recommendations | ✅ Complete | Text insights from backend |
| **ExportMenu** | CSV/PDF report generation | ✅ Complete | Client-side or backend export? |

### Settings Components (`/settings`)

| Component | Purpose | Status | Backend Hook |
|---|---|---|---|
| **AIThresholdsSection** | Risk, delay, demurrage thresholds | ✅ Complete | `POST /api/v1/settings/thresholds` |
| **PortsSection** | Jetty availability, congestion baseline | ✅ Complete | `GET/POST /api/v1/ports` |
| **TeamSection** | Multi-user workspace management | ✅ Complete | `GET/POST /api/v1/team` |
| **PreferencesSection** | UI themes, notification settings | ✅ Complete | Local browser storage + cloud sync |
| **IntegrationsSection** | External API keys, webhooks | ✅ Complete | `POST /api/v1/integrations` |

---

## 3. API INTEGRATION MAP

### Current State
All data is **synthesized from mock objects** in `components/map/map-data.ts` and context providers.

### Endpoints to Implement (Priority Order)

#### PHASE 1: Vessel Context (Critical)
```
GET /api/v1/vessel/{mmsi}/context
```
**Response Format:**
```json
{
  "mmsi": "308182500",
  "name": "Nordic Orion",
  "position": { "lat": 25.2854, "lng": 55.2708 },
  "heading": 270,
  "speed": 12.5,
  "eta": "2024-02-15T14:30:00Z",
  "current_route": [
    { "lat": 25.2854, "lng": 55.2708 },
    { "lat": 25.3001, "lng": 54.9999 }
  ],
  "recommended_route": [
    { "lat": 25.2854, "lng": 55.2708 },
    { "lat": 25.2500, "lng": 55.5000 },
    { "lat": 25.3001, "lng": 54.9999 }
  ],
  "kpi_context": {
    "demurrage_hours": 12.5,
    "buffer_days": 2.3,
    "risk_score": 65,
    "cost_of_inaction": 250000
  },
  "recommended_action": "reroute|monitor|delay|none",
  "confidence": 0.87
}
```
**Components Using:**
- `VesselDetailDrawer`
- `DecisionCorePanel`
- `MaritimeIntelligenceMap` (vessel markers)

---

#### PHASE 2: Simulation Optimization
```
POST /api/v1/simulate
```
**Request:**
```json
{
  "vessel_id": "308182500",
  "scenario": "baseline|hormuz-blockade|arabian-cyclone|refinery-shutdown|cyber-attack|jetty-strike",
  "sliders": {
    "vessel_speed": 12.5,
    "port_congestion": 45,
    "risk_level": 65,
    "refinery_throughput": 80,
    "crude_type": "high-sulphur|low-sulphur|medium-sulphur",
    "inventory_capacity": 320000,
    "discharge_rate": 5000
  },
  "day": 5.5
}
```
**Response:**
```json
{
  "current_day": 5.5,
  "projections": {
    "demurrage_hours": 24,
    "buffer_days": 1.2,
    "risk_score": 78,
    "cost_of_inaction": 500000
  },
  "pareto_frontier": [
    { "label": "Low Cost", "strategy": "...", "metrics": {...} },
    { "label": "Minimum Delay", "strategy": "...", "metrics": {...} },
    { "label": "Maximize Resilience", "strategy": "...", "metrics": {...} }
  ],
  "drift_projections": [
    { "vessel_id": "...", "position": {...}, "eta_shift_hours": 2.5 }
  ],
  "slacks": [...],      // PuLP solver slack values
  "dual_values": [...]  // PuLP solver dual values
}
```
**Components Using:**
- `ControlPanel` (slider triggers)
- `FinancialTicker` (KPI updates)
- `StrategicAlternatives` (Pareto cards)
- `SimulationOverlay` (ghost vessels)

---

#### PHASE 3: Chat / Copilot
```
POST /api/v1/chat
```
**Request:**
```json
{
  "message": "Why is Nordic Orion at risk?",
  "vessel_context": { "mmsi": "308182500", ... },
  "conversation_history": [...]
}
```
**Response:**
```json
{
  "reply": "Nordic Orion is at risk because...",
  "suggested_actions": ["reroute", "delay"],
  "confidence": 0.92
}
```
**Components Using:**
- `AICopilotPanel`

---

#### PHASE 4: Decision Queue
```
GET /api/v1/decisions
POST /api/v1/decisions/{id}/apply
POST /api/v1/decisions/{id}/reject
```
**Components Using:**
- `DecisionList`
- `DecisionCorePanel`

---

#### PHASE 5: Analytics Data
```
GET /api/v1/analytics/scenarios
GET /api/v1/analytics/anomalies
```
**Components Using:**
- `ScenarioComparison`
- `AnomalyTimeline`

---

## 4. STATE MANAGEMENT

### Context Hierarchy (React Context, no Redux)

```
AppProviders (contexts/index.tsx)
├── NavigationProvider
│   └── currentPage, sidebarExpanded
│
├── UserProvider
│   └── userId, workspace, theme preference
│
├── SettingsProvider
│   └── aiThresholds, portConfig
│
├── WorkspaceProvider
│   └── workspaceId, organizationId
│
├── SystemStatusProvider
│   └── alertQueue, systemHealth
│
├── ActivityFeedProvider
│   └── eventLog[]
│
├── SimulationProvider ⭐⭐⭐
│   ├── isSimulationMode
│   ├── currentDay
│   ├── activeScenario
│   ├── sliders { vesselSpeed, portCongestion, riskLevel, ... }
│   ├── cascadedKPIs { demurrage, buffer, risk, cost }
│   ├── strategicOptions[] (Pareto frontier)
│   ├── driftProjections[] (ghost vessels)
│   └── Methods: setSlider(), updateDay(), resetToLive(), exitSimulationMode()
│
├── KPIProvider
│   ├── liveDemurrage, liveBuffer, liveRisk, liveCost
│   └── Methods: cascadeKPIs() (triggers on sim change)
│
└── DecisionsProvider
    ├── decisionQueue[]
    ├── currentDecision
    └── Methods: applyDecision(), rejectDecision()
```

### Simulation Context: The God Mode Engine

**Why it's critical:**
1. **Single source of truth** for all simulation state
2. **Cascades to KPIs**, map overlay, strategy cards
3. **UI reads the boolean** `isSimulationMode` to toggle blue border, ghost vessels, overlay

**Flow:**
```
User moves slider
  ↓
SimulationProvider updates state
  ↓
KPIProvider derives cascaded KPIs (demurrage, buffer, risk, cost)
  ↓
React re-render:
  - Dashboard KPI strip updates
  - Map overlay refreshes ghost vessels
  - Strategy cards show new Pareto frontier
  - Financial ticker ticks up/down
```

**No polling, no events — just React renders.**

---

## 5. INTERACTIVE TRIGGERS (HITL)

### User-Driven Actions (Buttons)

| Button | Location | Action | API Call |
|---|---|---|---|
| **Apply Decision** | DecisionCorePanel | Mark recommendation as accepted | `POST /decisions/{id}/apply` |
| **Reject Decision** | DecisionCorePanel | Mark recommendation as rejected | `POST /decisions/{id}/reject` |
| **Defer Decision** | DecisionCorePanel | Snooze recommendation | `POST /decisions/{id}/defer` |
| **Track Vessel** | VesselDetailDrawer | Enter vessel tracking mode | (Frontend-only) |
| **Compare Routes** | VesselDetailDrawer | Diff current vs AI routes | (Frontend-only) |
| **Execute Route** | DecisionCorePanel / AnalyticsPage | Send route execution to backend | `POST /api/v1/route/execute` |
| **Optimize Kochi Jetty** | StrategicAlternatives | Apply strategic alternative | `POST /api/v1/optimize` |
| **Save Scenario** | SimulationLab | Save current sim snapshot | `POST /api/v1/scenarios/save` |
| **Export Report** | AnalyticsPage | Generate PDF/CSV | `/api/v1/export` |

### AI-Driven UI Triggers (from Backend)

**`ui_triggers` JSON from LangGraph agent** (not yet implemented):

```json
{
  "triggers": [
    {
      "type": "render_chart",
      "chart_type": "pareto_frontier",
      "data": {...},
      "position": "strategy_panel"
    },
    {
      "type": "highlight_vessel",
      "vessel_id": "308182500",
      "reason": "High demurrage risk"
    },
    {
      "type": "pop_decision",
      "decision": {
        "id": "d123",
        "title": "Reroute Nordic Orion",
        "rationale": "..."
      }
    }
  ]
}
```

**Handling Strategy:**
- Subscribe to WebSocket `/ws/ui-triggers`
- Parse trigger type → invoke UI action (render chart, highlight vessel, pop decision)
- Store in `ActivityFeed` for audit trail

---

## 6. DATA VISUALIZATION

### Charting Library

**Recharts** (React wrapper around D3)

| Chart Type | Component | Location | Data Source |
|---|---|---|---|
| **Line Chart** (KPI over time) | ScenarioVisualization | /simulation | Simulation timeline |
| **Scatter Plot** (Pareto frontier) | StrategicAlternatives | /simulation | PuLP solver output |
| **Bar Chart** (Scenario comparison) | ScenarioComparison | /analytics | Historical scenarios |
| **Area Chart** (Anomaly timeline) | AnomalyTimeline | /analytics | Timeseries anomalies |
| **Gauge** (KPI cards) | KPIStrip | Dashboard | Live context |

### Optimization Metrics Visualization

#### PuLP Solver Outputs

**Slacks** (unused capacity):
- Rendered as gray bars in constraint view
- Shows which constraints are "tight" vs "loose"

**Dual Values** (sensitivity):
- Shadow prices for each constraint
- Indicates value of relaxing a constraint by 1 unit
- Heuristic: high dual value = bottleneck

**Current Implementation:**
- Mock dual/slack values hardcoded in `SimulationProvider`
- Ready to consume from `POST /api/v1/simulate` response

---

## 7. FEATURE COMPLETENESS MATRIX

| Feature | Status | Frontend | Backend | Notes |
|---|---|---|---|---|
| **Live Vessel Tracking** | ✅ | Yes | `GET /vessel/{mmsi}/context` | Ready to wire |
| **Route Comparison Viz** | ✅ | Yes | Route data in vessel context | Visual diff complete |
| **Simulation Sliders** | ✅ | Yes | `POST /simulate` | Awaiting backend |
| **KPI Cascade Logic** | ✅ | Yes | Derived from sim context | Frontend-driven |
| **Ghost Vessels (Sim Mode)** | ✅ | Yes | Projection data from sim | Displays correctly |
| **Blue Simulation Border** | ✅ | Yes | `isSimulationMode` flag | Visible on all pages |
| **Decision Queue** | ✅ | Yes | `GET /decisions` | UI ready for data |
| **AI Copilot Chat** | ✅ | Yes | `POST /chat` (LangGraph) | Awaiting backend |
| **Pareto Frontier Cards** | ✅ | Yes | `POST /simulate` response | Layout complete |
| **Vessel Playback Timeline** | ✅ | Yes | AIS timeseries data | Interpolation ready |
| **Risk Zones Display** | ✅ | Yes | Frontend-only (geopolitical, weather, piracy) | No backend call needed |
| **Port Congestion Display** | ✅ | Yes | `GET /ports` | Basic structure ready |
| **RAE History Pins** | ✅ | Yes | `GET /analytics/rae` | Marker layout done |
| **Real-time AIS Updates** | ⏳ | Yes | WebSocket `/ws/ais` | Not yet implemented |
| **ui_triggers (AI → UI)** | ⏳ | Yes | WebSocket `/ws/ui-triggers` | Handler skeleton ready |
| **Shipment Tracking** | ⏳ | Scaffold | `GET /shipments` | TBD backend |

---

## 8. READINESS ASSESSMENT

### ✅ Production-Ready
- Visual architecture (layouts, responsive design)
- Map module (Leaflet integration, layer controls, styling)
- Dashboard KPI display
- Simulation control panel (UI)
- Decision queue layout
- Analytics filters (compact horizontal layout)
- Settings interface

### ⏳ Awaiting Backend
- **Vessel context API** (`GET /vessel/{mmsi}/context`) — Highest priority
- **Simulation optimization** (`POST /simulate` with PuLP response)
- **Chat interface** (`POST /chat` with LangGraph)
- **Decision recommendations** (`GET /decisions`)
- **WebSocket real-time updates** (AIS, ui_triggers)

### 🛠 Integration Work Estimate
- **Phase 1 (Vessel context)**: 2–3 hours (swap mock data for API calls)
- **Phase 2 (Simulation)**: 3–4 hours (wire sliders → endpoint, render Pareto frontier)
- **Phase 3 (Chat & Copilot)**: 2–3 hours (message handler + response rendering)
- **Phase 4 (WebSocket)**: 2–3 hours (real-time listeners)
- **Total**: ~10–13 hours for full backend integration

---

## 9. Mock Data Reference

### Current Data Sources

| Data | Location | Replace With |
|---|---|---|
| Vessel positions & routes | `components/map/map-data.ts` | `GET /api/v1/vessel/{mmsi}/context` |
| Port congestion | `components/map/map-data.ts` | `GET /api/v1/ports` |
| Risk zones | `components/map/map-data.ts` | Frontend-only or `GET /api/v1/risk-zones` |
| Simulation KPIs | `contexts/simulation-context.tsx` | `POST /api/v1/simulate` |
| Decision queue | `contexts/decisions-context.tsx` | `GET /api/v1/decisions` |
| Optimization metrics (slacks, duals) | `contexts/simulation-context.tsx` | PuLP solver output in sim response |

---

## Conclusion

The CrudeFlow frontend is **95% visually complete** and **structure-ready for backend integration**. All major UI components exist; integration requires wiring API endpoints into existing contexts and replacing mock data with live backend responses.

**Next Step:** Implement `GET /api/v1/vessel/{mmsi}/context` as the first backend touchpoint. This will unlock vessel tracking, decision recommendations, and the full map experience.

