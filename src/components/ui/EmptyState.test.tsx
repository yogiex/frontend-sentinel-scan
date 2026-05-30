import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState } from './EmptyState';
import { AlertCircle } from 'lucide-react';

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(<EmptyState title="No scans" description="Create your first scan" />);
    expect(screen.getByText('No scans')).toBeInTheDocument();
    expect(screen.getByText('Create your first scan')).toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    render(<EmptyState title="Test" description="Test" icon={<AlertCircle />} />);
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('calls onAction when action button clicked', () => {
    const onAction = vi.fn();
    render(<EmptyState title="Test" description="Test" actionText="Create" onAction={onAction} />);
    fireEvent.click(screen.getByText('Create'));
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
