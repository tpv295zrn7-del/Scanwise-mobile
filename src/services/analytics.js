// Lightweight analytics — fire-and-forget event tracking.
//
// Events are appended to an in-memory log and persisted to AsyncStorage.
// The backend analytics endpoint isn't required for the app to work;
// if the network call fails we silently drop the event and keep going.
//
// To wire analytics into a new event, call:
//   analytics.track('event_name', { key: 'value' });
//
// Common events to track for the ScanWise KPIs:
//   - 'scan_completed'      — a barcode was successfully scanned
//   - 'product_viewed'      — product detail page opened
//   - 'product_saved'       — user saved a product
//   - 'product_unsaved'     — user removed a saved product
//   - 'saved_list_viewed'   — user opened the saved items tab
//   - 'compare_started'     — user tapped the Compare button
//   - 'alternatives_viewed' — alternatives were rendered
//   - 'correction_started'  — user opened the correction flow
//   - 'correction_submitted'— user submitted a correction
//   - 'goal_changed'        — user updated their health goals

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../utils/constants';

const STORAGE_KEY = 'scanwise_analytics_events';
const MAX_BUFFERED = 100;
const FLUSH_INTERVAL_MS = 30_000; // try to flush every 30s

class Analytics {
  constructor() {
    this.events = [];
    this.flushTimer = null;
    this.userId = null;
  }

  async init(userId) {
    this.userId = userId || null;
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        this.events = JSON.parse(raw).slice(-MAX_BUFFERED);
      }
    } catch (e) {
      // AsyncStorage failure is non-fatal
    }
    this.flushTimer = setInterval(() => this.flush(), FLUSH_INTERVAL_MS);
  }

  async track(eventName, properties = {}) {
    const event = {
      event: eventName,
      properties,
      timestamp: new Date().toISOString(),
      user_id: this.userId,
    };
    this.events.push(event);
    if (this.events.length > MAX_BUFFERED) {
      this.events = this.events.slice(-MAX_BUFFERED);
    }
    // Best-effort persist
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.events)).catch(() => {});
  }

  async flush() {
    if (this.events.length === 0) return;
    // We don't have a dedicated analytics ingest endpoint yet, so this
    // is a no-op for now. The events are still in AsyncStorage for
    // later extraction. When the backend exposes POST /api/analytics,
    // wire it here.
    const payload = this.events.slice();
    try {
      const res = await fetch(`${API_BASE_URL}/api/analytics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: payload }),
        // Don't block the UI on this
      }).catch(() => null);
      if (res && res.ok) {
        // Drop the events we just shipped
        this.events = this.events.slice(payload.length);
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.events)).catch(() => {});
      }
    } catch (e) {
      // Swallow — analytics must never break the app
    }
  }

  async getBufferedEvents() {
    return [...this.events];
  }
}

export const analytics = new Analytics();
export default analytics;
