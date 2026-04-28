# Mock Data Audit

This document lists all mock data in the frontend and where to replace it with real API calls.

## Priority: HIGH 🔴

These are critical to replace first. The app will be mostly non-functional without these.

### 1. KPI Context (`contexts/kpi-context.tsx`)

**Functions to Replace:**
```typescript
function baselineDemurrage(): DemurrageForecast
function baselineBuffer(): BufferDaysRemaining
function baselineMaritimeRisk(): MaritimeRiskIndex
function baselineCostOfInaction(): CostOfInaction
```

**Current Location:** Lines ~20-200  
**Endpoint:** `GET /api/kpis?workspace_id=<id>`  
**Impact:** Dashboard KPI cards won't show real data

---

### 2. Decision Queue (`contexts/decisions-context.tsx`)

**Mock Data:**
```typescript
const mockDecisions = [ /* array of decision objects */ ]
```

**Current Location:** Lines ~50-150  
**Endpoint:** `GET /api/decisions?status=pending`  
**Impact:** Decision Engine won't show real recommendations

---

### 3. Vessel Tracking (`components/map/maritime-intelligence-map.tsx`)

**Mock Data:**
```typescript
const mockVessels = [ /* array of vessel positions */ ]
const mockRoutes = [ /* array of route lines */ ]
```

**Current Location:** Lines ~30-150  
**Endpoint:** `WebSocket /ws/ais` for live updates  
**Impact:** Map will show static test data instead of live fleet

---

## Priority: MEDIUM 🟡

These affect functionality but aren't critical for initial testing.

### 4. Simulation Results (`contexts/simulation-context.tsx`)

**Mock Data:**
```typescript
const mockSimulation = {
  kpis: { /* simulated KPIs */ },
  routes: [ /* optimized routes */ ],
  alternatives: [ /* Pareto frontier */ ]
}
```

**Current Location:** Lines ~200-400  
**Endpoint:** `POST /api/simulations/execute`  
**Impact:** Simulation sliders won't trigger real optimization

---

### 5. Analytics Data (`components/analytics/`)

**Mock Data:**
- `scenario-comparison.tsx`: Mock scenario data
- `anomaly-timeline.tsx`: Mock anomalies
- `ai-insights-strip.tsx`: Mock insights

**Endpoints:**
- `GET /api/analytics/anomalies?start=<date>&end=<date>`
- `GET /api/analytics/metrics?metric=<name>&start=<date>&end=<date>`

**Impact:** Analytics page won't show real data

---

### 6. User Settings (`contexts/settings-context.tsx`)

**Mock Data:**
```typescript
const defaultSettings = {
  aiThresholds: { /* mock values */ },
  ports: [ /* mock port data */ ]
}
```

**Endpoint:** `GET /api/settings`  
**Impact:** Settings won't persist to backend

---

## Priority: LOW 🟢

These are cosmetic/demo features. Can be replaced anytime.

### 7. Activity Feed (`contexts/activity-feed-context.tsx`)

**Mock Data:**
```typescript
const mockActivityFeed = [ /* demo events */ ]
```

**Endpoint:** `GET /api/activity`  
**Impact:** Activity feed shows dummy events

---

### 8. System Status (`contexts/system-status-context.tsx`)

**Mock Data:**
```typescript
const mockSystemStatus = {
  status: 'operational',
  uptime: '99.8%',
  alerts: [ /* demo alerts */ ]
}
```

**Endpoint:** `GET /api/system/status`  
**Impact:** System status indicator won't reflect real backend health

---

### 9. Landing Page Data

**Mock Data:**
- Testimonials in `components/landing/landing-indian-customers.tsx`
- Feature cards in `components/landing/landing-capabilities.tsx`
- Map pins in `components/landing/landing-india-map.tsx`

**Note:** These are marketing content, not operational data. Mostly static.

---

## Replacement Strategy

### Phase 1: Core Functionality (Week 1)
1. Replace KPI context
2. Replace decisions context
3. Replace vessel tracking
4. Test dashboard + map

### Phase 2: Advanced Features (Week 2)
5. Replace simulation context
6. Replace analytics data
7. Test simulator page

### Phase 3: Polish (Week 3)
8. Replace settings
9. Replace activity feed
10. Replace system status

---

## Quick Find: Search Patterns

Use these grep patterns to find mock data:

```bash
# Find mock arrays
grep -r "const mock" contexts/ components/

# Find hardcoded test data
grep -r "const \(mockVessels\|mockRoutes\|mockDecisions\)" .

# Find functions returning fake data
grep -r "function baseline" contexts/

# Find fetch calls (should have error handling)
grep -r "fetch(" --include="*.tsx" | grep -v "import"
```

---

## Mock Data Removal Checklist

- [ ] Phase 1 endpoints implemented
- [ ] KPI context removes `baselineDemurrage()` functions
- [ ] Decisions context fetches from `/api/decisions`
- [ ] Map updates from WebSocket instead of mock
- [ ] Dashboard shows real KPIs
- [ ] Phase 2 endpoints implemented
- [ ] Simulation triggers real backend solver
- [ ] Analytics fetches real data
- [ ] Phase 3 endpoints implemented
- [ ] All mock data removed
- [ ] Fallback mechanisms in place for API errors
- [ ] Tests passing with real data

---

## Testing with Mock Data

Until backend is ready, you can keep using mock data. To switch between mock and real:

```typescript
// lib/config.ts
export const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== 'false';

// contexts/kpi-context.tsx
const kpiData = USE_MOCK_DATA 
  ? baselineDemurrage()  // Mock fallback
  : await fetchDemurrage();  // Real API

// In .env.local:
# NEXT_PUBLIC_USE_MOCK_DATA=true  # Use during development
# NEXT_PUBLIC_USE_MOCK_DATA=false # Use with real backend
```

---

## Files to Review

**High Priority:**
- `contexts/kpi-context.tsx` — 500+ lines, ~80% mock
- `contexts/decisions-context.tsx` — 300+ lines, ~70% mock
- `components/map/maritime-intelligence-map.tsx` — 400+ lines, ~60% mock

**Medium Priority:**
- `contexts/simulation-context.tsx` — 350+ lines, ~50% mock
- `components/analytics/` — 200+ lines across 5 files, ~40% mock

**Low Priority:**
- `contexts/settings-context.tsx` — 150 lines, ~20% mock
- `contexts/activity-feed-context.tsx` — 100 lines, ~30% mock

---

## Key Functions Returning Mock Data

```
contexts/kpi-context.tsx:
  - baselineDemurrage()           → GET /api/kpis/demurrage
  - baselineBuffer()              → GET /api/kpis/buffer
  - baselineMaritimeRisk()        → GET /api/kpis/risk
  - baselineCostOfInaction()      → GET /api/kpis/cost

contexts/decisions-context.tsx:
  - mockDecisions array           → GET /api/decisions
  - Decision reason generation    → Delegated to backend

components/map/maritime-intelligence-map.tsx:
  - mockVessels array             → WebSocket /ws/ais
  - mockRoutes array              → WebSocket /ws/ais
  - mockRiskZones                 → GET /api/map/risk-zones

contexts/simulation-context.tsx:
  - mockSimulation object         → POST /api/simulations/execute
  - Scenario presets              → GET /api/scenarios
```

---

**Last Updated:** April 2025  
**Total Mock Data Functions:** ~25  
**Estimated Replacement Time:** 3-4 weeks (with backend ready)
