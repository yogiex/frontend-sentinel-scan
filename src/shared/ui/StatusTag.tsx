import type { LucideIcon } from 'lucide-react';
import {
  Ban,
  CheckCircle2,
  Circle,
  CircleDashed,
  Loader2,
  MinusCircle,
  Pause,
  ShieldX,
  TriangleAlert,
  Wrench,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type ScanStatus =
  | 'pending'
  | 'running'
  | 'paused'
  | 'completed'
  | 'partial_failure'
  | 'failed'
  | 'cancelled'
  | 'aborted'
  | 'unknown';

export type TicketStatus =
  | 'open'
  | 'in_progress'
  | 'fixed'
  | 'verified'
  | 'wont_fix';

interface StatusMeta {
  label: string;
  icon: LucideIcon;
  color: string;
  spin?: boolean;
}

const SCAN: Record<ScanStatus, StatusMeta> = {
  pending: { label: 'Pending', icon: CircleDashed, color: 'var(--steel)' },
  running: { label: 'Running', icon: Loader2, color: 'var(--signal)', spin: true },
  paused: { label: 'Paused', icon: Pause, color: 'var(--risk-medium)' },
  completed: { label: 'Completed', icon: CheckCircle2, color: 'var(--ok)' },
  partial_failure: { label: 'Partial failure', icon: TriangleAlert, color: 'var(--risk-medium)' },
  failed: { label: 'Failed', icon: Ban, color: 'var(--risk-high)' },
  cancelled: { label: 'Cancelled', icon: Ban, color: 'var(--steel)' },
  aborted: { label: 'Aborted', icon: ShieldX, color: 'var(--risk-high)' },
  unknown: { label: 'Unknown', icon: Circle, color: 'var(--steel)' },
};

const TICKET: Record<TicketStatus, StatusMeta> = {
  open: { label: 'Open', icon: Circle, color: 'var(--risk-high)' },
  in_progress: { label: 'In progress', icon: Loader2, color: 'var(--signal)', spin: true },
  fixed: { label: 'Fixed', icon: Wrench, color: 'var(--ok)' },
  verified: { label: 'Verified', icon: CheckCircle2, color: 'var(--ok)' },
  wont_fix: { label: 'Won’t fix', icon: MinusCircle, color: 'var(--steel)' },
};

export interface StatusTagProps {
  status: string | null | undefined;
  kind?: 'scan' | 'ticket';
  className?: string;
}

export function StatusTag({ status, kind = 'scan', className }: StatusTagProps) {
  const key = (status ?? 'unknown') as string;
  const table = kind === 'scan' ? SCAN : TICKET;
  const meta = (table as Record<string, StatusMeta>)[key] ?? {
    label: key.replace(/_/g, ' '),
    icon: Circle,
    color: 'var(--steel)',
  };
  const Icon = meta.icon;

  return (
    <span
      className={cn('inline-flex items-center gap-1.5 text-sm', className)}
      style={{ color: meta.color }}
    >
      <Icon
        className={cn('size-3.5 shrink-0', meta.spin && 'animate-spin [animation-duration:2.4s]')}
        aria-hidden="true"
      />
      <span className="text-[var(--ink)]">{meta.label}</span>
    </span>
  );
}
