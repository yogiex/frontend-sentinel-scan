import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { SeverityBadge } from './SeverityBadge';

describe('SeverityBadge', () => {
  it('renders the level label', () => {
    render(<SeverityBadge severity="critical" />);
    expect(screen.getByText('Critical')).toBeInTheDocument();
  });

  it('falls back to Unknown for unrecognised values', () => {
    render(<SeverityBadge severity="catastrophic" />);
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  it('gives high and medium different colours', () => {
    const { container: high } = render(<SeverityBadge severity="high" />);
    const { container: medium } = render(<SeverityBadge severity="medium" />);
    const highStyle = (high.querySelector('span') as HTMLElement).style.backgroundColor;
    const mediumStyle = (medium.querySelector('span') as HTMLElement).style.backgroundColor;
    expect(highStyle).not.toBe(mediumStyle);
  });

  it('carries an icon as well as colour', () => {
    const { container } = render(<SeverityBadge severity="low" />);
    expect(container.querySelector('svg')).not.toBeNull();
  });
});
