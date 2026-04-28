# QUICK_START.md — 5-Minute Setup Guide

Get CrudeFlow running locally in 5 minutes.

---

## Prerequisites

- Node.js 18+ (check: `node --version`)
- pnpm package manager (install: `npm install -g pnpm`)
- Git

---

## 1. Clone & Install (2 min)

```bash
# Clone repository
git clone https://github.com/your-org/crudeflow.git
cd crudeflow

# Install dependencies
pnpm install
```

## 2. Create Environment File (1 min)

Create `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
NEXT_PUBLIC_API_TOKEN=demo-token
```

## 3. Start Development Server (1 min)

```bash
pnpm dev
```

Open http://localhost:3000 → Dashboard loads with mock data

## 4. Explore (1 min)

- **Dashboard:** KPI strip + embedded map
- **/map:** Full-screen map, click vessel → detail drawer
- **/simulation:** Sliders to trigger "God Mode" (blue border)
- **/decisions:** Decision queue (mock recommendations)
- **/analytics:** Scenario analysis

---

## Common Commands

```bash
# Development (with HMR)
pnpm dev

# Type check
pnpm tsc --noEmit

# Lint
pnpm lint

# Build for production
pnpm build

# Start production server
pnpm start

# View bundle analysis
pnpm build  # Look at terminal output
```

---

## Stop the Server

Press `Ctrl+C` in terminal.

---

## Next Steps

1. **Familiarize with the UI** → explore all pages
2. **Read README.md** → understand architecture
3. **Review INTEGRATION_GUIDE.md** → learn how to connect backend
4. **Start integration** → implement Phase 1 (Vessel Context API)

---

## Troubleshooting

| Problem | Solution |
|---|---|
| `pnpm: command not found` | Install pnpm: `npm install -g pnpm` |
| Port 3000 already in use | `pnpm dev --port 3001` |
| Map not loading | Ensure Leaflet CDN is accessible (firewall?) |
| Build fails | Delete `node_modules` and `.next`, run `pnpm install` again |

---

## Questions?

Check the documentation:
- **README.md** — Project overview
- **FRONTEND_MANIFEST.md** — Feature checklist
- **INTEGRATION_GUIDE.md** — Backend integration steps
- **ARCHITECTURE.md** — Deep dive on design patterns

Good luck! 🚀
