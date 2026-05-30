/**
 * Dashboard Page Template
 * 
 * Template untuk membuat halaman dashboard baru dengan Slate & Indigo color palette.
 * Copy file ini dan sesuaikan sesuai kebutuhan.
 * 
 * Color Palette (Slate & Indigo - Clean Professional):
 * - Background: #ffffff (white)
 * - Surface: #f8fafc (slate-50)  
 * - Primary: #4f46e5 (indigo-600)
 * - Text Primary: #0f172a (slate-900)
 * - Text Secondary: #64748b (slate-500)
 * - Border: #e2e8f0 (slate-200)
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface DashboardTemplateProps {
  title: string;
  description: string;
  icon: LucideIcon;
  children?: React.ReactNode;
}

/**
 * Template untuk halaman dashboard
 * 
 * Usage:
 * export function MyNewPage() {
 *   return (
 *     <DashboardTemplate 
 *       title="Page Title" 
 *       description="Page description"
 *       icon={SomeIcon}
 *     >
 *       <-- Your content here -->
 *     </DashboardTemplate>
 *   );
 * }
 */
export function DashboardTemplate({ 
  title, 
  description, 
  icon: Icon,
  children 
}: DashboardTemplateProps) {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 
            className="text-2xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            {title}
          </h1>
          <p 
            className="mt-1"
            style={{ color: 'var(--text-secondary)' }}
          >
            {description}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            style={{ 
              backgroundColor: 'var(--primary)',
              color: 'var(--primary-foreground)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--primary-dark)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--primary)';
            }}
          >
            <Icon className="w-4 h-4 mr-2" />
            Primary Action
          </Button>
          <Button 
            variant="outline"
            style={{ 
              borderColor: 'var(--border)',
              color: 'var(--text-secondary)'
            }}
          >
            Secondary Action
          </Button>
        </div>
      </div>

      {/* Stats Cards Example */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((item) => (
          <Card 
            key={item}
            style={{ 
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border)'
            }}
          >
            <CardHeader>
              <CardTitle 
                className="text-sm font-medium"
                style={{ color: 'var(--text-muted)' }}
              >
                Stat Title {item}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="text-2xl font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                1,234
              </div>
              <p 
                className="text-xs mt-1"
                style={{ color: 'var(--success)' }}
              >
                +12% from last week
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card 
          style={{ 
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border)'
          }}
        >
          <CardHeader>
            <CardTitle style={{ color: 'var(--text-primary)' }}>
              Chart or Table Title
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="h-64 flex items-center justify-center"
              style={{ color: 'var(--text-muted)' }}
            >
              <p>Your chart or table content here</p>
            </div>
          </CardContent>
        </Card>

        <Card 
          style={{ 
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border)'
          }}
        >
          <CardHeader>
            <CardTitle style={{ color: 'var(--text-primary)' }}>
              Secondary Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="h-64 flex items-center justify-center"
              style={{ color: 'var(--text-muted)' }}
            >
              <p>Secondary content here</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Custom Children Content */}
      {children}
    </div>
  );
}

/**
 * Template untuk Stat Card
 * Bisa digunakan untuk membuat statistics card dengan cepat
 */
interface StatCardTemplateProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'increase' | 'decrease';
  icon?: LucideIcon;
}

export function StatCardTemplate({ 
  title, 
  value, 
  change, 
  changeType = 'increase',
  icon: Icon
}: StatCardTemplateProps) {
  return (
    <Card 
      style={{ 
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border)'
      }}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          {Icon && <Icon className="w-5 h-5" style={{ color: 'var(--primary)' }} />}
          <p 
            className="text-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            {title}
          </p>
        </div>
        <p 
          className="text-xl font-bold"
          style={{ color: 'var(--text-primary)' }}
        >
          {value}
        </p>
        {change && (
          <p 
            className="text-xs mt-1"
            style={{ 
              color: changeType === 'increase' ? 'var(--success)' : 'var(--danger)'
            }}
          >
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Template untuk Table
 * Basic table structure dengan theme-aware styling
 */
interface TableTemplateProps {
  headers: string[];
  children: React.ReactNode;
}

export function TableTemplate({ headers, children }: TableTemplateProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            {headers.map((header, i) => (
              <th 
                key={i}
                className="text-left py-3 px-4 font-medium"
                style={{ color: 'var(--text-muted)' }}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {children}
        </tbody>
      </table>
    </div>
  );
}
