import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { crowdWS } from '../services/websocket';
import { WS_URL } from '../config';

/**
 * CrowdContext — provides live WebSocket data to all screens.
 *
 * Backend WebSocket payload shape (from /ws):
 * {
 *   total_count: number,
 *   zones: { A: {count, status, color}, B: {...}, C: {...}, D: {...} },
 *   heatmap: string[][],          // 4 rows × 6 cols: "low"|"med"|"high"|"critical"
 *   alerts: Alert[],              // newest first, max 20
 *   crowd_history: number[],      // last 60 counts at ~10fps
 *   flow_vectors: any[],
 *   flow_magnitudes: any[],
 *   mock_mode: boolean,
 * }
 *
 * Alert shape: { id, timestamp, message, severity, zone }
 */

const CrowdContext = createContext(null);

export function CrowdProvider({ children }) {
  const [status, setStatus] = useState('connecting'); // 'connecting' | 'connected' | 'disconnected'
  const [liveData, setLiveData] = useState(null);

  useEffect(() => {
    crowdWS.connect(WS_URL);

    const unsub = crowdWS.addListener((event) => {
      switch (event.type) {
        case 'connected':
          setStatus('connected');
          break;
        case 'disconnected':
          setStatus('disconnected');
          break;
        case 'error':
          setStatus('disconnected');
          break;
        case 'data':
          setStatus('connected');
          setLiveData(event.payload);
          break;
      }
    });

    return () => {
      unsub();
      crowdWS.disconnect();
    };
  }, []);

  return (
    <CrowdContext.Provider value={{ liveData, status, wsUrl: WS_URL }}>
      {children}
    </CrowdContext.Provider>
  );
}

/** Hook to access crowd context */
export function useCrowdContext() {
  const ctx = useContext(CrowdContext);
  if (!ctx) throw new Error('useCrowdContext must be used inside CrowdProvider');
  return ctx;
}
