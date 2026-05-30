import { Badge } from '@/components/ui/badge';

type Severity = 'critical' | 'high' | 'medium' | 'low';

interface SeverityBadgeProps {
  severity: Severity;
}

const severityConfig: Record<Severity, { label: string; bg: string; text: string; border: string }> = {
  critical: { label: 'Critical', bg: 'rgba(239, 68, 68, 0.1)', text: 'var(--danger)', border: 'var(--danger)' },
  high: { label: 'High', bg: 'rgba(249, 115, 22, 0.1)', text: 'var(--warning)', border: 'var(--warning)' },
  medium: { label: 'Medium', bg: 'rgba(245, 158, 11, 0.1)', text: 'var(--warning)', border: 'var(--warning)' },
  low: { label: 'Low', bg: 'rgba(100, 116, 139, 0.1)', text: 'var(--text-secondary)', border: 'var(--border)' },
};

const allSeverities: Severity[] = ['critical', 'high', 'medium', 'low'];
const isValidSeverity = (s: string): s is Severity => allSeverities.includes(s as Severity);

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  const config = isValidSeverity(severity) ? severityConfig[severity] : severityConfig.low;
  
  return (
    <Badge
      variant="outline"
      className="text-[10px] font-semibold uppercase tracking-wider"
      style={{
        backgroundColor: config.bg,
        color: config.text,
        borderColor: config.border,
      }}
    >
      {config.label}
    </Badge>
  );
}
