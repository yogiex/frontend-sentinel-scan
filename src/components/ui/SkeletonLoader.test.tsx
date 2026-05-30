import { render } from '@testing-library/react';
import { SkeletonLoader } from './SkeletonLoader';

describe('SkeletonLoader', () => {
  it('renders correct number of rows', () => {
    render(<SkeletonLoader rows={3} />);
    const rows = document.querySelectorAll('.flex.gap-4');
    expect(rows.length).toBe(3);
  });

  it('renders correct number of columns', () => {
    render(<SkeletonLoader rows={1} columns={4} />);
    const columns = document.querySelectorAll('.h-6.rounded.animate-pulse');
    expect(columns.length).toBe(4);
  });

  it('applies custom className', () => {
    const { container } = render(<SkeletonLoader className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
