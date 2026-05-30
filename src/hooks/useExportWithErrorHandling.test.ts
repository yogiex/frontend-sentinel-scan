import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useExportWithErrorHandling } from './useExportWithErrorHandling';

describe('useExportWithErrorHandling', () => {
  it('sets exporting state during export', async () => {
    const onExport = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
    const { result } = renderHook(() => useExportWithErrorHandling({ onExport }));

    result.current.handleExport();
    expect(result.current.exporting).toBe(true);
  });

  it('handles export success', async () => {
    const onExport = vi.fn().mockResolvedValue(undefined);
    const onSuccess = vi.fn();
    const { result } = renderHook(() => useExportWithErrorHandling({ onExport, onSuccess }));

    await result.current.handleExport();
    expect(result.current.exporting).toBe(false);
    expect(onSuccess).toHaveBeenCalled();
  });

  it('handles export error', async () => {
    const onExport = vi.fn().mockRejectedValue(new Error('Export failed'));
    const onError = vi.fn();
    const { result } = renderHook(() => useExportWithErrorHandling({ onExport, onError }));

    await result.current.handleExport();
    expect(result.current.exporting).toBe(false);
    expect(onError).toHaveBeenCalled();
  });
});
