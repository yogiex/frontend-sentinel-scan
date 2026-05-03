import { describe, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import auditLogReducer, {
  loadEntries,
  addEntry,
  setFilter,
  applyFilters,
  updateStats,
  clearEntries,
  setLoading,
  type AuditLogState,
} from './auditLogSlice';
import type { AuditLogEntry, LogLevel, AuditCategory } from '@/lib/logger';

describe('auditLogSlice', () => {
  const createMockEntry = (overrides?: Partial<AuditLogEntry>): AuditLogEntry => ({
    id: 'log_1',
    timestamp: new Date().toISOString(),
    level: 'info',
    category: 'auth',
    action: 'Test action',
    user: 'admin',
    details: {},
    sessionId: 'sess_1',
    ...overrides,
  });

  it('loads entries', () => {
    const entries = [createMockEntry()];
    const state = auditLogReducer(undefined, loadEntries(entries));
    expect(state.entries).toHaveLength(1);
    expect(state.filteredEntries).toHaveLength(1);
  });

  it('adds entry', () => {
    const entry = createMockEntry();
    const state = auditLogReducer(undefined, addEntry(entry));
    expect(state.entries[0].id).toBe('log_1');
  });

  it('sets filter and applies filters', () => {
    const entries = [
      createMockEntry({ level: 'info' }),
      createMockEntry({ level: 'error' }),
    ];
    let state = auditLogReducer(undefined, loadEntries(entries));
    state = auditLogReducer(state, setFilter({ level: 'error' }));
    expect(state.filter.level).toBe('error');
  });

  it('handles date range filter', () => {
    const entries = [
      createMockEntry({ timestamp: '2026-01-01T00:00:00Z' }),
      createMockEntry({ timestamp: '2026-02-01T00:00:00Z' }),
    ];
    let state = auditLogReducer(undefined, loadEntries(entries));
    state = auditLogReducer(state, setFilter({ from: '2026-01-15', to: '2026-02-15' }));
    expect(state.filter.from).toBe('2026-01-15');
    expect(state.filter.to).toBe('2026-02-15');
  });

  it('clears entries', () => {
    const entries = [createMockEntry()];
    let state = auditLogReducer(undefined, loadEntries(entries));
    state = auditLogReducer(state, clearEntries());
    expect(state.entries).toHaveLength(0);
  });

  it('sets loading state', () => {
    const state = auditLogReducer(undefined, setLoading(true));
    expect(state.loading).toBe(true);
  });
});
