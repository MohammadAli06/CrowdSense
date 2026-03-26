"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  HiOutlineCog,
  HiOutlineStatusOnline,
} from "react-icons/hi";
import { BsExclamationTriangleFill } from "react-icons/bs";

import { useCrowdSocket } from "@/hooks/useCrowdSocket";
import type { ZoneInfo, AlertItem } from "@/hooks/useCrowdSocket";

/* ------------------------------------------------------------------ */
/*  HELPERS                                                            */
/* ------------------------------------------------------------------ */

const ZONE_ORDER = ["A", "B", "C", "D"] as const;

function heatmapColor(value: string) {
  switch (value) {
    case "critical": return "bg-red-600";
    case "high":     return "bg-orange-500";
    case "med":      return "bg-yellow-400";
    default:         return "bg-green-500";
  }
}

function heatmapOpacity(value: string) {
  switch (value) {
    case "critical": return 1;
    case "high":     return 0.85;
    case "med":      return 0.7;
    default:         return 0.55;
  }
}

function severityBadge(severity: string) {
  const colors: Record<string, string> = {
    High: "red",
    Med: "yellow",
    Low: "green",
  };
  return colors[severity] ?? "green";
}

function statusBadgeColor(color: string) {
  const colors: Record<string, string> = {
    red: "bg-red-500/15 text-red-400 border-red-500/30",
    yellow: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    green: "bg-green-500/15 text-green-400 border-green-500/30",
  };
  return colors[color] ?? colors.green;
}

function dotColor(color: string) {
  const colors: Record<string, string> = {
    red: "bg-red-400",
    yellow: "bg-yellow-400",
    green: "bg-green-400",
  };
  return colors[color] ?? "bg-green-400";
}

/* ------------------------------------------------------------------ */
/*  CARD WRAPPER                                                       */
/* ------------------------------------------------------------------ */
function Card({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`rounded-2xl border border-slate-800 bg-slate-900 p-5 ${className}`}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  STATUS BADGE                                                       */
/* ------------------------------------------------------------------ */
function StatusBadge({ status, color }: { status: string; color: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusBadgeColor(color)}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor(color)}`} />
      {status}
    </span>
  );
}

/* ================================================================== */
/*  DASHBOARD PAGE                                                     */
/* ================================================================== */
export default function DashboardPage() {
  const [currentTime, setCurrentTime] = useState("");

  const {
    frame,
    totalCount,
    zones,
    heatmap,
    alerts,
    crowdHistory,
    flowVectors,
    flowMagnitudes,
    isConnected,
    mockMode,
  } = useCrowdSocket();

  // ── Clock ────────────────────────────────────────────────────────
  useEffect(() => {
    const tick = () =>
      setCurrentTime(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // ── Chart data from live history ─────────────────────────────────
  const chartData = useMemo(
    () => crowdHistory.map((count, i) => ({ time: `${i}s`, count })),
    [crowdHistory],
  );

  // ── Zone array for rendering ─────────────────────────────────────
  const zoneCards = ZONE_ORDER.map((z) => {
    const info: ZoneInfo = zones[z] ?? { count: 0, status: "Safe", color: "green" };
    return { name: `Zone ${z}`, ...info };
  });

  return (
    <div className="min-h-screen bg-slate-950">
      {/* ------- NAVBAR ------- */}
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-6 py-3 backdrop-blur-md">
        {/* Left — logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/20">
            <HiOutlineStatusOnline className="h-5 w-5 text-sky-400" />
          </div>
          <span className="text-lg font-bold text-white">CrowdSense</span>
        </Link>

        {/* Center — live status */}
        <div className="hidden items-center gap-2 text-sm font-medium text-slate-300 sm:flex">
          {isConnected ? (
            <>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-pulse-dot absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
              </span>
              {mockMode ? "Live — Mock Mode (No Camera)" : "Live — Camera Feed Active"}
            </>
          ) : (
            <>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-pulse-dot absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
              </span>
              <span className="text-red-400">Reconnecting…</span>
            </>
          )}
        </div>

        {/* Right — time + settings */}
        <div className="flex items-center gap-4">
          <span className="font-mono text-sm text-slate-400">{currentTime}</span>
          <button className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white">
            <HiOutlineCog className="h-5 w-5" />
          </button>
        </div>
      </nav>

      {/* ------- GRID ------- */}
      <main className="mx-auto grid max-w-[1440px] gap-5 p-5 lg:grid-cols-3 xl:grid-cols-4">
        {/* 1 ▸ Live Feed (col-span-2) */}
        <Card className="lg:col-span-2" delay={0.05}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-300">Live Feed</h2>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-0.5 text-xs font-semibold text-sky-400">
              {totalCount} persons detected
            </span>
          </div>
          <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-800">
            {frame ? (
              <img
                src={`data:image/jpeg;base64,${frame}`}
                alt="Live camera feed with YOLOv8 person detection"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
                  <span className="text-sm font-medium text-slate-500">
                    Connecting to backend…
                  </span>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* 2 ▸ Density Heatmap */}
        <Card delay={0.1}>
          <h2 className="mb-1 text-sm font-semibold text-slate-300">
            Zone Density Map
          </h2>
          <p className="mb-3 text-xs text-slate-500">Real-time zone density overview</p>
          <div className="grid grid-cols-6 gap-1.5">
            {(heatmap.length > 0 ? heatmap : Array(4).fill(Array(6).fill("low")))
              .flat()
              .map((v: string, i: number) => (
                <div
                  key={i}
                  className={`aspect-square rounded-md ${heatmapColor(v)} transition-colors duration-500`}
                  style={{ opacity: heatmapOpacity(v) }}
                  title={`Density: ${v}`}
                />
              ))}
          </div>
          {/* Legend */}
          <div className="mt-3 flex items-center gap-3 text-[10px] text-slate-500">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-green-500" />Low</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-yellow-400" />Med</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-orange-500" />High</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-red-600" />Critical</span>
          </div>
        </Card>

        {/* 3 ▸ Zone Status */}
        <Card delay={0.15}>
          <h2 className="mb-3 text-sm font-semibold text-slate-300">
            Zone Status
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {zoneCards.map((z) => (
              <div
                key={z.name}
                className="flex flex-col gap-1.5 rounded-xl border border-slate-800 bg-slate-800/50 p-3"
              >
                <span className="text-xs font-semibold text-slate-400">
                  {z.name}
                </span>
                <span className="text-2xl font-bold text-white">{z.count}</span>
                <StatusBadge status={z.status} color={z.color} />
              </div>
            ))}
          </div>
        </Card>

        {/* 4 ▸ Alert Feed */}
        <Card delay={0.2}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-300">Alert Feed</h2>
            <BsExclamationTriangleFill className="h-4 w-4 text-yellow-400" />
          </div>
          <div className="flex max-h-72 flex-col gap-2 overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {(alerts.length > 0
                ? alerts
                : [{ id: 0, timestamp: "--:--:--", message: "Waiting for data…", severity: "Low" as const, zone: "-" }]
              ).map((a: AlertItem) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex items-start gap-2 rounded-lg border border-slate-800 bg-slate-800/40 p-2.5"
                >
                  <span className="mt-0.5 text-xs">
                    {a.severity === "High" ? "🔴" : a.severity === "Med" ? "🟡" : "🟢"}
                  </span>
                  <div className="flex-1">
                    <p className="text-xs leading-snug text-slate-300">
                      {a.message}
                    </p>
                    <span className="mt-1 inline-block text-[10px] text-slate-500">
                      {a.timestamp}
                    </span>
                  </div>
                  <StatusBadge
                    status={a.severity}
                    color={severityBadge(a.severity)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </Card>

        {/* 5 ▸ Crowd Count Graph (col-span-2) */}
        <Card className="lg:col-span-2" delay={0.25}>
          <h2 className="mb-1 text-sm font-semibold text-slate-300">
            Live Crowd Count — Last 60s
          </h2>
          <p className="mb-4 text-xs text-slate-500">Tracking total detected persons</p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  axisLine={{ stroke: "#334155" }}
                  tickLine={false}
                  interval={9}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  axisLine={{ stroke: "#334155" }}
                  tickLine={false}
                  width={30}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "0.75rem",
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "#94a3b8" }}
                  itemStyle={{ color: "#38bdf8" }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: "#0ea5e9" }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* 6 ▸ Optical Flow */}
        <Card className="lg:col-span-2" delay={0.3}>
          <h2 className="mb-1 text-sm font-semibold text-slate-300">
            Optical Flow — Movement Vectors
          </h2>
          <p className="mb-4 text-xs text-slate-500">
            Predicted crowd direction
          </p>
          <div className="grid grid-cols-5 gap-2">
            {(flowVectors.length > 0
              ? flowVectors
              : Array(4).fill(Array(5).fill("·"))
            )
              .flat()
              .map((arrow: string, i: number) => {
                const mag = flowMagnitudes.length > 0
                  ? flowMagnitudes[Math.floor(i / 5)]?.[i % 5] ?? 0
                  : 0;
                const isStrong = mag > 0.5;
                return (
                  <div
                    key={i}
                    className={`flex aspect-square items-center justify-center rounded-lg border transition-colors duration-300 text-lg font-medium
                      ${isStrong
                        ? "border-sky-500/40 bg-sky-500/10 text-sky-400"
                        : "border-slate-800 bg-slate-800/50 text-slate-500"
                      }`}
                  >
                    {arrow}
                  </div>
                );
              })}
          </div>
        </Card>
      </main>
    </div>
  );
}
