/**
 * usePermission Hook
 * Path: src/hooks/usePermission.ts
 *
 * Hook for checking user permissions based on role.
 * Uses centralized permission matrix from @/types/permissions.
 */
import { useSelector } from 'react-redux';
import { selectUser } from '@/store/slices/authSlice';
import { PERMISSIONS, type Permission, type Role } from '@/types/permissions';

export function usePermission() {
  const user = useSelector(selectUser);

  /**
   * Check if current user has a specific permission
   */
  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;

    const userRole = user.role as Role;
    const userPerms = PERMISSIONS[userRole] || [];

    // Super admin or full_access can do anything
    if (userRole === 'super-admin') return true;
    if (userPerms.includes('full_access')) return true;

    return userPerms.includes(permission);
  };

  /**
   * Check if current user has ANY of the given permissions
   */
  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some((perm) => hasPermission(perm));
  };

  /**
   * Check if current user has ALL of the given permissions
   */
  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every((perm) => hasPermission(perm));
  };

  /**
   * Get all permissions for current user
   */
  const getUserPermissions = (): Permission[] => {
    if (!user) return [];
    const userRole = user.role as Role;
    return PERMISSIONS[userRole] || [];
  };

  /**
   * Check if current user is super-admin
   */
  const isSuperAdmin = (): boolean => {
    return user?.role === 'super-admin';
  };

  /**
   * Check if current user can access a specific route
   */
  const canAccess = (requiredPermissions: Permission[]): boolean => {
    if (!user) return false;
    if (user.role === 'super-admin') return true;

    const userPerms = getUserPermissions();
    if (userPerms.includes('full_access')) return true;

    return requiredPermissions.some((perm) => userPerms.includes(perm));
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getUserPermissions,
    isSuperAdmin,
    canAccess,
    userRole: user?.role as Role | undefined,
    userPermissions: getUserPermissions(),
  };
}
