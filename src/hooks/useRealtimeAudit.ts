import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/store';
import { loadEntries } from '@/store/slices/auditLogSlice';
import { auditLogger } from '@/lib/logger';

export function useRealtimeAudit(
  initialActive = false,
  interval = 30000 // 30 seconds default
) {
  const dispatch = useDispatch<AppDispatch>();
  const [active, setActive] = useState(initialActive);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchLogs = useCallback(() => {
    const accessLogs = auditLogger.getAccessLogs();
    dispatch(loadEntries(accessLogs));
  }, [dispatch]);
  
  const start = useCallback(() => {
    setActive(true);
    fetchLogs(); // Immediate fetch
    intervalRef.current = setInterval(fetchLogs, interval);
  }, [fetchLogs, interval]);

  const stop = useCallback(() => {
    setActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const toggle = useCallback(() => {
    if (active) {
      stop();
    } else {
      start();
    }
  }, [active, start, stop]);

  // Setup on mount if initialActive
  useEffect(() => {
    if (initialActive) {
      const timer = setTimeout(() => start(), 0);
      return () => {
        clearTimeout(timer);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
    // Only run on mount intentionally
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    active,
    start,
    stop,
    toggle,
  };
}
