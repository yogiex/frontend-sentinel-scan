/**
 * SentinelScan Reports Page
 * Path: src/pages/Dashboard/Reports/Reports.tsx
 *
 * MVP page to view and generate scan reports.
 */
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExportModal } from '@/components/export/ExportModal';
import type { ScanData } from '@/lib/export';
// Pagination imports removed - unused

// Mock report data
const reports = [
  {
    id: '1',
    title: 'Q1 2026 Network Assessment',
    type: 'basic',
    scanTarget: '192.168.1.0/24',
    generatedBy: 'admin',
    date: '2026-04-30',
    status: 'completed',
    vulnCount: 23,
    criticalCount: 3,
    highCount: 8,
    mediumCount: 9,
    lowCount: 3,
  },
  {
    id: '2',
    title: 'Web App Security Audit - example.com',
    type: 'web',
    scanTarget: 'example.com',
    generatedBy: 'john',
    date: '2026-05-01',
    status: 'completed',
    vulnCount: 15,
    criticalCount: 1,
    highCount: 4,
    mediumCount: 6,
    lowCount: 4,
  },
  {
    id: '3',
    title: 'Credentialed Patch Audit',
    type: 'credentialed',
    scanTarget: '10.0.0.0/24',
    generatedBy: 'sarah',
    date: '2026-05-01',
    status: 'generating',
    vulnCount: 0,
    criticalCount: 0,
    highCount: 0,
    mediumCount: 0,
    lowCount: 0,
  },
  {
    id: '4',
    title: 'PCI-DSS Compliance Report',
    type: 'compliance',
    scanTarget: '10.0.0.0/16',
    generatedBy: 'admin',
    date: '2026-04-28',
    status: 'completed',
    vulnCount: 45,
    criticalCount: 7,
    highCount: 12,
    mediumCount: 18,
    lowCount: 8,
  },
  {
    id: '5',
    title: 'Monthly Vulnerability Summary',
    type: 'basic',
    scanTarget: 'All Targets',
    generatedBy: 'admin',
    date: '2026-05-01',
    status: 'completed',
    vulnCount: 120,
    criticalCount: 15,
    highCount: 32,
    mediumCount: 48,
    lowCount: 25,
  },
];

const typeOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'basic', label: 'Basic Network' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'web', label: 'Web App' },
  { value: 'credentialed', label: 'Credentialed' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'discovery', label: 'Discovery' },
];

export function Reports() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [exportReport, setExportReport] = useState<typeof reports[0] | null>(null);
  // currentPage removed for MVP
//   const ITEMS_PER_PAGE = 10; // MVP: unused

  // Reset page when filters change
  useEffect(() => {
    
  }, [search, typeFilter]);

  const buildExportData = (report: typeof reports[0]): ScanData => ({
    id: report.id,
    target: report.scanTarget,
    status: report.status,
    scanType: report.type,
    profile: 'standard',
    owner: report.generatedBy,
    createdAt: report.date,
    duration: '—',
    summary: {
      totalVulns: report.vulnCount,
      critical: report.criticalCount,
      high: report.highCount,
      medium: report.mediumCount,
      low: report.lowCount,
      info: 0,
    },
    hosts: [],
    vulnerabilities: [],
  });

  const filtered = reports.filter((r) => {
    const matchSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.scanTarget.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || r.type === typeFilter;
    return matchSearch && matchType;
  });

  const totalVulns = reports.reduce((sum, r) => sum + r.vulnCount, 0);
  const totalCritical = reports.reduce((sum, r) => sum + r.criticalCount, 0);


  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Reports</h1>
          <p className="mt-1" style={{ color: 'var(--text-muted)' }}>View, generate, and export scan reports</p>
        </div>
        <Button className="" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>
          + Generate Report
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <CardContent className="p-4">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Reports</p>
            <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{reports.length}</p>
          </CardContent>
        </Card>
        <Card className="border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <CardContent className="p-4">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Vulnerabilities</p>
            <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{totalVulns}</p>
          </CardContent>
        </Card>
        <Card className="border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <CardContent className="p-4">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Critical Findings</p>
            <p className="text-2xl font-bold mt-1" style={{ color: 'var(--danger)' }}>{totalCritical}</p>
          </CardContent>
        </Card>
        <Card className="border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <CardContent className="p-4">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Completed</p>
            <p className="text-2xl font-bold mt-1" style={{ color: 'var(--success)' }}>
              {reports.filter(r => r.status === 'completed').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search reports..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border text-sm focus:outline-none"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)', '--tw-placeholder-opacity': 1 } as React.CSSProperties}
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border text-sm focus:outline-none"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
        >
          {typeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Reports List */}
      {filtered.length === 0 ? (
        <Card className="border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <CardContent className="py-12 text-center">
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>No reports found</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((report) => (
            <Card
              key={report.id}
              className="border transition-colors cursor-pointer"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border-light)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{report.title}</h3>
                      <span className="px-2 py-0.5 rounded-md text-xs border" style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', borderColor: 'rgba(59, 130, 246, 0.3)' }}>
                        {report.type}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: report.status === 'completed' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)', color: report.status === 'completed' ? 'var(--success)' : 'var(--primary)' }}>
                        {report.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-6 text-sm" style={{ color: 'var(--text-muted)' }}>
                      <span>Target: <span style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{report.scanTarget}</span></span>
                      <span>By: {report.generatedBy}</span>
                      <span>{report.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 ml-6">
                    {report.status === 'completed' && (
                      <>
                        <div className="text-right">
                          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Vulnerabilities</p>
                          <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{report.vulnCount}</p>
                        </div>
                        <div className="flex gap-1">
                          {report.criticalCount > 0 && (
                            <Badge className="text-xs" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)' }}>
                              {report.criticalCount}C
                            </Badge>
                          )}
                          {report.highCount > 0 && (
                            <Badge className="text-xs" style={{ backgroundColor: 'rgba(249, 115, 22, 0.2)', color: '#fb923c' }}>
                              {report.highCount}H
                            </Badge>
                          )}
                          {report.mediumCount > 0 && (
                            <Badge className="text-xs" style={{ backgroundColor: 'rgba(234, 179, 8, 0.2)', color: '#facc15' }}>
                              {report.mediumCount}M
                            </Badge>
                          )}
                          {report.lowCount > 0 && (
                            <Badge className="text-xs" style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' }}>
                              {report.lowCount}L
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="h-8 text-xs" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                          >
                            View
                          </Button>
                          <Button variant="outline" size="sm" className="h-8 text-xs" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }} onClick={() => setExportReport(report)}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                          >
                             Export
                          </Button>
                        </div>
                      </>
                    )}
                    {report.status === 'generating' && (
                      <div className="flex items-center gap-2" style={{ color: 'var(--primary)' }}>
                        <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
                        <span className="text-sm">Generating...</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Export Modal */}
      {exportReport && (
        <ExportModal data={buildExportData(exportReport)} onClose={() => setExportReport(null)} />
      )}
    </div>
  );
}
