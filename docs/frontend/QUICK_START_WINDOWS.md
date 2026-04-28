# CrudeFlow - Windows Quick Start Guide

## One-Click Startup

### Option 1: Using Batch File (Recommended - Works on All Windows Versions)

1. **Navigate to project folder**
   - Right-click inside the project folder
   - Select "Open in terminal" or "Open in PowerShell"
   
2. **Double-click `START.bat`**
   - The script will automatically:
     - Check Node.js installation
     - Install/verify pnpm
     - Install dependencies
     - Create `.env.local` if missing
     - Start the development server
   - Browser should open automatically at `http://localhost:3000`

3. **Stop the server**
   - Press `Ctrl + C` in the terminal
   - Type `y` and press Enter to confirm

### Option 2: Using PowerShell (Windows 10/11 - More Features)

**First time only:**
```powershell
# Run PowerShell as Administrator
# Then enable script execution:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then:
1. Right-click `START.ps1`
2. Select "Run with PowerShell"
3. Or from terminal: `.\START.ps1`

The PowerShell version has:
- Colored output
- Better error handling
- Auto-open browser with fallback
- Same functionality as batch file

---

## What Each Script Does

### Installation & Setup (Automatic)
- ✅ Checks if Node.js is installed
- ✅ Installs pnpm if missing
- ✅ Runs `pnpm install` to get dependencies
- ✅ Creates `.env.local` from template
- ✅ Starts dev server on port 3000
- ✅ Opens browser automatically

### Output Example
```
========================================================================
  CRUDEFLOW - Neural Engine for Maritime Operations
  One-Click Startup Script
========================================================================

[1/5] Checking Node.js installation...
OK: Node.js v20.10.0 found
[2/5] Checking pnpm installation...
OK: pnpm 8.14.0 found
[3/5] Installing dependencies...
Dependencies already installed. Updating...
OK: Dependencies ready
[4/5] Setting up environment variables...
OK: .env.local already exists
[5/5] Starting development server...

========================================================================
  Development server starting...
  Open browser at: http://localhost:3000
  Press Ctrl+C to stop the server
========================================================================
```

---

## Prerequisites

### Node.js Installation
1. Download from: https://nodejs.org/
2. Choose **LTS version** (recommended)
3. Run installer
4. **Important:** Check ✅ "Add to PATH"
5. **Restart** your terminal/PowerShell

**Verify installation:**
```bash
node --version
npm --version
```

---

## Troubleshooting

### "Node.js is not installed or not in PATH"
**Solution:**
1. Download Node.js from https://nodejs.org/
2. Run installer and check "Add to PATH"
3. Restart your terminal/PowerShell
4. Try again

### "pnpm install fails"
**Try:**
```bash
npm install -g pnpm
pnpm install
```

### "Port 3000 already in use"
The dev server won't start. Either:
- Kill the process using port 3000
- Or modify `.env.local` to use different port:
  ```env
  PORT=3001
  ```

### "Cannot open browser automatically"
The server will still start. Manually open: http://localhost:3000

### Script won't run (PowerShell)
Enable script execution first:
```powershell
# Run PowerShell as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## Manual Setup (If Scripts Don't Work)

```bash
# 1. Install dependencies
pnpm install

# 2. Create environment file
copy .env.example .env.local

# 3. Start dev server
pnpm dev

# 4. Open browser at http://localhost:3000
```

---

## Environment Variables

Edit `.env.local` to configure:

```env
# Backend API (change these for your backend)
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_API_WS_URL=ws://localhost:8000/ws

# Optional: Analytics
NEXT_PUBLIC_SENTRY_DSN=
NEXT_PUBLIC_AMPLITUDE_KEY=
```

See `.env.example` for all available options.

---

## Common Commands

```bash
# Start dev server
pnpm dev

# Build for production
pnpm build

# Run production build
pnpm start

# Type checking
pnpm tsc --noEmit

# Linting
pnpm lint
```

---

## File Structure After Setup

```
crudeflow-frontend/
├── node_modules/              (installed by pnpm)
├── .env.local                 (created automatically)
├── .next/                     (build cache)
├── START.bat                  (Windows batch script)
├── START.ps1                  (PowerShell script)
├── package.json
├── tsconfig.json
├── next.config.mjs
├── app/                       (pages)
├── components/                (React components)
├── contexts/                  (state management)
└── ... (other project files)
```

---

## Next Steps

1. **Verify setup works:**
   - Open http://localhost:3000
   - You should see the CrudeFlow landing page

2. **For backend integration:**
   - Read `BACKEND_INTEGRATION.md`
   - Update `.env.local` with your backend URLs
   - Replace mock data in contexts with API calls

3. **For development:**
   - Edit files in `app/` and `components/`
   - Changes auto-reload (HMR enabled)
   - Check browser console for errors

---

## Still Having Issues?

1. Check `README.md` for general project info
2. See `SETUP_GUIDE.md` for detailed setup
3. Read `BACKEND_INTEGRATION.md` for API integration
4. Check `MOCK_DATA_AUDIT.md` for data replacement guide

---

**Last Updated:** April 2026  
**Node.js Version:** 18+  
**Package Manager:** pnpm 8+  
**Windows:** XP SP3, Vista, 7, 8, 8.1, 10, 11
