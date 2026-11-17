import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUser } from '@/store/slices/authSlice';
import { usePermission } from '@/hooks/usePermission';
import { StatePanel } from '@/shared/ui/StatePanel';
import type { Permission } from '@/types/permissions';

/** Menjaga seluruh subtree /dashboard. */
export function RequireAuth() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

/** Menjaga satu route berdasarkan permission. */
export function RequirePermission({
  permission,
  children,
}: {
  permission: Permission;
  children: ReactNode;
}) {
  const { canAccess } = usePermission();
  if (!canAccess([permission])) {
    return (
      <StatePanel
        variant="no-permission"
        title="You do not have access to this page"
        description="Your role does not include this permission. Ask an administrator to grant access."
      />
    );
  }
  return <>{children}</>;
}

/** Halaman publik: sudah login → dashboard. */
export function GuestOnly({ children }: { children: ReactNode }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  if (isAuthenticated && user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}
