/**
 * SentinelScan — Log Format Utilities
 * Path: src/lib/logFormat.ts
 *
 * Formats AuditLogEntry objects into the .log text format:
 *   timestamp | session | user | ip | category | action | level | details_json
 */

import type { AuditLogEntry } from './logger';

/**
 * Format a single AuditLogEntry as a .log line.
 * Format: {timestamp} | {session} | {user} | {ip} | {category} | {action} | {level} | {details_json}
 */
export function formatAsLogLine(entry: AuditLogEntry): string {
  const timestamp = entry.timestamp || new Date().toISOString();
  const session = entry.sessionId || '-';
  const user = entry.user || 'anonymous';
  const ip = entry.ip || '127.0.0.1';
  const category = entry.category || '-';
  const action = entry.action || '-';
  const level = entry.level || 'info';
  const details = JSON.stringify(entry.details || {});

  return `${timestamp} | ${session} | ${user} | ${ip} | ${category} | ${action} | ${level} | ${details}`;
}

/**
 * Parse a .log line back into parts.
 * Returns null if the line doesn't match the expected format.
 */
export function parseLogLine(line: string): {
  timestamp: string;
  session: string;
  user: string;
  ip: string;
  category: string;
  action: string;
  level: string;
  details: string;
} | null {
  const parts = line.split(' | ');
  if (parts.length < 8) return null;

  return {
    timestamp: parts[0] || '',
    session: parts[1] || '',
    user: parts[2] || '',
    ip: parts[3] || '',
    category: parts[4] || '',
    action: parts[5] || '',
    level: parts[6] || '',
    details: parts.slice(7).join(' | ') || '',
  };
}
