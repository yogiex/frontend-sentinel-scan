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
      ui: { sidebarOpen: true, theme: 'light', notifications: [] },
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
      ui: { sidebarOpen: true, theme: 'light', notifications },
    });
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('toggles notification menu on click', () => {
    renderWithProviders({
      ui: { sidebarOpen: true, theme: 'light', notifications: [] },
    });
    const bellButton = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(bellButton);
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  it('uses correct background color variable for header (bg-secondary)', () => {
    const { container } = renderWithProviders({
      ui: { sidebarOpen: true, theme: 'light', notifications: [] },
    });
    const header = container.querySelector('header');
    expect(header).toBeInTheDocument();
    // Check that the header uses var(--bg-secondary) not var(--bg-card)
    expect(header?.getAttribute('style')).toContain('var(--bg-secondary)');
    expect(header?.getAttribute('style')).not.toContain('var(--bg-card)');
  });

  it('uses indigo gradient for decorative line (not blue/purple)', () => {
    const { container } = renderWithProviders({
      ui: { sidebarOpen: true, theme: 'light', notifications: [] },
    });
    const gradientLine = container.querySelector('.absolute.bottom-0');
    expect(gradientLine).toBeInTheDocument();
    const style = gradientLine?.getAttribute('style') || '';
    // Should use indigo (79, 70, 229) or var(--primary)
    expect(style).toMatch(/rgba\(79,\s*70,\s*229/);
    // Should NOT use blue-500 (59, 130, 246) or purple-500 (139, 92, 246)
    expect(style).not.toMatch(/rgba\(59,\s*130,\s*246/);
    expect(style).not.toMatch(/rgba\(139,\s*92,\s*246/);
  });

  it('uses indigo gradient for notification badge (not pink)', () => {
    const notifications = [
      {
        id: '1',
        message: 'Test notification',
        type: 'info' as const,
        read: false,
        createdAt: new Date().toISOString(),
      },
    ];
    const { container } = renderWithProviders({
      ui: { sidebarOpen: true, theme: 'light', notifications },
    });
    const badge = container.querySelector('.absolute.-top-1');
    expect(badge).toBeInTheDocument();
    const style = badge?.getAttribute('style') || '';
    // Should use var(--primary) and var(--primary-dark) for indigo gradient
    expect(style).toContain('var(--primary)');
    // Should NOT use pink (#ec4899)
    expect(style).not.toContain('#ec4899');
  });

  it('uses indigo background for unread notifications (not blue)', () => {
    const notifications = [
      {
        id: '1',
        message: 'Test notification',
        type: 'info' as const,
        read: false,
        createdAt: new Date().toISOString(),
      },
    ];
    const { container } = renderWithProviders({
      ui: { sidebarOpen: true, theme: 'light', notifications },
    });
    // Open notification menu first
    const bellButton = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(bellButton);

    const unreadItem = container.querySelector('[style*="rgba(79, 70, 229"]');
    expect(unreadItem).toBeInTheDocument();
    const style = unreadItem?.getAttribute('style') || '';
    // Should use indigo (79, 70, 229) for unread background
    expect(style).toMatch(/rgba\(79,\s*70,\s*229/);
    // Should NOT use blue-600 (37, 99, 235)
    expect(style).not.toMatch(/rgba\(37,\s*99,\s*235/);
  });

  it('toggles sidebar when menu button is clicked', () => {
    const { container } = renderWithProviders({
      ui: { sidebarOpen: true, theme: 'light', notifications: [] },
    });
    const buttons = container.querySelectorAll('button');
    const sidebarButton = Array.from(buttons).find(btn => 
      btn.querySelector('svg')?.classList.contains('w-5')
    );
    expect(sidebarButton).toBeInTheDocument();
  });
});
