/**
 * SentinelScan useScan Hook
 * Path: /home/mirage/Documents/code/sec/research/inkubasi-btp-cybersecurity/code/frontend/src/hooks/useScan.ts
 *
 * Custom React hook for managing vulnerability scan operations.
 * Handles scan creation, WebSocket connections, and real-time updates.
 */

import { useState, useEffect, useRef } from 'react';
import { apiClient } from '../api/client';
import { ScanJob, ScanResult, CreateScanRequest } from '../types';

export function useScan(scanId?: number) {
  const [scan, setScan] = useState<ScanJob | null>(null);
  const [results, setResults] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Load scan data if scanId is provided
  useEffect(() => {
    if (!scanId) return;

    const loadScan = async () => {
      setLoading(true);
      try {
        const [scanData, resultsData] = await Promise.all([
          apiClient.getScan(scanId),
          apiClient.getScanResults(scanId),
        ]);
        setScan(scanData);
        setResults(resultsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load scan');
      } finally {
        setLoading(false);
      }
    };

    loadScan();
  }, [scanId]);

  // Connect to WebSocket for real-time updates
  useEffect(() => {
    if (!scanId) return;

    const ws = apiClient.connectWebSocket(scanId, (event) => {
      switch (event.type) {
        case 'finding':
          setResults((prev) => [...prev, event.data as ScanResult]);
          break;
        case 'complete':
          setScan((prev) => prev ? { ...prev, status: 'completed' } : null);
          break;
      }
    });

    wsRef.current = ws;
    return () => ws.close();
  }, [scanId]);

  const createScan = async (request: CreateScanRequest) => {
    setLoading(true);
    setError(null);
    try {
      const newScan = await apiClient.createScan(request);
      setScan(newScan);
      return newScan;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create scan');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { scan, results, loading, error, createScan };
}
