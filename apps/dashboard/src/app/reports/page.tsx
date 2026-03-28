"use client";

import { motion } from "framer-motion";
import { DashboardShell } from "@/components/sidebar";

const REPORTS = [
  { id: "RPT-2026-0328", title: "Daily Incident Summary",        date: "2026-03-28", zone: "All Zones", type: "Incident",  size: "2.4 MB" },
  { id: "RPT-2026-0327", title: "Zone C Crowd Analytics",       date: "2026-03-27", zone: "Zone C",    type: "Analytics", size: "1.8 MB" },
  { id: "RPT-2026-0327", title: "Camera Health Audit — Weekly", date: "2026-03-27", zone: "All Zones", type: "Audit",     size: "4.1 MB" },
  { id: "RPT-2026-0326", title: "Security Alert Digest",        date: "2026-03-26", zone: "Zone B",    type: "Security",  size: "0.9 MB" },
  { id: "RPT-2026-0325", title: "Monthly Occupancy Trends",     date: "2026-03-25", zone: "All Zones", type: "Analytics", size: "8.7 MB" },
];

const TYPE_COLOR: Record<string, string> = {
  Incident:  "#ff4d6d",
  Analytics: "#00c8d4",
  Audit:     "#fbbf24",
  Security:  "#f97316",
};

export default function ReportsPage() {
  return (
    <DashboardShell
      title="Reports"
      searchPlaceholder="Search reports..."
      topRight={
        <button className="cs-btn cs-btn-cyan" style={{ gap: 6 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Generate Report
        </button>
      }
      statusItems={[
        { label: "Reports system: Online", color: "#10b981" },
        { label: "Storage: 42.1 GB used",  color: "#5a7a8a" },
      ]}
    >
      <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {[
            { label: "Total Reports", value: "128", color: "#fff" },
            { label: "This Month",    value: "24",  color: "#00c8d4" },
            { label: "Pending",       value: "3",   color: "#fbbf24" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              className="cs-stat-card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              style={{ flexDirection: "column", gap: 4, padding: "16px 18px" }}
            >
              <div style={{ fontSize: 10, color: "#5a7a8a", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: s.color }}>{s.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Table */}
        <motion.div className="cs-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ padding: 0, overflow: "hidden" }}>
          <table className="cs-table">
            <thead>
              <tr>
                <th>Report ID</th>
                <th>Title</th>
                <th>Type</th>
                <th>Zone</th>
                <th>Date</th>
                <th>Size</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {REPORTS.map((r, i) => (
                <tr key={i}>
                  <td>
                    <span style={{ fontFamily: "monospace", fontSize: 11, color: "#00c8d4" }}>{r.id}</span>
                  </td>
                  <td style={{ fontWeight: 600, color: "#c8d8e8" }}>{r.title}</td>
                  <td>
                    <span style={{
                      display: "inline-block", padding: "2px 8px", borderRadius: 4,
                      fontSize: 10, fontWeight: 700,
                      background: `${TYPE_COLOR[r.type]}18`,
                      color: TYPE_COLOR[r.type],
                      border: `1px solid ${TYPE_COLOR[r.type]}40`,
                    }}>
                      {r.type}
                    </span>
                  </td>
                  <td style={{ color: "#8a9aaa" }}>{r.zone}</td>
                  <td style={{ fontFamily: "monospace", fontSize: 11, color: "#5a7a8a" }}>{r.date}</td>
                  <td style={{ fontSize: 11, color: "#5a7a8a" }}>{r.size}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="cs-btn cs-btn-ghost" style={{ padding: "4px 10px", fontSize: 11 }}>View</button>
                      <button className="cs-btn cs-btn-cyan" style={{ padding: "4px 10px", fontSize: 11 }}>↓</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </DashboardShell>
  );
}
