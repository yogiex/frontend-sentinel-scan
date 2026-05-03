/**
 * SentinelScan — useAuditLog Hook
 * Path: src/hooks/useAuditLog.ts
 *
 * React hook for easy audit logging from components.
 * Wraps the core logger with Redux integration.
 */

import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../store';
import { auditLogger, type LogLevel, type AuditCategory } from '../lib/logger';
import { addEntry } from '../store/slices/auditLogSlice';

export function useAuditLog() {
  const dispatch = useDispatch<AppDispatch>();

  const log = useCallback(
    (
      level: LogLevel,
      category: AuditCategory,
      action: string,
      details: Record<string, unknown> = {}
    ) => {
      const entry = auditLogger.log(level, category, action, details);
      if (entry && entry.id) {
        dispatch(addEntry(entry));
      }
      return entry;
    },
    [dispatch]
  );

  const debug = useCallback(
    (category: AuditCategory, action: string, details?: Record<string, unknown>) =>
      log('debug', category, action, details),
    [log]
  );

  const info = useCallback(
    (category: AuditCategory, action: string, details?: Record<string, unknown>) =>
      log('info', category, action, details),
    [log]
  );

  const warn = useCallback(
    (category: AuditCategory, action: string, details?: Record<string, unknown>) =>
      log('warn', category, action, details),
    [log]
  );

  const error = useCallback(
    (category: AuditCategory, action: string, details?: Record<string, unknown>) =>
      log('error', category, action, details),
    [log]
  );

  const critical = useCallback(
    (category: AuditCategory, action: string, details?: Record<string, unknown>) =>
      log('critical', category, action, details),
    [log]
  );

  return { log, debug, info, warn, error, critical };
}
