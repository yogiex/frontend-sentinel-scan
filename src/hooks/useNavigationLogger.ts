/**
 * Navigation Logger Hook
 * Path: src/hooks/useNavigationLogger.ts
 *
 * Automatically logs all route changes to the audit logger.
 * Called once in App.tsx to enable global navigation tracking.
 */
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { logNavigation } from '@/lib/logger';

export function useNavigationLogger() {
  const location = useLocation();
  const prevPathRef = useRef<string | null>(null);

  useEffect(() => {
    const previousPath = prevPathRef.current;
    
    // Log only if path changed (not first mount)
    if (previousPath && previousPath !== location.pathname) {
      logNavigation(`Navigated to ${location.pathname}`, {
        from: previousPath,
        to: location.pathname,
        search: location.search,
        hash: location.hash,
        fullPath: location.pathname + location.search + location.hash,
      });
    }
    
    // Save current path for next comparison
    prevPathRef.current = location.pathname;
  }, [location]);
}
