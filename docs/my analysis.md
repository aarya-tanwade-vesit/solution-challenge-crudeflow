# NEMO CRUDEFLOW BACKEND DATA BLUEPRINT (PAGES 1 TO 3)
Purpose: Define EXACT backend data needs, logic, formulas, APIs, and behavior for current frontend pages.

---

# GLOBAL PRINCIPLES

- All APIs should return realistic, dynamic mock data first.
- Every metric must have:
  - current_value
  - previous_value
  - trend
  - confidence
  - explanation
  - updated_at

- Risk levels:
  - NORMAL
  - WARNING
  - CRITICAL

- Confidence score:
  0 to 100%

- Refresh cadence:
  - Dashboard KPIs: every 15s
  - Map fleet positions: every 5s
  - Decisions: on demand / when triggered

---

# PAGE 1: DASHBOARD

# SECTION 1: SYSTEM STATUS BADGE

## Output:
NORMAL / WARNING / CRITICAL

## Calculated from weighted signals:

1. Geopolitical Tension
   Source:
   - news sentiment
   - sanctions
   - regional conflict escalation

2. Weather Risk
   Source:
   - cyclone alerts
   - wave height
   - wind speed

3. Port Congestion
   Source:
   - queue count
   - avg wait time
   - berth occupancy

4. Insurance / Cost Shock
   Source:
   - premium increase %
   - route surcharge
   - war-risk surcharge

## Formula Example:

system_score =
0.35 geopolitics +
0.25 weather +
0.25 congestion +
0.15 insurance

0-39 = NORMAL  
40-69 = WARNING  
70+ = CRITICAL

---

# SECTION 2: AFFECTED ROUTES

## Need predefined major routes

Use enterprise naming format:

ROUTE_CODE | NAME

R001 | Mumbai → Middle East  
R002 | Mumbai → Rotterdam  
R003 | Jamnagar → Singapore  
R004 | Saudi East Coast → India West Coast  
R005 | UAE → Europe via Suez  
R006 | Kuwait → India  
R007 | Ras Tanura → China  
R008 | India West Coast → Africa East Coast

## Fields:

- route_code
- route_name
- disruption_reason
- delay_hours
- risk_score
- impacted_vessels
- status

---

# SECTION 3: IMPACT TRAJECTORY

## Show time trend chart

Metrics:

1. Avg Delay (hours)
2. Production Risk (%)

## Logic:

Production Risk based on:

buffer_days_remaining  
incoming_shipments_delay  
refinery_dependency_ratio

---

# SECTION 4: KPI GRID

## KPI 1: Demurrage Forecast

Formula:

delay_hours × vessel_rate × congestion_factor

Inputs:

- vessel type
- vessel daily charter rate
- waiting queue
- port congestion

Output:

- $ forecast
- vessel breakdown
- short explanation

---

## KPI 2: Buffer Days Remaining

Formula:

(current_inventory_bbl + confirmed_incoming_bbl - committed_usage_bbl)
/ daily_consumption_bbl

Output:

- days left
- risk label:
  - Healthy
  - Tight
  - Critical

---

## KPI 3: Maritime Risk Score

Weighted combined score.

Inputs:

- geopolitical
- weather
- congestion
- insurance cost

User can change weights.

Each factor includes:

- score
- confidence

Output:

overall weighted score

---

# SECTION 5: DECISION ENGINE CARD (Dashboard Preview)

Fields:

- status: Critical / High / Medium
- action_title
- reason
- delay_impact
- cost_impact
- risk_impact

Buttons:

- Approve
- Review → opens full Decision Engine page

---

# PAGE 2: MAPS PAGE

# SECTION 1: MOCK VESSEL FLEET

Per vessel fields:

- vessel_id
- vessel_name
- vessel_type
- current_route
- origin
- destination
- latitude
- longitude
- speed_knots
- heading
- eta_utc
- eta_ist
- risk_score
- delay_probability
- cargo_type
- cargo_volume
- status

## On Click Tracking Mode:

Values update live:

- position
- ETA
- risk score
- delay probability
- nearby risks
- route progress %

---

# SECTION 2: RISK ZONES

## Static Zones:

- Strait of Hormuz
- Suez Canal
- Gulf of Aden
- Bab-el-Mandeb
- Red Sea Corridor
- Panama Canal

## Dynamic Zones:

- Arabian Sea Cyclone
- Port Strike Zone
- Naval Conflict Zone
- Weather Disturbance Cell

Fields:

- zone_name
- severity
- radius
- reason
- confidence
- expiry_time

---

# SECTION 3: PORTS

Fields:

- port_name
- vessels_waiting
- avg_wait_hours
- jetty_occupancy %
- congestion %
- weather_status
- strike_risk

Examples:

- Mumbai Port
- Fujairah
- Rotterdam
- Singapore
- Jamnagar Terminal

---

# SECTION 4: HISTORICAL MATCHES

Purpose:
Find similar past disruptions.

Fields:

- date
- title
- summary
- similarity %
- actual delay caused
- demurrage impact
- congestion impact

Examples:

- Suez blockage 2021
- Hormuz tensions 2019
- Cyclone Tauktae
- Red Sea attacks

## This affects:

- delay forecast
- demurrage
- confidence score
- congestion model

---

# PAGE 3: DECISION ENGINE PAGE

# SECTION 1: RECOMMENDED ACTIONS

---

## ACTION TYPE A: REROUTE

Fields:

- action_id
- vessel
- current_route
- recommended_route
- reason
- confidence

## Impact Summary:

- delay change
- cost delta
- risk delta
- buffer day impact

## Current vs Recommended:

Current:
- ETA
- Cost
- Risk

Recommended:
- ETA
- Cost
- Risk

## Alternatives Rejected:

short list of rejected routes

Buttons:

- Reject (capture reason)
- Simulate (opens map with blue dotted route)
- Approve (store logs + create alert)

---

## ACTION TYPE B: SCHEDULE ACTION

Examples:

- Reduce speed until berth opens
- Hold offshore 6 hrs
- Advance refinery unloading slot
- Split cargo dispatch

XAI factors change:

- port congestion
- fuel cost
- demurrage

---

# SECTION 2: XAI PANEL

## Contributing Factors

- Geopolitical risk
- Insurance surge
- Buffer days low
- Fuel cost
- Weather
- Port congestion

## Confidence Breakdown

- Risk signal confidence
- Delay forecast confidence
- Cost estimate confidence
- Buffer prediction confidence

---

# SECTION 3: TRADEOFF PANEL

- Cost vs Delay
- Risk vs Buffer
- ESG vs CO2
- Speed vs Fuel

---

# SECTION 4: EVIDENCE PANEL

Sources:

- news
- weather feed
- internal ops data
- market data
- historical matches

Each with:

- source
- timestamp
- confidence
- short note

---

# SECTION 5: WHY NOT (REJECTED OPTIONS)

For each rejected recommendation:

- action
- +delay
- +cost
- +risk
- rejected reason

---

# SECTION 6: NEMO COPILOT

Context aware chatbot for selected decision.

Questions:

- Why reroute?
- Why not cheaper route?
- What if delay increases 2 days?
- What if port clears?
- Show evidence
- Explain confidence

Use current decision data only for now.

---

# API SUGGESTION

GET /api/dashboard/summary  
GET /api/dashboard/kpis  
GET /api/dashboard/routes  
GET /api/map/fleet  
GET /api/map/ports  
GET /api/map/risk-zones  
GET /api/map/history  
GET /api/decisions/recommendations  
POST /api/decisions/approve  
POST /api/decisions/reject  
POST /api/copilot/query

---

# MOST IMPORTANT FOR DEMO

Everything must LOOK live:
- timestamps updating
- values fluctuating slightly
- vessels moving
- alerts changing
- confidence shifting
- route risks changing

Even mock data should feel like a living ocean.

---

## IV] SIMULATION PAGE (continued)

### Purpose
Stress-test maritime supply chain decisions before execution. A digital twin where users change variables, run crisis scenarios, compare strategies, and see downstream business impact instantly.

---

# 1. TOP CONTROL BAR

### Core Controls
- **AI Presets** (visible for demo)
  - Worst Case
  - Cost Shock
  - Port Crisis
  - Inventory Stress
  - Weather Disruption

> For demo: only actively use **Hormuz Blockade** preset.

### Action Buttons
- **Run Simulation**
- **Reset**
- **Exit**
- **Save Scenario**

### Save Scenario Modal
Fields:
- Scenario Name
- Short Description
- Tags (risk / inventory / routing / congestion)

---

# 2. LIVE SIMULATION METRICS (KPI STRIP)

All shown as:

**Current Value vs Simulated Value vs Delta**

### Metrics
1. Buffer Days Remaining  
2. Demurrage Cost  
3. Revenue at Risk  
4. Maritime Risk Score  
5. ETA Reliability %  
6. Fleet Delay Hours  
7. Refinery Throughput Impact  
8. Emergency Logistics Cost

---

# 3. SIMULATION CONTROLS PANEL

## Scope Selector
- Apply to Entire Fleet
- Apply to Specific Vessel

If specific:
Dropdown:
- MT Rajput
- MT Horizon
- MT Neptune
- MT Bharat
etc.

---

## Predefined Scenarios

### Active Demo Scenario
- Hormuz Blockade

### Additional Options
- Arabian Cyclone
- Refinery Shutdown
- Port Strike
- Canal Congestion
- Insurance Surge
- Multi-event Cascade

---

## Vessel Scoped Variables

### Sliders
- Vessel Speed (knots)
- Discharge Rate (MT/hr or bbl/hr)
- Fuel Burn Priority
- Safety Margin
- Charter Priority

---

## Network Wide Variables

### Sliders
- Port Congestion %
- Geopolitical Risk
- Refinery Throughput %
- Inventory Ullage %
- Insurance Cost Multiplier
- Fuel Price
- Available Berths %

> Existing slider bugs should be fixed.

---

## Port + Cargo Controls

### Toggles / Inputs
- Jetty at Kochi: Available / Shutdown
- Mumbai Berth 2: Open / Closed
- Singapore Terminal Delay
- Cargo Priority Mode
- Emergency Rail Allocation

---

# 4. FLEET STATE TABLE (LIVE DURING SIMULATION)

Each row:

| Vessel | Type | Cargo | Route Progress | Status | Delay | Demurrage |
|---|---|---|---|---|---|---|

### Example Rows

**MT Rajput**  
VLCC | Arab Light  
Progress Bar: 64%  
Status: Transit  
Delay: +18 hrs  
Demurrage: $36k/day

**MT Horizon**  
Aframax | Basrah Medium  
Progress: 22%  
Status: Waiting  
Delay: +31 hrs  
Demurrage: $18k/day

Statuses:
- Transit
- Waiting
- At Risk
- Berthed
- Diverted
- Loading
- Maintenance Hold

---

# 5. STRATEGIC OPTIONS ENGINE

Three options generated instantly.

## Option A: Cost Optimized
Focus: Minimize fuel + demurrage

KPIs:
- Lowest cost delta
- Moderate delay
- Higher risk exposure

Summary:
Cheapest path but slower recovery.

---

## Option B: Time Optimized
Focus: Restore refinery feed fastest

KPIs:
- Lowest delay
- Better buffer days
- Higher premium cost

Summary:
Protects production continuity.

---

## Option C: Risk Optimized (AI Recommended)

KPIs:
- Lowest geopolitical exposure
- Stable ETA confidence
- +$42k fuel increase

Summary:
Best resilience-adjusted decision.

---

### Buttons
- Apply Scenario
- Compare Plans
- Send to Decision Engine

When clicked:
Updates all KPIs, charts, vessel states.

---

# 6. IMPACT & DAMAGE PANEL

## Financial Damage

### Demurrage Tracker
Accumulating @ $39k/day

### Opportunity Cost
Current Loss vs AI Recommended Loss

### Revenue At Risk
Daily production income loss estimate

### Total Exposure
Cumulative loss envelope

Example:
$481k

---

## Operational Damage

- Buffer depletion rate
- Refinery starvation probability
- Berth queue spillover
- Charter penalties
- SLA breach probability

---

# 7. DECISION ENGINE (SIMULATED MODE)

Header:
Scenario Day X / 30

Active Scenario:
Hormuz Blockade

Buffer Death:
X Days Left

---

## Cascading Impacts

- Kochi berth queue expansion
- Demurrage on following vessels
- Tank ullage at BPCL
- Rail dispatch bottleneck
- Product shipment delays

---

## Alternative Paths

Tabs:
- A
- B
- C

Clicking changes charts + outcomes.

---

## Final Action Buttons

- Commit Decision
- Export Board Report
- Save Playbook
- Send to Live Ops

---

# 8. WHAT SHOULD UPDATE LIVE

When sliders / scenarios change:

### Must Recalculate
- Buffer days
- ETA
- Delay probability
- Risk score
- Demurrage
- Revenue at risk
- Recommended strategy
- Fleet statuses
- Port congestion impact
- Confidence score

---

# 9. DEMO FLOW (IMPORTANT)

1. Open Simulation Page  
2. Select Hormuz Blockade  
3. Click Run  
4. Risk spikes red  
5. Buffer drops  
6. Show fleet delays  
7. Compare A/B/C strategies  
8. Select AI Recommended C  
9. Metrics recover  
10. Send to Decision Engine

This becomes a killer judge moment.

---

# 10. BACKEND DATA NEEDED LATER

- Scenario configs
- Vessel state objects
- KPI formulas
- Cost models
- Delay models
- Risk models
- Recommendation ranking logic
- Saved scenarios
- Audit logs

---

## V] FLEET & SHIPMENTS PAGE

### Purpose
Operational fleet control center for all active vessels, shipments, route health, and exportable management reports.

---

# 1. TOP SUMMARY CARDS

### KPI Cards

1. **Total Fleet**
- Total active vessels in system
- Example: 28

2. **On Track**
- Vessels with healthy ETA + low disruption risk
- Example: 17

3. **Delayed**
- Vessels exceeding ETA threshold
- Example: 6

4. **High Risk**
- Vessels exposed to route/weather/geopolitical disruption
- Example: 5

> Clicking any card filters table instantly.

---

# 2. ACTION BAR

### Search
- Search by vessel name
- IMO
- Cargo type
- Route
- Charter owner

### Filters

#### Status Filter
- All
- On Track
- Delayed
- High Risk

#### Ownership Filter
- Full Fleet
- BPCL
- Chartered

#### Optional Advanced Filters
- Vessel Type
- Cargo Grade
- Destination Port
- ETA Window
- Risk Score Range

---

# 3. EXPORT FEATURES (FUNCTIONAL)

### Export Buttons

- Export PDF Report
- Export Excel (.xlsx)
- Export CSV
- Print Snapshot

### What Export Includes

#### PDF
Executive styled report:

- Fleet summary cards
- Delayed vessels
- High risk vessels
- Current KPIs
- Route disruptions
- Recommended actions

#### Excel
Structured operational sheet:

- Vessel rows
- Filters applied
- ETA
- Risk score
- Delay probability
- Costs

#### CSV
Quick raw data export.

---

# 4. MAIN TABLE

## Columns

| Vessel | Status | Route | ETA | Delay | Risk | Cargo | Owner | Actions |

---

## Column Definitions

### Vessel
Contains:

- Vessel Name
- Vessel Type (VLCC / Aframax / Suezmax etc.)
- IMO Number

Example:

MT Rajput  
VLCC  
IMO 9827311

---

### Status

Visual badge:

- On Track (green)
- Medium Risk (amber)
- High Risk (red)
- Delayed (orange)
- Critical (flashing red)

---

### Route

Standard naming convention:

**Origin → Destination**

Examples:

- Basrah → Mumbai
- Abu Dhabi → Kochi
- Ras Tanura → Jamnagar
- Singapore → Kochi
- Mumbai → Middle East

---

### ETA

- UTC
- IST
- Confidence %

Example:

12 May 14:00 UTC  
12 May 19:30 IST  
92%

---

### Delay

- On Time
- +6 hrs
- +18 hrs
- +2.1 days

---

### Risk

Composite risk score:

0–100

Breakdown hover:

- Weather
- Congestion
- Geopolitical
- Insurance

---

### Cargo

- Arab Light
- Basrah Medium
- Murban
- Diesel
- Naphtha
- LNG

---

### Owner

- BPCL
- Chartered
- Spot Market
- Partner Fleet

---

### Actions

Buttons:

- View
- Track Live
- Simulate
- Decision Engine
- Export Single Report

---

# 5. ROW EXPANDER (WHEN CLICKED)

Each vessel row can expand into detail panel.

## Expanded Content

### Current Journey
- Origin
- Destination
- Progress %
- Speed
- Heading

### Commercial
- Charter Rate
- Demurrage Exposure
- Cargo Value

### Risk Breakdown
- Weather
- Port Delay
- Insurance Surge
- Security Zone

### Recommendations
- Maintain route
- Slow steam
- Divert
- Prioritize berth

---

# 6. SORTING OPTIONS

- Highest Risk
- Biggest Delay
- Nearest Arrival
- Largest Cargo Value
- Highest Cost Exposure

---

# 7. LIVE AUTO-UPDATES

Should refresh every few seconds/minutes:

- ETA
- Position
- Delay probability
- Port congestion
- Risk score
- Alerts

---

# 8. DEMO FLOW

1. Open Fleet Page  
2. Show 28 vessels  
3. Click High Risk card  
4. Only 5 risky ships appear  
5. Open MT Rajput  
6. Show delay + risk details  
7. Click Simulate  
8. Jump to Simulation Page  
9. Export PDF for management

Judge impact = very high.

---

# 9. BACKEND DATA NEEDED

- fleet_master[]
- vessel_live_positions[]
- route_status[]
- eta_engine[]
- risk_scores[]
- ownership_tags[]
- cargo_manifest[]
- export_generator()

---

# 10. UI FEEL

Should feel like Bloomberg + Palantir operations grid.

Dense but clean.  
Fast filters.  
Zero lag.  
Instant trust.

---

## VI] ANALYTICS PAGE

### Purpose
Executive intelligence layer. Converts raw maritime operations into trends, anomalies, financial signals, risk forecasts, and AI recommendations.

This page should feel like the “boardroom brain” of NEMO.

---

# 1. TOP AI INSIGHTS PANEL

### AI Insights Feed

Each insight contains:

- Title
- Category
- 1-line explanation
- Confidence Score %
- Suggested action

### Categories

- Warning
- Observation
- Benchmark
- Opportunity

### Example Insights

1. **Warning**  
Port congestion at Kochi likely to increase demurrage in 48h  
Confidence: 88%

2. **Opportunity**  
Re-route MT Horizon can save $182k landed cost  
Confidence: 81%

3. **Benchmark**  
Fleet ETA reliability outperforming 3-month average by 7%  
Confidence: 93%

4. **Observation**  
Arabian Sea weather risk easing over next 72h  
Confidence: 76%

---

# 2. ANOMALY TIMELINE

### Header

Anomalies Detected: X

### Filters

- Last 24h
- Last 7d
- Last 30d

### Timeline Events

- Sudden demurrage spike
- ETA deviation cluster
- Port queue anomaly
- Insurance premium jump
- Throughput drop
- Weather reroute surge

---

# 3. FINANCIAL ANALYTICS

## KPI Cards

1. Total Landed Cost  
(avg cost per barrel)

2. Demurrage

3. Gross Margin

4. War Risk Premium

---

## Graphs

### Landed Cost Trend
Monthly line chart

### Demurrage Trend
Weekly chart

---

## Cost Components Breakdown

- Freight Cost
- Insurance
- Port Charges
- Demurrage
- Fuel Surcharge
- Diversion Cost

---

## Top Demurrage Contributors

| Vessel | Wait Time | Impact |
|---|---|---|

Example:

MT Rajput | 24h wait | $450K  
MT Horizon | 16h wait | $220K

---

## Recommended Actions

- Prioritize berth allocation for top cost vessels
- Divert vessel from congested port
- Renegotiate charter sequence
- Use rail bridge to protect refinery feed

---

# 4. OPERATIONAL ANALYTICS

## KPI Cards

1. ETA Variance  
(avg delay vs planned ETA)

2. Jetty Occupancy %

3. Discharge Rate  
(bbl/hr or MT/hr)

4. Buffer Days

---

## Graphs

### ETA Variance History
Weekly trend

### Buffer Days Trend
Monthly trend

---

## Operational Metrics

- Jetty Utilization %
- Turnaround Time (32h risk)
- Throughput ($298K/day)
- Queue Length
- Number of Waiting Vessels

---

## Delayed Vessels

| Vessel | Delay | Impact |
|---|---|---|

MT Rajput | +18h | High  
MT Horizon | +9h | Medium

---

## Threshold Alerts

- Buffer Days below threshold
- Jetty Occupancy above threshold
- ETA Variance worsening
- Queue length surge

---

# 5. RISK ANALYTICS

## KPI Cards

1. Maritime Risk Index %

2. Route Security  
X / 100

3. Weather Impact  
Low / Moderate / High

4. Delay Probability  
Next 48h forecast %

---

## Graphs

### Risk Index History
Weekly trend

### Risk by Category
Stacked / donut chart:

- Geopolitical
- Weather
- Congestion
- Insurance
- Other

---

## Risk Weight Controls

User-adjustable sliders:

- Geopolitical
- Weather
- Congestion
- Insurance

---

## High Risk Vessels

| Vessel | Risk Score | Impact |
|---|---|---|

MT Rajput | 84 | Severe  
MT Horizon | 71 | Elevated

---

## Mitigation Actions

- Divert route
- Increase safety buffer
- Prioritize discharge
- Hedge cost exposure
- Move inventory inland

---

# 6. ESG ANALYTICS

## KPI Cards

1. Fleet CII Rating  
A / B / C / D / E

2. Scope 3 Emissions  
12.4K ↓ 5%

3. Green Vessels %  
(A/B rated)

4. ESG Score  
X / 100

---

## Graphs

### Emissions Trend
Monthly line chart

### CII Distribution
Pie / donut chart:

- A
- B
- C
- D/E

---

## Fleet Rating Mix

A = %  
B = %  
C = %  
D = %  
E = %

---

## Emission Contributors

| Vessel | Emissions | Impact |
|---|---|---|

MT Rajput | High burn | 18%  
MT Horizon | Idle fuel waste | 12%

---

## ESG Actions

- Slow steaming on low priority routes
- Prioritize efficient vessels
- Reduce waiting time at port
- Optimize berth sequencing
- Blend cleaner transport modes

---

# 7. OPTIONAL REFINERY FIT KPI (Placeholder)

Can be added later:

- Crude slate compatibility
- Feedstock alignment
- Refinery throughput fit
- Margin uplift estimate

---

# 8. PAGE FILTERS (GLOBAL)

Top bar filters:

- Date Range
- Fleet / BPCL / Chartered
- Region
- Vessel Type
- Cargo Type
- Compare vs Previous Period

---

# 9. DEMO FLOW

1. Open Analytics  
2. Show AI insights feed  
3. Click Warning insight  
4. Jump to demurrage trend  
5. Show top cost vessel  
6. Open Risk tab  
7. Adjust geopolitical weight  
8. Risk index rises  
9. Show mitigation actions

Very strong investor/judge moment.

---

# 10. BACKEND DATA NEEDED

- kpi_snapshots[]
- trend_timeseries[]
- anomaly_events[]
- cost_breakdown[]
- risk_engine[]
- emissions_model[]
- ai_insights[]
- recommendation_engine[]

---

# 11. UI FEEL

Should feel like:

Palantir intelligence room + Bloomberg terminal + Apple polish.

High signal.  
Low clutter.  
Sharp decisions.

---

## VII] FLEET TRACKING PAGE

### Purpose
Real-time vessel tracking across the Indian Ocean theater (Middle East → India). Shows current position, ETA, route, status, weather, risks, and alerts.

---

# 1. MAP VIEW (CENTER)

### Map Features

- Vessels as real-time moving icons
- Ship trail lines (color-coded)
- Weather overlay (cloud cover, rain, cyclones)
- Route corridors
- Port markers (highlighted if congested)
- High-risk zones (geopolitical)

### Colors

Green = On Track  
Yellow = Medium Risk  
Red = High Risk / Delayed

### Example View

Arabian Sea → Gujarat Coast:

MT Rajput  
Green icon, straight trail, ETA 3 days

MT Horizon  
Yellow icon, slow movement, ETA +12h

---

# 2. VESSEL LIST (LEFT SIDE)

### Summary Cards

Total Vessels: X  
On Track: Y  
Delayed: Z  
High Risk: W

Clicking cards filters the map + list.

---

## Table Columns

| Icon | Vessel | Status | ETA | Distance | Risk | Speed | Owner |

### Icons

- Green ship = On Track
- Yellow ship = Medium Risk
- Red ship = High Risk
- Flashing red = Critical Alert

### Vessel

- Name
- Type (VLCC/Aframax)
- IMO

### Status

- On Track
- Delayed
- At Risk
- Berthed
- Waiting
- Rerouting

### ETA

- Local Time
- UTC

### Distance

- To Port
- From Last Port

### Risk Score

- 0–100
- Color-coded

### Speed

- Actual vs Recommended
- % deviation

### Owner

- BPCL / Chartered / Spot

---