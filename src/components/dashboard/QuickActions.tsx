import { Card, CardContent } from '@/components/ui/card';
import { Search, Zap, Upload, Calendar } from 'lucide-react';

interface QuickActionsProps {
  onNewScan?: () => void;
  onQuickScan?: () => void;
  onImportAssets?: () => void;
  onScheduleScan?: () => void;
}

const actionIcons = [Search, Zap, Upload, Calendar];

export function QuickActions({
  onNewScan,
  onQuickScan,
  onImportAssets,
  onScheduleScan,
}: QuickActionsProps) {
  const actions = [
    { label: 'New Scan', description: 'Start a full vulnerability scan', onClick: onNewScan },
    { label: 'Quick Scan', description: 'Fast scan of critical assets', onClick: onQuickScan },
    { label: 'Import Assets', description: 'Upload asset list (CSV/JSON)', onClick: onImportAssets },
    { label: 'Schedule Scan', description: 'Set up automated scanning', onClick: onScheduleScan },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {actions.map((action, i) => {
        const Icon = actionIcons[i];
        return (
          <Card
            key={action.label}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={action.onClick}
          >
            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
              <Icon className="w-6 h-6" style={{ color: 'var(--primary)' }} />
              <div>
                <p className="text-sm font-semibold">{action.label}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{action.description}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
