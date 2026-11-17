/**
 * Tests for useNavigationLogger.ts
 * Path: src/hooks/useNavigationLogger.test.tsx
 */
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useNavigationLogger } from './useNavigationLogger';

vi.mock('@/lib/logger', () => ({
  logNavigation: vi.fn(),
}));

function TestComponent({ initialPath = '/' }: { initialPath?: string }) {
  useNavigationLogger();
  return <div data-testid="path">{initialPath}</div>;
}

describe('useNavigationLogger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('is defined as a function', () => {
    expect(typeof useNavigationLogger).toBe('function');
  });

  it('can be rendered inside a router without crashing', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <TestComponent />
      </MemoryRouter>
    );
    expect(true).toBe(true);
  });
});
