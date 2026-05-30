# Struktur Project Frontend - SentinelScan

## Deskripsi Project

Aplikasi frontend React untuk **Vulnerability Assessment Scanning Tools**, dibangun menggunakan Vite, TypeScript, dan Tailwind CSS. Menyediakan interface untuk melakukan pemindaian keamanan aplikasi, sistem, dan jaringan secara otomatis.

## Teknologi Utama

- **React 18** — Library UI utama
- **TypeScript** — Type safety
- **Vite** — Build tool dan dev server
- **Tailwind CSS** — Utility-first styling
- **Shadcn/UI** — Komponen UI berbasis Radix UI
- **React Router** — Client-side routing
- **Lucide React** — Icon library
- **ESLint** — Code linting

## Struktur Folder

```
frontend/
├── public/                    # Static assets
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── api/                   # API client & mock data
│   │   ├── client.ts
│   │   ── client.test.ts
│   ├── assets/                # Images & static files
│   │   ── hero.png
│   ├── components/
│   │   ├── ui/                # Shadcn UI components (Button, Card, Table, etc.)
│   │   ├── shared/            # Reusable components (Navbar, Sidebar, Footer)
│   │   ├── auth/              # Authentication components (ProtectedRoute, etc.)
│   │   ├── dashboard/         # Dashboard-specific components (Charts, Forms, etc.)
│   │   ├── audit/             # Audit log components (LogTable, FilterBar, etc.)
│   │   ├── export/            # Export functionality (ExportModal)
│   │   ├── layout/            # Layout components (Header, Sidebar, DashboardLayout)
│   │   ├── AuditLogViewer.tsx
│   │   ── TelemetryProvider.tsx
│   ├── contexts/              # React Context providers
│   │   ── LoggingContext.tsx
│   ├── hooks/                 # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useTicket.ts
│   │   ├── useScan.ts
│   │   ├── useAuditLog.ts
│   │   ├── useExportWithErrorHandling.ts
│   │   ├── useFocusManagement.ts
│   │   ├── useKeyboardNavigation.ts
│   │   ├── useLogger.ts
│   │   ├── useNavigationLogger.ts
│   │   ├── usePermission.ts
│   │   ├── useRealtimeAudit.ts
│   │   ├── useTelemetry.ts
│   │   └── use-toast.ts
│   ├── lib/                   # Utilities & helpers
│   │   ├── utils.ts           # cn() helper for Shadcn
│   │   ├── scan-store.ts      # Scan state management
│   │   ├── export.ts          # Export utilities
│   │   ├── logDownload.ts     # Log download utilities
│   │   ├── logFormat.ts       # Log formatting utilities
│   │   ├── logStorage.ts      # Log storage utilities
│   │   ├── logger.ts          # Logging utilities
│   │   ├── appLogger.ts       # Application logger
│   │   └── telemetry.ts       # Telemetry utilities
│   ├── pages/
│   │   ├── Index/             # Landing page
│   │   │   └── index.tsx
│   │   ├── Login/             # Authentication page
│   │   │   ├── index.tsx
│   │   │   └── styles.module.css
│   │   └── Dashboard/
│   │       ├── Index.tsx      # Main dashboard view
│   │       ├── LogViewer.tsx  # Audit log viewer
│   │       ├── Scans/         # Scan management pages
│   │       │   ├── AllScans.tsx
│   │       │   ├── MyScans.tsx
│   │       │   ├── NewScan.tsx
│   │       │   ├── ScanDetail.tsx
│   │       │   ├── ScanProgress.tsx
│   │       │   ├── ScanResultDetail.tsx
│   │       │   └── TrashScans.tsx
│   │       ├── Tickets/       # Ticket management pages
│   │       │   ├── TicketList.tsx
│   │       │   ├── TicketDetail.tsx
│   │       │   └── CreateTicket.tsx
│   │       ├── Templates/     # Scan template management
│   │       │   └── Templates.tsx
│   │       ├── Users/         # User management
│   │       │   └── Users.tsx
│   │       ├── Reports/       # Reporting pages
│   │       │   └── Reports.tsx
│   │       ── Settings/      # Application settings
│   │           └── Settings.tsx
│   ├── store/                 # State management (Redux/Toolkit)
│   │   ├── index.ts
│   │   └── slices/
│   │       ├── auditLogSlice.ts
│   │       ├── authSlice.ts
│   │       └── uiSlice.ts
│   ├── templates/             # Page templates
│   │   └── DashboardTemplate.tsx
│   ├── types/                 # TypeScript definitions
│   │   ├── index.ts
│   │   ├── ticket.ts
│   │   ├── scan.ts
│   │   ├── template.ts
│   │   ├── auth.ts
│   │   ├── permissions.ts
│   │   └── ui.ts
│   ├── utils/                 # Utility functions
│   │   └── withFormLogger.tsx
│   ├── test/                  # Test setup & utilities
│   │   ├── setup.ts
│   │   ── zod-schemas.test.ts
│   ├── App.tsx                # Root component & routing
│   ├── index.css              # Global styles & Tailwind
│   └── main.tsx               # Entry point
├── thoughts/                  # Project documentation
│   ├── shared/
│   │   ├── designs/           # Design documents
│   │   ├── plans/             # Implementation plans
│   │   └── ledgers/           # Session ledgers
│   └── ledgers/               # Continuity ledgers
── docker-compose/            # Docker configuration
── .agents/                   # AI agent skills
── .opencode/                 # OpenCode configuration
├── index.html                 # HTML entry point
── package.json               # Dependencies & scripts
├── tsconfig.json              # TypeScript config
├── tsconfig.app.json          # App-specific TS config
── tsconfig.node.json         # Node-specific TS config
├── vite.config.ts             # Vite configuration
├── eslint.config.js           # ESLint configuration
├── README.md                  # Project documentation
├── prd.md                     # Product Requirements Document
├── bispro.md                  # Business Process documentation
└── struktur-project.md        # This file
```

## Arsitektur & Best Practices

- **Tailwind CSS**: Utility-first styling dengan konfigurasi custom di `tailwind.config.js`
- **Shadcn/UI**: Komponen UI berbasis Radix UI, di-generate via CLI
- **TypeScript**: Strict typing untuk type safety
- **Component Structure**: Pages di subfolder dengan `index.tsx`
- **Path Aliases**: `@/` alias ke `src/` untuk import yang lebih bersih
- **Mock API**: API client menggunakan mock data untuk development tanpa backend
- **Testing**: Unit tests untuk components dan hooks menggunakan Vitest
- **State Management**: Redux Toolkit untuk global state (auth, audit logs, UI)

## Development Workflow

| Command | Deskripsi |
| :--- | :--- |
| `npm run dev` | Start development server |
| `npm run build` | Build untuk production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest tests |

## Catatan

- API client saat ini menggunakan mock data untuk development
- Struktur folder mengikuti best practices React modern
- Semua components menggunakan TypeScript untuk type safety
- Styling menggunakan Tailwind CSS dengan Shadcn/UI components
- Audit logging dan telemetry terintegrasi di seluruh aplikasi
