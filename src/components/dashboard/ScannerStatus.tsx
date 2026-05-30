/**
 * SentinelScan Scanner Status Component
 * Displays scanner health, active engines, and queue status
 */
import { Badge } from '@/components/ui/badge';

interface ScannerStatusProps {
  online: boolean;
  enginesActive: number;
  enginesTotal: number;
  lastScanTime: string;
  queueLength: number;
  engines: string[];
}

export function ScannerStatus({
  online,
  enginesActive,
  enginesTotal,
  lastScanTime,
  queueLength,
  engines,
}: ScannerStatusProps) {
  return (
    <div className="space-y-4">
      {/* Status Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: online ? 'var(--success)' : 'var(--danger)',
              animation: online ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none',
            }}
          />
          <span 
            className="text-lg font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            {online ? 'Scanner Online' : 'Scanner Offline'}
          </span>
        </div>
        <Badge variant={online ? 'default' : 'destructive'}>
          {online ? 'Operational' : 'Down'}
        </Badge>
      </div>

      {/* Engine Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div 
          className="rounded-lg p-3"
          style={{ backgroundColor: 'var(--bg-hover)' }}
        >
          <p 
            className="text-xs mb-1"
            style={{ color: 'var(--text-muted)' }}
          >
            Active Engines
          </p>
          <p 
            className="text-xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            {enginesActive}/{enginesTotal}
          </p>
        </div>
        <div 
          className="rounded-lg p-3"
          style={{ backgroundColor: 'var(--bg-hover)' }}
        >
          <p 
            className="text-xs mb-1"
            style={{ color: 'var(--text-muted)' }}
          >
            Queue Length
          </p>
          <p 
            className="text-xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            {queueLength}
          </p>
        </div>
      </div>

      {/* Engine List */}
      <div>
        <p 
          className="text-xs mb-2"
          style={{ color: 'var(--text-muted)' }}
        >
          Running Engines
        </p>
        <div className="flex flex-wrap gap-2">
          {engines.map((engine) => (
            <span
              key={engine}
              className="px-2 py-1 rounded-md text-xs"
              style={{ 
                backgroundColor: 'var(--bg-hover)',
                color: 'var(--text-secondary)',
              }}
            >
              {engine}
            </span>
          ))}
        </div>
      </div>

      {/* Last Scan */}
      <div 
        className="pt-2"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <p 
          className="text-xs"
          style={{ color: 'var(--text-muted)' }}
        >
          Last scan completed: <span style={{ color: 'var(--text-primary)' }}>{lastScanTime}</span>
        </p>
      </div>
    </div>
  );
}
