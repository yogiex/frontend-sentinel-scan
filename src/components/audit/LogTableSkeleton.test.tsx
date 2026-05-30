import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LogTableSkeleton } from './LogTableSkeleton';

describe('LogTableSkeleton', () => {
  it('renders correct number of skeleton rows', () => {
    render(<LogTableSkeleton rows={5} />);
    const skeletons = document.querySelectorAll('[data-testid="log-table-skeleton"] > div');
    // Header + 5 rows = 6 total divs
    expect(skeletons.length).toBe(6);
  });

  it('renders default 10 rows when not specified', () => {
    render(<LogTableSkeleton />);
    const rows = document.querySelectorAll('.flex.items-center.gap-4.px-4.py-3');
    // Header + 10 rows
    expect(rows.length).toBe(11);
  });

  it('has correct testid', () => {
    render(<LogTableSkeleton />);
    expect(screen.getByTestId('log-table-skeleton')).toBeInTheDocument();
  });
});
