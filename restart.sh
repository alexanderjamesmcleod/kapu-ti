#!/bin/bash
# Restart Kapu Ti servers
# Usage: ./restart.sh [--server-only]

cd /home/alex/ai-kitchen/projects/kapu-ti

echo "🛑 Stopping servers..."
fuser -k 3100/tcp 2>/dev/null
fuser -k 3102/tcp 2>/dev/null
sleep 1

echo "🚀 Starting WebSocket server on port 3102..."
npm run server > /tmp/kapu-ti-server.log 2>&1 &
sleep 2

if [ "$1" != "--server-only" ]; then
  echo "🌐 Starting Next.js dev server on port 3100..."
  npm run dev > /tmp/kapu-ti-dev.log 2>&1 &
  sleep 3
fi

echo ""
echo "✅ Servers started! (all rooms cleared)"
echo "   Frontend: http://localhost:3100"
echo "   WebSocket: ws://localhost:3102"
echo ""
echo "📝 Logs:"
echo "   Server: tail -f /tmp/kapu-ti-server.log"
echo "   Dev: tail -f /tmp/kapu-ti-dev.log"
echo ""
