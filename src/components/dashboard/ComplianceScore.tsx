/**
 * SentinelScan Compliance Score Component
 * Progress bars showing compliance status for various frameworks
 */
import { Badge } from '@/components/ui/badge';

interface ComplianceFramework {
  name: string;
  score: number;
  status: 'pass' | 'fail' | 'partial';
  totalControls: number;
  passedControls: number;
}

interface ComplianceScoreProps {
  frameworks: ComplianceFramework[];
}

const statusColors: Record<string, React.CSSProperties> = {
  pass: { color: 'var(--success)' },
  fail: { color: 'var(--danger)' },
  partial: { color: 'var(--warning)' },
};

const statusBarColors: Record<string, string> = {
  pass: 'var(--success)',
  fail: 'var(--danger)',
  partial: 'var(--warning)',
};

const statusLabels: Record<string, string> = {
  pass: 'Compliant',
  fail: 'Non-Compliant',
  partial: 'Partial',
};

export function ComplianceScore({ frameworks }: ComplianceScoreProps) {
  return (
    <div className="space-y-4">
      {frameworks.map((fw) => {
        const percentage = Math.round((fw.passedControls / fw.totalControls) * 100);
        const barColor = statusBarColors[fw.status];

        return (
          <div key={fw.name} className="space-y-2">
            {/* Framework Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span style={{ color: 'var(--text-primary)' }} className="text-sm font-semibold">{fw.name}</span>
                <Badge
                  variant="outline"
                  style={statusColors[fw.status]}
                  className="text-xs"
                >
                  {statusLabels[fw.status]}
                </Badge>
              </div>
              <span style={{ color: 'var(--text-primary)' }} className="text-sm font-bold">{percentage}%</span>
            </div>

            {/* Progress Bar */}
            <div style={{ backgroundColor: 'var(--bg-secondary)' }} className="h-2 rounded-full overflow-hidden">
              <div
                style={{ width: `${percentage}%`, backgroundColor: barColor }}
                className="h-full rounded-full transition-all duration-500"
              />
            </div>

            {/* Controls Count */}
            <p style={{ color: 'var(--text-secondary)' }} className="text-xs">
              {fw.passedControls}/{fw.totalControls} controls passed
            </p>
          </div>
        );
      })}
    </div>
  );
}
