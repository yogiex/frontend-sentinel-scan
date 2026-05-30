/**
 * SentinelScan Active Scan Progress Component
 * Displays progress bars for currently running scans
 */
import { Badge } from '@/components/ui/badge';

interface ActiveScan {
  id: string;
  target: string;
  progress: number;
  startedAt: string;
  estimatedRemaining: string;
  type: string;
}

interface ActiveScanProgressProps {
  scans: ActiveScan[];
}

export function ActiveScanProgress({ scans }: ActiveScanProgressProps) {
  if (scans.length === 0) {
    return (
      <div 
        className="flex flex-col items-center justify-center h-40"
        style={{ color: 'var(--text-muted)' }}
      >
        <p className="text-lg">No active scans</p>
        <p className="text-sm">Start a new scan to see progress here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {scans.map((scan) => (
        <div key={scan.id} className="space-y-2">
          {/* Scan Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span 
                className="text-sm font-mono"
                style={{ color: 'var(--text-primary)' }}
              >
                {scan.target}
              </span>
              <Badge variant="secondary" className="text-xs">
                {scan.type}
              </Badge>
            </div>
            <span 
              className="text-sm"
              style={{ color: 'var(--text-muted)' }}
            >
              {scan.progress}%
            </span>
          </div>

          {/* Progress Bar */}
          <div 
            className="h-2 rounded-full overflow-hidden"
            style={{ backgroundColor: 'var(--bg-hover)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ 
                width: `${scan.progress}%`,
                backgroundColor: scan.progress === 100 
                  ? 'var(--success)' 
                  : scan.progress > 70
                  ? 'var(--primary)'
                  : scan.progress > 40
                  ? 'var(--primary)'
                  : 'var(--primary-dark)',
              }}
            />
          </div>

          {/* Scan Details */}
          <div 
            className="flex items-center justify-between text-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            <span>Started: {scan.startedAt}</span>
            <span>ETA: {scan.estimatedRemaining}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
