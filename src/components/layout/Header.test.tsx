import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { Header } from './Header';
import uiReducer from '@/store/slices/uiSlice';
import authReducer from '@/store/slices/authSlice';

function renderHeader(pathname = '/dashboard/scans', unread = 0) {
  const notifications = Array.from({ length: unread }).map((_, i) => ({
    id: String(i),
    message: `Notification ${i}`,
    type: 'info' as const,
    read: false,
    createdAt: new Date().toISOString(),
  }));

  const store = configureStore({
    reducer: { ui: uiReducer, auth: authReducer },
    preloadedState: {
      auth: {
        user: { id: '2', username: 'admin', email: 'admin@sentinelscan.com', role: 'admin' },
        token: 't',
        isAuthenticated: true,
        loading: false,
        error: null,
      },
      ui: { sidebarOpen: true, theme: 'light', notifications },
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[pathname]}>
        <Header onOpenMenu={() => {}} />
      </MemoryRouter>
    </Provider>,
  );
}

describe('Header', () => {
  it('derives the page title from the route', () => {
    renderHeader('/dashboard/scans');
    expect(screen.getByText('Scans')).toBeInTheDocument();
  });

  it('uses a specific title for nested routes', () => {
    renderHeader('/dashboard/scans/new');
    expect(screen.getByText('New scan')).toBeInTheDocument();
  });

  it('labels the mobile menu trigger', () => {
    renderHeader();
    expect(screen.getByRole('button', { name: 'Open navigation' })).toBeInTheDocument();
  });

  it('announces the unread notification count', () => {
    renderHeader('/dashboard', 3);
    expect(screen.getByRole('button', { name: /Notifications, 3 unread/ })).toBeInTheDocument();
  });

  it('exposes an account menu with a sign out action', async () => {
    renderHeader();
    expect(screen.getByRole('button', { name: 'Account menu' })).toBeInTheDocument();
  });
});
