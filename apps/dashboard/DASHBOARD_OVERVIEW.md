# CrowdSense Dashboard — Frontend & Backend Overview

## 📋 Project Summary

**CrowdSense** is a real-time crowd density monitoring system that uses **YOLOv8 person detection**, **optical flow analysis**, and **zone-based alerts** to track and visualize crowd patterns in monitored areas. The system combines a **Next.js frontend** with a **FastAPI Python backend**.

---

## 🎨 Frontend (Next.js / TypeScript / React)

### Stack & Dependencies
- **Framework**: Next.js 16.2.1
- **UI Library**: React 19.2.4
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + PostCSS
- **Visualizations**: Recharts 3.8.0 (charts & graphs)
- **Animations**: Framer Motion 12.38.0 (smooth transitions)
- **Icons**: React Icons 5.6.0
- **Version**: ps5 (0.1.0)

### Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout wrapper
│   ├── page.tsx            # Home/landing page
│   ├── globals.css         # Global styles
│   └── dashboard/
│       └── page.tsx        # Main dashboard page (real-time display)
│
├── components/
│   └── ui/
│       └── radar-effect.tsx  # Animated radar component
│
└── hooks/
    └── useCrowdSocket.ts    # WebSocket connection manager
```

### Key Components & Features

#### **1. `useCrowdSocket.ts` — WebSocket Connection Hook**

**What it does:**
- Establishes and maintains a WebSocket connection to the Python backend at `ws://localhost:8000/ws`
- Automatically reconnects every 3 seconds if the connection drops
- Listens for real-time crowd data updates

**Data received (CrowdPayload):**
```typescript
{
  frame: string;              // Base64-encoded JPEG frame from camera
  total_count: number;        // Total persons detected in current frame
  zones: {
    A: { count, status, color },  // Top-left quadrant
    B: { count, status, color },  // Top-right quadrant
    C: { count, status, color },  // Bottom-left quadrant
    D: { count, status, color }   // Bottom-right quadrant
  },
  heatmap: string[][];        // 4x6 grid of density levels ("low", "med", "high", "critical")
  alerts: AlertItem[];        // Array of triggered alerts
  crowd_history: number[];    // Last 60 crowd count measurements
  flow_vectors: string[][];   // Optical flow direction arrows (visual representation)
  flow_magnitudes: number[][]; // Optical flow magnitude values
  mock_mode: boolean;         // Indicates if backend is in mock mode (no camera)
}
```

**Key Features:**
- Auto-reconnect logic with cleanup on component unmount
- Ignores malformed frames gracefully
- Updates React state independently for each data type

#### **2. `dashboard/page.tsx` — Main Dashboard Display**

**What it renders:**

1. **Real-time Video Feed**
   - Displays the annotated frame from camera with bounding boxes around detected persons
   - Shows a dark mock frame if no camera is available

2. **Crowd Count & Trend**
   - Shows total person count
   - Charts crowd history over time (last 60 frames) using Recharts LineChart

3. **Zone Status Heatmap**
   - 4 quadrants (A, B, C, D) representing different areas
   - Each zone shows:
     - **Count**: Number of people detected
     - **Status**: Safe (green) | Warning (yellow) | Critical (red)
   - Thresholds:
     - Safe: < 6 persons
     - Warning: 6–15 persons
     - Critical: ≥ 16 persons

4. **6×4 Density Heatmap Grid**
   - Visual representation of crowd density across the monitored space
   - Color intensity indicates density level (low → green, med → yellow, high → orange, critical → red)

5. **Optical Flow Visualization**
   - Shows motion direction and magnitude across the frame
   - Helps identify crowd movement patterns

6. **Alert Panel**
   - Scrollable list of recent alerts (max 20)
   - Each alert shows:
     - **Timestamp**: When the alert was triggered
     - **Severity**: High (red) | Med (yellow) | Low (green)
     - **Message**: Details about the alert (which zone, what triggered it)

7. **Connection Status**
   - Green indicator when connected to backend
   - Shows if system is in mock mode

#### **3. UI Components**

- **radar-effect.tsx**: Animated radar component (likely used for connection status visualization)
- **Smooth animations** via Framer Motion on alerts and zone updates

---

## 🐍 Backend (FastAPI / Python)

### Stack & Dependencies
- **Framework**: FastAPI (async web framework)
- **ASGI Server**: Uvicorn
- **AI/ML**: Ultralytics YOLOv8 (person detection)
- **Computer Vision**: OpenCV Python
- **Utilities**: NumPy, WebSockets, Python-Multipart

### Project Structure

```
backend/
├── main.py              # FastAPI app, WebSocket server, health check
├── detector.py          # YOLOv8 detection + optical flow calculation
├── zone_manager.py      # Frame quadrant division & density zones
├── alert_manager.py     # Alert rule engine & history
├── requirements.txt     # Python dependencies
└── yolov8n.pt          # Pre-trained YOLOv8 Nano model (~6.3 MB)
```

### Core Modules

#### **1. `main.py` — FastAPI Server & WebSocket Stream**

**Endpoints:**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/` | GET | Health check → `{"status": "CrowdSense backend running"}` |
| `/snapshot` | GET | Returns a single processed JPEG frame from camera |
| `/ws` | WebSocket | Real-time continuous data stream |

**WebSocket Stream (`/ws`):**

**Flow:**
1. Client connects via WebSocket
2. Backend initializes:
   - **AlertManager** instance (tracks state across frames)
   - **Video capture** (real webcam or mock mode fallback)
3. Main loop runs continuously:
   - Reads a frame from camera (or generates mock data)
   - Runs YOLOv8 person detection
   - Divides frame into 4 zones and counts persons per zone
   - Computes optical flow (motion vectors)
   - Evaluates alert rules (AlertManager)
   - Encodes frame as base64 JPEG
   - Sends JSON payload with all data to client

**Performance:**
- Depends on camera FPS, typically 10–30 FPS
- Frame history limited to last 60 counts (sliding window)

**Mock Mode:**
- If no webcam detected, generates random person detections
- Creates dark frame with mock bounding boxes
- Generates synthetic optical flow

---

#### **2. `detector.py` — Person Detection & Optical Flow**

**YOLOv8 Detection:**

```python
detect_persons(frame: np.ndarray) → dict
```

- **Model**: YOLOv8n (Nano - smallest variant, ~6.3 MB)
- **Input**: Video frame as NumPy array
- **Process**:
  - Loads model on first call (auto-downloads if missing)
  - Runs inference with `classes=[0]` (person class only)
  - Extracts bounding boxes: (x1, y1, x2, y2)
  - Returns confidence score for each detection

**Output:**
```python
{
    "detections": [
        {
            "x1": 100, "y1": 150,
            "x2": 200, "y2": 350,
            "confidence": 0.95
        },
        # ...
    ],
    "total_count": 5
}
```

**Optical Flow (Farneback):**

```python
compute_optical_flow(frame: np.ndarray) → dict
```

- **Algorithm**: Farneback (OpenCV's `cv2.calcOpticalFlowFarneback()`)
- **Grid**: Divides frame into 5×4 cells
- **Output**: 
  - **flow_vectors**: 8-directional arrows (N, NE, E, SE, S, SW, W, NW)
  - **flow_magnitudes**: Motion magnitude (0–1 scale)

**Drawing:**
- `draw_boxes()`: Renders green bounding boxes + confidence labels on frame

---

#### **3. `zone_manager.py` — Crowd Density Zoning**

**Zone Division:**

Frame is split into **4 quadrants** (A–D):

```
+-------+-------+
|   A   |   B   | (Top)
+-------+-------+
|   C   |   D   | (Bottom)
+-------+-------+
(Left) (Right)
```

**How it Works:**

1. Takes all person detections (bounding boxes)
2. Calculates center point of each bounding box: `(cx, cy) = ((x1+x2)/2, (y1+y2)/2)`
3. Assigns each person to a zone based on center point position
4. Counts persons per zone

**Status Thresholds:**

| Count | Status | Color |
|-------|--------|-------|
| 0–5 | Safe | Green |
| 6–15 | Warning | Yellow |
| ≥ 16 | Critical | Red |

**Heatmap Grid:**

Returns a **4 rows × 6 columns** grid (24 cells) where each cell represents density level:
- "low" (0–4 persons)
- "med" (5–10 persons)
- "high" (11–20 persons)
- "critical" (≥ 21 persons)

---

#### **4. `alert_manager.py` — Intelligent Alert System**

**What it does:**
- Tracks state across frames
- Evaluates 3 alert rules
- Maintains history of last 20 alerts

**Alert Rules:**

| Rule | Trigger | Severity | Example |
|------|---------|----------|---------|
| **1. Zone Escalation** | Zone crosses from Safe/Warning → Critical | High | "Zone A exceeded safe limit — 18 persons" |
| **2. Rapid Buildup** | Total crowd +5 persons in <3 seconds | High | Sudden crowd surge |
| **3. Sustained Critical** | Zone stays Critical for >10 seconds | Med/High | Prolonged overcrowding |

**State Tracking:**
- `_prev_zone_status`: Previous zone status (to detect transitions)
- `_critical_since`: Timestamp when zone became critical (for Rule 3)
- `_count_history`: Last 5 seconds of crowd counts (for Rule 2)

**Alert Structure:**
```python
@dataclass
class Alert:
    id: int              # Unique ID per alert
    timestamp: str       # HH:MM:SS format
    message: str         # Human-readable description
    severity: str        # "High" | "Med" | "Low"
    zone: str            # Which zone (A, B, C, D, or "SYSTEM")
```

---

## 🔄 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  Camera / Mock Mode                                         │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
    ┌──────────────────────────────┐
    │  detector.py                 │
    │  - YOLOv8n Detection         │
    │  - Optical Flow (Farneback)  │
    │  - Draw Boxes on Frame       │
    └──────┬───────────────────────┘
           │ (detections, frame, flow)
           ▼
    ┌──────────────────────────────┐
    │  zone_manager.py             │
    │  - Assign to A/B/C/D         │
    │  - Count per zone            │
    │  - Generate 4x6 heatmap      │
    └──────┬───────────────────────┘
           │ (zones, heatmap)
           ▼
    ┌──────────────────────────────┐
    │  alert_manager.py            │
    │  - Track state               │
    │  - Evaluate 3 rules          │
    │  - Store 20 alerts           │
    └──────┬───────────────────────┘
           │ (alerts)
           ▼
    ┌──────────────────────────────┐
    │  main.py WebSocket           │
    │  - Encode frame (base64)     │
    │  - Package all data          │
    │  - Send JSON payload         │
    └──────┬───────────────────────┘
           │
           │ (WebSocket JSON)
           ▼
    ┌──────────────────────────────┐
    │  Frontend (Next.js)          │
    │  - useCrowdSocket Hook       │
    │  - dashboard/page.tsx        │
    │  - Real-time visualization   │
    └──────────────────────────────┘
```

---

## 🚀 Running the System

### Backend (Python)

1. Install dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. Run the FastAPI server:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

   - Server listens on `http://localhost:8000`
   - WebSocket at `ws://localhost:8000/ws`

### Frontend (Next.js)

1. Install dependencies:
   ```bash
   cd ..
   pnpm install
   ```

2. Run the dev server:
   ```bash
   pnpm dev
   ```

   - Frontend runs on `http://localhost:3000`
   - Automatically connects to backend WebSocket

---

## 📊 Key Metrics & Calculations

### Crowd Count Tracking
- **Window**: 60 frames (sliding)
- **Update Rate**: Per frame (FPS-dependent)
- **History**: Sent to frontend for trend charting

### Zone Density
- **Grid Size**: 4 × 6 (24 cells)
- **Granularity**: Variable based on frame resolution (default 640×480)
- **Color Mapping**:
  - low: 0–4 persons → Green
  - med: 5–10 persons → Yellow
  - high: 11–20 persons → Orange
  - critical: ≥ 21 persons → Red

### Optical Flow
- **Grid**: 5 columns × 4 rows
- **Direction**: 8-directional (N, NE, E, SE, S, SW, W, NW)
- **Magnitude**: 0–1 (normalized)

### Alert Thresholds
| Metric | Threshold |
|--------|-----------|
| Rapid buildup | +5 persons in <3s |
| Sustained critical | >10 seconds in critical state |
| Zone critical min | ≥ 16 persons |

---

## 🛠️ Configuration Points

### Frontend (`useCrowdSocket.ts`)
- **WebSocket URL**: `ws://localhost:8000/ws` (hardcoded)
- **Reconnect Delay**: 3000ms

### Backend (`main.py`)
- **CORS Origin**: `http://localhost:3000` (hardcoded)
- **Frame History Max**: 60 frames
- **Frame Dimensions (Mock)**: 640×480

### Zone Manager (`zone_manager.py`)
- **Zone Names**: A, B, C, D (quadrants)
- **Status Thresholds**:
  - Safe: < 6
  - Warning: 6–15
  - Critical: ≥ 16

### Alert Manager (`alert_manager.py`)
- **Max Alerts Stored**: 20
- **Rapid Buildup Threshold**: +5 persons in 3 seconds
- **Sustained Critical Threshold**: 10 seconds

---

## 🔍 Performance Considerations

| Aspect | Details |
|--------|---------|
| **Detection Model** | YOLOv8n (Nano) — fastest, ~6.3 MB |
| **Inference Speed** | Depends on frame size & hardware; typically 10–50ms per frame |
| **WebSocket Overhead** | Base64 encoding adds ~33% to frame size |
| **Memory Use** | Single model instance + frame buffers (~50–100 MB) |
| **Scalability** | Single camera input; multi-camera would need architecture change |

---

## 🎯 Future Enhancements

- [ ] Multi-camera support
- [ ] Configurable zone thresholds via UI
- [ ] Database logging of alerts & crowd trends
- [ ] Machine learning-based crowd anomaly detection
- [ ] Custom alert rules builder
- [ ] Export reports (CSV, PDF)
- [ ] Mobile responsive UI
- [ ] Push notifications for critical alerts

---

## 📝 Summary Table

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Frontend** | Next.js + React + TypeScript | Real-time dashboard, WebSocket client, visualization |
| **Backend** | FastAPI + Python + OpenCV | API server, camera processing, AI inference |
| **Detection** | YOLOv8n (Nano) | Person detection from video frames |
| **Zoning** | Custom algorithm | Quadrant-based crowd density calculation |
| **Alerts** | Stateful rule engine | Multi-rule alert generation & history |
| **Communication** | WebSocket | Real-time bidirectional data stream |
| **Styling** | Tailwind CSS | Frontend styling & responsive design |
| **Animations** | Framer Motion | Smooth transitions & visual effects |

---

**Last Updated**: March 26, 2026
