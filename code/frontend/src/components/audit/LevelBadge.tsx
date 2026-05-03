import type { LogLevel } from '@/lib/logger';
import { cn } from '@/lib/utils';

interface LevelBadgeProps {
  level: LogLevel;
  className?: string;
}

const levelConfig: Record<LogLevel, { bg: string; text: string; border: string; ledColor: string }> = {
  debug: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-500', border: 'border-slate-300 dark:border-slate-600', ledColor: 'bg-slate-400' },
  info: { bg: 'bg-green-50 dark:bg-green-950', text: 'text-green-600 dark:text-green-400', border: 'border-green-200 dark:border-green-800', ledColor: 'bg-green-500' },
  warn: { bg: 'bg-amber-50 dark:bg-amber-950', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800', ledColor: 'bg-amber-500' },
  error: { bg: 'bg-red-50 dark:bg-red-950', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-800', ledColor: 'bg-red-500' },
  critical: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-700 dark:text-red-300', border: 'border-red-300 dark:border-red-700', ledColor: 'bg-red-600' },
};

const pulseLevels: LogLevel[] = ['warn', 'error', 'critical'];

export function LevelBadge({ level, className }: LevelBadgeProps) {
  const config = levelConfig[level];
  const shouldPulse = pulseLevels.includes(level);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono font-medium border',
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full',
          config.ledColor,
          shouldPulse && 'animate-pulse'
        )}
        aria-hidden="true"
      />
      {level.toUpperCase()}
    </span>
  );
}
