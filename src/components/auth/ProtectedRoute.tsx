/**
 * ProtectedRoute Component
 * Path: src/components/auth/ProtectedRoute.tsx
 *
 * Route guard that checks permissions before rendering children.
 * Super-admin can access everything.
 */
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser, selectIsAuthenticated } from '@/store/slices/authSlice';
import type { Permission, Role } from '@/types/permissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: Permission[];
  requiredRole?: Role;
  fallbackPath?: string;
}

export function ProtectedRoute({
  children,
  requiredPermissions = [],
  requiredRole,
  fallbackPath = '/dashboard'
}: ProtectedRouteProps) {
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Not authenticated → redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check role if specified
  if (requiredRole) {
    if (requiredRole === 'super-admin' && user.role !== 'super-admin') {
      return <Navigate to={fallbackPath} replace />;
    }
    if (requiredRole !== user.role) {
      return <Navigate to={fallbackPath} replace />;
    }
  }

  // Check permissions if specified
  if (requiredPermissions.length > 0) {
    const userPerms = user.permissions || [];

    // Super-admin or full_access can access everything
    if (user.role === 'super-admin') {
      return <>{children}</>;
    }

    if (userPerms.includes('full_access')) {
      return <>{children}</>;
    }

    // Check if user has ANY of the required permissions
    const hasPermission = requiredPermissions.some(perm => userPerms.includes(perm));

    if (!hasPermission) {
      return <Navigate to={fallbackPath} replace />;
    }
  }

  return <>{children}</>;
}
