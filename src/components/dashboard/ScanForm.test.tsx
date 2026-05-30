import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ScanForm } from './ScanForm';

afterEach(() => {
  cleanup();
});

describe('ScanForm', () => {
  it('submits with valid targets', () => {
    const onSubmit = vi.fn();
    render(<ScanForm onSubmit={onSubmit} loading={false} />);

    const textarea = screen.getByLabelText(/targets/i);
    fireEvent.change(textarea, { target: { value: 'http://example.com' } });

    const button = screen.getByRole('button', { name: /start scan/i });
    fireEvent.click(button);

    expect(onSubmit).toHaveBeenCalledWith({ targets: ['http://example.com'] });
  });

  it('shows error for empty targets', () => {
    const onSubmit = vi.fn();
    render(<ScanForm onSubmit={onSubmit} loading={false} />);

    const button = screen.getByRole('button', { name: /start scan/i });
    fireEvent.click(button);

    expect(screen.getByText(/please enter at least one target/i)).toBeInTheDocument();
  });
});