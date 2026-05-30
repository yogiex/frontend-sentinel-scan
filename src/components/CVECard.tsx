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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <button
      type="button"
      tabIndex={0}
      className="group relative overflow-hidden rounded-xl w-full text-left transition-transform duration-300 hover:translate-x-1 focus:outline-none focus:ring-2 focus:ring-offset-2 touch-manipulation"
      style={{ backgroundColor: 'transparent' }}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      onFocus={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
      }}
      onBlur={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      {/* Gradient accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl motion-safe:transition-width duration-300 group-hover:w-1.5"
        style={{ backgroundColor: accentColor, opacity: 0.8 }}
      />

      <div className="pl-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <SeverityBadge severity={cve.severity} />
              <span
                className="font-mono text-xs tabular-nums"
                style={{ color: accentColor, fontFamily: 'Share Tech Mono, monospace' }}
              >
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

          {/* Large CVSS Score - focal point */}
          <div className="text-right flex-shrink-0">
            <div
              className="text-3xl font-bold leading-none tabular-nums"
              style={{
                color: accentColor,
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 700,
                textShadow: `0 2px 8px ${accentColor}20`,
              }}
            >
              {cve.cvssScore}
            </div>
            <div className="text-[9px] uppercase tracking-widest mt-1" style={{ color: 'var(--text-muted)', fontFamily: 'Outfit, sans-serif' }}>
              CVSS
            </div>
          </div>
        </div>

        {onClick && (
          <div className="mt-2 opacity-0 motion-safe:transition-opacity duration-300 group-hover:opacity-100">
            <span
              className="text-[10px] flex items-center gap-1"
              style={{ color: 'var(--primary)', fontFamily: 'Outfit, sans-serif' }}
            >
              View Details →
            </span>
          </div>
        )}
      </div>
    </button>
  );
}
