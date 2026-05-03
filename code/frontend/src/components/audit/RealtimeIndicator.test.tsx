import { render, screen, fireEvent } from '@testing-library/react';
import { RealtimeIndicator } from './RealtimeIndicator';

describe('RealtimeIndicator', () => {
  it('renders with paused state by default', () => {
    render(<RealtimeIndicator active={false} onToggle={() => {}} />);
    expect(screen.getByText('Paused')).toBeInTheDocument();
  });

  it('renders with live state', () => {
    render(<RealtimeIndicator active={true} onToggle={() => {}} />);
    expect(screen.getByText('Live')).toBeInTheDocument();
  });

  it('calls onToggle when clicked', () => {
    const onToggle = vi.fn();
    render(<RealtimeIndicator active={false} onToggle={onToggle} />);
    fireEvent.click(screen.getByText('Paused'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
