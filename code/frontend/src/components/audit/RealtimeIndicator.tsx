import { cn } from '@/lib/utils';

interface RealtimeIndicatorProps {
  active: boolean;
  onToggle: () => void;
}

export function RealtimeIndicator({ active, onToggle }: RealtimeIndicatorProps) {
  return (
    <button
      onClick={onToggle}
      className="realtime-indicator"
      aria-label={active ? 'Disable real-time updates' : 'Enable real-time updates'}
    >
      <span className={cn('realtime-dot', !active && 'paused')} />
      <span>{active ? 'Live' : 'Paused'}</span>
    </button>
  );
}
