/**
 * StatsCard Component - Shared component for dashboard statistics
 * 
 * Features:
 * - Consistent styling across all dashboard pages
 * - Icon on the left with label and value
 * - Monospace font for tabular numbers
 * - CSS variables for theming
 * - Hover effects
 */

import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatsCardProps {
  /** Lucide icon component */
  icon: LucideIcon;
  /** Label text (will be displayed in uppercase) */
  label: string;
  /** Numeric or string value to display */
  value: number | string;
  /** Color for icon and value (CSS variable or hex color) */
  color?: string;
  /** Optional: override border color */
  borderColor?: string;
}

export function StatsCard({
  icon: Icon,
  label,
  value,
  color = 'var(--primary)',
  borderColor,
}: StatsCardProps) {
  const borderStyle = borderColor || color;

  return (
    <Card
      className="transition-all duration-200 hover:shadow-md hover:border-opacity-60"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: borderStyle,
        borderRadius: 'var(--radius)',
      }}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 flex-shrink-0" style={{ color, opacity: 0.8 }} />
          <div className="min-w-0 flex-1">
            <p className="text-[0.65rem] font-mono uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              {label}
            </p>
            <p
              className="text-2xl font-bold mt-1 font-mono truncate"
              style={{ color, fontVariantNumeric: 'tabular-nums' }}
            >
              {value}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
