---
date: 2026-05-01
topic: "SentinelScan Frontend Development Plan"
status: draft
---

# SentinelScan Frontend - Design & Implementation Plan

## Problem Statement

Aplikasi frontend untuk **Vulnerability Assessment Scanning Tools** sudah memiliki landing page yang solid, tetapi fitur-fitur utama (Dashboard, Scanning, Reporting) belum diimplementasi. Kita perlu membangun aplikasi lengkap berdasarkan bisnis proses di `bispro.md`.

## Constraints

- **Tech Stack**: React 18 + TypeScript + Vite + Vitest (sudah ada)
- **UI Library**: Shadcn UI (rencana)
- **Styling**: CSS Modules (sudah digunakan di Index page)
- **State Management**: Redux Toolkit + RTK Query (sudah ada di package.json)
- **Charting**: Recharts (sudah ada)
- **Reporting**: @react-pdf/renderer + exceljs (rencana)
- **Mock API**: Saat ini menggunakan mock data di `src/api/client.ts`

## Current State Analysis

### ✅ What's Working
1. **Landing Page (Index)**: Fully functional dengan styling lengkap
   - Hero Section dengan gradient effects
   - Stats, Features, CTA, Footer sections
   - Responsive design (@768px breakpoint)
   - CSS Modules (`styles.module.css` - 381 lines)

2. **Basic Routing**: `/` dan `/login` routes via React Router

3. **Development Environment**:
   - Vite HMR working
   - Vitest configured
   - TypeScript strict mode

### ⏳ What's Missing (From struktur-project.md)
1. **Pages**: Dashboard, ScanDetail, Settings (folder ada, implementasi belum)
2. **Components**: 
   - `src/components/ui/` - Shadcn components (belum ada)
   - `src/components/shared/` - Navbar, Sidebar, Footer (belum ada)
3. **Services**: `src/services/` - Business logic (belum ada)
4. **API Integration**: Masih mock, perlu koneksi ke backend

## Approach

Saya memilih pendekatan **Incremental Development dengan Priority-Based Phasing**:

**Why this approach?**
- ✅ Already have solid foundation (landing page, routing, build system)
- ✅ Can deliver working features incrementally
- ✅ Mock API allows frontend development without backend
- ✅ Risk mitigation: each phase delivers testable features

**Alternative considered:**
- Big Bang approach (semua sekaligus) - **rejected** because high risk, harder to test

## Architecture

### High-Level Structure
```
Frontend (React SPA)
├── Public Pages (Index, Login) - ✅ DONE
├── Protected Pages (Dashboard, ScanDetail, Settings) - ⏳ TODO
├── Shared Components (Navbar, Sidebar) - ⏳ TODO
├── UI Components (Shadcn) - ⏳ TODO
├── Services Layer - ⏳ TODO
│   ├── API Client (Mock → Real)
│   ├── CVSS Calculator
│   └── Reporting Engine
└── State Management (Redux) - ⏳ TODO
```

### Key Components Responsibilities

**1. Layout Components**
- `Navbar`: Navigation, user menu, notifications
- `Sidebar`: Menu navigation untuk dashboard
- `ProtectedLayout`: Wrapper untuk authenticated pages (Navbar + Sidebar + Content)

**2. Dashboard Components**
- `StatsOverview`: Summary cards (Total Assets, Vulnerabilities, dll)
- `RecentScans`: Table/list scan terbaru
- `VulnerabilityChart`: Recharts visualization
- `QuickActions`: Tombol-tombol aksi cepat

**3. Scan Components**
- `ScanForm`: Form untuk memulai scan baru
- `TemplateSelector`: Pilih template scan
- `ResultsView`: Tabel hasil scan dengan filtering
- `VulnerabilityDetail`: Modal/drawer detail CVE

**4. Services**
- `scanService`: API calls untuk scan operations
- `cvssService`: CVSS v3.1/v4.0 calculations
- `reportService`: PDF/Excel generation
- `templateService`: CRUD scan templates

## Data Flow

### Scanning Flow
```
User Input (ScanForm)
    ↓
Validate & Submit
    ↓
API Client (Mock/Real) → Backend API
    ↓
Poll Status (useScan hook)
    ↓
ResultsView (Real-time update)
    ↓
Detailed View / Export
```

### Reporting Flow
```
Select Scan Results
    ↓
Configure Report (Report Wizard)
    ↓
Choose Format (PDF/Excel)
    ↓
Client-Side Generation (@react-pdf/renderer / exceljs)
    ↓
Download File
```

## Phase Implementation Plan

### Phase 1: Foundation (Week 1-2)

**1.1 Authentication & Layout**
- [ ] Implementasi Login page functionality
- [ ] Create Navbar component
- [ ] Create Sidebar component
- [ ] Setup ProtectedRoute wrapper
- [ ] Create ProtectedLayout (Navbar + Sidebar)

**1.2 Shadcn UI Setup**
- [ ] Install Shadcn UI
- [ ] Generate base components: Button, Input, Card, Table, Dialog, Select, Checkbox
- [ ] Setup theme (dark mode sesuai landing page)

**1.3 Redux Store Setup**
- [ ] Configure Redux store
- [ ] Create auth slice
- [ ] Create scan slice
- [ ] Create UI slice (sidebar state, theme, dll)

### Phase 2: Core Features (Week 3-4)

**2.1 Dashboard Page**
- [ ] Create Dashboard layout dengan Sidebar
- [ ] StatsOverview component (reuse stats dari landing page)
- [ ] RecentScans table
- [ ] QuickActions component
- [ ] Connect ke mock API

**2.2 Scan Form**
- [ ] Target input (IP/URL/Domain) dengan validation
- [ ] Template dropdown (dari TemplateManager)
- [ ] Credentialed scan toggle
- [ ] Schedule picker (optional)
- [ ] Submit & redirect ke ResultsView

**2.3 ResultsView**
- [ ] Table dengan sorting & filtering
- [ ] Severity badges (Critical, High, Medium, Low)
- [ ] Click row → VulnerabilityDetail modal
- [ ] Export buttons (PDF/Excel) - placeholder

### Phase 3: Advanced Features (Week 5-6)

**3.1 CVSS Calculator**
- [ ] CVSS v3.1 vector input
- [ ] Real-time score calculation
- [ ] Visual breakdown (Base, Temporal, Environmental)
- [ ] Copy vector string

**3.2 Template Manager**
- [ ] List templates table
- [ ] Create/Edit template form
- [ ] Plugin selection (enable/disable)
- [ ] Credential configuration

**3.3 Reporting Engine**
- [ ] Report Wizard modal
  - Format selection (PDF/Excel)
  - Template selection (Executive/Technical/Compliance)
  - Filter options (Severity, Date range)
  - Branding options (Logo, Assessor name)
- [ ] PDF generation dengan @react-pdf/renderer
  - Executive report template
  - Technical audit template
- [ ] Excel generation dengan exceljs
  - Technical data export

### Phase 4: Polish & Testing (Week 7-8)

**4.1 Testing**
- [ ] Unit tests untuk services (scanService, cvssService)
- [ ] Component tests (ScanForm, ResultsView, Dashboard)
- [ ] Hook tests (useScan)
- [ ] E2E tests (critical paths)

**4.2 Performance & UX**
- [ ] Code splitting (lazy load pages)
- [ ] Loading states & skeletons
- [ ] Error boundaries
- [ ] Toast notifications (react-hot-toast)

**4.3 Backend Integration**
- [ ] Replace mock API dengan real API calls
- [ ] Error handling & retry logic
- [ ] Token refresh mechanism

## Error Handling Strategy

### API Errors
- **Network errors**: Show toast notification, allow retry
- **401 Unauthorized**: Redirect to login, refresh token
- **403 Forbidden**: Show access denied message
- **500 Server error**: Show generic error, contact support

### Client-Side Errors
- **Form validation**: Inline errors dengan Shadcn Form
- **Runtime errors**: Error boundary dengan fallback UI
- **Report generation fails**: Toast error, allow retry

## Testing Strategy

### Unit Tests (Vitest)
- Services: API clients, CVSS calculator, utilities
- Hooks: useScan, custom hooks
- Utils: formatters, validators

### Component Tests (React Testing Library)
- Form components dengan validation
- Table components dengan sorting/filtering
- Dialog/Modal interactions

### E2E Tests (Future - Playwright/Cypress)
- Login flow
- Complete scan flow (input → results → export)
- Report generation

## CSS & Styling Approach

### Current State
- **Landing Page**: CSS Modules (`styles.module.css`)
- **Future Pages**: Shadcn UI + CSS Modules hybrid

### Recommendation
Pertahankan **CSS Modules** untuk page-specific styles (seperti landing page), dan gunakan **Shadcn UI** untuk reusable components.

**Why?**
- CSS Modules sudah terbukti work di landing page
- Shadcn provides accessible, customizable components
- Hybrid approach = flexibility + consistency

## Open Questions

1. **Backend API**: Kapan backend API akan siap? (Mock API bisa digunakan sementara)
2. **Authentication**: JWT atau session-based? (Perlu disesuaikan dengan backend)
3. **Reporting Library**: @react-pdf/renderer atau puppeteer? (React PDF lebih ringan untuk client-side)
4. **State Management**: Redux Toolkit sudah ada di package.json - gunakan atau pindah ke React Query saja?
5. **Deployment**: Vercel, Netlify, atau self-hosted? (Mempengaruhi API URL configuration)

## Next Steps

1. ✅ Fix CSS import issue (DONE)
2. ⏳ Setup Shadcn UI
3. ⏳ Create Navbar & Sidebar
4. ⏳ Implement Login functionality
5. ⏳ Build Dashboard page
6. ⏳ Continue with phase-based development

---

**Status**: Design complete, ready for planning phase.
