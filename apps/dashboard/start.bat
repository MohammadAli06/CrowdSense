@echo off
echo 🚀 Starting CrowdSense...
echo.

echo [1/2] Starting Python backend on port 8000...
start "CrowdSense Backend" cmd /k "cd backend && pip install -r requirements.txt -q && uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

echo [2/2] Starting Next.js frontend on port 3000...
start "CrowdSense Frontend" cmd /k "npm run dev"

echo.
echo ✅ CrowdSense is running!
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:8000
echo.
