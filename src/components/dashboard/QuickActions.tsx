/**
 * SentinelScan Quick Actions Component
 * Buttons for common scanner actions
 */

import { Card, CardContent } from '@/components/ui/card';

interface QuickActionsProps {
  onNewScan?: () => void;
  onQuickScan?: () => void;
  onImportAssets?: () => void;
  onScheduleScan?: () => void;
}

export function QuickActions({
  onNewScan,
  onQuickScan,
  onImportAssets,
  onScheduleScan,
}: QuickActionsProps) {
  const actions = [
    {
      label: 'New Scan',
      icon: '🔍',
      description: 'Start a full vulnerability scan',
      onClick: onNewScan,
      variant: 'default' as const,
    },
    {
      label: 'Quick Scan',
      icon: '',
      description: 'Fast scan of critical assets',
      onClick: onQuickScan,
      variant: 'secondary' as const,
    },
    {
      label: 'Import Assets',
      icon: '📥',
      description: 'Upload asset list (CSV/JSON)',
      onClick: onImportAssets,
      variant: 'outline' as const,
    },
    {
      label: 'Schedule Scan',
      icon: '📅',
      description: 'Set up automated scanning',
      onClick: onScheduleScan,
      variant: 'outline' as const,
    },
  ];

   return (
     <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
       {actions.map((action) => (
         <Card
           key={action.label}
           className="transition-colors cursor-pointer"
           style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
           onClick={action.onClick}
           onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)' }}
           onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
         >
           <CardContent className="p-4 flex flex-col items-center text-center gap-2">
             <span className="text-2xl">{action.icon}</span>
             <div>
               <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{action.label}</p>
               <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{action.description}</p>
             </div>
           </CardContent>
         </Card>
       ))}
     </div>
   );
}
