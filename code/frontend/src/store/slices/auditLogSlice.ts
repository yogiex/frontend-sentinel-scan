/**
 * SentinelScan — Audit Log Redux Slice
 * Path: src/store/slices/auditLogSlice.ts
 *
 * Redux slice for audit log state management, synced with the core logger.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AuditLogEntry, LogLevel, AuditCategory } from '../../lib/logger';

interface AuditLogState {
  entries: AuditLogEntry[];
  filteredEntries: AuditLogEntry[];
  filter: {
    level: LogLevel | 'all';
    category: AuditCategory | 'all';
    user: string;
    search: string;
    from: string;
    to: string;
  };
  stats: {
    total: number;
    byLevel: Record<LogLevel, number>;
    byCategory: { category: string; count: number }[];
    byUser: { user: string; count: number }[];
  };
  loading: boolean;
}

const initialState: AuditLogState = {
  entries: [],
  filteredEntries: [],
  filter: {
    level: 'all',
    category: 'all',
    user: '',
    search: '',
    from: '',
    to: '',
  },
  stats: {
    total: 0,
    byLevel: { debug: 0, info: 0, warn: 0, error: 0, critical: 0 },
    byCategory: [],
    byUser: [],
  },
  loading: false,
};

// Helper: compute stats from entries
function computeStats(entries: AuditLogEntry[]) {
  const byLevel: Record<LogLevel, number> = { debug: 0, info: 0, warn: 0, error: 0, critical: 0 };
  const categoryMap: Record<string, number> = {};
  const userMap: Record<string, number> = {};

  entries.forEach((e) => {
    byLevel[e.level]++;
    categoryMap[e.category] = (categoryMap[e.category] || 0) + 1;
    userMap[e.user] = (userMap[e.user] || 0) + 1;
  });

  return {
    total: entries.length,
    byLevel,
    byCategory: Object.entries(categoryMap).map(([category, count]) => ({ category, count })),
    byUser: Object.entries(userMap).map(([user, count]) => ({ user, count })),
  };
}

// Helper: apply all filters to entries
function applyAllFilters(entries: AuditLogEntry[], filter: AuditLogState['filter']): AuditLogEntry[] {
  let result = [...entries];

  if (filter.level !== 'all') {
    result = result.filter((e) => e.level === filter.level);
  }
  if (filter.category !== 'all') {
    result = result.filter((e) => e.category === filter.category);
  }
  if (filter.user) {
    result = result.filter((e) => e.user === filter.user);
  }
  if (filter.from) {
    result = result.filter((e) => e.timestamp >= filter.from);
  }
  if (filter.to) {
    result = result.filter((e) => e.timestamp <= filter.to);
  }
  if (filter.search) {
    const q = filter.search.toLowerCase();
    result = result.filter(
      (e) =>
        e.action.toLowerCase().includes(q) ||
        e.user.toLowerCase().includes(q) ||
        JSON.stringify(e.details).toLowerCase().includes(q)
    );
  }

  return result;
}

const auditLogSlice = createSlice({
  name: 'auditLog',
  initialState,
  reducers: {
    loadEntries: (state, action: PayloadAction<AuditLogEntry[]>) => {
      state.entries = action.payload;
      state.filteredEntries = applyAllFilters(action.payload, state.filter);
      state.stats = computeStats(action.payload);
    },
    addEntry: (state, action: PayloadAction<AuditLogEntry>) => {
      state.entries.unshift(action.payload);
      // Re-apply filters to include new entry if it matches
      state.filteredEntries = applyAllFilters(state.entries, state.filter);
      state.stats = computeStats(state.entries);
    },
    setFilter: (
      state,
      action: PayloadAction<Partial<AuditLogState['filter']>>
    ) => {
      state.filter = { ...state.filter, ...action.payload };
      state.filteredEntries = applyAllFilters(state.entries, state.filter);
    },
    applyFilters: (state, action: PayloadAction<AuditLogEntry[]>) => {
      state.filteredEntries = action.payload;
    },
    updateStats: (state, action: PayloadAction<AuditLogState['stats']>) => {
      state.stats = action.payload;
    },
    clearEntries: (state) => {
      state.entries = [];
      state.filteredEntries = [];
      state.stats = {
        total: 0,
        byLevel: { debug: 0, info: 0, warn: 0, error: 0, critical: 0 },
        byCategory: [],
        byUser: [],
      };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const {
  loadEntries,
  addEntry,
  setFilter,
  applyFilters,
  updateStats,
  clearEntries,
  setLoading,
} = auditLogSlice.actions;

// Selectors
export const selectEntries = (state: { auditLog: AuditLogState }) => state.auditLog.entries;
export const selectFilteredEntries = (state: { auditLog: AuditLogState }) => state.auditLog.filteredEntries;
export const selectFilter = (state: { auditLog: AuditLogState }) => state.auditLog.filter;
export const selectStats = (state: { auditLog: AuditLogState }) => state.auditLog.stats;
export const selectLoading = (state: { auditLog: AuditLogState }) => state.auditLog.loading;

export default auditLogSlice.reducer;
