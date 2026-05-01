/**
 * SentinelScan Header Component
 * Path: src/components/layout/Header.tsx
 *
 * Top navigation bar with user menu, notifications, and theme toggle.
 * Displays current page title based on route.
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
import type { RootState } from '@/store';

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

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 sticky top-0 z-40">
      {/* Left: Menu toggle + Page title */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => dispatch(toggleSidebar())}
          className="text-slate-400 hover:text-white"
        >
          <span className="text-lg">{sidebarOpen ? '◀' : '▶'}</span>
        </Button>
        <h2 className="text-lg font-semibold text-white">{pageTitle}</h2>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative" ref={notifMenuRef}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setNotifMenuOpen(!notifMenuOpen)}
            className="text-slate-400 hover:text-white relative"
          >
            <span className="text-lg">🔔</span>
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500">
                {unreadCount}
              </Badge>
            )}
          </Button>

          {/* Notifications Dropdown */}
          {notifMenuOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-md shadow-lg z-50">
              <div className="p-3 border-b border-slate-700 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Notifications</h3>
                <button
                  onClick={() => dispatch(clearNotifications())}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Clear all
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="p-4 text-sm text-slate-400 text-center">No notifications</p>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={cn(
                        'p-3 border-b border-slate-700 hover:bg-slate-700 cursor-pointer',
                        !notif.read && 'bg-slate-700/50'
                      )}
                      onClick={() => dispatch(markNotificationRead(notif.id))}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-lg">
                          {notif.type === 'error' ? '❌' : notif.type === 'warning' ? '⚠️' : notif.type === 'success' ? '✅' : 'ℹ️'}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm text-white">{notif.message}</p>
                          <p className="text-xs text-slate-400 mt-1">
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
            className="flex items-center gap-2 text-slate-300 hover:text-white"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
              A
            </div>
            <span className="text-sm">Admin</span>
          </Button>

          {/* User Dropdown */}
          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-md shadow-lg z-50 py-1">
              <a href="#" className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700">
                Profile
              </a>
              <a href="#" className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700">
                Settings
              </a>
              <div className="border-t border-slate-700 my-1" />
              <a href="#" className="block px-4 py-2 text-sm text-red-400 hover:bg-slate-700">
                Logout
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}