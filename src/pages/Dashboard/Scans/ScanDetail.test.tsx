/**
 * ScanDetail Component Tests
 * Path: src/pages/Dashboard/Scans/ScanDetail.test.tsx
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { ScanDetail } from './ScanDetail';
import { scanStore } from '@/lib/scan-store';

const mockUseParams = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useParams: () => mockUseParams(),
}));

describe('ScanDetail', () => {
  beforeEach(() => {
    localStorage.clear();
    scanStore.clearAll();
    mockUseParams.mockReturnValue({ id: 'scan-1' });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders a not-found state for an unknown scan', () => {
    mockUseParams.mockReturnValue({ id: 'non-existent' });
    render(<ScanDetail />);
    expect(screen.getByText('Scan Not Found')).toBeInTheDocument();
    expect(screen.getByText('The requested scan could not be found.')).toBeInTheDocument();
  });

  it('renders the scan header and tabs for an existing scan', () => {
    const scan = scanStore.createScan({ target: '10.9.9.9', scanType: 'web', profile: 'quick' });
    mockUseParams.mockReturnValue({ id: scan.id });
    render(<ScanDetail />);

    expect(screen.getByRole('heading', { name: 'Scan Details' })).toBeInTheDocument();
    expect(screen.getByText('Scan Information')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /History/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Log/i })).toBeInTheDocument();
  });

  it('shows either the findings panel or the empty findings state', () => {
    const scan = scanStore.createScan({ target: '10.1.1.1', scanType: 'web', profile: 'full' });
    mockUseParams.mockReturnValue({ id: scan.id });
    render(<ScanDetail />);
    const states = ['Vulnerabilities', 'No Findings', 'Scan in Progress'];
    expect(states.some((text) => screen.queryByText(text) !== null)).toBe(true);
  });
});
