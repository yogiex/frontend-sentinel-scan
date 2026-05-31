import { Card, CardContent } from '@/components/ui/card';
import { SeverityBadge } from '@/components/dashboard/SeverityBadge';

export interface CVE {
  cveId: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  cvssScore: number;
  affectedAssets: number;
  description: string;
}

export interface CVECardProps {
  cve: CVE;
  onClick?: () => void;
}

export function CVECard({ cve, onClick }: CVECardProps) {
  const isCritical = cve.severity === 'critical';
  const accentColor = isCritical ? 'var(--danger)' : 'var(--warning)';

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden"
      style={{ borderLeft: `4px solid ${accentColor}` }}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <SeverityBadge severity={cve.severity} />
              <span className="font-mono text-xs tabular-nums" style={{ color: accentColor }}>
                {cve.cveId}
              </span>
            </div>

            <p className="text-xs leading-relaxed mb-2 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
              {cve.description}
            </p>

            <div className="flex items-center gap-2 text-[10px]" style={{ color: 'var(--text-muted)' }}>
              <span className="flex items-center gap-1">
                <span className="w-1 h-1 rounded-full" style={{ backgroundColor: accentColor }} />
                {cve.affectedAssets} assets
              </span>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <div
              className="text-3xl font-bold leading-none tabular-nums"
              style={{ color: accentColor }}
            >
              {cve.cvssScore}
            </div>
            <div className="text-[9px] uppercase tracking-widest mt-1" style={{ color: 'var(--text-muted)' }}>
              CVSS
            </div>
          </div>
        </div>

        {onClick && (
          <div className="mt-2">
            <span className="text-[10px] flex items-center gap-1" style={{ color: 'var(--primary)' }}>
              View Details →
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
