import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter } from 'react-router-dom';
import { DashboardIndex } from './Index';
import { scanStore } from '@/lib/scan-store';

function renderPage() {
  return render(
    <MemoryRouter>
      <DashboardIndex />
    </MemoryRouter>,
  );
}

describe('DashboardIndex', () => {
  beforeEach(() => {
    localStorage.clear();
    scanStore.clearAll();
  });

  it('renders the overview heading and description', () => {
    renderPage();
    expect(screen.getByRole('heading', { level: 1, name: 'Overview' })).toBeInTheDocument();
    expect(screen.getByText(/Scan coverage, open findings/)).toBeInTheDocument();
  });

  it('renders the KPI strip with derived figures', () => {
    renderPage();
    expect(screen.getByText('Scans')).toBeInTheDocument();
    expect(screen.getByText('Findings')).toBeInTheDocument();
    expect(screen.getByText('Critical')).toBeInTheDocument();
    expect(screen.getByText('Hosts')).toBeInTheDocument();
  });

  it('shows an empty state when no scan is running', () => {
    renderPage();
    expect(screen.getByText('No scans running')).toBeInTheDocument();
  });

  it('renders the recent scans section', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'Recent scans' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Findings by severity' })).toBeInTheDocument();
  });

  it('offers a primary action to start a scan', () => {
    renderPage();
    expect(screen.getAllByRole('button', { name: /New scan/ }).length).toBeGreaterThan(0);
  });
});
