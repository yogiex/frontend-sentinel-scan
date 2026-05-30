# Dashboard Layout Implementation Plan

**Goal:** Implement a complete dashboard layout with sidebar navigation, header with user menu, and dashboard index page with stats cards, recent scans table, and vulnerability chart.

**Architecture:** React SPA with Redux Toolkit for state management, Tailwind CSS v4 with dark theme (slate colors), react-router-dom v7 for routing, and recharts for data visualization. The layout uses a collapsible sidebar pattern with Outlet for nested routes.

**Design:** Based on SentinelScan Frontend Design (thoughts/shared/designs/2026-05-01-sentinel-scan-frontend-design.md)

---

## Dependency Graph

```
Batch 1 (parallel): 1.1, 1.2, 1.3 [foundation - types and store setup]
Batch 2 (parallel): 2.1, 2.2, 2.3 [layout components - depend on batch 1]
Batch 3 (parallel): 3.1, 3.2 [dashboard page and routing - depend on batch 2]
```

---

## Batch 1: Foundation (parallel - 3 implementers)

All tasks in this batch have NO dependencies and run simultaneously.

### Task 1.1: Create uiSlice.ts (Redux Slice)
**File:** `src/store/slices/uiSlice.ts`
**Test:** `src/store/slices/uiSlice.test.ts` (already exists - verify passes)
**Depends:** none

```typescript
/**
 * SentinelScan UI Redux Slice
 * Path: src/store/slices/uiSlice.ts
 *
 * Manages UI state: sidebar visibility, theme, and notifications.
 * Uses Redux Toolkit's createSlice for immutable state updates.
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Theme, Notification } from '@/types/ui';

export interface UIState {
  sidebarOpen: boolean;
  theme: Theme;
  notifications: Notification[];
}

const initialState: UIState = {
  sidebarOpen: true,
  theme: 'dark',
  notifications: [],
};

let notificationIdCounter = 0;

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
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
      // Apply theme to document
      if (action.payload === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (action.payload === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        // system - check preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    },
    addNotification: (state, action: PayloadAction<{ message: string; type: Notification['type'] }>) => {
      const id = `notification-${++notificationIdCounter}-${Date.now()}`;
      state.notifications.push({
        id,
        message: action.payload.message,
        type: action.payload.type,
        read: false,
        createdAt: new Date().toISOString(),
      });
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
```

**Verify:** `npx vitest run src/store/slices/uiSlice.test.ts`
**Commit:** `feat(store): add uiSlice for sidebar, theme, and notifications`

---

### Task 1.2: Create Redux Store Configuration
**File:** `src/store/index.ts`
**Test:** `src/store/store.test.ts`
**Depends:** none

```typescript
/**
 * SentinelScan Redux Store Configuration
 * Path: src/store/index.ts
 *
 * Central Redux store setup combining all slices.
 * Configures middleware and development tools.
 */
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks for use throughout the app
export type { RootState as AppState };
```

```typescript
/**
 * SentinelScan Store Tests
 * Path: src/store/store.test.ts
 */
import { describe, it, expect } from 'vitest';
import { store } from './index';
import { toggleSidebar, setTheme, addNotification } from './slices/uiSlice';
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
```

**Verify:** `npx vitest run src/store/store.test.ts`
**Commit:** `feat(store): configure Redux store with auth and ui slices`

---

### Task 1.3: Update main.tsx with Redux Provider
**File:** `src/main.tsx`
**Test:** none (integration tested)
**Depends:** 1.2

```typescript
/**
 * SentinelScan Application Entry Point
 * Path: src/main.tsx
 *
 * Main entry point for the React application.
 * Initializes React 19 with createRoot, wraps with Redux Provider and BrowserRouter.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { store } from './store';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
```

**Verify:** Application should start without errors
**Commit:** `feat(app): wrap with Redux Provider and BrowserRouter`

---

## Batch 2: Layout Components (parallel - 3 implementers)

All tasks in this batch depend on Batch 1 completing.

### Task 2.1: Create Sidebar Component
**File:** `src/components/layout/Sidebar.tsx`
**Test:** `src/components/layout/Sidebar.test.tsx`
**Depends:** 1.1, 1.2

```typescript
/**
 * SentinelScan Sidebar Component
 * Path: src/components/layout/Sidebar.tsx
 *
 * Collapsible sidebar navigation with menu items.
 * Uses Redux to manage open/collapsed state.
 */
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { toggleSidebar, selectSidebarOpen } from '@/store/slices/uiSlice';
import type { RootState } from '@/store';

interface NavItem {
  path: string;
  label: string;
  icon: string; // Using emoji icons for simplicity, lucide-react can replace later
}

const navItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/dashboard/scans', label: 'Scans', icon: '🔍' },
  { path: '/dashboard/templates', label: 'Templates', icon: '📋' },
  { path: '/dashboard/reports', label: 'Reports', icon: '📄' },
  { path: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
];

export function Sidebar() {
  const dispatch = useDispatch();
  const sidebarOpen = useSelector(selectSidebarOpen);
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpand = (path: string) => {
    setExpandedItems(prev =>
      prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
    );
  };

  return (
    <aside
      className={cn(
        'h-screen bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* Logo/Brand */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        {sidebarOpen ? (
          <h1 className="text-xl font-bold text-blue-400">SentinelScan</h1>
        ) : (
          <span className="text-xl font-bold text-blue-400 mx-auto">S</span>
        )}
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="text-slate-400 hover:text-white transition-colors"
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {sidebarOpen ? '◀' : '▶'}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
                'hover:bg-slate-800',
                isActive
                  ? 'bg-slate-800 text-blue-400'
                  : 'text-slate-300',
                !sidebarOpen && 'justify-center'
              )
            }
            title={!sidebarOpen ? item.label : undefined}
          >
            <span className="text-lg">{item.icon}</span>
            {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-slate-800">
        {sidebarOpen ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Admin</p>
              <p className="text-xs text-slate-400 truncate">admin@sentinelscan.com</p>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold mx-auto">
            A
          </div>
        )}
      </div>
    </aside>
  );
}
```

```typescript
/**
 * SentinelScan Sidebar Tests
 * Path: src/components/layout/Sidebar.test.tsx
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { Sidebar } from './Sidebar';
import uiReducer from '@/store/slices/uiSlice';
import authReducer from '@/store/slices/authSlice';

function renderWithProviders(initialState = {}) {
  const store = configureStore({
    reducer: { ui: uiReducer, auth: authReducer },
    preloadedState: initialState,
  });

  return render(
    <Provider store={store}>
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    </Provider>
  );
}

describe('Sidebar', () => {
  it('renders logo text when expanded', () => {
    renderWithProviders({ ui: { sidebarOpen: true, theme: 'dark', notifications: [] } });
    expect(screen.getByText('SentinelScan')).toBeInTheDocument();
  });

  it('renders collapsed logo when sidebar is closed', () => {
    renderWithProviders({ ui: { sidebarOpen: false, theme: 'dark', notifications: [] } });
    expect(screen.getByText('S')).toBeInTheDocument();
  });

  it('renders navigation items when expanded', () => {
    renderWithProviders({ ui: { sidebarOpen: true, theme: 'dark', notifications: [] } });
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Scans')).toBeInTheDocument();
    expect(screen.getByText('Templates')).toBeInTheDocument();
  });

  it('toggles sidebar when button is clicked', () => {
    renderWithProviders({ ui: { sidebarOpen: true, theme: 'dark', notifications: [] } });
    const toggleBtn = screen.getByLabelText('Collapse sidebar');
    fireEvent.click(toggleBtn);
    expect(screen.getByText('S')).toBeInTheDocument();
  });
});
```

**Verify:** `npx vitest run src/components/layout/Sidebar.test.tsx`
**Commit:** `feat(layout): add collapsible Sidebar component with navigation`

---

### Task 2.2: Create Header Component
**File:** `src/components/layout/Header.tsx`
**Test:** `src/components/layout/Header.test.tsx`
**Depends:** 1.1, 1.2

```typescript
/**
 * SentinelScan Header Component
 * Path: src/components/layout/Header.tsx
 *
 * Top navigation bar with user menu, notifications, and theme toggle.
 * Displays current page title based on route.
 */
import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  toggleSidebar,
  selectSidebarOpen,
  selectNotifications,
  markNotificationRead,
  clearNotifications,
} from '@/store/slices/uiSlice';
import type { RootState } from '@/store';

const routeTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/scans': 'Scans',
  '/dashboard/templates': 'Templates',
  '/dashboard/reports': 'Reports',
  '/dashboard/settings': 'Settings',
};

export function Header() {
  const dispatch = useDispatch();
  const sidebarOpen = useSelector(selectSidebarOpen);
  const notifications = useSelector(selectNotifications);
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;
  const pageTitle = routeTitles[location.pathname] || 'Dashboard';

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) {
        setNotifMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 sticky top-0 z-40">
      {/* Left: Menu toggle + Page title */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => dispatch(toggleSidebar())}
          className="text-slate-400 hover:text-white"
        >
          <span className="text-lg">{sidebarOpen ? '◀' : '▶'}</span>
        </Button>
        <h2 className="text-lg font-semibold text-white">{pageTitle}</h2>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative" ref={notifMenuRef}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setNotifMenuOpen(!notifMenuOpen)}
            className="text-slate-400 hover:text-white relative"
          >
            <span className="text-lg">🔔</span>
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500">
                {unreadCount}
              </Badge>
            )}
          </Button>

          {/* Notifications Dropdown */}
          {notifMenuOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-md shadow-lg z-50">
              <div className="p-3 border-b border-slate-700 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Notifications</h3>
                <button
                  onClick={() => dispatch(clearNotifications())}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Clear all
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="p-4 text-sm text-slate-400 text-center">No notifications</p>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={cn(
                        'p-3 border-b border-slate-700 hover:bg-slate-700 cursor-pointer',
                        !notif.read && 'bg-slate-700/50'
                      )}
                      onClick={() => dispatch(markNotificationRead(notif.id))}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-lg">
                          {notif.type === 'error' ? '❌' : notif.type === 'warning' ? '⚠️' : notif.type === 'success' ? '✅' : 'ℹ️'}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm text-white">{notif.message}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {new Date(notif.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <Button
            variant="ghost"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 text-slate-300 hover:text-white"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
              A
            </div>
            <span className="text-sm">Admin</span>
          </Button>

          {/* User Dropdown */}
          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-md shadow-lg z-50 py-1">
              <a href="#" className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700">
                Profile
              </a>
              <a href="#" className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700">
                Settings
              </a>
              <div className="border-t border-slate-700 my-1" />
              <a href="#" className="block px-4 py-2 text-sm text-red-400 hover:bg-slate-700">
                Logout
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
```

```typescript
/**
 * SentinelScan Header Tests
 * Path: src/components/layout/Header.test.tsx
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { Header } from './Header';
import uiReducer from '@/store/slices/uiSlice';
import authReducer from '@/store/slices/authSlice';

function renderWithProviders(initialState = {}) {
  const store = configureStore({
    reducer: { ui: uiReducer, auth: authReducer },
    preloadedState: initialState,
  });

  return render(
    <Provider store={store}>
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    </Provider>
  );
}

describe('Header', () => {
  it('renders page title based on route', () => {
    renderWithProviders({
      ui: { sidebarOpen: true, theme: 'dark', notifications: [] },
    });
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('displays notification badge when unread notifications exist', () => {
    const notifications = [
      {
        id: '1',
        message: 'Test notification',
        type: 'info' as const,
        read: false,
        createdAt: new Date().toISOString(),
      },
    ];
    renderWithProviders({
      ui: { sidebarOpen: true, theme: 'dark', notifications },
    });
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('toggles notification menu on click', () => {
    renderWithProviders({
      ui: { sidebarOpen: true, theme: 'dark', notifications: [] },
    });
    const notifBtn = screen.getByRole('button', { name: /notification/i }) || screen.getByLabelText(/notification/i);
    // The notification button has the bell emoji
    const buttons = screen.getAllByRole('button');
    const bellBtn = buttons.find(btn => btn.innerHTML.includes('🔔'));
    if (bellBtn) {
      fireEvent.click(bellBtn);
      expect(screen.getByText('Notifications')).toBeInTheDocument();
    }
  });
});
```

**Verify:** `npx vitest run src/components/layout/Header.test.tsx`
**Commit:** `feat(layout): add Header with user menu and notifications dropdown`

---

### Task 2.3: Create DashboardLayout Component
**File:** `src/components/layout/DashboardLayout.tsx`
**Test:** `src/components/layout/DashboardLayout.test.tsx`
**Depends:** 2.1, 2.2

```typescript
/**
 * SentinelScan Dashboard Layout Component
 * Path: src/components/layout/DashboardLayout.tsx
 *
 * Main layout wrapper that combines Sidebar, Header, and Outlet for nested routes.
 * Uses react-router-dom's Outlet to render child routes.
 */
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function DashboardLayout() {
  return (
    <div className="flex h-screen bg-slate-950">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
```

```typescript
/**
 * SentinelScan DashboardLayout Tests
 * Path: src/components/layout/DashboardLayout.test.tsx
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { DashboardLayout } from './DashboardLayout';
import uiReducer from '@/store/slices/uiSlice';
import authReducer from '@/store/slices/authSlice';

function renderWithProviders(initialState = {}) {
  const store = configureStore({
    reducer: { ui: uiReducer, auth: authReducer },
    preloadedState: initialState,
  });

  return render(
    <Provider store={store}>
      <BrowserRouter>
        <DashboardLayout />
      </BrowserRouter>
    </Provider>
  );
}

describe('DashboardLayout', () => {
  it('renders sidebar and header', () => {
    renderWithProviders({
      ui: { sidebarOpen: true, theme: 'dark', notifications: [] },
    });
    expect(screen.getByText('SentinelScan')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders outlet content', () => {
    renderWithProviders({
      ui: { sidebarOpen: true, theme: 'dark', notifications: [] },
    });
    // Outlet should be present (empty by default in test)
    const main = document.querySelector('main');
    expect(main).toBeInTheDocument();
  });
});
```

**Verify:** `npx vitest run src/components/layout/DashboardLayout.test.tsx`
**Commit:** `feat(layout): add DashboardLayout wrapper with Sidebar, Header, and Outlet`

---

## Batch 3: Dashboard Page & Routing (parallel - 2 implementers)

All tasks in this batch depend on Batch 2 completing.

### Task 3.1: Create Dashboard Index Page
**File:** `src/pages/Dashboard/Index.tsx`
**Test:** `src/pages/Dashboard/Index.test.tsx`
**Depends:** 2.3

```typescript
/**
 * SentinelScan Dashboard Index Page
 * Path: src/pages/Dashboard/Index.tsx
 *
 * Main dashboard page displaying stats cards, recent scans table,
 * and vulnerability distribution chart.
 * Uses mock data for now - will connect to real API later.
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Mock data - will be replaced with API calls later
const statsData = [
  { title: 'Total Assets', value: '1,234', change: '+12%', trend: 'up' },
  { title: 'Active Scans', value: '23', change: '+3', trend: 'up' },
  { title: 'Vulnerabilities', value: '456', change: '-8%', trend: 'down' },
  { title: 'Resolved', value: '89', change: '+15%', trend: 'up' },
];

const recentScans = [
  {
    id: '1',
    target: '192.168.1.0/24',
    status: 'completed',
    vulnerabilities: 23,
    severity: 'high',
    date: '2026-05-01',
  },
  {
    id: '2',
    target: 'example.com',
    status: 'running',
    vulnerabilities: 0,
    severity: 'medium',
    date: '2026-05-01',
  },
  {
    id: '3',
    target: '10.0.0.1',
    status: 'completed',
    vulnerabilities: 8,
    severity: 'low',
    date: '2026-04-30',
  },
  {
    id: '4',
    target: 'api.example.com',
    status: 'failed',
    vulnerabilities: 0,
    severity: 'high',
    date: '2026-04-30',
  },
  {
    id: '5',
    target: '172.16.0.0/16',
    status: 'completed',
    vulnerabilities: 45,
    severity: 'critical',
    date: '2026-04-29',
  },
];

const vulnerabilityData = [
  { name: 'Critical', value: 12, color: '#ef4444' },
  { name: 'High', value: 35, color: '#f97316' },
  { name: 'Medium', value: 58, color: '#eab308' },
  { name: 'Low', value: 89, color: '#22c55e' },
];

const severityBadgeVariant = (severity: string) => {
  switch (severity) {
    case 'critical':
      return 'destructive';
    case 'high':
      return 'default';
    case 'medium':
      return 'secondary';
    case 'low':
      return 'outline';
    default:
      return 'default';
  }
};

const statusBadgeVariant = (status: string) => {
  switch (status) {
    case 'completed':
      return 'default';
    case 'running':
      return 'secondary';
    case 'failed':
      return 'destructive';
    default:
      return 'default';
  }
};

export function DashboardIndex() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1">Overview of your security scans and vulnerabilities</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat) => (
          <Card key={stat.title} className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">{stat.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-white">{stat.value}</span>
                <span
                  className={`text-sm ${
                    stat.trend === 'up' ? 'text-emerald-500' : 'text-red-500'
                  }`}
                >
                  {stat.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Scans Table */}
        <div className="lg:col-span-2">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Recent Scans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Target</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Vulns</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Severity</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentScans.map((scan) => (
                      <tr key={scan.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                        <td className="py-3 px-4 text-white font-mono">{scan.target}</td>
                        <td className="py-3 px-4">
                          <Badge variant={statusBadgeVariant(scan.status)}>
                            {scan.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-slate-300">{scan.vulnerabilities}</td>
                        <td className="py-3 px-4">
                          <Badge variant={severityBadgeVariant(scan.severity)}>
                            {scan.severity}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-slate-400">{scan.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vulnerability Chart */}
        <div>
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Vulnerability Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={vulnerabilityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {vulnerabilityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div className="flex flex-wrap gap-3 mt-4">
                {vulnerabilityData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-slate-400">
                      {item.name} ({item.value})
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
```

```typescript
/**
 * SentinelScan DashboardIndex Tests
 * Path: src/pages/Dashboard/Index.test.tsx
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { DashboardIndex } from './Index';

describe('DashboardIndex', () => {
  it('renders dashboard title', () => {
    render(
      <BrowserRouter>
        <DashboardIndex />
      </BrowserRouter>
    );
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Overview of your security scans and vulnerabilities')).toBeInTheDocument();
  });

  it('renders stats cards', () => {
    render(
      <BrowserRouter>
        <DashboardIndex />
      </BrowserRouter>
    );
    expect(screen.getByText('Total Assets')).toBeInTheDocument();
    expect(screen.getByText('Active Scans')).toBeInTheDocument();
    expect(screen.getByText('Vulnerabilities')).toBeInTheDocument();
    expect(screen.getByText('Resolved')).toBeInTheDocument();
  });

  it('renders recent scans table', () => {
    render(
      <BrowserRouter>
        <DashboardIndex />
      </BrowserRouter>
    );
    expect(screen.getByText('Recent Scans')).toBeInTheDocument();
    expect(screen.getByText('192.168.1.0/24')).toBeInTheDocument();
    expect(screen.getByText('example.com')).toBeInTheDocument();
  });

  it('renders vulnerability chart section', () => {
    render(
      <BrowserRouter>
        <DashboardIndex />
      </BrowserRouter>
    );
    expect(screen.getByText('Vulnerability Distribution')).toBeInTheDocument();
  });
});
```

**Verify:** `npx vitest run src/pages/Dashboard/Index.test.tsx`
**Commit:** `feat(pages): add Dashboard Index page with stats, scans table, and chart`

---

### Task 3.2: Update App.tsx with Dashboard Layout Routing
**File:** `src/App.tsx`
**Test:** none (integration tested)
**Depends:** 2.3, 3.1

```typescript
/**
 * SentinelScan App Root Component
 * Path: src/App.tsx
 *
 * Main application component that handles routing and navigation.
 * Defines routes for public pages (Index, Login) and protected dashboard routes.
 */
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Login from './pages/Login';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { DashboardIndex } from './pages/Dashboard/Index';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />

      {/* Protected Dashboard Routes */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardIndex />} />
        <Route path="scans" element={<div className="text-white p-6">Scans Page (Coming Soon)</div>} />
        <Route path="templates" element={<div className="text-white p-6">Templates Page (Coming Soon)</div>} />
        <Route path="reports" element={<div className="text-white p-6">Reports Page (Coming Soon)</div>} />
        <Route path="settings" element={<div className="text-white p-6">Settings Page (Coming Soon)</div>} />
      </Route>
    </Routes>
  );
}

export default App;
```

**Verify:** Application should render dashboard at `/dashboard` with layout
**Commit:** `feat(routing): update App.tsx to use DashboardLayout with nested routes`

---

## Summary

| Batch | Tasks | Description | Implementers |
|-------|-------|-------------|--------------|
| 1 | 1.1, 1.2, 1.3 | Foundation: uiSlice, store config, main.tsx | 3 |
| 2 | 2.1, 2.2, 2.3 | Layout: Sidebar, Header, DashboardLayout | 3 |
| 3 | 3.1, 3.2 | Dashboard Page & Routing | 2 |

**Total Tasks:** 8
**Estimated Parallel Implementers:** 3-6 (depending on batch)

---

## Notes

1. **Design Decisions Made:**
   - Using emoji icons for sidebar (simple, no extra deps) - can upgrade to lucide-react later
   - Mock data is inline in DashboardIndex - will be moved to API service later
   - Notifications use simple emoji indicators - can be enhanced with proper icons
   - Theme toggle not yet implemented in Header - can be added later

2. **Redux Selectors:** Need to add selector functions to uiSlice for better code organization

3. **Future Enhancements:**
   - Add ProtectedRoute wrapper for authentication
   - Add real API integration for scans and stats
   - Add loading states and error handling
   - Add theme toggle in Header
   - Add user profile and logout functionality

4. **Testing:** Each component has corresponding test file following existing project patterns (vitest + @testing-library/react)
