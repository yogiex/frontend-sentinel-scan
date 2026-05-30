/**
 * SentinelScan Dashboard Index Page
 * Path: src/pages/Dashboard/Index.tsx
 *
 * Modern vulnerability scanner dashboard with CSS variable theming.
 * Consistent with Header component's design system.
 */
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CVECard, CVE } from '@/components/CVECard';
import { SeverityBadge } from '@/components/dashboard/SeverityBadge';
import {
  Monitor,
  Search,
  AlertTriangle,
  ShieldAlert,
  CheckCircle,
  CheckCircle2,
  Shield,
  Zap,
  Server,
  Play,
  Calendar,
  ChevronRight,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

/* ──────────────────────────────────────
   Mock Data
   ────────────────────────────────────── */
const securityPosture = {
  score: 72,
  grade: 'B' as const,
  trend: 'up' as const,
};

const scannerStatus = {
  online: true,
  enginesActive: 3,
  enginesTotal: 4,
  lastScanTime: '2 hours ago',
  queueLength: 2,
  engines: ['Nmap', 'OpenVAS', 'Nikto'],
};

const statsData = [
  { title: 'Total Assets', value: '1,234', change: '+12%', trend: 'up' as const, icon: Monitor },
  { title: 'Total Scans', value: '456', change: '+23 this week', trend: 'up' as const, icon: Search },
  { title: 'Vulnerabilities', value: '456', change: '-8%', trend: 'down' as const, icon: AlertTriangle },
  { title: 'Critical', value: '12', change: '+3 new', trend: 'down' as const, icon: ShieldAlert },
  { title: 'Resolved', value: '89', change: '+15%', trend: 'up' as const, icon: CheckCircle },
  { title: 'Compliance', value: '87%', change: '+5%', trend: 'up' as const, icon: Shield },
];

const activeScans = [
  { id: '1', target: '192.168.1.0/24', progress: 65, startedAt: '10:30 AM', estimatedRemaining: '15 min', type: 'Full Scan' },
  { id: '2', target: 'example.com', progress: 32, startedAt: '11:00 AM', estimatedRemaining: '28 min', type: 'Web Scan' },
];

const scanTrendData = [
  { day: 'Mon', scans: 12, vulnerabilities: 45 },
  { day: 'Tue', scans: 19, vulnerabilities: 62 },
  { day: 'Wed', scans: 15, vulnerabilities: 38 },
  { day: 'Thu', scans: 22, vulnerabilities: 71 },
];

const topCVEs: CVE[] = [
  { cveId: 'CVE-2024-3094', severity: 'critical', cvssScore: 10.0, affectedAssets: 23, description: 'XZ Utils backdoor in liblzma — remote code execution via SSH' },
  { cveId: 'CVE-2024-21762', severity: 'critical', cvssScore: 9.8, affectedAssets: 15, description: 'FortiOS SSL-VPN out-of-band write — arbitrary code execution' },
  { cveId: 'CVE-2024-1709', severity: 'high', cvssScore: 8.5, affectedAssets: 42, description: 'ConnectWise ScreenConnect authentication bypass' },
  { cveId: 'CVE-2024-20767', severity: 'high', cvssScore: 8.2, affectedAssets: 8, description: 'Adobe ColdFusion RCE via deserialization' },
  { cveId: 'CVE-2024-23897', severity: 'high', cvssScore: 7.8, affectedAssets: 31, description: 'Jenkins arbitrary file read via CLI' },
];

const assetCategories = [
  { name: 'Servers', count: 45, pct: 10, color: 'var(--primary)' },
  { name: 'Endpoints', count: 234, pct: 54, color: 'var(--success)' },
  { name: 'Network', count: 12, pct: 3, color: 'var(--warning)' },
  { name: 'Cloud', count: 89, pct: 20, color: 'var(--primary)' },
  { name: 'Containers', count: 56, pct: 13, color: 'var(--danger)' },
];

const complianceFrameworks = [
  { name: 'PCI-DSS', score: 92, status: 'pass', total: 250, passed: 230 },
  { name: 'HIPAA', score: 78, status: 'partial', total: 180, passed: 140 },
  { name: 'CIS Benchmarks', score: 85, status: 'partial', total: 320, passed: 272 },
];

const recentScans = [
  { id: '1', target: '192.168.1.0/24', status: 'completed', vulns: 23, severity: 'high', duration: '45 min', date: '2026-05-01' },
  { id: '2', target: 'example.com', status: 'running', vulns: 0, severity: 'medium', duration: '—', date: '2026-05-01' },
  { id: '3', target: '10.0.0.1', status: 'completed', vulns: 8, severity: 'low', duration: '22 min', date: '2026-04-30' },
  { id: '4', target: 'api.example.com', status: 'failed', vulns: 0, severity: 'high', duration: '—', date: '2026-04-30' },
  { id: '5', target: '172.16.0.0/16', status: 'completed', vulns: 45, severity: 'critical', duration: '1h 12min', date: '2026-04-29' },
];

/* ──────────────────────────────────────
   Helper Components
   ────────────────────────────────────── */

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; text: string; border: string }> = {
    completed: { label: 'Completed', bg: 'rgba(16, 185, 129, 0.1)', text: 'var(--success)', border: 'var(--success)' },
    running: { label: 'Running', bg: 'rgba(59, 130, 246, 0.1)', text: 'var(--primary)', border: 'var(--primary)' },
    failed: { label: 'Failed', bg: 'rgba(239, 68, 68, 0.1)', text: 'var(--danger)', border: 'var(--danger)' },
  };
  const m = map[status] ?? map.failed;
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border" style={{ backgroundColor: m.bg, color: m.text, borderColor: m.border }}>
      {status === 'running' && <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--primary)' }} />}
      {m.label}
    </span>
  );
}

function TrendIndicator({ trend }: { trend: 'up' | 'down' }) {
  return trend === 'up'
    ? <ArrowUp className="h-3 w-3" style={{ color: 'var(--success)' }} />
    : <ArrowDown className="h-3 w-3" style={{ color: 'var(--danger)' }} />;
}

/* ──────────────────────────────────────
   Main Dashboard Component
   ────────────────────────────────────── */
export function DashboardIndex() {
  const [searchParams, setSearchParams] = useSearchParams();
  const showAllCVEs = searchParams.get('cves') === 'all';
  const navigate = useNavigate();

  return (
    <div className="space-y-6 pb-8">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Dashboard</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Vulnerability scanner overview and security posture</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/dashboard/scans/new')} style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }} className="shadow-sm hover:opacity-90">
            <Play className="h-4 w-4 mr-2" />
            New Scan
          </Button>
          <Button variant="outline" className="hover:bg-opacity-50" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
            <Calendar className="h-4 w-4 mr-2" />
            Schedule
          </Button>
        </div>
      </div>

      {/* ── Row 1: Security Posture + Scanner Status ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security Posture Card */}
        <Card className="shadow-sm" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Security Posture</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              {/* Gauge */}
              <div className="relative w-28 h-28">
                <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="var(--border)" strokeWidth="10" />
                  <circle cx="60" cy="60" r="52" fill="none" stroke="url(#gaugeGrad)" strokeWidth="10"
                    strokeDasharray={`${(72/100)*327} 327`} strokeLinecap="round" />
                  <defs>
                    <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="var(--danger)" />
                      <stop offset="50%" stopColor="var(--warning)" />
                      <stop offset="100%" stopColor="var(--success)" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{securityPosture.score}</span>
                  <span className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>Grade {securityPosture.grade}</span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <TrendIndicator trend={securityPosture.trend} />
                  <span className="text-sm font-medium" style={{ color: 'var(--success)' }}>Improving</span>
                </div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Your security posture has improved 5 points this month.</p>
                <Button variant="link" size="sm" className="p-0 h-auto mt-2 text-xs font-semibold" style={{ color: 'var(--primary)' }}>
                  View Report <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scanner Status Card */}
        <Card className="shadow-sm" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Scanner Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: scannerStatus.online ? 'var(--success)' : 'var(--text-muted)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {scannerStatus.online ? 'Online' : 'Offline'}
              </span>
              <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>
                Last scan {scannerStatus.lastScanTime}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                <span>Engines Active</span>
                <span className="font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>{scannerStatus.enginesActive}/{scannerStatus.enginesTotal}</span>
              </div>
              <div className="w-full rounded-full h-2" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <div className="h-2 rounded-full transition-all" style={{ width: `${(scannerStatus.enginesActive/scannerStatus.enginesTotal)*100}%`, backgroundColor: 'var(--primary)' }} />
              </div>
              <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                <span>Queue</span>
                <span className="font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>{scannerStatus.queueLength} scans</span>
              </div>
              <div className="flex gap-1.5 mt-3">
                {scannerStatus.engines.map((e) => (
                  <span key={e} className="text-[10px] px-2 py-0.5 rounded-md font-mono font-semibold" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>{e}</span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Row 2: Stats Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statsData.map((stat) => (
          <Card key={stat.title} className="shadow-sm" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
            <CardContent className="p-4">
              <stat.icon className="h-5 w-5 mb-2" style={{ color: 'var(--primary)' }} />
              <p className="text-[11px] uppercase tracking-wider font-medium mb-1" style={{ color: 'var(--text-muted)' }}>{stat.title}</p>
              <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
              <p className={`text-[11px] mt-1 font-medium flex items-center gap-1`} style={{ color: stat.trend === 'up' ? 'var(--success)' : 'var(--danger)' }}>
                <TrendIndicator trend={stat.trend} />
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Row 3: Active Scans + Scan Trend ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Scans */}
        <Card className="shadow-sm" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Active Scans</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeScans.map((scan) => (
              <div key={scan.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{scan.target}</span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{scan.type}</span>
                </div>
                <div className="w-full rounded-full h-2" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <div className="h-2 rounded-full transition-all" style={{ width: `${scan.progress}%`, backgroundColor: 'var(--primary)' }} />
                </div>
                <div className="flex justify-between text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  <span>{scan.startedAt}</span>
                  <span>{scan.progress}% — {scan.estimatedRemaining} left</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Artistic Scan Trend Line Chart */}
        <Card className="shadow-sm" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold" style={{ color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif' }}>Scan Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-56 p-4">
              <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="xMidYMid meet">
                <defs>
                  {/* Artistic gradients with more opacity */}
                  <linearGradient id="vulnGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.01" />
                  </linearGradient>
                  <linearGradient id="scanGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.01" />
                  </linearGradient>
                  {/* Glow filters for artistic effect */}
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>

                {(() => {
                  const maxVuln = Math.max(...scanTrendData.map(d => d.vulnerabilities));
                  const maxScan = Math.max(...scanTrendData.map(d => d.scans));
                  const chartWidth = 400;
                  const chartHeight = 140;
                  const startX = 50;
                  const startY = 20;
                  const padding = 20;

                  // Calculate smooth points with cubic bezier
                  const vulnPoints = scanTrendData.map((d, i) => ({
                    x: startX + (i / (scanTrendData.length - 1)) * chartWidth,
                    y: startY + chartHeight - (d.vulnerabilities / maxVuln) * chartHeight,
                  }));

                  const scanPoints = scanTrendData.map((d, i) => ({
                    x: startX + (i / (scanTrendData.length - 1)) * chartWidth,
                    y: startY + chartHeight - (d.scans / maxScan) * chartHeight,
                  }));

                  // Create smooth cubic bezier paths
                  const createSmoothPath = (points: {x: number, y: number}[]) => {
                    if (points.length < 2) return '';
                    let path = `M ${points[0].x} ${points[0].y}`;
                    
                    for (let i = 1; i < points.length; i++) {
                      const prev = points[i - 1];
                      const curr = points[i];
                      const cpx1 = prev.x + (curr.x - prev.x) * 0.4;
                      const cpy1 = prev.y;
                      const cpx2 = curr.x - (curr.x - prev.x) * 0.4;
                      const cpy2 = curr.y;
                      
                      path += ` C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${curr.x} ${curr.y}`;
                    }
                    
                    return path;
                  };

                  const vulnPath = createSmoothPath(vulnPoints);
                  const scanPath = createSmoothPath(scanPoints);

                  // Area paths (close to bottom)
                  const vulnArea = `${vulnPath} L ${vulnPoints[vulnPoints.length - 1].x} ${startY + chartHeight + padding} L ${vulnPoints[0].x} ${startY + chartHeight + padding} Z`;
                  const scanArea = `${scanPath} L ${scanPoints[scanPoints.length - 1].x} ${startY + chartHeight + padding} L ${scanPoints[0].x} ${startY + chartHeight + padding} Z`;

                  return (
                    <g>
                      {/* Subtle area fills */}
                      <path d={vulnArea} fill="url(#vulnGrad)" opacity="0.8" />
                      <path d={scanArea} fill="url(#scanGrad)" opacity="0.8" />

                      {/* Smooth curved lines with artistic stroke */}
                      <path 
                        d={vulnPath} 
                        fill="none" 
                        stroke="#4f46e5" 
                        strokeWidth="2.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        filter="url(#glow)"
                        opacity="0.9"
                      />
                      <path 
                        d={scanPath} 
                        fill="none" 
                        stroke="#10b981" 
                        strokeWidth="2.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        filter="url(#glow)"
                        opacity="0.9"
                      />

                      {/* Elegant data points with gradient rings */}
                      {vulnPoints.map((p, i) => (
                        <g key={`vuln-${i}`}>
                          <circle 
                            cx={p.x} 
                            cy={p.y} 
                            r="5" 
                            fill="white" 
                            stroke="#4f46e5" 
                            strokeWidth="2.5"
                            className="hover:r-6 transition-all cursor-pointer"
                            style={{ filter: 'url(#glow)' }}
                          >
                            <title>{scanTrendData[i].day}: {scanTrendData[i].vulnerabilities} vulnerabilities</title>
                          </circle>
                          <circle 
                            cx={p.x} 
                            cy={p.y} 
                            r="2" 
                            fill="#4f46e5"
                          />
                        </g>
                      ))}
                      {scanPoints.map((p, i) => (
                        <g key={`scan-${i}`}>
                          <circle 
                            cx={p.x} 
                            cy={p.y} 
                            r="5" 
                            fill="white" 
                            stroke="#10b981" 
                            strokeWidth="2.5"
                            className="hover:r-6 transition-all cursor-pointer"
                            style={{ filter: 'url(#glow)' }}
                          >
                            <title>{scanTrendData[i].day}: {scanTrendData[i].scans} scans</title>
                          </circle>
                          <circle 
                            cx={p.x} 
                            cy={p.y} 
                            r="2" 
                            fill="#10b981"
                          />
                        </g>
                      ))}

                      {/* X-axis labels with Outfit font */}
                      {scanTrendData.map((d, i) => (
                        <text
                          key={d.day}
                          x={startX + (i / (scanTrendData.length - 1)) * chartWidth}
                          y={startY + chartHeight + padding + 20}
                          textAnchor="middle"
                          className="text-[11px]"
                          style={{ fill: 'var(--text-muted)', fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}
                        >
                          {d.day}
                        </text>
                      ))}

                      {/* Minimalist Y-axis hints (no grid lines) */}
                  <text x={startX - 10} y={startY + 5} textAnchor="end" className="text-[9px]" style={{ fill: 'var(--text-muted)', fontFamily: 'Outfit, sans-serif', opacity: 0.5 }}>High</text>
                  <text x={startX - 10} y={startY + chartHeight + 5} textAnchor="end" className="text-[9px]" style={{ fill: 'var(--text-muted)', fontFamily: 'Outfit, sans-serif', opacity: 0.5 }}>Low</text>
                    </g>
                  );
                })()}
              </svg>
            </div>

            {/* Elegant Legend with Outfit font */}
            <div className="flex justify-center gap-8 mt-2 text-xs">
              <div className="flex items-center gap-2">
                <svg width="24" height="2" viewBox="0 0 24 2">
                  <line x1="0" y1="1" x2="24" y2="1" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                <span style={{ color: 'var(--text-secondary)', fontFamily: 'Outfit, sans-serif' }}>Vulnerabilities</span>
              </div>
              <div className="flex items-center gap-2">
                <svg width="24" height="2" viewBox="0 0 24 2">
                  <line x1="0" y1="1" x2="24" y2="1" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                <span style={{ color: 'var(--text-secondary)', fontFamily: 'Outfit, sans-serif' }}>Scans</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Row 4: Top CVEs + Asset Breakdown + Compliance ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Artistic Top CVEs */}
        <Card className="shadow-sm" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold text-balance" style={{ color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif' }}>Top CVEs</CardTitle>
            <Button variant="ghost" size="sm" className="text-xs hover:bg-opacity-10" style={{ color: 'var(--primary)' }} onClick={() => {
                const newParams = new URLSearchParams(searchParams);
                if (showAllCVEs) {
                  newParams.delete('cves');
                } else {
                  newParams.set('cves', 'all');
                }
                setSearchParams(newParams, { replace: true });
              }}>
              {showAllCVEs ? 'Show Less' : 'View All'}
            </Button>
          </CardHeader>
          <CardContent className="space-y-3 p-4">
            {(showAllCVEs ? topCVEs : topCVEs.slice(0, 3)).map((cve) => (
              <CVECard
                key={cve.cveId}
                cve={cve}
                onClick={() => navigate(`/dashboard/cves/${cve.cveId}`)}
              />
            ))}
          </CardContent>
        </Card>

        {/* Artistic Asset Breakdown */}
        <Card className="shadow-sm" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold" style={{ color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif' }}>Asset Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Total count with artistic typography */}
              <div className="text-center pb-2" style={{ borderBottom: '1px solid var(--border)' }}>
                <span className="text-5xl font-bold leading-none" style={{ color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>
                  {assetCategories.reduce((s,c)=>s+c.count,0)}
                </span>
                <p className="text-[10px] mt-1 uppercase tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: 'Outfit, sans-serif' }}>Total Assets</p>
              </div>

              {/* Artistic horizontal bars with gradient */}
              <div className="space-y-3">
                {assetCategories.map((cat) => {
                  const maxCount = Math.max(...assetCategories.map(c => c.count));
                  const barWidth = (cat.count / maxCount) * 100;
                  
                  return (
                    <div key={cat.name} className="group cursor-pointer">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span 
                            className="w-2.5 h-2.5 rounded-md transform group-hover:rotate-45 transition-transform duration-300" 
                            style={{ backgroundColor: cat.color }}
                          />
                          <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)', fontFamily: 'Outfit, sans-serif' }}>
                            {cat.name}
                          </span>
                        </div>
                        <span className="text-sm font-bold" style={{ color: cat.color, fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
                          {cat.count}
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                        <div 
                          className="h-full rounded-full transition-all duration-700 ease-out group-hover:opacity-80"
                          style={{ 
                            width: `${barWidth}%`,
                            background: `linear-gradient(90deg, ${cat.color}20, ${cat.color})`,
                            boxShadow: `0 0 8px ${cat.color}30`
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Minimalist legend hint */}
              <div className="pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                <p className="text-[9px] uppercase tracking-widest text-center" style={{ color: 'var(--text-muted)', fontFamily: 'Outfit, sans-serif' }}>
                  Hover bars for details
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compliance Scores */}
        <Card className="shadow-sm" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Compliance Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {complianceFrameworks.map((fw) => (
              <div key={fw.name} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{fw.name}</span>
                  <span className="font-bold" style={{ color: fw.status === 'pass' ? 'var(--success)' : 'var(--warning)' }}>{fw.score}%</span>
                </div>
                <div className="w-full rounded-full h-2" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <div className="h-2 rounded-full" style={{ width: `${fw.score}%`, backgroundColor: fw.status === 'pass' ? 'var(--success)' : 'var(--warning)' }} />
                </div>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  {fw.passed}/{fw.total} controls passed
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ── Row 5: Recent Scans Table ── */}
      <Card className="shadow-sm" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Scans</CardTitle>
          <Button variant="outline" size="sm" className="text-xs hover:bg-opacity-50" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
            View All Scans
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottomColor: 'var(--border)', borderBottomWidth: '1px' }}>
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Target</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Status</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Vulns</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Severity</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Duration</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentScans.map((scan) => (
                  <tr key={scan.id} className="transition-colors hover:bg-opacity-50" style={{ borderBottomColor: 'var(--border)', borderBottomWidth: '1px' }}>
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{scan.target}</span>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={scan.status} />
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{scan.vulns}</span>
                      {scan.vulns > 20 && <span className="text-xs ml-1" style={{ color: 'var(--danger)' }}>↑ High</span>}
                    </td>
                    <td className="py-3 px-4">
                      <SeverityBadge severity={scan.severity as any} />
                    </td>
                    <td className="py-3 px-4 text-xs" style={{ color: 'var(--text-muted)' }}>{scan.duration}</td>
                    <td className="py-3 px-4 text-xs" style={{ color: 'var(--text-muted)' }}>{scan.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
        </Card>

        {/* ── Feature Showcase: What Sentinel Scan Will Do ── */}
        <div className="mt-8 space-y-4">
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Sentinel Scan Capabilities</h2>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
              Professional vulnerability assessment platform - MVP showcasing upcoming features
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Core Scanning */}
            <Card className="shadow-sm border-2 border-indigo-100" style={{ backgroundColor: 'var(--bg-card)' }}>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2" style={{ color: 'var(--primary)' }}>
                  <Shield className="w-5 h-5" />
                  AI-Agentic Scanning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Adaptive AI that breaks traditional scan patterns. Features real-time reasoning,
                  randomized attack order, and human-like behavior mimicry.
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {['Adaptive Payloads', 'Randomized Order', 'ML Reasoning'].map((f) => (
                    <span key={f} className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {f}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Vulnerability Management */}
            <Card className="shadow-sm" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <AlertTriangle className="w-5 h-5" />
                  CVE Database Integration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Real-time sync with NVD, MITRE CVE, and Exploit-DB.
                  Includes CVSS scoring, patch availability, and exploit verification.
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {['NVD API', 'CVSS v3.1', 'Exploit-DB'].map((f) => (
                    <span key={f} className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                      {f}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Reporting */}
            <Card className="shadow-sm" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <CheckCircle2 className="w-5 h-5" />
                  Professional Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Executive summaries, technical reports, and compliance documentation.
                  Export to PDF, HTML, CSV, and integrate with Jira/ServiceNow.
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {['PDF Export', 'PCI-DSS', 'OWASP Top 10'].map((f) => (
                    <span key={f} className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                      {f}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Remediation */}
            <Card className="shadow-sm" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Zap className="w-5 h-5" />
                  Remediation Workflow
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Actionable findings with step-by-step remediation guides.
                  Auto-generate tickets in Jira, track patch status, and verify fixes.
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {['Step-by-Step Fix', 'Jira Integration', 'Patch Tracking'].map((f) => (
                    <span key={f} className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                      {f}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Scheduling & Automation */}
            <Card className="shadow-sm" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Calendar className="w-5 h-5" />
                  Scheduled Scanning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Recurring scans with cron-like scheduling. Multi-target support,
                  asset grouping, and environment tagging (prod/staging/dev).
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {['Cron Scheduling', 'Asset Tags', 'Multi-Target'].map((f) => (
                    <span key={f} className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                      {f}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Integrations */}
            <Card className="shadow-sm" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Server className="w-5 h-5" />
                  Enterprise Integrations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  REST API, webhooks, SIEM integration (Splunk, QRadar),
                  and SSO authentication (SAML, OIDC, LDAP).
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {['REST API', 'Splunk', 'SAML SSO'].map((f) => (
                    <span key={f} className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                      {f}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }
