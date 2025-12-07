#!/bin/bash
# Kapu Ti - Kill and Restart Servers
# Usage: ./restart.sh [frontend|backend|all]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

kill_frontend() {
    echo -e "${YELLOW}Killing frontend (Next.js on port 3000)...${NC}"
    pkill -f "next-server" 2>/dev/null
    pkill -f "next dev" 2>/dev/null
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    sleep 1
    echo -e "${GREEN}Frontend killed${NC}"
}

kill_backend() {
    echo -e "${YELLOW}Killing backend (WebSocket on port 3002)...${NC}"
    pkill -f "tsx.*server/index.ts" 2>/dev/null
    pkill -f "kapu-ti.*server" 2>/dev/null
    lsof -ti:3002 | xargs kill -9 2>/dev/null
    sleep 1
    echo -e "${GREEN}Backend killed${NC}"
}

start_frontend() {
    echo -e "${YELLOW}Starting frontend...${NC}"
    npm run dev > /tmp/kapu-ti-frontend.log 2>&1 &
    sleep 3
    if lsof -i:3000 > /dev/null 2>&1; then
        echo -e "${GREEN}Frontend running on http://localhost:3000${NC}"
    else
        echo -e "${RED}Frontend failed to start. Check /tmp/kapu-ti-frontend.log${NC}"
    fi
}

start_backend() {
    echo -e "${YELLOW}Starting backend...${NC}"
    npm run server > /tmp/kapu-ti-backend.log 2>&1 &
    sleep 2
    if lsof -i:3002 > /dev/null 2>&1; then
        echo -e "${GREEN}Backend running on ws://localhost:3002${NC}"
    else
        echo -e "${RED}Backend failed to start. Check /tmp/kapu-ti-backend.log${NC}"
    fi
}

status() {
    echo -e "${YELLOW}Server Status:${NC}"
    if lsof -i:3000 > /dev/null 2>&1; then
        echo -e "  Frontend (3000): ${GREEN}RUNNING${NC}"
    else
        echo -e "  Frontend (3000): ${RED}STOPPED${NC}"
    fi
    if lsof -i:3002 > /dev/null 2>&1; then
        echo -e "  Backend  (3002): ${GREEN}RUNNING${NC}"
    else
        echo -e "  Backend  (3002): ${RED}STOPPED${NC}"
    fi
}

case "${1:-all}" in
    frontend|fe|f)
        kill_frontend
        start_frontend
        ;;
    backend|be|b|server)
        kill_backend
        start_backend
        ;;
    kill)
        kill_frontend
        kill_backend
        echo -e "${GREEN}All servers killed${NC}"
        ;;
    status|s)
        status
        ;;
    all|*)
        kill_frontend
        kill_backend
        echo ""
        start_backend
        start_frontend
        echo ""
        status
        ;;
esac
