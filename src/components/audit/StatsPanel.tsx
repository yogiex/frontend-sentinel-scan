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
      color: 'text-slate-900',
      borderColor: 'border-indigo-600',
    },
    {
      label: 'Errors',
      value: stats.byLevel.error + stats.byLevel.critical,
      color: 'text-red-500',
      borderColor: 'border-red-500',
    },
    {
      label: 'Critical',
      value: stats.byLevel.critical,
      color: 'text-red-600',
      borderColor: 'border-red-600',
    },
    {
      label: 'Categories',
      value: stats.byCategory.length,
      color: 'text-amber-500',
      borderColor: 'border-amber-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statCards.map((card) => (
        <Card key={card.label} className={`border-l-4 ${card.borderColor} bg-white`}>
          <CardContent className="p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{card.label}</p>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value.toLocaleString()}</p>
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
