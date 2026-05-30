/**
 * Tests for logFormat.ts
 * Path: src/lib/logFormat.test.ts
 */
import { formatAsLogLine, parseLogLine } from './logFormat';
import type { AuditLogEntry } from './logger';

describe('logFormat', () => {
  const mockEntry: AuditLogEntry = {
    id: 'log_123',
    timestamp: '2026-05-02T10:30:00.000Z',
    level: 'info',
    category: 'auth',
    action: 'User logged in',
    user: 'admin',
    details: { method: 'password' },
    sessionId: 'sess_abc123',
    ip: '127.0.0.1',
  };

  it('formats an AuditLogEntry as a .log line', () => {
    const line = formatAsLogLine(mockEntry);
    expect(line).toBe(
      '2026-05-02T10:30:00.000Z | sess_abc123 | admin | 127.0.0.1 | auth | User logged in | info | {"method":"password"}'
    );
  });

  it('uses defaults for missing fields', () => {
    const minimal: AuditLogEntry = {
      id: 'log_1',
      timestamp: '2026-05-02T12:00:00.000Z',
      level: 'debug',
      category: 'navigation',
      action: 'Navigated',
      user: 'anonymous',
      details: {},
    };
    const line = formatAsLogLine(minimal);
    expect(line).toContain('anonymous');
    expect(line).toContain('navigation');
    expect(line).toContain('Navigated');
  });

  it('parseLogLine reverses formatAsLogLine', () => {
    const line = formatAsLogLine(mockEntry);
    const parsed = parseLogLine(line);
    expect(parsed).not.toBeNull();
    expect(parsed!.timestamp).toBe(mockEntry.timestamp);
    expect(parsed!.session).toBe(mockEntry.sessionId);
    expect(parsed!.user).toBe(mockEntry.user);
    expect(parsed!.category).toBe(mockEntry.category);
    expect(parsed!.action).toBe(mockEntry.action);
    expect(parsed!.level).toBe(mockEntry.level);
  });

  it('returns null for malformed lines', () => {
    expect(parseLogLine('not a valid log line')).toBeNull();
    expect(parseLogLine('')).toBeNull();
  });
});