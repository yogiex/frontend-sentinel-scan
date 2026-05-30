import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import uiReducer, {
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  addNotification,
  markNotificationRead,
  clearNotifications
} from './uiSlice';
import type { Theme } from '@/types/ui';

describe('uiSlice', () => {
  let store: ReturnType<typeof configureStore<{ ui: ReturnType<typeof uiReducer> }>>;

  beforeEach(() => {
    store = configureStore({
      reducer: { ui: uiReducer }
    });
  });

  it('should return initial state', () => {
    const state = store.getState().ui;
    expect(state.sidebarOpen).toBe(true);
    expect(state.theme).toBe('dark');
    expect(state.notifications).toEqual([]);
  });

  it('should handle toggleSidebar', () => {
    store.dispatch(toggleSidebar());
    expect(store.getState().ui.sidebarOpen).toBe(false);
    
    store.dispatch(toggleSidebar());
    expect(store.getState().ui.sidebarOpen).toBe(true);
  });

  it('should handle setSidebarOpen', () => {
    store.dispatch(setSidebarOpen(false));
    expect(store.getState().ui.sidebarOpen).toBe(false);
    
    store.dispatch(setSidebarOpen(true));
    expect(store.getState().ui.sidebarOpen).toBe(true);
  });

  it('should handle setTheme', () => {
    store.dispatch(setTheme('light' as Theme));
    expect(store.getState().ui.theme).toBe('light');
    
    store.dispatch(setTheme('dark' as Theme));
    expect(store.getState().ui.theme).toBe('dark');
  });

  it('should handle addNotification', () => {
    store.dispatch(addNotification({
      message: 'Test notification',
      type: 'info'
    }));
    
    const state = store.getState().ui;
    expect(state.notifications.length).toBe(1);
    expect(state.notifications[0].message).toBe('Test notification');
    expect(state.notifications[0].read).toBe(false);
  });

  it('should handle markNotificationRead', () => {
    store.dispatch(addNotification({
      message: 'Test notification',
      type: 'info'
    }));
    
    const notificationId = store.getState().ui.notifications[0].id;
    store.dispatch(markNotificationRead(notificationId));
    
    expect(store.getState().ui.notifications[0].read).toBe(true);
  });

  it('should handle clearNotifications', () => {
    store.dispatch(addNotification({
      message: 'Test 1',
      type: 'info'
    }));
    store.dispatch(addNotification({
      message: 'Test 2',
      type: 'error'
    }));
    
    store.dispatch(clearNotifications());
    expect(store.getState().ui.notifications).toEqual([]);
  });
});