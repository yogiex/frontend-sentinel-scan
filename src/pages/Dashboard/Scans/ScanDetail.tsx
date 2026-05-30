/**
 * SentinelScan Scan Detail Page
 * Path: src/pages/Dashboard/Scans/ScanDetail.tsx
 *
 * MVP page showing details of a specific scan.
 */
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusChip } from '@/components/dashboard/StatusChip';
import { SeverityChip } from '@/components/dashboard/SeverityChip';
import { ExportModal } from '@/components/export/ExportModal';
import { scanStore, type Scan } from '@/lib/scan-store';
import type { ScanData } from '@/lib/export';

export function ScanDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [scan, setScan] = useState<Scan | undefined>();
  const [showExport, setShowExport] = useState(false);

  useEffect(() => {
    if (!id) return;

    const loadScan = () => {
      const found = scanStore.getScan(id);
      setScan(found);
    };

    loadScan();
    const unsubscribe = scanStore.subscribe(loadScan);

    return () => unsubscribe();
  }, [id]);

  // Scan Not Found state
  if (!scan) {
    return (
      <div className="space-y-6">
        <Button variant="outline" size="sm" className="border-slate-200 text-slate-600 hover:bg-slate-50" onClick={() => navigate(-1)}>
          ← Back
        </Button>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Scan Not Found</h2>
            <p className="text-slate-500">The requested scan could not be found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Scan in Progress check
  if (scan.status !== 'completed' && scan.status !== 'failed') {
    return (
      <div className="space-y-6">
        <Button variant="outline" size="sm" className="border-slate-200 text-slate-600 hover:bg-slate-50" onClick={() => navigate(-1)}>
          ← Back
        </Button>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Scan in Progress</h2>
            <p className="text-slate-500 mb-4">This scan is currently running. Redirecting to progress page...</p>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={() => navigate(`/dashboard/scans/${scan.id}/progress`)}
            >
              View Progress
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Build export data from scan-store
  const exportData: ScanData = {
    id: scan.id,
    target: scan.target,
    status: scan.status,
    scanType: scan.scanType,
    profile: scan.profile,
    owner: 'admin', // TODO: get from auth context
    createdAt: scan.createdAt,
    startedAt: scan.startedAt || '',
    completedAt: scan.completedAt || '',
    duration: scan.duration || '',
    credentials: {
      enabled: scan.config.credentials,
      authType: scan.config.authType || 'none',
    },
    summary: {
      totalVulns: scan.findings.length,
      critical: scan.findings.filter(f => f.severity === 'critical').length,
      high: scan.findings.filter(f => f.severity === 'high').length,
      medium: scan.findings.filter(f => f.severity === 'medium').length,
      low: scan.findings.filter(f => f.severity === 'low').length,
      info: scan.findings.filter(f => f.severity === 'info').length,
    },
    hosts: scan.hosts,
    notes: scan.config.description,
    vulnerabilities: scan.findings.map((v) => ({
      id: v.id,
      title: v.title,
      severity: v.severity,
      host: v.host,
      port: v.port || 0,
    })),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" className="border-slate-200 text-slate-600 hover:bg-slate-50" onClick={() => navigate(-1)}>
            ← Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Scan Details</h1>
            <p className="text-slate-500 mt-1 font-mono text-sm">{scan.id} • {scan.target}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50" onClick={() => setShowExport(true)}>
             Export
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
            View Results
          </Button>
        </div>
      </div>

      {/* Status + Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">Status</p>
            <StatusChip status={scan.status as any} />
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">Total Vulns</p>
            <p className="text-2xl font-bold text-slate-900">{scan.findings.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">Critical</p>
            <p className="text-2xl font-bold text-red-500">{scan.findings.filter(f => f.severity === 'critical').length}</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">High</p>
            <p className="text-2xl font-bold text-orange-500">{scan.findings.filter(f => f.severity === 'high').length}</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">Medium</p>
            <p className="text-2xl font-bold text-amber-500">{scan.findings.filter(f => f.severity === 'medium').length}</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">Low</p>
            <p className="text-2xl font-bold text-blue-500">{scan.findings.filter(f => f.severity === 'low').length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scan Info */}
        <Card className="bg-white border-slate-200 lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-slate-900">Scan Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Target</span>
              <span className="text-slate-900 font-mono">{scan.target}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Type</span>
              <span className="text-slate-900">{scan.scanType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Profile</span>
              <span className="text-slate-900">{scan.profile}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Owner</span>
              <span className="text-slate-900">admin</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Credentials</span>
              <span className={scan.config.credentials ? 'text-emerald-500' : 'text-slate-500'}>
                {scan.config.credentials ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <hr className="border-slate-200" />
            <div className="flex justify-between">
              <span className="text-slate-500">Created</span>
              <span className="text-slate-500">{scan.createdAt.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Started</span>
              <span className="text-slate-500">{scan.startedAt || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Completed</span>
              <span className="text-slate-500">{scan.completedAt || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Duration</span>
              <span className="text-slate-900 font-semibold">{scan.duration || '—'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Hosts Discovered */}
        <Card className="bg-white border-slate-200 lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-slate-900">Hosts Discovered</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-4 text-slate-500 font-medium">IP Address</th>
                  <th className="text-left py-2 px-4 text-slate-500 font-medium">Status</th>
                  <th className="text-left py-2 px-4 text-slate-500 font-medium">Open Ports</th>
                  <th className="text-left py-2 px-4 text-slate-500 font-medium">Vulns</th>
                </tr>
              </thead>
              <tbody>
                {scan.hosts.map((host) => (
                  <tr key={host.ip} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                    <td className="py-2 px-4 font-mono text-slate-900">{host.ip}</td>
                    <td className="py-2 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${host.status === 'up' ? 'bg-emerald-500/20 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                        {host.status}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-slate-500">{host.openPorts}</td>
                    <td className="py-2 px-4">
                      {host.vulns > 0 ? (
                        <span className="text-red-500 font-semibold">{host.vulns}</span>
                      ) : (
                        <span className="text-slate-500">0</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

        {/* Top Vulnerabilities */}
        <Card className="bg-white border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-slate-900">Top Vulnerabilities</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-4 text-slate-500 font-medium">CVE ID</th>
                  <th className="text-left py-2 px-4 text-slate-500 font-medium">Title</th>
                  <th className="text-left py-2 px-4 text-slate-500 font-medium">Severity</th>
                  <th className="text-left py-2 px-4 text-slate-500 font-medium">Host</th>
                  <th className="text-left py-2 px-4 text-slate-500 font-medium">Port</th>
                </tr>
              </thead>
              <tbody>
                {scan.findings
                  .sort((a, b) => {
                    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
                    return severityOrder[a.severity] - severityOrder[b.severity];
                  })
                  .slice(0, 10)
                  .map((vuln) => (
                    <tr
                      key={vuln.id}
                      className="border-b border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/dashboard/scans/${scan.id}/results/${vuln.id}`)}
                    >
                      <td className="py-2 px-4 font-mono text-indigo-600">{vuln.cveId || vuln.id}</td>
                      <td className="py-2 px-4 text-slate-900">{vuln.title}</td>
                      <td className="py-2 px-4">
                        <SeverityChip severity={vuln.severity as any} size="sm" />
                      </td>
                      <td className="py-2 px-4 font-mono text-slate-500">{vuln.host}</td>
                      <td className="py-2 px-4 text-slate-500">{vuln.port || '—'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Notes */}
        {scan.config.description && (
          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-slate-900">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">{scan.config.description}</p>
            </CardContent>
          </Card>
        )}

      {/* Export Modal */}
      {showExport && <ExportModal data={exportData} onClose={() => setShowExport(false)} />}
    </div>
  );
}
