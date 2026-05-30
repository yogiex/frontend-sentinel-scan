/**
 * SentinelScan — Frontend Telemetry Module
 * Path: src/lib/telemetry.ts
 *
 * Collects browser-based performance metrics only.
 * NO system metrics (CPU, RAM, disk) — those are backend responsibility.
 *
 * Scope:
 *   ✅ Web Vitals (LCP, CLS, INP, FCP)
 *   ✅ JS Heap Memory (Chrome only)
 *   ✅ Navigation Timing
 *   ✅ Network Information
 *   ✅ Long Tasks Detection
 *   ✅ FPS Monitoring
 *   ✅ Error Rate Tracking
 *   ❌ CPU Usage (not available in browser)
 *   ❌ System RAM (not available in browser)
 *   ❌ Disk Usage (not available in browser)
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface WebVitals {
  lcp: number | null;   // Largest Contentful Paint (ms)
  cls: number | null;   // Cumulative Layout Shift
  inp: number | null;   // Interaction to Next Paint (ms)
  fcp: number | null;   // First Contentful Paint (ms)
  ttfb: number | null;  // Time to First Byte (ms)
}

export interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  usagePercent: number;
}

export interface NetworkInfo {
  effectiveType: string;    // 'slow-2g' | '2g' | '3g' | '4g'
  downlink: number;         // Mbps
  rtt: number;              // ms
  saveData: boolean;
  type: string;             // 'wifi' | 'cellular' | 'ethernet'
}

export interface NavigationTiming {
  dnsLookup: number;
  tcpConnection: number;
  tlsNegotiation: number;
  requestTime: number;
  responseTime: number;
  domParsing: number;
  domContentLoaded: number;
  pageLoad: number;
  redirectCount: number;
}

export interface ErrorStats {
  total: number;
  uncaught: number;
  unhandledRejections: number;
  lastError: string | null;
  lastErrorTime: string | null;
}

export interface LongTaskInfo {
  count: number;
  totalDuration: number;
  avgDuration: number;
  maxDuration: number;
}

export interface FPSInfo {
  current: number;
  avg: number;
  min: number;
  frames: number;
}

export interface TelemetrySnapshot {
  timestamp: string;
  url: string;
  webVitals: WebVitals;
  memory: MemoryInfo | null;
  network: NetworkInfo | null;
  navigation: NavigationTiming | null;
  errors: ErrorStats;
  longTasks: LongTaskInfo;
  fps: FPSInfo;
}

export interface TelemetryConfig {
  enabled: boolean;
  sampleRate: number;           // 0-1, how often to collect (1 = always)
  collectInterval: number;      // ms between snapshots
  fpsSampleDuration: number;    // ms to sample FPS
  maxErrorHistory: number;      // max errors to track
  reportToConsole: boolean;
  onCollect?: (snapshot: TelemetrySnapshot) => void;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: TelemetryConfig = {
  enabled: true,
  sampleRate: 1.0,
  collectInterval: 30000,       // 30 seconds
  fpsSampleDuration: 2000,      // 2 second FPS sample
  maxErrorHistory: 100,
  reportToConsole: import.meta.env.DEV,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function shouldSample(rate: number): boolean {
  return Math.random() < rate;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Telemetry Collector ────────────────────────────────────────────────────

class TelemetryCollector {
  private config: TelemetryConfig;
  private webVitals: WebVitals = { lcp: null, cls: null, inp: null, fcp: null, ttfb: null };
  private errorStats: ErrorStats = { total: 0, uncaught: 0, unhandledRejections: 0, lastError: null, lastErrorTime: null };
  private longTasks: LongTaskInfo = { count: 0, totalDuration: 0, avgDuration: 0, maxDuration: 0 };
  private fpsInfo: FPSInfo = { current: 60, avg: 60, min: 60, frames: 0 };
  private collectTimer: ReturnType<typeof setInterval> | null = null;
  private fpsFrames: number[] = [];
  private lastFrameTime: number = 0;
  private fpsRunning = false;

  constructor(config?: Partial<TelemetryConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.init();
  }

  // ── Initialization ─────────────────────────────────────────────────────

  private init() {
    if (!this.config.enabled) return;

    this.setupWebVitals();
    this.setupErrorTracking();
    this.setupLongTaskObserver();
    this.startFPSSampling();
    this.startPeriodicCollection();
  }

  // ── Web Vitals ─────────────────────────────────────────────────────────

  private setupWebVitals() {
    // LCP — Largest Contentful Paint
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        if (entries.length > 0) {
          this.webVitals.lcp = entries[entries.length - 1].startTime;
        }
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch {
      // LCP not supported
    }

    // CLS — Cumulative Layout Shift
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        this.webVitals.cls = clsValue;
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch {
      // CLS not supported
    }

    // INP — Interaction to Next Paint
    try {
      let maxInp = 0;
      const inpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > maxInp) {
            maxInp = entry.duration;
          }
        }
        this.webVitals.inp = maxInp;
      });
      inpObserver.observe({ type: 'first-input', buffered: true });
    } catch {
      // INP not supported
    }

    // FCP — First Contentful Paint
    try {
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        if (entries.length > 0) {
          this.webVitals.fcp = entries[0].startTime;
        }
      });
      fcpObserver.observe({ type: 'paint', buffered: true });
    } catch {
      // FCP not supported
    }

    // TTFB — Time to First Byte (from navigation timing)
    const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navEntries.length > 0) {
      this.webVitals.ttfb = navEntries[0].responseStart;
    }
  }

  // ── Error Tracking ─────────────────────────────────────────────────────

  private setupErrorTracking() {
    window.addEventListener('error', (event) => {
      this.errorStats.total++;
      this.errorStats.uncaught++;
      this.errorStats.lastError = event.message || String(event.error);
      this.errorStats.lastErrorTime = new Date().toISOString();
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.errorStats.total++;
      this.errorStats.unhandledRejections++;
      this.errorStats.lastError = String(event.reason);
      this.errorStats.lastErrorTime = new Date().toISOString();
    });
  }

  // ── Long Tasks ─────────────────────────────────────────────────────────

  private setupLongTaskObserver() {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.longTasks.count++;
          this.longTasks.totalDuration += entry.duration;
          this.longTasks.avgDuration = this.longTasks.totalDuration / this.longTasks.count;
          if (entry.duration > this.longTasks.maxDuration) {
            this.longTasks.maxDuration = entry.duration;
          }
        }
      });
      observer.observe({ type: 'longtask', buffered: true });
    } catch {
      // Long Task API not supported
    }
  }

  // ── FPS Sampling ───────────────────────────────────────────────────────

  private startFPSSampling() {
    if (!this.config.enabled) return;

    const sampleFPS = () => {
      this.fpsFrames = [];
      this.fpsRunning = true;
      this.lastFrameTime = performance.now();

      const frame = (now: number) => {
        if (!this.fpsRunning) return;

        const delta = now - this.lastFrameTime;
        if (delta > 0) {
          const fps = 1000 / delta;
          this.fpsFrames.push(fps);

          // Keep last N frames for averaging
          if (this.fpsFrames.length > 60) {
            this.fpsFrames.shift();
          }
        }

        this.lastFrameTime = now;
        requestAnimationFrame(frame);
      };

      requestAnimationFrame(frame);

      // Calculate FPS after sample duration
      setTimeout(() => {
        this.fpsRunning = false;
        if (this.fpsFrames.length > 0) {
          this.fpsInfo.current = Math.round(this.fpsFrames[this.fpsFrames.length - 1]);
          this.fpsInfo.avg = Math.round(
            this.fpsFrames.reduce((a, b) => a + b, 0) / this.fpsFrames.length
          );
          this.fpsInfo.min = Math.round(Math.min(...this.fpsFrames));
          this.fpsInfo.frames = this.fpsFrames.length;
        }
      }, this.config.fpsSampleDuration);
    };

    // Sample FPS periodically
    sampleFPS();
    setInterval(sampleFPS, this.config.collectInterval);
  }

  // ── Memory Info ────────────────────────────────────────────────────────

  private _getMemoryInfo(): MemoryInfo | null {
    const perf = performance as any;
    if (!perf.memory) return null;

    const mem = perf.memory;
    return {
      usedJSHeapSize: mem.usedJSHeapSize,
      totalJSHeapSize: mem.totalJSHeapSize,
      jsHeapSizeLimit: mem.jsHeapSizeLimit,
      usagePercent: Math.round((mem.usedJSHeapSize / mem.jsHeapSizeLimit) * 100),
    };
  }

  // ── Network Info ───────────────────────────────────────────────────────

  private _getNetworkInfo(): NetworkInfo | null {
    const conn = (navigator as any).connection;
    if (!conn) return null;

    return {
      effectiveType: conn.effectiveType || 'unknown',
      downlink: conn.downlink || 0,
      rtt: conn.rtt || 0,
      saveData: conn.saveData || false,
      type: conn.type || 'unknown',
    };
  }

  // ── Navigation Timing ──────────────────────────────────────────────────

  private getNavigationTiming(): NavigationTiming | null {
    const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navEntries.length === 0) return null;

    const nav = navEntries[0];
    return {
      dnsLookup: nav.domainLookupEnd - nav.domainLookupStart,
      tcpConnection: nav.connectEnd - nav.connectStart,
      tlsNegotiation: nav.secureConnectionStart > 0 ? nav.connectEnd - nav.secureConnectionStart : 0,
      requestTime: nav.responseStart - nav.requestStart,
      responseTime: nav.responseEnd - nav.responseStart,
      domParsing: nav.domInteractive - nav.responseEnd,
      domContentLoaded: nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart,
      pageLoad: nav.loadEventEnd - nav.startTime,
      redirectCount: nav.redirectCount,
    };
  }

  // ── Periodic Collection ────────────────────────────────────────────────

  private startPeriodicCollection() {
    this.collectTimer = setInterval(() => {
      if (shouldSample(this.config.sampleRate)) {
        this.collect();
      }
    }, this.config.collectInterval);
  }

  // ── Public API ─────────────────────────────────────────────────────────

  collect(): TelemetrySnapshot {
    const snapshot: TelemetrySnapshot = {
      timestamp: new Date().toISOString(),
      url: window.location.pathname + window.location.search,
      webVitals: { ...this.webVitals },
      memory: this._getMemoryInfo(),
      network: this._getNetworkInfo(),
      navigation: this.getNavigationTiming(),
      errors: { ...this.errorStats },
      longTasks: { ...this.longTasks },
      fps: { ...this.fpsInfo },
    };

    // Log to audit trail with 'performance' category
    try {
      auditLogger.log('debug', 'performance', 'telemetry_snapshot', {
        url: snapshot.url,
        webVitals: snapshot.webVitals,
        memory: snapshot.memory,
        network: snapshot.network,
        navigation: snapshot.navigation,
        errors: snapshot.errors,
        longTasks: snapshot.longTasks,
        fps: snapshot.fps,
      });
    } catch (e) {
      // Silently fail if auditLogger is not available
      if (this.config.reportToConsole) {
        console.warn('[Telemetry] Failed to log to audit trail:', e);
      }
    }

    if (this.config.reportToConsole) {
      this.printSnapshot(snapshot);
    }

    if (this.config.onCollect) {
      this.config.onCollect(snapshot);
    }

    return snapshot;
  }

  getSnapshot(): TelemetrySnapshot {
    return this.collect();
  }

  getWebVitals(): WebVitals {
    return { ...this.webVitals };
  }

  getMemoryInfo(): MemoryInfo | null {
    return this.getMemoryInfo();
  }

  getNetworkInfo(): NetworkInfo | null {
    return this.getNetworkInfo();
  }

  getErrorStats(): ErrorStats {
    return { ...this.errorStats };
  }

  getLongTasks(): LongTaskInfo {
    return { ...this.longTasks };
  }

  getFPSInfo(): FPSInfo {
    return { ...this.fpsInfo };
  }

  updateConfig(config: Partial<TelemetryConfig>) {
    this.config = { ...this.config, ...config };
  }

  // ── Formatting ─────────────────────────────────────────────────────────

  private printSnapshot(snapshot: TelemetrySnapshot) {
    const { webVitals, memory, network, errors, longTasks, fps } = snapshot;

    console.group('%c📊 Telemetry Snapshot', 'color: #8b5cf6; font-weight: bold; font-size: 12px');

    // Web Vitals
    console.log(
      `%c🎯 Web Vitals`,
      'color: #3b82f6; font-weight: bold',
      `\n  LCP: ${webVitals.lcp ? Math.round(webVitals.lcp) + 'ms' : 'N/A'} | ` +
      `CLS: ${webVitals.cls !== null ? webVitals.cls.toFixed(3) : 'N/A'} | ` +
      `INP: ${webVitals.inp ? Math.round(webVitals.inp) + 'ms' : 'N/A'} | ` +
      `FCP: ${webVitals.fcp ? Math.round(webVitals.fcp) + 'ms' : 'N/A'} | ` +
      `TTFB: ${webVitals.ttfb ? Math.round(webVitals.ttfb) + 'ms' : 'N/A'}`
    );

    // Memory
    if (memory) {
      console.log(
        `%c💾 JS Heap Memory`,
        'color: #10b981; font-weight: bold',
        `\n  Used: ${formatBytes(memory.usedJSHeapSize)} / ` +
        `Limit: ${formatBytes(memory.jsHeapSizeLimit)} (${memory.usagePercent}%)`
      );
    } else {
      console.log(`%c💾 JS Heap Memory`, 'color: #10b981; font-weight: bold', '\n  Not supported in this browser');
    }

    // Network
    if (network) {
      console.log(
        `%c🌐 Network`,
        'color: #f59e0b; font-weight: bold',
        `\n  Type: ${network.effectiveType} | ` +
        `Downlink: ${network.downlink}Mbps | ` +
        `RTT: ${network.rtt}ms | ` +
        `SaveData: ${network.saveData}`
      );
    }

    // Errors
    if (errors.total > 0) {
      console.log(
        `%c❌ Errors`,
        'color: #ef4444; font-weight: bold',
        `\n  Total: ${errors.total} | ` +
        `Uncaught: ${errors.uncaught} | ` +
        `Unhandled: ${errors.unhandledRejections}`
      );
    }

    // Long Tasks
    if (longTasks.count > 0) {
      console.log(
        `%c⏱️ Long Tasks`,
        'color: #f97316; font-weight: bold',
        `\n  Count: ${longTasks.count} | ` +
        `Avg: ${Math.round(longTasks.avgDuration)}ms | ` +
        `Max: ${Math.round(longTasks.maxDuration)}ms`
      );
    }

    // FPS
    console.log(
      `%c🎬 FPS`,
      'color: #a855f7; font-weight: bold',
      `\n  Current: ${fps.current} | Avg: ${fps.avg} | Min: ${fps.min}`
    );

    console.groupEnd();
  }

  // ── Cleanup ────────────────────────────────────────────────────────────

  destroy() {
    if (this.collectTimer) {
      clearInterval(this.collectTimer);
    }
    this.fpsRunning = false;
  }
}

// ─── Singleton Export ────────────────────────────────────────────────

import { auditLogger } from './logger';

export const telemetry = new TelemetryCollector();

// ─── Convenience Exports ─────────────────────────────────────────────────────

export function getWebVitals() {
  return telemetry.getWebVitals();
}

export function getMemoryInfo() {
  return telemetry.getMemoryInfo();
}

export function getNetworkInfo() {
  return telemetry.getNetworkInfo();
}

export function getErrorStats() {
  return telemetry.getErrorStats();
}

export function collectTelemetry() {
  return telemetry.collect();
}
