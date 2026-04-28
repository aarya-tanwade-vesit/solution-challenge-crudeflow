# Setup & Development Guide

Quick reference for getting the project running locally and preparing for backend integration.

## Prerequisites

- **Node.js:** 18.x or higher (test with `node --version`)
- **pnpm:** 8.x or higher (install via `npm install -g pnpm`)
- **Git:** For version control

## Getting Started (5 minutes)

```bash
# 1. Clone repository
git clone <repo-url>
cd crudeflow-frontend

# 2. Install dependencies
pnpm install

# 3. Setup environment
cp .env.example .env.local

# 4. Start dev server
pnpm dev

# 5. Open browser
# → http://localhost:3000
```

## Project Structure Quick Reference

```
app/                    # Pages (routing)
├── page.tsx           # Landing page (/)
├── company/           # Company page (/company)
├── dashboard/         # Dashboard (/dashboard)
├── map/               # Map (/map)
├── decisions/         # Decisions (/decisions)
├── simulation/        # Simulation (/simulation)
└── ...

components/           # Reusable components
├── landing/          # Landing page sections
├── dashboard/        # Dashboard widgets
├── map/              # Map components
├── layout/           # Layout (sidebar, navbar)
├── ui/               # UI primitives (shadcn/ui)
└── ...

contexts/             # React Context (state)
├── kpi-context.tsx   # ⚠️ Mock → Replace with API
├── decisions-context.tsx
├── simulation-context.tsx
└── ...

lib/                  # Utilities
utils/               # Shared utilities
types/               # TypeScript types (create if needed)
```

## Environment Variables

Copy `.env.example` to `.env.local` and update:

```env
# Backend API URLs
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_API_WS_URL=ws://localhost:8000/ws

# Optional: Add your own API keys, auth URLs, etc.
```

**Important:** Only `NEXT_PUBLIC_*` variables are available in the browser. Server-only secrets go in `.env` (without `NEXT_PUBLIC_`).

## Development Workflow

### Start Dev Server
```bash
pnpm dev
```
- HMR enabled (hot module replacement)
- Open http://localhost:3000
- Changes auto-refresh in browser

### Type Checking
```bash
pnpm tsc --noEmit
```
Verify TypeScript errors without building.

### Linting
```bash
pnpm lint
```
Check for code style issues (ESLint).

### Build & Test Production Build
```bash
pnpm build
pnpm start
```
- Build: ~30 seconds
- Start: Listens on http://localhost:3000
- Test production behavior locally

## Key Technologies

| Tech | Version | Purpose |
|------|---------|---------|
| Next.js | 16.2.0 | React framework + routing |
| React | 19.2.4 | UI library |
| TypeScript | 5.7.3 | Type safety |
| Tailwind CSS | 4.2.0 | Styling |
| shadcn/ui | Latest | UI components |
| Framer Motion | 12.38.0 | Animations |
| React Leaflet | 5.0.0 | Maps |
| Recharts | 2.15.0 | Charts |

## Common Tasks

### Add a New Page
1. Create `app/new-page/page.tsx`
2. Add export default function
3. Export metadata for SEO
4. Route is auto-created

Example:
```typescript
// app/new-page/page.tsx
export const metadata = { title: 'New Page' };

export default function NewPage() {
  return <div>New page content</div>;
}
```

### Add a New Component
1. Create `components/my-component.tsx`
2. Keep components small & reusable
3. Accept props + export as default

Example:
```typescript
interface MyComponentProps {
  title: string;
  onClick?: () => void;
}

export function MyComponent({ title, onClick }: MyComponentProps) {
  return <button onClick={onClick}>{title}</button>;
}
```

### Use Existing UI Components
```typescript
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

export function MyCard() {
  return (
    <Card>
      <CardHeader>Title</CardHeader>
      <CardContent>
        <Button>Click me</Button>
      </CardContent>
    </Card>
  );
}
```

All 125+ shadcn/ui components available. See `components/ui/` for full list.

### Connect to Context (State)
```typescript
import { useKPI } from '@/contexts/kpi-context';

export function MyComponent() {
  const { kpiData, isLoading } = useKPI();

  if (isLoading) return <div>Loading...</div>;
  return <div>{kpiData.demurrage.value}</div>;
}
```

### Fetch Data from Backend
```typescript
import { useEffect, useState } from 'react';

export function MyComponent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/endpoint`);
      const json = await res.json();
      setData(json);
    };
    fetchData();
  }, []);

  return <div>{data?.value}</div>;
}
```

### Add Tailwind Classes
```typescript
// Responsive classes
<div className="px-4 md:px-6 lg:px-8">
  Responsive padding
</div>

// Dark mode (dark: prefix)
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">
  Dark mode support
</div>

// Hover/Focus states
<button className="hover:bg-gray-100 focus:outline-none focus:ring-2">
  Button with states
</button>
```

## Backend Integration Checklist

Before connecting to backend:

- [ ] Backend API is running (check with `curl http://localhost:8000/api/health`)
- [ ] WebSocket server is running (check `/ws` endpoint)
- [ ] `.env.local` has correct backend URLs
- [ ] Read `BACKEND_INTEGRATION.md` for endpoint specs
- [ ] Start replacing mock data in `contexts/` with API calls
- [ ] Test each integration point one by one

## Debugging

### Check Component Props
```typescript
import { useEffect } from 'react';

export function MyComponent(props: any) {
  useEffect(() => {
    console.log('[v0] MyComponent props:', props);
  }, [props]);

  return <div>Check console</div>;
}
```

### Check Context State
```typescript
import { useKPI } from '@/contexts/kpi-context';

export function MyComponent() {
  const kpiState = useKPI();
  console.log('[v0] KPI state:', kpiState);

  return <div>Check console</div>;
}
```

### Check Network Requests
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by XHR (API requests)
4. Check Response/Preview tabs

### Check WebSocket Connection
```typescript
useEffect(() => {
  const ws = new WebSocket(`${process.env.NEXT_PUBLIC_API_WS_URL}/ais`);
  ws.onopen = () => console.log('[v0] WebSocket connected');
  ws.onerror = (err) => console.error('[v0] WebSocket error:', err);
  return () => ws.close();
}, []);
```

## Performance

### Check Build Size
```bash
pnpm build
# → Outputs `.next` folder size
```

### Profile Performance
```typescript
// In a component
useEffect(() => {
  const start = performance.now();
  // ... your code
  console.log(`[v0] Operation took ${performance.now() - start}ms`);
}, []);
```

### Analyze Bundle
```bash
# Install analyzer
pnpm add -D @next/bundle-analyzer

# Add to next.config.mjs:
# import withBundleAnalyzer from '@next/bundle-analyzer';
# const withAnalyzer = withBundleAnalyzer({
#   enabled: process.env.ANALYZE === 'true',
# });
# export default withAnalyzer(nextConfig);

# Run:
# ANALYZE=true pnpm build
```

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| **Port 3000 already in use** | `lsof -i :3000` → `kill -9 <PID>` |
| **Module not found error** | Check import path starts with `@/` or `./` |
| **Types not recognized** | Run `pnpm tsc --noEmit` → check errors |
| **Environment variables undefined** | Restart dev server after `.env.local` changes |
| **Map not rendering** | Check Leaflet CSS is imported + container has height |
| **WebSocket won't connect** | Check backend is running + URL is correct |
| **API returns 401 Unauthorized** | Check auth token is valid in localStorage |

## Resources

- **Next.js Docs:** https://nextjs.org/docs
- **React Docs:** https://react.dev
- **Tailwind Docs:** https://tailwindcss.com/docs
- **shadcn/ui:** https://ui.shadcn.com
- **TypeScript:** https://www.typescriptlang.org/docs
- **Framer Motion:** https://www.framer.com/motion
- **React Leaflet:** https://react-leaflet.js.org

## Getting Help

1. Check `README.md` for project overview
2. Read `BACKEND_INTEGRATION.md` for API details
3. Search GitHub Issues for similar problems
4. Ask in team Slack/Discord channel

---

**Last Updated:** April 2025
