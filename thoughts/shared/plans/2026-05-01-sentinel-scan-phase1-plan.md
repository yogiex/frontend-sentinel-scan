# SentinelScan Phase 1: Foundation Implementation Plan

**Goal:** Establish core frontend foundation with Shadcn UI, shared layout components, Redux state management, and functional Login page

**Architecture:** React 19 + TypeScript + Vite 8 + Tailwind CSS v4 + Redux Toolkit + Shadcn UI hybrid approach (CSS Modules for page-specific styles, Shadcn for reusable components). Note: Design doc incorrectly states Redux Toolkit is already in package.json - it must be installed as part of this phase.

**Design:** [2026-05-01-sentinel-scan-frontend-design.md](/home/mirage/Documents/code/sec/research/inkubasi-btp-cybersecurity/code/frontend/thoughts/shared/designs/2026-05-01-sentinel-scan-frontend-design.md)

**Prerequisites:**
- Install Redux Toolkit dependencies: `npm install @reduxjs/toolkit react-redux`
- Shadcn UI prerequisites already present: `clsx`, `tailwind-merge`, `lucide-react`, `@radix-ui/react-slot`, Tailwind CSS v4

---

## Dependency Graph

```
Batch 1 (parallel): 1.1, 1.2, 1.3, 1.4, 1.5 [foundation - no deps]
Batch 2 (parallel): 2.1, 2.2, 2.3, 2.4, 2.5 [depends on Batch 1]
Batch 3 (parallel): 3.1, 3.2 [depends on Batch 2]
Batch 4 (parallel): 4.1, 4.2 [depends on Batch 2 and 3]
```

---

## Batch 1: Foundation Setup (parallel - 5 implementers)

All tasks in this batch have NO dependencies and run simultaneously.

### Task 1.1: Initialize Shadcn UI Configuration
**File:** `components.json` (new)
**Test:** none (config file)
**Depends:** none

**Description:** Initialize Shadcn UI with Tailwind v4 support. Run `npx shadcn@latest init` with the following options:
- Style: `new-york`
- Base color: `slate`
- CSS variables: `yes`
- src directory: `src`
- Components alias: `@/components`
- Utils alias: `@/lib/utils` (already exists at `src/lib/utils.ts`)

```json
// components.json - copy-paste ready
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "hooks": "@/hooks",
    "lib": "@/lib"
  },
  "iconLibrary": "lucide"
}
```

**Verify:** `cat components.json` should return the above JSON
**Commit:** `chore: initialize shadcn ui configuration`

### Task 1.2: Create Auth Types
**File:** `src/types/auth.ts` (new)
**Test:** none (type-only file)
**Depends:** none

```typescript
// src/types/auth.ts - copy-paste ready
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}
```

**Verify:** File exists at `src/types/auth.ts`
**Commit:** `feat(types): add authentication type definitions`

### Task 1.3: Create UI Types
**File:** `src/types/ui.ts` (new)
**Test:** none (type-only file)
**Depends:** none

```typescript
// src/types/ui.ts - copy-paste ready
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
```

**Verify:** File exists at `src/types/ui.ts`
**Commit:** `feat(types): add ui state type definitions`

### Task 1.4: Create Auth Slice
**File:** `src/store/slices/authSlice.ts` (new)
**Test:** `src/store/slices/authSlice.test.ts` (new)
**Depends:** none

```typescript
// src/store/slices/authSlice.ts - copy-paste ready
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { User, LoginCredentials, AuthState } from '@/types/auth';

// Mock login API - will be replaced with real API in Phase 4
export const mockLogin = createAsyncThunk(
  'auth/mockLogin',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock validation (matches existing Login page logic)
    if (credentials.username === 'admin' && credentials.password === 'admin') {
      const user: User = {
        id: '1',
        username: 'admin',
        email: 'admin@sentinelscan.com',
        role: 'admin'
      };
      const token = 'mock-jwt-token-' + Date.now();
      return { user, token };
    }
    return rejectWithValue('Invalid username or password');
  }
);

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      // Clear token from localStorage
      localStorage.removeItem('authToken');
    },
    clearError: (state) => {
      state.error = null;
    },
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(mockLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(mockLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        // Store token in localStorage
        localStorage.setItem('authToken', action.payload.token);
      })
      .addCase(mockLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { logout, clearError, setCredentials } = authSlice.actions;
export default authSlice.reducer;
```

```typescript
// src/store/slices/authSlice.test.ts - copy-paste ready
import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import authReducer, { mockLogin, logout, clearError, setCredentials } from './authSlice';
import type { AuthState, User } from '@/types/auth';

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
```

**Verify:** `npx vitest run src/store/slices/authSlice.test.ts`
**Commit:** `feat(store): add auth slice with mock login`

### Task 1.5: Create UI Slice
**File:** `src/store/slices/uiSlice.ts` (new)
**Test:** `src/store/slices/uiSlice.test.ts` (new)
**Depends:** none

```typescript
// src/store/slices/uiSlice.ts - copy-paste ready
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Theme, UIState, Notification } from '@/types/ui';

const initialState: UIState = {
  sidebarOpen: true,
  theme: 'dark', // Match landing page dark theme
  notifications: []
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
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
      // Apply theme to document
      if (action.payload === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (action.payload === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        // System theme
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    },
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'createdAt' | 'read'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        read: false
      };
      state.notifications.unshift(notification);
    },
    markNotificationRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    clearNotifications: (state) => {
      state.notifications = [];
    }
  }
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  addNotification,
  markNotificationRead,
  clearNotifications
} = uiSlice.actions;

export default uiSlice.reducer;
```

```typescript
// src/store/slices/uiSlice.test.ts - copy-paste ready
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
```

**Verify:** `npx vitest run src/store/slices/uiSlice.test.ts`
**Commit:** `feat(store): add ui slice for sidebar and theme state`

---

## Batch 2: Core Configuration (parallel - 5 implementers)

All tasks in this batch depend on Batch 1 completing.

### Task 2.1: Update Global CSS with Shadcn Base Styles
**File:** `src/index.css` (modify)
**Test:** none (CSS file)
**Depends:** 1.1

```css
/* src/index.css - copy-paste ready (add to existing content) */
@import "tailwindcss";

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

**Verify:** `npm run dev` should start without CSS errors
**Commit:** `style: add shadcn base styles to global css`

### Task 2.2: Create Redux Store Configuration
**File:** `src/store/index.ts` (new)
**Test:** `src/store/index.test.ts` (new)
**Depends:** 1.4, 1.5

```typescript
// src/store/index.ts - copy-paste ready
import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
// Scan slice will be imported here when created in future phase
// import scanReducer from './slices/scanSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    // scan: scanReducer, // Uncomment when scan slice is added
  },
  devTools: process.env.NODE_ENV !== 'production',
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

```typescript
// src/store/index.test.ts - copy-paste ready
import { describe, it, expect } from 'vitest';
import { store, RootState, AppDispatch } from './index';
import { mockLogin, logout } from './slices/authSlice';

describe('Redux Store', () => {
  it('should initialize with correct state structure', () => {
    const state = store.getState();
    expect(state).toHaveProperty('auth');
    expect(state).toHaveProperty('ui');
    expect(state.auth.isAuthenticated).toBe(false);
    expect(state.ui.sidebarOpen).toBe(true);
  });

  it('should have correct types', () => {
    // TypeScript compile check - if this compiles, types are correct
    const dispatch: AppDispatch = store.dispatch;
    const state: RootState = store.getState();
    expect(dispatch).toBeDefined();
    expect(state).toBeDefined();
  });

  it('should handle auth actions', async () => {
    // Test mock login
    await store.dispatch(mockLogin({ username: 'admin', password: 'admin' }));
    const state = store.getState();
    expect(state.auth.isAuthenticated).toBe(true);
    
    // Test logout
    store.dispatch(logout());
    const newState = store.getState();
    expect(newState.auth.isAuthenticated).toBe(false);
  });
});
```

**Verify:** `npx vitest run src/store/index.test.ts`
**Commit:** `feat(store): configure redux store with auth and ui slices`

### Task 2.3: Add Shadcn Button Component
**File:** `src/components/ui/button.tsx` (new)
**Test:** `src/components/ui/button.test.tsx` (new)
**Depends:** 1.1

```typescript
// src/components/ui/button.tsx - copy-paste ready
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
```

```typescript
// src/components/ui/button.test.tsx - copy-paste ready
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from './button';

describe('Button', () => {
  it('renders correctly with default props', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-primary');
  });

  it('applies variant classes correctly', () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByRole('button', { name: /delete/i });
    expect(button).toHaveClass('bg-destructive');
  });

  it('applies size classes correctly', () => {
    render(<Button size="lg">Large Button</Button>);
    const button = screen.getByRole('button', { name: /large button/i });
    expect(button).toHaveClass('h-10');
  });

  it('is disabled when disabled prop is set', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button', { name: /disabled/i });
    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:opacity-50');
  });
});
```

**Verify:** `npx vitest run src/components/ui/button.test.tsx`
**Commit:** `feat(ui): add shadcn button component`

### Task 2.4: Add Shadcn Input Component
**File:** `src/components/ui/input.tsx` (new)
**Test:** `src/components/ui/input.test.tsx` (new)
**Depends:** 1.1

```typescript
// src/components/ui/input.tsx - copy-paste ready
import * as React from "react"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
```

```typescript
// src/components/ui/input.test.tsx - copy-paste ready
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Input } from './input';

describe('Input', () => {
  it('renders correctly', () => {
    render(<Input placeholder="Enter text" />);
    const input = screen.getByPlaceholderText(/enter text/i);
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass('flex h-9 w-full');
  });

  it('handles value changes', () => {
    render(<Input defaultValue="test value" />);
    const input = screen.getByDisplayValue(/test value/i);
    expect(input).toBeInTheDocument();
  });

  it('is disabled when disabled prop is set', () => {
    render(<Input disabled placeholder="Disabled" />);
    const input = screen.getByPlaceholderText(/disabled/i);
    expect(input).toBeDisabled();
  });

  it('applies type correctly', () => {
    render(<Input type="password" placeholder="Password" />);
    const input = screen.getByPlaceholderText(/password/i);
    expect(input).toHaveAttribute('type', 'password');
  });
});
```

**Verify:** `npx vitest run src/components/ui/input.test.tsx`
**Commit:** `feat(ui): add shadcn input component`

### Task 2.5: Add Shadcn Card Component
**File:** `src/components/ui/card.tsx` (new)
**Test:** `src/components/ui/card.test.tsx` (new)
**Depends:** 1.1

```typescript
// src/components/ui/card.tsx - copy-paste ready
import * as React from "react"
import { cn } from "@/lib/utils"

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
}
```

```typescript
// src/components/ui/card.test.tsx - copy-paste ready
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardContent } from './card';

describe('Card', () => {
  it('renders correctly with children', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Card</CardTitle>
        </CardHeader>
        <CardContent>Card content</CardContent>
      </Card>
    );
    
    expect(screen.getByText(/test card/i)).toBeInTheDocument();
    expect(screen.getByText(/card content/i)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Card className="custom-class">Content</Card>);
    const card = screen.getByText(/content/i).parentElement;
    expect(card).toHaveClass('custom-class');
  });
});
```

**Verify:** `npx vitest run src/components/ui/card.test.tsx`
**Commit:** `feat(ui): add shadcn card component`

---

## Batch 3: Shared Components (parallel - 2 implementers)

All tasks in this batch depend on Batch 2 completing.

### Task 3.1: Create Navbar Component
**File:** `src/components/shared/Navbar.tsx` (new)
**Test:** `src/components/shared/Navbar.test.tsx` (new)
**Depends:** 2.2, 2.3, 2.4, 1.4

```typescript
// src/components/shared/Navbar.tsx - copy-paste ready
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppSelector, useAppDispatch } from '@/store';
import { logout } from '@/store/slices/authSlice';
import type { User } from '@/types/auth';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { sidebarOpen, toggleSidebar } = useAppSelector((state) => state.ui);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="border-b bg-background h-16 flex items-center px-4 justify-between sticky top-0 z-50">
      {/* Left section: Sidebar toggle + Logo */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" x2="21" y1="6" y2="6" />
            <line x1="3" x2="21" y1="12" y2="12" />
            <line x1="3" x2="21" y1="18" y2="18" />
          </svg>
        </Button>
        
        <Link to="/dashboard" className="font-bold text-xl">
          Sentinel<span className="text-primary">Scan</span>
        </Link>
      </div>

      {/* Center section: Search (optional) */}
      {isAuthenticated && (
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <Input placeholder="Search scans..." className="w-full" />
        </div>
      )}

      {/* Right section: User menu / Auth buttons */}
      <div className="flex items-center gap-4">
        {isAuthenticated && user ? (
          <>
            <span className="hidden md:inline text-sm text-muted-foreground">
              {user.username}
            </span>
            <Button variant="ghost" onClick={handleLogout}>
              Logout
            </Button>
          </>
        ) : (
          <Button asChild>
            <Link to="/login">Login</Link>
          </Button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
```

```typescript
// src/components/shared/Navbar.test.tsx - copy-paste ready
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import Navbar from './Navbar';
import authReducer from '@/store/slices/authSlice';
import uiReducer from '@/store/slices/uiSlice';

// Mock store setup
const createMockStore = (authState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      ui: uiReducer
    },
    preloadedState: {
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        ...authState
      },
      ui: {
        sidebarOpen: true,
        theme: 'dark' as const,
        notifications: []
      }
    }
  });
};

describe('Navbar', () => {
  it('renders login button when not authenticated', () => {
    const store = createMockStore();
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      </Provider>
    );
    
    expect(screen.getByText(/login/i)).toBeInTheDocument();
    expect(screen.getByText(/sentinelscan/i)).toBeInTheDocument();
  });

  it('renders user info and logout button when authenticated', () => {
    const store = createMockStore({
      isAuthenticated: true,
      user: { id: '1', username: 'admin', email: 'admin@test.com', role: 'admin' }
    });
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      </Provider>
    );
    
    expect(screen.getByText(/admin/i)).toBeInTheDocument();
    expect(screen.getByText(/logout/i)).toBeInTheDocument();
  });

  it('toggles sidebar when sidebar button is clicked', () => {
    const store = createMockStore();
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      </Provider>
    );
    
    const toggleButton = screen.getByLabelText(/toggle sidebar/i);
    fireEvent.click(toggleButton);
    
    const state = store.getState();
    expect(state.ui.sidebarOpen).toBe(false);
  });
});
```

**Verify:** `npx vitest run src/components/shared/Navbar.test.tsx`
**Commit:** `feat(components): add shared navbar component`

### Task 3.2: Create Sidebar Component
**File:** `src/components/shared/Sidebar.tsx` (new)
**Test:** `src/components/shared/Sidebar.test.tsx` (new)
**Depends:** 2.2, 2.3, 1.5

```typescript
// src/components/shared/Sidebar.tsx - copy-paste ready
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAppSelector, useAppDispatch } from '@/store';
import { toggleSidebar, setSidebarOpen } from '@/store/slices/uiSlice';

interface SidebarItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const Sidebar: React.FC = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { sidebarOpen } = useAppSelector((state) => state.ui);

  const sidebarItems: SidebarItem[] = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="7" height="9" x="3" y="3" rx="1" />
          <rect width="7" height="5" x="14" y="3" rx="1" />
          <rect width="7" height="9" x="14" y="12" rx="1" />
          <rect width="7" height="5" x="3" y="16" rx="1" />
        </svg>
      )
    },
    {
      label: 'New Scan',
      path: '/dashboard/scan/new',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      )
    },
    {
      label: 'Templates',
      path: '/dashboard/templates',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      )
    },
    {
      label: 'Settings',
      path: '/dashboard/settings',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )
    }
  ];

  return (
    <aside
      className={`border-r bg-background h-[calc(100vh-4rem)] sticky top-16 transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-16'
      }`}
    >
      <div className="flex flex-col h-full py-4">
        <nav className="flex-1 px-2 space-y-1">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                } ${!sidebarOpen ? 'justify-center' : ''}`}
                title={item.label}
              >
                {item.icon}
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
        
        {/* Collapse button at bottom */}
        <div className="px-2 pt-4 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dispatch(toggleSidebar())}
            className="w-full"
          >
            {sidebarOpen ? 'Collapse' : 'Expand'}
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
```

```typescript
// src/components/shared/Sidebar.test.tsx - copy-paste ready
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import Sidebar from './Sidebar';
import uiReducer from '@/store/slices/uiSlice';

const createMockStore = (uiState = {}) => {
  return configureStore({
    reducer: {
      ui: uiReducer
    },
    preloadedState: {
      ui: {
        sidebarOpen: true,
        theme: 'dark' as const,
        notifications: [],
        ...uiState
      }
    }
  });
};

describe('Sidebar', () => {
  it('renders all sidebar items when open', () => {
    const store = createMockStore();
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Sidebar />
        </BrowserRouter>
      </Provider>
    );
    
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/new scan/i)).toBeInTheDocument();
    expect(screen.getByText(/templates/i)).toBeInTheDocument();
    expect(screen.getByText(/settings/i)).toBeInTheDocument();
  });

  it('collapses to icons only when closed', () => {
    const store = createMockStore({ sidebarOpen: false });
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Sidebar />
        </BrowserRouter>
      </Provider>
    );
    
    expect(screen.queryByText(/dashboard/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/dashboard/i)).toBeInTheDocument(); // Icon is still present
  });

  it('toggles sidebar when collapse button is clicked', () => {
    const store = createMockStore();
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Sidebar />
        </BrowserRouter>
      </Provider>
    );
    
    const collapseButton = screen.getByText(/collapse/i);
    fireEvent.click(collapseButton);
    
    const state = store.getState();
    expect(state.ui.sidebarOpen).toBe(false);
  });

  it('highlights active route', () => {
    const store = createMockStore();
    
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/dashboard']}>
          <Sidebar />
        </MemoryRouter>
      </Provider>
    );
    
    const dashboardLink = screen.getByText(/dashboard/i).closest('a');
    expect(dashboardLink).toHaveClass('bg-primary');
  });
});
```

**Verify:** `npx vitest run src/components/shared/Sidebar.test.tsx`
**Commit:** `feat(components): add shared sidebar component`

---

## Batch 4: Login Page Implementation (parallel - 2 implementers)

All tasks in this batch depend on Batch 2 and 3 completing.

### Task 4.1: Update Login Page with Shadcn and Redux
**File:** `src/pages/Login/index.tsx` (modify)
**Test:** `src/pages/Login/index.test.tsx` (new)
**Depends:** 3.1, 2.3, 2.4, 1.4

```typescript
// src/pages/Login/index.tsx - copy-paste ready (replace existing content)
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAppDispatch, useAppSelector } from '@/store';
import { mockLogin, clearError } from '@/store/slices/authSlice';
import styles from './styles.module.css';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    
    const result = await dispatch(mockLogin({ username, password }));
    
    if (mockLogin.fulfilled.match(result)) {
      navigate('/dashboard');
    }
  };

  return (
    <div className={styles.loginContainer}>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Login to SentinelScan</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Username
              </label>
              <Input
                id="username"
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            {error && (
              <div className={styles.loginError}>
                {error}
              </div>
            )}
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
            
            <div className="text-sm text-center text-muted-foreground">
              Demo credentials: admin / admin
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
```

```typescript
// src/pages/Login/index.test.tsx - copy-paste ready
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import Login from './index';
import authReducer from '@/store/slices/authSlice';
import uiReducer from '@/store/slices/uiSlice';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

const createMockStore = (authState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      ui: uiReducer
    },
    preloadedState: {
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        ...authState
      },
      ui: {
        sidebarOpen: true,
        theme: 'dark' as const,
        notifications: []
      }
    }
  });
};

describe('Login Page', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    localStorage.clear();
  });

  it('renders login form correctly', () => {
    const store = createMockStore();
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );
    
    expect(screen.getByText(/login to sentinelscan/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('handles successful login', async () => {
    const store = createMockStore();
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );
    
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'admin' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'admin' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('displays error on invalid credentials', async () => {
    const store = createMockStore();
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );
    
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'wrong' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/invalid username or password/i)).toBeInTheDocument();
    });
  });

  it('shows loading state during login', async () => {
    const store = createMockStore();
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );
    
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'admin' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'admin' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    expect(screen.getByText(/logging in.../i)).toBeInTheDocument();
  });
});
```

**Verify:** `npx vitest run src/pages/Login/index.test.tsx`
**Commit:** `feat(pages): update login page with shadcn components and redux auth`

### Task 4.2: Update Login Page Styles
**File:** `src/pages/Login/styles.module.css` (modify)
**Test:** none (CSS file)
**Depends:** 4.1

```css
/* src/pages/Login/styles.module.css - copy-paste ready (replace existing content) */
.loginContainer {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: hsl(var(--background));
  padding: 1rem;
}

.loginError {
  padding: 0.75rem;
  border-radius: 0.375rem;
  background-color: hsl(var(--destructive) / 0.1);
  color: hsl(var(--destructive));
  font-size: 0.875rem;
  border: 1px solid hsl(var(--destructive) / 0.2);
}
```

**Verify:** `npm run dev` and navigate to /login to see styled page
**Commit:** `style(pages): update login page styles for shadcn integration`

---

## Post-Implementation Steps

1. **Install Dependencies:**
   ```bash
   npm install @reduxjs/toolkit react-redux
   npx shadcn@latest init  # Follow prompts with options from Task 1.1
   ```

2. **Update App.tsx to Include Redux Provider:**
   ```typescript
   // src/App.tsx - add Redux Provider
   import { BrowserRouter, Routes, Route } from 'react-router-dom';
   import { Provider } from 'react-redux';
   import { store } from './store';
   import Index from './pages/Index';
   import Login from './pages/Login';
   import { Dashboard } from './components/dashboard/Dashboard';
   import Navbar from './components/shared/Navbar';
   import Sidebar from './components/shared/Sidebar';

   function App() {
     return (
       <Provider store={store}>
         <BrowserRouter>
           <Routes>
             <Route path="/" element={<Index />} />
             <Route path="/login" element={<Login />} />
             <Route
               path="/dashboard"
               element={
                 <>
                   <Navbar />
                   <div className="flex">
                     <Sidebar />
                     <main className="flex-1 p-6">
                       <Dashboard />
                     </main>
                   </div>
                 </>
               }
             />
           </Routes>
         </BrowserRouter>
       </Provider>
     );
   }

   export default App;
   ```

3. **Run All Tests:**
   ```bash
   npm run test
   ```

4. **Start Development Server:**
   ```bash
   npm run dev
   ```

---

**Plan Status:** Ready for implementation. All tasks are independent within batches, with clear dependency chains between batches.
