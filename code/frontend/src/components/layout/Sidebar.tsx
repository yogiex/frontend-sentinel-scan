/**
 * SentinelScan Sidebar Component
 * Path: src/components/layout/Sidebar.tsx
 *
 * Collapsible sidebar navigation with menu items.
 * Uses Redux to manage open/collapsed state.
 */
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { toggleSidebar, selectSidebarOpen } from '@/store/slices/uiSlice';
import type { RootState } from '@/store';

interface NavItem {
  path: string;
  label: string;
  icon: string; // Using emoji icons for simplicity, lucide-react can replace later
}

const navItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/dashboard/scans', label: 'Scans', icon: '🔍' },
  { path: '/dashboard/templates', label: 'Templates', icon: '📋' },
  { path: '/dashboard/reports', label: 'Reports', icon: '📄' },
  { path: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
];

export function Sidebar() {
  const dispatch = useDispatch();
  const sidebarOpen = useSelector(selectSidebarOpen);
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpand = (path: string) => {
    setExpandedItems(prev =>
      prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
    );
  };

  return (
    <aside
      className={cn(
        'h-screen bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* Logo/Brand */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        {sidebarOpen ? (
          <h1 className="text-xl font-bold text-blue-400">SentinelScan</h1>
        ) : (
          <span className="text-xl font-bold text-blue-400 mx-auto">S</span>
        )}
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="text-slate-400 hover:text-white transition-colors"
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {sidebarOpen ? '◀' : '▶'}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
                'hover:bg-slate-800',
                isActive
                  ? 'bg-slate-800 text-blue-400'
                  : 'text-slate-300',
                !sidebarOpen && 'justify-center'
              )
            }
            title={!sidebarOpen ? item.label : undefined}
          >
            <span className="text-lg">{item.icon}</span>
            {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-slate-800">
        {sidebarOpen ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Admin</p>
              <p className="text-xs text-slate-400 truncate">admin@sentinelscan.com</p>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold mx-auto">
            A
          </div>
        )}
      </div>
    </aside>
  );
}