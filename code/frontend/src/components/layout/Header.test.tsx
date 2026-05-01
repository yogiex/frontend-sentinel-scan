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
    // Find the button with the bell emoji
    const buttons = screen.getAllByRole('button');
    const bellBtn = buttons.find(btn => btn.innerHTML.includes('🔔'));
    if (bellBtn) {
      fireEvent.click(bellBtn);
      expect(screen.getByText('Notifications')).toBeInTheDocument();
    }
  });
});