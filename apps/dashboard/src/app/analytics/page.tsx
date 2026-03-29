"use client";

import { motion } from "framer-motion";
import { DashboardShell } from "@/components/sidebar";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const hourlyData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  count: Math.floor(Math.random() * 200 + 50),
  avg: Math.floor(Math.random() * 100 + 30),
}));

const zoneData = [
  { zone: "A", peak: 120, avg: 45 },
  { zone: "B", peak: 280, avg: 130 },
  { zone: "C", peak: 450, avg: 200 },
  { zone: "D", peak: 80,  avg: 30 },
];

const ttType = {
  contentStyle: { background: "#0d1420", border: "1px solid #1e3a4a", borderRadius: 8, fontSize: 11 },
  labelStyle: { color: "#5a7a8a" },
  itemStyle: { color: "#00c8d4" },
};

export default function AnalyticsPage() {
  return (
    <DashboardShell
      title="Analytics"
      searchPlaceholder="Search analytics..."
      statusItems={[{ label: "Data refreshed • 200 OK", color: "#10b981" }]}
    >
      <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
        {/* KPI row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          {[
            { label: "Peak Today",      value: "1,284", color: "#fff" },
            { label: "Daily Average",   value: "342",   color: "#00c8d4" },
            { label: "Detection Rate",  value: "98.4%", color: "#10b981" },
            { label: "Incidents",       value: "7",     color: "#ff4d6d" },
          ].map((kpi, i) => (
            <motion.div
              key={kpi.label}
              className="cs-stat-card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{ flexDirection: "column", gap: 4, padding: "16px 18px" }}
            >
              <div style={{ fontSize: 10, color: "#5a7a8a", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{kpi.label}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: kpi.color }}>{kpi.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Hourly chart */}
        <motion.div className="cs-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, color: "#c8d8e8", marginBottom: 4 }}>Crowd Count — Hourly (Today)</h2>
          <p style={{ fontSize: 11, color: "#5a7a8a", marginBottom: 16 }}>Total detected persons per hour across all zones</p>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#00c8d4" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#00c8d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a2e3e"/>
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "#5a7a8a" }} axisLine={{ stroke: "#1a2e3e" }} tickLine={false} interval={3}/>
                <YAxis tick={{ fontSize: 10, fill: "#5a7a8a" }} axisLine={{ stroke: "#1a2e3e" }} tickLine={false} width={30}/>
                <Tooltip {...ttType}/>
                <Area type="monotone" dataKey="count" stroke="#00c8d4" strokeWidth={2} fill="url(#areaGrad)" dot={false}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Two-column charts */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <motion.div className="cs-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <h2 style={{ fontSize: 13, fontWeight: 600, color: "#c8d8e8", marginBottom: 4 }}>Zone Comparison</h2>
            <p style={{ fontSize: 11, color: "#5a7a8a", marginBottom: 14 }}>Peak vs. average by zone</p>
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={zoneData} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a2e3e"/>
                  <XAxis dataKey="zone" tick={{ fontSize: 10, fill: "#5a7a8a" }} axisLine={{ stroke: "#1a2e3e" }} tickLine={false}/>
                  <YAxis tick={{ fontSize: 10, fill: "#5a7a8a" }} axisLine={{ stroke: "#1a2e3e" }} tickLine={false} width={28}/>
                  <Tooltip {...ttType}/>
                  <Bar dataKey="peak" fill="#00c8d4" fillOpacity={0.8} radius={[3,3,0,0]}/>
                  <Bar dataKey="avg"  fill="#1e4a5a" radius={[3,3,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div className="cs-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 style={{ fontSize: 13, fontWeight: 600, color: "#c8d8e8", marginBottom: 4 }}>Trend — Last 7 Days</h2>
            <p style={{ fontSize: 11, color: "#5a7a8a", marginBottom: 14 }}>Daily peak crowd count</p>
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[
                  { d: "Mon", v: 980 }, { d: "Tue", v: 1120 }, { d: "Wed", v: 870 },
                  { d: "Thu", v: 1340 }, { d: "Fri", v: 1284 }, { d: "Sat", v: 1560 }, { d: "Sun", v: 0 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a2e3e"/>
                  <XAxis dataKey="d" tick={{ fontSize: 10, fill: "#5a7a8a" }} axisLine={{ stroke: "#1a2e3e" }} tickLine={false}/>
                  <YAxis tick={{ fontSize: 10, fill: "#5a7a8a" }} axisLine={{ stroke: "#1a2e3e" }} tickLine={false} width={30}/>
                  <Tooltip {...ttType}/>
                  <Line type="monotone" dataKey="v" stroke="#00c8d4" strokeWidth={2} dot={{ r: 3, fill: "#00c8d4" }}/>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardShell>
  );
}
