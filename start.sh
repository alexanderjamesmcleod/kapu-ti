#!/bin/bash
# Kapu Ti - Start both servers
# Usage: ./start.sh

cd "$(dirname "$0")"

echo "🍵 Starting Kapu Ti..."

# Kill any existing instances
pkill -f "tsx server/index.ts" 2>/dev/null
pkill -f "next dev.*kapu-ti" 2>/dev/null
sleep 1

# Start WebSocket server in background
echo "Starting WebSocket server on port 3002..."
npx tsx server/index.ts &
WS_PID=$!

# Wait for WS server to be ready
sleep 2

# Start Next.js
echo "Starting Next.js on port 3000..."
npm run dev -- -p 3000 &
NEXT_PID=$!

echo ""
echo "✅ Kapu Ti is running!"
echo "   Frontend: http://localhost:3000"
echo "   WebSocket: ws://localhost:3002"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for either to exit, then cleanup
trap "echo ''; echo 'Shutting down...'; kill $WS_PID $NEXT_PID 2>/dev/null; exit" SIGINT SIGTERM

wait
