import { render, screen, fireEvent } from '@testing-library/react';
import { FilterBar } from './FilterBar';
import type { LogLevel, AuditCategory } from '@/lib/logger';

describe('FilterBar', () => {
  const defaultProps = {
    levelFilter: 'all' as LogLevel | 'all',
    categoryFilter: 'all' as AuditCategory | 'all',
    searchInput: '',
    onLevelChange: vi.fn(),
    onCategoryChange: vi.fn(),
    onSearchChange: vi.fn(),
    onDateRangeChange: vi.fn(),
    onRefresh: vi.fn(),
    onExport: vi.fn(),
    onClear: vi.fn(),
  };

  it('renders all filter controls', () => {
    render(<FilterBar {...defaultProps} />);
    expect(screen.getByPlaceholderText('Search logs...')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /filter by level/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /filter by category/i })).toBeInTheDocument();
  });

  it('calls onSearchChange when typing', () => {
    render(<FilterBar {...defaultProps} />);
    const input = screen.getByPlaceholderText('Search logs...');
    fireEvent.change(input, { target: { value: 'test' } });
    expect(defaultProps.onSearchChange).toHaveBeenCalledWith('test');
  });

  it('calls onRefresh when refresh button clicked', () => {
    render(<FilterBar {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('Refresh'));
    expect(defaultProps.onRefresh).toHaveBeenCalledTimes(1);
  });
});
