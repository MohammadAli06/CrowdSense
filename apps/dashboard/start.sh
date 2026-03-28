#!/bin/bash
echo "🚀 Starting CrowdSense..."
echo ""

# Start backend
echo "[1/2] Starting Python backend on port 8000..."
cd backend && pip install -r requirements.txt -q && uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# Start frontend
echo "[2/2] Starting Next.js frontend on port 3000..."
cd .. && npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ CrowdSense is running!"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop both servers."

# Cleanup on exit
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
