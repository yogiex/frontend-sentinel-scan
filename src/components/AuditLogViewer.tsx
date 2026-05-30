/**
 * SentinelScan — Audit Log Viewer Component
 * Path: src/components/AuditLogViewer.tsx
 *
 * Reusable table component for displaying audit log entries
 * with filtering, pagination, and export capabilities.
 */

import { useState } from 'react';
import type { AuditLogEntry, LogLevel, AuditCategory } from '../lib/logger';

interface AuditLogViewerProps {
  entries: AuditLogEntry[];
  onExport?: (format: 'json' | 'csv', entries: AuditLogEntry[]) => void;
  onClear?: () => void;
  compact?: boolean;
}

const LEVEL_STYLES: Record<LogLevel, React.CSSProperties> = {
  debug: { backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' },
  info: { backgroundColor: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', border: '1px solid rgba(79, 70, 229, 0.3)' },
  warn: { backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', border: '1px solid rgba(245, 158, 11, 0.3)' },
  error: { backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.3)' },
  critical: { backgroundColor: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.5)' },
};

const CATEGORY_ICONS: Record<AuditCategory, string> = {
  auth: '🔐',
  scan: '🔍',
  export: '📤',
  user_management: '👥',
  settings: '⚙️',
  navigation: '🧭',
  system: '💻',
  security: '🛡️',
  performance: '📊',
};

export function AuditLogViewer({ entries, onExport, onClear, compact }: AuditLogViewerProps) {
  const [page, setPage] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const pageSize = compact ? 10 : 25;
  const totalPages = Math.ceil(entries.length / pageSize);
  const pageEntries = entries.slice(page * pageSize, (page + 1) * pageSize);

   if (entries.length === 0) {
     return (
       <div className="text-center py-12">
         <p className="text-lg" style={{ color: 'var(--text-muted)' }}>No audit logs found</p>
         <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Activity will be recorded as you use the application</p>
       </div>
     );
   }

   return (
     <div>
       {/* Toolbar */}
       <div className="flex items-center justify-between mb-4">
         <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
           Showing {pageEntries.length} of {entries.length} entries
         </p>
         <div className="flex items-center gap-2">
           {onExport && (
             <>
               <button
                 onClick={() => onExport('json', entries)}
                 className="px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors"
                 style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-secondary)', borderColor: 'var(--border)' }}
                 onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)' }}
                 onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
               >
                 Export JSON
               </button>
               <button
                 onClick={() => onExport('csv', entries)}
                 className="px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors"
                 style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-secondary)', borderColor: 'var(--border)' }}
                 onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)' }}
                 onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
               >
                 Export CSV
               </button>
             </>
           )}
           {onClear && (
             <button
               onClick={onClear}
               className="px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors"
               style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
               onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)' }}
               onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)' }}
             >
               Clear Logs
             </button>
           )}
         </div>
       </div>

       {/* Table */}
       <div className="overflow-x-auto rounded-lg" style={{ border: '1px solid var(--border)' }}>
         <table className="w-full text-sm">
           <thead>
             <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
               <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Time</th>
               <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Level</th>
               <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Category</th>
               <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Action</th>
               <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>User</th>
               {!compact && (
                 <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Details</th>
               )}
             </tr>
           </thead>
           <tbody style={{ borderTop: '1px solid var(--border)' }}>
             {pageEntries.map((entry) => (
               <tr
                 key={entry.id}
                 className="transition-colors cursor-pointer"
                 style={{ borderBottom: '1px solid rgba(226, 232, 240, 0.5)' }}
                 onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                 onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(79, 70, 229, 0.05)' }}
                 onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
               >
                 <td className="px-4 py-3 font-mono text-xs whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                   {new Date(entry.timestamp).toLocaleString()}
                 </td>
                 <td className="px-4 py-3">
                   <span className="px-2 py-0.5 rounded-md text-xs font-medium" style={LEVEL_STYLES[entry.level]}>
                     {entry.level.toUpperCase()}
                   </span>
                 </td>
                 <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                   <span className="flex items-center gap-1.5">
                     <span>{CATEGORY_ICONS[entry.category]}</span>
                     <span className="capitalize">{entry.category.replace('_', ' ')}</span>
                   </span>
                 </td>
                 <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{entry.action}</td>
                 <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{entry.user}</td>
                 {!compact && (
                   <td className="px-4 py-3 text-xs max-w-xs truncate" style={{ color: 'var(--text-muted)' }}>
                     {JSON.stringify(entry.details)}
                   </td>
                 )}
               </tr>
             ))}
           </tbody>
         </table>
       </div>

       {/* Expanded Details */}
       {expandedId && (
         <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
           {(() => {
             const entry = entries.find((e) => e.id === expandedId);
             if (!entry) return null;
             return (
               <div className="space-y-3">
                 <div className="flex items-center justify-between">
                   <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>{entry.action}</h4>
                   <button
                     onClick={() => setExpandedId(null)}
                     style={{ color: 'var(--text-muted)' }}
                     onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)' }}
                     onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)' }}
                   >
                     ✕
                   </button>
                 </div>
                 <div className="grid grid-cols-2 gap-4 text-sm">
                   <div>
                     <span style={{ color: 'var(--text-muted)' }}>Timestamp:</span>
                     <p className="font-mono text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{entry.timestamp}</p>
                   </div>
                   <div>
                     <span style={{ color: 'var(--text-muted)' }}>Session ID:</span>
                     <p className="font-mono text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{entry.sessionId}</p>
                   </div>
                   <div>
                     <span style={{ color: 'var(--text-muted)' }}>User:</span>
                     <p style={{ color: 'var(--text-secondary)' }}>{entry.user}</p>
                   </div>
                   <div>
                     <span style={{ color: 'var(--text-muted)' }}>User Agent:</span>
                     <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{entry.userAgent}</p>
                   </div>
                 </div>
                 <div>
                   <span style={{ color: 'var(--text-muted)' }}>Details:</span>
                   <pre className="mt-1 p-3 rounded-lg text-xs overflow-x-auto" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                     {JSON.stringify(entry.details, null, 2)}
                   </pre>
                 </div>
               </div>
             );
           })()}
         </div>
       )}

       {/* Pagination */}
       {totalPages > 1 && (
         <div className="flex items-center justify-between mt-4">
           <button
             onClick={() => setPage((p) => Math.max(0, p - 1))}
             disabled={page === 0}
             className="px-3 py-1.5 text-sm rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
             style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-secondary)', borderColor: 'var(--border)' }}
             onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)' }}
             onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
           >
             ← Previous
           </button>
           <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
             Page {page + 1} of {totalPages}
           </span>
           <button
             onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
             disabled={page >= totalPages - 1}
             className="px-3 py-1.5 text-sm rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
             style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-secondary)', borderColor: 'var(--border)' }}
             onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)' }}
             onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
           >
             Next →
           </button>
         </div>
       )}
    </div>
  );
}
