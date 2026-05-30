/**
 * SentinelScan Status Chip Component
 * Visual indicator for scan status with icons and colors
 */

interface StatusChipProps {
  status: 'completed' | 'running' | 'failed' | 'queued' | 'cancelled' | 'pending' | 'initializing' | 'discovering' | 'scanning' | 'analyzing';
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig = {
  completed: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    color: 'var(--success)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    dotColor: 'var(--success)',
    icon: '✓',
    label: 'Completed',
  },
  running: {
    backgroundColor: 'rgba(79, 70, 229, 0.15)',
    color: 'var(--primary)',
    borderColor: 'rgba(79, 70, 229, 0.3)',
    dotColor: 'var(--primary)',
    icon: '⟳',
    label: 'Running',
  },
  failed: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    color: 'var(--danger)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    dotColor: 'var(--danger)',
    icon: '✗',
    label: 'Failed',
  },
  queued: {
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
    color: 'var(--text-muted)',
    borderColor: 'rgba(148, 163, 184, 0.3)',
    dotColor: 'var(--text-muted)',
    icon: '',
    label: 'Queued',
  },
  cancelled: {
    backgroundColor: 'rgba(100, 116, 139, 0.15)',
    color: 'var(--text-secondary)',
    borderColor: 'rgba(100, 116, 139, 0.3)',
    dotColor: 'var(--text-secondary)',
    icon: '',
    label: 'Cancelled',
  },
  pending: {
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
    color: 'var(--text-muted)',
    borderColor: 'rgba(148, 163, 184, 0.3)',
    dotColor: 'var(--text-muted)',
    icon: '',
    label: 'Pending',
  },
  initializing: {
    backgroundColor: 'rgba(79, 70, 229, 0.15)',
    color: 'var(--primary)',
    borderColor: 'rgba(79, 70, 229, 0.3)',
    dotColor: 'var(--primary)',
    icon: '⟳',
    label: 'Initializing',
  },
  discovering: {
    backgroundColor: 'rgba(79, 70, 229, 0.15)',
    color: 'var(--primary)',
    borderColor: 'rgba(79, 70, 229, 0.3)',
    dotColor: 'var(--primary)',
    icon: '⟳',
    label: 'Discovering',
  },
  scanning: {
    backgroundColor: 'rgba(79, 70, 229, 0.15)',
    color: 'var(--primary)',
    borderColor: 'rgba(79, 70, 229, 0.3)',
    dotColor: 'var(--primary)',
    icon: '⟳',
    label: 'Scanning',
  },
  analyzing: {
    backgroundColor: 'rgba(79, 70, 229, 0.15)',
    color: 'var(--primary)',
    borderColor: 'rgba(79, 70, 229, 0.3)',
    dotColor: 'var(--primary)',
    icon: '⟳',
    label: 'Analyzing',
  },
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

export function StatusChip({ status, showIcon = true, size = 'md' }: StatusChipProps) {
  const config = statusConfig[status];

  return (
    <span
      style={{
        backgroundColor: config.backgroundColor,
        color: config.color,
        borderColor: config.borderColor,
      }}
      className={`
        inline-flex items-center gap-1.5 rounded-full border font-medium
        ${sizeClasses[size]}
        ${status === 'running' ? 'animate-pulse' : ''}
      `}
    >
      {/* Dot Indicator */}
      <span style={{ backgroundColor: config.dotColor }} className="w-1.5 h-1.5 rounded-full" />
      
      {/* Icon (optional) */}
      {showIcon && (
        <span className={`text-xs ${status === 'running' ? 'animate-spin' : ''}`}>
          {config.icon}
        </span>
      )}
      
      {/* Label */}
      <span>{config.label}</span>
    </span>
  );
}
