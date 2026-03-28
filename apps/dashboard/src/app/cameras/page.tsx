"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardShell } from "@/components/sidebar";

/* ── Types ────────────────────────────────────────────────────────────── */
interface CameraNode {
  id: string;
  name: string;
  location: string;
  rtsp: string;
  status: "ACTIVE" | "INACTIVE";
  lastSeen: string;
  safeLimit: number;
  warning: number;
  critical: number;
}

const CAMERAS: CameraNode[] = [
  { id: "C1", name: "Main Entrance A-1",  location: "Ground Floor, North Gate",   rtsp: "rtsp://192.168.1.5...",  status: "ACTIVE",   lastSeen: "0.4s AGO",  safeLimit: 15, warning: 45, critical: 80 },
  { id: "C2", name: "Storage Unit 4",     location: "Level -1, Secured Bay",       rtsp: "rtsp://192.168.1.12...", status: "INACTIVE", lastSeen: "14h AGO",   safeLimit: 10, warning: 25, critical: 50 },
  { id: "C3", name: "Outdoor East Lot",   location: "Parking Area C, High Mast",   rtsp: "rtsp://192.168.1.10...", status: "ACTIVE",   lastSeen: "1.2s AGO",  safeLimit: 100, warning: 200, critical: 350 },
];

export default function CamerasPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [nodeId, setNodeId] = useState("");
  const [location, setLocation] = useState("");
  const [rtspUrl, setRtspUrl] = useState("rtsp://");
  const [testing, setTesting] = useState(false);

  function testConnection() {
    setTesting(true);
    setTimeout(() => setTesting(false), 1200);
  }

  const activeCount = CAMERAS.filter(c => c.status === "ACTIVE").length;

  return (
    <DashboardShell
      title="Camera Management"
      searchPlaceholder="Search cameras..."
      topRight={
        <>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#5a7a8a", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            SURVEILLANCE_NODE_ALPHA
          </span>
          <button className="cs-btn cs-btn-cyan" style={{ gap: 6 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Camera
          </button>
        </>
      }
      statusItems={[
        { label: "All Systems Operational", color: "#10b981" },
        { label: "NODE_ID: 0x82F4",         color: "#5a7a8a" },
      ]}
    >
      <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Provision panel */}
        <motion.div className="cs-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00c8d4" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v4l3 3"/>
            </svg>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>Provision New Sensor Node</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 14 }}>
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, color: "#00c8d4", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>
                Node Identifier
              </label>
              <input
                type="text"
                value={nodeId}
                onChange={e => setNodeId(e.target.value)}
                placeholder="e.g. North Lobby Entrance"
                className="cs-input"
                id="cs-node-id"
              />
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, color: "#00c8d4", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>
                Geographic Location
              </label>
              <div style={{ position: "relative" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#5a7a8a" strokeWidth="2"
                  style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}>
                  <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="Level 4, Zone B"
                  className="cs-input"
                  style={{ paddingLeft: 28 }}
                  id="cs-geo-location"
                />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, color: "#00c8d4", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>
                Stream Protocol (RTSP)
              </label>
              <input
                type="text"
                value={rtspUrl}
                onChange={e => setRtspUrl(e.target.value)}
                placeholder="rtsp://192.168.1.104:554/live"
                className="cs-input"
                style={{ fontFamily: "monospace" }}
                id="cs-rtsp-url"
              />
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ fontSize: 11, color: "#5a7a8a", maxWidth: 380 }}>
              Ensure the RTSP stream is accessible from the local network segment. Provisioning takes approximately 120ms after validation.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={testConnection}
                className="cs-btn cs-btn-ghost"
                disabled={testing}
                style={{ gap: 6 }}
                id="cs-test-connection-btn"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 6l11 6 11-6"/><path d="M1 18l11-6 11 6"/>
                </svg>
                {testing ? "Testing…" : "Test Connection"}
              </button>
              <button className="cs-btn cs-btn-cyan" id="cs-save-camera-btn">SAVE CAMERA</button>
            </div>
          </div>
        </motion.div>

        {/* Grid header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#c8d8e8", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Active Surveillance Grid
            </div>
            <div style={{ fontSize: 11, color: "#5a7a8a", marginTop: 2 }}>
              {activeCount} Nodes Operating • 1 Alert Active
            </div>
          </div>
          {/* View toggle */}
          <div style={{ display: "flex", gap: 4 }}>
            <button
              onClick={() => setViewMode("grid")}
              style={{
                padding: "6px 8px", borderRadius: 6, border: "1px solid",
                borderColor: viewMode === "grid" ? "#00c8d4" : "rgba(30,60,80,0.7)",
                background: viewMode === "grid" ? "rgba(0,200,212,0.1)" : "transparent",
                color: viewMode === "grid" ? "#00c8d4" : "#5a7a8a", cursor: "pointer",
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
            </button>
            <button
              onClick={() => setViewMode("list")}
              style={{
                padding: "6px 8px", borderRadius: 6, border: "1px solid",
                borderColor: viewMode === "list" ? "#00c8d4" : "rgba(30,60,80,0.7)",
                background: viewMode === "list" ? "rgba(0,200,212,0.1)" : "transparent",
                color: viewMode === "list" ? "#00c8d4" : "#5a7a8a", cursor: "pointer",
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
                <line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/>
                <line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Camera grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
          {CAMERAS.map((cam, idx) => (
            <motion.div
              key={cam.id}
              className={`cs-camera-card ${cam.status === "INACTIVE" ? "alert" : ""}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
            >
              <div style={{ padding: "14px 16px" }}>
                {/* Header row */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    {/* Camera thumbnail */}
                    <div style={{
                      width: 56, height: 40, borderRadius: 6, flexShrink: 0,
                      background: cam.status === "ACTIVE" ? "#0d1f2e" : "#151515",
                      border: `1px solid ${cam.status === "ACTIVE" ? "rgba(0,200,212,0.2)" : "rgba(255,77,109,0.2)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      overflow: "hidden",
                    }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={cam.status === "ACTIVE" ? "#3a5a6a" : "#3a2a2a"} strokeWidth="1.5">
                        <path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/>
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{cam.name}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#5a7a8a", marginTop: 2 }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                        </svg>
                        {cam.location}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          fontSize: 9, fontWeight: 700, letterSpacing: "0.08em",
                          color: cam.status === "ACTIVE" ? "#10b981" : "#ff4d6d",
                          border: `1px solid ${cam.status === "ACTIVE" ? "rgba(16,185,129,0.3)" : "rgba(255,77,109,0.3)"}`,
                          borderRadius: 4, padding: "1px 6px",
                          background: cam.status === "ACTIVE" ? "rgba(16,185,129,0.08)" : "rgba(255,77,109,0.08)",
                        }}>
                          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
                          {cam.status}
                        </span>
                        <span style={{ fontSize: 9, color: "#3a5a6a", fontFamily: "monospace" }}>{cam.rtsp}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: 10, color: "#5a7a8a", fontFamily: "monospace", textAlign: "right" }}>
                    {cam.status === "INACTIVE" ? (
                      <span style={{ color: "#ff4d6d" }}>DISCONNECTED: {cam.lastSeen}</span>
                    ) : (
                      <>LAST_SEEN: {cam.lastSeen}</>
                    )}
                  </div>
                </div>

                {/* Limits row */}
                <div style={{
                  display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8,
                  borderTop: "1px solid rgba(30,60,80,0.5)", paddingTop: 12, marginBottom: 12,
                }}>
                  {[
                    { label: "Safe Limit", value: cam.safeLimit, color: "#c8d8e8" },
                    { label: "Warning",    value: cam.warning,   color: "#fbbf24" },
                    { label: "Critical",   value: cam.critical,  color: "#ff4d6d" },
                  ].map(item => (
                    <div key={item.label} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: item.color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{item.value}</div>
                    </div>
                  ))}
                </div>

                <button
                  className="cs-btn cs-btn-ghost"
                  style={{ width: "100%", justifyContent: "center", fontSize: 11, letterSpacing: "0.08em" }}
                >
                  SET AS ACTIVE
                </button>
              </div>
            </motion.div>
          ))}

          {/* System metrics mini cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <motion.div
              className="cs-card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6, justifyContent: "center" }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00c8d4" strokeWidth="1.5">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
              </svg>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#00c8d4", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                System Throughput
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#fff" }}>42.8 GB/s</div>
              <div style={{ fontSize: 10, color: "#5a7a8a" }}>Stream stability is at 99.4%</div>
            </motion.div>

            <motion.div
              className="cs-card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6, justifyContent: "center", borderColor: "rgba(249,115,22,0.3)" }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#f97316" strokeWidth="1.5"/>
                <line x1="12" y1="9" x2="12" y2="13" stroke="#f97316" strokeWidth="2"/>
                <line x1="12" y1="17" x2="12.01" y2="17" stroke="#f97316" strokeWidth="2"/>
              </svg>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#f97316", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Pending Latency
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#fff" }}>240ms</div>
              <div style={{ fontSize: 10, color: "#5a7a8a" }}>Buffer optimization recommended</div>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
