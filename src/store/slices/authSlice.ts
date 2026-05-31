import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { User, LoginCredentials, AuthState } from '@/types/auth';
import { PERMISSIONS, type Role } from '@/types/permissions';

// Mock users database
const MOCK_USERS: (User & { password: string; permissions: string[] })[] = [
  {
    id: '1',
    username: 'superadmin',
    email: 'superadmin@sentinelscan.com',
    role: 'super-admin' as const,
    password: 'superadmin123',
    permissions: ['full_access', 'user_management', 'system_config', 'audit_log'],
  },
  {
    id: '2',
    username: 'admin',
    email: 'admin@sentinelscan.com',
    role: 'admin' as const,
    password: 'admin',
    permissions: ['user_management', 'scan_create', 'scan_view', 'report_view', 'report_export', 'system_config', 'audit_log', 'template_manage'],
  },
  {
    id: '3',
    username: 'user',
    email: 'user@sentinelscan.com',
    role: 'user' as const,
    password: 'user123',
    permissions: ['scan_create', 'scan_view', 'scan_execute', 'report_view', 'report_export'],
  },
  {
    id: '4',
    username: 'viewer',
    email: 'viewer@sentinelscan.com',
    role: 'viewer' as const,
    password: 'viewer123',
    permissions: ['scan_view', 'report_view'],
  },
];

// Mock login API - will be replaced with real API in Phase 4
export const mockLogin = createAsyncThunk(
  'auth/mockLogin',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Find user by email or username
    const foundUser = MOCK_USERS.find(u => u.email === credentials.username || u.username === credentials.username);
    
    if (foundUser && foundUser.password === credentials.password) {
      // Get permissions from matrix based on role
      const permissions = PERMISSIONS[foundUser.role as Role] || [];
      
      const user: User = {
        id: foundUser.id,
        username: foundUser.username,
        email: foundUser.email,
        role: foundUser.role as Role,
      };
      
      const token = 'mock-jwt-token-' + Date.now();
      
      // Store user with permissions in localStorage for persistence
      const userWithPerms = { ...user, permissions };
      localStorage.setItem('sentinelscan_user', JSON.stringify(userWithPerms));
      
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

// Selectors
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.loading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;

export default authSlice.reducer;
