import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface StorageWarningProps {
  current: number;
  max: number;
  onExport?: () => void;
  onClear?: () => void;
}

export function StorageWarning({ current, max, onExport, onClear }: StorageWarningProps) {
  const percentage = (current / max) * 100;
  const isNearCapacity = percentage > 90;
  const isCritical = percentage > 95;

  if (!isNearCapacity) return null;

  return (
    <Alert variant={isCritical ? 'destructive' : 'default'}>
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>
        {isCritical ? 'Storage Critical' : 'Storage Near Capacity'}
      </AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>
          Log storage is at {current}/{max} entries ({percentage.toFixed(1)}%). 
          Consider exporting and clearing old logs.
        </span>
        <div className="flex gap-2 ml-4">
          {onExport && (
            <button onClick={onExport}>Export</button>
          )}
          {onClear && (
            <button onClick={onClear}>Clear</button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
