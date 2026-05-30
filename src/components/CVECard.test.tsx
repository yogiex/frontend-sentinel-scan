import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CVECard } from './CVECard';

const mockCVE = {
  cveId: 'CVE-2024-3094',
  severity: 'critical' as const,
  cvssScore: 10.0,
  affectedAssets: 23,
  description: 'XZ Utils backdoor in liblzma — remote code execution via SSH',
};

describe('CVECard', () => {
  it('renders CVE ID correctly', () => {
    render(<CVECard cve={mockCVE} />);
    expect(screen.getByText('CVE-2024-3094')).toBeInTheDocument();
  });

  it('renders severity badge', () => {
    render(<CVECard cve={mockCVE} />);
    expect(screen.getByText('Critical')).toBeInTheDocument();
  });

  it('renders CVSS score with tabular-nums', () => {
    render(<CVECard cve={mockCVE} />);
    const score = screen.getByText('10');
    expect(score).toHaveClass('tabular-nums');
  });

  it('renders description with line-clamp-2', () => {
    render(<CVECard cve={mockCVE} />);
    const description = screen.getByText(mockCVE.description);
    expect(description).toHaveClass('line-clamp-2');
  });

  it('renders affected assets count', () => {
    render(<CVECard cve={mockCVE} />);
    expect(screen.getByText('23 assets')).toBeInTheDocument();
  });

  it('uses button element for accessibility', () => {
    render(<CVECard cve={mockCVE} />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('has tabIndex={0} for keyboard accessibility', () => {
    render(<CVECard cve={mockCVE} />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('tabindex', '0');
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<CVECard cve={mockCVE} onClick={onClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('calls onClick when Enter key is pressed', () => {
    const onClick = vi.fn();
    render(<CVECard cve={mockCVE} onClick={onClick} />);
    const button = screen.getByRole('button');
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('calls onClick when Space key is pressed', () => {
    const onClick = vi.fn();
    render(<CVECard cve={mockCVE} onClick={onClick} />);
    const button = screen.getByRole('button');
    fireEvent.keyDown(button, { key: ' ' });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('has touch-manipulation class', () => {
    render(<CVECard cve={mockCVE} />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('touch-manipulation');
  });

  it('has group class for CSS hover states', () => {
    render(<CVECard cve={mockCVE} />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('group');
  });

  it('uses transition-transform instead of transition-all', () => {
    render(<CVECard cve={mockCVE} />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('transition-transform');
    expect(button.className).not.toContain('transition-all');
  });

  it('renders View Details as text when onClick provided', () => {
    render(<CVECard cve={mockCVE} onClick={() => {}} />);
    expect(screen.getByText('View Details →')).toBeInTheDocument();
  });

  it('does not render View Details when no onClick provided', () => {
    render(<CVECard cve={mockCVE} />);
    expect(screen.queryByText('View Details →')).not.toBeInTheDocument();
  });
});
