"use client";

import { useState, useEffect, useRef, useCallback } from "react";

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
  };
}
