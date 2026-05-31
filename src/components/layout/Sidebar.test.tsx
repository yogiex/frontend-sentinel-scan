/**
 * SentinelScan Sidebar Tests
 * Path: src/components/layout/Sidebar.test.tsx
 */
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
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