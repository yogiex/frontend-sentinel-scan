import { type ReactNode } from 'react';
import { Button } from './button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isDestructive = false
}: ConfirmDialogProps): ReactNode {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div 
        className="rounded-lg p-6 max-w-md w-full"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-3 mb-4">
          {isDestructive && <AlertTriangle size={20} style={{ color: 'var(--danger)' }} />}
          <h3 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>{title}</h3>
        </div>
        <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>{description}</p>
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            style={{ 
              backgroundColor: isDestructive ? 'var(--danger)' : 'var(--primary)',
              color: 'white'
            }}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
