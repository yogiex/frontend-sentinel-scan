import { cn } from '@/lib/utils';
import { SEVERITY, normalizeSeverity, type Severity } from '@/shared/lib/severity';

export interface SeverityTagProps {
  severity: string | null | undefined;
  /** tint = default on paper, solid = on dense headers, bare = inside tables */
  variant?: 'tint' | 'solid' | 'bare';
  /** optional CVSS score, rendered as mono */
  score?: number | null;
  className?: string;
}

export function SeverityTag({
  severity,
  variant = 'tint',
  score,
  className,
}: SeverityTagProps) {
  const key: Severity = normalizeSeverity(severity);
  const meta = SEVERITY[key];
  const Icon = meta.icon;

  const styles =
    variant === 'solid'
      ? { backgroundColor: meta.fill, color: '#fff', borderColor: meta.fill }
      : variant === 'tint'
        ? { backgroundColor: meta.tint, color: meta.text, borderColor: 'transparent' }
        : { backgroundColor: 'transparent', color: meta.text, borderColor: 'transparent' };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 text-xs font-medium',
        className,
      )}
      style={styles}
      title={`Severity: ${meta.label}`}
    >
      <Icon className="size-3 shrink-0" aria-hidden="true" />
      <span>{meta.label}</span>
      {score !== null && score !== undefined && (
        <span className="tnum font-mono text-[11px] opacity-80">{score.toFixed(1)}</span>
      )}
    </span>
  );
}
