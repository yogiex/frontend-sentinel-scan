/**
 * SentinelScan — Structured Audit Logger
 * Path: src/lib/logger.ts
 *
 * Provides structured logging with levels, localStorage persistence,
 * automatic rotation, and export capabilities for audit trail.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

export type AuditCategory =
  | 'auth'
  | 'scan'
  | 'export'
  | 'user_management'
  | 'settings'
  | 'navigation'
  | 'system'
  | 'security'
  | 'performance';

export interface AuditLogEntry {
  id: string;
  timestamp: string; // ISO 8601
  level: LogLevel;
  category: AuditCategory;
  action: string;
  user: string;
  details: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  sessionId?: string;
}

export interface LoggerConfig {
  maxEntries: number;
  persistToStorage: boolean;
  storageKey: string;
  consoleOutput: boolean;
  minLevel: LogLevel;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: LoggerConfig = {
  maxEntries: 5000,
  persistToStorage: true,
  storageKey: 'sentinelscan_audit_logs',
  consoleOutput: import.meta.env.DEV,
  minLevel: 'debug',
};

// Separate storage keys for access.log and errors.log
const ACCESS_LOG_KEY = 'sentinelscan_access_logs';
const ERROR_LOG_KEY = 'sentinelscan_error_logs';

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  critical: 4,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateId(): string {
  return `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function getSessionId(): string {
  let sid = sessionStorage.getItem('sentinelscan_session_id');
  if (!sid) {
    sid = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem('sentinelscan_session_id', sid);
  }
  return sid;
}

function getCurrentUser(): string {
  try {
    const stored = localStorage.getItem('sentinelscan_user');
    if (stored) {
      const user = JSON.parse(stored);
      return user?.username || user?.email || 'anonymous';
    }
  } catch {
    // ignore
  }
  return 'anonymous';
}

// ─── Logger Class ────────────────────────────────────────────────────────────

class AuditLogger {
  private config: LoggerConfig;
  private entries: AuditLogEntry[] = [];

  constructor(config?: Partial<LoggerConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.loadFromStorage();
  }

  // ── Public API ───────────────────────────────────────────────────────────

  log(
    level: LogLevel,
    category: AuditCategory,
    action: string,
    details: Record<string, unknown> = {}
  ): AuditLogEntry {
    if (LEVEL_PRIORITY[level] < LEVEL_PRIORITY[this.config.minLevel]) {
      return {} as AuditLogEntry;
    }

    const entry: AuditLogEntry = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      level,
      category,
      action,
      user: getCurrentUser(),
      details,
      userAgent: navigator.userAgent,
      sessionId: getSessionId(),
    };

    this.entries.unshift(entry);

    // Rotate if exceeding max
    if (this.entries.length > this.config.maxEntries) {
      this.entries = this.entries.slice(0, this.config.maxEntries);
    }

    // Persist to main storage
    if (this.config.persistToStorage) {
      this.saveToStorage();
    }

    // Console output
    if (this.config.consoleOutput) {
      this.printToConsole(entry);
    }

    // Also write to access.log (all entries) and errors.log (error/critical only)
    this.writeToAccessLog(entry);
    if (level === 'error' || level === 'critical') {
      this.writeToErrorLog(entry);
    }

    return entry;
  }

  debug(category: AuditCategory, action: string, details?: Record<string, unknown>) {
    return this.log('debug', category, action, details);
  }

  info(category: AuditCategory, action: string, details?: Record<string, unknown>) {
    return this.log('info', category, action, details);
  }

  warn(category: AuditCategory, action: string, details?: Record<string, unknown>) {
    return this.log('warn', category, action, details);
  }

  error(category: AuditCategory, action: string, details?: Record<string, unknown>) {
    return this.log('error', category, action, details);
  }

  critical(category: AuditCategory, action: string, details?: Record<string, unknown>) {
    return this.log('critical', category, action, details);
  }

  // ── Query ────────────────────────────────────────────────────────────────

  getAll(): AuditLogEntry[] {
    return [...this.entries];
  }

  filter(options: {
    level?: LogLevel;
    category?: AuditCategory;
    user?: string;
    from?: string;
    to?: string;
    search?: string;
  }): AuditLogEntry[] {
    let results = [...this.entries];

    if (options.level) {
      results = results.filter((e) => e.level === options.level);
    }
    if (options.category) {
      results = results.filter((e) => e.category === options.category);
    }
    if (options.user) {
      results = results.filter((e) => e.user === options.user);
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
          e.action.toLowerCase().includes(q) ||
          e.user.toLowerCase().includes(q) ||
          JSON.stringify(e.details).toLowerCase().includes(q)
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
        critical: all.filter((e) => e.level === 'critical').length,
      },
      byCategory: Array.from(new Set(all.map((e) => e.category))).map((cat) => ({
        category: cat,
        count: all.filter((e) => e.category === cat).length,
      })),
      byUser: Array.from(new Set(all.map((e) => e.user))).map((user) => ({
        user,
        count: all.filter((e) => e.user === user).length,
      })),
      oldest: all.length > 0 ? all[all.length - 1].timestamp : null,
      newest: all.length > 0 ? all[0].timestamp : null,
    };
  }

  // ── Export ───────────────────────────────────────────────────────────────

  exportAsJson(entries?: AuditLogEntry[]): string {
    const data = entries || this.entries;
    return JSON.stringify(data, null, 2);
  }

  exportAsCsv(entries?: AuditLogEntry[]): string {
    const data = entries || this.entries;
    if (data.length === 0) return '';

    const headers = ['Timestamp', 'Level', 'Category', 'Action', 'User', 'Details'];
    const rows = data.map((e) => [
      e.timestamp,
      e.level,
      e.category,
      e.action,
      e.user,
      JSON.stringify(e.details),
    ]);

    return [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  }

  downloadExport(format: 'json' | 'csv', entries?: AuditLogEntry[]) {
    const content = format === 'json' ? this.exportAsJson(entries) : this.exportAsCsv(entries);
    const mime = format === 'json' ? 'application/json' : 'text/csv';
    const ext = format === 'json' ? 'json' : 'csv';
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ── Management ───────────────────────────────────────────────────────────

  clear() {
    this.entries = [];
    if (this.config.persistToStorage) {
      localStorage.removeItem(this.config.storageKey);
    }
  }

  updateConfig(config: Partial<LoggerConfig>) {
    this.config = { ...this.config, ...config };
  }

  getConfig(): LoggerConfig {
    return { ...this.config };
  }

  // ── Private ──────────────────────────────────────────────────────────────

  private loadFromStorage() {
    if (!this.config.persistToStorage) return;
    try {
      const stored = localStorage.getItem(this.config.storageKey);
      if (stored) {
        this.entries = JSON.parse(stored);
      }
    } catch {
      this.entries = [];
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(this.config.storageKey, JSON.stringify(this.entries));
    } catch {
      // Storage full — trim oldest 20%
      this.entries = this.entries.slice(0, Math.floor(this.entries.length * 0.8));
      try {
        localStorage.setItem(this.config.storageKey, JSON.stringify(this.entries));
      } catch {
        // Give up
        console.warn('[AuditLogger] localStorage full, logs not persisted');
      }
    }
  }

  private printToConsole(entry: AuditLogEntry) {
    const colors: Record<LogLevel, string> = {
      debug: '#94a3b8',
      info: '#3b82f6',
      warn: '#f59e0b',
      error: '#ef4444',
      critical: '#dc2626',
    };
    const icon: Record<LogLevel, string> = {
      debug: '🔍',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      critical: '🚨',
    };

    console.log(
      `%c${icon[entry.level]} [${entry.level.toUpperCase()}] ${entry.category}:${entry.action}`,
      `color: ${colors[entry.level]}; font-weight: bold`,
      `\n  User: ${entry.user} | Time: ${new Date(entry.timestamp).toLocaleString()}`,
      `\n  Details:`,
      entry.details
    );
  }

  // ── Separate Log Files: access.log & errors.log (.log format) ───────
 
  // Format entry as .log line: timestamp | session | user | ip | category | action | level | details_json
  private formatAsLogLine(entry: AuditLogEntry): string {
    const ip = entry.ip || '127.0.0.1';
    const details = JSON.stringify(entry.details || {});
    return `${entry.timestamp} | ${entry.sessionId} | ${entry.user} | ${ip} | ${entry.category} | ${entry.action} | ${entry.level} | ${details}`;
  }

  // Write to access.log (all entries) in .log format
  private writeToAccessLog(entry: AuditLogEntry) {
    try {
      const logLine = this.formatAsLogLine(entry);
      const stored = localStorage.getItem(ACCESS_LOG_KEY) || '';
      // Prepend new log line (newest first)
      const newContent = stored ? logLine + '\n' + stored : logLine;
      localStorage.setItem(ACCESS_LOG_KEY, newContent);
      
      // Simple rotation: keep only last 5000 lines
      const lines = newContent.split('\n');
      if (lines.length > 5000) {
        localStorage.setItem(ACCESS_LOG_KEY, lines.slice(0, 5000).join('\n'));
      }
    } catch {
      // Storage full - try to free space
      try {
        const stored = localStorage.getItem(ACCESS_LOG_KEY) || '';
        const lines = stored.split('\n');
        if (lines.length > 1000) {
          localStorage.setItem(ACCESS_LOG_KEY, lines.slice(0, Math.floor(lines.length * 0.8)).join('\n'));
        }
      } catch {
        console.warn('[AuditLogger] localStorage full, access log not persisted');
      }
    }
  }
 
  // Write to errors.log (only error/critical entries) in .log format
  private writeToErrorLog(entry: AuditLogEntry) {
    if (entry.level !== 'error' && entry.level !== 'critical') return;
    
    try {
      const logLine = this.formatAsLogLine(entry);
      const stored = localStorage.getItem(ERROR_LOG_KEY) || '';
      const newContent = stored ? logLine + '\n' + stored : logLine;
      localStorage.setItem(ERROR_LOG_KEY, newContent);
      
      // Keep max 1000 error lines
      const lines = newContent.split('\n');
      if (lines.length > 1000) {
        localStorage.setItem(ERROR_LOG_KEY, lines.slice(0, 1000).join('\n'));
      }
    } catch {
      try {
        const stored = localStorage.getItem(ERROR_LOG_KEY) || '';
        const lines = stored.split('\n');
        if (lines.length > 500) {
          localStorage.setItem(ERROR_LOG_KEY, lines.slice(0, Math.floor(lines.length * 0.8)).join('\n'));
        }
      } catch {
        console.warn('[AuditLogger] localStorage full, error log not persisted');
      }
    }
  }

  // Public methods for accessing separate logs
  getAccessLogs(): AuditLogEntry[] {
    try {
      const stored = localStorage.getItem(ACCESS_LOG_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  getErrorLogs(): AuditLogEntry[] {
    try {
      const stored = localStorage.getItem(ERROR_LOG_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  exportAccessLog(format: 'json' | 'csv' = 'json'): string {
    const logs = this.getAccessLogs();
    return format === 'json' ? this.exportAsJson(logs) : this.exportAsCsv(logs);
  }

  exportErrorLog(format: 'json' | 'csv' = 'json'): string {
    const logs = this.getErrorLogs();
    return format === 'json' ? this.exportAsJson(logs) : this.exportAsCsv(logs);
  }

  downloadAccessLog(format: 'json' | 'csv' = 'json') {
    const content = this.exportAccessLog(format);
    const mime = format === 'json' ? 'application/json' : 'text/csv';
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `access-log-${new Date().toISOString().slice(0, 10)}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  downloadErrorLog(format: 'json' | 'csv' = 'json') {
    const content = this.exportErrorLog(format);
    const mime = format === 'json' ? 'application/json' : 'text/csv';
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `errors-log-${new Date().toISOString().slice(0, 10)}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  clearAccessLogs() {
    localStorage.removeItem(ACCESS_LOG_KEY);
  }

  clearErrorLogs() {
    localStorage.removeItem(ERROR_LOG_KEY);
  }
}

// ─── Singleton Export ────────────────────────────────────────────────

export const auditLogger = new AuditLogger();

// ─── Convenience Exports ─────────────────────────────────────────────────────

export const logAuth = (action: string, details?: Record<string, unknown>) =>
  auditLogger.info('auth', action, details);

export const logScan = (action: string, details?: Record<string, unknown>) =>
  auditLogger.info('scan', action, details);

export const logExport = (action: string, details?: Record<string, unknown>) =>
  auditLogger.info('export', action, details);

export const logUserManagement = (action: string, details?: Record<string, unknown>) =>
  auditLogger.info('user_management', action, details);

export const logSettings = (action: string, details?: Record<string, unknown>) =>
  auditLogger.info('settings', action, details);

export const logNavigation = (action: string, details?: Record<string, unknown>) =>
  auditLogger.debug('navigation', action, details);

export const logSystem = (action: string, details?: Record<string, unknown>) =>
  auditLogger.info('system', action, details);

export const logSecurity = (action: string, details?: Record<string, unknown>) =>
  auditLogger.warn('security', action, details);
