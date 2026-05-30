import { ReactNode } from "react"

interface TerminalWindowProps {
  title?: string
  children: ReactNode
  showScanlines?: boolean
  className?: string
}

export function TerminalWindow({ 
  title = "sentinelscan://terminal", 
  children, 
  showScanlines = false,
  className = ""
}: TerminalWindowProps) {
  return (
    <div className={`relative bg-[var(--bg-primary)] border-2 border-[var(--border)] rounded-none overflow-hidden ${className}`}>
      {/* Scanlines overlay */}
      {showScanlines && (
        <div className="absolute inset-0 bg-scanlines opacity-20 pointer-events-none z-10" />
      )}
      
      {/* Title bar */}
       <div className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] border-b-2 border-[var(--border)]">
         <div className="w-3 h-3 rounded-none bg-[var(--text-primary)]/60" />
         <div className="w-3 h-3 rounded-none bg-[var(--text-secondary)]/60" />
         <div className="w-3 h-3 rounded-none bg-[var(--text-primary)]/60" />
        <span className="ml-2 text-[10px] uppercase tracking-[0.2em] text-[var(--text-secondary)] font-mono">
          {title}
        </span>
      </div>
      
      {/* Content */}
      <div className="p-5 font-mono text-xs lg:text-sm leading-relaxed text-[var(--text-secondary)] space-y-1">
        {children}
      </div>
    </div>
  )
}

/* ──────────────────────────────────────
   Pre-configured terminal lines component
   ────────────────────────────────────── */

interface TerminalLineProps {
  content: string
  type?: 'default' | 'command' | 'critical' | 'high' | 'medium' | 'cursor'
}

export function TerminalLine({ content, type = 'default' }: TerminalLineProps) {
  const colorClass = 
    type === 'critical' ? 'text-[var(--text-primary)]' :
    type === 'high' ? 'text-[var(--text-secondary)]' :
    type === 'medium' ? 'text-[var(--text-secondary)]/70' :
    type === 'command' ? 'text-[var(--text-primary)]' :
    type === 'cursor' ? 'text-[var(--text-primary)] animate-pulse inline-block' :
    'text-[var(--text-secondary)]'

  return (
    <div className={colorClass}>
      {content}
    </div>
  )
}

/* ──────────────────────────────────────
   Pre-configured SentinelScan terminal demo
   ────────────────────────────────────── */

export function SentinelScanTerminal() {
  const lines = [
    { content: "$ sentinelscan --target 192.168.1.0/24", type: 'command' as const },
    { content: "[████████████████████] 100%  Assets: 47 found", type: 'default' as const },
    { content: "[SCAN] CVE-2024-6387 — CRITICAL — OpenSSH RCE", type: 'critical' as const },
    { content: "[SCAN] CVE-2024-4577 — HIGH — PHP CGI Arg Injection", type: 'high' as const },
    { content: "[SCAN] CVE-2024-38077 — MEDIUM — Windows RDP", type: 'medium' as const },
    { content: "$ 3 critical | 12 high | 8 medium | 4 low", type: 'command' as const },
    { content: "$ report --format pdf --output /reports/", type: 'command' as const },
    { content: "▌", type: 'cursor' as const },
  ]

  return (
    <TerminalWindow showScanlines>
      {lines.map((line, i) => (
        <TerminalLine key={i} content={line.content} type={line.type} />
      ))}
    </TerminalWindow>
  )
}
