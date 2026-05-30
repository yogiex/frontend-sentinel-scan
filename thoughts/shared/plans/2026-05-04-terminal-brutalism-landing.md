# Terminal Brutalism Landing Page Implementation Plan

**Goal:** Transform the SentinelScan landing page from light/indigo shadcn theme to dark terminal brutalism with monospace-only typography, scanlines/noise animations, and harsh borders.

**Architecture:** Single-page landing with 8 sections flowing vertically. CSS variables drive the dark terminal theme. shadcn/ui components are modified in-place for brutalist styling. All rounded corners removed. JetBrains Mono is the sole font family.

**Design:** [2026-05-04-terminal-brutalism-landing-design.md](../designs/2026-05-04-terminal-brutalism-landing-design.md)

---

## Dependency Graph

```
Batch 1 (parallel): 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8 [foundation - no deps]
Batch 2 (parallel): 2.1 [terminal component - depends on 1.1 for CSS vars]
Batch 3 (parallel): 3.1 [landing page - depends on 1.1, 1.3, 1.4, 1.5, 2.1]
```

---

## Batch 1: Foundation — CSS, HTML, shadcn Components (parallel — 8 implementers)

All tasks in this batch have NO dependencies and run simultaneously. These establish the dark terminal theme, remove Outfit font, and modify shadcn components for brutalist styling.

---

### Task 1.1: Overhaul CSS Variables — Dark Terminal Theme
**File:** `src/index.css`
**Test:** none (CSS file)
**Depends:** none

**Design Decision:** Switching from light/indigo to dark/terminal-green. All CSS variables updated to reflect dark theme with `#00ff41` (terminal green) as primary. Background is dark (`#0a0a0a`), surfaces slightly lighter (`#111111`). All transitions removed for instant brutalist feel.

```css
@import "tailwindcss";
@import "@fontsource/jetbrains-mono/400.css";
@import "@fontsource/jetbrains-mono/500.css";
@import "@fontsource/jetbrains-mono/700.css";
@import "@fontsource/jetbrains-mono/800.css";

/* Landing Page Theme Colors - Terminal Brutalism */
@theme {
  --color-terminal-green: #00ff41;
  --color-amber: #ffb800;
  --color-danger: #ff3333;
  --color-warning: #ffb800;
  --color-info: #00ffff;
}

/* Force dark color-scheme */
:root {
  color-scheme: dark;
}

/* Theme CSS Custom Properties - Terminal Brutalism Dark Theme */
:root {
  /* Background - Dark terminal */
  --bg-primary: #0a0a0a;
  --bg-secondary: #111111;
  --bg-card: #111111;
  --bg-hover: #1a1a1a;
  --popover: #111111;
  
  /* Primary & Accent (Terminal Green) */
  --primary: #00ff41;
  --primary-dark: #00cc33;
  --primary-foreground: #0a0a0a;
    
  /* Status */
  --success: #00ff41;
  --warning: #ffb800;
  --danger: #ff3333;
  --info: #00ffff;
      
  /* Text */
  --text-primary: #e0e0e0;
  --text-secondary: #888888;
  --text-muted: #555555;
      
  /* Borders - Harsh for brutalism */
  --border: #333333;
  --border-light: #222222;

  /* Landing Page - Terminal Theme */
  --terminal-green: #00ff41;
  --amber: #ffb800;
}

/* 
 * Theme-aware base styles
 * Components should use these CSS variables directly or via arbitrary values
 * Example: class="bg-[var(--bg-primary)]" or style={{ background: 'var(--bg-primary)' }}
 */

html {
  color-scheme: dark;
  scroll-behavior: smooth;
}

body {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

/* Monospace only - brutalism commits to one font family */
.font-mono,
body,
input,
textarea,
button,
select {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
}

/* Terminal-style selection */
::selection {
  background: var(--terminal-green);
  color: var(--bg-primary);
}

/* Staggered fadeIn for sections */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}

/* Staggered children */
.stagger-children > * {
  opacity: 0;
  animation: fadeIn 0.3s ease-out forwards;
}

.stagger-children > *:nth-child(1) { animation-delay: 0.05s; }
.stagger-children > *:nth-child(2) { animation-delay: 0.1s; }
.stagger-children > *:nth-child(3) { animation-delay: 0.15s; }
.stagger-children > *:nth-child(4) { animation-delay: 0.2s; }
.stagger-children > *:nth-child(5) { animation-delay: 0.25s; }

/* Brutalist focus styles - instant, no transition */
*:focus-visible {
  outline: 2px solid var(--terminal-green);
  outline-offset: 0;
}

/* NO transitions - brutalist = instant or nothing */
* {
  transition: none !important;
}

/* ──────────────────────────────────────
   Landing Page Animations
   ────────────────────────────────────── */

@keyframes scanlines {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100vh); }
}

@keyframes cursor-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

@keyframes glitch-1 {
  0%, 100% { transform: translate(0); }
  20% { transform: translate(-2px, 1px); }
  40% { transform: translate(2px, -1px); }
  60% { transform: translate(-1px, 2px); }
  80% { transform: translate(1px, -2px); }
}

@keyframes glitch-2 {
  0%, 100% { transform: translate(0); }
  20% { transform: translate(2px, -1px); }
  40% { transform: translate(-1px, 2px); }
  60% { transform: translate(-2px, -1px); }
  80% { transform: translate(1px, 1px); }
}

@keyframes noise {
  0%, 100% { transform: translate(0); }
  10% { transform: translate(-5%, -5%); }
  20% { transform: translate(5%, 3%); }
  30% { transform: translate(-3%, 5%); }
  40% { transform: translate(3%, -3%); }
  50% { transform: translate(-2%, 2%); }
  60% { transform: translate(2%, -2%); }
  70% { transform: translate(-4%, -1%); }
  80% { transform: translate(4%, 1%); }
  90% { transform: translate(-1%, -4%); }
}

.animate-cursor-blink {
  animation: cursor-blink 1s step-end infinite;
}

.animate-glitch-1 {
  animation: glitch-1 0.3s infinite;
}

.animate-glitch-2 {
  animation: glitch-2 0.3s infinite;
}

.bg-scanlines {
  background-image: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 255, 65, 0.03) 2px,
    rgba(0, 255, 65, 0.03) 4px
  );
  animation: scanlines 8s linear infinite;
}

.bg-grid-pattern {
  background-image:
    linear-gradient(rgba(0, 255, 65, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 65, 0.05) 1px, transparent 1px);
  background-size: 60px 60px;
}

.bg-noise {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 200px 200px;
  animation: noise 0.5s steps(10) infinite;
}

/* Brutalist scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg-primary);
}

::-webkit-scrollbar-thumb {
  background: var(--terminal-green);
  border: 2px solid var(--bg-primary);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--primary-dark);
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation: none !important;
    transition: none !important;
  }
}
```

**Verify:** Visual inspection in browser
**Commit:** `style(landing): overhaul CSS variables for dark terminal brutalism theme`

---

### Task 1.2: Remove Outfit Font from HTML
**File:** `index.html`
**Test:** none (HTML file)
**Depends:** none

**Design Decision:** Remove Outfit font entirely. The HTML loads Google Fonts CDN but the CSS uses @fontsource packages. Removing the CDN link to rely solely on local @fontsource files (which are already imported in index.css). Also update title to reflect the cybersecurity focus.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="SentinelScan - Advanced vulnerability management platform with terminal-grade security scanning. Discover assets, scan for threats, calculate CVSS scores." />
    <meta name="theme-color" content="#0a0a0a" />
    <title>SentinelScan — Terminal-Grade Vulnerability Platform</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Verify:** Check browser devtools → Network tab, no Google Fonts loaded
**Commit:** `style(landing): remove Outfit font, commit to JetBrains Mono`

---

### Task 1.3: Brutalist Button — rounded-none, border-2, no transitions
**File:** `src/components/ui/button.tsx`
**Test:** `src/components/ui/button.test.tsx`
**Depends:** none

**Design Decision:** Button uses `rounded-none`, `border-2`, no transitions (brutalist = instant). Default variant uses terminal-green background with dark text. Destructive uses danger red. Outline uses transparent with border. All variants use monospace font.

```typescript
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-bold font-mono uppercase tracking-wider border-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--terminal-green)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 rounded-none",
  {
    variants: {
      variant: {
        default: "bg-[var(--terminal-green)] text-[var(--bg-primary)] border-[var(--terminal-green)] hover:bg-[var(--terminal-green)]/90",
        destructive:
          "bg-[var(--danger)] text-white border-[var(--danger)] hover:bg-[var(--danger)]/90",
        outline:
          "border-[var(--border)] bg-transparent text-[var(--text-primary)] hover:bg-[var(--terminal-green)]/10 hover:border-[var(--terminal-green)]",
        secondary:
          "bg-[var(--bg-secondary)] text-[var(--text-primary)] border-[var(--border)] hover:bg-[var(--bg-hover)]",
        ghost: "border-transparent hover:bg-[var(--terminal-green)]/10 hover:text-[var(--terminal-green)]",
        link: "text-[var(--terminal-green)] underline-offset-4 hover:underline border-transparent",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

**Test file:**

```typescript
import { render, screen } from "@testing-library/react"
import { Button } from "./button"
import { cn } from "@/lib/utils"

describe("Button - Brutalist Style", () => {
  it("renders with default variant", () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole("button", { name: /click me/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass("bg-[var(--terminal-green)]")
    expect(button).toHaveClass("rounded-none")
    expect(button).toHaveClass("border-2")
    expect(button).toHaveClass("font-mono")
  })

  it("renders with destructive variant", () => {
    render(<Button variant="destructive">Delete</Button>)
    const button = screen.getByRole("button", { name: /delete/i })
    expect(button).toHaveClass("bg-[var(--danger)]")
  })

  it("renders with outline variant", () => {
    render(<Button variant="outline">Outline</Button>)
    const button = screen.getByRole("button", { name: /outline/i })
    expect(button).toHaveClass("border-[var(--border)]")
    expect(button).toHaveClass("bg-transparent")
  })

  it("applies size classes correctly", () => {
    render(<Button size="lg">Large</Button>)
    const button = screen.getByRole("button", { name: /large/i })
    expect(button).toHaveClass("h-11")
    expect(button).toHaveClass("px-8")
  })

  it("has no rounded corners", () => {
    render(<Button>Rounded None</Button>)
    const button = screen.getByRole("button", { name: /rounded none/i })
    expect(button.className).toContain("rounded-none")
    expect(button.className).not.toContain("rounded-md")
  })

  it("uses monospace font", () => {
    render(<Button>Mono</Button>)
    const button = screen.getByRole("button", { name: /mono/i })
    expect(button).toHaveClass("font-mono")
  })
})
```

**Verify:** `bun test src/components/ui/button.test.tsx`
**Commit:** `style(ui): make button brutalist with rounded-none and border-2`

---

### Task 1.4: Brutalist Card — No Shadows, Borders Only
**File:** `src/components/ui/card.tsx`
**Test:** `src/components/ui/card.test.tsx`
**Depends:** none

**Design Decision:** Remove all shadows. Use `rounded-none`. Borders are harsh (`border-2`). Background uses `--bg-secondary`. No hover transitions.

```typescript
import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-none border-2 bg-[var(--bg-secondary)] text-[var(--text-primary)]",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6 border-b-2 border-[var(--border)]", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-2xl font-bold leading-none tracking-tight font-mono uppercase",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-[var(--text-secondary)] font-mono", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0 border-t-2 border-[var(--border)]", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
```

**Test file:**

```typescript
import { render, screen } from "@testing-library/react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./card"

describe("Card - Brutalist Style", () => {
  it("renders with no shadow and rounded-none", () => {
    render(<Card>Card content</Card>)
    const card = screen.getByText("Card content")
    expect(card).toHaveClass("rounded-none")
    expect(card).toHaveClass("border-2")
    expect(card.className).not.toContain("shadow")
  })

  it("uses brutalist background", () => {
    render(<Card>Background</Card>)
    const card = screen.getByText("Background")
    expect(card).toHaveClass("bg-[var(--bg-secondary)]")
  })

  it("CardHeader has bottom border", () => {
    render(
      <Card>
        <CardHeader>Header</CardHeader>
      </Card>
    )
    const header = screen.getByText("Header")
    expect(header).toHaveClass("border-b-2")
  })

  it("CardTitle uses monospace and uppercase", () => {
    render(
      <Card>
        <CardTitle>Test Title</CardTitle>
      </Card>
    )
    const title = screen.getByText("Test Title")
    expect(title).toHaveClass("font-mono")
    expect(title).toHaveClass("uppercase")
  })

  it("CardFooter has top border", () => {
    render(
      <Card>
        <CardFooter>Footer</CardFooter>
      </Card>
    )
    const footer = screen.getByText("Footer")
    expect(footer).toHaveClass("border-t-2")
  })
})
```

**Verify:** `bun test src/components/ui/card.test.tsx`
**Commit:** `style(ui): make card brutalist with no shadows and harsh borders`

---

### Task 1.5: Brutalist Badge — Monospace, Sharp Corners
**File:** `src/components/ui/badge.tsx`
**Test:** `src/components/ui/badge.test.tsx`
**Depends:** none

**Design Decision:** Replace `rounded-full` with `rounded-none`. Use monospace font. Default variant uses terminal-green background. Borders are visible. No transitions.

```typescript
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-none border-2 px-2.5 py-0.5 text-xs font-bold font-mono uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[var(--terminal-green)] focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-[var(--terminal-green)] bg-[var(--terminal-green)] text-[var(--bg-primary)]",
        secondary:
          "border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)]",
        destructive:
          "border-[var(--danger)] bg-[var(--danger)] text-white",
        outline: "border-[var(--terminal-green)] text-[var(--terminal-green)] bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
```

**Test file:**

```typescript
import { render, screen } from "@testing-library/react"
import { Badge } from "./badge"

describe("Badge - Brutalist Style", () => {
  it("renders with rounded-none and border-2", () => {
    render(<Badge>Badge text</Badge>)
    const badge = screen.getByText("Badge text")
    expect(badge).toHaveClass("rounded-none")
    expect(badge).toHaveClass("border-2")
    expect(badge).toHaveClass("font-mono")
  })

  it("uses terminal-green for default variant", () => {
    render(<Badge>Default</Badge>)
    const badge = screen.getByText("Default")
    expect(badge).toHaveClass("bg-[var(--terminal-green)]")
  })

  it("uses uppercase text", () => {
    render(<Badge>Lowercase</Badge>)
    const badge = screen.getByText("Lowercase")
    expect(badge).toHaveClass("uppercase")
  })

  it("renders destructive variant correctly", () => {
    render(<Badge variant="destructive">Error</Badge>)
    const badge = screen.getByText("Error")
    expect(badge).toHaveClass("bg-[var(--danger)]")
  })

  it("renders outline variant correctly", () => {
    render(<Badge variant="outline">Outline</Badge>)
    const badge = screen.getByText("Outline")
    expect(badge).toHaveClass("bg-transparent")
    expect(badge).toHaveClass("border-[var(--terminal-green)]")
  })
})
```

**Verify:** `bun test src/components/ui/badge.test.tsx`
**Commit:** `style(ui): make badge brutalist with rounded-none and monospace`

---

## Batch 2: Terminal Component (1 implementer)

Depends on Batch 1 completing (needs updated CSS variables).

---

### Task 2.1: Extract and Style TerminalWindow Component
**File:** `src/components/TerminalWindow.tsx`
**Test:** `src/components/TerminalWindow.test.tsx`
**Depends:** 1.1 (CSS variables)

**Design Decision:** Extract TerminalWindow from Index.tsx into its own component file. Apply `rounded-none`, use terminal-green for accents, add scanlines overlay option. The component is already well-structured, just needs brutalist styling.

```typescript
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
        <div className="w-3 h-3 rounded-none bg-[var(--danger)]/60" />
        <div className="w-3 h-3 rounded-none bg-[var(--warning)]/60" />
        <div className="w-3 h-3 rounded-none bg-[var(--terminal-green)]/60" />
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
    type === 'critical' ? 'text-[var(--danger)]' :
    type === 'high' ? 'text-[var(--warning)]' :
    type === 'medium' ? 'text-[var(--warning)]/70' :
    type === 'command' ? 'text-[var(--terminal-green)]' :
    type === 'cursor' ? 'text-[var(--terminal-green)] animate-pulse inline-block' :
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
```

**Test file:**

```typescript
import { render, screen } from "@testing-library/react"
import { TerminalWindow, TerminalLine, SentinelScanTerminal } from "./TerminalWindow"

describe("TerminalWindow - Brutalist Style", () => {
  it("renders with rounded-none and border-2", () => {
    render(<TerminalWindow>Content</TerminalWindow>)
    const terminal = screen.getByText("Content").parentElement
    expect(terminal).toHaveClass("rounded-none")
    expect(terminal).toHaveClass("border-2")
  })

  it("shows scanlines overlay when enabled", () => {
    render(<TerminalWindow showScanlines>Content</TerminalWindow>)
    const overlay = document.querySelector(".bg-scanlines")
    expect(overlay).toBeInTheDocument()
  })

  it("displays custom title", () => {
    render(<TerminalWindow title="custom://terminal">Content</TerminalWindow>)
    expect(screen.getByText("custom://terminal")).toBeInTheDocument()
  })

  it("TerminalLine applies correct color classes", () => {
    render(<TerminalLine content="test" type="critical" />)
    const line = screen.getByText("test")
    expect(line).toHaveClass("text-[var(--danger)]")
  })

  it("SentinelScanTerminal renders all lines", () => {
    render(<SentinelScanTerminal />)
    expect(screen.getByText("$ sentinelscan --target 192.168.1.0/24")).toBeInTheDocument()
    expect(screen.getByText(/CVE-2024-6387/)).toBeInTheDocument()
    expect(screen.getByText("▌")).toBeInTheDocument()
  })

  it("uses monospace font", () => {
    render(<TerminalWindow>Mono</TerminalWindow>)
    const content = screen.getByText("Mono")
    expect(content).toHaveClass("font-mono")
  })
})
```

**Verify:** `bun test src/components/TerminalWindow.test.tsx`
**Commit:** `refactor(components): extract TerminalWindow with brutalist styling`

---

## Batch 3: Landing Page Overhaul (1 implementer)

Depends on Batch 1 (CSS variables, shadcn components) and Batch 2 (TerminalWindow component).

---

### Task 3.1: Overhaul Landing Page — Full Brutalist Treatment
**File:** `src/pages/Index/index.tsx`
**Test:** `src/pages/Index/index.test.tsx`
**Depends:** 1.1, 1.3, 1.4, 1.5, 2.1

**Design Decision:** Complete overhaul of Index.tsx:
- Remove Outfit font references (already done in CSS, but ensure no inline styles use it)
- Apply `rounded-none` to ALL elements
- Navbar: monospace, terminal green active states
- HeroSection: scanlines overlay, `animate-glitch-1` on heading
- Replace GopherSection with ASCII art "Built with Go" terminal diagram
- StatsSection: raw `<div>` elements, no cards, monospace counters
- FeaturesSection: `border-2` boxes in grid, no shadows
- CTASection: harsh borders, scanlines overlay
- FooterSection: minimal, monospace, dark bg
- All transitions removed (already done in CSS)

```typescript
import { useEffect, useRef, useState, useCallback } from "react"
import { Link } from "react-router-dom"
import {
  ArrowRight,
  BarChart3,
  Clock,
  FileText,
  Lock,
  Search,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Terminal,
  Cpu,
  Menu,
  X,
  ChevronRight,
} from "lucide-react"
import { SentinelScanTerminal } from "@/components/TerminalWindow"

/* ──────────────────────────────────────
   Data Constants
   ────────────────────────────────────── */
const stats = [
  {
    id: "assets-scanned",
    number: "1,247",
    label: "Assets Scanned",
    icon: <Cpu className="h-4 w-4" />,
    detail: "Across 89 organizations",
  },
  {
    id: "cves-detected",
    number: "52,841",
    label: "CVEs Detected",
    icon: <ShieldAlert className="h-4 w-4" />,
    detail: "YTD and counting",
  },
  {
    id: "accuracy-rate",
    number: "94.7%",
    label: "Accuracy Rate",
    icon: <ShieldCheck className="h-4 w-4" />,
    detail: "Verified by CVSS v3.1",
  },
  {
    id: "monitoring",
    number: "24/7",
    label: "Monitoring",
    icon: <Zap className="h-4 w-4" />,
    detail: "Real‑time threat feed",
  },
]

const features = [
  {
    id: "asset-discovery",
    icon: <Search className="h-6 w-6" />,
    title: "Asset Discovery & Scanning",
    desc: "Automatically discover and scan IP ranges, domains, and network assets for vulnerabilities using advanced scanning templates.",
  },
  {
    id: "cvss-scoring",
    icon: <ShieldAlert className="h-6 w-6" />,
    title: "CVSS Risk Scoring",
    desc: "Calculate vulnerability severity using CVSS v3.1 standard with detailed technical analysis and proof‑of‑concept data.",
  },
  {
    id: "executive-reporting",
    icon: <FileText className="h-6 w-6" />,
    title: "Executive Reporting",
    desc: "Generate comprehensive PDF reports with charts, threat prioritization, and delta analysis for security teams and management.",
  },
  {
    id: "scheduled-automation",
    icon: <Clock className="h-6 w-6" />,
    title: "Scheduled Automation",
    desc: "Set up automated scanning schedules and real‑time monitoring to maintain continuous security posture.",
  },
  {
    id: "credentialed-scanning",
    icon: <Lock className="h-6 w-6" />,
    title: "Credentialed Scanning",
    desc: "Perform authenticated scans via SSH/RDP for deeper vulnerability detection and configuration analysis.",
  },
  {
    id: "risk-analytics",
    icon: <BarChart3 className="h-6 w-6" />,
    title: "Risk Analytics",
    desc: "Visualize vulnerability trends, severity distribution, and remediation progress with interactive dashboards.",
  },
]

const footerLinks = {
  Product: ["Features", "Security", "Integrations"],
  Company: ["About", "Contact", "Privacy"],
}

/* ──────────────────────────────────────
   Utility: Intersection Observer Hook
   ────────────────────────────────────── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          obs.unobserve(el)
        }
      },
      { threshold },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])

  return { ref, inView }
}

/* ──────────────────────────────────────
   Smooth Scroll
   ────────────────────────────────────── */
function useSmoothScroll() {
  return useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
  }, [])
}

/* ──────────────────────────────────────
   Animated Counter
   ────────────────────────────────────── */
function AnimatedCounter({
  target,
  label,
  suffix = "",
}: {
  target: string
  label: string
  suffix?: string
}) {
  const { ref, inView } = useInView(0.3)
  const numeric = parseInt(target.replace(/[^0-9]/g, ""), 10) || 0
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!inView) return
    const duration = 1800
    const start = performance.now()
    const animate = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * numeric))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [inView, numeric])

  const display = target.includes("/")
    ? target
    : count.toLocaleString() + suffix

  return (
    <div ref={ref} className="text-center">
      <span className="block font-mono text-3xl lg:text-4xl font-bold text-[var(--terminal-green)] tabular-nums">
        {inView ? display : "0"}
      </span>
      <span className="text-[10px] uppercase tracking-[0.3em] text-[var(--text-secondary)] font-mono">
        {label}
      </span>
    </div>
  )
}

/* ──────────────────────────────────────
   Navbar – Terminal Brutalism
   ────────────────────────────────────── */
function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="sticky top-0 w-full z-50 bg-[var(--bg-primary)]/95 border-b-2 border-[var(--border)] backdrop-blur-sm">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 font-mono font-black text-lg text-[var(--terminal-green)] tracking-tighter no-underline uppercase"
        >
          <Terminal className="h-5 w-5" />
          <span>SentinelScan</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-mono uppercase tracking-wider text-[var(--text-secondary)]">
          <a
            href="#features"
            className="hover:text-[var(--terminal-green)]"
          >
            Features
          </a>
          <Link
            to="/login"
            className="hover:text-[var(--terminal-green)]"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="bg-[var(--terminal-green)] text-[var(--bg-primary)] px-4 py-2 font-bold uppercase border-2 border-[var(--terminal-green)]"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-[var(--text-secondary)] hover:text-[var(--terminal-green)]"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-[var(--bg-primary)]/95 border-t-2 border-[var(--border)] px-6 py-4 space-y-4">
          <a
            href="#features"
            className="block text-sm font-mono uppercase text-[var(--text-secondary)] hover:text-[var(--terminal-green)]"
            onClick={() => setOpen(false)}
          >
            Features
          </a>
          <Link
            to="/login"
            className="block text-sm font-mono uppercase text-[var(--text-secondary)] hover:text-[var(--terminal-green)]"
            onClick={() => setOpen(false)}
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="block text-sm font-mono uppercase bg-[var(--terminal-green)] text-[var(--bg-primary)] px-4 py-2 text-center font-bold border-2 border-[var(--terminal-green)]"
            onClick={() => setOpen(false)}
          >
            Get Started
          </Link>
        </div>
      )}
    </nav>
  )
}

/* ──────────────────────────────────────
   Hero Section
   ────────────────────────────────────── */
function HeroSection({ onLearnMore }: { onLearnMore: () => void }) {
  return (
    <header className="relative pt-20 pb-28 lg:pt-36 lg:pb-44 overflow-hidden">
      {/* Background atmosphere */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(0,255,65,0.05),transparent_60%)]" />
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
        <div className="absolute inset-0 bg-scanlines opacity-10" />
        <div className="absolute inset-0 bg-noise opacity-[0.015]" />
      </div>

      <div className="container mx-auto px-6 grid lg:grid-cols-[1fr_1.1fr] gap-16 items-center">
        <div className="space-y-8 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 border-2 border-[var(--terminal-green)]/30 bg-[var(--terminal-green)]/5 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.25em] text-[var(--terminal-green)]">
            <Terminal className="h-3.5 w-3.5" />
            v1.0.0 Beta — Now Active
          </div>

          <h1 className="text-4xl lg:text-6xl xl:text-7xl font-black tracking-tighter text-[var(--text-primary)] leading-[1.05] font-mono animate-glitch-1">
            SentinelScan
            <br />
            <span className="text-[var(--text-secondary)] text-2xl lg:text-4xl font-normal tracking-wide">
              Vulnerability Platform
            </span>
          </h1>

          <p className="text-base lg:text-lg text-[var(--text-secondary)] max-w-lg mx-auto lg:mx-0 leading-relaxed font-mono">
            Advanced vulnerability management for modern enterprises. Discover
            assets, scan for threats, calculate CVSS scores, and generate
            executive reports — automated, precise, relentless.
          </p>

          <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
            <Link
              to="/login"
              className="group bg-[var(--terminal-green)] text-[var(--bg-primary)] px-8 py-3 font-bold font-mono text-sm uppercase tracking-wider border-2 border-[var(--terminal-green)] inline-flex items-center justify-center gap-2"
            >
              Start Scanning
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              onClick={onLearnMore}
              className="border-2 border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--terminal-green)] hover:text-[var(--terminal-green)] px-8 py-3 font-mono text-sm uppercase tracking-wider bg-transparent"
            >
              Learn More
            </button>
          </div>
        </div>

        <div className="hidden lg:block">
          <SentinelScanTerminal />
        </div>
      </div>
    </header>
  )
}

/* ──────────────────────────────────────
   Go Terminal Diagram Section
   ────────────────────────────────────── */
function GoTerminalSection() {
  return (
    <section className="py-24 bg-[var(--bg-primary)] border-y-2 border-[var(--border)]">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* ASCII Art / Terminal Diagram */}
          <div className="relative">
            <div className="absolute -inset-4 bg-[var(--terminal-green)]/5 blur-2xl opacity-20" />
            <TerminalWindow title="gopher://sentinel" showScanlines>
              <div className="text-[var(--terminal-green)] font-bold mb-2">
                $ go version
              </div>
              <div className="mb-4">go version go1.22.0 linux/amd64</div>
              
              <div className="text-[var(--terminal-green)] font-bold mb-2">
                $ cat BUILT_WITH_GO.md
              </div>
              <pre className="text-[var(--text-secondary)] text-[10px] leading-relaxed">
{`  ┌─────────────────────────────────────────┐
  │  SENTINELSCAN CORE - GOLANG POWER    │
  ├─────────────────────────────────────────┤
  │                                         │
  │   ██████╗  ██████╗ ███████╗           │
  │   ██╔════╝ ██╔═══╝ ╚══███╔╝           │
  │   ██║  ███╗██║  ███╗  ███╔╝            │
  │   ██║   ██║██║   ██║ ███╔╝             │
  │   ╚██████╔╝╚██████╔╝███████╗           │
  │    ╚═════╝  ╚═════╝ ╚══════╝           │
  │                                         │
  │  ✓ Concurrent scanning (goroutines)     │
  │  ✓ Minimal footprint (single binary)    │
  │  ✓ Cross-platform (Linux/macOS/Win)     │
  │  ✓ Native performance (compiled)        │
  │                                         │
  └─────────────────────────────────────────┘`}
              </pre>
              
              <div className="text-[var(--terminal-green)] font-bold mt-4 mb-2">
                $ go build -o sentinelscan main.go
              </div>
              <div className="text-[var(--warning)]">
                ✓ Build successful — 12.4MB binary
              </div>
              <div className="inline-block animate-pulse text-[var(--terminal-green)] mt-2">▌</div>
            </TerminalWindow>
          </div>

          {/* Text content */}
          <div className="space-y-6 font-mono">
            <div className="inline-flex items-center gap-2 border-2 border-[var(--terminal-green)]/30 bg-[var(--terminal-green)]/5 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-[var(--terminal-green)]">
              <Terminal className="h-3.5 w-3.5" />
              Built with Go
            </div>

            <h2 className="text-3xl lg:text-4xl font-black text-[var(--text-primary)] tracking-tighter">
              Engineered with <span className="text-[var(--terminal-green)]">Go</span>
            </h2>

            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
              SentinelScan's core is built with <strong className="text-[var(--text-primary)]">Go (Golang)</strong> — 
              delivering lightning-fast vulnerability scanning, concurrent asset discovery, 
              and a minimal resource footprint.
            </p>

            <div className="space-y-3 text-sm text-[var(--text-secondary)]">
              <div className="flex items-start gap-2">
                <ChevronRight className="h-4 w-4 text-[var(--terminal-green)] mt-0.5" />
                <span>
                  <strong className="text-[var(--text-primary)]">Concurrent scanning</strong> — 
                  thousands of assets per minute via goroutines
                </span>
              </div>
              <div className="flex items-start gap-2">
                <ChevronRight className="h-4 w-4 text-[var(--terminal-green)] mt-0.5" />
                <span>
                  <strong className="text-[var(--text-primary)]">Minimal footprint</strong> — 
                  single binary, no heavy runtime dependencies
                </span>
              </div>
              <div className="flex items-start gap-2">
                <ChevronRight className="h-4 w-4 text-[var(--terminal-green)] mt-0.5" />
                <span>
                  <strong className="text-[var(--text-primary)]">Cross-platform</strong> — 
                  Linux, macOS, Windows, and containers
                </span>
              </div>
            </div>

            <a
              href="https://go.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[var(--terminal-green)] text-[var(--bg-primary)] px-6 py-2.5 font-bold font-mono text-xs uppercase tracking-wider border-2 border-[var(--terminal-green)]"
            >
              Learn about Go
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ──────────────────────────────────────
   Stats Section — Brutalist (No Cards)
   ────────────────────────────────────── */
function StatsSection() {
  return (
    <section
      aria-label="Statistics"
      className="border-y-2 border-[var(--border)] bg-[var(--bg-secondary)]/30"
    >
      <div className="container mx-auto px-6 py-14">
        <h2 className="sr-only">Key Statistics</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.id} className="border-2 border-[var(--border)] p-6 text-center">
              <div className="flex items-center justify-center gap-2 text-[var(--terminal-green)] mb-3">
                {stat.icon}
              </div>
              <AnimatedCounter target={stat.number} label={stat.label} />
              <p className="text-[10px] text-[var(--text-secondary)] mt-2 font-mono">
                {stat.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ──────────────────────────────────────
   Features Section — Brutalist Grid
   ────────────────────────────────────── */
function FeaturesSection() {
  return (
    <section
      id="features"
      aria-label="Features"
      className="container mx-auto px-6 py-28"
    >
      <div className="text-center mb-18 space-y-4">
        <h2 className="text-3xl lg:text-5xl font-black text-[var(--text-primary)] tracking-tighter font-mono">
          <span className="text-[var(--terminal-green)]">&gt;</span> Capabilities
        </h2>
        <p className="text-[var(--text-secondary)] max-w-xl mx-auto font-mono text-sm">
          Everything to identify, analyze, and remediate vulnerabilities —
          unified in one platform.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-0">
        {features.map((feature) => (
          <article
            key={feature.id}
            className="border-2 border-[var(--border)] p-7 hover:border-[var(--terminal-green)]/60"
          >
            <div className="mb-4 text-[var(--terminal-green)]/70">
              {feature.icon}
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)] font-mono mb-3 uppercase">
              {feature.title}
            </h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-mono">
              {feature.desc}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}

/* ──────────────────────────────────────
   CTA Section — Harsh Borders + Scanlines
   ────────────────────────────────────── */
function CTASection() {
  return (
    <section
      aria-label="Call to Action"
      className="container mx-auto px-6 py-24 text-center relative"
    >
      {/* Scanlines overlay */}
      <div className="absolute inset-0 bg-scanlines opacity-10 pointer-events-none" />
      
      <div className="relative border-2 border-[var(--terminal-green)]/30 p-12 lg:p-16 space-y-6">
        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[var(--terminal-green)]/40" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[var(--terminal-green)]/40" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[var(--terminal-green)]/40" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[var(--terminal-green)]/40" />

        <h2 className="text-3xl lg:text-5xl font-black text-[var(--text-primary)] tracking-tighter font-mono">
          Ready to Secure Your Infrastructure?
        </h2>
        <p className="text-[var(--text-secondary)] max-w-lg mx-auto font-mono text-sm">
          Join security teams worldwide who trust SentinelScan for
          vulnerability assessment.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 bg-[var(--terminal-green)] text-[var(--bg-primary)] px-10 py-3 font-bold font-mono text-sm uppercase tracking-wider border-2 border-[var(--terminal-green)]"
        >
          Get Started Today
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  )
}

/* ──────────────────────────────────────
   Footer — Minimal, Monospace, Dark
   ────────────────────────────────────── */
function FooterSection() {
  return (
    <footer
      role="contentinfo"
      className="border-t-2 border-[var(--border)] bg-[var(--bg-secondary)]/50"
    >
      <div className="container mx-auto px-6 py-14">
        <div className="flex flex-col md:flex-row justify-between gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Terminal className="h-5 w-5 text-[var(--terminal-green)]" />
              <span className="text-xl font-black text-[var(--text-primary)] font-mono tracking-tight uppercase">
                SentinelScan
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] font-mono max-w-xs">
              Advanced Vulnerability Assessment Platform for secure enterprises.
            </p>
          </div>
          <div className="flex gap-20">
            {Object.entries(footerLinks).map(([category, links]) => (
              <nav aria-label={`${category} navigation`} key={category}>
                <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-[var(--text-secondary)] font-mono mb-4">
                  {category}
                </h4>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link}>
                      <a
                        href={`#${link.toLowerCase()}`}
                        className="text-xs text-[var(--text-secondary)] hover:text-[var(--terminal-green)] font-mono"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>
        <div className="mt-14 pt-8 border-t-2 border-[var(--border)] text-center text-[10px] text-[var(--text-secondary)] font-mono uppercase tracking-wider">
          &copy; {new Date().getFullYear()} SentinelScan. Built for
          Professional Security Audits.
        </div>
      </div>
    </footer>
  )
}

/* ──────────────────────────────────────
   Skip Link (Accessibility)
   ────────────────────────────────────── */
function SkipLink() {
  return (
    <a
      href="#features"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-[var(--terminal-green)] focus:text-[var(--bg-primary)] focus:px-4 focus:py-2 focus:font-mono focus:text-sm focus:font-bold uppercase"
    >
      Skip to content
    </a>
  )
}

/* ──────────────────────────────────────
   Main Landing Page
   ────────────────────────────────────── */
export default function Index() {
  const scrollToFeatures = useSmoothScroll()

  return (
    <>
      <SkipLink />
      <Navbar />

      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] selection:bg-[var(--terminal-green)]/30 selection:text-[var(--terminal-green)]">
        <HeroSection onLearnMore={() => scrollToFeatures("features")} />
        <GoTerminalSection />
        <StatsSection />
        <FeaturesSection />
        <CTASection />
        <FooterSection />
      </div>
    </>
  )
}
```

**Test file:**

```typescript
import { render, screen } from "@testing-library/react"
import { BrowserRouter } from "react-router-dom"
import Index from "./index"

describe("Index Page - Terminal Brutalism", () => {
  it("renders all sections", () => {
    render(
      <BrowserRouter>
        <Index />
      </BrowserRouter>
    )
    
    expect(screen.getByText("SentinelScan")).toBeInTheDocument()
    expect(screen.getByText(/Vulnerability Platform/)).toBeInTheDocument()
    expect(screen.getByText(/Built with Go/)).toBeInTheDocument()
    expect(screen.getByText(/Capabilities/)).toBeInTheDocument()
    expect(screen.getByText(/Ready to Secure/)).toBeInTheDocument()
  })

  it("uses JetBrains Mono font (monospace)", () => {
    render(
      <BrowserRouter>
        <Index />
      </BrowserRouter>
    )
    
    // Check that body or main elements use monospace
    const body = document.querySelector("body")
    expect(body).toBeInTheDocument()
  })

  it("has no rounded corners on key elements", () => {
    render(
      <BrowserRouter>
        <Index />
      </BrowserRouter>
    )
    
    // Check Navbar has border-2 not rounded
    const nav = screen.getByRole("navigation")
    expect(nav.className).toContain("border-b-2")
  })

  it("displays terminal-style Go section instead of Gopher", () => {
    render(
      <BrowserRouter>
        <Index />
      </BrowserRouter>
    )
    
    expect(screen.getByText(/Engineered with Go/)).toBeInTheDocument()
    expect(screen.getByText(/SENTINELSCAN CORE/)).toBeInTheDocument()
  })

  it("has scanlines overlay in hero and CTA sections", () => {
    render(
      <BrowserRouter>
        <Index />
      </BrowserRouter>
    )
    
    const scanlines = document.querySelectorAll(".bg-scanlines")
    expect(scanlines.length).toBeGreaterThan(0)
  })

  it("stats section uses borders not cards", () => {
    render(
      <BrowserRouter>
        <Index />
      </BrowserRouter>
    )
    
    const statsSection = screen.getByRole("region", { name: /statistics/i })
    expect(statsSection).toHaveClass("border-y-2")
  })
})
```

**Verify:** `bun test src/pages/Index/index.test.tsx`
**Commit:** `feat(landing): full terminal brutalism overhaul with Go terminal section`

---

## Summary

| Batch | Tasks | Description | Implementers |
|-------|-------|-------------|--------------|
| 1 | 1.1–1.5 | Foundation: CSS, HTML, shadcn/ui components | 8 (parallel) |
| 2 | 2.1 | TerminalWindow component extraction | 1 |
| 3 | 3.1 | Landing page full overhaul | 1 |

**Total:** 10 micro-tasks across 3 batches

**Key Design Decisions Made:**
1. **Dark theme only** — No light/dark toggle, brutalism demands commitment
2. **JetBrains Mono exclusively** — Removed Outfit font entirely
3. **No transitions** — Brutalist = instant state changes
4. **`rounded-none` everywhere** — Harsh, angular design
5. **`border-2` for all containers** — Visible, harsh borders
6. **Terminal green (#00ff41) as primary** — Authentic terminal aesthetic
7. **Go Terminal section** — Replaced Gopher image with ASCII art terminal diagram
8. **Stats without cards** — Raw bordered divs with monospace numbers
9. **Scanlines/noise overlays** — Atmospheric background effects
10. **`animate-glitch-1` on hero heading** — Activates dormant animation
