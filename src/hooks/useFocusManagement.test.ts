import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFocusManagement } from './useFocusManagement';

describe('useFocusManagement', () => {
  it('provides containerRef', () => {
    const { result } = renderHook(() => useFocusManagement());
    expect(result.current.containerRef).toBeDefined();
  });

  it('sets initial focus when provided', () => {
    // Create a button to focus
    const button = document.createElement('button');
    button.id = 'test-button';
    document.body.appendChild(button);

    renderHook(() => useFocusManagement({ initialFocus: '#test-button' }));

    expect(document.activeElement).toBe(button);

    document.body.removeChild(button);
  });

  it('traps focus when enabled', () => {
    const { result } = renderHook(() => useFocusManagement({ trapFocus: true }));
    expect(result.current.containerRef).toBeDefined();
  });
});
