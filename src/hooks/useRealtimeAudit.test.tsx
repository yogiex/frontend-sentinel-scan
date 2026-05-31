import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useRealtimeAudit } from './useRealtimeAudit';
import { auditLogSlice } from '@/store/slices/auditLogSlice';

function createTestStore() {
  return configureStore({
    reducer: {
      auditLog: auditLogSlice.reducer,
    },
  });
}

describe('useRealtimeAudit', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts polling when enabled', () => {
    const store = createTestStore();
    
    const { result } = renderHook(() => useRealtimeAudit(false), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });
    
    // Enable realtime
    result.current.start();
    
    expect(result.current.active).toBe(true);
  });

  it('stops polling when disabled', () => {
    const store = createTestStore();
    
    const { result } = renderHook(() => useRealtimeAudit(true), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });
    
    // Initially active
    expect(result.current.active).toBe(true);
    
    // Stop
    result.current.stop();
    
    expect(result.current.active).toBe(false);
  });

  it('toggles polling state', () => {
    const store = createTestStore();
    
    const { result } = renderHook(() => useRealtimeAudit(false), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });
    
    // Toggle on
    result.current.toggle();
    expect(result.current.active).toBe(true);
    
    // Toggle off
    result.current.toggle();
    expect(result.current.active).toBe(false);
  });
});
