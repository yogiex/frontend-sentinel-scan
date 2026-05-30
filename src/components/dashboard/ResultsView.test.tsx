import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { ResultsView } from './ResultsView';
import { ScanResult } from '../../types';

const mockResults: ScanResult[] = [
  {
    id: 1,
    scanId: 1,
    target: 'http://example.com',
    templateId: 'CVE-2023-1234',
    finding: { vulnerable: true },
    createdAt: '2026-04-29T12:00:00Z',
  },
];

describe('ResultsView', () => {
  it('renders results', () => {
    render(<ResultsView results={mockResults} loading={false} />);
    expect(screen.getByText('CVE-2023-1234')).toBeInTheDocument();
  });

  it('shows empty state', () => {
    render(<ResultsView results={[]} loading={false} />);
    expect(screen.getByText(/no results found/i)).toBeInTheDocument();
  });
});
