/**
 * SentinelScan Scan Progress Page - Nessus Professional Style
 * Path: src/pages/Dashboard/Scans/ScanProgress.tsx
 *
 * Redesigned to match Nessus Professional layout:
 * - Horizontal progress bar with per-phase tracking
 * - Structured log table with timestamps and plugin IDs
 * - Statistics sidebar with severity counts
 * - Time estimation (elapsed + ETA)
 * - Host discovery counter
 */
import { useParams, useNavigate } from 'react-router-dom';
import { scanStore, Scan, ScanStatus } from '@/lib/scan-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Shield,
  Clock,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Play,
  Pause,
  Square,
  Eye,
  Server,
  Cog,
} from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';


// ─── Phase Definitions (Nessus-style) ─────────────────────────────
const PHASES: { key: ScanStatus; label: string; icon: typeof Shield; progressRange: [number, number] }[] = [
  { key: 'queued', label: 'Queued', icon: Clock, progressRange: [0, 5] },
  { key: 'host-discovery', label: 'Host Discovery', icon: Server, progressRange: [5, 15] },
  { key: 'port-scanning', label: 'Port Scanning', icon: Target, progressRange: [15, 30] },
  { key: 'service-detection', label: 'Service Detection', icon: Zap, progressRange: [30, 45] },
  { key: 'vuln-scanning', label: 'Vulnerability Scanning', icon: Shield, progressRange: [45, 90] },
  { key: 'report-generation', label: 'Report Generation', icon: AlertTriangle, progressRange: [90, 100] },
  { key: 'completed', label: 'Complete', icon: CheckCircle2, progressRange: [100, 100] },
];

const PHASE_ORDER = PHASES.map((p) => p.key);

function getPhaseIndex(status: ScanStatus): number {
  return PHASE_ORDER.indexOf(status);
}

// ─── Status Badge Color ──────────────────────────────────────────
function statusColor(status: ScanStatus): string {
  const map: Record<ScanStatus, string> = {
    queued: 'bg-[var(--warning)/20] text-[var(--warning)] border-[var(--warning)/30]',
    'host-discovery': 'bg-[var(--primary)/20] text-[var(--primary)] border-[var(--primary)/30]',
    'port-scanning': 'bg-[var(--primary)/20] text-[var(--primary)] border-[var(--primary)/30]',
    'service-detection': 'bg-[var(--primary)/20] text-[var(--primary)] border-[var(--primary)/30]',
    'vuln-scanning': 'bg-[var(--success)/20] text-[var(--success)] border-[var(--success)/30]',
    'report-generation': 'bg-[var(--success)/20] text-[var(--success)] border-[var(--success)/30]',
    completed: 'bg-[var(--success)/20] text-[var(--success)] border-[var(--success)/30]',
    failed: 'bg-[var(--danger)/20] text-[var(--danger)] border-[var(--danger)/30]',
    cancelled: 'bg-[var(--warning)/20] text-[var(--warning)] border-[var(--warning)/30]',
    aborted: 'bg-[var(--danger)/20] text-[var(--danger)] border-[var(--danger)/30]',
  };
  return map[status] || '';
}

// ─── Log Entry Parser ─────────────────────────────────────────────
interface LogEntry {
  raw: string;
  timestamp: string;
  type: "info" | "found" | "vuln" | "error" | "ai-agent";
  pluginId?: string;
  message: string;
  reasoning?: string;
}

function parseLogEntry(raw: string): LogEntry {
  // Format: + [HH:MM:SS] Plugin XXXXX: Message
  const match = raw.match(/^(\+|!|x)\s\[(\d{2}:\d{2}:\d{2})\]\s(?:Plugin\s(\d+):\s)?(.+)$/);
  if (match) {
    const [, symbol, timestamp, pluginId, message] = match;
    let type: "info" | "found" | "vuln" | "error" | "ai-agent" = 'info';
    if (symbol === '!') type = 'vuln';
    else if (symbol === 'x') type = 'error';
    else if (message?.includes('Host') && message?.includes('is')) type = 'found';
    
    return { raw, timestamp, type, pluginId, message: message || raw };
  }
  return { raw, timestamp: '', type: 'info', message: raw };
}

// ─── Severity Summary ────────────────────────────────────────────
function severitySummary(findings: Scan['findings']) {
  const counts = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  findings.forEach((f) => {
    if (counts[f.severity as keyof typeof counts] !== undefined) {
      counts[f.severity as keyof typeof counts]++;
    }
  });
  return counts;
}

// ─── Time Estimation ─────────────────────────────────────────────
function useTimeEstimation(scan: Scan | null) {
  const [elapsed, setElapsed] = useState(0);
  const [eta, setEta] = useState<number | null>(null);

  useEffect(() => {
    if (!scan || scan.status === 'completed' || scan.status === 'failed') return;
    
    const start = scan.startedAt ? new Date(scan.startedAt).getTime() : Date.now();
    
    const interval = setInterval(() => {
      const currentElapsed = Math.floor((Date.now() - start) / 1000);
      setElapsed(currentElapsed);
      
      // Estimate remaining time based on progress
      if (scan.progress > 5) {
        const rate = currentElapsed / scan.progress;
        const remaining = Math.floor(rate * (100 - scan.progress));
        setEta(remaining);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [scan?.status, scan?.startedAt, scan?.progress]);

  return { elapsed, eta };
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ─── Main Component ──────────────────────────────────────────────
export function ScanProgress() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [scan, setScan] = useState<Scan | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showStopDialog, setShowStopDialog] = useState(false);
  const logEndRef = useRef<HTMLTableDataCellElement>(null);


  const simulationRef = useRef(false);

  // Load scan
  useEffect(() => {
    if (!id) return;
    const s = scanStore.getScan(id);
    if (s) setScan(s);
  }, [id]);

  // Subscribe to store updates
  useEffect(() => {
    if (!id) return;
    const unsub = scanStore.subscribe(() => {
      const s = scanStore.getScan(id!);
      if (s) setScan(s);
    });
    return unsub;
  }, [id]);

  // Time estimation
  const { elapsed, eta } = useTimeEstimation(scan);



  // Auto-scroll logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [scan?.logs?.length]);

  // Start simulation
  const startSimulation = useCallback(async () => {
    if (!id || !scan || isSimulating) return;
    if (scan.status === 'completed' || scan.status === 'failed') return;

    simulationRef.current = true;
    setIsSimulating(true);
    try {
      await scanStore.simulateScan(id, (updated) => {
        setScan({ ...updated });
      });
    } finally {
      simulationRef.current = false;
      setIsSimulating(false);
    }
  }, [id, scan, isSimulating]);

  useEffect(() => {
    if (scan && scan.status === 'queued' && !isSimulating) {
      startSimulation();
    }
  }, [scan?.id, scan?.status]);

  // Auto-redirect on complete
  useEffect(() => {
    if (scan?.status === 'completed' && id) {
      const timer = setTimeout(() => {
        navigate(`/dashboard/scans/${id}`, { replace: true });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [scan?.status, id, navigate]);

  const handleStop = () => {
    setShowStopDialog(true);
  };

  const confirmStop = () => {
    if (!id) return;
    scanStore.updateScan(id, { status: 'failed', errorMessage: 'Scan stopped by user' });
    setIsSimulating(false);
    simulationRef.current = false;
    setShowStopDialog(false);
  };

  // ─── Not Found ────────────────────────────────────────────────
  if (!scan) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Shield className="w-12 h-12 mx-auto text-[var(--text-secondary)]" />
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Scan Not Found</h2>
          <Button variant="outline" onClick={() => navigate('/dashboard/scans/all')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Scans
          </Button>
        </div>
      </div>
    );
  }

  const isDone = scan.status === 'completed' || scan.status === 'failed';
  const sev = severitySummary(scan.findings);
  const currentPhaseIndex = getPhaseIndex(scan.status);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="mx-auto px-6 py-6 space-y-6">
        {/* ─── Header ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border)]"
              onClick={() => navigate(-1)}
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-[var(--success)/10] border border-[var(--success)/20]">
                <Shield className="w-4 h-4 text-[var(--success)]" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">Scan Progress</h1>
                <p className="text-xs text-[var(--text-secondary)] font-mono">{scan.target}</p>
              </div>
            {scan.scanType === 'ai-agentic' && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-purple-50 border border-purple-200">
                <div className={`w-2 h-2 rounded-full bg-purple-500 ${isSimulating ? 'animate-pulse' : ''}`} />
                <span className="text-[10px] font-semibold text-purple-700 uppercase tracking-wider">AI-Agentic</span>
              </div>
            )}

            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className={`border ${statusColor(scan.status)}`}>
              {isSimulating && !isPaused && (
                <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
              )}
              {scan.status.charAt(0).toUpperCase() + scan.status.slice(1).replace('-', ' ')}
            </Badge>

            <div className="flex items-center gap-1.5 text-[var(--text-secondary)] text-sm font-mono">
              <Clock className="w-3.5 h-3.5" />
              {formatTime(elapsed)}
              {eta && (
                <>
                  <span className="text-[var(--text-secondary)/50]">|</span>
                  ~{formatTime(eta)} remaining
                </>
              )}
            </div>

            {!isDone && (
              <div className="flex gap-1.5 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[var(--text-secondary)] hover:text-[var(--warning)] hover:bg-[var(--border)] h-8 w-8 p-0"
                  onClick={() => setIsPaused(!isPaused)}
                  aria-label={isPaused ? 'Resume scan' : 'Pause scan'}
                >
                  {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[var(--text-secondary)] hover:text-[var(--danger)] hover:bg-[var(--border)] h-8 w-8 p-0"
                  onClick={handleStop}
                  aria-label="Stop scan"
                >
                  <Square className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}

            {isDone && (
              <Button
                size="sm"
                className="bg-[var(--success)] hover:bg-[var(--success)/90] text-[var(--text-primary)] h-8 ml-2"
                onClick={() => navigate(`/dashboard/scans/${id}`)}
                aria-label="View scan results"
              >
                <Eye className="w-3.5 h-3.5 mr-1.5" />
                View Results
              </Button>
            )}
          </div>
        </div>

        {/* ─── Progress Bar (Nessus-style horizontal) ─────────── */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-5 space-y-4">
          {/* Overall Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[var(--text-primary)]">
                Overall Progress
              </span>
              <span className="text-sm font-mono text-[var(--text-secondary)]">
                {Math.round(scan.progress)}%
              </span>
            </div>
            <div className="w-full h-3 bg-[var(--border)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--primary)] rounded-full transition-[width] duration-700"
                style={{ width: `${scan.progress}%` }}
              />
            </div>
          </div>

          {/* Per-Phase Progress */}
          <div className="space-y-2">
            {PHASES.filter(p => p.key !== 'completed').map((phase, idx) => {
              const isDone = idx < currentPhaseIndex || scan.status === 'completed';
              const isCurrent = phase.key === scan.status && scan.status !== 'completed';
              
              const Icon = phase.icon;
              const phaseProgress = isDone ? 100 : isCurrent ? 
                Math.floor(((scan.progress - phase.progressRange[0]) / (phase.progressRange[1] - phase.progressRange[0])) * 100) : 0;
              
              return (
                <div key={phase.key} className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-[colors,transform] duration-500 ${
                      isDone
                        ? 'bg-[var(--success)/20] text-[var(--success)]'
                        : isCurrent
                          ? 'bg-[var(--primary)/20] text-[var(--primary)] animate-pulse'
                          : 'bg-[var(--border)] text-[var(--text-secondary)]'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <Icon className="w-3 h-3" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-xs font-medium ${
                          isDone ? 'text-[var(--success)]' : isCurrent ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)]'
                        }`}
                      >
                        {phase.label}
                      </span>
                      {isCurrent && (
                        <span className="text-xs font-mono text-[var(--text-secondary)]">
                          {phaseProgress}%
                        </span>
                      )}
                    </div>
                    {isCurrent && (
                      <div className="w-full h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[var(--primary)] rounded-full transition-[width] duration-500"
                          style={{ width: `${phaseProgress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Host Counter */}
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] font-mono pt-2 border-t border-[var(--border)]">
            <Server className="w-3.5 h-3.5" />
            <span>
              Hosts: <span className="text-[var(--text-primary)] font-semibold">{scan.hosts.filter(h => h.status === 'up').length}</span> / {scan.hosts.length} scanned
            </span>
          </div>
        </div>

        {/* ─── Main Content Grid ──────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ─── Left: Structured Log (8 cols) ────────────────── */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg overflow-hidden">
              {/* Log Header */}
              <div className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-primary)] border-b border-[var(--border)]">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[var(--danger)/60]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[var(--warning)/60]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[var(--success)/60]" />
                </div>
                <span className="text-xs text-[var(--text-secondary)] font-mono ml-2">
                  scan-log — {scan.id}
                </span>
                <div className="ml-auto flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-mono">
                  <Cog className="w-3 h-3" />
                  Live Output
                </div>
              </div>

              {/* Log Table */}
              <div className="overflow-y-auto" style={{ height: '420px' }}>
                {scan.logs.length === 0 ? (
                  <div className="flex items-center gap-2 text-[var(--text-secondary)] p-4">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="font-mono text-xs">Waiting for scan engine...</span>
                  </div>
                ) : (
                  <table className="w-full text-xs font-mono">
                    <thead className="sticky top-0 bg-[var(--bg-surface)] border-b border-[var(--border)]">
                      <tr>
                        <th className="text-left p-2 w-20 text-[var(--text-secondary)]">Time</th>
                        <th className="text-left p-2 w-16 text-[var(--text-secondary)]">Type</th>
                        <th className="text-left p-2 text-[var(--text-secondary)]">Message</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scan.logs.map((log, i) => {
                        const entry = parseLogEntry(log);
                        const typeColor = entry.type === 'vuln' ? 'text-[var(--danger)]' :
                                          entry.type === 'error' ? 'text-[var(--danger)]' :
                                          entry.type === 'found' ? 'text-[var(--success)]' :
                                          'text-[var(--text-secondary)]';
                        
                        return (
                          <tr key={i} className="border-b border-[var(--border)/50] hover:bg-[var(--border)/30] transition-colors">
                            <td className="p-2 text-[var(--text-secondary)] whitespace-nowrap">{entry.timestamp}</td>
                            <td className={`p-2 font-semibold ${typeColor}`}>
                              {entry.pluginId ? `Plugin ${entry.pluginId}` : entry.type.toUpperCase()}
                            </td>
                            <td className="p-2 text-[var(--text-primary)] break-all">{entry.message}</td>
                          </tr>
                        );
                      })}
                      <tr>
                        <td colSpan={3} ref={logEndRef} />
                      </tr>
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Hosts', value: scan.hosts.filter(h => h.status === 'up').length.toString(), color: 'text-[var(--primary)]' },
                { label: 'Findings', value: scan.findings.length.toString(), color: 'text-[var(--warning)]' },
                { label: 'Critical', value: sev.critical.toString(), color: 'text-[var(--danger)]' },
                { label: 'Progress', value: `${Math.round(scan.progress)}%`, color: 'text-[var(--success)]' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg px-4 py-3 text-center"
                >
                  <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                    {stat.label}
                  </p>
                  <p className={`text-xl font-bold font-mono ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ─── Right: Statistics Sidebar (4 cols) ────────── */}
          <div className="lg:col-span-4 space-y-4">
            {/* Severity Breakdown */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-5">
              <h3 className="text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-3 font-semibold flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5" />
                Severity Breakdown
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Critical', count: sev.critical, color: 'bg-[var(--danger)]', text: 'text-[var(--danger)]' },
                  { label: 'High', count: sev.high, color: 'bg-[var(--warning)]', text: 'text-[var(--warning)]' },
                  { label: 'Medium', count: sev.medium, color: 'bg-[var(--warning)/80]', text: 'text-[var(--warning)]' },
                  { label: 'Low', count: sev.low, color: 'bg-[var(--primary)]', text: 'text-[var(--primary)]' },
                  { label: 'Info', count: sev.info, color: 'bg-[var(--text-secondary)]', text: 'text-[var(--text-secondary)]' },
                ].map((s) => {
                  const total = scan.findings.length || 1;
                  const pct = (s.count / total) * 100;
                  return (
                    <div key={s.label} className="flex items-center gap-3">
                      <span className={`text-xs w-16 font-mono ${s.text}`}>{s.label}</span>
                      <div className="flex-1 h-2 bg-[var(--border)] rounded-full overflow-hidden">
                        <div
                          className={`h-full ${s.color} rounded-full transition-[width] duration-500`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className={`text-xs font-mono w-6 text-right ${s.text}`}>
                        {s.count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Latest Findings */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-5">
              <h3 className="text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-3 font-semibold flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" />
                Latest Findings
              </h3>
              {scan.findings.length === 0 ? (
                <p className="text-xs text-[var(--text-secondary)] font-mono">No findings yet...</p>
              ) : (
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {[...scan.findings].reverse().slice(0, 8).map((f) => {
                    const sevColor: Record<string, string> = {
                      critical: 'text-[var(--danger)] bg-[var(--danger)/10] border-[var(--danger)/20]',
                      high: 'text-[var(--warning)] bg-[var(--warning)/10] border-[var(--warning)/20]',
                      medium: 'text-[var(--warning)] bg-[var(--warning)/10] border-[var(--warning)/20]',
                      low: 'text-[var(--primary)] bg-[var(--primary)/10] border-[var(--primary)/20]',
                      info: 'text-[var(--text-secondary)] bg-[var(--text-secondary)/10] border-[var(--text-secondary)/20]',
                    };
                    return (
                      <div
                        key={f.id}
                        className={`border rounded-lg px-3 py-2 ${sevColor[f.severity] || sevColor.info}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold truncate flex-1 mr-2">
                            {f.title}
                          </span>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-md bg-[var(--bg-surface)]/30">
                            {f.severity}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-[10px] opacity-70 font-mono">
                          <span>{f.host}{f.port ? `:${f.port}` : ''}</span>
                          {f.cveId && <span>{f.cveId}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── Auto-redirect notice ────────────────────────────── */}
        {scan.status === 'completed' && (
          <div className="flex items-center justify-center gap-2 text-[var(--text-secondary)] text-sm font-mono animate-pulse">
            <CheckCircle2 className="w-4 h-4 text-[var(--success)]" />
            Scan complete — redirecting to results...
          </div>
        )}
      </div>

      {/* ─── Stop Confirmation Dialog ───────────────────────── */}
      <Dialog open={showStopDialog} onOpenChange={setShowStopDialog}>
        <DialogContent className="bg-[var(--bg-surface)] border-[var(--border)]">
          <DialogHeader>
            <DialogTitle className="text-[var(--text-primary)]">Stop Scan?</DialogTitle>
            <DialogDescription className="text-[var(--text-secondary)]">
              The scan will be terminated. Results collected so far will be saved and can be viewed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStopDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmStop}>
              Stop Scan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
