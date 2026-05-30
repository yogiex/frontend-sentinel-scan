/**
 * ConfirmDialog - Reusable confirmation modal
 * Uses shadcn Dialog with Slate & Indigo theme
 */
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2, ShieldQuestion } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive' | 'warning';
  onConfirm: () => void;
  loading?: boolean;
}

const variantConfig = {
  default: {
    icon: ShieldQuestion,
    confirmClass: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    iconColor: 'text-indigo-600',
  },
  destructive: {
    icon: Trash2,
    confirmClass: 'bg-red-500 hover:bg-red-600 text-white',
    iconColor: 'text-red-500',
  },
  warning: {
    icon: AlertTriangle,
    confirmClass: 'bg-amber-500 hover:bg-amber-600 text-white',
    iconColor: 'text-amber-500',
  },
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm,
  loading = false,
}: ConfirmDialogProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" style={{ 
        backgroundColor: 'var(--bg-card)', 
        borderColor: 'var(--border)',
        borderRadius: '8px',
      }}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md" style={{ backgroundColor: `${config.iconColor}15` }}>
              <Icon className={`w-5 h-5 ${config.iconColor}`} />
            </div>
            <div>
              <DialogTitle style={{ color: 'var(--text-primary)' }}>{title}</DialogTitle>
              <DialogDescription className="mt-1" style={{ color: 'var(--text-secondary)' }}>
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="mt-4 gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            style={{ 
              borderColor: 'var(--border)', 
              color: 'var(--text-secondary)',
              borderRadius: '6px',
            }}
          >
            {cancelLabel}
          </Button>
          <Button
            className={config.confirmClass}
            onClick={onConfirm}
            disabled={loading}
            style={{ borderRadius: '6px' }}
          >
            {loading ? 'Processing...' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
