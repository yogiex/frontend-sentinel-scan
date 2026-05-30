import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StorageWarning } from './StorageWarning';

describe('StorageWarning', () => {
  it('does not render when under capacity', () => {
    render(<StorageWarning current={3000} max={5000} />);
    expect(screen.queryByText(/storage/i)).not.toBeInTheDocument();
  });

  it('renders warning when near capacity', () => {
    render(<StorageWarning current={4800} max={5000} />);
    expect(screen.getByText(/storage.*capacity/i)).toBeInTheDocument();
  });

  it('renders critical warning when over 95%', () => {
    render(<StorageWarning current={4800} max={5000} />);
    expect(screen.getByText(/4800\/5000/)).toBeInTheDocument();
  });
});
