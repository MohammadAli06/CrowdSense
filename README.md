# CrowdSense — AI-Powered Crowd Safety System

Real-time crowd density monitoring and safety alert system using YOLOv8 computer vision, WebSocket streaming, and a Next.js dashboard.

![CrowdSense Dashboard](screenshot-placeholder.png)

---

## 🏗️ Architecture

```
┌────────────────────┐     WebSocket (ws://localhost:8000/ws)     ┌────────────────────┐
│   Python Backend   │ ◄──────────────────────────────────────►  │   Next.js Frontend │
│   FastAPI + YOLO   │          JSON + base64 frames              │   React Dashboard  │
│   Port 8000        │                                            │   Port 3000        │
└────────────────────┘                                            └────────────────────┘
        │
        ▼
   Webcam (cv2)
   or Mock Mode
```

## 📁 Project Structure

```
ps5/
├── backend/
│   ├── main.py              # FastAPI server — WebSocket + REST endpoints
│   ├── detector.py          # YOLOv8 person detection + optical flow
│   ├── zone_manager.py      # Zone density calculation + heatmap
│   ├── alert_manager.py     # Smart alert system (3 rules)
│   └── requirements.txt     # Python dependencies
├── src/
│   ├── app/
│   │   ├── globals.css      # Dark theme + animations
│   │   ├── layout.tsx       # Root layout with Inter font
│   │   ├── page.tsx         # Landing page with radar hero
│   │   └── dashboard/
│   │       └── page.tsx     # Live monitoring dashboard
│   ├── components/
│   │   └── ui/
│   │       └── radar-effect.tsx  # Animated radar component
│   └── hooks/
│       └── useCrowdSocket.ts    # WebSocket hook for real-time data
├── start.sh                 # Linux/Mac startup script
├── start.bat                # Windows startup script
└── README.md
```

## 🚀 Setup & Running

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.9+
- Webcam (optional — falls back to mock data)

### Install Dependencies

```bash
# Frontend
npm install

# Backend
cd backend
pip install -r requirements.txt
```

### Run the Project

**Option 1 — Windows:**
```bash
start.bat
```

**Option 2 — Linux/Mac:**
```bash
chmod +x start.sh
./start.sh
```

**Option 3 — Manual:**
```bash
# Terminal 1: Backend
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2: Frontend
npm run dev
```

Then open **http://localhost:3000**

## 📊 Dashboard Cards

| Card | Data Source | Update Rate |
|------|-----------|-------------|
| **Live Feed** | Webcam + YOLOv8 bounding boxes (base64 JPEG) | ~10 FPS |
| **Density Heatmap** | 6×4 grid computed from detection positions | ~10 FPS |
| **Zone Status** | 4 quadrants with Safe/Warning/Critical thresholds | ~10 FPS |
| **Alert Feed** | Rule-based alerts (escalation, rapid buildup, sustained critical) | Event-driven |
| **Crowd Count Graph** | Rolling 60-point history via Recharts | ~10 FPS |
| **Optical Flow** | Farneback optical flow sampled on 5×4 grid | ~10 FPS |

## 🔔 Alert Rules

1. **Zone Escalation** — Fires when any zone crosses from Warning → Critical
2. **Rapid Buildup** — Fires when total count increases by >5 in under 3 seconds
3. **Sustained Critical** — Fires when a zone stays Critical for >10 seconds

## 🎯 Key Features

- **YOLOv8 Detection** — Auto-downloads `yolov8n.pt` on first run
- **Mock Mode Fallback** — If no webcam is available, generates realistic mock data
- **WebSocket Auto-Reconnect** — Frontend reconnects every 3 seconds if connection drops
- **Connection Status** — Navbar shows green/red pulsing dot based on WebSocket state
- **Framer Motion Animations** — All cards animate in; alerts slide in from top

## ⚙️ Configuration

| Setting | Value | Location |
|---------|-------|----------|
| Backend port | 8000 | `backend/main.py` |
| Frontend port | 3000 | `package.json` (Next.js default) |
| WebSocket URL | `ws://localhost:8000/ws` | `src/hooks/useCrowdSocket.ts` |
| Frame rate | ~10 FPS (100ms interval) | `backend/main.py` |
| Alert buffer | Last 20 alerts | `backend/alert_manager.py` |
| History length | 60 data points | `backend/main.py` |
| Zone thresholds | 0–5 Safe, 6–15 Warning, 16+ Critical | `backend/zone_manager.py` |
