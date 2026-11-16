import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { DashboardLayout } from './DashboardLayout';
import uiReducer from '@/store/slices/uiSlice';
import authReducer from '@/store/slices/authSlice';

function renderLayout() {
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
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<p>Page body</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
}

describe('DashboardLayout', () => {
  it('renders a skip link that targets main', () => {
    renderLayout();
    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveAttribute('href', '#main');
  });

  it('renders the page inside a main landmark', () => {
    renderLayout();
    expect(screen.getByRole('main')).toContainElement(screen.getByText('Page body'));
  });

  it('renders the primary navigation and the header', () => {
    renderLayout();
    expect(screen.getByRole('navigation', { name: 'Areas' })).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });
});
