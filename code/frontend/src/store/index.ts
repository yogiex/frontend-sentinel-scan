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
