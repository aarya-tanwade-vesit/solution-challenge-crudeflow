# Windows Startup Scripts - Complete Reference

## Files Provided

| File | Type | Purpose |
|------|------|---------|
| **START.bat** | Batch | Click once to run everything (Recommended) |
| **START.ps1** | PowerShell | Advanced version with colors & features |
| **RUN_ON_WINDOWS.txt** | Text | Simple 3-step guide (read first!) |
| **QUICK_START_WINDOWS.md** | Markdown | Detailed troubleshooting guide |

---

## Quick Comparison

### START.bat (Recommended)
- ✅ Works on ALL Windows versions (XP+)
- ✅ Double-click to run
- ✅ No setup needed
- ✅ Plain text output
- ✅ Handles all errors

### START.ps1 (Advanced)
- ✅ Windows 10/11 only
- ✅ Colored output
- ✅ Better error messages
- ✅ Auto-opens browser with fallback
- ⚠️ Requires script execution policy change (one-time)

---

## Which One Should You Use?

### If You're Unsure → Use START.bat
- Just double-click it
- No configuration needed
- Works everywhere

### If You Want Pretty Output → Use START.ps1
- More colorful
- Better formatted
- Requires 1-minute setup

---

## 30-Second Setup

### Option 1: Batch (No Setup)
1. Find `START.bat` in project folder
2. Double-click it
3. Wait for "Dev server ready"
4. Done! Browser opens at http://localhost:3000

### Option 2: PowerShell (Requires Setup)
1. Open PowerShell as Administrator
2. Copy-paste this one command:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
3. Type `Y` and press Enter
4. Now you can: Right-click `START.ps1` → Run with PowerShell

---

## What Gets Automated

Both scripts do this automatically:

```
✓ Check Node.js installed
✓ Check pnpm installed (install if missing)
✓ Run pnpm install (get all dependencies)
✓ Create .env.local (copy from template)
✓ Start dev server on port 3000
✓ Open browser automatically
```

---

## First Run (Takes 2-3 minutes)
- Downloads all npm packages (~500MB)
- Compiles Next.js
- Starts server

## Subsequent Runs (Takes 10-15 seconds)
- Packages already cached
- Dev server starts instantly

---

## Troubleshooting Quick Lookup

| Problem | Solution |
|---------|----------|
| "Node.js not found" | Download https://nodejs.org/, install, check "Add to PATH" |
| Terminal closes | Node.js not installed, see above |
| Port 3000 in use | Edit `.env.local`, change `PORT=3001` |
| Browser doesn't open | Go to http://localhost:3000 manually |
| PowerShell won't run | Run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` |

---

## After Server Starts

### You'll See:
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

### Browser Opens Showing:
- CrudeFlow landing page
- Interactive map
- Dashboard components

---

## Environment Configuration

After first run, edit `.env.local`:

```env
# Optional: Update these for your backend
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_API_WS_URL=ws://localhost:8000/ws
```

---

## To Stop the Server

**Batch:** Press `Ctrl + C` → Type `Y` → Press Enter

**PowerShell:** Press `Ctrl + C` → Type `Y` → Press Enter

---

## Multiple Developers on Same PC?

Each developer can:
1. Extract to their own folder
2. Run `START.bat` from their folder
3. Change port in `.env.local` if needed (3000, 3001, 3002, etc.)

---

## For Your AI IDE

When working locally:
1. Run `START.bat` first
2. Server runs on http://localhost:3000
3. Files auto-reload (HMR enabled)
4. Open `.env.local` to connect backend
5. Edit components in `app/` and `components/` folders

---

## Reference Docs

- **RUN_ON_WINDOWS.txt** — Start here if new to this
- **QUICK_START_WINDOWS.md** — Detailed setup & troubleshooting
- **README.md** — Full project overview
- **BACKEND_INTEGRATION.md** — Connect to your backend
- **MOCK_DATA_AUDIT.md** — Replace mock data with real API

---

## What's Inside the Scripts?

Both scripts:
1. Test for Node.js
2. Test for pnpm
3. Run `pnpm install`
4. Copy `.env.example` → `.env.local`
5. Run `pnpm dev`
6. Display success message

All fully automated. You just double-click.

---

## Common Errors & Fixes

### "pnpm: command not found"
```bash
npm install -g pnpm
# Then run START.bat again
```

### "Cannot find path"
- Make sure you're in the project folder
- Or right-click inside folder and select "Open in terminal"

### "Something like 'ENOENT: no such file'"
- Make sure `package.json` exists in the folder
- Make sure `.env.example` exists (should be in root)

---

## Pro Tips

1. **Create Desktop Shortcut**
   - Right-click `START.bat`
   - Send To → Desktop (Create shortcut)
   - Now click desktop shortcut to run

2. **Run Multiple Instances**
   - Copy entire folder to new location
   - Change port in `.env.local` for each
   - Run `START.bat` in each folder

3. **Background Mode**
   - Pin terminal window to taskbar
   - Run `START.bat`
   - Minimize to taskbar
   - Dev server keeps running

---

**Everything is automated. Just double-click and wait for the browser to open.**

Questions? See **QUICK_START_WINDOWS.md**
