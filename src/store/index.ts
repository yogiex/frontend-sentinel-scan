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
import auditLogReducer from './slices/auditLogSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    auditLog: auditLogReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks for use throughout the app
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export type { RootState as AppState };
