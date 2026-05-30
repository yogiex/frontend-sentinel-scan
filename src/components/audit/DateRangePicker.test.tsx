import { render, screen, fireEvent } from '@testing-library/react';
import { DateRangePicker } from './DateRangePicker';

describe('DateRangePicker', () => {
  it('renders with placeholder text', () => {
    render(<DateRangePicker onRangeChange={() => {}} />);
    expect(screen.getByText('Pick a date range')).toBeInTheDocument();
  });

  it('shows clear button when range is set', () => {
    render(
      <DateRangePicker
        onRangeChange={() => {}}
        defaultFrom={new Date('2026-01-01')}
        defaultTo={new Date('2026-01-31')}
      />
    );
    expect(screen.getByText('Clear')).toBeInTheDocument();
  });
});
