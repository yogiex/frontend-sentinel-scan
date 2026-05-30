export type Theme = 'light' | 'dark' | 'system';

export interface UIState {
  sidebarOpen: boolean;
  theme: Theme;
  notifications: Notification[];
}

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}
