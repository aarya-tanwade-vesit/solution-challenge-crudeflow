# Backend Integration Guide

This guide walks you through connecting the CrudeFlow frontend to your backend API. The frontend is currently using mock data; replace it step-by-step with real API calls.

## Table of Contents
1. [Setup](#setup)
2. [API Endpoints](#api-endpoints)
3. [Context Migration](#context-migration)
4. [WebSocket Integration](#websocket-integration)
5. [Authentication](#authentication)
6. [Error Handling](#error-handling)
7. [Testing](#testing)

## Setup

### Prerequisites
- Backend API running at `http://localhost:8000/api`
- WebSocket server at `ws://localhost:8000/ws`
- Frontend running at `http://localhost:3000`

### Environment
Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_API_WS_URL=ws://localhost:8000/ws
```

## API Endpoints

### 1. KPI Data

**File:** `contexts/kpi-context.tsx`

**Current (Mock):**
```typescript
function baselineDemurrage(): DemurrageForecast {
  return {
    id: 'demurrage',
    value: 1200000,
    trend: 'up',
    // ...
  };
}
```

**Replace with:**
```typescript
async function fetchKPIData(workspaceId: string): Promise<KPIData> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/kpis`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
  });
  
  if (!res.ok) throw new Error('Failed to fetch KPIs');
  return res.json();
}

// In useEffect:
useEffect(() => {
  (async () => {
    try {
      setIsLoading(true);
      const data = await fetchKPIData(workspaceId);
      setKpiData(data);
    } catch (err) {
      console.error('KPI fetch failed:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  })();
}, [workspaceId]);
```

**Expected Response:**
```json
{
  "workspace_id": "bpcl-001",
  "timestamp": "2025-04-26T10:30:00Z",
  "kpis": {
    "demurrage": {
      "id": "demurrage",
      "label": "Demurrage Liability Forecast",
      "value": 1200000,
      "currency": "USD",
      "trend": "up",
      "trendPercentage": 18,
      "color": "red",
      "status": "warning",
      "breakdown": [
        {
          "vesselName": "MT Rajput",
          "waitTime": 24,
          "dailyRate": 45000,
          "forecast": 450000
        }
      ]
    },
    "buffer_days": { ... },
    "risk_index": { ... },
    "cost_of_inaction": { ... }
  }
}
```

---

### 2. Decisions Queue

**File:** `contexts/decisions-context.tsx`

**Current (Mock):**
```typescript
const mockDecisions = [
  {
    id: 'dec-001',
    vessel: 'MT Rajput',
    status: 'pending',
    // ...
  }
];
```

**Replace with:**
```typescript
async function fetchDecisions(status: string = 'pending') {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/decisions?status=${status}`,
    {
      headers: { 'Authorization': `Bearer ${getAuthToken()}` },
    }
  );
  if (!res.ok) throw new Error('Failed to fetch decisions');
  return res.json();
}

// In useEffect:
useEffect(() => {
  const loadDecisions = async () => {
    const data = await fetchDecisions('pending');
    setDecisions(data.decisions);
  };
  loadDecisions();
}, []);
```

**Expected Response:**
```json
{
  "decisions": [
    {
      "id": "dec-001",
      "vessel_id": "rajput-001",
      "vessel_name": "MT Rajput",
      "status": "pending",
      "recommendation": "Divert to Mangalore via Red Sea",
      "impact": {
        "cost_delta": -245000,
        "time_delta": 4,
        "risk_reduction": 0.35
      },
      "alternatives": [
        {
          "option": "Suez via Egypt",
          "cost": 256000,
          "time": 2,
          "risk": 0.45
        }
      ],
      "created_at": "2025-04-26T10:00:00Z",
      "expires_at": "2025-04-26T18:00:00Z"
    }
  ]
}
```

---

### 3. Vessel Tracking (AIS)

**File:** `components/map/maritime-intelligence-map.tsx`

**WebSocket Pattern:**
```typescript
useEffect(() => {
  const wsUrl = `${process.env.NEXT_PUBLIC_API_WS_URL}/ais`;
  const ws = new WebSocket(wsUrl);

  ws.onopen = () => console.log('AIS stream connected');

  ws.onmessage = (event) => {
    const update = JSON.parse(event.data);
    // update: { mmsi, lat, lon, speed, heading, eta, status }
    updateVesselMarker(update);
  };

  ws.onerror = (err) => console.error('AIS stream error:', err);
  ws.onclose = () => console.log('AIS stream closed');

  return () => ws.close();
}, []);
```

**Expected Message:**
```json
{
  "mmsi": 311000000,
  "vessel_name": "MT Rajput",
  "lat": 12.9716,
  "lon": 77.5946,
  "speed": 18.5,
  "heading": 45,
  "status": "transit",
  "eta": "2025-04-28T08:00:00Z",
  "cargo_type": "Crude Oil",
  "destination": "INMUN1"
}
```

---

### 4. Simulation Engine

**File:** `contexts/simulation-context.tsx`

**Current (Mock):**
```typescript
// Hardcoded scenario outcomes
const mockSimulation = {
  kpis: { demurrage: 1100000, ... },
  routes: [ /* ... */ ],
  alternatives: [ /* ... */ ],
};
```

**Replace with:**
```typescript
async function runSimulation(params: SimulationParams) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/simulations/execute`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({
        workspace_id: workspaceId,
        vessel_ids: selectedVessels,
        constraints: {
          speed_knots: params.speed,
          port_congestion_pct: params.congestion,
          risk_level_pct: params.risk,
          refinery_throughput_pct: params.throughput,
        },
        horizon_days: 24,
        scenario_preset: params.scenario,
      }),
    }
  );

  if (!res.ok) throw new Error('Simulation failed');
  return res.json();
}

// On slider change:
const handleSliderChange = async (newValue: number) => {
  setSliders((prev) => ({ ...prev, speed: newValue }));
  const result = await runSimulation(sliders);
  setSimulationResult(result);
};
```

**Expected Response:**
```json
{
  "simulation_id": "sim-001",
  "scenario": "baseline",
  "horizon_days": 24,
  "kpis": {
    "demurrage": {
      "baseline": 1200000,
      "simulated": 950000,
      "delta": -250000
    },
    "buffer_days": {
      "baseline": 3.8,
      "simulated": 4.2,
      "delta": 0.4
    },
    "risk_index": {
      "baseline": 68,
      "simulated": 45,
      "delta": -23
    }
  },
  "routes": [
    {
      "vessel_id": "rajput-001",
      "current_route": [ /* waypoints */ ],
      "optimized_route": [ /* waypoints */ ],
      "eta_current": "2025-04-30T10:00:00Z",
      "eta_optimized": "2025-05-02T12:00:00Z"
    }
  ],
  "alternatives": [
    {
      "name": "Suez Direct",
      "cost": 250000,
      "time_days": 2,
      "risk_score": 45
    },
    {
      "name": "Red Sea Detour",
      "cost": 345000,
      "time_days": 3,
      "risk_score": 25
    }
  ]
}
```

---

### 5. Analytics

**File:** `components/analytics/`

```typescript
async function fetchAnomalies(
  startDate: string,
  endDate: string
): Promise<Anomaly[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/analytics/anomalies?start=${startDate}&end=${endDate}`,
    {
      headers: { 'Authorization': `Bearer ${getAuthToken()}` },
    }
  );
  if (!res.ok) throw new Error('Failed to fetch anomalies');
  return res.json();
}

async function fetchMetrics(
  metricName: string,
  startDate: string,
  endDate: string
): Promise<Metric[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/analytics/metrics?metric=${metricName}&start=${startDate}&end=${endDate}`,
    {
      headers: { 'Authorization': `Bearer ${getAuthToken()}` },
    }
  );
  if (!res.ok) throw new Error('Failed to fetch metrics');
  return res.json();
}
```

---

## Context Migration

### Step 1: Identify Mock Data

Search for these patterns in `contexts/`:
```typescript
// In kpi-context.tsx:
function baselineDemurrage() { ... }
function baselineBuffer() { ... }
function baselineMaritimeRisk() { ... }
function baselineCostOfInaction() { ... }

// In decisions-context.tsx:
const mockDecisions = [ ... ]

// In simulation-context.tsx:
const mockSimulation = { ... }
```

### Step 2: Create API Helpers

Create `lib/api-client.ts`:
```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export const apiClient = {
  async get<T>(endpoint: string): Promise<T> {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: { 'Authorization': `Bearer ${getAuthToken()}` },
    });
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    return res.json();
  },

  async post<T>(endpoint: string, body: any): Promise<T> {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    return res.json();
  },
};
```

### Step 3: Update Contexts

Replace mock data fetching:
```typescript
// Before:
const data = baselineDemurrage();

// After:
const data = await apiClient.get('/kpis/demurrage');
```

---

## WebSocket Integration

### Real-Time AIS Updates

```typescript
// hooks/useAisStream.ts
export function useAisStream() {
  const [vessels, setVessels] = useState<Vessel[]>([]);

  useEffect(() => {
    const ws = new WebSocket(
      `${process.env.NEXT_PUBLIC_API_WS_URL}/ais?auth_token=${getAuthToken()}`
    );

    ws.onmessage = (event) => {
      const update: VesselUpdate = JSON.parse(event.data);
      setVessels((prev) => {
        const idx = prev.findIndex((v) => v.mmsi === update.mmsi);
        if (idx === -1) return [...prev, update];
        const updated = [...prev];
        updated[idx] = { ...updated[idx], ...update };
        return updated;
      });
    };

    return () => ws.close();
  }, []);

  return vessels;
}
```

### Decision Notifications

```typescript
export function useDecisionStream() {
  const [decisions, setDecisions] = useState<Decision[]>([]);

  useEffect(() => {
    const ws = new WebSocket(
      `${process.env.NEXT_PUBLIC_API_WS_URL}/decisions?auth_token=${getAuthToken()}`
    );

    ws.onmessage = (event) => {
      const decision: Decision = JSON.parse(event.data);
      setDecisions((prev) => [decision, ...prev]);
      toast.success(`New decision: ${decision.recommendation}`);
    };

    return () => ws.close();
  }, []);

  return decisions;
}
```

---

## Authentication

### Bearer Token Pattern

```typescript
// lib/auth.ts
export function getAuthToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('auth_token') || '';
}

export function setAuthToken(token: string) {
  localStorage.setItem('auth_token', token);
}

export async function login(email: string, password: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) throw new Error('Login failed');
  const { token } = await res.json();
  setAuthToken(token);
  return token;
}
```

---

## Error Handling

```typescript
async function safeApiCall<T>(
  fn: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.error('API call failed:', error);
    // Log to Sentry if available
    if (window.Sentry) {
      window.Sentry.captureException(error);
    }
    return fallback;
  }
}

// Usage:
const kpis = await safeApiCall(
  () => fetchKPIData(workspaceId),
  getMockKPIData() // fallback to mock
);
```

---

## Testing

### Mock API Responses (for local testing without backend)

```typescript
// __mocks__/api.ts
export const mockKPIs = {
  demurrage: { value: 1200000, trend: 'up' },
  buffer_days: { value: 3.8, trend: 'down' },
};

export const mockDecisions = [
  {
    id: 'dec-001',
    vessel_name: 'MT Rajput',
    recommendation: 'Divert to Mangalore',
  },
];
```

### Test Context Integration

```typescript
// __tests__/KPIContext.test.tsx
import { render, screen } from '@testing-library/react';
import { KPIProvider, useKPI } from '@/contexts/kpi-context';

test('fetches and displays KPI data', async () => {
  render(
    <KPIProvider>
      <MockComponent />
    </KPIProvider>
  );

  await waitFor(() => {
    expect(screen.getByText(/Demurrage/)).toBeInTheDocument();
  });
});
```

---

## Checklist

- [ ] Backend API running at `NEXT_PUBLIC_API_URL`
- [ ] WebSocket server at `NEXT_PUBLIC_API_WS_URL`
- [ ] `.env.local` configured with backend URLs
- [ ] KPI context migrated to real API
- [ ] Decisions context migrated to real API
- [ ] Vessel tracking WebSocket integrated
- [ ] Simulation engine connected
- [ ] Authentication implemented
- [ ] Error handling in place
- [ ] Tests passing
- [ ] All mock data functions removed

---

## Troubleshooting

### CORS Errors
Add to backend:
```python
# Backend (FastAPI example)
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### WebSocket Connection Fails
- Check `NEXT_PUBLIC_API_WS_URL` is correct
- Verify backend WebSocket server is running
- Check auth token is valid
- Look for CORS/HTTPS issues

### Stale Data in Context
- Ensure context has `refresh()` method to manually refetch
- Add polling with `setInterval` if needed
- Consider using TanStack Query for cache management

---

For questions, refer to [README.md](./README.md) or your backend API documentation.
