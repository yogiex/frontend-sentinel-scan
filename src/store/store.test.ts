/**
 * SentinelScan Store Tests
 * Path: src/store/store.test.ts
 */
import { describe, it, expect } from 'vitest';
import { store } from './index';
import { toggleSidebar, setTheme } from './slices/uiSlice';
import { mockLogin } from './slices/authSlice';

describe('Redux Store', () => {
  it('should have correct initial state', () => {
    const state = store.getState();
    expect(state.ui.sidebarOpen).toBe(true);
    expect(state.ui.theme).toBe('dark');
    expect(state.auth.isAuthenticated).toBe(false);
  });

  it('should handle ui slice actions', () => {
    store.dispatch(toggleSidebar());
    expect(store.getState().ui.sidebarOpen).toBe(false);

    store.dispatch(setTheme('light'));
    expect(store.getState().ui.theme).toBe('light');
  });

  it('should handle auth slice actions', async () => {
    const credentials = { username: 'admin', password: 'admin' };
    await store.dispatch(mockLogin(credentials));
    expect(store.getState().auth.isAuthenticated).toBe(true);
  });
});
