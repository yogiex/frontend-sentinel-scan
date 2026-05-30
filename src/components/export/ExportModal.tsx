/**
 * SentinelScan Export Modal Component
 * Path: src/components/export/ExportModal.tsx
 *
 * Modal dialog for choosing export format and triggering download.
 */
import { useState } from 'react';
import { useAuditLog } from '@/hooks/useAuditLog';
import { Button } from '@/components/ui/button';
import { exportToJSON, exportToCSV, exportToHTML, exportToPDF, exportToNessus, exportToMarkdown, type ExportFormat, type ScanData } from '@/lib/export';

interface ExportModalProps {
  data: ScanData;
  onClose: () => void;
}

const exportOptions: { format: ExportFormat; label: string; icon: string; description: string }[] = [
  { format: 'html', label: 'HTML Report', icon: '', description: 'Interactive HTML report with styling' },
  { format: 'pdf', label: 'PDF Document', icon: '📄', description: 'Print-friendly PDF via browser' },
  { format: 'csv', label: 'CSV Spreadsheet', icon: '📊', description: 'Vulnerability data in CSV format' },
  { format: 'json', label: 'JSON Data', icon: '📦', description: 'Full scan data as JSON' },
  { format: 'markdown', label: 'Markdown', icon: '📝', description: 'Markdown formatted report' },
  { format: 'nessus', label: 'Nessus XML', icon: '', description: 'Nessus-compatible .nessus file' },
];

export function ExportModal({ data, onClose }: ExportModalProps) {
  const [exporting, setExporting] = useState<ExportFormat | null>(null);
  const audit = useAuditLog();

  const handleExport = (format: ExportFormat) => {
    setExporting(format);
    setTimeout(() => {
      switch (format) {
        case 'json': exportToJSON(data); break;
        case 'csv': exportToCSV(data); break;
        case 'html': exportToHTML(data); break;
        case 'pdf': exportToPDF(data); break;
        case 'nessus': exportToNessus(data); break;
        case 'markdown': exportToMarkdown(data); break;
      }
      audit.info('export', 'Report exported', {
        format,
        scanId: data.id,
        scanName: data.target,
        vulnerabilityCount: data.vulnerabilities?.length || 0,
      });
      setExporting(null);
      onClose();
    }, 300);
  };

   return (
     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
       <div
         className="rounded-xl shadow-2xl w-full max-w-lg mx-4"
         style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
         onClick={(e) => e.stopPropagation()}
       >
         {/* Header */}
         <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid var(--border)' }}>
           <div>
             <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Export Report</h2>
             <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Choose a format to export scan results</p>
           </div>
           <button 
             onClick={onClose} 
             className="text-xl leading-none transition-colors"
             style={{ color: 'var(--text-muted)' }}
             onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)' }}
             onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)' }}
           >
             ✕
           </button>
         </div>

         {/* Export Options */}
         <div className="p-6 grid grid-cols-2 gap-3">
           {exportOptions.map((opt) => (
             <button
               key={opt.format}
               onClick={() => handleExport(opt.format)}
               disabled={exporting !== null}
               className="flex flex-col items-start gap-2 p-4 rounded-lg border transition-all text-left"
               style={{
                 backgroundColor: exporting === opt.format ? 'rgba(79, 70, 229, 0.1)' : 'var(--bg-secondary)',
                 borderColor: exporting === opt.format ? 'var(--primary)' : 'var(--border)',
                 color: exporting === opt.format ? 'var(--primary)' : 'var(--text-secondary)',
                 opacity: (exporting !== null && exporting !== opt.format) ? 0.5 : 1
               }}
               onMouseEnter={(e) => {
                 if (exporting === null) {
                   e.currentTarget.style.borderColor = 'var(--primary)';
                   e.currentTarget.style.backgroundColor = 'rgba(79, 70, 229, 0.05)';
                 }
               }}
               onMouseLeave={(e) => {
                 if (exporting === null) {
                   e.currentTarget.style.borderColor = 'var(--border)';
                   e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                 }
               }}
             >
               <div className="flex items-center gap-2">
                 <span className="text-xl">{opt.icon}</span>
                 <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{opt.label}</span>
               </div>
               <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{opt.description}</span>
               {exporting === opt.format && (
                 <div className="flex items-center gap-2 mt-1">
                   <div className="w-3 h-3 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
                   <span className="text-xs" style={{ color: 'var(--primary)' }}>Exporting...</span>
                 </div>
               )}
             </button>
           ))}
         </div>

         {/* Footer */}
         <div className="p-4 flex justify-end" style={{ borderTop: '1px solid var(--border)' }}>
           <Button 
             variant="outline" 
             onClick={onClose} 
             className="transition-colors"
             style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
             onMouseEnter={(e) => { 
               e.currentTarget.style.borderColor = 'var(--primary)'; 
               e.currentTarget.style.backgroundColor = 'rgba(79, 70, 229, 0.05)'; 
             }}
             onMouseLeave={(e) => { 
               e.currentTarget.style.borderColor = 'var(--border)'; 
               e.currentTarget.style.backgroundColor = 'transparent'; 
             }}
           >
             Cancel
           </Button>
         </div>
       </div>
     </div>
   );
}
