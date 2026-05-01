/**
 * SentinelScan DashboardLayout Tests
 * Path: src/components/layout/DashboardLayout.test.tsx
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
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
    // Dashboard appears in both sidebar nav and header - check header specifically
    const header = document.querySelector('header');
    expect(header).toBeInTheDocument();
    expect(header!.textContent).toContain('Dashboard');
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