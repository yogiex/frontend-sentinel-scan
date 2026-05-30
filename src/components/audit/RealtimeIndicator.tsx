import { cn } from '@/lib/utils';

interface RealtimeIndicatorProps {
  active: boolean;
  onToggle: () => void;
}

export function RealtimeIndicator({ active, onToggle }: RealtimeIndicatorProps) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2 text-xs text-slate-500"
      aria-label={active ? 'Disable real-time updates' : 'Enable real-time updates'}
    >
      <span className={cn(
        'w-2 h-2 rounded-full',
        active ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)] animate-pulse' : 'bg-slate-400 shadow-none'
      )} />
      <span className={active ? 'text-emerald-600' : 'text-slate-500'}>{active ? 'Live' : 'Paused'}</span>
    </button>
  );
}
