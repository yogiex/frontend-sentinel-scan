/**
 * StatsCard — kartu statistik legacy.
 * Untuk kode baru pakai `@/shared/ui/StatStrip`.
 */
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  color?: string;
  borderColor?: string;
}

export function StatsCard({
  icon: Icon,
  label,
  value,
  color = 'var(--ink)',
  borderColor,
}: StatsCardProps) {
  return (
    <Card style={borderColor ? { borderColor } : undefined}>
      <CardContent className="flex items-start gap-3 p-4">
        <Icon className="mt-0.5 size-4 shrink-0" style={{ color }} aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-xs text-[var(--steel)]">{label}</p>
          <p className="tnum mt-0.5 font-mono text-2xl font-medium leading-tight" style={{ color }}>
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
