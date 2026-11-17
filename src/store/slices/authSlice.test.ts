import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import authReducer, { mockLogin, logout, clearError, setCredentials } from './authSlice';
import type { AuthState } from '@/types/auth';

describe('authSlice', () => {
  let store: ReturnType<typeof configureStore<{ auth: AuthState }>>;

  beforeEach(() => {
    store = configureStore({
      reducer: { auth: authReducer }
    });
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('should return initial state', () => {
    const state = store.getState().auth;
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBe(null);
    expect(state.token).toBe(null);
    expect(state.loading).toBe(false);
    expect(state.error).toBe(null);
  });

  it('should handle logout', () => {
    // Set initial authenticated state
    store.dispatch(setCredentials({
      user: { id: '1', username: 'admin', email: 'admin@test.com', role: 'admin' },
      token: 'test-token'
    }));
    
    store.dispatch(logout());
    
    const state = store.getState().auth;
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBe(null);
    expect(localStorage.getItem('authToken')).toBe(null);
  });

  it('should handle clearError', () => {
    // Dispatch a failed login to set error
    store.dispatch(mockLogin({ username: 'wrong', password: 'wrong' }));
    
    // Wait for rejection
    setTimeout(() => {
      store.dispatch(clearError());
      expect(store.getState().auth.error).toBe(null);
    }, 100);
  });

  it('should handle successful mock login', async () => {
    const result = await store.dispatch(mockLogin({ username: 'admin', password: 'admin' }));
    
    if (mockLogin.fulfilled.match(result)) {
      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(true);
      expect(state.user?.username).toBe('admin');
      expect(state.token).toContain('mock-jwt-token-');
      expect(localStorage.getItem('authToken')).toBe(state.token);
    }
  });
});
