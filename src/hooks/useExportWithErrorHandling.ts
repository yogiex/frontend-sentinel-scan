import { useCallback, useState } from 'react';

interface UseExportOptions {
  onExport: () => void | Promise<void>;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

export function useExportWithErrorHandling({
  onExport,
  onSuccess,
  onError,
}: UseExportOptions) {
  const [exporting, setExporting] = useState(false);

  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      await onExport();
      onSuccess?.();
    } catch (error) {
      console.error('Export failed:', error);
      onError?.(error);
    } finally {
      setExporting(false);
    }
  }, [onExport, onSuccess, onError]);

  return {
    exporting,
    handleExport,
  };
}
