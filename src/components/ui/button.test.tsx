import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { Button } from './button';

describe('Button', () => {
  it('renders its label and is a native button', () => {
    render(<Button>Save changes</Button>);
    const btn = screen.getByRole('button', { name: 'Save changes' });
    expect(btn.tagName).toBe('BUTTON');
    expect(btn).toHaveAttribute('type', 'button');
  });

  it('supports the destructive variant', () => {
    render(<Button variant="destructive">Move to trash</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-[var(--risk-high)]');
  });

  it('supports the outline variant', () => {
    render(<Button variant="outline">Cancel</Button>);
    expect(screen.getByRole('button')).toHaveClass('border-[var(--rule-strong)]');
  });

  it('disables interaction when disabled', () => {
    render(<Button disabled>Launching…</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('renders icon size without text overflow', () => {
    render(
      <Button size="icon" aria-label="Open navigation">
        <span aria-hidden="true">x</span>
      </Button>,
    );
    expect(screen.getByRole('button', { name: 'Open navigation' })).toHaveClass('h-9');
  });
});
