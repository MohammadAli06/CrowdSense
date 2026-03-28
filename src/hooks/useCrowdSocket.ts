"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/* ── Alert sound via Web Audio API ────────────────────────────────── */
function playAlertSound(severity: string) {
  const AudioCtx = window.AudioContext ?? (window as any).webkitAudioContext;
  if (!AudioCtx) return;
  const ctx = new AudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  if (severity === "High") {
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(660, ctx.currentTime + 0.15);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } else if (severity === "Med") {
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } else {
    ctx.close();
    return;
  }
  osc.onended = () => ctx.close();
}

/** Shape of each zone coming from the backend. */
export interface ZoneInfo {
  count: number;
  status: "Critical" | "Warning" | "Safe";
  color: "red" | "yellow" | "green";
}

/** Single alert object. */
export interface AlertItem {
  id: number;
  timestamp: string;
  message: string;
  severity: "High" | "Med" | "Low";
  zone: string;
}

/** Full payload from the WebSocket. */
export interface CrowdPayload {
  frame: string;
  total_count: number;
  zones: Record<string, ZoneInfo>;
  heatmap: string[][];
  alerts: AlertItem[];
  crowd_history: number[];
  flow_vectors: string[][];
  flow_magnitudes: number[][];
  mock_mode: boolean;
}

const WS_URL = "ws://localhost:8000/ws";
const RECONNECT_DELAY = 3000;

export function useCrowdSocket() {
  const [frame, setFrame] = useState<string>("");
  const [totalCount, setTotalCount] = useState(0);
  const [zones, setZones] = useState<Record<string, ZoneInfo>>({});
  const [heatmap, setHeatmap] = useState<string[][]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [crowdHistory, setCrowdHistory] = useState<number[]>([]);
  const [flowVectors, setFlowVectors] = useState<string[][]>([]);
  const [flowMagnitudes, setFlowMagnitudes] = useState<number[][]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [mockMode, setMockMode] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);
  const prevAlertIds = useRef<Set<number>>(new Set());

  const connect = useCallback(() => {
    if (!mountedRef.current) return;

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current) return;
        console.log("[CrowdSocket] Connected ✓");
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        if (!mountedRef.current) return;
        try {
          const data: CrowdPayload = JSON.parse(event.data);
          setFrame(data.frame);
          setTotalCount(data.total_count);
          setZones(data.zones);
          setHeatmap(data.heatmap);
          setAlerts(data.alerts);
          setCrowdHistory(data.crowd_history);
          setFlowVectors(data.flow_vectors ?? []);
          setFlowMagnitudes(data.flow_magnitudes ?? []);
          setMockMode(data.mock_mode ?? false);

          // Play sound for NEW alerts only
          const newAlerts = (data.alerts ?? []).filter(
            (a: AlertItem) => !prevAlertIds.current.has(a.id)
          );
          newAlerts.forEach((a: AlertItem) => {
            playAlertSound(a.severity);
            prevAlertIds.current.add(a.id);
          });
        } catch {
          // ignore malformed frames
        }
      };

      ws.onclose = () => {
        if (!mountedRef.current) return;
        console.log("[CrowdSocket] Disconnected — reconnecting in 3s…");
        setIsConnected(false);
        reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY);
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch {
      if (mountedRef.current) {
        reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    connect();

    return () => {
      mountedRef.current = false;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  // Force-reconnect: close current WS so a fresh connection picks up the new mode
  const reconnect = useCallback(() => {
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    wsRef.current?.close();
    // small delay to let the backend process the mode change
    reconnectTimer.current = setTimeout(connect, 500);
  }, [connect]);

  return {
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
    reconnect,
  };
}
