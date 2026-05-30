import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboardNavigation } from './useKeyboardNavigation';

describe('useKeyboardNavigation', () => {
  it('calls onEscape when Escape is pressed', () => {
    const onEscape = vi.fn();
    renderHook(() => useKeyboardNavigation({ onEscape }));

    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    document.dispatchEvent(event);

    expect(onEscape).toHaveBeenCalled();
  });

  it('calls onEnter when Enter is pressed', () => {
    const onEnter = vi.fn();
    renderHook(() => useKeyboardNavigation({ onEnter }));

    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    document.dispatchEvent(event);

    expect(onEnter).toHaveBeenCalled();
  });

  it('does not call handlers when disabled', () => {
    const onEscape = vi.fn();
    renderHook(() => useKeyboardNavigation({ onEscape, enabled: false }));

    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    document.dispatchEvent(event);

    expect(onEscape).not.toHaveBeenCalled();
  });

  it('removes event listener on unmount', () => {
    const onEscape = vi.fn();
    const { unmount } = renderHook(() => useKeyboardNavigation({ onEscape }));

    unmount();

    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    document.dispatchEvent(event);

    expect(onEscape).not.toHaveBeenCalled();
  });
});
