# Documentation Index

All documentation files for the CrudeFlow frontend project.

## 📖 Getting Started

Start here if you're new to the project:

1. **[README.md](./README.md)** — Project overview, quick start, tech stack
2. **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** — Local setup, development workflow, common tasks

## 🔌 Backend Integration

When connecting to backend API:

1. **[BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md)** — Detailed API endpoint specs, code examples, WebSocket patterns
2. **[MOCK_DATA_AUDIT.md](./MOCK_DATA_AUDIT.md)** — List of all mock data, prioritized replacement order, search patterns

## 📁 Architecture & Design

Understanding how the code is organized:

- **Project Structure** (see [README.md](./README.md#-project-structure))
- **Component Inventory** (see [README.md](./README.md#component-inventory))
- **Context Flow** (see [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md#context-migration))

## 🚀 Deployment & Production

- **Build Commands:** `pnpm build` then `pnpm start`
- **Environment Variables:** Copy `.env.example` to `.env.local`
- **Deployment:** Vercel (recommended) or Docker

See [README.md](./README.md#-build--deploy) for details.

## 🐛 Troubleshooting

Common issues and solutions:

- **Setup Issues:** See [SETUP_GUIDE.md](./SETUP_GUIDE.md#common-issues--solutions)
- **Integration Issues:** See [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md#troubleshooting)
- **Backend Integration:** See [MOCK_DATA_AUDIT.md](./MOCK_DATA_AUDIT.md)

## 📋 Checklists

- **Backend Integration:** [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md#checklist)
- **Mock Data Replacement:** [MOCK_DATA_AUDIT.md](./MOCK_DATA_AUDIT.md#mock-data-removal-checklist)

## 🔑 Key Files

### Configuration
- `package.json` — Dependencies and scripts
- `tsconfig.json` — TypeScript settings
- `next.config.mjs` — Next.js configuration
- `tailwind.config.ts` — Tailwind CSS theming
- `.env.example` — Environment variable template
- `.gitignore` — Git ignore rules

### Source Code
- `app/` — Pages and routing
- `components/` — React components
- `contexts/` — State management (React Context)
- `lib/` — Utilities
- `types/` — TypeScript type definitions
- `utils/` — Shared utilities

### Public Assets
- `public/icon.svg` — App icon

## 📚 External Resources

- **Next.js:** https://nextjs.org/docs
- **React:** https://react.dev
- **TypeScript:** https://www.typescriptlang.org/docs
- **Tailwind CSS:** https://tailwindcss.com
- **shadcn/ui:** https://ui.shadcn.com
- **Framer Motion:** https://www.framer.com/motion

## 🤝 Contributing

Before contributing:
1. Read [README.md](./README.md) for project overview
2. Read [SETUP_GUIDE.md](./SETUP_GUIDE.md) for local setup
3. Follow existing code patterns in `components/`
4. Add TypeScript types for new features
5. Test locally before submitting changes

## 📞 Support

For issues or questions:
1. Check the relevant documentation file above
2. Search GitHub Issues
3. Ask in team Slack/Discord

---

## Quick Navigation

| I want to... | Go to... |
|---|---|
| Get started locally | [SETUP_GUIDE.md](./SETUP_GUIDE.md) |
| Connect to backend | [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) |
| See project overview | [README.md](./README.md) |
| Find mock data to replace | [MOCK_DATA_AUDIT.md](./MOCK_DATA_AUDIT.md) |
| Deploy to production | [README.md](./README.md#-build--deploy) |
| Learn tech stack | [README.md](./README.md#-tech-stack) |
| Understand components | [README.md](./README.md#component-inventory) |
| Add a new page | [SETUP_GUIDE.md](./SETUP_GUIDE.md#add-a-new-page) |
| Debug an issue | [SETUP_GUIDE.md](./SETUP_GUIDE.md#debugging) |
| Configure environment | [README.md](./README.md#-environment-variables) |

---

**Last Updated:** April 2025  
**Frontend Version:** 0.1.0
