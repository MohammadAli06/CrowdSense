"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardShell } from "@/components/sidebar";

/* ── Zone data ────────────────────────────────────────────────────────── */
interface ZoneConfig {
  id: string;
  name: string;
  camId: string;
  count: number;
  status: "SAFE" | "WARNING" | "CRITICAL";
  safeMax: number;
  warnMax: number;
  critMin: number;
  safe: number;
  warn: number;
  crit: number;
}

const INITIAL_ZONES: ZoneConfig[] = [
  { id: "A", name: "Zone A – Main Lobby",      camId: "CAM_01_SEC_NW", count: 4,  status: "SAFE",     safeMax: 6,  warnMax: 15, critMin: 16, safe: 6,  warn: 15, crit: 16 },
  { id: "B", name: "Zone B – North Gate",       camId: "CAM_01_SEC_NE", count: 18, status: "WARNING",  safeMax: 10, warnMax: 25, critMin: 26, safe: 10, warn: 2,  crit: 2 },
  { id: "C", name: "Zone C – South Concourse",  camId: "CAM_01_SEC_SW", count: 42, status: "CRITICAL", safeMax: 12, warnMax: 20, critMin: 21, safe: 15, warn: 2,  crit: 2 },
  { id: "D", name: "Zone D – Utility Exit",     camId: "CAM_01_SEC_SE", count: 2,  status: "SAFE",     safeMax: 5,  warnMax: 10, critMin: 11, safe: 5,  warn: 10, crit: 1 },
];

const STATUS_STYLE: Record<string, { bg: string; text: string; dot: string }> = {
  SAFE:     { bg: "rgba(16,185,129,0.1)",  text: "#10b981", dot: "#10b981" },
  WARNING:  { bg: "rgba(251,191,36,0.1)",  text: "#fbbf24", dot: "#fbbf24" },
  CRITICAL: { bg: "rgba(255,77,109,0.12)", text: "#ff4d6d", dot: "#ff4d6d" },
};

export default function ZoneConfigPage() {
  const [zones, setZones] = useState<ZoneConfig[]>(INITIAL_ZONES);

  function update(id: string, field: keyof ZoneConfig, val: number) {
    setZones(prev => prev.map(z => z.id === id ? { ...z, [field]: val } : z));
  }

  function save(id: string) {
    console.log("Saving zone", id, zones.find(z => z.id === id));
  }

  function resetAll() {
    setZones(INITIAL_ZONES);
  }

  return (
    <DashboardShell
      title="Zone Configuration"
      searchPlaceholder="Search parameters..."
      topRight={
        <div style={{ display: "flex", gap: 10 }}>
          <button className="cs-btn cs-btn-ghost" style={{ gap: 6 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
            View Logs
          </button>
          <button className="cs-btn cs-btn-cyan" style={{ gap: 6 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
              <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/>
            </svg>
            Deploy Config
          </button>
        </div>
      }
      statusItems={[
        { label: "Link Status: Operational", color: "#10b981" },
        { label: "Latency: 14ms",            color: "#5a7a8a" },
        { label: "Encryption: AES-256",       color: "#5a7a8a" },
      ]}
    >
      <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Header block */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#00c8d4", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>
            System Architecture
          </p>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#fff", marginBottom: 6 }}>Spatial Density Parameters</h1>
          <p style={{ fontSize: 13, color: "#5a7a8a", maxWidth: 500 }}>
            Define occupancy thresholds for real-time edge processing. Adjust sensitivities to mitigate false positives in high-reflection environments.
          </p>
        </div>

        {/* Zone grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
          {zones.map((zone, idx) => {
            const st = STATUS_STYLE[zone.status];
            return (
              <motion.div
                key={zone.id}
                className="cs-card"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.07 }}
              >
                {/* Zone header */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 6,
                      background: "rgba(0,200,212,0.15)",
                      border: "1px solid rgba(0,200,212,0.3)",
                      flexShrink: 0,
                    }} />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{zone.name}</div>
                      <div style={{ fontSize: 10, color: "#5a7a8a", fontFamily: "monospace", marginTop: 2 }}>ID: {zone.camId}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{
                      display: "inline-block", padding: "3px 8px", borderRadius: 4,
                      fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
                      background: st.bg, color: st.text, marginBottom: 4,
                    }}>
                      STATUS: {zone.status}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end", fontSize: 11, color: "#5a7a8a" }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: st.dot, display: "inline-block" }} />
                      Count: {zone.count}
                    </div>
                  </div>
                </div>

                {/* Sliders */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <SliderRow
                    label="Safe Threshold"
                    maxLabel={`MAX ${zone.safeMax}`}
                    maxColor="#00c8d4"
                    value={zone.safe}
                    min={0}
                    max={zone.safeMax}
                    onChange={v => update(zone.id, "safe", v)}
                    inputValue={zone.safe}
                    onInputChange={v => update(zone.id, "safe", v)}
                  />
                  <SliderRow
                    label="Warning Threshold"
                    maxLabel={`MAX ${zone.warnMax}`}
                    maxColor="#fbbf24"
                    value={zone.warn}
                    min={0}
                    max={zone.warnMax}
                    onChange={v => update(zone.id, "warn", v)}
                    inputValue={zone.warn}
                    onInputChange={v => update(zone.id, "warn", v)}
                  />
                  <SliderRow
                    label="Critical Threshold"
                    maxLabel={`MIN ${zone.critMin}+`}
                    maxColor="#ff4d6d"
                    value={zone.crit}
                    min={0}
                    max={50}
                    onChange={v => update(zone.id, "crit", v)}
                    inputValue={zone.crit}
                    onInputChange={v => update(zone.id, "crit", v)}
                  />
                </div>

                {/* Save */}
                <button
                  onClick={() => save(zone.id)}
                  className="cs-btn cs-btn-ghost"
                  style={{ width: "100%", justifyContent: "center", marginTop: 16, letterSpacing: "0.08em", fontSize: 12 }}
                >
                  SAVE ZONE
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Footer actions */}
        <div style={{
          background: "#08111d",
          border: "1px solid rgba(30,60,80,0.6)",
          borderRadius: 10,
          padding: "18px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
        }}>
          <button onClick={resetAll} className="cs-btn cs-btn-ghost" style={{ padding: "10px 24px", letterSpacing: "0.08em" }}>
            ↺ RESET TO DEFAULTS
          </button>
          <button className="cs-btn cs-btn-cyan" style={{ padding: "10px 24px", letterSpacing: "0.08em" }}>
            ✓ APPLY TO ALL ZONES
          </button>
        </div>
      </div>
    </DashboardShell>
  );
}

/* ── SliderRow ──────────────────────────────────────────────────────── */
function SliderRow({ label, maxLabel, maxColor, value, min, max, onChange, inputValue, onInputChange }: {
  label: string; maxLabel: string; maxColor: string;
  value: number; min: number; max: number; onChange: (v: number) => void;
  inputValue: number; onInputChange: (v: number) => void;
}) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: "#5a7a8a", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {label}
        </span>
        <span style={{ fontSize: 10, fontWeight: 700, color: maxColor, letterSpacing: "0.04em" }}>{maxLabel}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{ flex: 1 }}
        />
        <input
          type="number"
          value={inputValue}
          onChange={e => onInputChange(Number(e.target.value))}
          className="cs-input"
          style={{ width: 48, textAlign: "center", padding: "4px 6px", fontSize: 12, height: 28 }}
        />
      </div>
    </div>
  );
}
