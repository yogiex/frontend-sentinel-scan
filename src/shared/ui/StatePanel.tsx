import type { ReactNode } from 'react';
import { AlertTriangle, Inbox, Loader2, ShieldOff, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type StatePanelVariant = 'loading' | 'empty' | 'error' | 'no-permission' | 'offline';

export interface StatePanelProps {
  variant: StatePanelVariant;
  title?: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };
  icon?: ReactNode;
  className?: string;
}

const DEFAULTS: Record<StatePanelVariant, { title: string; description: string; icon: ReactNode }> = {
  loading: {
    title: 'Loading',
    description: 'Fetching the latest data.',
    icon: <Loader2 className="size-5 animate-spin" aria-hidden="true" />,
  },
  empty: {
    title: 'Nothing here yet',
    description: 'Once there is data, it will show up on this page.',
    icon: <Inbox className="size-5" aria-hidden="true" />,
  },
  error: {
    title: 'Could not load this page',
    description: 'The request failed. Check your connection and try again.',
    icon: <AlertTriangle className="size-5" aria-hidden="true" />,
  },
  'no-permission': {
    title: 'You do not have access',
    description: 'Ask an administrator if you need access to this area.',
    icon: <ShieldOff className="size-5" aria-hidden="true" />,
  },
  offline: {
    title: 'Connection lost',
    description: 'Live updates are paused. Retrying automatically.',
    icon: <WifiOff className="size-5" aria-hidden="true" />,
  },
};

export function StatePanel({
  variant,
  title,
  description,
  action,
  secondaryAction,
  icon,
  className,
}: StatePanelProps) {
  const fallback = DEFAULTS[variant];
  const isError = variant === 'error';
  const isBusy = variant === 'loading';

  return (
    <div
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? 'assertive' : 'polite'}
      className={cn(
        'flex flex-col items-center justify-center rounded-md border border-[var(--rule)] bg-[var(--paper)] px-6 py-12 text-center',
        className,
      )}
    >
      <div
        className="mb-3 flex size-9 items-center justify-center rounded-md border border-[var(--rule)] bg-[var(--surface)]"
        style={{ color: isError ? 'var(--risk-high)' : 'var(--steel)' }}
        aria-hidden={isBusy ? undefined : true}
      >
        {icon ?? fallback.icon}
      </div>
      <h2 className="text-base font-semibold text-[var(--ink)]">{title ?? fallback.title}</h2>
      <p className="mt-1 max-w-[52ch] text-sm text-[var(--steel)]">{description ?? fallback.description}</p>
      {(action || secondaryAction) && (
        <div className="mt-4 flex items-center gap-2">
          {action && (
            <Button size="sm" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button size="sm" variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
