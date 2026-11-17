import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Bell, LogOut, Menu, Search, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { titleForPath } from '@/app/nav';
import { logout, selectUser } from '@/store/slices/authSlice';
import {
  clearNotifications,
  markNotificationRead,
  selectNotifications,
} from '@/store/slices/uiSlice';
import { cn } from '@/lib/utils';
import type { AppDispatch } from '@/store';

export interface HeaderProps {
  onOpenMenu: () => void;
}

export function Header({ onOpenMenu }: HeaderProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectUser);
  const notifications = useSelector(selectNotifications);
  const unread = notifications.filter((n) => !n.read).length;
  const title = titleForPath(pathname);

  function handleLogout() {
    dispatch(logout());
    navigate('/login', { replace: true });
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-[var(--rule)] bg-[var(--paper)] px-3 sm:px-5">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onOpenMenu}
        aria-label="Open navigation"
      >
        <Menu className="size-5" aria-hidden="true" />
      </Button>

      <span className="truncate text-sm font-medium text-[var(--ink)]">{title}</span>

      <div className="ml-auto flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Search"
          onClick={() => navigate('/dashboard/scans')}
        >
          <Search className="size-4" aria-hidden="true" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
            >
              <Bell className="size-4" aria-hidden="true" />
              {unread > 0 && (
                <span
                  className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-[var(--risk-high)]"
                  aria-hidden="true"
                />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="flex items-center justify-between px-2 py-1.5">
              <DropdownMenuLabel className="p-0 text-xs text-[var(--steel)]">
                Notifications
              </DropdownMenuLabel>
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={() => dispatch(clearNotifications())}
                  className="text-xs text-[var(--signal)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--signal)]"
                >
                  Clear all
                </button>
              )}
            </div>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <p className="px-3 py-4 text-xs text-[var(--steel)]">No notifications.</p>
            ) : (
              notifications.slice(0, 6).map((n) => (
                <DropdownMenuItem
                  key={n.id}
                  onSelect={() => dispatch(markNotificationRead(n.id))}
                  className={cn('flex flex-col items-start gap-0.5', n.read && 'opacity-60')}
                >
                  <span className="text-sm text-[var(--ink)]">{n.message}</span>
                  <span className="text-[11px] text-[var(--steel)]">{n.type}</span>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="ml-1 flex items-center gap-2 rounded-sm px-1.5 py-1 hover:bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--signal)]"
              aria-label="Account menu"
            >
              <span className="flex size-7 items-center justify-center rounded-sm border border-[var(--rule)] text-xs font-medium text-[var(--ink)]">
                {(user?.username ?? 'A').slice(0, 1).toUpperCase()}
              </span>
              <span className="hidden text-left sm:block">
                <span className="block max-w-[14ch] truncate text-xs font-medium text-[var(--ink)]">
                  {user?.username ?? 'Admin'}
                </span>
                <span className="block max-w-[18ch] truncate text-[11px] text-[var(--steel)]">
                  {user?.role ?? 'admin'}
                </span>
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="text-xs font-normal text-[var(--steel)]">
              Signed in as {user?.email ?? 'admin@sentinelscan.com'}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => navigate('/dashboard/settings')}>
              <UserRound className="size-4" aria-hidden="true" />
              Profile and settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleLogout}>
              <LogOut className="size-4" aria-hidden="true" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
