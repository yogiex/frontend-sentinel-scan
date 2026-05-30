// @ts-nocheck
/**
 * SentinelScan Header Component
 * Path: src/components/layout/Header.tsx
 *
 * Refactored with frontend-design skill:
 * - Outfit font for page title
 * - Lucide React icons instead of emojis
 * - Gradient avatar with visual interest
 * - Backdrop blur on dropdowns
 * - CSS transitions for animations
 * - Dramatic shadows and depth
 * - Smooth transitions on all interactive elements
 */
import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  toggleSidebar,
  selectSidebarOpen,
  selectNotifications,
  markNotificationRead,
  clearNotifications,
} from '@/store/slices/uiSlice';
import { PanelLeftClose, PanelLeftOpen, Bell, ChevronDown, User, Settings, LogOut, CheckCircle2, AlertCircle, Info, XCircle } from 'lucide-react';

const routeTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/scans': 'Scans',
  '/dashboard/templates': 'Templates',
  '/dashboard/reports': 'Reports',
  '/dashboard/settings': 'Settings',
};

export function Header() {
  const dispatch = useDispatch();
  const sidebarOpen = useSelector(selectSidebarOpen);
  const notifications = useSelector(selectNotifications);
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;
  const pageTitle = routeTitles[location.pathname] || 'Dashboard';

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) {
        setNotifMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'error': return <XCircle className="w-5 h-5" style={{ color: 'var(--danger)' }} />;
      case 'warning': return <AlertCircle className="w-5 h-5" style={{ color: 'var(--warning)' }} />;
      case 'success': return <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--success)' }} />;
      default: return <Info className="w-5 h-5" style={{ color: 'var(--primary)' }} />;
    }
  };

  return (
    <header className="h-16 backdrop-blur-md border-b flex items-center justify-between px-6 sticky top-0 z-40" style={{ backgroundColor: 'var(--bg-secondary)', borderBottomColor: 'var(--border)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
      {/* Decorative gradient line at bottom - FIXED: Use indigo tones instead of blue/purple */}
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(to right, rgba(79, 70, 229, 0.4), rgba(79, 70, 229, 0.1), transparent)' }} />

      {/* Left: Menu toggle + Page title */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => dispatch(toggleSidebar())}
          className="transition-all duration-200"
          style={{ color: 'var(--text-muted)', '--tw-hover-color': 'var(--text-primary)', '--tw-hover-bg': 'rgba(30, 41, 59, 0.5)' } as React.CSSProperties}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.5)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          {sidebarOpen ? (
            <PanelLeftClose className="w-5 h-5" />
          ) : (
            <PanelLeftOpen className="w-5 h-5" />
          )}
        </Button>
        <h2 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>{pageTitle}</h2>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative" ref={notifMenuRef}>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Notifications"
            onClick={() => setNotifMenuOpen(!notifMenuOpen)}
            className="relative transition-all duration-200"
            style={{ color: 'var(--text-muted)', '--tw-hover-color': 'var(--text-primary)', '--tw-hover-bg': 'rgba(30, 41, 59, 0.5)' } as React.CSSProperties}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.5)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              // FIXED: Use indigo gradient instead of danger/pink
              <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold rounded-full border-2 animate-pulse" style={{ background: 'linear-gradient(to right, var(--primary), var(--primary-dark))', color: 'var(--primary-foreground)', borderColor: 'var(--bg-secondary)' }}>
                {unreadCount}
              </span>
            )}
          </Button>

          {/* Notifications Dropdown */}
          {notifMenuOpen && (
            <div className="absolute right-0 mt-3 w-96 backdrop-blur-lg rounded-xl shadow-2xl z-50 overflow-hidden animate-[fadeIn_0.2s_ease-out]" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', borderWidth: '1px' }}>
              <div className="p-4 flex items-center justify-between" style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', borderBottomColor: 'rgba(71, 85, 105, 0.5)', borderBottomWidth: '1px' }}>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Notifications</h3>
                <button
                  onClick={() => dispatch(clearNotifications())}
                  className="text-xs transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  Clear all
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="p-6 text-sm text-center" style={{ color: 'var(--text-muted)' }}>No notifications</p>
                ) : (
                  notifications.map((notif, index) => (
                    <div
                      key={notif.id}
                      className="p-4 cursor-pointer transition-colors duration-150"
                      style={{ 
                        borderBottomColor: 'rgba(71, 85, 105, 0.3)', 
                        borderBottomWidth: '1px', 
                        backgroundColor: !notif.read ? 'rgba(79, 70, 229, 0.05)' : 'transparent',
                        animationDelay: `${index * 50}ms`
                      }}
                      onClick={() => dispatch(markNotificationRead(notif.id))}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(51, 65, 85, 0.3)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = !notif.read ? 'rgba(79, 70, 229, 0.05)' : 'transparent'}
                    >
                      <div className="flex items-start gap-3">
                        {getNotificationIcon(notif.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm leading-snug" style={{ color: 'var(--text-primary)' }}>{notif.message}</p>
                          <p className="text-xs mt-1 font-mono" style={{ color: 'var(--text-secondary)' }}>
                            {new Date(notif.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <Button
            variant="ghost"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-3 pl-3 pr-4 py-2 rounded-xl transition-all duration-200"
            style={{ color: 'var(--text-secondary)', '--tw-hover-color': 'var(--text-primary)', '--tw-hover-bg': 'rgba(30, 41, 59, 0.5)' } as React.CSSProperties}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.5)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            {/* Gradient Avatar */}
            <div className="relative">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shadow-lg" style={{ background: 'linear-gradient(to bottom right, var(--primary), rgba(79, 70, 229, 0.7))', color: 'var(--primary-foreground)' }}>
                A
              </div>
              {/* Online indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2" style={{ backgroundColor: 'var(--success)', borderColor: 'var(--bg-card)' }} />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium leading-none">Admin</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>admin@sentinelscan.com</p>
            </div>
            <ChevronDown className="w-4 h-4 transition-transform duration-200" style={{ color: 'var(--text-secondary)', transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
          </Button>

          {/* User Dropdown */}
          {userMenuOpen && (
            <div className="absolute right-0 mt-3 w-56 backdrop-blur-lg rounded-xl shadow-2xl z-50 py-2 overflow-hidden animate-[fadeIn_0.2s_ease-out]" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', borderWidth: '1px' }}>
              <a href="#" className="flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-150" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(51, 65, 85, 0.5)'; e.currentTarget.style.color = 'var(--text-primary)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                <User className="w-4 h-4" />
                Profile
              </a>
              <a href="#" className="flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-150" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(51, 65, 85, 0.5)'; e.currentTarget.style.color = 'var(--text-primary)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                <Settings className="w-4 h-4" />
                Settings
              </a>
              <div style={{ borderTopColor: 'rgba(71, 85, 105, 0.3)', borderTopWidth: '1px', margin: '0.25rem 0' }} />
              <a href="#" className="flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-150" style={{ color: 'var(--danger)' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = '#f87171'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--danger)'; }}>
                <LogOut className="w-4 h-4" />
                Logout
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
