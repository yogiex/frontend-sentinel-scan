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
       <span className="block font-mono text-3xl lg:text-4xl font-bold text-[var(--text-primary)] tabular-nums">
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

  const handleFeatureClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const featuresSection = document.getElementById('features')
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setOpen(!open)
    }
  }

  return (
    <nav className="sticky top-0 w-full z-50 bg-[var(--bg-primary)]/95 border-b-2 border-[var(--border)] backdrop-blur-sm">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
         <Link
            to="/"
            className="flex items-center gap-2 font-mono font-black text-lg text-[var(--text-primary)] tracking-tighter no-underline uppercase focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:outline-none"
          >
           <Terminal className="h-5 w-5" aria-hidden="true" />
           <span>SentinelScan</span>
         </Link>

         {/* Desktop links */}
         <div className="hidden md:flex items-center gap-6 text-sm font-mono uppercase tracking-wider text-[var(--text-secondary)]">
             <a
               href="#features"
               onClick={handleFeatureClick}
               className="hover:text-[var(--text-primary)] focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:outline-none"
             >
              Features
            </a>
            <Link
              to="/login"
              className="hover:text-[var(--text-primary)] focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:outline-none"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="bg-[var(--text-primary)] text-[var(--bg-primary)] px-4 py-2 font-bold uppercase border-2 border-[var(--text-primary)] hover:bg-[var(--primary-dark)] focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:outline-none"
            >
             Get Started
           </Link>
         </div>

         {/* Mobile hamburger */}
         <button
           className="md:hidden text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:outline-none"
           onClick={() => setOpen(!open)}
           onKeyDown={handleKeyDown}
           aria-label="Toggle navigation"
         >
           {open ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
         </button>
       </div>

       {/* Mobile menu */}
       {open && (
         <div className="md:hidden bg-[var(--bg-primary)]/95 border-t-2 border-[var(--border)] px-6 py-4 space-y-4">
            <a
              href="#features"
              onClick={(e) => {
                handleFeatureClick(e)
                setOpen(false)
              }}
              className="block text-sm font-mono uppercase text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:outline-none"
            >
              Features
            </a>
            <Link
              to="/login"
              className="block text-sm font-mono uppercase text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:outline-none"
              onClick={() => setOpen(false)}
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="block text-sm font-mono uppercase bg-[var(--text-primary)] text-[var(--bg-primary)] px-4 py-2 text-center font-bold border-2 border-[var(--text-primary)] hover:bg-[var(--primary-dark)] focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:outline-none"
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
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.05),transparent_60%)]" />
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
        <div className="absolute inset-0 bg-scanlines opacity-10" />
        <div className="absolute inset-0 bg-noise opacity-[0.015]" />
      </div>

      <div className="container mx-auto px-6 grid lg:grid-cols-[1fr_1.1fr] gap-16 items-center">
        <div className="space-y-8 text-center lg:text-left">
           <div className="inline-flex items-center gap-2 border-2 border-[var(--text-primary)]/30 bg-[var(--text-primary)]/5 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.25em] text-[var(--text-primary)]">
            <Terminal className="h-3.5 w-3.5" />
            v1.0.0 Beta — Now Active
          </div>

           <h1 className="text-4xl lg:text-6xl xl:text-7xl font-black tracking-tighter text-[var(--text-primary)] leading-[1.05] font-mono animate-glitch-1 [animation-iteration-count:3] [animation-duration:0.5s] [text-shadow:0_0_30px_rgba(255,255,255,0.3)]">
            SentinelScan
            <br />
            <span className="text-[var(--text-secondary)] text-2xl lg:text-4xl font-normal tracking-wide">
              Vulnerability Platform
            </span>
          </h1>

               <p className="text-sm lg:text-base text-[var(--text-secondary)] max-w-lg mx-auto lg:mx-0 leading-relaxed font-mono">
            Advanced vulnerability management for modern enterprises. Discover
            assets, scan for threats, calculate CVSS scores, and generate
            executive reports — automated, precise, relentless.
          </p>

          <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
             <Link
               to="/login"
               className="group bg-[var(--text-primary)] text-[var(--bg-primary)] px-6 py-2 font-bold font-mono text-sm uppercase tracking-wider border-2 border-[var(--text-primary)] inline-flex items-center justify-center gap-2"
             >
              Start Scanning
              <ArrowRight className="h-4 w-4" />
            </Link>
               <button
               onClick={onLearnMore}
               className="border-2 border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-primary)] hover:text-[var(--text-primary)] px-8 py-3 font-mono text-sm uppercase tracking-wider bg-transparent"
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
function GopherImageSection() {
  return (
    <section className="py-24 bg-[var(--bg-primary)] border-y-2 border-[var(--border)]">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Column - Gopher Image */}
          <div className="relative border-2 border-[var(--border)] p-8 bg-[var(--bg-secondary)]/30">
            <div className="absolute -inset-4 bg-[var(--text-primary)]/5 blur-2xl opacity-20" />
            <img 
              src="/images/gemini.png" 
              alt="SentinelScan Gopher Mascot"
              className="relative z-10 w-full h-auto"
            />
          </div>
          
          {/* Right Column - Description */}
          <div className="space-y-6 font-mono">
            <div className="inline-flex items-center gap-2 border-2 border-[var(--text-primary)]/30 bg-[var(--text-primary)]/5 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-[var(--text-primary)]">
              <Terminal className="h-3.5 w-3.5" />
              Built with Go
            </div>
            
            <h2 className="text-3xl lg:text-4xl font-black text-[var(--text-primary)] tracking-tighter">
              Engineered with <span className="text-[var(--text-secondary)]">Go</span>
            </h2>
            
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
              SentinelScan's core is built with <strong className="text-[var(--text-primary)]">Go (Golang)</strong> — 
              delivering lightning-fast vulnerability scanning, concurrent asset discovery, 
              and a minimal resource footprint.
            </p>

            {/* Additional Go features */}
            <div className="space-y-3 pt-4 border-t-2 border-[var(--border)]">
              <div className="flex items-start gap-3">
                <div className="mt-1 w-2 h-2 bg-[var(--success)] border-2 border-[var(--success)]" />
                <span className="text-sm text-[var(--text-secondary)]">
                  <strong className="text-[var(--text-primary)]">Concurrent Scanning</strong> - Goroutines enable parallel vulnerability checks
                </span>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 w-2 h-2 bg-[var(--info)] border-2 border-[var(--info)]" />
                <span className="text-sm text-[var(--text-secondary)]">
                  <strong className="text-[var(--text-primary)]">Fast Compilation</strong> - Quick builds and deployments
                </span>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 w-2 h-2 bg-[var(--warning)] border-2 border-[var(--warning)]" />
                <span className="text-sm text-[var(--text-secondary)]">
                  <strong className="text-[var(--text-primary)]">Single Binary</strong> - Easy deployment with no dependencies
                </span>
              </div>
            </div>
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
               <div className="flex items-center justify-center gap-2 text-[var(--text-primary)] mb-3">
                 <div className="h-5 w-5">{stat.icon}</div>
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
           <span className="text-[var(--text-secondary)]">&gt;</span> Capabilities
        </h2>
        <p className="text-[var(--text-secondary)] max-w-xl mx-auto font-mono text-sm">
          Everything to identify, analyze, and remediate vulnerabilities —
          unified in one platform.
        </p>
      </div>

         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-0 -m-[1px]">
        {features.map((feature) => (
          <article
            key={feature.id}
            className="border-2 border-[var(--border)] p-7 hover:border-[var(--text-primary)]/60"
          >
             <div className="mb-4 text-[var(--text-primary)]/70">
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
      
      <div className="relative border-2 border-[var(--border)]/60 p-12 lg:p-16 space-y-6">
        {/* Corner decorations */}
         <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[var(--text-primary)]/40" />
         <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[var(--text-primary)]/40" />
         <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[var(--text-primary)]/40" />
         <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[var(--text-primary)]/40" />

        <h2 className="text-3xl lg:text-5xl font-black text-[var(--text-primary)] tracking-tighter font-mono">
          Ready to Secure Your Infrastructure?
        </h2>
        <p className="text-[var(--text-secondary)] max-w-lg mx-auto font-mono text-sm">
          Join security teams worldwide who trust SentinelScan for
          vulnerability assessment.
        </p>
         <Link
           to="/login"
           className="inline-flex items-center gap-2 bg-[var(--text-primary)] text-[var(--bg-primary)] px-10 py-3 font-bold font-mono text-sm uppercase tracking-wider border-2 border-[var(--text-primary)]"
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
               <Terminal className="h-5 w-5 text-[var(--text-primary)]" />
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
                        className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-mono"
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

         <div className="mt-14 pt-8 border-t-2 border-[var(--border)] text-center text-xs text-[var(--text-secondary)] font-mono uppercase tracking-wider">
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
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-[var(--text-primary)] focus:text-[var(--bg-primary)] focus:px-4 focus:py-2 focus:font-mono focus:text-sm focus:font-bold uppercase"
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

      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] selection:bg-[var(--text-primary)]/30 selection:text-[var(--text-primary)]">
        <HeroSection onLearnMore={() => scrollToFeatures("features")} />
        <GopherImageSection />
        <StatsSection />
        <FeaturesSection />
        <CTASection />
        <FooterSection />
      </div>
    </>
  )
}
