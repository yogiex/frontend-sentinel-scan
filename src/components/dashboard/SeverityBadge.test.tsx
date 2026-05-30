import { render, screen } from '@testing-library/react';
import { SeverityBadge } from './SeverityBadge';

describe('SeverityBadge', () => {
  it('renders critical severity correctly', () => {
    render(<SeverityBadge severity="critical" />);
    expect(screen.getByText('Critical')).toBeInTheDocument();
  });

  it('renders high severity correctly', () => {
    render(<SeverityBadge severity="high" />);
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('renders medium severity correctly', () => {
    render(<SeverityBadge severity="medium" />);
    expect(screen.getByText('Medium')).toBeInTheDocument();
  });

  it('renders low severity correctly', () => {
    render(<SeverityBadge severity="low" />);
    expect(screen.getByText('Low')).toBeInTheDocument();
  });

  it('defaults to low severity for unknown values', () => {
    render(<SeverityBadge severity="unknown" />);
    expect(screen.getByText('Low')).toBeInTheDocument();
  });

  it('applies correct CSS variables for critical severity', () => {
    render(<SeverityBadge severity="critical" />);
    const badge = screen.getByText('Critical');
    expect(badge).toHaveStyle({ color: 'var(--danger)' });
  });
});
