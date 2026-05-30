import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Dashboard } from './Dashboard';

describe('Dashboard', () => {
  it('renders dashboard heading', () => {
    render(<Dashboard />);
    expect(screen.getByText(/vulnerability scanner dashboard/i)).toBeInTheDocument();
  });
});
