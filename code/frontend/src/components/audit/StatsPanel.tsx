import type { AuditLogState } from '@/store/slices/auditLogSlice';
import { Card, CardContent } from '@/components/ui/card';
import { RealtimeIndicator } from './RealtimeIndicator';

interface StatsPanelProps {
  stats: AuditLogState['stats'];
  realtime?: boolean;
  onToggleRealtime?: () => void;
}

export function StatsPanel({ stats, realtime = false, onToggleRealtime }: StatsPanelProps) {
  const statCards = [
    {
      label: 'Total Entries',
      value: stats.total,
      accent: 'var(--led-green)',
    },
    {
      label: 'Errors',
      value: stats.byLevel.error + stats.byLevel.critical,
      accent: 'var(--led-red)',
    },
    {
      label: 'Critical',
      value: stats.byLevel.critical,
      accent: 'var(--led-dark-red)',
    },
    {
      label: 'Categories',
      value: stats.byCategory.length,
      accent: 'var(--led-amber)',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statCards.map((card) => (
        <Card key={card.label} className="stat-card" style={{ '--stat-accent': card.accent } as React.CSSProperties}>
          <CardContent className="p-4">
            <p className="stat-label">{card.label}</p>
            <p className="stat-value">{card.value.toLocaleString()}</p>
          </CardContent>
        </Card>
      ))}
      {onToggleRealtime && (
        <div className="flex items-end pb-4">
          <RealtimeIndicator active={realtime} onToggle={onToggleRealtime} />
        </div>
      )}
    </div>
  );
}
