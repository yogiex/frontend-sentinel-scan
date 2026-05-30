/**
 * SentinelScan Top CVEs List Component
 * Displays the most critical CVEs found recently
 */
import { Badge } from '@/components/ui/badge';

interface TopCVE {
  cveId: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  cvssScore: number;
  affectedAssets: number;
  description: string;
}

interface TopCVEsListProps {
  cves: TopCVE[];
}

const severityStyles: Record<string, React.CSSProperties> = {
  critical: { backgroundColor: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' },
  high: { backgroundColor: 'rgba(249, 115, 22, 0.2)', color: '#fb923c', borderColor: 'rgba(249, 115, 22, 0.3)' },
  medium: { backgroundColor: 'rgba(245, 158, 11, 0.2)', color: 'var(--warning)', borderColor: 'rgba(245, 158, 11, 0.3)' },
  low: { backgroundColor: 'rgba(16, 185, 129, 0.2)', color: 'var(--success)', borderColor: 'rgba(16, 185, 129, 0.3)' },
};

export function TopCVEsList({ cves }: TopCVEsListProps) {
  return (
    <div className="space-y-3">
      {cves.map((cve) => (
        <div
          key={cve.cveId}
          style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', borderColor: 'var(--border)' }}
          className="p-3 rounded-lg border hover:border-slate-600 transition-colors"
        >
          {/* CVE Header */}
          <div className="flex items-center justify-between mb-2">
            <span style={{ color: 'var(--primary)' }} className="text-sm font-mono font-semibold">
              {cve.cveId}
            </span>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                style={severityStyles[cve.severity]}
              >
                {cve.severity.toUpperCase()}
              </Badge>
              <span style={{ color: 'var(--text-muted)' }} className="text-xs">
                CVSS {cve.cvssScore}
              </span>
            </div>
          </div>

          {/* Description */}
          <p style={{ color: 'var(--text-muted)' }} className="text-xs line-clamp-2 mb-2">
            {cve.description}
          </p>

          {/* Affected Assets */}
          <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <span>Affected:</span>
            <span style={{ color: 'var(--text-primary)' }} className="font-medium">{cve.affectedAssets}</span>
            <span>assets</span>
          </div>
        </div>
      ))}
    </div>
  );
}
