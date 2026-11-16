import { Link, NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ShieldCheck } from 'lucide-react';
import { NAV } from '@/app/nav';
import { cn } from '@/lib/utils';
import { selectUser } from '@/store/slices/authSlice';
import { PERMISSIONS, type Permission, type Role } from '@/types/permissions';

export interface SidebarProps {
  /** mobile drawer state */
  open: boolean;
  onClose: () => void;
  pathname: string;
}

function permissionsFor(role?: Role | null): Permission[] {
  if (!role) return [];
  return PERMISSIONS[role] ?? [];
}

export function Sidebar({ open, onClose, pathname }: SidebarProps) {
  const user = useSelector(selectUser);
  const perms = permissionsFor(user?.role as Role | undefined);
  const can = (p?: Permission) => !p || perms.includes('full_access') || perms.includes(p);

  const areas = NAV.filter((a) => can(a.permission));
  const active =
    areas.find((a) => (a.end ? pathname === a.to : pathname === a.to || pathname.startsWith(`${a.to}/`))) ??
    areas[0];

  return (
    <>
      {/* mobile scrim */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-[rgba(23,26,31,.45)] transition-opacity lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex bg-[var(--paper)] transition-transform duration-200',
          'border-r border-[var(--rule)]',
          open ? 'translate-x-0' : '-translate-x-full',
          'lg:static lg:z-auto lg:translate-x-0',
        )}
        aria-label="Primary"
      >
        {/* rail */}
        <div className="flex w-14 shrink-0 flex-col items-center border-r border-[var(--rule)] bg-[var(--surface)]">
          <Link to="/dashboard" className="flex h-14 w-14 items-center justify-center border-b border-[var(--rule)]">
            <span className="flex size-7 items-center justify-center rounded-sm bg-[var(--ink)] text-xs font-semibold text-white">
              S
            </span>
            <span className="sr-only">SentinelScan home</span>
          </Link>

          <nav className="flex flex-1 flex-col items-center gap-0.5 py-2" aria-label="Areas">
            {areas.map((area) => {
              const Icon = area.icon;
              const isActive = active?.key === area.key;
              return (
                <NavLink
                  key={area.key}
                  to={area.to}
                  end={area.end}
                  title={area.label}
                  aria-label={area.label}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'flex size-10 items-center justify-center rounded-sm transition-colors',
                    isActive
                      ? 'bg-[var(--ink)] text-white'
                      : 'text-[var(--steel)] hover:bg-[var(--bg-hover)] hover:text-[var(--ink)]',
                  )}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* context column */}
        <div className="flex w-[232px] flex-col">
          <div className="flex h-14 items-center gap-2 border-b border-[var(--rule)] px-4">
            <span className="truncate text-sm font-semibold text-[var(--ink)]">SentinelScan</span>
            <span className="ml-auto rounded-sm border border-[var(--rule)] px-1 py-0.5 font-mono text-[10px] text-[var(--steel)]">
              v0.1
            </span>
          </div>

          <div className="flex-1 overflow-y-auto px-2 py-3">
            <p className="px-2 pb-2 text-xs text-[var(--steel)]">{active?.label ?? 'Dashboard'}</p>
            <ul className="flex flex-col gap-0.5">
              {(active?.children ?? [{ label: active?.label ?? 'Overview', to: active?.to ?? '/dashboard', end: true }])
                .filter((c) => can(c.permission))
                .map((child) => (
                  <li key={child.to + child.label}>
                    <NavLink
                      to={child.to}
                      end={child.end}
                      onClick={onClose}
                      className={({ isActive }) =>
                        cn(
                          'block rounded-sm px-2 py-1.5 text-sm transition-colors',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--signal)]',
                          isActive
                            ? 'bg-[var(--surface)] font-medium text-[var(--ink)]'
                            : 'text-[var(--steel)] hover:bg-[var(--surface)] hover:text-[var(--ink)]',
                        )
                      }
                    >
                      {child.label}
                    </NavLink>
                  </li>
                ))}
            </ul>
          </div>

          <div className="border-t border-[var(--rule)] p-2">
            <div className="flex items-center gap-2 rounded-sm px-2 py-1.5">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-sm border border-[var(--rule)] text-xs font-medium text-[var(--steel)]">
                {(user?.username ?? 'A').slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-[var(--ink)]">{user?.username ?? 'Admin'}</p>
                <p className="truncate text-[11px] text-[var(--steel)]">{user?.role ?? 'admin'}</p>
              </div>
              <ShieldCheck className="ml-auto size-3.5 shrink-0 text-[var(--steel)]" aria-hidden="true" />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
