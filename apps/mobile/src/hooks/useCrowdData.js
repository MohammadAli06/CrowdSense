import { useCrowdContext } from '../context/CrowdContext';

/**
 * useCrowdData — returns top-level crowd metrics from the live WebSocket stream.
 *
 * Returns:
 *   totalCount   — current total detected people
 *   history      — array of recent counts (up to 60 values, ~10fps)
 *   isMockMode   — true when backend is running without a real camera
 *   isLoading    — true before first WebSocket frame arrives
 *   status       — 'connecting' | 'connected' | 'disconnected'
 *
 * Derived stats (computed from history):
 *   peakCount    — highest count in history
 *   avgCount     — average count in history
 */
export function useCrowdData() {
  const { liveData, status } = useCrowdContext();

  const history = liveData?.crowd_history ?? [];
  const totalCount = liveData?.total_count ?? 0;
  const isMockMode = liveData?.mock_mode ?? false;
  const isLoading = liveData === null;

  const peakCount = history.length > 0 ? Math.max(...history) : 0;
  const avgCount = history.length > 0
    ? Math.round(history.reduce((a, b) => a + b, 0) / history.length)
    : 0;

  return {
    totalCount,
    history,
    isMockMode,
    isLoading,
    status,
    peakCount,
    avgCount,
  };
}
