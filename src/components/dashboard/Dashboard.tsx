/**
 * SentinelScan Dashboard Component
 * Path: /home/mirage/Documents/code/sec/research/inkubasi-btp-cybersecurity/code/frontend/src/components/dashboard/Dashboard.tsx
 *
 * Main dashboard component for vulnerability scanning interface.
 * Displays scan form, results, and manages scan operations.
 */

import { useScan } from '../../hooks/useScan';
import { ScanForm } from './ScanForm';
import { ResultsView } from './ResultsView';

export function Dashboard() {
  const { scan, results, loading, error, createScan } = useScan();

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Vulnerability Scanner Dashboard</h1>

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>
      )}

      <ScanForm onSubmit={createScan} loading={loading} />

      {scan && (
        <div className="p-4 bg-white rounded-xl shadow">
          <h2 className="text-xl font-bold mb-2">Scan #{scan.id}</h2>
          <div className="text-sm text-gray-600">Status: {scan.status}</div>
          <ResultsView results={results} loading={loading} />
        </div>
      )}
    </div>
  );
}
