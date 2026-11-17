import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface TerminalWindowProps {
  title?: string
  children: ReactNode
  showScanlines?: boolean
  className?: string
}

/**
 * Satu-satunya permukaan gelap di aplikasi: blok terminal.
 * Dipakai di landing sebagai bukti "produk ini bekerja dengan output mesin".
 */
export function TerminalWindow({
  title = "sentinelscan://console",
  children,
  showScanlines = false,
  className = ""
}: TerminalWindowProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md border border-[var(--rule-strong)] bg-[var(--term-bg)]",
        className,
      )}
    >
      {showScanlines && (
        <div className="pointer-events-none absolute inset-0 bg-scanlines opacity-[0.06]" aria-hidden="true" />
      )}

      <div className="flex items-center gap-2 border-b border-[#2A3038] bg-[var(--term-bar)] px-3 py-1.5">
        <span className="size-2 rounded-[1px] bg-[#3D444E]" aria-hidden="true" />
        <span className="size-2 rounded-[1px] bg-[#3D444E]" aria-hidden="true" />
        <span className="size-2 rounded-[1px] bg-[#3D444E]" aria-hidden="true" />
        <span className="ml-2 truncate font-mono text-[11px] text-[var(--term-dim)]">{title}</span>
      </div>

      <div className="space-y-1 p-4 font-mono text-xs leading-relaxed text-[var(--term-text)] lg:text-[13px]">
        {children}
      </div>
    </div>
  )
}

interface TerminalLineProps {
  content: string
  type?: 'default' | 'command' | 'critical' | 'high' | 'medium' | 'cursor'
}

const LINE_COLOR: Record<NonNullable<TerminalLineProps['type']>, string> = {
  default: 'var(--term-text)',
  command: '#FFFFFF',
  critical: 'var(--term-critical)',
  high: 'var(--term-high)',
  medium: 'var(--term-medium)',
  cursor: '#FFFFFF',
}

export function TerminalLine({ content, type = 'default' }: TerminalLineProps) {
  return (
    <div
      style={{ color: LINE_COLOR[type] }}
      className={cn('whitespace-pre-wrap', type === 'cursor' && 'inline-block animate-pulse')}
    >
      {content}
    </div>
  )
}

export function SentinelScanTerminal() {
  const lines = [
    { content: "$ sentinelscan scan --target 192.168.1.0/24", type: 'command' as const },
    { content: "[████████████████████] 100%  hosts: 47 found", type: 'default' as const },
    { content: "[FINDING] CVE-2024-6387  critical  sshd 10.0.0.4:22", type: 'critical' as const },
    { content: "[FINDING] CVE-2024-4577  high      php-cgi 10.0.0.9:80", type: 'high' as const },
    { content: "[FINDING] CVE-2024-38077  medium    rdp 10.0.0.12:3389", type: 'medium' as const },
    { content: "$ sentinelscan findings --summary", type: 'command' as const },
    { content: "3 critical | 12 high | 8 medium | 4 low", type: 'default' as const },
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
