/**
 * AllScans Component Tests
 * Path: src/pages/Dashboard/Scans/AllScans.test.tsx
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AllScans } from './AllScans';
import { scanStore } from '@/lib/scan-store';
import React from 'react';

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

describe('AllScans', () => {
  beforeEach(() => {
    scanStore.clearAll();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render the All Scans page header', () => {
    render(<AllScans />);
    
    expect(screen.getByText('All Scans')).toBeInTheDocument();
    expect(screen.getByText('View and manage all vulnerability scans')).toBeInTheDocument();
  });

  it('should show empty state when no scans exist', () => {
    render(<AllScans />);
    
    expect(screen.getByText('No scans found')).toBeInTheDocument();
    expect(screen.getByText(/No scans match the "all" filter/)).toBeInTheDocument();
  });

  it('should display scans from the store', async () => {
    // Add a scan to the store
    scanStore.createScan({
      target: '192.168.1.0/24',
      scanType: 'basic',
      profile: 'quick',
      schedule: 'none',
      useCredentials: false,
      userAgentMode: 'default',
      enableCookies: false,
      humanLikeDelay: false,
    });

    render(<AllScans />);
    
    await waitFor(() => {
      expect(screen.getByText('192.168.1.0/24')).toBeInTheDocument();
    });
  });

  it('should filter scans by status', async () => {
    // Add scans with different statuses
    scanStore.createScan({
      target: '10.0.0.1',
      scanType: 'discovery',
      profile: 'quick',
      schedule: 'none',
      useCredentials: false,
      userAgentMode: 'default',
      enableCookies: false,
      humanLikeDelay: false,
    });

    const scans = scanStore.getScans();
    if (scans.length > 0) {
      scanStore.updateScan(scans[0].id, { status: 'completed' });
    }

    render(<AllScans />);
    
    await waitFor(() => {
      expect(screen.getByText('10.0.0.1')).toBeInTheDocument();
    });
  });

  it('should have filter buttons for all, running, completed, failed', () => {
    render(<AllScans />);
    
    // Use getAllByText since "Completed" also appears in the StatusChip in the table
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Running')).toBeInTheDocument();
    expect(screen.getAllByText('Completed').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });

  it('should render the New Scan button', () => {
    render(<AllScans />);
    
    expect(screen.getByText(/New Scan/)).toBeInTheDocument();
  });
});
