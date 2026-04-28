# INTEGRATION_GUIDE.md — Backend Integration Roadmap

**Step-by-step guide to wire the CrudeFlow frontend with the Antigravity LangGraph backend.**

---

## Phase 1: Vessel Context API (Priority 1)

### Objective
Replace mock vessel data with live backend responses.

### Endpoint Spec

```
GET /api/v1/vessel/{mmsi}/context
Authorization: Bearer {token}
```

**Response:**
```json
{
  "vessel": {
    "mmsi": "308182500",
    "name": "Nordic Orion",
    "imo": "9476111",
    "type": "Crude Tanker",
    "flag": "DK",
    "dwt": 299000,
    "current_position": {
      "lat": 25.2854,
      "lng": 55.2708,
      "timestamp": "2024-02-14T10:30:00Z"
    },
    "heading": 270,
    "speed_knots": 12.5,
    "eta": "2024-02-20T14:30:00Z"
  },
  "route_data": {
    "current_route": [
      { "lat": 25.2854, "lng": 55.2708 },
      { "lat": 25.3001, "lng": 54.9999 }
    ],
    "current_route_distance_nm": 35.2,
    "current_route_eta_hours": 144,
    "recommended_route": [
      { "lat": 25.2854, "lng": 55.2708 },
      { "lat": 25.2500, "lng": 55.5000 },
      { "lat": 25.3001, "lng": 54.9999 }
    ],
    "recommended_route_distance_nm": 38.5,
    "recommended_route_eta_hours": 156,
    "route_divergence_reason": "Avoid Horn of Africa piracy zone"
  },
  "kpi_context": {
    "demurrage_hours": 12.5,
    "buffer_days": 2.3,
    "risk_score": 65,
    "cost_of_inaction_usd": 250000,
    "delay_probability": 45
  },
  "ai_recommendation": {
    "recommended_action": "reroute|monitor|delay|none",
    "action_rationale": "Current route crosses high-risk zone...",
    "confidence": 0.87,
    "financial_impact": {
      "time_saved_hours": 12,
      "fuel_cost_delta_usd": 5000,
      "demurrage_reduction_usd": 75000
    }
  },
  "risk_factors": [
    {
      "type": "geopolitical",
      "zone": "Horn of Africa",
      "severity": "high",
      "impact_on_vessel": "0.3 day delay if crossed"
    }
  ]
}
```

### Frontend Changes

**File:** `lib/api-client.ts` (create new file)
```typescript
import { Vessel } from '@/types/vessel';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export async function fetchVesselContext(mmsi: string): Promise<Vessel> {
  const res = await fetch(`${API_BASE}/api/v1/vessel/${mmsi}/context`, {
    headers: {
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
    },
  });
  if (!res.ok) throw new Error(`Vessel context failed: ${res.status}`);
  return res.json();
}
```

**File:** `components/map/maritime-intelligence-map.tsx`
```typescript
import { fetchVesselContext } from '@/lib/api-client';

// Inside component:
useEffect(() => {
  if (selectedVesselId) {
    fetchVesselContext(selectedVesselId)
      .then(vessel => setSelectedVessel(vessel))
      .catch(err => console.error('Failed to load vessel:', err));
  }
}, [selectedVesselId]);
```

**File:** `types/vessel.ts` (update)
```typescript
export interface Vessel {
  // ... existing fields ...
  recommendedRoute: Array<{ lat: number; lng: number }>;
  recommendedAction: 'reroute' | 'monitor' | 'delay' | 'none';
  riskFactors?: Array<{
    type: string;
    zone: string;
    severity: 'low' | 'medium' | 'high';
    impactOnVessel: string;
  }>;
}
```

### Testing
1. Replace mock vessel in `map-data.ts` with API call
2. Click a vessel marker → drawer loads live data
3. Verify KPI values match backend response

---

## Phase 2: Simulation Optimization (Priority 2)

### Objective
Wire simulation control panel to PuLP solver backend.

### Endpoint Spec

```
POST /api/v1/simulate
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "scenario": "baseline",
  "vessel_targets": ["308182500", "308182501"],
  "day": 5.5,
  "sliders": {
    "vessel_speed_reduction": 0.2,
    "port_congestion_factor": 1.45,
    "risk_level": 0.65,
    "refinery_throughput_percent": 0.80,
    "crude_type": "high-sulphur",
    "inventory_capacity_barrels": 320000,
    "discharge_rate_bpd": 5000
  }
}
```

**Response:**
```json
{
  "scenario": "baseline",
  "day": 5.5,
  "projections": {
    "demurrage_hours": 24,
    "buffer_days": 1.2,
    "risk_score": 78,
    "cost_of_inaction_usd": 500000,
    "fleet_impact_summary": "2 vessels delayed, 1 at risk"
  },
  "pareto_frontier": [
    {
      "id": "opt_lowest_cost",
      "label": "Lowest Cost",
      "strategy_summary": "Minimize rerouting, accept slight delay",
      "metrics": {
        "demurrage_cost": 50000,
        "fuel_cost": 35000,
        "total_cost": 85000,
        "delay_hours": 24
      },
      "recommended_actions": [
        { "vessel_id": "308182500", "action": "monitor" }
      ]
    },
    {
      "id": "opt_minimize_delay",
      "label": "Minimize Delay",
      "strategy_summary": "Prioritize speed, reroute as needed",
      "metrics": {
        "demurrage_cost": 25000,
        "fuel_cost": 65000,
        "total_cost": 90000,
        "delay_hours": 6
      },
      "recommended_actions": [
        { "vessel_id": "308182500", "action": "reroute" }
      ]
    }
  ],
  "ghost_vessel_projections": [
    {
      "vessel_id": "308182500",
      "projected_position": { "lat": 25.5000, "lng": 55.0000 },
      "projected_eta_shift_hours": 2.5,
      "projected_buffer_loss_days": 0.5
    }
  ],
  "solver_diagnostics": {
    "slacks": [
      { "constraint": "jetty_capacity", "slack_value": 250 },
      { "constraint": "inventory_buffer", "slack_value": 0 }
    ],
    "dual_values": [
      { "constraint": "jetty_capacity", "dual_value": 1500 },
      { "constraint": "inventory_buffer", "dual_value": 75000 }
    ]
  }
}
```

### Frontend Changes

**File:** `lib/api-client.ts` (add)
```typescript
export async function runSimulation(params: {
  scenario: string;
  day: number;
  sliders: SimulationSliders;
}) {
  const res = await fetch(`${API_BASE}/api/v1/simulate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
    },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(`Simulation failed: ${res.status}`);
  return res.json();
}
```

**File:** `contexts/simulation-context.tsx` (modify)
```typescript
// Inside SimulationProvider:
const updateSlider = useCallback(async (key: string, value: number) => {
  setSliders(prev => ({ ...prev, [key]: value }));
  
  // Trigger backend optimization
  try {
    const response = await runSimulation({
      scenario: activeScenario,
      day: currentDay,
      sliders: { ...sliders, [key]: value },
    });
    
    // Update context with response
    setCascadedKPIs(response.projections);
    setPareto(response.pareto_frontier);
    setDriftProjections(response.ghost_vessel_projections);
  } catch (err) {
    console.error('Simulation failed:', err);
  }
}, [activeScenario, currentDay, sliders]);
```

### Testing
1. Adjust a slider in `/simulation`
2. Verify `POST /api/v1/simulate` is called
3. KPI strip updates with new projections
4. Ghost vessels appear on map overlay

---

## Phase 3: Chat / Copilot (Priority 3)

### Endpoint Spec

```
POST /api/v1/chat
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "message": "Why is Nordic Orion at risk?",
  "vessel_context": {
    "mmsi": "308182500",
    "name": "Nordic Orion",
    "kpi_context": { "risk_score": 65, ... }
  },
  "conversation_id": "conv_123",
  "turn": 1
}
```

**Response:**
```json
{
  "reply": "Nordic Orion is at risk due to the following factors:\n1. Route through Horn of Africa (piracy zone)\n2. Port congestion at destination (45% full)\n3. Projected 2-day delay impacts demurrage exposure\n\nRecommended action: Reroute via Suez Canal (+12 hours fuel cost, saves $75k demurrage).",
  "suggested_actions": ["reroute", "delay_departure", "optimize_discharge"],
  "confidence": 0.92,
  "sources": [
    { "type": "risk_zone", "data": "Horn of Africa piracy zone" },
    { "type": "port_status", "data": "Destination port 45% congested" }
  ]
}
```

### Frontend Changes

**File:** `components/decisions/ai-copilot-panel.tsx`
```typescript
import { useState } from 'react';

export function AICopilotPanel() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (text: string) => {
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
        },
        body: JSON.stringify({
          message: text,
          vessel_context: selectedVessel,
          conversation_id: conversationId,
          turn: messages.length / 2,
        }),
      });

      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      console.error('Chat failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="copilot-panel">
      {/* Message history */}
      {messages.map((msg, i) => (
        <div key={i} className={`message ${msg.role}`}>
          {msg.content}
        </div>
      ))}
      {/* Input */}
      <input
        type="text"
        placeholder="Ask about this decision..."
        onKeyDown={(e) => e.key === 'Enter' && sendMessage(e.target.value)}
      />
    </div>
  );
}
```

---

## Phase 4: Decision Queue (Priority 4)

### Endpoint Spec

```
GET /api/v1/decisions?workspace_id={id}&limit=10
POST /api/v1/decisions/{decision_id}/apply
POST /api/v1/decisions/{decision_id}/reject
```

**GET Response:**
```json
{
  "decisions": [
    {
      "id": "dec_001",
      "vessel_id": "308182500",
      "vessel_name": "Nordic Orion",
      "title": "Reroute via Suez",
      "description": "Avoid Horn of Africa piracy zone",
      "recommended_action": "reroute",
      "rationale": "Current route has 65% risk score. Recommended route reduces risk to 35%.",
      "confidence": 0.92,
      "financial_impact": {
        "fuel_cost_delta": 5000,
        "demurrage_savings": 75000
      },
      "created_at": "2024-02-14T10:30:00Z",
      "status": "pending"
    }
  ]
}
```

### Frontend Changes

**File:** `contexts/decisions-context.tsx`
```typescript
export function DecisionsProvider({ children }) {
  const [decisions, setDecisions] = useState([]);

  useEffect(() => {
    const loadDecisions = async () => {
      const res = await fetch(`${API_BASE}/api/v1/decisions?workspace_id=${workspaceId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      setDecisions(data.decisions);
    };
    loadDecisions();
  }, [workspaceId]);

  const applyDecision = async (decisionId: string) => {
    await fetch(`${API_BASE}/api/v1/decisions/${decisionId}/apply`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    // Remove from queue
    setDecisions(prev => prev.filter(d => d.id !== decisionId));
  };

  return (
    <DecisionsContext.Provider value={{ decisions, applyDecision }}>
      {children}
    </DecisionsContext.Provider>
  );
}
```

---

## Phase 5: Real-Time Updates (Priority 5)

### WebSocket Schema

```
ws://backend:8000/ws/ais
```

**Message from Server:**
```json
{
  "type": "ais_update",
  "vessel_id": "308182500",
  "position": { "lat": 25.2900, "lng": 55.2700 },
  "speed": 12.6,
  "heading": 270,
  "timestamp": "2024-02-14T10:35:00Z"
}
```

### Frontend Changes

**File:** `hooks/use-ais-stream.ts` (create new)
```typescript
export function useAISStream(enabled: boolean = true) {
  const [vessels, setVessels] = useState(new Map());

  useEffect(() => {
    if (!enabled) return;

    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'ais_update') {
        setVessels(prev => new Map(prev).set(data.vessel_id, {
          position: data.position,
          speed: data.speed,
          heading: data.heading,
        }));
      }
    };

    return () => ws.close();
  }, [enabled]);

  return vessels;
}
```

**File:** `components/map/maritime-intelligence-map.tsx`
```typescript
const livePositions = useAISStream(true);

useEffect(() => {
  if (livePositions.has(selectedVesselId)) {
    const pos = livePositions.get(selectedVesselId);
    setSelectedVessel(prev => ({
      ...prev,
      position: pos.position,
      speed: pos.speed,
    }));
  }
}, [livePositions, selectedVesselId]);
```

---

## Integration Checklist

- [ ] **Phase 1**: Implement `GET /vessel/{mmsi}/context`
  - [ ] Update `lib/api-client.ts`
  - [ ] Test vessel detail drawer
  - [ ] Verify KPI values

- [ ] **Phase 2**: Implement `POST /simulate`
  - [ ] Wire sliders to endpoint
  - [ ] Render Pareto frontier
  - [ ] Display ghost vessels

- [ ] **Phase 3**: Implement `POST /chat`
  - [ ] Wire copilot message input
  - [ ] Display AI responses
  - [ ] Store conversation history

- [ ] **Phase 4**: Implement `GET /decisions`
  - [ ] Load decision queue
  - [ ] Handle apply/reject actions
  - [ ] Remove from queue on action

- [ ] **Phase 5**: Implement WebSocket `/ws/ais`
  - [ ] Connect to stream
  - [ ] Update vessel positions in real-time
  - [ ] Refresh map markers

---

## Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
NEXT_PUBLIC_API_TOKEN=<your-bearer-token>
```

---

## Deployment

### Development
```bash
pnpm dev
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
```

### Production
```bash
pnpm build
pnpm start
# Set NEXT_PUBLIC_API_BASE_URL to production backend URL
```

---

## Troubleshooting

| Issue | Solution |
|---|---|
| 401 Unauthorized | Check `NEXT_PUBLIC_API_TOKEN` is valid |
| CORS errors | Backend must include `Access-Control-Allow-Origin: *` |
| WebSocket fails to connect | Verify backend WebSocket is running on correct port |
| Vessel data empty | Ensure backend returns all required fields in response |

---

## Next Steps

1. Start with Phase 1 (Vessel Context) — this is the highest-impact change
2. Move to Phase 2 (Simulation) — enables God Mode
3. Then implement chat, decision queue, and real-time updates
4. Test each phase thoroughly before moving to production

Good luck with integration! 🚀

