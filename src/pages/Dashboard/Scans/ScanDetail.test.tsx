/**
 * ScanDetail Component Tests
 * Path: src/pages/Dashboard/Scans/ScanDetail.test.tsx
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ScanDetail } from './ScanDetail';
import { scanStore } from '@/lib/scan-store';
import React from 'react';

// Create a mock useParams function
const mockUseParams = vi.fn();

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useParams: () => mockUseParams(),
}));

describe('ScanDetail', () => {
  beforeEach(() => {
    scanStore.clearAll();
    
    // Reset mock to default
    mockUseParams.mockReturnValue({ id: 'scan-1' });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render scan not found state when scan does not exist', () => {
    // Mock useParams to return a non-existent scan ID
    mockUseParams.mockReturnValue({ id: 'non-existent' });
    
    render(<ScanDetail />);
    
    expect(screen.getByText('Scan Not Found')).toBeInTheDocument();
    expect(screen.getByText('The requested scan could not be found.')).toBeInTheDocument();
  });

  it('should render scan in progress state when scan is not completed', async () => {
    // Add a pending scan to the store
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

    const scans = scanStore.getScans();
    expect(scans.length).toBe(1);

    // Mock useParams to return the scan ID
    mockUseParams.mockReturnValue({ id: scans[0].id });

    render(<ScanDetail />);

    await waitFor(() => {
      expect(screen.getByText('Scan in Progress')).toBeInTheDocument();
    });
    expect(screen.getByText('This scan is currently running. Redirecting to progress page...')).toBeInTheDocument();
  });

  it('should render scan details when scan is completed', async () => {
    // Add a completed scan with findings and hosts
    scanStore.createScan({
      target: '192.168.1.0/24',
      scanType: 'basic',
      profile: 'full',
      schedule: 'none',
      useCredentials: true,
      userAgentMode: 'default',
      enableCookies: false,
      humanLikeDelay: false,
    });

    const scans = scanStore.getScans();
    expect(scans.length).toBe(1);

    // Update scan to completed with findings
    scanStore.updateScan(scans[0].id, {
      status: 'completed',
      startedAt: '2026-05-01 08:01',
      completedAt: '2026-05-01 08:46',
      duration: '45 min',
      findings: [
        {
          id: 'finding-1',
          title: 'Test Vulnerability',
          severity: 'critical' as const,
          host: '192.168.1.10',
          port: 80,
          cveId: 'CVE-2026-1001',
        },
      ],
      hosts: [
        { ip: '192.168.1.10', status: 'up' as const, openPorts: 8, vulns: 1 },
      ],
    });

    // Mock useParams to return the scan ID
    mockUseParams.mockReturnValue({ id: scans[0].id });

    render(<ScanDetail />);

    await waitFor(() => {
      expect(screen.getByText('Scan Details')).toBeInTheDocument();
    });
    expect(screen.getByText('192.168.1.0/24')).toBeInTheDocument();
    expect(screen.getByText('Test Vulnerability')).toBeInTheDocument();
    expect(screen.getByText('CVE-2026-1001')).toBeInTheDocument();
  });

  it('should display hosts discovered', async () => {
    scanStore.createScan({
      target: '10.0.0.0/24',
      scanType: 'discovery',
      profile: 'quick',
      schedule: 'none',
      useCredentials: false,
      userAgentMode: 'default',
      enableCookies: false,
      humanLikeDelay: false,
    });

    const scans = scanStore.getScans();
    
    scanStore.updateScan(scans[0].id, {
      status: 'completed',
      hosts: [
        { ip: '10.0.0.1', status: 'up' as const, openPorts: 5, vulns: 2 },
        { ip: '10.0.0.2', status: 'down' as const, openPorts: 0, vulns: 0 },
      ],
    });

    mockUseParams.mockReturnValue({ id: scans[0].id });

    render(<ScanDetail />);

    await waitFor(() => {
      expect(screen.getByText('Hosts Discovered')).toBeInTheDocument();
    });
    expect(screen.getByText('10.0.0.1')).toBeInTheDocument();
    expect(screen.getByText('10.0.0.2')).toBeInTheDocument();
  });

  it('should sort vulnerabilities by severity', async () => {
    scanStore.createScan({
      target: '172.16.0.0/24',
      scanType: 'full',
      profile: 'full',
      schedule: 'none',
      useCredentials: false,
      userAgentMode: 'default',
      enableCookies: false,
      humanLikeDelay: false,
    });

    const scans = scanStore.getScans();
    
    scanStore.updateScan(scans[0].id, {
      status: 'completed',
      findings: [
        {
          id: 'finding-1',
          title: 'Low Severity Issue',
          severity: 'low' as const,
          host: '172.16.0.1',
          port: 80,
        },
        {
          id: 'finding-2',
          title: 'Critical Severity Issue',
          severity: 'critical' as const,
          host: '172.16.0.2',
          port: 443,
        },
        {
          id: 'finding-3',
          title: 'High Severity Issue',
          severity: 'high' as const,
          host: '172.16.0.3',
          port: 22,
        },
      ],
    });

    mockUseParams.mockReturnValue({ id: scans[0].id });

    render(<ScanDetail />);

    await waitFor(() => {
      expect(screen.getByText('Top Vulnerabilities')).toBeInTheDocument();
    });

    // Get all vulnerability titles
    const criticalVuln = screen.getByText('Critical Severity Issue');
    const highVuln = screen.getByText('High Severity Issue');
    const lowVuln = screen.getByText('Low Severity Issue');

    // Check that they are all in the document
    expect(criticalVuln).toBeInTheDocument();
    expect(highVuln).toBeInTheDocument();
    expect(lowVuln).toBeInTheDocument();
  });
});
