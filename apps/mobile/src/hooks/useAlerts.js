import { useMemo } from 'react';
import { useCrowdContext } from '../context/CrowdContext';

/**
 * useAlerts — returns live alerts from the WebSocket stream.
 *
 * Backend alert shape:
 *   { id, timestamp, message, severity: "High"|"Med"|"Low", zone }
 *
 * @param {string|null} severityFilter - "High" | "Med" | "Low" | null (all)
 */
export function useAlerts(severityFilter = null) {
  const { liveData } = useCrowdContext();

  const rawAlerts = liveData?.alerts ?? [];

  const alerts = useMemo(() => {
    if (!severityFilter) return rawAlerts;
    return rawAlerts.filter(a => a.severity === severityFilter);
  }, [rawAlerts, severityFilter]);

  const activeCount = rawAlerts.length;
  const criticalCount = rawAlerts.filter(a => a.severity === 'High').length;

  return { alerts, activeCount, criticalCount };
}
