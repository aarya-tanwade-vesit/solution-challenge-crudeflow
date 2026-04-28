#!/usr/bin/env bash
set -euo pipefail

# ============================================================================
# NEMO CrudeFlow - Linux/Codespace Orchestrator
# ============================================================================
# Neural Engine for Maritime Operations (NEMO)
# ============================================================================

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND="$ROOT/backend"
FRONTEND="$ROOT/frontend"
API_URL="http://127.0.0.1:8000/api/v1"
APP_URL="http://localhost:3000/dashboard"

# Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
MAGENTA='\033[0;35m'
BLUE='\033[0;34m'
BOLD='\033[1m'
RESET='\033[0m'

clear
echo -e "${BLUE}${BOLD}============================================================================${RESET}"
echo -e "${CYAN}${BOLD}  _   _  ______ __  __  ____   ${GREEN}  _____                _        ______ _                 ${RESET}"
echo -e "${CYAN}${BOLD} | \ | ||  ____|  \/  |/ __ \  ${GREEN} / ____|              | |      |  ____| |                ${RESET}"
echo -e "${CYAN}${BOLD} |  \| || |__  | \  / | |  | | ${GREEN}| |     _ __ _   _  __| | ___  | |__  | | _____      __ ${RESET}"
echo -e "${CYAN}${BOLD} | . \` ||  __| | |\/| | |  | | ${GREEN}| |    | '__| | | |/ _\` |/ _ \ |  __| | |/ _ \ \ /\ / / ${RESET}"
echo -e "${CYAN}${BOLD} | |\  || |____| |  | | |__| | ${GREEN}| |____| |  | |_| | (_| |  __/ | |    | | (_) \ V  V /  ${RESET}"
echo -e "${CYAN}${BOLD} |_| \_||______|_|  |_|\____/  ${GREEN} \_____|_|   \__,_|\__,_|\___| |_|    |_|\___/ \_/\_/   ${RESET}"
echo -e "${BLUE}${BOLD}============================================================================${RESET}"
echo -e "${MAGENTA}${BOLD}          NEURAL ENGINE FOR MARITIME OPERATIONS (NEMO)               ${RESET}"
echo -e "${BLUE}${BOLD}============================================================================${RESET}"
echo

# 1. Environment Sanitization
echo -e "[${YELLOW}1/6${RESET}] ${BOLD}Sanitizing environment...${RESET}"
if command -v pkill >/dev/null 2>&1; then
  pkill -f "crudeflow.*/frontend.*next" >/dev/null 2>&1 || true
  pkill -f "crudeflow.*/backend.*dev_server.py" >/dev/null 2>&1 || true
  pkill -f "crudeflow.*/backend.*uvicorn" >/dev/null 2>&1 || true
fi
echo -e "${GREEN}      Cleaned stale processes.${RESET}"
echo

# 2. Prerequisite Validation
echo -e "[${YELLOW}2/6${RESET}] ${BOLD}Verifying prerequisites...${RESET}"
if [[ ! -d "$BACKEND/.venv" ]]; then
  echo -e "${YELLOW}      Backend virtual environment not found. Creating...${RESET}"
  python3 -m venv "$BACKEND/.venv"
fi

if [[ -x "$BACKEND/.venv/bin/python" ]]; then
  PYTHON="$BACKEND/.venv/bin/python"
else
  PYTHON="$BACKEND/.venv/Scripts/python.exe"
fi

echo -e "${GREEN}      Prerequisites verified.${RESET}"
echo

# 3. Database Initialization
echo -e "[${YELLOW}3/6${RESET}] ${BOLD}Database initialization...${RESET}"
read -p "      Would you like to re-seed the strategic fleet data (y/n)? " SEED
if [[ "$SEED" == "y" || "$SEED" == "Y" ]]; then
  echo -e "${YELLOW}      Seeding database with strategic fleet...${RESET}"
  cd "$BACKEND"
  PYTHONPATH=. "$PYTHON" scripts/seed_db.py >/dev/null 2>&1
  cd "$ROOT"
  echo -e "${GREEN}      Database seeded successfully.${RESET}"
else
  echo -e "${CYAN}      Using existing database state.${RESET}"
fi
echo

# 4. Dependency Alignment
echo -e "[${YELLOW}4/6${RESET}] ${BOLD}Aligning dependencies...${RESET}"
"$PYTHON" -m pip install -r "$BACKEND/requirements.txt" >/dev/null 2>&1
echo -e "${GREEN}      Backend dependencies synchronized.${RESET}"
echo

# 5. Stack Deployment
echo -e "[${YELLOW}5/6${RESET}] ${BOLD}Deploying service stack...${RESET}"
echo -e "${CYAN}      Launching NEMO Backend (Port 8000)...${RESET}"
(
  cd "$BACKEND"
  PYTHONPATH=. "$PYTHON" scripts/dev_server.py
) > /dev/null 2>&1 &
BACKEND_PID=$!

echo -e "${CYAN}      Launching CrudeFlow UI (Port 3000)...${RESET}"
(
  cd "$FRONTEND"
  if [[ ! -d "node_modules" ]]; then
    npm install > /dev/null 2>&1
  fi
  NEXT_PUBLIC_API_URL="$API_URL" npm run dev -- -p 3000
) > /dev/null 2>&1 &
FRONTEND_PID=$!

cleanup() {
  echo -e "\n${BOLD}Shutting down stack...${RESET}"
  kill "$BACKEND_PID" "$FRONTEND_PID" >/dev/null 2>&1 || true
  echo -e "${GREEN}Stack stopped.${RESET}"
}
trap cleanup EXIT INT TERM

echo

# 6. Health & Initialization
echo -e "[${YELLOW}6/6${RESET}] ${BOLD}Initializing intelligence layers...${RESET}"
echo -e "${YELLOW}      Waiting for Neural Engine (API)...${RESET}"
for _ in {1..30}; do
  if curl -fsS "$API_URL/health" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

echo -e "${YELLOW}      Waiting for Intelligence Dashboard (UI)...${RESET}"
for _ in {1..45}; do
  if curl -fsS "http://localhost:3000/dashboard" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done
echo

echo -e "${GREEN}${BOLD}============================================================================${RESET}"
echo -e "${GREEN}${BOLD}  SYSTEM OPERATIONAL - NEMO CRUDEFLOW IS LIVE                        ${RESET}"
echo -e "${GREEN}${BOLD}============================================================================${RESET}"
echo
echo -e "   ${BOLD}Backend API Documentation:${RESET}  ${CYAN}http://127.0.0.1:8000/docs${RESET}"
echo -e "   ${BOLD}Decision Dashboard:      ${RESET}  ${CYAN}http://localhost:3000/dashboard${RESET}"
echo
echo -e "${YELLOW}  Keep this terminal open to maintain server persistence.${RESET}"
echo -e "${YELLOW}  Press Ctrl+C to gracefully stop the stack.${RESET}"
echo

wait
