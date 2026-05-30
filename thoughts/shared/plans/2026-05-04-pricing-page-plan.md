# Pricing Page Implementation Plan

**Goal:** Build a Terminal Brutalism-styled pricing page with three-tier pricing, feature comparison, FAQ, and navbar integration.

**Architecture:** Public page using extracted Navbar component, reusable pricing subcomponents, and React Router integration. Maintains existing design system (JetBrains Mono, harsh borders, no transitions, monospace).

**Design:** [2026-05-04-pricing-page-design.md](thoughts/shared/designs/2026-05-04-pricing-page-design.md)

---

## Dependency Graph

```
Batch 1 (parallel): 1.1, 1.2, 1.3, 1.4, 1.5, 1.6 [foundation - no deps]
Batch 2 (parallel): 2.1, 2.2, 2.3, 2.4 [core - depends on Batch 1]
```

---

## Batch 1: Foundation (parallel - 6 implementers)

All tasks in this batch have NO dependencies and run simultaneously.

### Task 1.1: Extract & Update Navbar Component
**File:** `src/components/Navbar.tsx`
**Test:** `src/components/Navbar.test.tsx`
**Depends:** none

**Design Decision:** The Navbar was previously a local function inside `src/pages/Index/index.tsx`. I'm extracting it to a reusable component at `src/components/Navbar.tsx` and adding the "Pricing" link to both desktop and mobile menus as specified in the design.

```tsx
// src/components/Navbar.tsx
import { useState, useCallback } from "react"
import { Link } from "react-router-dom"
import { Terminal, Menu, X } from "lucide-react"

function Navbar() {
  const [open, setOpen] = useState(false)

  const handleFeatureClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const featuresSection = document.getElementById('features')
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

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
            {/* Added Pricing link as per design */}
            <Link
              to="/pricing"
              className="hover:text-[var(--text-primary)] focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:outline-none"
            >
              Pricing
            </Link>
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
             {/* Added Pricing link for mobile as per design */}
             <Link
               to="/pricing"
               className="block text-sm font-mono uppercase text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:outline-none"
               onClick={() => setOpen(false)}
             >
               Pricing
             </Link>
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

export default Navbar
```

```tsx
// src/components/Navbar.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Navbar from './Navbar'

describe('Navbar', () => {
  it('renders logo with correct link', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    )
    const logo = screen.getByText('SentinelScan')
    expect(logo).toBeInTheDocument()
    expect(logo.closest('a')).toHaveAttribute('href', '/')
  })

  it('renders Features link', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    )
    expect(screen.getByText('Features')).toBeInTheDocument()
  })

  it('renders Pricing link (added as per design)', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    )
    const pricingLink = screen.getByText('Pricing')
    expect(pricingLink).toBeInTheDocument()
    expect(pricingLink.closest('a')).toHaveAttribute('href', '/pricing')
  })

  it('renders Sign In link', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    )
    expect(screen.getByText('Sign In')).toBeInTheDocument()
  })

  it('toggles mobile menu on hamburger click', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    )
    const hamburger = screen.getByLabelText('Toggle navigation')
    fireEvent.click(hamburger)
    // Mobile menu should show Pricing link
    const mobilePricingLinks = screen.getAllByText('Pricing')
    expect(mobilePricingLinks.length).toBeGreaterThan(0)
  })

  it('uses correct brutalist styling (border-b-2, sticky)', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    )
    const nav = screen.getByRole('navigation')
    expect(nav.className).toContain('border-b-2')
    expect(nav.className).toContain('sticky')
  })
})
```

**Verify:** `npx vitest run src/components/Navbar.test.tsx`
**Commit:** `feat(navbar): extract navbar component and add pricing link`

---

### Task 1.2: Create PricingCard Reusable Component
**File:** `src/components/pricing/PricingCard.tsx`
**Test:** `src/components/pricing/PricingCard.test.tsx`
**Depends:** none

**Design Decision:** Created a dedicated `src/components/pricing/` directory for pricing-specific reusable components. PricingCard accepts all props specified in the design, uses existing CSS variables, and follows Terminal Brutalism guidelines (harsh borders, no transitions, monospace).

```tsx
// src/components/pricing/PricingCard.tsx
import { LucideCheck } from 'lucide-react'

interface PricingCardProps {
  tierName: string
  price: string
  period: string
  description: string
  features: string[]
  isFeatured: boolean
  ctaText: string
  ctaLink: string
}

export default function PricingCard({
  tierName,
  price,
  period,
  description,
  features,
  isFeatured,
  ctaText,
  ctaLink,
}: PricingCardProps) {
  return (
    <div className={`relative p-8 border-2 ${isFeatured ? 'border-[var(--text-primary)]' : 'border-[var(--border)]'} -m-[1px] bg-[var(--bg-primary)]`}>
      {isFeatured && (
        <div className="absolute top-0 right-0 bg-[var(--text-primary)] text-[var(--bg-primary)] text-[10px] uppercase tracking-[0.3em] px-2 py-1">
          Most Popular
        </div>
      )}
      <div className="mb-6">
        <h3 className="text-xl font-bold uppercase">{tierName}</h3>
        <div className="mt-4 flex items-baseline gap-1">
          <span className="text-4xl font-bold">{price}</span>
          {period && <span className="text-[var(--text-secondary)]">{period}</span>}
        </div>
        <p className="mt-2 text-[var(--text-secondary)]">{description}</p>
      </div>
      <ul className="mb-8 space-y-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-2">
            <LucideCheck className="h-4 w-4 text-[var(--success)]" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <a
        href={ctaLink}
        className={`block text-center py-3 px-6 border-2 font-bold uppercase text-sm ${
          isFeatured
            ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] border-[var(--text-primary)]'
            : 'bg-transparent text-[var(--text-primary)] border-[var(--border)] hover:bg-[var(--bg-hover)]'
        }`}
      >
        {ctaText}
      </a>
    </div>
  )
}
```

```tsx
// src/components/pricing/PricingCard.test.tsx
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import PricingCard from './PricingCard'

describe('PricingCard', () => {
  const defaultProps = {
    tierName: 'Starter',
    price: '$0',
    period: '/month',
    description: 'For small teams',
    features: ['Feature 1', 'Feature 2'],
    isFeatured: false,
    ctaText: 'Get Started',
    ctaLink: '/register',
  }

  it('renders tier name in uppercase', () => {
    render(
      <BrowserRouter>
        <PricingCard {...defaultProps} />
      </BrowserRouter>
    )
    expect(screen.getByText('STARTER')).toBeInTheDocument()
  })

  it('renders price and period', () => {
    render(
      <BrowserRouter>
        <PricingCard {...defaultProps} />
      </BrowserRouter>
    )
    expect(screen.getByText('$0')).toBeInTheDocument()
    expect(screen.getByText('/month')).toBeInTheDocument()
  })

  it('renders features with checkmarks', () => {
    render(
      <BrowserRouter>
        <PricingCard {...defaultProps} />
      </BrowserRouter>
    )
    expect(screen.getByText('Feature 1')).toBeInTheDocument()
    const checkmarks = document.querySelectorAll('svg')
    expect(checkmarks.length).toBeGreaterThan(0)
  })

  it('shows featured badge when isFeatured is true', () => {
    render(
      <BrowserRouter>
        <PricingCard {...defaultProps} isFeatured={true} />
      </BrowserRouter>
    )
    expect(screen.getByText('Most Popular')).toBeInTheDocument()
  })

  it('uses correct CTA styling for featured card', () => {
    render(
      <BrowserRouter>
        <PricingCard {...defaultProps} isFeatured={true} />
      </BrowserRouter>
    )
    const cta = screen.getByText('Get Started')
    expect(cta.className).toContain('bg-[var(--text-primary)]')
  })

  it('uses brutalist borders', () => {
    render(
      <BrowserRouter>
        <PricingCard {...defaultProps} />
      </BrowserRouter>
    )
    const card = screen.getByText('STARTER').closest('div')
    expect(card?.className).toContain('border-2')
  })
})
```

**Verify:** `npx vitest run src/components/pricing/PricingCard.test.tsx`
**Commit:** `feat(pricing): add reusable PricingCard component`

---

### Task 1.3: Create FeatureComparison Table Component
**File:** `src/components/pricing/FeatureComparison.tsx`
**Test:** `src/components/pricing/FeatureComparison.test.tsx`
**Depends:** none

**Design Decision:** Static feature data is colocated with the component for simplicity. Uses brutalist table styling with `-m-[1px]` border overlap technique specified in the design. Checkmarks (✓) for included features, dashes for excluded.

```tsx
// src/components/pricing/FeatureComparison.tsx
interface FeatureRow {
  category: string
  feature: string
  starter: boolean
  professional: boolean
  enterprise: boolean
}

const featureRows: FeatureRow[] = [
  // Scanning
  { category: 'Scanning', feature: 'Up to 10 assets', starter: true, professional: false, enterprise: false },
  { category: 'Scanning', feature: 'Unlimited assets', starter: false, professional: true, enterprise: true },
  { category: 'Scanning', feature: '5 scans/month', starter: true, professional: false, enterprise: false },
  { category: 'Scanning', feature: 'Unlimited scans', starter: false, professional: true, enterprise: true },
  // Reporting
  { category: 'Reporting', feature: 'Basic CVSS scoring', starter: true, professional: false, enterprise: false },
  { category: 'Reporting', feature: 'Advanced CVSS v3.1 with PoC', starter: false, professional: true, enterprise: true },
  { category: 'Reporting', feature: 'PDF executive reports', starter: false, professional: true, enterprise: true },
  // Integrations
  { category: 'Integrations', feature: 'API access', starter: false, professional: true, enterprise: true },
  { category: 'Integrations', feature: 'SSO/SAML integration', starter: false, professional: false, enterprise: true },
  { category: 'Integrations', feature: 'Custom scan templates', starter: false, professional: false, enterprise: true },
  // Support
  { category: 'Support', feature: 'Email support', starter: true, professional: false, enterprise: false },
  { category: 'Support', feature: 'Priority email + chat support', starter: false, professional: true, enterprise: false },
  { category: 'Support', feature: 'Dedicated account manager', starter: false, professional: false, enterprise: true },
  { category: 'Support', feature: 'SLA guarantee', starter: false, professional: false, enterprise: true },
  { category: 'Support', feature: 'Team collaboration (5 users)', starter: false, professional: true, enterprise: false },
  { category: 'Support', feature: 'Unlimited users', starter: false, professional: false, enterprise: true },
]

export default function FeatureComparison() {
  return (
    <div className="w-full border-2 border-[var(--border)] -m-[1px] bg-[var(--bg-primary)] p-8">
      <h2 className="text-2xl font-bold uppercase mb-6">> Feature Comparison</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border-2 border-[var(--border)] p-4 text-left uppercase">Feature</th>
              <th className="border-2 border-[var(--border)] p-4 text-center uppercase">Starter</th>
              <th className="border-2 border-[var(--border)] p-4 text-center uppercase">Professional</th>
              <th className="border-2 border-[var(--border)] p-4 text-center uppercase">Enterprise</th>
            </tr>
          </thead>
          <tbody>
            {featureRows.map((row, index) => (
              <tr key={row.feature} className={index % 2 === 0 ? 'bg-[var(--bg-secondary)]' : ''}>
                <td className="border-2 border-[var(--border)] p-4">
                  <span className="text-[var(--text-secondary)] text-sm uppercase mr-2">{row.category}</span>
                  {row.feature}
                </td>
                <td className="border-2 border-[var(--border)] p-4 text-center">
                  {row.starter ? <span className="text-[var(--success)]">✓</span> : <span className="text-[var(--text-secondary)]">-</span>}
                </td>
                <td className="border-2 border-[var(--border)] p-4 text-center">
                  {row.professional ? <span className="text-[var(--success)]">✓</span> : <span className="text-[var(--text-secondary)]">-</span>}
                </td>
                <td className="border-2 border-[var(--border)] p-4 text-center">
                  {row.enterprise ? <span className="text-[var(--success)]">✓</span> : <span className="text-[var(--text-secondary)]">-</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

```tsx
// src/components/pricing/FeatureComparison.test.tsx
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import FeatureComparison from './FeatureComparison'

describe('FeatureComparison', () => {
  it('renders section heading with > prefix', () => {
    render(
      <BrowserRouter>
        <FeatureComparison />
      </BrowserRouter>
    )
    expect(screen.getByText('> Feature Comparison')).toBeInTheDocument()
  })

  it('renders table with correct headers', () => {
    render(
      <BrowserRouter>
        <FeatureComparison />
      </BrowserRouter>
    )
    expect(screen.getByText('Feature')).toBeInTheDocument()
    expect(screen.getByText('Starter')).toBeInTheDocument()
    expect(screen.getByText('Professional')).toBeInTheDocument()
    expect(screen.getByText('Enterprise')).toBeInTheDocument()
  })

  it('displays checkmarks for included features', () => {
    render(
      <BrowserRouter>
        <FeatureComparison />
      </BrowserRouter>
    )
    const checkmarks = document.querySelectorAll('td span')
    expect(checkmarks.length).toBeGreaterThan(0)
  })

  it('uses brutalist borders on table cells', () => {
    render(
      <BrowserRouter>
        <FeatureComparison />
      </BrowserRouter>
    )
    const tableCells = document.querySelectorAll('td, th')
    tableCells.forEach(cell => {
      expect(cell.className).toContain('border-2')
    })
  })

  it('shows category labels for feature rows', () => {
    render(
      <BrowserRouter>
        <FeatureComparison />
      </BrowserRouter>
    )
    expect(screen.getByText('Scanning')).toBeInTheDocument()
    expect(screen.getByText('Reporting')).toBeInTheDocument()
  })
})
```

**Verify:** `npx vitest run src/components/pricing/FeatureComparison.test.tsx`
**Commit:** `feat(pricing): add FeatureComparison table component`

---

### Task 1.4: Create PricingFAQ Component
**File:** `src/components/pricing/PricingFAQ.tsx`
**Test:** `src/components/pricing/PricingFAQ.test.tsx`
**Depends:** none

**Design Decision:** Uses instant open/close accordion (no animations, as per global CSS `transition: none !important`). Question text is uppercase monospace as specified. Includes all 5 FAQ items from the design.

```tsx
// src/components/pricing/PricingFAQ.tsx
import { useState } from 'react'
import { LucideChevronDown } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
}

const faqItems: FAQItem[] = [
  {
    question: 'Can I Change Plans Anytime?',
    answer: 'Yes, you can upgrade or downgrade your plan at any time. If you downgrade, the new rate will apply at the start of your next billing cycle.',
  },
  {
    question: 'What Payment Methods Do You Accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and wire transfers for Enterprise plans.',
  },
  {
    question: 'Is There A Free Trial?',
    answer: 'Yes! Our Starter plan is free forever. For Professional features, you can start a 14-day free trial with no credit card required.',
  },
  {
    question: 'Do You Offer Non-Profit Discounts?',
    answer: 'Yes, we offer 50% discounts for verified non-profit organizations. Contact our sales team to apply for the discount.',
  },
  {
    question: 'Can I Self-Host SentinelScan?',
    answer: 'Yes, Enterprise plans include on-premise deployment options. Our team will assist with the installation and configuration process.',
  },
]

export default function PricingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="w-full border-2 border-[var(--border)] -m-[1px] bg-[var(--bg-primary)] p-8">
      <h2 className="text-2xl font-bold uppercase mb-6">> Frequently Asked Questions</h2>
      <div className="space-y-[-1px]">
        {faqItems.map((item, index) => (
          <div key={item.question} className="border-2 border-[var(--border)]">
            <button
              className="w-full flex justify-between items-center p-4 text-left uppercase font-bold"
              onClick={() => toggle(index)}
            >
              {item.question}
              <LucideChevronDown
                className={`h-5 w-5 ${openIndex === index ? 'rotate-180' : ''}`}
              />
            </button>
            {openIndex === index && (
              <div className="p-4 border-t-2 border-[var(--border)] text-[var(--text-secondary)]">
                {item.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
```

```tsx
// src/components/pricing/PricingFAQ.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import PricingFAQ from './PricingFAQ'

describe('PricingFAQ', () => {
  it('renders section heading with > prefix', () => {
    render(
      <BrowserRouter>
        <PricingFAQ />
      </BrowserRouter>
    )
    expect(screen.getByText('> Frequently Asked Questions')).toBeInTheDocument()
  })

  it('renders all FAQ questions', () => {
    render(
      <BrowserRouter>
        <PricingFAQ />
      </BrowserRouter>
    )
    expect(screen.getByText('Can I Change Plans Anytime?')).toBeInTheDocument()
    expect(screen.getByText('What Payment Methods Do You Accept?')).toBeInTheDocument()
  })

  it('expands FAQ item on click', () => {
    render(
      <BrowserRouter>
        <PricingFAQ />
      </BrowserRouter>
    )
    const firstQuestion = screen.getByText('Can I Change Plans Anytime?')
    fireEvent.click(firstQuestion)
    expect(screen.getByText('Yes, you can upgrade or downgrade your plan at any time.')).toBeInTheDocument()
  })

  it('collapses FAQ item on second click', () => {
    render(
      <BrowserRouter>
        <PricingFAQ />
      </BrowserRouter>
    )
    const firstQuestion = screen.getByText('Can I Change Plans Anytime?')
    fireEvent.click(firstQuestion)
    fireEvent.click(firstQuestion)
    expect(screen.queryByText('Yes, you can upgrade or downgrade your plan at any time.')).not.toBeInTheDocument()
  })

  it('uses brutalist borders on FAQ items', () => {
    render(
      <BrowserRouter>
        <PricingFAQ />
      </BrowserRouter>
    )
    const faqItems = document.querySelectorAll('[class*="border-2"]')
    expect(faqItems.length).toBeGreaterThan(0)
  })
})
```

**Verify:** `npx vitest run src/components/pricing/PricingFAQ.test.tsx`
**Commit:** `feat(pricing): add PricingFAQ accordion component`

---

### Task 1.5: Create PageHeader Component
**File:** `src/pages/Pricing/PageHeader.tsx`
**Test:** `src/pages/Pricing/PageHeader.test.tsx`
**Depends:** none

**Design Decision:** PageHeader manages the billing period toggle as specified in the design. Uses `> PRICING` headline format consistent with other sections. Toggle uses brutalist styling (border-2, no transitions).

```tsx
// src/pages/Pricing/PageHeader.tsx
import { LucideToggleLeft } from 'lucide-react'

interface PageHeaderProps {
  billingPeriod: 'monthly' | 'annual'
  onBillingToggle: () => void
}

export default function PageHeader({ billingPeriod, onBillingToggle }: PageHeaderProps) {
  return (
    <div className="text-center py-16 border-y-2 border-[var(--border)] -m-[1px] bg-[var(--bg-primary)]">
      <h1 className="text-4xl md:text-5xl font-bold uppercase">> Pricing</h1>
      <p className="mt-4 text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
        Simple, Transparent Pricing for Teams of All Sizes
      </p>
      <div className="mt-8 flex items-center justify-center gap-4">
        <span className={`uppercase text-sm ${billingPeriod === 'monthly' ? 'text-[var(--text-primary)] font-bold' : 'text-[var(--text-secondary)]'}`}>
          Monthly
        </span>
        <button
          className="border-2 border-[var(--border)] p-1 w-12 h-6 relative"
          onClick={onBillingToggle}
          aria-label="Toggle billing period"
        >
          <div
            className={`absolute top-1 w-4 h-4 bg-[var(--text-primary)] ${
              billingPeriod === 'annual' ? 'right-1' : 'left-1'
            }`}
          />
        </button>
        <span className={`uppercase text-sm ${billingPeriod === 'annual' ? 'text-[var(--text-primary)] font-bold' : 'text-[var(--text-secondary)]'}`}>
          Annual <span className="text-[var(--success)]">(Save 20%)</span>
        </span>
      </div>
    </div>
  )
}
```

```tsx
// src/pages/Pricing/PageHeader.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import PageHeader from './PageHeader'

describe('PageHeader', () => {
  const defaultProps = {
    billingPeriod: 'monthly' as const,
    onBillingToggle: jest.fn(),
  }

  it('renders heading with > prefix', () => {
    render(
      <BrowserRouter>
        <PageHeader {...defaultProps} />
      </BrowserRouter>
    )
    expect(screen.getByText('> Pricing')).toBeInTheDocument()
  })

  it('renders subheadline', () => {
    render(
      <BrowserRouter>
        <PageHeader {...defaultProps} />
      </BrowserRouter>
    )
    expect(screen.getByText('Simple, Transparent Pricing for Teams of All Sizes')).toBeInTheDocument()
  })

  it('renders billing toggle', () => {
    render(
      <BrowserRouter>
        <PageHeader {...defaultProps} />
      </BrowserRouter>
    )
    expect(screen.getByText('Monthly')).toBeInTheDocument()
    expect(screen.getByText('Annual')).toBeInTheDocument()
  })

  it('calls onBillingToggle when toggle is clicked', () => {
    render(
      <BrowserRouter>
        <PageHeader {...defaultProps} />
      </BrowserRouter>
    )
    const toggle = screen.getByRole('button', { name: /toggle billing period/i })
    fireEvent.click(toggle)
    expect(defaultProps.onBillingToggle).toHaveBeenCalledTimes(1)
  })

  it('highlights selected billing period', () => {
    render(
      <BrowserRouter>
        <PageHeader {...defaultProps} billingPeriod="annual" />
      </BrowserRouter>
    )
    const annualText = screen.getByText('Annual')
    expect(annualText.className).toContain('font-bold')
  })
})
```

**Verify:** `npx vitest run src/pages/Pricing/PageHeader.test.tsx`
**Commit:** `feat(pricing): add PageHeader with billing toggle`

---

### Task 1.6: Create FinalCTA Component
**File:** `src/pages/Pricing/FinalCTA.tsx`
**Test:** `src/pages/Pricing/FinalCTA.test.tsx`
**Depends:** none

**Design Decision:** Mirrors existing CTA section styling from the Index page. Uses two CTAs: filled "Start Free Trial" and outline "Contact Sales". Maintains brutalist styling with border-2 and no transitions.

```tsx
// src/pages/Pricing/FinalCTA.tsx
export default function FinalCTA() {
  return (
    <div className="text-center py-16 border-y-2 border-[var(--border)] -m-[1px] bg-[var(--bg-primary)]">
      <h2 className="text-3xl md:text-4xl font-bold uppercase">> Ready to Secure Your Infrastructure?</h2>
      <p className="mt-4 text-[var(--text-secondary)] max-w-2xl mx-auto">
        Join thousands of teams using SentinelScan to protect their systems.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <a
          href="/register"
          className="py-3 px-8 bg-[var(--text-primary)] text-[var(--bg-primary)] border-2 border-[var(--text-primary)] font-bold uppercase text-sm"
        >
          Start Free Trial
        </a>
        <a
          href="/contact"
          className="py-3 px-8 bg-transparent text-[var(--text-primary)] border-2 border-[var(--border)] font-bold uppercase text-sm hover:bg-[var(--bg-hover)]"
        >
          Contact Sales
        </a>
      </div>
    </div>
  )
}
```

```tsx
// src/pages/Pricing/FinalCTA.test.tsx
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import FinalCTA from './FinalCTA'

describe('FinalCTA', () => {
  it('renders heading with > prefix', () => {
    render(
      <BrowserRouter>
        <FinalCTA />
      </BrowserRouter>
    )
    expect(screen.getByText('> Ready to Secure Your Infrastructure?')).toBeInTheDocument()
  })

  it('renders both CTAs', () => {
    render(
      <BrowserRouter>
        <FinalCTA />
      </BrowserRouter>
    )
    expect(screen.getByText('Start Free Trial')).toBeInTheDocument()
    expect(screen.getByText('Contact Sales')).toBeInTheDocument()
  })

  it('uses correct styling for filled CTA', () => {
    render(
      <BrowserRouter>
        <FinalCTA />
      </BrowserRouter>
    )
    const filledCTA = screen.getByText('Start Free Trial')
    expect(filledCTA.className).toContain('bg-[var(--text-primary)]')
  })

  it('uses correct styling for outline CTA', () => {
    render(
      <BrowserRouter>
        <FinalCTA />
      </BrowserRouter>
    )
    const outlineCTA = screen.getByText('Contact Sales')
    expect(outlineCTA.className).toContain('border-[var(--border)]')
  })
})
```

**Verify:** `npx vitest run src/pages/Pricing/FinalCTA.test.tsx`
**Commit:** `feat(pricing): add FinalCTA component`

---

## Batch 2: Core (parallel - 4 implementers)

All tasks in this batch depend on Batch 1 completing.

### Task 2.1: Update Index Page to Use Extracted Navbar
**File:** `src/pages/Index/index.tsx`
**Test:** `src/pages/Index/index.test.tsx`
**Depends:** 1.1

**Design Decision:** Remove the local Navbar function from Index.tsx and import the extracted Navbar component from `src/components/Navbar.tsx`. This makes the Navbar reusable for the Pricing page and other public pages.

```tsx
// Modified src/pages/Index/index.tsx
// Add to imports at top of file:
import Navbar from '@/components/Navbar'

// Remove the entire Navbar function (lines 183-278 in original file)

// Line 589 remains: <Navbar /> (now uses imported component)
```

No other changes needed to Index.tsx. The existing test will continue to pass since the Navbar's functionality remains the same.

**Verify:** `npx vitest run src/pages/Index/index.test.tsx`
**Commit:** `refactor(index): use extracted Navbar component`

---

### Task 2.2: Create Pricing Page
**File:** `src/pages/Pricing/index.tsx`
**Test:** `src/pages/Pricing/index.test.tsx`
**Depends:** 1.1, 1.2, 1.3, 1.4, 1.5, 1.6

**Design Decision:** Pricing page imports all subcomponents, manages billingPeriod state, and passes it to PageHeader. Uses the extracted Navbar component for consistent navigation. Pricing calculation logic for annual billing (20% discount) is included.

```tsx
// src/pages/Pricing/index.tsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import PageHeader from './PageHeader'
import PricingCard from '@/components/pricing/PricingCard'
import FeatureComparison from '@/components/pricing/FeatureComparison'
import PricingFAQ from '@/components/pricing/PricingFAQ'
import FinalCTA from './FinalCTA'

export default function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly')

  const toggleBilling = () => {
    setBillingPeriod(prev => prev === 'monthly' ? 'annual' : 'monthly')
  }

  const getPrice = (monthlyPrice: number) => {
    if (monthlyPrice === 0) return '$0'
    if (billingPeriod === 'annual') {
      const annualPrice = monthlyPrice * 12 * 0.8
      return `$${annualPrice}`
    }
    return `$${monthlyPrice}`
  }

  const getPeriod = () => {
    return billingPeriod === 'annual' ? '/year' : '/month'
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Navbar />
      
      <PageHeader billingPeriod={billingPeriod} onBillingToggle={toggleBilling} />
      
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 -m-[1px]">
          <PricingCard
            tierName="Starter"
            price={getPrice(0)}
            period={getPeriod()}
            description="For small teams getting started with vulnerability scanning."
            features={[
              'Up to 10 assets',
              '5 scans/month',
              'Basic CVSS scoring',
              'Email support',
              'Community access',
            ]}
            isFeatured={false}
            ctaText="Get Started"
            ctaLink="/register"
          />
          <PricingCard
            tierName="Professional"
            price={getPrice(99)}
            period={getPeriod()}
            description="For growing teams needing advanced scanning and reporting."
            features={[
              'Unlimited assets',
              'Unlimited scans',
              'Advanced CVSS v3.1 with PoC',
              'PDF executive reports',
              'API access',
              'Priority email + chat support',
              'Team collaboration (5 users)',
            ]}
            isFeatured={true}
            ctaText="Start Free Trial"
            ctaLink="/register"
          />
          <PricingCard
            tierName="Enterprise"
            price="Custom"
            period=""
            description="For large organizations with custom requirements."
            features={[
              'Everything in Professional',
              'SSO/SAML integration',
              'Custom scan templates',
              'Dedicated account manager',
              'SLA guarantee',
              'On-premise deployment option',
              'Unlimited users',
            ]}
            isFeatured={false}
            ctaText="Contact Sales"
            ctaLink="/contact"
          />
        </div>
      </div>

      <FeatureComparison />
      <PricingFAQ />
      <FinalCTA />
    </div>
  )
}
```

```tsx
// src/pages/Pricing/index.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Pricing from './index'

describe('Pricing Page', () => {
  it('renders page header', () => {
    render(
      <BrowserRouter>
        <Pricing />
      </BrowserRouter>
    )
    expect(screen.getByText('> Pricing')).toBeInTheDocument()
  })

  it('renders all three pricing cards', () => {
    render(
      <BrowserRouter>
        <Pricing />
      </BrowserRouter>
    )
    expect(screen.getByText('STARTER')).toBeInTheDocument()
    expect(screen.getByText('PROFESSIONAL')).toBeInTheDocument()
    expect(screen.getByText('ENTERPRISE')).toBeInTheDocument()
  })

  it('renders feature comparison section', () => {
    render(
      <BrowserRouter>
        <Pricing />
      </BrowserRouter>
    )
    expect(screen.getByText('> Feature Comparison')).toBeInTheDocument()
  })

  it('renders FAQ section', () => {
    render(
      <BrowserRouter>
        <Pricing />
      </BrowserRouter>
    )
    expect(screen.getByText('> Frequently Asked Questions')).toBeInTheDocument()
  })

  it('toggles billing period', () => {
    render(
      <BrowserRouter>
        <Pricing />
      </BrowserRouter>
    )
    const toggle = screen.getByRole('button', { name: /toggle billing period/i })
    fireEvent.click(toggle)
    expect(screen.getByText('Annual')).toBeInTheDocument()
  })

  it('uses Navbar component', () => {
    render(
      <BrowserRouter>
        <Pricing />
      </BrowserRouter>
    )
    expect(screen.getByText('SentinelScan')).toBeInTheDocument()
  })
})
```

**Verify:** `npx vitest run src/pages/Pricing/index.test.tsx`
**Commit:** `feat(pages): add Pricing page with all sections`

---

### Task 2.3: Update App.tsx to Add /pricing Route
**File:** `src/App.tsx`
**Test:** none (configuration file)
**Depends:** 2.2

**Design Decision:** Add the /pricing route as a public route (before dashboard routes) as specified in the design. Import the Pricing component and add the route.

```tsx
// Modified src/App.tsx
// Add to imports:
import Pricing from './pages/Pricing'

// Add route after line 45 (login route):
<Route path="/pricing" element={<Pricing />} />
```

Full modified App.tsx routes section:
```tsx
<Routes>
  {/* Public Routes */}
  <Route path="/" element={<Index />} />
  <Route path="/login" element={<Login />} />
  <Route path="/pricing" element={<Pricing />} />

  {/* Protected Dashboard Routes */}
  <Route path="/dashboard" element={<DashboardLayout />}>
    {/* ... rest of dashboard routes ... */}
  </Route>
</Routes>
```

**Verify:** `npx vitest run src/App.tsx` (no test needed, manual check: navigate to /pricing)
**Commit:** `feat(routes): add /pricing route to App.tsx`

---

### Task 2.4: Update Index Page Test (if needed)
**File:** `src/pages/Index/index.test.tsx`
**Test:** same file
**Depends:** 2.1

**Design Decision:** The existing test checks for Navbar functionality which remains unchanged. No updates needed to the test file, but verify it still passes after extracting the Navbar.

**Verify:** `npx vitest run src/pages/Index/index.test.tsx`
**Commit:** `test(index): verify tests pass after Navbar extraction`

---

## Terminal Brutalism Compliance Checklist

All components maintain the aesthetic through:
- ✅ JetBrains Mono font (inherited from global CSS)
- ✅ Harsh borders (`border-2 border-[var(--border)]`)
- ✅ No transitions (enforced by global CSS `transition: none !important`)
- ✅ Monospace typography (global `font-family: 'JetBrains Mono'`)
- ✅ No rounded corners (enforced by global CSS `border-radius: 0 !important`)
- ✅ Use of existing CSS variables (`--bg-primary`, `--text-primary`, `--border`, etc.)
- ✅ Uppercase text for headings and navigation
- ✅ `> ` prefix for section headings

---

## Post-Implementation Steps

1. Run all tests: `npx vitest run`
2. Run lint: `npm run lint`
3. Build project: `npm run build`
4. Manual verification:
   - Navigate to `/pricing` and verify page renders
   - Check desktop and mobile Navbar for Pricing link
   - Toggle billing period and verify price updates
   - Expand/collapse FAQ items
   - Check responsive layout on mobile/tablet/desktop
   - Verify no rounded corners or transitions on any elements
