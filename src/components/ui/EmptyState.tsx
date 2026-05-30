import { ReactNode } from 'react';
import { Button } from './button';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: ReactNode;
}

export function EmptyState({ 
  title, 
  description, 
  actionText, 
  onAction,
  icon 
}: EmptyStateProps) {
  return (
    <div className="text-center p-8 rounded-lg" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      {icon && <div className="mb-4 flex justify-center" style={{ color: 'var(--text-muted)' }}>{icon}</div>}
      <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>{title}</h3>
      <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>{description}</p>
      {actionText && onAction && (
        <Button 
          onClick={onAction}
          style={{ backgroundColor: 'var(--primary)' }}
          className="text-white"
        >
          {actionText}
        </Button>
      )}
    </div>
  );
}
