---
date: 2026-05-04
topic: "Pricing Page Design - Terminal Brutalism"
status: validated
---

# Pricing Page Design

## Problem Statement

The SentinelScan landing page lacks pricing transparency, which is a critical barrier for B2B security product conversions. Research shows 67% of B2B buyers consider pricing transparency a top factor in vendor selection. Currently, users must register without knowing costs, creating friction and abandonment.

Additionally, the navbar lacks a "Pricing" link, making it difficult for users to find pricing information. The current CTA flow ("Get Started" → `/register`) is aggressive without providing value-context first.

## Constraints

- Must maintain **Terminal Brutalism** aesthetic (JetBrains Mono, harsh borders, no transitions)
- Must use existing CSS variables (`--bg-primary`, `--text-primary`, `--border`, etc.)
- Must be responsive (mobile-first approach)
- No rounded corners (`border-radius: 0`)
- Monospace typography throughout
- Must integrate with existing React Router setup

## Approach

I'm choosing a **three-tier pricing model** (Starter, Professional, Enterprise) displayed in a brutalist grid with harsh borders. The design will:

1. Use the same `-m-[1px]` border-collapse technique from the Features section
2. Feature a "MOST POPULAR" badge on the Professional tier (brutalist corner badge)
3. Include a feature comparison table with checkmarks
4. Add Pricing link to both desktop and mobile navbar
5. Add route to App.tsx

**Why this approach:**
- Three tiers is the psychological sweet spot (anchoring effect)
- Brutalist aesthetic differentiates from generic SaaS pricing pages
- Feature comparison builds trust through transparency
- Navbar link creates clear conversion path

**Alternatives considered:**
- *Two-tier model* — Rejected because Enterprise buyers expect dedicated enterprise tier
- *Toggle-based feature matrix only* — Rejected because cards convert better for self-serve tiers
- *Separate pricing page with wizard* — Overkill for initial implementation

## Architecture

### Page Components (High-Level)

```
PricingPage/
├── PageHeader (headline + billing toggle)
├── PricingCards (3-column grid)
│   ├── PricingCard (Starter)
│   ├── PricingCard (Professional - featured)
│   └── PricingCard (Enterprise)
├── FeatureComparison (full-width table)
├── PricingFAQ (accordion section)
└── FinalCTA (bottom conversion section)
```

### Navbar Updates

**Desktop:** Add "Pricing" link between "Features" and "Sign In"

**Mobile:** Add "Pricing" link after "Features" in the dropdown menu

### Router

Add `<Route path="/pricing" element={<Pricing />} />` to App.tsx before the dashboard routes.

## Components

### 1. PageHeader
- **Headline:** `> PRICING` (uppercase, monospace, with `>` prefix)
- **Subheadline:** "Simple, Transparent Pricing for Teams of All Sizes"
- **Billing Toggle:** Monthly / Annual toggle (brutalist style - border-2, no transitions)

### 2. PricingCard (Reusable)
**Props:**
- `tierName`: string (e.g., "STARTER", "PROFESSIONAL")
- `price`: string (e.g., "$0", "$99", "Custom")
- `period`: string (e.g., "/month")
- `description`: string
- `features`: array of strings
- `isFeatured`: boolean (adds badge + different CTA style)
- `ctaText`: string
- `ctaLink`: string

**Visual Treatment:**
- Border: `border-2 border-[var(--border)]` (overlap hack: `-m-[1px]`)
- Padding: `p-8`
- Featured card: `border-[var(--text-primary)]` (thicker/more prominent)
- Badge (if featured): "MOST POPULAR" - positioned at top-right corner, `text-[10px] uppercase tracking-[0.3em]`

### 3. FeatureComparison Table
- Full-width table
- Brutalist borders between cells (`border-2 border-[var(--border)]`)
- Checkmark character (✓) for included features
- Monospace numbers for all pricing references
- Rows organized by category (Scanning, Reporting, Integrations, Support)

### 4. PricingFAQ
- 4-5 accordion items
- Questions: "Can I change plans anytime?", "What payment methods do you accept?", "Is there a free trial?", "Do you offer non-profit discounts?"
- Brutalist accordion: instant open/close (no animations)
- Question text: `font-mono uppercase`

### 5. FinalCTA
- Headline: "Ready to Secure Your Infrastructure?"
- Two CTAs: "Start Free Trial" (filled) + "Contact Sales" (outline)
- Same structure as existing CTA section on landing page

## Data Flow

1. User clicks "Pricing" in navbar → navigates to `/pricing`
2. Page loads with all sections
3. User can toggle billing period (Monthly/Annual) → prices update
4. User clicks CTA on a card → navigates to `/register` or `/contact`
5. User expands FAQ items → instant reveal (no animation)

**State Management:**
- `billingPeriod` state (monthly/annual) in PricingPage component
- Passed down to PricingCards as prop
- Prices calculated based on period (annual = monthly * 12 * 0.8 for 20% discount)

## Error Handling

- If pricing data fails to load: Show fallback static content (hardcoded tiers)
- If route not found: Handled by existing error boundary in App.tsx
- If feature flags disable pricing: Redirect to `/contact` with message

## Testing Strategy

- **Unit Tests:** PricingCard component rendering, billing toggle logic
- **Integration Tests:** Navbar link navigation, route rendering
- **Visual Tests:** Screenshot comparisons for desktop/tablet/mobile
- **Accessibility Tests:** Keyboard navigation, screen reader announcements for pricing table

## Pricing Tiers (Content)

### Starter (Free)
- Up to 10 assets
- 5 scans/month
- Basic CVSS scoring
- Email support
- Community access

### Professional ($99/month)
- Unlimited assets
- Unlimited scans
- Advanced CVSS v3.1 with PoC
- PDF executive reports
- API access
- Priority email + chat support
- Team collaboration (5 users)

### Enterprise (Custom)
- Everything in Professional
- SSO/SAML integration
- Custom scan templates
- Dedicated account manager
- SLA guarantee
- On-premise deployment option
- Unlimited users

## Open Questions

1. **Should we show "per user" pricing for Professional tier?** (Currently per month flat rate)
2. **Should annual billing show savings explicitly?** (e.g., "Save 20%" badge)
3. **Should we include a "Compare Plans" anchor link from the hero?** (Smooth scroll to comparison table)
4. **What's the actual pricing strategy?** (Numbers above are placeholders - need product/ business input)

---

**Designer's Note:** This design commits fully to the Terminal Brutalism aesthetic while solving the critical business problem of pricing transparency. The three-tier model with featured middle tier is a proven conversion pattern, and the brutalist execution makes it memorable compared to generic SaaS pricing pages.
