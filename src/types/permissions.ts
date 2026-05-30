/**
 * Permission Types and Matrix
 * Path: src/types/permissions.ts
 *
 * Centralized permission definitions for RBAC system.
 * Roles: super-admin, admin, user, viewer
 */

// ─── Permission Types ─────────────────────────────────────────────────
export type Permission =
  // Super Admin
  | 'full_access'
  // User Management
  | 'user_management'
  | 'user_view'
  | 'user_create'
  | 'user_edit'
  | 'user_delete'
  // Scan Management
  | 'scan_create'
  | 'scan_view'
  | 'scan_edit'
  | 'scan_delete'
  | 'scan_execute'
  // Reports
  | 'report_view'
  | 'report_export'
  // Settings
  | 'system_config'
  | 'audit_log'
  // Templates
  | 'template_manage';

// ─── Role Definitions ────────────────────────────────────────────────
export type Role = 'super-admin' | 'admin' | 'user' | 'viewer';

// ─── Permission Matrix ────────────────────────────────────────────────
export const PERMISSIONS: Record<Role, Permission[]> = {
  'super-admin': [
    'full_access',
    'user_management',
    'user_view',
    'user_create',
    'user_edit',
    'user_delete',
    'scan_create',
    'scan_view',
    'scan_edit',
    'scan_delete',
    'scan_execute',
    'report_view',
    'report_export',
    'system_config',
    'audit_log',
    'template_manage',
  ],
  admin: [
    'user_management',
    'user_view',
    'user_create',
    'user_edit',
    'scan_create',
    'scan_view',
    'scan_edit',
    'scan_delete',
    'scan_execute',
    'report_view',
    'report_export',
    'system_config',
    'audit_log',
    'template_manage',
  ],
  user: [
    'scan_create',
    'scan_view',
    'scan_execute',
    'report_view',
    'report_export',
  ],
  viewer: [
    'scan_view',
    'report_view',
  ],
};

// ─── Role Config (for UI) ──────────────────────────────────────────
export interface RoleConfig {
  label: string;
  description: string;
  color: string;
  icon: string; // Lucide icon name
}

export const ROLE_CONFIG: Record<Role, RoleConfig> = {
  'super-admin': {
    label: 'Super Administrator',
    description: 'Full system access including user management',
    color: 'from-red-600 to-red-700',
    icon: 'Shield',
  },
  admin: {
    label: 'Administrator',
    description: 'Full system access and user management',
    color: 'from-red-500 to-red-600',
    icon: 'Shield',
  },
  user: {
    label: 'User',
    description: 'Create scans and view reports',
    color: 'from-blue-500 to-blue-600',
    icon: 'User',
  },
  viewer: {
    label: 'Viewer',
    description: 'Read-only access to scans and reports',
    color: 'from-slate-500 to-slate-600',
    icon: 'Eye',
  },
};

// ─── Helper Functions ─────────────────────────────────────────────────
export function hasPermission(role: Role, permission: Permission): boolean {
  const perms = PERMISSIONS[role];
  return perms.includes('full_access') || perms.includes(permission);
}

export function getPermissions(role: Role): Permission[] {
  return PERMISSIONS[role] || [];
}

export function canAccess(role: Role, requiredPermissions: Permission[]): boolean {
  if (role === 'super-admin') return true; // Super admin can access everything
  const userPerms = PERMISSIONS[role] || [];
  return requiredPermissions.some((perm) => userPerms.includes(perm));
}
