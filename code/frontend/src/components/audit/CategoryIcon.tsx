import type { AuditCategory } from '@/lib/logger';
import {
  LogIn,
  Search,
  Download,
  Users,
  Settings,
  Compass,
  Monitor,
  Shield,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryIconProps {
  category: AuditCategory;
  size?: number;
  className?: string;
}

const categoryIconMap: Record<AuditCategory, typeof LogIn> = {
  auth: LogIn,
  scan: Search,
  export: Download,
  user_management: Users,
  settings: Settings,
  navigation: Compass,
  system: Monitor,
  security: Shield,
  performance: BarChart3,
};

const categoryLabelMap: Record<AuditCategory, string> = {
  auth: 'Authentication',
  scan: 'Scan',
  export: 'Export',
  user_management: 'User Management',
  settings: 'Settings',
  navigation: 'Navigation',
  system: 'System',
  security: 'Security',
  performance: 'Performance',
};

export function CategoryIcon({ category, size = 14, className }: CategoryIconProps) {
  const Icon = categoryIconMap[category];

  return (
    <Icon
      size={size}
      className={cn('shrink-0', className)}
      aria-label={categoryLabelMap[category]}
    />
  );
}
