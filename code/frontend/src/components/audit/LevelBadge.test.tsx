import { render, screen } from '@testing-library/react';
import { LevelBadge } from './LevelBadge';
import type { LogLevel } from '@/lib/logger';

describe('LevelBadge', () => {
  const levels: LogLevel[] = ['debug', 'info', 'warn', 'error', 'critical'];

  levels.forEach((level) => {
    it(`renders ${level} level correctly`, () => {
      render(<LevelBadge level={level} />);
      expect(screen.getByText(level.toUpperCase())).toBeInTheDocument();
    });
  });

  it('applies custom className', () => {
    render(<LevelBadge level="info" className="custom-class" />);
    expect(screen.getByText('INFO').closest('span')).toHaveClass('custom-class');
  });
});
