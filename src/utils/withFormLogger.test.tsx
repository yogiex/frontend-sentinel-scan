/**
 * Tests for withFormLogger.tsx
 * Path: src/utils/withFormLogger.test.tsx
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { withFormLogger } from './withFormLogger';
import { logUI } from '@/lib/logger';

vi.mock('@/lib/logger', () => ({
  logUI: vi.fn(),
}));

const MockForm = ({ onSubmit }: { onSubmit?: () => void }) => (
  <form onSubmit={onSubmit} data-testid="mock-form">
    <button type="submit">Submit</button>
  </form>
);

describe('withFormLogger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('logs form mount on render', () => {
    const WrappedForm = withFormLogger(MockForm, { formName: 'test_form' });
    render(<WrappedForm />);
    expect(logUI).toHaveBeenCalledWith('test_form_form', 'mount', { form: 'test_form' });
  });

  it('sets displayName correctly', () => {
    const WrappedForm = withFormLogger(MockForm, { formName: 'test' });
    expect(WrappedForm.displayName).toBe('withFormLogger(MockForm)');
  });
});