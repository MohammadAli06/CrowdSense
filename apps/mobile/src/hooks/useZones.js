import { useMemo } from 'react';
import { useCrowdContext } from '../context/CrowdContext';

/**
 * useZones — converts raw backend zone data into a UI-friendly format.
 *
 * Backend zone shape:
 *   { A: {count, status: "Safe"|"Warning"|"Critical", color: "green"|"yellow"|"red"}, ... }
 *
 * Thresholds from backend zone_manager.py:
 *   Safe     → count < 6
 *   Warning  → 6 ≤ count < 16
 *   Critical → count ≥ 16
 *
 * ZONE_CAPACITY is a rough "max expected" for capacity % display in trends.
 */

const ZONE_CAPACITY = 30; // persons considered 100% capacity for UI purposes

// Static map positions — visual only, fixed per zone label
const ZONE_POSITIONS = {
  A: { x: 0.25, y: 0.42, fullName: 'Zone A — Main Gate' },
  B: { x: 0.6, y: 0.22, fullName: 'Zone B — North Gate' },
  C: { x: 0.7, y: 0.62, fullName: 'Zone C — South Entry' },
  D: { x: 0.62, y: 0.1, fullName: 'Zone D — Stage Area' },
};

const STATUS_MAP = {
  Safe: { label: 'STABLE', color: '#34C759' },
  Warning: { label: 'MODERATE', color: '#FF9500' },
  Critical: { label: 'CRITICAL', color: '#FF3B30' },
};

export function useZones() {
  const { liveData } = useCrowdContext();
  const rawZones = liveData?.zones ?? null;
  const heatmap = liveData?.heatmap ?? null;

  const zones = useMemo(() => {
    if (!rawZones) return null;
    return Object.entries(rawZones).map(([id, data]) => {
      const pos = ZONE_POSITIONS[id] || { x: 0.5, y: 0.5, fullName: `Zone ${id}` };
      const statusInfo = STATUS_MAP[data.status] || STATUS_MAP.Safe;
      const capacityPct = Math.min(100, Math.round((data.count / ZONE_CAPACITY) * 100));
      return {
        id,
        name: `Zone ${id}`,
        fullName: pos.fullName,
        status: statusInfo.label,
        rawStatus: data.status,         // "Safe" | "Warning" | "Critical"
        people: data.count,
        color: statusInfo.color,
        x: pos.x,
        y: pos.y,
        capacityPct,
      };
    });
  }, [rawZones]);

  // Is any zone currently critical?
  const hasCriticalZone = zones?.some(z => z.rawStatus === 'Critical') ?? false;
  const criticalZones = zones?.filter(z => z.rawStatus === 'Critical') ?? [];

  return { zones, heatmap, hasCriticalZone, criticalZones };
}
