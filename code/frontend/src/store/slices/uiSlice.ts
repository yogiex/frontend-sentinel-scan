import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { UIState, Notification } from '@/types/ui';

const initialState: UIState = {
  sidebarOpen: true,
  theme: 'dark',
  notifications: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
    },
    addNotification: (state, action: PayloadAction<{ message: string; type: 'info' | 'success' | 'warning' | 'error' }>) => {
      const notification: Notification = {
        id: Date.now().toString(),
        message: action.payload.message,
        type: action.payload.type,
        read: false,
        createdAt: new Date().toISOString(),
      };
      state.notifications.push(notification);
    },
    markNotificationRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  addNotification,
  markNotificationRead,
  clearNotifications,
} = uiSlice.actions;

export default uiSlice.reducer;
