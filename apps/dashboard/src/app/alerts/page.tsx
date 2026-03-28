"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardShell } from "@/components/sidebar";

/* ── Mock data ────────────────────────────────────────────────────────── */
const ALERTS = [
  { id: 1, timestamp: "14:23:05.12", zone: "Zone C", severity: "HIGH" as const, message: "Unauthorized access detected in restricted zone perimeter — security breach", count: 12, status: "UNACKNOWLEDGED" as const },
  { id: 2, timestamp: "14:18:42.08", zone: "Zone A", severity: "MED" as const,  message: "Crowd density exceeding threshold near main entrance gate section", count: 3, status: "ACKNOWLEDGED" as const },
  { id: 3, timestamp: "13:55:10.55", zone: "Zone D", severity: "LOW" as const,  message: "Maintenance door left slightly ajar for over 12-minute window period", count: 1, status: "UNACKNOWLEDGED" as const },
  { id: 4, timestamp: "13:42:01.33", zone: "Zone B", severity: "HIGH" as const, message: "Camera loss of signal detected in Loading Bay sector — feed offline", count: 1, status: "ACKNOWLEDGED" as const },
  { id: 5, timestamp: "13:10:44.92", zone: "Zone C", severity: "MED" as const,  message: "Object left unattended in main lobby for more than 5 minutes", count: 5, status: "UNACKNOWLEDGED" as const },
];

type Severity = "All" | "High" | "Med" | "Low";
type Zone = "All Zones" | "A" | "B" | "C" | "D";

export default function AlertsPage() {
  const [sevFilter, setSevFilter] = useState<Severity>("All");
  const [zoneFilter, setZoneFilter] = useState<Zone>("All Zones");
  const [msgSearch, setMsgSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = ALERTS.filter(a => {
    if (sevFilter !== "All" && a.severity !== sevFilter.toUpperCase()) return false;
    if (zoneFilter !== "All Zones" && a.zone !== `Zone ${zoneFilter}`) return false;
    if (msgSearch && !a.message.toLowerCase().includes(msgSearch.toLowerCase())) return false;
    return true;
  });

  const highCount  = ALERTS.filter(a => a.severity === "HIGH").length;
  const mostZone   = "Zone C";

  return (
    <DashboardShell
      title="Alert Center"
      searchPlaceholder="Global system search..."
      statusItems={[
        { label: "GET /api/alerts/recent • 200 OK", color: "#10b981" },
      ]}
    >
      <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          <StatCard
            label="Total Alerts Today"
            value="1,284"
            sub={<span style={{ color: "#10b981", fontSize: 11 }}>↑ 12% vs yesterday</span>}
            icon={
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#5a7a8a" strokeWidth="1.5">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
              </svg>
            }
          />
          <StatCard
            label="High Severity"
            value={String(highCount)}
            valueColor="#ff4d6d"
            sub={<span style={{ color: "#ff4d6d", fontSize: 11 }}>⚠ Requires immediate action</span>}
            icon={
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.5">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13" stroke="#f97316" strokeWidth="2"/>
                <line x1="12" y1="17" x2="12.01" y2="17" stroke="#f97316" strokeWidth="2"/>
              </svg>
            }
          />
          <StatCard
            label="Most Triggered Zone"
            value={mostZone}
            valueColor="#00c8d4"
            sub={<span style={{ color: "#5a7a8a", fontSize: 11 }}>● Entry point monitoring</span>}
            icon={
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#5a7a8a" strokeWidth="1.5">
                <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
            }
          />
        </div>

        {/* Filters */}
        <div className="cs-card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Severity */}
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#5a7a8a", textTransform: "uppercase", letterSpacing: "0.08em", minWidth: 120 }}>
              Filter by Severity
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              {(["All", "High", "Med", "Low"] as Severity[]).map(s => (
                <button
                  key={s}
                  onClick={() => setSevFilter(s)}
                  className={`cs-pill ${sevFilter === s ? "active" : ""}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Zone + search + timeframe */}
          <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#5a7a8a", textTransform: "uppercase", letterSpacing: "0.08em", minWidth: 120 }}>
                Filter by Zone
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                {(["All Zones", "A", "B", "C", "D"] as Zone[]).map(z => (
                  <button
                    key={z}
                    onClick={() => setZoneFilter(z)}
                    className={`cs-pill ${zoneFilter === z ? "active" : ""}`}
                  >
                    {z}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
              {/* Message search */}
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#5a7a8a", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                  Message Search
                </div>
                <div style={{ position: "relative" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#5a7a8a" strokeWidth="2" strokeLinecap="round"
                    style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)" }}>
                    <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                  </svg>
                  <input
                    type="text"
                    value={msgSearch}
                    onChange={e => setMsgSearch(e.target.value)}
                    placeholder="Search message text..."
                    className="cs-input"
                    style={{ paddingLeft: 28, width: 200, height: 34, fontSize: 12 }}
                  />
                </div>
              </div>

              {/* Timeframe */}
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#5a7a8a", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                  Timeframe
                </div>
                <select className="cs-input" style={{ width: 160, height: 34, fontSize: 12 }}>
                  <option>Last 7 days</option>
                  <option>Last 24 hours</option>
                  <option>Last hour</option>
                  <option>All time</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <motion.div className="cs-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ padding: 0, overflow: "hidden" }}>
          <table className="cs-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Zone</th>
                <th>Severity</th>
                <th>Message</th>
                <th>Count</th>
                <th>Status</th>
                <th style={{ width: 80 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((alert) => (
                <tr key={alert.id}>
                  <td>
                    <span style={{ fontFamily: "monospace", fontSize: 12, color: "#c8d8e8" }}>{alert.timestamp}</span>
                  </td>
                  <td>
                    <span style={{
                      display: "inline-block",
                      padding: "3px 10px",
                      borderRadius: 5,
                      fontSize: 11,
                      fontWeight: 600,
                      background: "rgba(30,60,80,0.5)",
                      color: "#c8d8e8",
                      border: "1px solid rgba(30,60,80,0.8)",
                    }}>
                      {alert.zone}
                    </span>
                  </td>
                  <td>
                    <SeverityBadge sev={alert.severity} />
                  </td>
                  <td style={{ maxWidth: 320, color: "#8a9aaa" }}>
                    <span title={alert.message}>
                      {alert.message.length > 55 ? alert.message.slice(0, 55) + "…" : alert.message}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: "#c8d8e8" }}>{alert.count}</td>
                  <td>
                    <StatusChip status={alert.status} />
                  </td>
                  <td>
                    {alert.status === "UNACKNOWLEDGED" && (
                      <button className="cs-btn cs-btn-cyan" style={{ padding: "4px 12px", fontSize: 11 }}>
                        Ackno…
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 16px", borderTop: "1px solid rgba(30,60,80,0.5)",
          }}>
            <span style={{ fontSize: 12, color: "#5a7a8a" }}>
              Showing 1 to {filtered.length} of <strong style={{ color: "#c8d8e8" }}>120</strong> alerts
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <button className="cs-page-btn">‹</button>
              {[1, 2, 3, "…", 6].map((p, i) => (
                <button
                  key={i}
                  onClick={() => typeof p === "number" && setCurrentPage(p)}
                  className={`cs-page-btn ${currentPage === p ? "active" : ""}`}
                >
                  {p}
                </button>
              ))}
              <button className="cs-page-btn">›</button>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardShell>
  );
}

/* ── Sub-components ─────────────────────────────────────────────────── */
function StatCard({ label, value, valueColor, sub, icon }: {
  label: string; value: string; valueColor?: string; sub: React.ReactNode; icon: React.ReactNode;
}) {
  return (
    <motion.div className="cs-stat-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div>
        <div style={{ fontSize: 11, color: "#5a7a8a", fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {label}
        </div>
        <div style={{ fontSize: 36, fontWeight: 800, color: valueColor ?? "#fff", lineHeight: 1 }}>{value}</div>
        <div style={{ marginTop: 8 }}>{sub}</div>
      </div>
      <div style={{ opacity: 0.4 }}>{icon}</div>
    </motion.div>
  );
}

function SeverityBadge({ sev }: { sev: "HIGH" | "MED" | "LOW" }) {
  const map = {
    HIGH: { bg: "rgba(255,77,109,0.15)", color: "#ff4d6d", border: "rgba(255,77,109,0.35)", dot: "#ff4d6d" },
    MED:  { bg: "rgba(249,115,22,0.15)", color: "#f97316", border: "rgba(249,115,22,0.3)", dot: "#f97316" },
    LOW:  { bg: "rgba(0,200,212,0.12)", color: "#00c8d4", border: "rgba(0,200,212,0.3)", dot: "#00c8d4" },
  };
  const s = map[sev];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 6,
      background: s.bg, color: s.color,
      border: `1px solid ${s.border}`,
      fontSize: 11, fontWeight: 700, letterSpacing: "0.06em",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
      {sev}
    </span>
  );
}

function StatusChip({ status }: { status: "ACKNOWLEDGED" | "UNACKNOWLEDGED" }) {
  const ack = status === "ACKNOWLEDGED";
  return (
    <span style={{
      display: "inline-block",
      padding: "3px 8px",
      borderRadius: 4,
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.06em",
      background: ack ? "transparent" : "rgba(255,77,109,0.12)",
      color: ack ? "#5a7a8a" : "#ff4d6d",
      border: ack ? "none" : "1px solid rgba(255,77,109,0.3)",
    }}>
      {status}
    </span>
  );
}
