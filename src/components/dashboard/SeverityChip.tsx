/**
 * SentinelScan Severity Chip Component
 * Visual indicator for vulnerability severity levels with icons and colors
 */

interface SeverityChipProps {
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const severityConfig = {
  critical: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    color: 'var(--danger)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    dotColor: 'var(--danger)',
    icon: '⚠️',
    label: 'Critical',
  },
  high: {
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
    color: '#fb923c',
    borderColor: 'rgba(249, 115, 22, 0.3)',
    dotColor: '#fb923c',
    icon: '🔴',
    label: 'High',
  },
  medium: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    color: 'var(--warning)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    dotColor: 'var(--warning)',
    icon: '🟡',
    label: 'Medium',
  },
  low: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    color: 'var(--success)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    dotColor: 'var(--success)',
    icon: '🟢',
    label: 'Low',
  },
  info: {
    backgroundColor: 'rgba(79, 70, 229, 0.15)',
    color: 'var(--primary)',
    borderColor: 'rgba(79, 70, 229, 0.3)',
    dotColor: 'var(--primary)',
    icon: 'ℹ️',
    label: 'Info',
  },
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

export function SeverityChip({ severity, showIcon = true, size = 'md' }: SeverityChipProps) {
  const config = severityConfig[severity];

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
        ${severity === 'critical' ? 'animate-pulse' : ''}
      `}
    >
      {/* Dot Indicator */}
      <span style={{ backgroundColor: config.dotColor }} className="w-1.5 h-1.5 rounded-full" />
      
      {/* Icon (optional) */}
      {showIcon && <span className="text-xs">{config.icon}</span>}
      
      {/* Label */}
      <span>{config.label}</span>
    </span>
  );
}
