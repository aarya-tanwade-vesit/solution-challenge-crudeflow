# 🚀 Quick Reference for AI IDE

Fast lookup guide for the CrudeFlow frontend project.

## 🎯 Quick Start (30 seconds)

```bash
pnpm install
cp .env.example .env.local
pnpm dev
# → Open http://localhost:3000
```

## 📁 Project Map

```
app/           Pages (routing)
components/    React components (organized by feature)
contexts/      State management (React Context)
lib/ utils/    Utilities & helpers
public/        Static assets
```

## 🔗 Important Commands

```bash
pnpm dev         # Start dev server (HMR)
pnpm build       # Build for production
pnpm start       # Run production build
pnpm lint        # Check code style
pnpm tsc --noEmit # Type check
```

## 📖 Documentation Quick Links

| Need | File |
|------|------|
| Project overview | README.md |
| Local setup | SETUP_GUIDE.md |
| Backend integration | BACKEND_INTEGRATION.md |
| Mock data to replace | MOCK_DATA_AUDIT.md |
| All docs | DOCS_INDEX.md |
| Export summary | EXPORT_READY.md |

## 🔌 Backend Integration Points

| What | Where | Status |
|-----|-------|--------|
| KPIs | `contexts/kpi-context.tsx` | ⚠️ Mock → Replace with `/api/kpis` |
| Decisions | `contexts/decisions-context.tsx` | ⚠️ Mock → Replace with `/api/decisions` |
| Vessels | `components/map/maritime-intelligence-map.tsx` | ⚠️ Mock → Replace with WebSocket `/ws/ais` |
| Simulation | `contexts/simulation-context.tsx` | ⚠️ Mock → Replace with `/api/simulations/execute` |
| Analytics | `components/analytics/` | ⚠️ Mock → Replace with `/api/analytics/` |

## 🛠️ Common Tasks

### Add a New Page
```typescript
// app/new-page/page.tsx
export const metadata = { title: 'New Page' };
export default function NewPage() {
  return <div>Content</div>;
}
```

### Use a Context
```typescript
import { useKPI } from '@/contexts/kpi-context';

function MyComponent() {
  const { kpiData, isLoading } = useKPI();
  return <div>{kpiData?.demurrage?.value}</div>;
}
```

### Add UI Component
```typescript
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

export function MyCard() {
  return (
    <Card>
      <CardHeader>Title</CardHeader>
      <CardContent>
        <Button>Click</Button>
      </CardContent>
    </Card>
  );
}
```

### Fetch from Backend
```typescript
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/endpoint`);
const data = await res.json();
```

### Use Tailwind Classes
```typescript
<div className="px-4 md:px-6 lg:px-8 bg-white dark:bg-gray-900">
  Responsive + dark mode
</div>
```

## 🎨 Design System

### Colors (Semantic)
```css
/* In globals.css */
--background: #0a0a0a
--foreground: #fafafa
--primary: #3b82f6
--danger: #ef4444
--warning: #f59e0b
--success: #10b981
--muted: #52525b
```

### Typography
- **Headings:** Geist sans (`font-sans`)
- **Body:** Geist sans (`font-sans`)
- **Code:** Geist Mono (`font-mono`)

### Components (shadcn/ui)
All 125+ shadcn components available in `components/ui/`

## 🚨 Common Issues

| Issue | Solution |
|-------|----------|
| Port 3000 in use | `lsof -i :3000` → `kill -9 <PID>` |
| Module not found | Use `@/` prefix for absolute imports |
| Types undefined | `pnpm tsc --noEmit` to check errors |
| Env vars undefined | Restart dev server after `.env.local` change |
| Map not rendering | Check Leaflet CSS imported + container height |
| WebSocket won't connect | Verify backend running + URL correct |

## 📋 Context Inventory

```
contexts/index.tsx              Main provider wrapper
├── kpi-context.tsx            KPI metrics + cascade logic
├── decisions-context.tsx      Decision queue + recommendations
├── simulation-context.tsx     Simulation sliders + results
├── settings-context.tsx       User settings + preferences
├── user-context.tsx           Session + authentication
├── workspace-context.tsx      Multi-workspace support
├── system-status-context.tsx  System health + alerts
├── activity-feed-context.tsx  Recent events
├── navigation-context.tsx     Current page + sidebar state
└── index.tsx                  AppProviders wrapper
```

## 🗂️ Component Organization

```
components/
├── landing/              Marketing sections
│   ├── landing-hero.tsx
│   ├── landing-india-map.tsx (REAL MAP with ship animation)
│   ├── landing-sentiment.tsx
│   └── ...
├── dashboard/            Dashboard widgets
│   ├── kpi-cards.tsx     4-card KPI strip
│   ├── decision-engine.tsx
│   ├── execution-panel.tsx (6-step cascade)
│   └── ...
├── map/                  Leaflet map
│   ├── maritime-intelligence-map.tsx
│   ├── vessel-detail-drawer.tsx
│   └── ...
├── decisions/            Decision UI
├── analytics/            Analytics UI
├── simulation/           Simulation UI
├── layout/               Layout infrastructure
├── ui/                   shadcn/ui components (125+)
└── shared/               Shared utilities
```

## 🔐 Environment Setup

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_API_WS_URL=ws://localhost:8000/ws
NEXT_PUBLIC_AUTH_PROVIDER=oauth2
```

Only `NEXT_PUBLIC_*` is visible in browser.

## 🧪 Testing Pattern

```typescript
import { render, screen } from '@testing-library/react';
import { MyComponent } from '@/components/my-component';

test('renders component', () => {
  render(<MyComponent />);
  expect(screen.getByText(/text/)).toBeInTheDocument();
});
```

## 📊 Data Flow

```
User Action
    ↓
Component Handler
    ↓
Context Update (useContext hook)
    ↓
Re-render affected components
    ↓
UI Updates
```

## 🔄 API Call Pattern

```typescript
try {
  const res = await fetch(endpoint, { headers, body });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  setData(data);
} catch (err) {
  console.error('[v0] API Error:', err);
  setError(err.message);
}
```

## 🎯 Pages Overview

| Page | Route | Purpose |
|------|-------|---------|
| Landing | `/` | Marketing entry |
| Company | `/company` | NEMO branding + scroll-triggered ship |
| Dashboard | `/dashboard` | Main operational hub |
| Map | `/map` | Full-screen maritime tracking |
| Decisions | `/decisions` | AI decision queue |
| Simulation | `/simulation` | "God Mode" scenario simulator |
| Analytics | `/analytics` | Data analysis + reporting |
| Pricing | `/pricing` | Refinery-tiered pricing (INR) |
| Security | `/security` | Compliance + data residency |
| Customers | `/customers` | Customer showcase |
| Settings | `/settings` | User preferences + workspace config |

## ⚡ Performance Tips

- Use `next/dynamic` for heavy components (maps, charts)
- Memoize expensive calculations in contexts
- Keep contexts focused (one per feature)
- Use `React.memo` for components with many re-renders
- Lazy load routes with dynamic imports

## 🚀 Deployment Quick Steps

```bash
# 1. Build
pnpm build

# 2. Test production build locally
pnpm start

# 3. Deploy to Vercel
vercel deploy

# Or Docker
docker build -t crudeflow-frontend .
docker run -p 3000:3000 crudeflow-frontend
```

## 📞 Resources

- **Docs:** See `DOCS_INDEX.md`
- **Backend Integration:** `BACKEND_INTEGRATION.md`
- **Mock Data List:** `MOCK_DATA_AUDIT.md`
- **Setup Help:** `SETUP_GUIDE.md`

---

**Print this or bookmark for fast reference!** 🚀

**Last Updated:** April 2025
