# ARCHITECTURE.md — Deep Dive into Component Design & Patterns

**Technical architecture, design patterns, and decision rationale for the CrudeFlow frontend.**

---

## Table of Contents

1. [Component Architecture](#component-architecture)
2. [State Management Patterns](#state-management-patterns)
3. [Map Module Design](#map-module-design)
4. [Simulation Lab Strategy](#simulation-lab-strategy)
5. [Decision Engine Flow](#decision-engine-flow)
6. [Performance Considerations](#performance-considerations)
7. [Styling & Theme System](#styling--theme-system)

---

## Component Architecture

### Hierarchy Model

CrudeFlow uses a **layered component hierarchy** optimized for isolation and testability:

```
Presentation Layer (UI Components)
├── Page Components (app/**/page.tsx)
│   └── Feature Container (dashboard, map, simulation, decisions)
│       └── Feature-Specific Components (KPI cards, map layers, sim controls)
│           └── Primitive UI Components (buttons, inputs, cards from shadcn/ui)
│
Business Logic Layer (Contexts)
├── AppProviders (index.tsx)
├── SimulationProvider (cascades KPIs, god mode state)
├── KPIProvider (computed KPI derivations)
├── DecisionsProvider (queue management)
└── ... (other contexts)

Data Layer
├── Mock Data (map-data.ts) → Replace with API calls
├── Type Definitions (types/*.ts)
└── Utilities (lib/*, hooks/*)
```

### Component Principles

**1. Single Responsibility**
- Each component has one reason to change
- `VesselDetailDrawer` → vessel info display only
- `RouteComparisonOverlay` → route diff visualization only

**2. Composition over Inheritance**
```typescript
// ✅ Good: Compose features from focused components
<SimulationLab>
  <ControlPanel />      // Sliders only
  <TimelineScrubber />  // Day navigation only
  <ScenarioVisualization /> // Charts only
</SimulationLab>

// ❌ Bad: Monolithic god component
<SimulationPage />  // Contains everything
```

**3. Props-Driven Configuration**
```typescript
interface TrackPlaybackBarProps {
  track: VesselTrack;
  isPlaying: boolean;
  playable: boolean;
  projectionConfidence: number;
  onPlayPause: () => void;
  onSeek: (t: number) => void;
  // ... more handlers
}

// Usage is explicit and testable
<TrackPlaybackBar
  track={playback.track}
  isPlaying={playback.isPlaying}
  playable={playback.playable}
  onPlayPause={playback.toggle}
  ...
/>
```

---

## State Management Patterns

### Why Context API Instead of Redux?

| Criterion | Context API | Redux |
|---|---|---|
| **Setup Time** | 5 min | 30 min |
| **Bundle Size** | +0 KB | +20 KB |
| **For NEMO's needs** | Sufficient | Overkill |

**Decision:** Use React Context for global state; component-level state for UI concerns (open/closed drawers, loading states).

### Context Layering Strategy

**Key insight:** Contexts are organized by *domain*, not by app state.

```
SimulationProvider (Domain: God Mode)
├── State:
│   ├── isSimulationMode: boolean (triggers blue border, overlays)
│   ├── currentDay: number (timeline position)
│   ├── activeScenario: string (hormuz, cyclone, etc.)
│   ├── sliders: { vesselSpeed, portCongestion, riskLevel, ... }
│   ├── cascadedKPIs: { demurrage, buffer, risk, cost } (derived)
│   ├── strategicOptions: Array (Pareto frontier)
│   └── driftProjections: Array (ghost vessels)
│
├── Derived Values (useMemo):
│   ├── Demurrage calculation (hours × rate)
│   ├── Buffer loss (days impacted)
│   └── Risk score (0-100)
│
└── Methods:
    ├── setSlider(key, value) → triggers backend simulation
    ├── updateDay(newDay)
    ├── setScenario(id)
    ├── resetToLive()
    └── exitSimulationMode() → clears all state

---

KPIProvider (Domain: KPI Cascade)
├── State:
│   ├── liveDemurrage, liveBuffer, liveRisk, liveCost (from API)
│   └── cascadedKPIs (from SimulationProvider when in sim mode)
│
└── Derived:
    └── Color mapping: demurrage → red, buffer → amber, risk → blue, cost → purple

---

DecisionsProvider (Domain: Decision Queue)
├── State:
│   ├── decisionQueue: Array
│   ├── currentDecisionId: string
│   └── appliedDecisions: Set (audit trail)
│
└── Methods:
    ├── applyDecision(id)
    ├── rejectDecision(id)
    └── deferDecision(id, hours)
```

### Update Flow Diagram

```
User adjusts slider in /simulation
     ↓
SimulationProvider.setSlider() called
     ↓
State updates in React
     ↓
useMemo recalculates cascadedKPIs
     ↓
KPIProvider reads cascadedKPIs via context
     ↓
Dashboard re-renders with new KPI values
     ↓
Map overlay updates ghost vessels
     ↓
Strategy cards refresh Pareto frontier
```

**Key:** No polling, no manual event dispatch. Just React's render cycle.

---

## Map Module Design

### Leaflet Integration Strategy

**Challenge:** Leaflet is a mutable imperative library; React is declarative. How to bridge them?

**Solution:** Use React-Leaflet (React bindings) to manage Leaflet within React's component tree.

### Map Component Hierarchy

```
MaritimeIntelligenceMap (Root)
├── MapContainer (from react-leaflet)
│   ├── TileLayer (basemap: dark or light)
│   │
│   ├── CurrentRoutesLayer
│   │   └── Polyline[] (solid colored lines)
│   │
│   ├── AIRoutesLayer
│   │   └── Polyline[] (dotted cyan lines)
│   │
│   ├── VesselMarkers
│   │   └── Marker[] (chevron icons, status-colored)
│   │       └── Tooltip[] (hover: name, ETA, destination)
│   │
│   ├── RiskZonesLayer
│   │   └── Polygon[] (geopolitical, weather, piracy)
│   │
│   ├── PortLayer
│   │   └── CircleMarker[] (congestion badges)
│   │
│   ├── SimulationOverlay (ghost vessels + drift lines)
│   │   └── Marker[] (faded chevrons at projected positions)
│   │
│   ├── VesselTrackLayers (history + projection playback)
│   │   ├── Polyline (solid past path)
│   │   ├── Polyline (dashed future path, confidence-driven)
│   │   └── Marker (animated playhead)
│   │
│   └── RouteComparisonOverlay (current vs AI route diff)
│       ├── Polygon (cyan diff highlight)
│       ├── Polyline (bold red current route)
│       ├── Polyline (bold dashed cyan AI route)
│       └── Circle[] (origin/destination pins)
│
└── Map Controls (Fixed Overlays, outside map)
    ├── ViewSwitcher (dark/light theme)
    ├── LayerControls (toggle layers)
    ├── FilterHub (date, port, vessel filters)
    ├── VesselDetailDrawer (click vessel → info)
    ├── MapLegend or TrackMiniLegend
    ├── SimControlPanel (show/hide overlay, exit sim)
    ├── RouteComparisonCard (summary when comparing)
    └── TrackPlaybackBar (timeline when tracking)
```

### Why Separate Concerns into Layers?

Each layer is a self-contained module:

```typescript
// components/map/simulation-overlay.tsx
export function SimulationOverlay({ vessels, enabled, highlightVesselId }) {
  // Only knows about ghost vessels and drift lines
  // Doesn't touch base map, routes, or risk zones
}

// components/map/route-comparison/route-comparison-overlay.tsx
export function RouteComparisonOverlay({ vessel }) {
  // Only knows about diff visualization
  // Doesn't touch simulation state
}
```

**Benefit:** Easy to toggle layers, test independently, and add/remove features without affecting others.

### Interactivity Patterns

#### Marker Click → Drawer Open

```typescript
<Marker position={vessel.position} eventHandlers={{
  click: () => {
    setSelectedVesselId(vessel.id);  // Drawer slides in
    onVesselSelect?.(vessel);         // Parent notified
  }
}} />
```

#### Slider Adjustment → Map Overlay Update

```typescript
// SimulationProvider updates sliders
// → cascadedKPIs derived
// → SimulationOverlay reads new projections
// → Ghost vessels re-render at new positions
```

#### Tracking Mode → Playhead Animation

```typescript
// User clicks "Track vessel"
// → trackingId set in map state
// → useVesselTrack hook starts rAF animation loop
// → playhead position updated every 16ms
// → VesselTrackLayers listens to playback.current
// → Camera pans if autoFollow enabled
```

---

## Simulation Lab Strategy

### Three Design Layers

#### 1. **Control Layer** (User Input)
```typescript
// components/simulation/control-panel.tsx
// Sliders: speed, congestion, risk, throughput, crude type, inventory, discharge rate
// Each slider is local-state until user "commits" (or real-time if backend supports)
```

#### 2. **Computation Layer** (Backend Sync)
```typescript
// When slider changes:
// 1. Update SimulationProvider local state
// 2. Call POST /api/v1/simulate with sliders + day
// 3. Backend runs PuLP optimizer
// 4. Response includes:
//    - Cascaded KPIs (demurrage, buffer, risk, cost)
//    - Pareto frontier (3 strategic options)
//    - Ghost vessel projections
//    - Solver diagnostics (slacks, dual values)
// 5. Update context with response
// 6. React re-renders all views
```

#### 3. **Visualization Layer** (Output)
```typescript
// components/simulation/strategic-alternatives.tsx
// Shows 3 Pareto-optimal cards:
// - Option 1: Lowest Cost
// - Option 2: Minimize Delay
// - Option 3: Maximize Resilience

// components/simulation/financial-ticker.tsx
// Real-time KPI updates

// components/map/simulation-overlay.tsx
// Ghost vessels on map showing drift paths
```

### Optimization: Why No Re-fetch on Every Frame?

**Problem:** If we call backend on every slider pixel change, we'd spam the API.

**Solution:** Debounce the slider input or let the user "commit" the slider before fetching.

```typescript
// Option 1: Debounce (200ms delay after slider stops moving)
const debouncedSimulate = useMemo(
  () => debounce((sliders) => {
    runSimulation(sliders);
  }, 200),
  []
);

// Option 2: "Apply" button (user explicitly submits)
<button onClick={() => runSimulation(sliders)}>
  Apply Scenario
</button>
```

**Current Implementation:** Mock backend runs synchronously; when real backend is integrated, debouncing will be added.

---

## Decision Engine Flow

### Component Sequence

```
1. User visits /decisions
2. DecisionsPage mounts
3. DecisionsProvider fetches GET /api/v1/decisions
4. Decision queue renders in DecisionList

5. User clicks a decision card
6. DecisionCorePanel opens with full details
7. Evidence panel shows supporting data (charts, risk analysis)
8. AI Copilot sidebar ready for questions

9. User clicks "Apply Decision"
10. POST /api/v1/decisions/{id}/apply sent to backend
11. Backend logs decision, applies reroute/monitoring/delay
12. Frontend removes decision from queue
13. Activity feed updated with "Applied decision: ..."
```

### Evidence Panel Architecture

```typescript
// components/decisions/evidence-panel.tsx
// Displays multi-modal evidence:
// 1. Route comparison chart (current vs recommended)
// 2. Risk timeline (how risk changes with recommendation)
// 3. Financial impact (demurrage savings, fuel cost)
// 4. Vessel context (speed, position, cargo)

// Uses Recharts for charts; no custom D3
```

### AI Copilot Integration

```typescript
// components/decisions/ai-copilot-panel.tsx
// 1. Render message history
// 2. Input field
// 3. On submit:
//    - POST /api/v1/chat { message, vessel_context, conversation_id }
//    - Stream response or fetch complete response
//    - Display AI reply in message bubble
//    - Store in conversation history
```

---

## Performance Considerations

### 1. Code Splitting

Leaflet and Recharts are heavy. Load them only when needed:

```typescript
// Next.js dynamic import with ssr: false
const MaritimeIntelligenceMap = dynamic(
  () => import('@/components/map/maritime-intelligence-map'),
  { ssr: false, loading: () => <MapSkeleton /> }
);
```

### 2. Memoization Strategy

```typescript
// Vessel marker rendering
const vesselMarkers = useMemo(
  () => visibleVessels.map(v => <Marker key={v.id} ... />),
  [visibleVessels]
);

// Only re-render when visibleVessels actually changes
```

### 3. Render Optimization

**Problem:** Simulation overlay with 50 ghost vessels + drift lines re-renders entire map on slider change.

**Solution:**
- Use `React.memo` on layer components
- Only re-render layers whose data changed
- Leaflet layers are imperative; React-Leaflet handles DOM diffing

### 4. Context Selector Pattern (When Scaling)

Currently, contexts are consumed with full value. If contexts grow:

```typescript
// Option: Use useContext + selector to prevent full re-renders
function useSimulationDay() {
  const { currentDay } = useContext(SimulationContext);
  return currentDay;  // Only subscribe to this slice
}
```

### 5. API Caching

When live AIS data arrives, cache it to avoid re-fetching:

```typescript
// SWR is lightweight; could be added for API calls
import useSWR from 'swr';

function useVessel(mmsi: string) {
  const { data, error } = useSWR(
    `/api/v1/vessel/${mmsi}/context`,
    fetch,
    { revalidateOnFocus: false }
  );
  return { data, error };
}
```

---

## Styling & Theme System

### Design Tokens (Tailwind v4)

**File:** `app/globals.css`

```css
@theme inline {
  --color-bg-primary: rgb(15 15 15);     /* #0f0f0f */
  --color-bg-secondary: rgb(31 31 31);   /* #1f1f1f */
  --color-text-primary: rgb(229 229 229); /* #e5e5e5 */
  --color-accent-red: rgb(239 68 68);    /* #ef4444 */
  --color-accent-amber: rgb(245 158 11); /* #f59e0b */
  --color-accent-green: rgb(16 185 129); /* #10b981 */
  --color-accent-blue: rgb(59 130 246);  /* #3b82f6 */
  --color-accent-cyan: rgb(6 182 212);   /* #06b6d4 */
  --color-accent-purple: rgb(167 139 250); /* #a78bfa */
}
```

### KPI Color Mapping

```typescript
// components/dashboard/kpi-cards.tsx
const colorMap: Record<KPISeverity, string> = {
  critical: '#ef4444',    // Red: Demurrage
  warning: '#f59e0b',     // Amber: Buffer Days
  normal: '#3b82f6',      // Blue: Risk Index
  purple: '#a78bfa',      // Purple: Cost of Inaction
};
```

### Simulation Mode Indicator

**Blue frame border around entire viewport:**

```typescript
// app/globals.css
.sim-frame {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  border: 1.5px solid rgba(59, 130, 246, 0.55);
  box-shadow: inset 0 0 0 1px rgba(59, 130, 246, 0.15);
  pointer-events: none;
  z-index: 9999;
  animation: sim-frame-pulse 4.5s ease-in-out infinite;
}

@keyframes sim-frame-pulse {
  0%, 100% { opacity: 0.55; }
  50%      { opacity: 0.95; }
}
```

### Responsive Design

**Mobile-first approach:**

```typescript
// Default: mobile styles
// md: (768px) → tablet
// lg: (1024px) → desktop

<div className="
  flex flex-col              // Mobile: stack
  md:flex-row               // Tablet: side-by-side
  lg:gap-8                  // Desktop: more space
" />
```

---

## Deployment & Scalability

### Next.js 16 Features Used

1. **React Compiler** (stable)
   - Automatic memoization of components/functions
   - No need to manually `useMemo` everywhere

2. **Turbopack** (default bundler)
   - 20–30% faster builds
   - Better HMR for development

3. **Edge Functions** (for Vercel deployment)
   - API routes can run on edge (low latency)
   - Already set up for `POST /api/routes/generate`

### Docker Support

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install
COPY . .
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

---

## Lessons & Trade-offs

| Decision | Rationale |
|---|---|
| **Context API over Redux** | Simpler for this scope; avoids boilerplate |
| **React-Leaflet over Mapbox/Cesium** | Leaflet is lightweight; Mapbox requires API key |
| **Recharts over D3** | Recharts is React-native; D3 requires careful DOM management |
| **Tailwind CSS over CSS Modules** | Utility-first scales; consistent design tokens |
| **shadcn/ui over Material-UI** | Headless components; easier to customize |
| **No API mocking library** | Simple `map-data.ts` is sufficient for demo; will be replaced |
| **No E2E testing framework** | Scope didn't warrant it; manual testing + visual QA sufficient |

---

## Future Enhancements

1. **State Persistence:** Save simulation snapshots to localStorage or backend
2. **Multi-user Collaboration:** Real-time cursor visibility, shared decision queue
3. **Mobile App:** React Native version using same context logic
4. **Advanced Analytics:** ML-driven anomaly detection, forecasting models
5. **GraphQL:** Replace REST endpoints with GraphQL for more flexible queries
6. **Accessibility:** WCAG 2.1 AAA compliance (currently AA)

---

## Conclusion

CrudeFlow's architecture prioritizes **simplicity**, **composability**, and **performance**. By using React Context for state, React-Leaflet for maps, and Recharts for visualization, we've built a frontend that is:

- **Easy to understand** (minimal boilerplate)
- **Easy to modify** (component-based, props-driven)
- **Easy to test** (contexts are testable, components are pure)
- **Ready for production** (optimized, accessible, performant)

The foundation is solid for backend integration and future scaling.

