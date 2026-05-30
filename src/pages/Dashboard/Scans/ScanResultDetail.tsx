/**
 * SentinelScan Scan Result Detail Page
 * Path: src/pages/Dashboard/Scans/ScanResultDetail.tsx
 *
 * MVP page showing detailed vulnerability result from a scan.
 */
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SeverityChip } from '@/components/dashboard/SeverityChip';
import { scanStore } from '@/lib/scan-store';
import { Finding } from '@/lib/scan-store';

export function ScanResultDetail() {
  const navigate = useNavigate();
  const { scanId, vulnId } = useParams<{ scanId: string; vulnId: string }>();

  // Get scan and finding from store
  const scan = scanId ? scanStore.getScan(scanId) : undefined;
  const vulnDetail: Finding | undefined = scan && vulnId
    ? scan.findings.find(f => f.id === vulnId)
    : undefined;

  // Get related vulnerabilities on same host
  const relatedVulns = vulnDetail && scan
    ? scan.findings.filter(f => f.host === vulnDetail.host && f.id !== vulnDetail.id)
    : [];

  // Show not found if scan or vulnerability doesn't exist
  if (!scan || !vulnDetail) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            className="border-slate-200 text-slate-500 hover:bg-slate-50"
            onClick={() => navigate(-1)}
          >
            ← Back to Scan
          </Button>
        </div>
        <div className="text-center py-12">
          <p className="text-slate-500">Vulnerability not found</p>
        </div>
      </div>
    );
  }

  // Get severity color classes
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-amber-500';
      case 'low': return 'text-emerald-500';
      default: return 'text-slate-500';
    }
  };

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-50 border-red-200';
      case 'high': return 'bg-orange-50 border-orange-200';
      case 'medium': return 'bg-amber-50 border-amber-200';
      case 'low': return 'bg-emerald-50 border-emerald-200';
      default: return 'bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" className="border-slate-200 text-slate-500 hover:bg-slate-50" onClick={() => navigate(-1)}>
            ← Back to Scan
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{vulnDetail.cveId || vulnDetail.id}</h1>
              <SeverityChip severity={vulnDetail.severity} />
              {vulnDetail.cvssScore && (
                <Badge className={`${getSeverityBg(vulnDetail.severity)} ${getSeverityColor(vulnDetail.severity)}`}>
                  CVSS {vulnDetail.cvssScore}
                </Badge>
              )}
            </div>
            <p className="text-slate-500 mt-1">{vulnDetail.title}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-slate-200 text-slate-500 hover:bg-slate-50">
            Mark as False Positive
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
            Create Ticket
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-slate-900">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500 leading-relaxed">{vulnDetail.description}</p>
            </CardContent>
          </Card>

          {/* Note: Evidence, Remediation, References would come from a full vulnerability database */}
          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-slate-900">Vulnerability Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Category</span>
                <span className="text-slate-900">{vulnDetail.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">CVE ID</span>
                <span className="text-slate-900 font-mono">{vulnDetail.cveId || 'N/A'}</span>
              </div>
              {vulnDetail.cvssScore && (
                <div className="flex justify-between">
                  <span className="text-slate-500">CVSS Score</span>
                  <span className={`font-bold ${getSeverityColor(vulnDetail.severity)}`}>{vulnDetail.cvssScore}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Affected Asset */}
          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-slate-900">Affected Asset</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Host</span>
                <span className="text-slate-900 font-mono">{vulnDetail.host}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Port</span>
                <span className="text-slate-900">{vulnDetail.port || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Discovered</span>
                <span className="text-slate-500">{new Date(vulnDetail.discoveredAt).toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Severity Info */}
          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-slate-900">Severity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${getSeverityBg(vulnDetail.severity)}`}>
                  <span className={`text-2xl font-bold ${getSeverityColor(vulnDetail.severity)}`}>
                    {vulnDetail.cvssScore || '?'}
                  </span>
                </div>
                <p className={`text-xs mt-1 font-semibold ${getSeverityColor(vulnDetail.severity)}`}>
                  {vulnDetail.severity.toUpperCase()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Related Vulnerabilities */}
          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-slate-900">Related on Same Host</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {relatedVulns.length > 0 ? (
                relatedVulns.map((v) => (
                  <div
                    key={v.id}
                    className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors"
                    onClick={() => navigate(`/dashboard/scans/${scanId}/results/${v.id}`)}
                  >
                    <p className="text-xs text-indigo-600 font-mono">{v.cveId || v.id}</p>
                    <p className="text-xs text-slate-500 truncate">{v.title}</p>
                    <SeverityChip severity={v.severity} size="sm" />
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500">No related vulnerabilities on this host</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
