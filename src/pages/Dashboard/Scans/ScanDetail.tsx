import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusChip } from '@/components/dashboard/StatusChip';
import { SeverityChip } from '@/components/dashboard/SeverityChip';
import { ExportModal } from '@/components/export/ExportModal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { scanStore, RUNNING_STATUSES, type Scan } from '@/lib/scan-store';
import type { ScanData } from '@/lib/export';
import { toast } from 'sonner';
import { RefreshCw, XCircle, AlertTriangle } from 'lucide-react';

export function ScanDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [scan, setScan] = useState<Scan | undefined>();
  const [showExport, setShowExport] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [scanHistory, setScanHistory] = useState<Scan[]>([]);
  const [activeTab, setActiveTab] = useState('detail');

  useEffect(() => {
    if (!id) return;
    const loadScan = () => {
      const found = scanStore.getScan(id);
      setScan(found);
      if (found) {
        const history = scanStore.getScanHistory(found.scanGroupId);
        setScanHistory(history);
      }
    };
    loadScan();
    const unsubscribe = scanStore.subscribe(loadScan);
    return () => unsubscribe();
  }, [id]);

  const handleDelete = () => {
    if (!id) return;
    const user = (() => { try { const u = JSON.parse(localStorage.getItem('sentinelscan_user') || '{}'); return u.username || 'unknown'; } catch { return 'unknown'; } })();
    scanStore.softDelete(id, user);
    toast.success('Scan moved to trash');
    setShowDeleteDialog(false);
    navigate('/dashboard/scans/all');
  };

  const handleCancel = () => {
    if (!id) return;
    scanStore.cancelScan(id);
    toast.success('Scan cancelled');
    setShowCancelDialog(false);
  };

  const isRunning = scan ? RUNNING_STATUSES.includes(scan.status) : false;
  const isRescanable = scan ? ['completed', 'failed', 'cancelled', 'aborted'].includes(scan.status) : false;

  if (!scan) {
    return (
      <div className="space-y-6">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
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

  const exportData: ScanData = {
    id: scan.id,
    target: scan.target,
    status: scan.status,
    scanType: scan.scanType,
    profile: scan.profile,
    owner: scan.createdBy || 'admin',
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
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            ← Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Scan Details</h1>
            <p className="text-slate-500 mt-1 font-mono text-sm">Run #{scan.runNumber} &bull; {scan.id} &bull; {scan.target}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {isRunning && (
            <Button variant="outline" className="text-amber-600 border-amber-200 hover:bg-amber-50" onClick={() => setShowCancelDialog(true)}>
              <XCircle className="w-4 h-4 mr-1.5" /> Cancel
            </Button>
          )}
          {isRescanable && (
            <Button variant="outline" onClick={() => navigate(`/dashboard/scans/new?template=${scan.id}`)}>
              <RefreshCw className="w-4 h-4 mr-1.5" /> Rescan
            </Button>
          )}
          <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => setShowDeleteDialog(true)}>
            Delete
          </Button>
          <Button variant="outline" onClick={() => setShowExport(true)}>
            Export
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

      {/* Scan Info */}
      <Card className="bg-white border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-slate-900">Scan Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4 text-sm">
            <div className="col-span-2 md:col-span-3">
              <p className="text-xs text-slate-400 mb-0.5">Target</p>
              <p className="text-slate-900 font-mono">{scan.target}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Type</p>
              <p className="text-slate-900 capitalize">{scan.scanType}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Profile</p>
              <p className="text-slate-900 capitalize">{scan.profile}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Duration</p>
              <p className="text-slate-900 font-semibold">{scan.duration || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Owner</p>
              <p className="text-slate-900">{scan.createdBy || 'admin'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Credentials</p>
              <p className={scan.config.credentials ? 'text-emerald-500 font-medium' : 'text-slate-400'}>
                {scan.config.credentials ? 'Enabled' : 'Disabled'}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Hosts Scanned</p>
              <p className="text-slate-900">{scan.hosts.length}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Created</p>
              <p className="text-slate-500 text-xs">{new Date(scan.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Started</p>
              <p className="text-slate-500 text-xs">{scan.startedAt ? new Date(scan.startedAt).toLocaleString() : '—'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Completed</p>
              <p className="text-slate-500 text-xs">{scan.completedAt ? new Date(scan.completedAt).toLocaleString() : '—'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs: Detail | History | Log */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start bg-slate-100 rounded-lg p-1">
          <TabsTrigger value="detail" className="flex-1 md:flex-none data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">
            Detail
          </TabsTrigger>
          <TabsTrigger value="history" className="flex-1 md:flex-none data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">
            History
          </TabsTrigger>
          <TabsTrigger value="log" className="flex-1 md:flex-none data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">
            Log
          </TabsTrigger>
        </TabsList>

        {/* Detail Tab: Vulnerability Findings */}
        <TabsContent value="detail" className="mt-4 space-y-6">
          {scan.status !== 'completed' && scan.status !== 'failed' ? (
            <Card className="bg-white border-slate-200">
              <CardContent className="p-8 text-center">
                <h2 className="text-xl font-semibold text-slate-900 mb-2">Scan in Progress</h2>
                <p className="text-slate-500 mb-4">Results will appear once the scan completes.</p>
                <Button variant="primary" onClick={() => navigate(`/dashboard/scans/${scan.id}/progress`)}>
                  View Progress
                </Button>
              </CardContent>
            </Card>
          ) : scan.findings.length === 0 ? (
            <Card className="bg-white border-slate-200">
              <CardContent className="p-8 text-center">
                <h2 className="text-xl font-semibold text-slate-900 mb-2">No Findings</h2>
                <p className="text-slate-500">{scan.errorMessage || 'No vulnerabilities were discovered during this scan.'}</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="bg-white border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-slate-900">Vulnerabilities</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-2 px-4 text-slate-500 font-medium">Severity</th>
                        <th className="text-left py-2 px-4 text-slate-500 font-medium">Title</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scan.findings
                        .sort((a, b) => {
                          const severityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
                          return severityOrder[a.severity] - severityOrder[b.severity];
                        })
                        .map((vuln, idx) => (
                          <tr
                            key={vuln.id}
                            className="border-b border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                            onClick={() => navigate(`/dashboard/scans/${scan.id}/results/${vuln.id}`)}
                          >
                            <td className="py-2 px-4">
                              <SeverityChip severity={vuln.severity as any} size="sm" />
                            </td>
                            <td className="py-2 px-4">
                              <div className="flex items-start gap-2">
                                <span className="text-slate-300 font-mono text-xs mt-0.5 shrink-0">#{idx + 1}</span>
                                <div>
                                  <p className="text-slate-900">{vuln.title}</p>
                                  <p className="text-xs text-slate-400 font-mono mt-0.5 truncate max-w-xl">{vuln.url || `${vuln.host}:${vuln.port || 80}`}</p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
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
            </>
          )}
        </TabsContent>

        {/* History Tab: Scan Instances */}
        <TabsContent value="history" className="mt-4 space-y-6">
          {scan.errorMessage && (
            <Card className="bg-white border-red-200">
              <CardContent className="p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900">Scan Error</p>
                  <p className="text-sm text-slate-600 mt-1">{scan.errorMessage}</p>
                </div>
              </CardContent>
            </Card>
          )}
          {scanHistory.length > 0 ? (
            <Card className="bg-white border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-slate-900">Scan History on this Target</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 px-4 text-slate-500 font-medium">#</th>
                      <th className="text-left py-2 px-4 text-slate-500 font-medium">Date</th>
                      <th className="text-left py-2 px-4 text-slate-500 font-medium">Status</th>
                      <th className="text-center py-2 px-2 text-slate-500 font-medium">Critical</th>
                      <th className="text-center py-2 px-2 text-slate-500 font-medium">High</th>
                      <th className="text-center py-2 px-2 text-slate-500 font-medium">Medium</th>
                      <th className="text-center py-2 px-2 text-slate-500 font-medium">Low</th>
                      <th className="text-center py-2 px-2 text-slate-500 font-medium">Info</th>
                      <th className="text-left py-2 px-4 text-slate-500 font-medium">Duration</th>
                      <th className="text-left py-2 px-4 text-slate-500 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {scanHistory.map((h, idx) => {
                      const c = h.findings.filter(f => f.severity === 'critical').length;
                      const hi = h.findings.filter(f => f.severity === 'high').length;
                      const m = h.findings.filter(f => f.severity === 'medium').length;
                      const l = h.findings.filter(f => f.severity === 'low').length;
                      const inf = h.findings.filter(f => f.severity === 'info').length;
                      const isCurrent = h.id === scan.id;
                      const isRescanRun = !!h.sourceScanId;
                      const prevScan = h.sourceScanId ? scanStore.getScan(h.sourceScanId) : undefined;
                      const nextRuns = scanHistory.filter(s => s.sourceScanId === h.id);
                      return (
                        <tr
                          key={h.id}
                          className={`border-b border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer ${isCurrent ? 'bg-indigo-50 border-l-2 border-l-indigo-500' : ''}`}
                          onClick={() => { setActiveTab('detail'); navigate(`/dashboard/scans/${h.id}`); }}
                        >
                          <td className="py-2 px-4">
                            <span className="font-mono text-sm text-slate-700">#{h.runNumber}</span>
                          </td>
                          <td className="py-2 px-4 text-slate-500">
                            <div>{new Date(h.createdAt).toLocaleDateString()}</div>
                            <div className="text-xs text-slate-400">{new Date(h.createdAt).toLocaleTimeString()}</div>
                          </td>
                          <td className="py-2 px-4">
                            <div className="flex flex-col gap-0.5">
                              <StatusChip status={h.status as any} size="sm" />
                              {isRescanRun && (
                                <span className="text-xs text-slate-400 italic mt-0.5">
                                  ← <button className="hover:text-indigo-500 hover:underline" onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/scans/${h.sourceScanId}`); }}>Run #{prevScan?.runNumber || '?'}</button>
                                </span>
                              )}
                              {nextRuns.length > 0 && (
                                <span className="text-xs text-slate-400 italic mt-0.5">
                                  → {nextRuns.length} rescan{nextRuns.length > 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className={`text-center py-2 px-2 font-semibold ${c > 0 ? 'text-red-500' : 'text-slate-300'}`}>{c}</td>
                          <td className={`text-center py-2 px-2 font-semibold ${hi > 0 ? 'text-orange-500' : 'text-slate-300'}`}>{hi}</td>
                          <td className={`text-center py-2 px-2 font-semibold ${m > 0 ? 'text-amber-500' : 'text-slate-300'}`}>{m}</td>
                          <td className={`text-center py-2 px-2 font-semibold ${l > 0 ? 'text-blue-500' : 'text-slate-300'}`}>{l}</td>
                          <td className={`text-center py-2 px-2 font-semibold ${inf > 0 ? 'text-slate-500' : 'text-slate-300'}`}>{inf}</td>
                          <td className="py-2 px-4 text-slate-500">{h.duration || '—'}</td>
                          <td className="py-2 px-4">
                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setActiveTab('detail'); navigate(`/dashboard/scans/${h.id}`); }}>
                              {isCurrent ? 'Current' : 'View'}
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white border-slate-200">
              <CardContent className="p-8 text-center">
                <h2 className="text-xl font-semibold text-slate-900 mb-2">No History</h2>
                <p className="text-slate-500">No previous scan runs found for this instance.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Log Tab: Scan Logs */}
        <TabsContent value="log" className="mt-4 space-y-6">
          {scan.logs.length > 0 ? (
            <Card className="bg-white border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-slate-900">Scan Log</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="bg-slate-950 text-slate-300 font-mono text-xs p-4 rounded-b-lg max-h-[600px] overflow-y-auto space-y-1">
                  {scan.logs.map((log, i) => {
                    const isError = log.includes('ERROR');
                    const isVuln = log.includes('VULN');
                    const isAI = log.includes('🤖');
                    const isWarning = log.includes('WARN');
                    return (
                      <div
                        key={i}
                        className={`${
                          isError ? 'text-red-400' :
                          isVuln ? 'text-amber-300' :
                          isAI ? 'text-cyan-300' :
                          isWarning ? 'text-yellow-300' :
                          'text-slate-400'
                        }`}
                      >
                        {log}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white border-slate-200">
              <CardContent className="p-8 text-center">
                <h2 className="text-xl font-semibold text-slate-900 mb-2">No Logs</h2>
                <p className="text-slate-500">
                  {isRunning ? 'Logs will appear as the scan progresses.' : 'No log data available for this scan.'}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Export Modal */}
      {showExport && <ExportModal data={exportData} onClose={() => setShowExport(false)} />}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Scan"
        description="This will move the scan to trash. You can restore it from the Trash page within 30 days."
        confirmLabel="Move to Trash"
        variant="destructive"
        onConfirm={handleDelete}
      />

      <ConfirmDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        title="Cancel Scan"
        description="This will stop the running scan and mark it as cancelled."
        confirmLabel="Cancel Scan"
        variant="destructive"
        onConfirm={handleCancel}
      />
    </div>
  );
}
