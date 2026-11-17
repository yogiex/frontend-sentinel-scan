import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StatItem {
  label: string;
  value: string;
  /** e.g. "12%" or "+3 new" — rendered next to the arrow */
  delta?: string;
  direction?: 'up' | 'down' | 'flat';
  /** what the delta compares against, e.g. "vs last week" */
  period?: string;
  /** severity-tinted value, used only when the number *is* a risk */
  tone?: 'default' | 'critical' | 'high' | 'medium' | 'low' | 'ok';
  hint?: string;
}

export interface StatStripProps {
  items: StatItem[];
  loading?: boolean;
  error?: string;
  className?: string;
}

const TONE: Record<NonNullable<StatItem['tone']>, string> = {
  default: 'var(--ink)',
  critical: 'var(--risk-critical)',
  high: 'var(--risk-high)',
  medium: 'var(--risk-medium)',
  low: 'var(--risk-low)',
  ok: 'var(--ok)',
};

export function StatStrip({ items, loading = false, error, className }: StatStripProps) {
  return (
    <div
      className={cn(
        'grid overflow-hidden rounded-md border border-[var(--rule)] bg-[var(--paper)]',
        'divide-y divide-[var(--rule)] sm:divide-y-0 sm:divide-x',
        className,
      )}
      style={{ gridTemplateColumns: `repeat(${Math.min(items.length || 1, 6)}, minmax(0, 1fr))` }}
      role={loading ? 'status' : undefined}
      aria-busy={loading || undefined}
    >
      {items.map((item) => (
        <div key={item.label} className="px-4 py-3">
          <div className="text-xs text-[var(--steel)]">{item.label}</div>
          {loading ? (
            <div className="mt-2 h-6 w-16 animate-pulse rounded-sm bg-[var(--rule)]/60" aria-hidden="true" />
          ) : (
            <div
              className="tnum mt-0.5 font-mono text-2xl font-medium leading-tight"
              style={{ color: TONE[item.tone ?? 'default'] }}
            >
              {error ? '—' : item.value}
            </div>
          )}
          <div className="mt-1 flex min-h-4 items-center gap-1 text-xs text-[var(--steel)]">
            {item.delta && (
              <>
                {item.direction === 'up' && <ArrowUp className="size-3 text-[var(--ok)]" aria-hidden="true" />}
                {item.direction === 'down' && <ArrowDown className="size-3 text-[var(--risk-high)]" aria-hidden="true" />}
                {item.direction === 'flat' && <Minus className="size-3" aria-hidden="true" />}
                <span>
                  {item.direction === 'up' ? 'up' : item.direction === 'down' ? 'down' : 'flat'} {item.delta}
                </span>
              </>
            )}
            {item.period && <span className="text-[var(--steel)]/80">{item.period}</span>}
            {!item.delta && !item.period && item.hint && <span>{item.hint}</span>}
          </div>
        </div>
      ))}
      {error && (
        <div className="col-span-full border-t border-[var(--rule)] px-4 py-2 text-xs text-[var(--risk-high)]">
          {error}
        </div>
      )}
    </div>
  );
}
