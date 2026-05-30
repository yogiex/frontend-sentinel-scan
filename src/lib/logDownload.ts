/**
 * SentinelScan — Log Download Utilities
 * Path: src/lib/logDownload.ts
 *
 * Creates Blob and triggers download of .log files.
 */

/**
 * Trigger a browser download of a text file.
 * @param content - The file content as string
 * @param filename - The download filename (e.g., "sentinelscan.access.log")
 */
export function downloadTextFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/plain; charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Download the access log as sentinelscan.access.log
 */
export function downloadAccessLog(content: string): void {
  downloadTextFile(content || 'No access log data available.\n', 'sentinelscan.access.log');
}

/**
 * Download the error log as sentinelscan.error.log
 */
export function downloadErrorLog(content: string): void {
  downloadTextFile(content || 'No error log data available.\n', 'sentinelscan.error.log');
}
