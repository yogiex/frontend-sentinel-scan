/**
 * SentinelScan — useTelemetry Hook
 * Path: src/hooks/useTelemetry.ts
 *
 * Hook to access telemetry data in React components.
 */

import { useState, useEffect, useCallback } from 'react';
import { telemetry, TelemetrySnapshot, WebVitals, MemoryInfo, NetworkInfo, ErrorStats, LongTaskInfo, FPSInfo } from '@/lib/telemetry';

interface UseTelemetryOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useTelemetry(options: UseTelemetryOptions = {}) {
  const { autoRefresh = false, refreshInterval = 5000 } = options;

  const [snapshot, setSnapshot] = useState<TelemetrySnapshot | null>(null);
  const [webVitals, setWebVitals] = useState<WebVitals>(telemetry.getWebVitals());
  const [memory, setMemory] = useState<MemoryInfo | null>(telemetry.getMemoryInfo());
  const [network, setNetwork] = useState<NetworkInfo | null>(telemetry.getNetworkInfo());
  const [errors, setErrors] = useState<ErrorStats>(telemetry.getErrorStats());
  const [longTasks, setLongTasks] = useState<LongTaskInfo>(telemetry.getLongTasks());
  const [fps, setFPS] = useState<FPSInfo>(telemetry.getFPSInfo());

  const refresh = useCallback(() => {
    const snap = telemetry.collect();
    setSnapshot(snap);
    setWebVitals(snap.webVitals);
    setMemory(snap.memory);
    setNetwork(snap.network);
    setErrors(snap.errors);
    setLongTasks(snap.longTasks);
    setFPS(snap.fps);
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const timer = setInterval(refresh, refreshInterval);
    return () => clearInterval(timer);
  }, [autoRefresh, refreshInterval, refresh]);

  return {
    snapshot,
    webVitals,
    memory,
    network,
    errors,
    longTasks,
    fps,
    refresh,
    // Convenience getters
    getSnapshot: () => telemetry.getSnapshot(),
    getWebVitals: () => telemetry.getWebVitals(),
    getMemoryInfo: () => telemetry.getMemoryInfo(),
    getNetworkInfo: () => telemetry.getNetworkInfo(),
    getErrorStats: () => telemetry.getErrorStats(),
    getLongTasks: () => telemetry.getLongTasks(),
    getFPSInfo: () => telemetry.getFPSInfo(),
  };
}
