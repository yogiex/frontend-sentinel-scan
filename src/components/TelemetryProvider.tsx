/**
 * SentinelScan — Telemetry Provider
 * Path: src/components/TelemetryProvider.tsx
 *
 * Wraps the app and initializes telemetry collection.
 * Telemetry data is automatically logged to the audit trail (category: 'performance').
 * No floating widget - check Audit Log Viewer to see telemetry snapshots.
 */

import { useEffect } from 'react';
import { telemetry } from '@/lib/telemetry';

interface TelemetryProviderProps {
  children: React.ReactNode;
}

export function TelemetryProvider({ children }: TelemetryProviderProps) {
  useEffect(() => {
    // Telemetry automatically logs to auditLogger (see telemetry.ts collect() method)
    // No need for callback since we're using auditLogger directly

    return () => {
      telemetry.destroy();
    };
  }, []);

  return <>{children}</>;
}
