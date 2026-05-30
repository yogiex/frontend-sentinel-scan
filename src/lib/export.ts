/**
 * SentinelScan Export Utilities
 * Path: src/lib/export.ts
 *
 * Export scan data to various formats: HTML, CSV, JSON, PDF, Nessus, Markdown.
 */

export interface ScanData {
  id: string;
  target: string;
  status: string;
  scanType: string;
  profile: string;
  owner: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  duration: string;
  credentials?: {
    enabled: boolean;
    authType?: string;
  };
  summary: {
    totalVulns: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  hosts: { ip: string; status: string; openPorts: number; vulns: number }[];
  notes?: string;
  vulnerabilities: {
    id: string;
    title: string;
    severity: string;
    host: string;
    port: number;
    description?: string;
    remediation?: string;
  }[];
}

export type ExportFormat = 'html' | 'csv' | 'json' | 'pdf' | 'nessus' | 'markdown';

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportToJSON(data: ScanData, filename?: string) {
  const content = JSON.stringify(data, null, 2);
  downloadFile(content, filename || `scan-${data.id}.json`, 'application/json');
}

export function exportToCSV(data: ScanData, filename?: string) {
  const headers = ['CVE ID', 'Title', 'Severity', 'Host', 'Port', 'Description'];
  const rows = data.vulnerabilities.map((v) => [
    v.id,
    `"${v.title.replace(/"/g, '""')}"`,
    v.severity,
    v.host,
    v.port,
    `"${(v.description || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadFile(csvContent, filename || `scan-${data.id}.csv`, 'text/csv');
}

export function exportToMarkdown(data: ScanData, filename?: string) {
  const lines: string[] = [];
  lines.push(`# Scan Report: ${data.target}`);
  lines.push('');
  lines.push(`**Scan ID:** ${data.id} | **Status:** ${data.status} | **Date:** ${data.createdAt}`);
  lines.push(`**Type:** ${data.scanType} | **Profile:** ${data.profile} | **Duration:** ${data.duration}`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`| Severity | Count |`);
  lines.push(`|----------|-------|`);
  lines.push(`| Critical | ${data.summary.critical} |`);
  lines.push(`| High     | ${data.summary.high} |`);
  lines.push(`| Medium   | ${data.summary.medium} |`);
  lines.push(`| Low      | ${data.summary.low} |`);
  lines.push(`| **Total**| **${data.summary.totalVulns}** |`);
  lines.push('');
  lines.push('## Hosts Discovered');
  lines.push('');
  lines.push(`| IP Address | Status | Open Ports | Vulnerabilities |`);
  lines.push(`|------------|--------|------------|-----------------|`);
  data.hosts.forEach((h) => {
    lines.push(`| ${h.ip} | ${h.status} | ${h.openPorts} | ${h.vulns} |`);
  });
  lines.push('');
  lines.push('## Vulnerabilities');
  lines.push('');
  data.vulnerabilities.forEach((v) => {
    lines.push(`### ${v.id} - ${v.title}`);
    lines.push('');
    lines.push(`- **Severity:** ${v.severity.toUpperCase()}`);
    lines.push(`- **Host:** ${v.host}:${v.port}`);
    if (v.description) {
      lines.push(`- **Description:** ${v.description}`);
    }
    if (v.remediation) {
      lines.push(`- **Remediation:** ${v.remediation}`);
    }
    lines.push('');
  });

  downloadFile(lines.join('\n'), filename || `scan-${data.id}.md`, 'text/markdown');
}

export function exportToHTML(data: ScanData, filename?: string) {
  const severityColor: Record<string, string> = {
    critical: '#ef4444',
    high: '#f97316',
    medium: '#eab308',
    low: '#3b82f6',
  };

  const vulnRows = data.vulnerabilities
    .map(
      (v) => `
    <tr>
      <td style="font-family:monospace;color:#3b82f6">${v.id}</td>
      <td>${v.title}</td>
      <td><span style="background:${severityColor[v.severity] || '#64748b'}22;color:${severityColor[v.severity] || '#64748b'};padding:2px 8px;border-radius:4px;font-size:12px;font-weight:600">${v.severity.toUpperCase()}</span></td>
      <td style="font-family:monospace">${v.host}:${v.port}</td>
    </tr>`
    )
    .join('');

  const hostRows = data.hosts
    .map(
      (h) => `
    <tr>
      <td style="font-family:monospace">${h.ip}</td>
      <td><span style="color:${h.status === 'up' ? '#10b981' : '#64748b'}">${h.status}</span></td>
      <td>${h.openPorts}</td>
      <td style="color:${h.vulns > 0 ? '#ef4444' : '#64748b'};font-weight:600">${h.vulns}</td>
    </tr>`
    )
    .join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Scan Report - ${data.target}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f172a; color: #e2e8f0; padding: 40px; }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 { color: #fff; font-size: 28px; margin-bottom: 8px; }
    .subtitle { color: #94a3b8; margin-bottom: 32px; }
    .meta { display: flex; gap: 24px; margin-bottom: 32px; flex-wrap: wrap; }
    .meta-item { background: #1e293b; padding: 16px 24px; border-radius: 8px; border: 1px solid #334155; }
    .meta-label { font-size: 12px; color: #64748b; text-transform: uppercase; }
    .meta-value { font-size: 20px; font-weight: 700; color: #fff; margin-top: 4px; }
    .summary-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; margin-bottom: 32px; }
    .summary-card { background: #1e293b; padding: 20px; border-radius: 8px; border: 1px solid #334155; text-align: center; }
    .summary-card .count { font-size: 32px; font-weight: 700; }
    .summary-card .label { font-size: 12px; color: #64748b; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
    th { text-align: left; padding: 12px 16px; background: #1e293b; color: #94a3b8; font-size: 12px; text-transform: uppercase; border-bottom: 1px solid #334155; }
    td { padding: 12px 16px; border-bottom: 1px solid #1e293b; font-size: 14px; }
    tr:hover td { background: #1e293b; }
    h2 { color: #fff; font-size: 20px; margin-bottom: 16px; margin-top: 32px; }
    .footer { text-align: center; color: #475569; font-size: 12px; margin-top: 48px; padding-top: 24px; border-top: 1px solid #1e293b; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔍 Scan Report</h1>
    <p class="subtitle">${data.target} — Generated ${new Date().toLocaleDateString()}</p>
    <div class="meta">
      <div class="meta-item"><div class="meta-label">Scan ID</div><div class="meta-value">${data.id}</div></div>
      <div class="meta-item"><div class="meta-label">Status</div><div class="meta-value">${data.status}</div></div>
      <div class="meta-item"><div class="meta-label">Type</div><div class="meta-value">${data.scanType}</div></div>
      <div class="meta-item"><div class="meta-label">Duration</div><div class="meta-value">${data.duration}</div></div>
    </div>
    <div class="summary-grid">
      <div class="summary-card"><div class="count" style="color:#ef4444">${data.summary.critical}</div><div class="label">Critical</div></div>
      <div class="summary-card"><div class="count" style="color:#f97316">${data.summary.high}</div><div class="label">High</div></div>
      <div class="summary-card"><div class="count" style="color:#eab308">${data.summary.medium}</div><div class="label">Medium</div></div>
      <div class="summary-card"><div class="count" style="color:#3b82f6">${data.summary.low}</div><div class="label">Low</div></div>
      <div class="summary-card"><div class="count" style="color:#fff">${data.summary.totalVulns}</div><div class="label">Total</div></div>
    </div>
    <h2>Hosts Discovered</h2>
    <table><thead><tr><th>IP Address</th><th>Status</th><th>Open Ports</th><th>Vulnerabilities</th></tr></thead><tbody>${hostRows}</tbody></table>
    <h2>Vulnerabilities</h2>
    <table><thead><tr><th>CVE ID</th><th>Title</th><th>Severity</th><th>Host:Port</th></tr></thead><tbody>${vulnRows}</tbody></table>
    <div class="footer">Generated by SentinelScan • ${new Date().toISOString()}</div>
  </div>
</body>
</html>`;

  downloadFile(html, filename || `scan-${data.id}.html`, 'text/html');
}

export function exportToPDF(data: ScanData) {
  // Generate HTML first, then use browser print to PDF
  // For MVP, we generate a print-friendly HTML and trigger window.print()
  const severityColor: Record<string, string> = {
    critical: '#ef4444',
    high: '#f97316',
    medium: '#eab308',
    low: '#3b82f6',
  };

  const vulnRows = data.vulnerabilities
    .map(
      (v) => `
    <tr>
      <td style="font-family:monospace">${v.id}</td>
      <td>${v.title}</td>
      <td style="color:${severityColor[v.severity] || '#64748b'};font-weight:600">${v.severity.toUpperCase()}</td>
      <td style="font-family:monospace">${v.host}:${v.port}</td>
    </tr>`
    )
    .join('');

  const hostRows = data.hosts
    .map(
      (h) => `
    <tr>
      <td style="font-family:monospace">${h.ip}</td>
      <td>${h.status}</td>
      <td>${h.openPorts}</td>
      <td style="font-weight:600">${h.vulns}</td>
    </tr>`
    )
    .join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Scan Report - ${data.target}</title>
  <style>
    @media print {
      body { font-family: Arial, sans-serif; color: #000; padding: 20px; }
      .no-print { display: none; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
      th { background: #f0f0f0; padding: 8px 12px; text-align: left; border: 1px solid #ddd; font-size: 12px; }
      td { padding: 8px 12px; border: 1px solid #ddd; font-size: 12px; }
      h1 { font-size: 24px; margin-bottom: 4px; }
      h2 { font-size: 18px; margin: 20px 0 10px; }
      .meta { display: flex; gap: 20px; margin-bottom: 20px; }
      .meta-item { padding: 8px 16px; border: 1px solid #ddd; border-radius: 4px; }
      .meta-label { font-size: 10px; color: #666; text-transform: uppercase; }
      .meta-value { font-size: 16px; font-weight: 700; }
      .summary-grid { display: flex; gap: 12px; margin-bottom: 20px; }
      .summary-card { flex: 1; padding: 12px; border: 1px solid #ddd; border-radius: 4px; text-align: center; }
      .summary-card .count { font-size: 24px; font-weight: 700; }
      .summary-card .label { font-size: 10px; color: #666; }
      .footer { text-align: center; font-size: 10px; color: #999; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 10px; }
    }
    @media screen {
      body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 40px; }
      .container { max-width: 900px; margin: 0 auto; background: #fff; padding: 40px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
      table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
      th { background: #f8f9fa; padding: 10px 14px; text-align: left; border: 1px solid #dee2e6; font-size: 12px; }
      td { padding: 10px 14px; border: 1px solid #dee2e6; font-size: 13px; }
      h1 { font-size: 28px; margin-bottom: 8px; }
      h2 { font-size: 20px; margin: 24px 0 12px; }
      .meta { display: flex; gap: 20px; margin-bottom: 24px; flex-wrap: wrap; }
      .meta-item { padding: 12px 20px; background: #f8f9fa; border-radius: 6px; }
      .meta-label { font-size: 11px; color: #6c757d; text-transform: uppercase; }
      .meta-value { font-size: 18px; font-weight: 700; }
      .summary-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 24px; }
      .summary-card { padding: 16px; background: #f8f9fa; border-radius: 6px; text-align: center; }
      .summary-card .count { font-size: 28px; font-weight: 700; }
      .summary-card .label { font-size: 11px; color: #6c757d; }
      .footer { text-align: center; font-size: 11px; color: #adb5bd; margin-top: 30px; padding-top: 15px; border-top: 1px solid #dee2e6; }
      .print-btn { position: fixed; top: 20px; right: 20px; padding: 10px 24px; background: #2563eb; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; }
      .print-btn:hover { background: #1d4ed8; }
    }
  </style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">🖨️ Save as PDF</button>
  <div class="container">
    <h1>🔍 Scan Report</h1>
    <p style="color:#6c757d;margin-bottom:24px">${data.target} — Generated ${new Date().toLocaleDateString()}</p>
    <div class="meta">
      <div class="meta-item"><div class="meta-label">Scan ID</div><div class="meta-value">${data.id}</div></div>
      <div class="meta-item"><div class="meta-label">Status</div><div class="meta-value">${data.status}</div></div>
      <div class="meta-item"><div class="meta-label">Type</div><div class="meta-value">${data.scanType}</div></div>
      <div class="meta-item"><div class="meta-label">Duration</div><div class="meta-value">${data.duration}</div></div>
    </div>
    <div class="summary-grid">
      <div class="summary-card"><div class="count" style="color:#ef4444">${data.summary.critical}</div><div class="label">Critical</div></div>
      <div class="summary-card"><div class="count" style="color:#f97316">${data.summary.high}</div><div class="label">High</div></div>
      <div class="summary-card"><div class="count" style="color:#eab308">${data.summary.medium}</div><div class="label">Medium</div></div>
      <div class="summary-card"><div class="count" style="color:#3b82f6">${data.summary.low}</div><div class="label">Low</div></div>
      <div class="summary-card"><div class="count" style="color:#000">${data.summary.totalVulns}</div><div class="label">Total</div></div>
    </div>
    <h2>Hosts Discovered</h2>
    <table><thead><tr><th>IP Address</th><th>Status</th><th>Open Ports</th><th>Vulnerabilities</th></tr></thead><tbody>${hostRows}</tbody></table>
    <h2>Vulnerabilities</h2>
    <table><thead><tr><th>CVE ID</th><th>Title</th><th>Severity</th><th>Host:Port</th></tr></thead><tbody>${vulnRows}</tbody></table>
    <div class="footer">Generated by SentinelScan • ${new Date().toISOString()}</div>
  </div>
</body>
</html>`;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  }
}

export function exportToNessus(data: ScanData, filename?: string) {
  // Generate a Nessus-compatible XML report (simplified .nessus format)
  const vulnEntries = data.vulnerabilities
    .map(
      (v) => `
    <ReportHost name="${v.host}">
      <HostProperties>
        <tag name="HOST_END">${data.createdAt}</tag>
        <tag name="operating-system">Unknown</tag>
      </HostProperties>
      <ReportItem port="${v.port}" svc_name="tcp" protocol="tcp" severity="${getNessusSeverity(v.severity)}" pluginID="0" pluginName="${escapeXml(v.title)}" pluginFamily="General">
        <description>${escapeXml(v.description || v.title)}</description>
        <solution>${escapeXml(v.remediation || 'No remediation available')}</solution>
        <see_also>https://nvd.nist.gov/vuln/detail/${v.id}</see_also>
        <cve>${v.id}</cve>
        <risk_factor>${v.severity.toUpperCase()}</risk_factor>
      </ReportItem>
    </ReportHost>`
    )
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<NessusClientData_v2>
  <Policy>
    <policyName>SentinelScan Export</policyName>
  </Policy>
  <Report name="SentinelScan_${data.id}" xmlns:cm="http://www.nessus.org/cm">
    <ReportName>SentinelScan Report - ${escapeXml(data.target)}</ReportName>
    <PolicyUsed>SentinelScan Export</PolicyUsed>
    <Timestamp>${new Date().toISOString()}</Timestamp>
    ${vulnEntries}
  </Report>
</NessusClientData_v2>`;

  downloadFile(xml, filename || `scan-${data.id}.nessus`, 'application/xml');
}

function getNessusSeverity(severity: string): number {
  switch (severity) {
    case 'critical': return 4;
    case 'high': return 3;
    case 'medium': return 2;
    case 'low': return 1;
    default: return 0;
  }
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
