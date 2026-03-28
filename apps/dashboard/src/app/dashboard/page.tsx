"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { DashboardShell } from "@/components/sidebar";
import { useCrowdSocket } from "@/hooks/useCrowdSocket";
import type { ZoneInfo, AlertItem } from "@/hooks/useCrowdSocket";

const ZONE_ORDER = ["A", "B", "C", "D"] as const;

function zoneStatusBadge(status: string) {
  if (status === "Critical") return "cs-badge cs-badge-crit";
  if (status === "Warning")  return "cs-badge cs-badge-warn";
  return "cs-badge cs-badge-safe";
}

function severityClass(s: string) {
  if (s === "High") return "cs-badge cs-badge-high";
  if (s === "Med")  return "cs-badge cs-badge-med";
  return "cs-badge cs-badge-low";
}

function heatColor(v: string) {
  if (v === "critical") return "#ef4444";
  if (v === "high")     return "#f97316";
  if (v === "med")      return "#fbbf24";
  return "#10b981";
}

export default function DashboardPage() {
  const [time, setTime] = useState("");
  const { frame, totalCount, zones, heatmap, alerts, crowdHistory, flowVectors, flowMagnitudes, isConnected, mockMode } = useCrowdSocket();

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const chartData = useMemo(() => crowdHistory.map((c, i) => ({ t: `${i}s`, c })), [crowdHistory]);
  const zoneCards = ZONE_ORDER.map(z => {
    const info: ZoneInfo = zones[z] ?? { count: 0, status: "Safe", color: "green" };
    return { name: `Zone ${z}`, ...info };
  });

  const highCount = alerts.filter(a => a.severity === "High").length;

  return (
    <DashboardShell
      title="Dashboard"
      searchPlaceholder="Global system search..."
      topRight={
        <div className="flex items-center gap-2 text-[11px] font-mono" style={{ color: isConnected ? "#10b981" : "#ff4d6d" }}>
          <span className="w-2 h-2 rounded-full animate-pulse-dot" style={{ background: isConnected ? "#10b981" : "#ff4d6d" }} />
          {isConnected ? (mockMode ? "Mock Mode" : "Camera Feed Active") : "Reconnecting…"}
        </div>
      }
      statusItems={[
        { label: `GET /ws/crowd • ${isConnected ? "200 OK" : "503"}`, color: isConnected ? "#10b981" : "#ff4d6d" },
        { label: time, color: "#5a7a8a" },
      ]}
    >
      <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20, flex: 1 }}>

        {/* ── Stat row ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          <StatCard
            label="Total Detected"
            value={totalCount.toLocaleString()}
            sub={<span style={{ color: "#10b981" }}>↑ Live count</span>}
            icon="👥"
          />
          <StatCard
            label="High Severity Alerts"
            value={String(highCount)}
            sub={highCount > 0 ? <span style={{ color: "#ff4d6d" }}>⚠ Requires immediate action</span> : <span style={{ color: "#10b981" }}>All clear</span>}
            icon="⚠"
            accent="#ff4d6d"
          />
          <StatCard
            label="Active Zones"
            value={String(ZONE_ORDER.length)}
            sub={<span style={{ color: "#5a7a8a" }}>● All monitoring</span>}
            icon="📍"
          />
        </div>

        {/* ── Main grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
          {/* Live feed */}
          <motion.div className="cs-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <h2 style={{ fontSize: 13, fontWeight: 600, color: "#c8d8e8" }}>Live Feed</h2>
              <span className="cs-badge" style={{ background: "rgba(0,200,212,0.12)", color: "#00c8d4", border: "1px solid rgba(0,200,212,0.3)" }}>
                {totalCount} detected
              </span>
            </div>
            <div style={{ position: "relative", aspectRatio: "16/9", background: "#08111d", borderRadius: 8, overflow: "hidden" }}>
              {frame ? (
                <img src={`data:image/jpeg;base64,${frame}`} alt="Live camera" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid #00c8d4", borderTopColor: "transparent", animation: "spin 1s linear infinite" }} />
                  <span style={{ fontSize: 12, color: "#5a7a8a" }}>Connecting to backend…</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Zone Status */}
            <motion.div className="cs-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <h2 style={{ fontSize: 13, fontWeight: 600, color: "#c8d8e8", marginBottom: 10 }}>Zone Status</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {zoneCards.map(z => (
                  <div key={z.name} style={{ background: "#08111d", border: "1px solid rgba(30,60,80,0.6)", borderRadius: 8, padding: "10px 12px" }}>
                    <div style={{ fontSize: 11, color: "#5a7a8a", fontWeight: 600, marginBottom: 4 }}>{z.name}</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 4 }}>{z.count}</div>
                    <span className={zoneStatusBadge(z.status)}>{z.status}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Heatmap */}
            <motion.div className="cs-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <h2 style={{ fontSize: 13, fontWeight: 600, color: "#c8d8e8", marginBottom: 6 }}>Density Heatmap</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 4 }}>
                {(heatmap.length > 0 ? heatmap : Array(4).fill(Array(6).fill("low")))
                  .flat()
                  .map((v: string, i: number) => (
                    <div
                      key={i}
                      title={`Density: ${v}`}
                      style={{
                        aspectRatio: "1",
                        borderRadius: 4,
                        background: heatColor(v),
                        opacity: v === "critical" ? 0.95 : v === "high" ? 0.75 : v === "med" ? 0.6 : 0.4,
                        transition: "background 0.5s, opacity 0.5s",
                      }}
                    />
                  ))}
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 8, fontSize: 10, color: "#5a7a8a" }}>
                {[["#10b981", "Low"], ["#fbbf24", "Med"], ["#f97316", "High"], ["#ef4444", "Critical"]].map(([c, l]) => (
                  <span key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: c, display: "inline-block" }} />{l}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Bottom row ── */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 16 }}>
          {/* Chart */}
          <motion.div className="cs-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 style={{ fontSize: 13, fontWeight: 600, color: "#c8d8e8", marginBottom: 4 }}>Live Crowd Count — Last 60s</h2>
            <p style={{ fontSize: 11, color: "#5a7a8a", marginBottom: 12 }}>Tracking total detected persons</p>
            <div style={{ height: 160 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a2e3e" />
                  <XAxis dataKey="t" tick={{ fontSize: 9, fill: "#5a7a8a" }} axisLine={{ stroke: "#1a2e3e" }} tickLine={false} interval={9} />
                  <YAxis tick={{ fontSize: 9, fill: "#5a7a8a" }} axisLine={{ stroke: "#1a2e3e" }} tickLine={false} width={28} />
                  <Tooltip
                    contentStyle={{ background: "#0d1420", border: "1px solid #1e3a4a", borderRadius: 8, fontSize: 11 }}
                    labelStyle={{ color: "#5a7a8a" }}
                    itemStyle={{ color: "#00c8d4" }}
                  />
                  <Line type="monotone" dataKey="c" stroke="#00c8d4" strokeWidth={2} dot={false} activeDot={{ r: 3, fill: "#00c8d4" }} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Alert feed */}
          <motion.div className="cs-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <h2 style={{ fontSize: 13, fontWeight: 600, color: "#c8d8e8" }}>Alert Feed</h2>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13" stroke="#0d1420" strokeWidth="2"/>
                <line x1="12" y1="17" x2="12.01" y2="17" stroke="#0d1420" strokeWidth="2"/>
              </svg>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 200, overflowY: "auto" }}>
              <AnimatePresence initial={false}>
                {(alerts.length > 0 ? alerts : [{ id: 0, timestamp: "--:--:--", message: "Waiting for data…", severity: "Low" as const, zone: "-" }])
                  .slice(0, 6)
                  .map((a: AlertItem) => (
                    <motion.div
                      key={a.id}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      style={{ background: "#08111d", border: "1px solid rgba(30,60,80,0.5)", borderRadius: 7, padding: "8px 10px" }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
                        <span style={{ fontSize: 10, color: "#5a7a8a", fontFamily: "monospace" }}>{a.timestamp}</span>
                        <span className={severityClass(a.severity)}>{a.severity}</span>
                      </div>
                      <p style={{ fontSize: 11, color: "#c8d8e8", lineHeight: 1.4 }}>{a.message}</p>
                    </motion.div>
                  ))}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Optical flow */}
          <motion.div className="cs-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h2 style={{ fontSize: 13, fontWeight: 600, color: "#c8d8e8", marginBottom: 4 }}>Motion Vectors</h2>
            <p style={{ fontSize: 11, color: "#5a7a8a", marginBottom: 10 }}>Optical flow</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 4 }}>
              {(flowVectors.length > 0 ? flowVectors : Array(4).fill(Array(5).fill("·"))).flat().map((arrow: string, i: number) => {
                const mag = flowMagnitudes.length > 0 ? (flowMagnitudes[Math.floor(i / 5)]?.[i % 5] ?? 0) : 0;
                const strong = mag > 0.5;
                return (
                  <div
                    key={i}
                    style={{
                      aspectRatio: "1",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 6,
                      border: `1px solid ${strong ? "rgba(0,200,212,0.4)" : "rgba(30,60,80,0.5)"}`,
                      background: strong ? "rgba(0,200,212,0.08)" : "#08111d",
                      fontSize: 14,
                      color: strong ? "#00c8d4" : "#3a5a6a",
                      transition: "all 0.3s",
                    }}
                  >
                    {arrow}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      {/* CSS for spinner — injected inline */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </DashboardShell>
  );
}

function StatCard({ label, value, sub, icon, accent = "#00c8d4" }: {
  label: string; value: string; sub: React.ReactNode; icon: string; accent?: string;
}) {
  return (
    <motion.div className="cs-stat-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div>
        <div style={{ fontSize: 11, color: "#5a7a8a", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
        <div style={{ fontSize: 32, fontWeight: 800, color: accent === "#ff4d6d" && value !== "0" ? accent : "#fff", lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 11, marginTop: 6 }}>{sub}</div>
      </div>
      <div style={{ fontSize: 28, opacity: 0.25 }}>{icon}</div>
    </motion.div>
  );
}
