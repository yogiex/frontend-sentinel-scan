import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { TerminalWindow, TerminalLine, SentinelScanTerminal } from './TerminalWindow';

describe('TerminalWindow', () => {
  it('renders children and the default title', () => {
    render(<TerminalWindow>Content</TerminalWindow>);
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('sentinelscan://console')).toBeInTheDocument();
  });

  it('shows the scanline overlay only when requested', () => {
    const { container, rerender } = render(<TerminalWindow>Content</TerminalWindow>);
    expect(container.querySelector('.bg-scanlines')).toBeNull();
    rerender(<TerminalWindow showScanlines>Content</TerminalWindow>);
    expect(container.querySelector('.bg-scanlines')).not.toBeNull();
  });

  it('accepts a custom title', () => {
    render(<TerminalWindow title="scan://run-42">Content</TerminalWindow>);
    expect(screen.getByText('scan://run-42')).toBeInTheDocument();
  });

  it('renders a critical line in the critical token', () => {
    render(<TerminalLine content="CVE-2024-6387" type="critical" />);
    expect(screen.getByText('CVE-2024-6387')).toHaveStyle({ color: 'var(--term-critical)' });
  });

  it('renders the pre-configured demo', () => {
    render(<SentinelScanTerminal />);
    expect(screen.getByText(/sentinelscan scan --target/)).toBeInTheDocument();
    expect(screen.getByText(/CVE-2024-6387/)).toBeInTheDocument();
  });
});
