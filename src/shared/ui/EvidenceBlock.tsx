import { useMemo, useState } from 'react';
import { Check, Copy, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface EvidenceBlockProps {
  requestHeader?: string | null;
  requestBody?: string | null;
  responseHeader?: string | null;
  responseBody?: string | null;
  className?: string;
}

type TabKey = 'requestHeader' | 'requestBody' | 'responseHeader' | 'responseBody';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'requestHeader', label: 'Request header' },
  { key: 'requestBody', label: 'Request body' },
  { key: 'responseHeader', label: 'Response header' },
  { key: 'responseBody', label: 'Response body' },
];

const SECRET_LINE = /^(authorization|cookie|set-cookie|x-api-key|x-auth-token)\s*:/i;
const MAX_CHARS = 4000;

function mask(text: string): string {
  return text
    .split('\n')
    .map((line) =>
      SECRET_LINE.test(line.trim())
        ? `${line.split(':')[0]}: •••••••• (masked)`
        : line,
    )
    .join('\n');
}

export function EvidenceBlock({
  requestHeader,
  requestBody,
  responseHeader,
  responseBody,
  className,
}: EvidenceBlockProps) {
  const [tab, setTab] = useState<TabKey>('requestHeader');
  const [expanded, setExpanded] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [copied, setCopied] = useState(false);

  const raw = { requestHeader, requestBody, responseHeader, responseBody }[tab] ?? '';
  const value = useMemo(() => (reveal ? raw : mask(raw)), [raw, reveal]);
  const truncated = !expanded && value.length > MAX_CHARS;
  const shown = truncated ? `${value.slice(0, MAX_CHARS)}\n… ${value.length - MAX_CHARS} more characters` : value;

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className={cn('overflow-hidden rounded-md border border-[var(--rule)] bg-[var(--paper)]', className)}>
      <div className="flex flex-wrap items-center gap-1 border-b border-[var(--rule)] bg-[var(--surface)] p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            aria-pressed={tab === t.key}
            onClick={() => {
              setTab(t.key);
              setExpanded(false);
            }}
            className={cn(
              'rounded-sm px-2 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--signal)]',
              tab === t.key
                ? 'bg-[var(--paper)] text-[var(--ink)] border border-[var(--rule)]'
                : 'text-[var(--steel)] hover:text-[var(--ink)]',
            )}
          >
            {t.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setReveal((v) => !v)}
            aria-pressed={reveal}
            className="text-xs"
          >
            {reveal ? <EyeOff className="size-3.5" aria-hidden="true" /> : <Eye className="size-3.5" aria-hidden="true" />}
            {reveal ? 'Hide secrets' : 'Show secrets'}
          </Button>
          <Button size="sm" variant="ghost" onClick={copy} className="text-xs" disabled={!raw}>
            {copied ? <Check className="size-3.5" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </div>

      {raw ? (
        <>
          <pre className="max-h-[420px] overflow-auto bg-[var(--paper)] p-3 font-mono text-xs leading-relaxed text-[var(--ink)]">
            <code>{shown}</code>
          </pre>
          {truncated && (
            <div className="border-t border-[var(--rule)] px-3 py-1.5">
              <Button size="sm" variant="link" onClick={() => setExpanded(true)} className="text-xs">
                Show full payload
              </Button>
            </div>
          )}
        </>
      ) : (
        <p className="px-3 py-6 text-center text-xs text-[var(--steel)]">No data captured for this field.</p>
      )}

      <span className="sr-only" role="status" aria-live="polite">
        {copied ? 'Evidence copied to clipboard' : ''}
      </span>
    </section>
  );
}
