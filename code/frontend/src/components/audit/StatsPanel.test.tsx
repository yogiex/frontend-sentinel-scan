import { render, screen } from '@testing-library/react';
import { StatsPanel } from './StatsPanel';

// Mock the RealtimeIndicator component
vi.mock('./RealtimeIndicator', () => ({
  RealtimeIndicator: ({ active }: { active: boolean }) => (
    <div>{active ? 'Live' : 'Paused'}</div>
  ),
}));

describe('StatsPanel', () => {
  const mockStats = {
    total: 1000,
    byLevel: { debug: 100, info: 600, warn: 200, error: 80, critical: 20 },
    byCategory: [
      { category: 'auth', count: 300 },
      { category: 'scan', count: 500 },
    ],
    byUser: [{ user: 'admin', count: 800 }],
  };

  it('renders all stat cards', () => {
    render(<StatsPanel stats={mockStats} />);
    expect(screen.getByText('1,000')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('displays real-time indicator', () => {
    render(<StatsPanel stats={mockStats} realtime={true} onToggleRealtime={() => {}} />);
    expect(screen.getByText('Live')).toBeInTheDocument();
  });
});
