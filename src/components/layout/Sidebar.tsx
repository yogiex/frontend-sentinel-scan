/**
 * SentinelScan Sidebar Component
 * Path: src/components/layout/Sidebar.tsx
 *
 * Collapsible sidebar navigation with menu items and expandable subtrees.
 * Uses Redux to manage open/collapsed state.
 * Updated to use CSS variables for consistent theming.
 */
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { toggleSidebar, selectSidebarOpen } from '@/store/slices/uiSlice';
import {
  LayoutDashboard, 
  Search, 
  Plus, 
  FileText, 
  Users, 
  Settings, 
  ChevronRight, 
  ChevronDown,
  User,
  Mail,
  Trash2,
  Ticket,
  List,
  Kanban,
} from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  {
    path: '/dashboard/scans',
    label: 'Scans',
    icon: Search,
    children: [
      { path: '/dashboard/scans/new', label: 'New Scan', icon: Plus },
      { path: '/dashboard/scans/all', label: 'All Scans', icon: FileText },
      { path: '/dashboard/scans/my-scans', label: 'My Scans', icon: User },
      { path: '/dashboard/scans/trash', label: 'Trash', icon: Trash2 },
    ],
  },
  { path: '/dashboard/templates', label: 'Templates', icon: FileText },
  { path: '/dashboard/users', label: 'Users', icon: Users },
  {
    path: '/dashboard/tickets',
    label: 'Tickets',
    icon: Ticket,
    children: [
      { path: '/dashboard/tickets', label: 'All Tickets', icon: List },
      { path: '/dashboard/tickets/kanban', label: 'Kanban Board', icon: Kanban },
    ],
  },
  { path: '/dashboard/logs', label: 'Audit Trails', icon: FileText },
  { path: '/dashboard/settings', label: 'Settings', icon: Settings },
];

function getStoredUser() {
  try {
    const stored = localStorage.getItem('sentinelscan_user');
    if (stored) return JSON.parse(stored);
  } catch {}
  return null;
}

export function Sidebar() {
  const dispatch = useDispatch();
  const sidebarOpen = useSelector(selectSidebarOpen);
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>(['/dashboard/scans', '/dashboard/tickets']);
  const [user, setUser] = useState<{ id: string; username: string; email: string; role: string } | null>(getStoredUser);

  useEffect(() => {
    const handler = () => setUser(getStoredUser());
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const toggleExpand = (path: string) => {
    setExpandedItems(prev =>
      prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
    );
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <aside
      className={cn(
        'h-screen flex flex-col relative transition-all duration-500 ease-in-out',
        sidebarOpen ? 'w-72' : 'w-20'
      )}
      style={{ backgroundColor: 'var(--bg-secondary)', borderRightColor: 'var(--border)', borderRightWidth: '1px' }}
    >
       {/* Subtle background pattern */}
       <div 
         className="absolute inset-0 pointer-events-none" 
         style={{ 
           background: 'radial-gradient(ellipse at center, transparent 0%, rgba(79, 70, 229, 0.03) 100%)' 
         }} 
       />
      
      {/* Logo/Brand */}
      <div 
        className={cn(
          "relative z-10 border-b flex items-center justify-between",
          sidebarOpen ? "p-6" : "p-4"
        )}
        style={{ borderBottomColor: 'var(--border)' }}
      >
        {sidebarOpen ? (
          <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                style={{ 
                  background: 'linear-gradient(to bottom right, var(--primary), rgba(79, 70, 229, 0.8))',
                  color: 'var(--primary-foreground)',
                  boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.2)'
                }}
              >
              <span className="font-bold text-lg">S</span>
            </div>
            <h1 
              className="text-xl font-bold bg-clip-text"
              style={{ 
                backgroundImage: 'linear-gradient(to right, var(--primary), rgba(79, 70, 229, 0.7))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              SentinelScan
            </h1>
          </div>
        ) : (
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg mx-auto"
              style={{ 
                background: 'linear-gradient(to bottom right, var(--primary), rgba(79, 70, 229, 0.8))',
                color: 'var(--primary-foreground)',
                boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.2)'
              }}
            >
            <span className="font-bold text-lg">S</span>
          </div>
        )}
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="transition-all duration-200 hover:scale-110 rounded-lg p-2 backdrop-blur-sm"
          style={{ 
            color: 'var(--text-muted)',
            backgroundColor: 'transparent'
          }}
           onMouseEnter={(e) => { 
             e.currentTarget.style.backgroundColor = 'rgba(79, 70, 229, 0.05)';
             e.currentTarget.style.color = 'var(--text-primary)';
           }}
           onMouseLeave={(e) => { 
             e.currentTarget.style.backgroundColor = 'transparent';
             e.currentTarget.style.color = 'var(--text-muted)';
           }}
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {sidebarOpen ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2 relative z-10">
        {navItems.map((item) => {
          const isExpanded = expandedItems.includes(item.path);
          const hasChildren = item.children && item.children.length > 0;
          const active = isActive(item.path);

          return (
            <div key={item.path} className="space-y-1">
              {/* Main Nav Item */}
              {hasChildren ? (
                <div
                  className={cn(
                    'flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 cursor-pointer group',
                    !sidebarOpen && 'justify-center px-2'
                  )}
                  style={{ 
                    backgroundColor: active ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                    borderColor: active ? 'rgba(79, 70, 229, 0.2)' : 'transparent',
                    borderWidth: active ? '1px' : '0'
                  }}
                  onMouseEnter={(e) => { 
                    if (!active) {
                      e.currentTarget.style.backgroundColor = 'rgba(79, 70, 229, 0.05)';
                    }
                  }}
                  onMouseLeave={(e) => { 
                    if (!active) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                  onClick={() => {
                    if (sidebarOpen) {
                      toggleExpand(item.path);
                    }
                  }}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <div 
                    className="p-2 rounded-lg transition-all duration-200"
                    style={{ 
                      backgroundColor: active ? 'var(--primary)' : 'rgba(79, 70, 229, 0.05)',
                      color: active ? 'var(--primary-foreground)' : 'var(--text-muted)'
                    }}
                  >
                    <item.icon className="w-5 h-5" />
                  </div>
                  {sidebarOpen && (
                    <>
                      <span 
                        className="text-sm font-medium flex-1 truncate"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {item.label}
                      </span>
                      <span
                        className="transition-transform duration-200 flex-shrink-0"
                        style={{ 
                          color: 'var(--text-muted)',
                          transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'
                        }}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </>
                  )}
                </div>
              ) : (
                <NavLink
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group',
                    !sidebarOpen && 'justify-center px-2'
                  )}
                  style={{ 
                    backgroundColor: active ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                    borderColor: active ? 'rgba(79, 70, 229, 0.2)' : 'transparent',
                    borderWidth: active ? '1px' : '0'
                  }}
                  onMouseEnter={(e) => { 
                    if (!active) {
                      e.currentTarget.style.backgroundColor = 'rgba(79, 70, 229, 0.05)';
                    }
                  }}
                  onMouseLeave={(e) => { 
                    if (!active) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <div 
                    className="p-2 rounded-lg transition-all duration-200"
                    style={{ 
                      backgroundColor: active ? 'var(--primary)' : 'rgba(79, 70, 229, 0.05)',
                      color: active ? 'var(--primary-foreground)' : 'var(--text-muted)'
                    }}
                  >
                    <item.icon className="w-5 h-5" />
                  </div>
                  {sidebarOpen && (
                    <span 
                      className="text-sm font-medium flex-1 truncate"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {item.label}
                    </span>
                  )}
                </NavLink>
              )}

              {/* Subtree/Children */}
              {sidebarOpen && hasChildren && isExpanded && (
                  <div 
                   className="ml-4 mt-2 space-y-1 pl-4"
                   style={{ 
                     borderLeftColor: 'rgba(79, 70, 229, 0.2)',
                     borderLeftWidth: '1px'
                   }}
                 >
                  {item.children!.map((child) => {
                    const childActive = location.pathname === child.path;
                    return (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group"
                        style={{ 
                          backgroundColor: childActive ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                          borderColor: childActive ? 'rgba(79, 70, 229, 0.2)' : 'transparent',
                          borderWidth: childActive ? '1px' : '0'
                        }}
                        onMouseEnter={(e) => { 
                          if (!childActive) {
                            e.currentTarget.style.backgroundColor = 'rgba(79, 70, 229, 0.05)';
                          }
                        }}
                        onMouseLeave={(e) => { 
                          if (!childActive) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        <div 
                          className="p-1.5 rounded-md transition-all duration-200"
                          style={{ 
                            backgroundColor: childActive ? 'var(--primary)' : 'rgba(79, 70, 229, 0.05)',
                            color: childActive ? 'var(--primary-foreground)' : 'var(--text-muted)'
                          }}
                        >
                          <child.icon className="w-4 h-4" />
                        </div>
                        <span 
                        className="group-hover:text-slate-200"
                        style={{ color: childActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                        onMouseEnter={(e) => { 
                          if (!childActive) {
                            e.currentTarget.style.color = 'var(--text-primary)';
                          }
                        }}
                        onMouseLeave={(e) => { 
                          if (!childActive) {
                            e.currentTarget.style.color = 'var(--text-secondary)';
                          }
                        }}
                        >
                          {child.label}
                        </span>
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Section */}
      <div 
        className="relative z-10 border-t p-6"
        style={{ borderTopColor: 'var(--border)' }}
      >
        {sidebarOpen ? (
          <div 
            className="flex items-center gap-3 p-3 rounded-xl backdrop-blur-sm border transition-all duration-200"
            style={{ 
              backgroundColor: 'rgba(79, 70, 229, 0.03)',
              borderColor: 'var(--border)'
            }}
            onMouseEnter={(e) => { 
              e.currentTarget.style.backgroundColor = 'rgba(79, 70, 229, 0.05)';
            }}
            onMouseLeave={(e) => { 
              e.currentTarget.style.backgroundColor = 'rgba(79, 70, 229, 0.03)';
            }}
          >
            <div className="relative">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                style={{ 
                  background: 'linear-gradient(to bottom right, var(--primary), rgba(79, 70, 229, 0.8))',
                  color: 'var(--primary-foreground)',
                  boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.2)'
                }}
              >
                <span className="font-bold text-lg">{(user?.username || 'A')[0].toUpperCase()}</span>
              </div>
              <div 
                className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2"
                style={{ 
                  backgroundColor: 'var(--success)',
                  borderColor: 'var(--bg-card)'
                }}
              ></div>
            </div>
            <div className="flex-1 min-w-0">
              <p 
                className="text-sm font-semibold truncate"
                style={{ color: 'var(--text-primary)' }}
              >
                {user?.username || 'Guest'}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <Mail className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                <p 
                  className="text-xs truncate"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {user?.email || 'guest@sentinelscan.com'}
                </p>
              </div>
            </div>
          </div>
        ) : (
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg mx-auto relative"
              style={{ 
                background: 'linear-gradient(to bottom right, var(--primary), rgba(79, 70, 229, 0.8))',
                color: 'var(--primary-foreground)',
                boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.2)'
              }}
            >
            <span className="font-bold text-lg">{(user?.username || 'A')[0].toUpperCase()}</span>
            <div 
              className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2"
              style={{ 
                backgroundColor: 'var(--success)',
                borderColor: 'var(--bg-card)'
              }}
            ></div>
          </div>
        )}
      </div>
    </aside>
  );
}
