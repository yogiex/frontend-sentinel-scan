import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { Sidebar } from './Sidebar';
import uiReducer from '@/store/slices/uiSlice';
import authReducer from '@/store/slices/authSlice';

function renderSidebar(pathname = '/dashboard') {
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
      ui: { sidebarOpen: true, theme: 'light', notifications: [] },
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[pathname]}>
        <Sidebar open onClose={vi.fn()} pathname={pathname} />
      </MemoryRouter>
    </Provider>,
  );
}

describe('Sidebar', () => {
  it('exposes every area as a labelled navigation link', () => {
    renderSidebar();
    const rail = screen.getByRole('navigation', { name: 'Areas' });
    expect(rail).toBeInTheDocument();
    expect(within(rail).getByRole('link', { name: 'Overview' })).toBeInTheDocument();
    expect(within(rail).getByRole('link', { name: 'Scans' })).toBeInTheDocument();
    expect(within(rail).getByRole('link', { name: 'Tickets' })).toBeInTheDocument();
  });

  it('marks the active area with aria-current', () => {
    renderSidebar('/dashboard/scans');
    const rail = screen.getByRole('navigation', { name: 'Areas' });
    expect(within(rail).getByRole('link', { name: 'Scans' })).toHaveAttribute('aria-current', 'page');
    expect(within(rail).getByRole('link', { name: 'Overview' })).not.toHaveAttribute('aria-current');
  });

  it('shows the children of the active area in the context column', () => {
    renderSidebar('/dashboard/scans');
    expect(screen.getByRole('link', { name: 'All scans' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'New scan' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Trash' })).toBeInTheDocument();
  });

  it('shows the signed-in user in the session block', () => {
    renderSidebar();
    expect(screen.getAllByText('admin').length).toBeGreaterThan(0);
  });
});
