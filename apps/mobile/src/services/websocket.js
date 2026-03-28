/**
 * websocket.js — Singleton WebSocket manager for the CrowdSense backend.
 *
 * Usage:
 *   crowdWS.connect(url)
 *   crowdWS.addListener(fn)   → returns cleanup fn
 *   crowdWS.disconnect()
 */

class CrowdWebSocketManager {
  constructor() {
    this.ws = null;
    this.url = null;
    this.listeners = new Set();
    this.reconnectTimer = null;
    this.isConnected = false;
    this.shouldReconnect = true;
  }

  connect(url) {
    this.url = url;
    this.shouldReconnect = true;
    this._open();
  }

  _open() {
    if (this.ws) {
      this.ws.close();
    }
    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.isConnected = true;
        console.log('[CrowdWS] Connected to', this.url);
        this._emit({ type: 'connected' });
      };

      this.ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          this._emit({ type: 'data', payload });
        } catch (e) {
          console.warn('[CrowdWS] Failed to parse message', e);
        }
      };

      this.ws.onerror = (e) => {
        console.warn('[CrowdWS] Error', e.message);
        this._emit({ type: 'error', message: e.message });
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this._emit({ type: 'disconnected' });
        if (this.shouldReconnect) {
          console.log('[CrowdWS] Disconnected — reconnecting in 3s...');
          this.reconnectTimer = setTimeout(() => this._open(), 3000);
        }
      };
    } catch (e) {
      console.error('[CrowdWS] Could not open WebSocket:', e);
      if (this.shouldReconnect) {
        this.reconnectTimer = setTimeout(() => this._open(), 3000);
      }
    }
  }

  disconnect() {
    this.shouldReconnect = false;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /** Subscribe to WebSocket events. Returns an unsubscribe function. */
  addListener(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  _emit(event) {
    this.listeners.forEach((fn) => fn(event));
  }
}

export const crowdWS = new CrowdWebSocketManager();
