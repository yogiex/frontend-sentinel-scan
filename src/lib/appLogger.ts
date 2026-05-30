/**
 * SentinelScan — Application Logger
 * Path: src/lib/appLogger.ts
 *
 * Application-level logging system for frontend events.
 * Complements Nginx HTTP request logging by capturing:
 *   - Component lifecycle events
 *   - User interactions
 *   - State changes
 *   - Form submissions
 *   - API calls (when backend exists)
 *   - Errors and exceptions
 *
 * Output: Console (dev), localStorage (persistence), Backend API (future)
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type AppLogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export type AppLogModule =
  | 'app'          // Application lifecycle (init, config, etc.)
  | 'auth'         // Authentication events
  | 'navigation'   // Route changes, navigation
  | 'component'    // Component mount/unmount/render
  | 'form'         // Form submissions, validation
  | 'state'        // State management (Redux, context)
  | 'api'          // API calls (future backend)
  | 'ui'           // UI interactions (clicks, modals, etc.)
  | 'performance'  // Performance metrics
  | 'error';       // Errors and exceptions

export interface AppLogEntry {
  id: string;
  timestamp: string;
  level: AppLogLevel;
  module: AppLogModule;
  message: string;
  data?: Record<string, unknown>;
  stack?: string;
  component?: string;
  url: string;
  userAgent: string;
  sessionId: string;
}

export interface AppLoggerConfig {
  enabled: boolean;
  minLevel: AppLogLevel;
  consoleOutput: boolean;
  persistToStorage: boolean;
  maxEntries: number;
  includeStackTrace: boolean;
  includeComponentName: boolean;
  batchSize: number;        // Batch size for API sending (future)
  flushInterval: number;    // Flush interval in ms (future)
}

// ─── Constants ───────────────────────────────────────────────────────────────

const STORAGE_KEY = 'sentinelscan_app_logs';

const DEFAULT_CONFIG: AppLoggerConfig = {
  enabled: true,
  minLevel: 'debug',
  consoleOutput: import.meta.env.DEV,
  persistToStorage: true,
  maxEntries: 10000,
  includeStackTrace: true,
  includeComponentName: true,
  batchSize: 50,
  flushInterval: 5000,
};

const LEVEL_PRIORITY: Record<AppLogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4,
};

const LEVEL_COLORS: Record<AppLogLevel, string> = {
  debug: '#94a3b8',
  info: '#3b82f6',
  warn: '#f59e0b',
  error: '#ef4444',
  fatal: '#dc2626',
};

const LEVEL_ICONS: Record<AppLogLevel, string> = {
  debug: '🔍',
  info: 'ℹ️',
  warn: '⚠️',
  error: '❌',
  fatal: '🚨',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateId(): string {
  return `app_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function getSessionId(): string {
  let sid = sessionStorage.getItem('sentinelscan_session_id');
  if (!sid) {
    sid = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem('sentinelscan_session_id', sid);
  }
  return sid;
}

function truncate(str: string, maxLen: number): string {
  return str.length > maxLen ? str.substring(0, maxLen) + '...' : str;
}

// ─── AppLogger Class ─────────────────────────────────────────────────────────

export class AppLogger {
  private config: AppLoggerConfig;
  private entries: AppLogEntry[] = [];
  private batch: AppLogEntry[] = [];
  private _flushTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(config?: Partial<AppLoggerConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.loadFromStorage();
    this.startFlushTimer();
  }

  // ── Public API ───────────────────────────────────────────────────────────

  log(
    level: AppLogLevel,
    module: AppLogModule,
    message: string,
    data?: Record<string, unknown>,
    component?: string
  ): AppLogEntry {
    if (!this.config.enabled) return {} as AppLogEntry;
    if (LEVEL_PRIORITY[level] < LEVEL_PRIORITY[this.config.minLevel]) {
      return {} as AppLogEntry;
    }

    const entry: AppLogEntry = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      level,
      module,
      message: truncate(message, 500),
      data,
      component: this.config.includeComponentName ? component : undefined,
      url: window.location.pathname + window.location.search,
      userAgent: navigator.userAgent,
      sessionId: getSessionId(),
    };

    // Add stack trace for errors
    if (this.config.includeStackTrace && (level === 'error' || level === 'fatal')) {
      entry.stack = new Error().stack?.split('\n').slice(2).join('\n');
    }

    this.entries.unshift(entry);
    this.batch.push(entry);

    // Rotate if exceeding max
    if (this.entries.length > this.config.maxEntries) {
      this.entries = this.entries.slice(0, this.config.maxEntries);
    }

    // Console output
    if (this.config.consoleOutput) {
      this.printToConsole(entry);
    }

    // Persist to storage
    if (this.config.persistToStorage) {
      this.saveToStorage();
    }

    return entry;
  }

  debug(module: AppLogModule, message: string, data?: Record<string, unknown>, component?: string) {
    return this.log('debug', module, message, data, component);
  }

  info(module: AppLogModule, message: string, data?: Record<string, unknown>, component?: string) {
    return this.log('info', module, message, data, component);
  }

  warn(module: AppLogModule, message: string, data?: Record<string, unknown>, component?: string) {
    return this.log('warn', module, message, data, component);
  }

  error(module: AppLogModule, message: string, data?: Record<string, unknown>, component?: string) {
    return this.log('error', module, message, data, component);
  }

  fatal(module: AppLogModule, message: string, data?: Record<string, unknown>, component?: string) {
    return this.log('fatal', module, message, data, component);
  }

  // ── Convenience Methods ──────────────────────────────────────────────────

  // Component lifecycle
  componentMount(component: string, props?: Record<string, unknown>) {
    return this.debug('component', `Component mounted: ${component}`, { props }, component);
  }

  componentUnmount(component: string) {
    return this.debug('component', `Component unmounted: ${component}`, undefined, component);
  }

  componentError(component: string, error: Error | string) {
    const message = typeof error === 'string' ? error : error.message;
    const stack = typeof error === 'string' ? undefined : error.stack;
    return this.error('component', `Component error: ${component}`, { message, stack }, component);
  }

  // Navigation
  navigate(from: string, to: string) {
    return this.info('navigation', `Navigation: ${from} → ${to}`, { from, to });
  }

  // Form
  formSubmit(formName: string, data?: Record<string, unknown>) {
    return this.info('form', `Form submitted: ${formName}`, { formName, fieldCount: data ? Object.keys(data).length : 0 });
  }

  formError(formName: string, errors: Record<string, string>) {
    return this.warn('form', `Form validation failed: ${formName}`, { formName, errors });
  }

  // State
  stateChange(action: string, payload?: unknown) {
    return this.debug('state', `State change: ${action}`, { action, payload });
  }

  // UI
  uiInteraction(element: string, action: string, data?: Record<string, unknown>) {
    return this.debug('ui', `UI interaction: ${action} on ${element}`, { element, action, ...data });
  }

  // Performance
  performanceMetric(metric: string, value: number, unit: string = 'ms') {
    return this.info('performance', `Performance: ${metric}`, { metric, value, unit });
  }

  // Error capture
  captureError(error: Error | unknown, context?: string) {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    return this.error('error', `Error captured: ${message}`, {
      message,
      stack,
      context,
      type: error instanceof Error ? error.name : typeof error,
    });
  }

  // ── Query ────────────────────────────────────────────────────────────────

  getAll(): AppLogEntry[] {
    return [...this.entries];
  }

  filter(options: {
    level?: AppLogLevel;
    module?: AppLogModule;
    component?: string;
    from?: string;
    to?: string;
    search?: string;
  }): AppLogEntry[] {
    let results = [...this.entries];

    if (options.level) {
      results = results.filter((e) => e.level === options.level);
    }
    if (options.module) {
      results = results.filter((e) => e.module === options.module);
    }
    if (options.component) {
      results = results.filter((e) => e.component === options.component);
    }
    if (options.from) {
      results = results.filter((e) => e.timestamp >= options.from!);
    }
    if (options.to) {
      results = results.filter((e) => e.timestamp <= options.to!);
    }
    if (options.search) {
      const q = options.search.toLowerCase();
      results = results.filter(
        (e) =>
          e.message.toLowerCase().includes(q) ||
          e.module.toLowerCase().includes(q) ||
          (e.component && e.component.toLowerCase().includes(q)) ||
          JSON.stringify(e.data).toLowerCase().includes(q)
      );
    }

    return results;
  }

  getStats() {
    const all = this.entries;
    return {
      total: all.length,
      byLevel: {
        debug: all.filter((e) => e.level === 'debug').length,
        info: all.filter((e) => e.level === 'info').length,
        warn: all.filter((e) => e.level === 'warn').length,
        error: all.filter((e) => e.level === 'error').length,
        fatal: all.filter((e) => e.level === 'fatal').length,
      },
      byModule: Array.from(new Set(all.map((e) => e.module))).map((mod) => ({
        module: mod,
        count: all.filter((e) => e.module === mod).length,
      })),
      byComponent: Array.from(new Set(all.map((e) => e.component).filter(Boolean))).map((comp) => ({
        component: comp,
        count: all.filter((e) => e.component === comp).length,
      })),
      oldest: all.length > 0 ? all[all.length - 1].timestamp : null,
      newest: all.length > 0 ? all[0].timestamp : null,
    };
  }

  // ── Export ───────────────────────────────────────────────────────────────

  exportAsJson(entries?: AppLogEntry[]): string {
    const data = entries || this.entries;
    return JSON.stringify(data, null, 2);
  }

  exportAsCsv(entries?: AppLogEntry[]): string {
    const data = entries || this.entries;
    if (data.length === 0) return '';

    const headers = ['Timestamp', 'Level', 'Module', 'Component', 'Message', 'URL', 'Data'];
    const rows = data.map((e) => [
      e.timestamp,
      e.level,
      e.module,
      e.component || '',
      e.message,
      e.url,
      JSON.stringify(e.data || {}),
    ]);

    return [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  }

  downloadExport(format: 'json' | 'csv', entries?: AppLogEntry[]) {
    const content = format === 'json' ? this.exportAsJson(entries) : this.exportAsCsv(entries);
    const mime = format === 'json' ? 'application/json' : 'text/csv';
    const ext = format === 'json' ? 'json' : 'csv';
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `app-log-${new Date().toISOString().slice(0, 10)}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ── Management ───────────────────────────────────────────────────────────

  clear() {
    this.entries = [];
    this.batch = [];
    if (this.config.persistToStorage) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  updateConfig(config: Partial<AppLoggerConfig>) {
    this.config = { ...this.config, ...config };
  }

  destroy() {
    if (this._flushTimer) {
      clearInterval(this._flushTimer);
      this._flushTimer = null;
    }
  }

  getConfig(): AppLoggerConfig {
    return { ...this.config };
  }

  // ── Private ──────────────────────────────────────────────────────────────

  private loadFromStorage() {
    if (!this.config.persistToStorage) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.entries = JSON.parse(stored);
      }
    } catch {
      this.entries = [];
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.entries));
    } catch {
      // Storage full — trim oldest 20%
      this.entries = this.entries.slice(0, Math.floor(this.entries.length * 0.8));
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.entries));
      } catch {
        console.warn('[AppLogger] localStorage full, logs not persisted');
      }
    }
  }

  private printToConsole(entry: AppLogEntry) {
    const color = LEVEL_COLORS[entry.level];
    const icon = LEVEL_ICONS[entry.level];
    const componentStr = entry.component ? ` [${entry.component}]` : '';

    console.log(
      `%c${icon} [${entry.level.toUpperCase()}] ${entry.module}:${componentStr} ${entry.message}`,
      `color: ${color}; font-weight: bold`,
      `\n  URL: ${entry.url} | Time: ${new Date(entry.timestamp).toLocaleTimeString()}`,
      entry.data ? `\n  Data:` : '',
      entry.data || ''
    );

    if (entry.stack) {
      console.log(`%c  Stack:`, `color: #64748b`, entry.stack);
    }
  }

  private startFlushTimer() {
    // Future: send batch to backend API
    this._flushTimer = setInterval(() => {
      if (this.batch.length > 0) {
        // TODO: Send to backend API when available
        // this.sendToApi(this.batch);
        this.batch = [];
      }
    }, this.config.flushInterval);
  }

  // Future: send logs to backend API
  // private async sendToApi(entries: AppLogEntry[]) {
  //   try {
  //     await fetch('/api/logs', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(entries),
  //     });
  //   } catch (e) {
  //     console.warn('[AppLogger] Failed to send logs to API:', e);
  //   }
  // }
}

// ─── Singleton Export ────────────────────────────────────────────────

export const appLogger = new AppLogger();

// ─── Convenience Exports ─────────────────────────────────────────────────────

export const logApp = (message: string, data?: Record<string, unknown>) =>
  appLogger.info('app', message, data);

export const logAuth = (message: string, data?: Record<string, unknown>) =>
  appLogger.info('auth', message, data);

export const logNav = (from: string, to: string) =>
  appLogger.navigate(from, to);

export const logForm = (formName: string, data?: Record<string, unknown>) =>
  appLogger.formSubmit(formName, data);

export const logFormError = (formName: string, errors: Record<string, string>) =>
  appLogger.formError(formName, errors);

export const logState = (action: string, payload?: unknown) =>
  appLogger.stateChange(action, payload);

export const logUI = (element: string, action: string, data?: Record<string, unknown>) =>
  appLogger.uiInteraction(element, action, data);

export const logPerf = (metric: string, value: number, unit?: string) =>
  appLogger.performanceMetric(metric, value, unit);

export const logError = (error: Error | unknown, context?: string) =>
  appLogger.captureError(error, context);
