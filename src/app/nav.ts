import type { LucideIcon } from 'lucide-react';
import {
  ChartColumn,
  FileStack,
  LayoutDashboard,
  Radar,
  ScrollText,
  Settings,
  Ticket,
  Users,
} from 'lucide-react';
import type { Permission } from '@/types/permissions';

export interface NavChild {
  label: string;
  to: string;
  end?: boolean;
  permission?: Permission;
}

export interface NavArea {
  key: string;
  label: string;
  to: string;
  icon: LucideIcon;
  end?: boolean;
  permission?: Permission;
  children?: NavChild[];
}

/**
 * Satu sumber untuk rail, kolom konteks, dan judul header.
 * `docs/ROUTES.md` adalah padanan dokumentasinya.
 */
export const NAV: NavArea[] = [
  { key: 'overview', label: 'Overview', to: '/dashboard', icon: LayoutDashboard, end: true },
  {
    key: 'scans',
    label: 'Scans',
    to: '/dashboard/scans',
    icon: Radar,
    children: [
      { label: 'All scans', to: '/dashboard/scans', end: true },
      { label: 'New scan', to: '/dashboard/scans/new', permission: 'scan_create' },
      { label: 'My scans', to: '/dashboard/scans/my' },
      { label: 'Trash', to: '/dashboard/scans/trash', permission: 'scan_delete' },
    ],
  },
  {
    key: 'tickets',
    label: 'Tickets',
    to: '/dashboard/tickets',
    icon: Ticket,
    children: [
      { label: 'All tickets', to: '/dashboard/tickets', end: true },
      { label: 'Board', to: '/dashboard/tickets/kanban' },
      { label: 'New ticket', to: '/dashboard/tickets/new' },
    ],
  },
  { key: 'templates', label: 'Templates', to: '/dashboard/templates', icon: FileStack },
  { key: 'reports', label: 'Reports', to: '/dashboard/reports', icon: ChartColumn },
  { key: 'audit', label: 'Audit trail', to: '/dashboard/logs', icon: ScrollText, permission: 'audit_log' },
  { key: 'users', label: 'Users', to: '/dashboard/users', icon: Users, permission: 'user_management' },
  { key: 'settings', label: 'Settings', to: '/dashboard/settings', icon: Settings, permission: 'system_config' },
];

/** Judul header per pola path (paling spesifik lebih dulu). */
export const ROUTE_TITLES: { pattern: RegExp; title: string }[] = [
  { pattern: /^\/dashboard\/scans\/new\/?$/, title: 'New scan' },
  { pattern: /^\/dashboard\/scans\/my\/?$/, title: 'My scans' },
  { pattern: /^\/dashboard\/scans\/trash\/?$/, title: 'Trash' },
  { pattern: /^\/dashboard\/scans\/[^/]+\/progress\/?$/, title: 'Scanning' },
  { pattern: /^\/dashboard\/scans\/[^/]+\/findings\/[^/]+\/?$/, title: 'Finding' },
  { pattern: /^\/dashboard\/scans\/[^/]+\/?$/, title: 'Scan detail' },
  { pattern: /^\/dashboard\/scans\/?$/, title: 'Scans' },
  { pattern: /^\/dashboard\/tickets\/new\/?$/, title: 'New ticket' },
  { pattern: /^\/dashboard\/tickets\/kanban\/?$/, title: 'Ticket board' },
  { pattern: /^\/dashboard\/tickets\/[^/]+\/?$/, title: 'Ticket' },
  { pattern: /^\/dashboard\/tickets\/?$/, title: 'Tickets' },
  { pattern: /^\/dashboard\/templates\/?$/, title: 'Templates' },
  { pattern: /^\/dashboard\/reports\/?$/, title: 'Reports' },
  { pattern: /^\/dashboard\/logs\/?$/, title: 'Audit trail' },
  { pattern: /^\/dashboard\/users\/?$/, title: 'Users' },
  { pattern: /^\/dashboard\/settings\/?$/, title: 'Settings' },
  { pattern: /^\/dashboard\/?$/, title: 'Overview' },
];

export function titleForPath(pathname: string): string {
  return ROUTE_TITLES.find((r) => r.pattern.test(pathname))?.title ?? 'Dashboard';
}

export function activeArea(pathname: string): NavArea | undefined {
  return NAV.find((area) =>
    area.end ? pathname === area.to : pathname === area.to || pathname.startsWith(`${area.to}/`),
  );
}
