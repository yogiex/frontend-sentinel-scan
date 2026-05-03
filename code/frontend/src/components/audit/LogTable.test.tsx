import { render, screen, fireEvent } from '@testing-library/react';
import { LogTable } from './LogTable';
import type { AuditLogEntry } from '@/lib/logger';

const mockEntries: AuditLogEntry[] = [
  {
    id: 'log_1',
    timestamp: new Date().toISOString(),
    level: 'info',
    category: 'auth',
    action: 'User logged in',
    user: 'admin',
    details: { ip: '127.0.0.1' },
    sessionId: 'sess_1',
    userAgent: 'Mozilla/5.0',
  },
  {
    id: 'log_2',
    timestamp: new Date().toISOString(),
    level: 'error',
    category: 'scan',
    action: 'Scan failed',
    user: 'admin',
    details: { error: 'Connection timeout' },
    sessionId: 'sess_1',
    userAgent: 'Mozilla/5.0',
  },
];

describe('LogTable', () => {
  it('renders table with entries', () => {
    render(<LogTable entries={mockEntries} />);
    expect(screen.getByText('User logged in')).toBeInTheDocument();
    expect(screen.getByText('Scan failed')).toBeInTheDocument();
  });

  it('shows empty state when no entries', () => {
    render(<LogTable entries={[]} />);
    expect(screen.getByText('No logs found')).toBeInTheDocument();
  });

  it('expands row on click', () => {
    render(<LogTable entries={mockEntries} />);
    const row = screen.getByText('User logged in').closest('tr');
    if (row) {
      fireEvent.click(row);
      expect(screen.getByText('Session ID:')).toBeInTheDocument();
    }
  });

  it('renders pagination when entries exceed page size', () => {
    const manyEntries = Array(50).fill(null).map((_, i) => ({
      ...mockEntries[0],
      id: `log_${i}`,
    }));
    render(<LogTable entries={manyEntries} />);
    expect(screen.getByText('Next')).toBeInTheDocument();
  });
});
