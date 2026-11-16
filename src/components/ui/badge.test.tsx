import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { Badge } from './badge';

describe('Badge', () => {
  it('renders its text', () => {
    render(<Badge>3 overdue</Badge>);
    expect(screen.getByText('3 overdue')).toBeInTheDocument();
  });

  it('no longer relies on all-caps or heavy borders', () => {
    render(<Badge>open</Badge>);
    const el = screen.getByText('open');
    expect(el.className).not.toMatch(/uppercase/);
    expect(el.className).not.toMatch(/border-2/);
  });

  it('applies the destructive variant', () => {
    render(<Badge variant="destructive">critical</Badge>);
    expect(screen.getByText('critical')).toHaveClass('bg-[var(--risk-high)]');
  });

  it('applies the outline variant', () => {
    render(<Badge variant="outline">info</Badge>);
    expect(screen.getByText('info')).toHaveClass('border-[var(--rule-strong)]');
  });
});
