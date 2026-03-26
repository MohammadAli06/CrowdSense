"""
alert_manager.py — In-memory alert system.

Generates alerts when:
  1. A zone crosses from Warning → Critical.
  2. Total crowd count increases by >5 in under 3 seconds (rapid buildup).
  3. A zone stays Critical for more than 10 seconds.

Keeps the last 20 alerts in a ring buffer.
"""

from __future__ import annotations

import time
from dataclasses import dataclass, field, asdict
from typing import Any


@dataclass
class Alert:
    id: int
    timestamp: str
    message: str
    severity: str  # "High" | "Med" | "Low"
    zone: str


class AlertManager:
    """Stateful alert manager — call `update()` each tick."""

    def __init__(self, max_alerts: int = 20):
        self._max = max_alerts
        self._alerts: list[Alert] = []
        self._next_id = 1

        # State tracking
        self._prev_zone_status: dict[str, str] = {}
        self._critical_since: dict[str, float] = {}   # zone → epoch
        self._critical_alerted: dict[str, bool] = {}   # already fired?

        self._count_history: list[tuple[float, int]] = []  # (epoch, count)
        self._last_rapid_alert_time: float = 0.0

    # ── public ──────────────────────────────────────────────────────

    def update(self, zones: dict[str, dict[str, Any]], total_count: int) -> list[dict]:
        """
        Evaluate alert rules and return the current alert list (dicts).
        """
        now = time.time()
        ts = time.strftime("%H:%M:%S", time.localtime(now))

        # Rule 1 — zone crosses Warning → Critical
        for z, info in zones.items():
            prev = self._prev_zone_status.get(z, "Safe")
            curr = info["status"]

            if prev != "Critical" and curr == "Critical":
                self._push(Alert(
                    id=self._next_id,
                    timestamp=ts,
                    message=f"Zone {z} exceeded safe limit — {info['count']} persons",
                    severity="High",
                    zone=z,
                ))

            # Track Critical duration for Rule 3
            if curr == "Critical":
                if z not in self._critical_since:
                    self._critical_since[z] = now
                    self._critical_alerted[z] = False
            else:
                self._critical_since.pop(z, None)
                self._critical_alerted.pop(z, None)

            self._prev_zone_status[z] = curr

        # Rule 2 — rapid buildup (>5 persons in <3 s)
        self._count_history.append((now, total_count))
        # Trim older than 5 s
        self._count_history = [(t, c) for t, c in self._count_history if now - t <= 5]
        if len(self._count_history) >= 2:
            oldest_t, oldest_c = self._count_history[0]
            if (now - oldest_t <= 3
                    and total_count - oldest_c > 5
                    and now - self._last_rapid_alert_time > 5):
                self._push(Alert(
                    id=self._next_id,
                    timestamp=ts,
                    message=f"Rapid crowd buildup detected — count rose to {total_count}",
                    severity="High",
                    zone="ALL",
                ))
                self._last_rapid_alert_time = now

        # Rule 3 — zone Critical for >10 s
        for z, since in list(self._critical_since.items()):
            if now - since > 10 and not self._critical_alerted.get(z, False):
                self._push(Alert(
                    id=self._next_id,
                    timestamp=ts,
                    message=f"Zone {z} critical for over 10 seconds — immediate action needed",
                    severity="High",
                    zone=z,
                ))
                self._critical_alerted[z] = True

        return [asdict(a) for a in reversed(self._alerts)]  # newest first

    # ── private ─────────────────────────────────────────────────────

    def _push(self, alert: Alert):
        self._next_id += 1
        self._alerts.append(alert)
        if len(self._alerts) > self._max:
            self._alerts.pop(0)
