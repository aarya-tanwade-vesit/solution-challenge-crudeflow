# CrudeFlow Frontend

**Neural Engine for Maritime Operations (NEMO)** — Enterprise maritime analytics platform for refinery logistics optimization.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (tested with 20.x)
- pnpm 8+

### Setup
```bash
# Install dependencies
pnpm install

# Setup environment
cp .env.example .env.local

# Start dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
app/                              # Next.js 16 App Router
├── page.tsx                      # Marketing landing page
├── company/page.tsx              # About NEMO (scroll-triggered ship animation)
├── dashboard/page.tsx            # Main operational dashboard
├── map/page.tsx                  # Real-time maritime tracking
├── decisions/page.tsx            # AI decision queue
├── analytics/page.tsx            # KPI analytics
├── simulation/page.tsx           # Scenario simulator
├── pricing/page.tsx              # Pricing tiers
├── security/page.tsx             # Data residency & compliance
├── customers/page.tsx            # Customer showcase

components/                       # React components
├── landing/                      # Marketing page sections
├── dashboard/                    # Dashboard widgets (KPIs, decision engine, execution panel)
├── map/                          # Leaflet-based maritime tracking
├── decisions/                    # Decision queue UI
├── analytics/                    # Analytics & reporting
├── simulation/                   # Scenario simulation controls
├── layout/                       # Main layout, sidebar, top bar
├── ui/                           # shadcn/ui components (125+ pre-built)

contexts/                         # React Context (state management)
├── kpi-context.tsx               # ⚠️ Replace mock data with API
├── decisions-context.tsx         # ⚠️ Replace mock decisions with API
├── simulation-context.tsx        # ⚠️ Replace mock scenarios with API
├── user-context.tsx
├── settings-context.tsx
└── ... (other contexts)

types/                            # TypeScript type definitions
lib/                              # Utilities
utils/                            # Maritime utilities & icons
public/                           # Static assets (icon.svg)
```

## 🔌 Backend Integration

### Overview
This frontend currently uses **mock data**. Replace the following to connect to your backend:

### 1️⃣ KPI Data (`contexts/kpi-context.tsx`)
**Status:** Mock data (demurrage, buffer days, risk index, cost of inaction)
**Integration:**
```typescript
// Replace this pattern:
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/kpis`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
const data = await response.json();
setKpiData(data);  // Update context
```
**Expected Response:**
```json
{
  "demurrage": { "value": 1200000, "currency": "USD", "trend": "up" },
  "buffer_days": { "value": 3.8, "unit": "Days", "trend": "down" },
  "risk_index": { "value": 68, "scale": 100, "status": "warning" },
  "cost_of_inaction": { "value": 2450000, "currency": "USD" }
}
```

### 2️⃣ Decision Queue (`contexts/decisions-context.tsx`)
**Status:** Mock decisions with evidence
**Integration:**
```typescript
const decisions = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/decisions?status=pending`)
  .then(r => r.json());
// Optionally: WebSocket for real-time updates
const ws = new WebSocket(`${process.env.NEXT_PUBLIC_API_WS_URL}/decisions`);
ws.onmessage = (event) => {
  const newDecision = JSON.parse(event.data);
  addDecisionToQueue(newDecision);
};
```

### 3️⃣ Vessel Tracking (`components/map/maritime-intelligence-map.tsx`)
**Status:** Static Leaflet markers
**Integration:**
```typescript
// WebSocket: Real-time AIS
const aisStream = new WebSocket(`${process.env.NEXT_PUBLIC_API_WS_URL}/ais`);
aisStream.onmessage = (event) => {
  const { mmsi, lat, lon, speed, heading, eta } = JSON.parse(event.data);
  updateVesselMarker(mmsi, { lat, lon, speed, heading });
};
```

### 4️⃣ Simulation Engine (`contexts/simulation-context.tsx`)
**Status:** Mock scenario outcomes
**Integration:**
```typescript
// POST to optimization backend
const result = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/simulations/execute`, {
  method: 'POST',
  body: JSON.stringify({
    vessels: [...],
    constraints: {
      speed: sliders.speed,
      congestion: sliders.congestion,
      risk_level: sliders.risk
    },
    horizon_days: 24
  })
});
const { kpis, routes, alternatives } = await result.json();
```

### 5️⃣ Analytics (`components/analytics/`)
**Status:** Mock time-series data
**Integration:**
```typescript
// Fetch anomalies, metrics, comparisons
const anomalies = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/analytics/anomalies?start=${startDate}&end=${endDate}`
).then(r => r.json());
```

## 🔐 Environment Variables

Create `.env.local`:
```env
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_API_WS_URL=ws://localhost:8000/ws

# Auth (optional)
NEXT_PUBLIC_AUTH_PROVIDER=oauth2
NEXT_PUBLIC_AUTH_URL=http://localhost:8000/auth

# Analytics (optional)
NEXT_PUBLIC_SENTRY_DSN=
NEXT_PUBLIC_AMPLITUDE_KEY=

# News/Sentiment API (optional, for geopolitical feed)
NEXT_PUBLIC_NEWS_API_KEY=
NEXT_PUBLIC_SENTIMENT_API_URL=
```

See `.env.example` for template.

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (React 19, TypeScript 5.7)
- **Styling:** Tailwind CSS v4, shadcn/ui (125+ components)
- **Animations:** Framer Motion (scroll-triggered, transitions)
- **Maps:** React Leaflet (Maritime tracking)
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts (KPI visualization)
- **State:** React Context API

## 📊 Key Components

### Dashboard (`/dashboard`)
- **KpiCards** — 4 color-coded metrics
- **DecisionEngine** — AI recommendations with alternatives
- **ExecutionPanel** — Cascade of execution steps (rail → truck → refinery intake)
- **OperationsTable** — Live shipment operations
- **MaritimeMapEnterprise** — Vessel tracking map

### Landing (`/`)
- **LandingHero** — Value proposition with stack attribution
- **LandingIndiaMap** — Interactive refinery map (ship journey Hormuz → Mumbai)
- **LandingSentiment** — Geopolitical sentiment dial (−100…+100)
- **LandingStack** — Tech stack (Gemma, LangGraph, NEMO)
- **LandingIndianCustomers** — Customer showcase

### Company (`/company`)
- Scroll-triggered ship animation (problem → solution → resolution)
- Product lineup with CrudeFlow as flagship
- Full contact form

## 🚢 Mock Data Patterns

Currently using context factories for demo data. When replacing with real data:

```typescript
// Before (mock):
function baselineDemurrage() {
  return { value: 1200000, trend: 'up', ... };
}

// After (real):
async function fetchDemurrage(workspace_id: string) {
  const res = await fetch(`/api/kpis/demurrage?workspace=${workspace_id}`);
  return res.json();
}
```

Search for these functions in contexts and replace:
- `baselineDemurrage()`
- `baselineBuffer()`
- `baselineMaritimeRisk()`
- `baselineCostOfInaction()`
- Mock decision fixtures
- Mock vessel positions

## 📦 Build & Deploy

### Development
```bash
pnpm dev              # Start dev server (HMR enabled)
pnpm tsc --noEmit     # Type check
pnpm lint             # ESLint
```

### Production
```bash
pnpm build
pnpm start

# Or Docker:
docker build -t crudeflow-frontend .
docker run -p 3000:3000 crudeflow-frontend
```

### Deploy to Vercel
```bash
vercel deploy
```

## 🧪 Testing

No tests included yet. To add:
```bash
pnpm add -D jest @testing-library/react
```

Example:
```typescript
import { render, screen } from '@testing-library/react';
import { KpiCards } from '@/components/dashboard/kpi-cards';

test('renders demurrage KPI', () => {
  render(<KpiCards />);
  expect(screen.getByText(/Demurrage/)).toBeInTheDocument();
});
```

## 📚 Documentation

- **README.md** (this file) — Project overview & quick reference
- **.env.example** — Environment variable template
- **BACKEND_INTEGRATION.md** — Detailed API endpoint specs
- **ARCHITECTURE.md** — Component patterns & context flows

## ⚠️ Known Limitations

1. **Mock Data Only** — Replace contexts with real API calls
2. **No Authentication** — Add auth layer before production
3. **Static Map Data** — Connect to real AIS/vessel tracking feed
4. **No Caching** — Consider TanStack Query for server state
5. **No Real-time** — Implement WebSocket for live updates

## 🔗 Related Projects

- **Backend (NEMO):** [antigravity-backend](https://github.com/...)
- **ML Pipeline (Gemma + LangGraph):** [nemo-ml](https://github.com/...)
- **Mobile App:** [crudeflow-mobile](https://github.com/...)

## 📞 Support

- **Issues:** GitHub Issues
- **Docs:** See `/docs` folder (or create one during backend integration)
- **Contact:** [Your contact]

---

**Last Updated:** April 2025  
**Version:** 0.1.0  
**Node:** 18+  
**Next.js:** 16.2.0  
**React:** 19.2.4

