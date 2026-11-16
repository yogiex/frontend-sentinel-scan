import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter } from 'react-router-dom';
import { AllScans } from './AllScans';
import { scanStore } from '@/lib/scan-store';

function renderPage() {
  return render(
    <MemoryRouter>
      <AllScans />
    </MemoryRouter>,
  );
}

describe('AllScans', () => {
  beforeEach(() => {
    localStorage.clear();
    scanStore.clearAll();
  });

  it('renders the page header and actions', () => {
    renderPage();
    expect(screen.getByRole('heading', { level: 1, name: 'Scans' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /New scan/ }).length).toBeGreaterThan(0);
  });

  it('shows an empty state when there are no scans', () => {
    renderPage();
    expect(screen.getByText('No scans yet')).toBeInTheDocument();
  });

  it('exposes filters as pressed buttons', () => {
    renderPage();
    expect(screen.getByRole('button', { name: 'All', pressed: true })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Running' })).toBeInTheDocument();
  });

  it('lists scans that exist in the store', () => {
    scanStore.createScan({ target: '10.0.0.5', scanType: 'web', profile: 'quick' });
    renderPage();
    expect(screen.getByText('10.0.0.5')).toBeInTheDocument();
    expect(screen.queryByText('No scans yet')).not.toBeInTheDocument();
  });
});
