---
date: 2026-05-03
topic: "Mock Scan Workflow - End-to-End Simulation"
status: validated
---

## Problem Statement

The NewScan form is visually complete but functionally dead. On submit it only `console.log`s and navigates away — the new scan never appears in AllScans, no progress is shown, and the mockup feels broken. Users (demo audience) need to experience the full lifecycle: **configure → launch → watch progress → see results**.

## Constraints

- **No backend exists** — everything must be client-side mock/simulation
- **Must use existing types** (`ScanJob`, `ScanResult`, etc. from `src/types/scan.ts`)
- **Must preserve existing UI** — NewScan form is already polished, don't redesign it
- **localStorage for persistence** — scans should survive page refresh during demo
- **Must integrate with existing routing** — add route without breaking current structure

## Approach

**Chosen approach: In-memory scan store with localStorage persistence + dedicated ScanProgress page.**

I chose this because:
- A central store eliminates the current problem where every page has its own disconnected mock data
- localStorage gives persistence without needing a mock server
- A dedicated progress page creates the "wow factor" for demos — watching a scan run in real-time
- It's simple enough to build quickly but realistic enough to feel like a real tool

I considered but rejected:
- **MSW (Mock Service Worker)** — overkill for a demo, adds complexity, doesn't solve the progress UI problem
- **Redux scan slice** — the app already has a disconnected Redux setup; adding more slices would be inconsistent with how pages currently work
- **Just updating AllScans mock array** — no progress visualization, no satisfying demo experience

## Architecture

```
┌─────────────┐     createScan()     ┌───────────────┐
│  NewScan    │ ───────────────────► │  Scan Store   │
│  (form)     │                      │  (in-memory + │
└─────────────┘                      │   localStorage)│
         │                           └───────┬───────┘
         │ navigate to /:id/progress         │
         ▼                                   │
┌─────────────────┐                          │
│  ScanProgress   │◄──── getScan(id) ────────┘
│  (simulation)   │
└────────┬────────┘
         │ on complete
         │ navigate to /:id
         ▼
┌─────────────────┐     getScans()      ┌───────────────┐
│  ScanDetail     │                     │   AllScans    │
│  (dynamic)      │◄────────────────────│   (dynamic)   │
└─────────────────┘                     └───────────────┘
```

## Components

### 1. Scan Store (`src/lib/scan-store.ts`)

**Responsibility:** Central mock database + simulation engine.

**Key functions:**
- `createScan(formValues)` → generates `scan-xxxx` ID, stores with `queued` status, returns scan object
- `getScans()` → returns all scans as array
- `getScan(id)` → returns single scan or null
- `updateScan(id, updates)` → partial update (status, progress, findings, etc.)
- `deleteScan(id)` → soft delete (moves to trash)
- `simulateScan(id)` → runs the full timed simulation lifecycle

**Data shape per scan:**
```
{
  id: string              // "scan-1714723200000"
  target: string          // from form
  scanType: string        // from form
  profile: string         // from form
  status: "queued" | "initializing" | "discovering" | "scanning" | "analyzing" | "completed" | "failed"
  progress: number        // 0-100
  createdAt: string       // ISO timestamp
  startedAt: string | null
  completedAt: string | null
  duration: string | null
  hosts: Host[]           // generated during discovery phase
  findings: Finding[]     // generated during scanning phase
  logs: string[]          // terminal-style log lines
  config: {               // preserved form config
    credentials: boolean
    stealth: boolean
    schedule: string
  }
}
```

**localStorage key:** `sentinelscan_scans` — JSON array of all scans.

### 2. ScanProgress Page (`src/pages/Dashboard/Scans/ScanProgress.tsx`)

**Responsibility:** Real-time scan simulation visualization.

**Layout:**
- **Top bar:** Scan target, current phase badge, elapsed timer
- **Left panel (60%):** Terminal-style log output with auto-scroll, colored log lines by type (info, warning, finding, error)
- **Right panel (40%):** 
  - Progress bar with percentage
  - Phase timeline (queued → initializing → discovering → scanning → analyzing → completed)
  - Live stats: hosts found, vulns found, requests/sec
  - Findings list appearing in real-time with severity chips

**Simulation phases with realistic timing:**

| Phase | Duration | What happens |
|-------|----------|-------------|
| Queued | 1.5s | "Waiting for scanner engine..." pulsing animation |
| Initializing | 2s | "Resolving target", "Loading templates", "Configuring scan profile" |
| Discovery | 4s | Host-by-host discovery with animated entries appearing |
| Scanning | 8s | Progress bar 0→100%, requests/sec counter, log lines streaming |
| Analyzing | 2s | "Correlating findings", "Generating report" |
| Completed | — | Summary cards, "View Results" button, auto-redirect after 5s |

**Log generation:** Each phase emits realistic log lines like:
```
[08:01:02] INFO  Resolving target: 192.168.1.0/24
[08:01:03] INFO  Target resolved: 256 addresses in range
[08:01:03] INFO  Loading 847 templates for basic scan profile
[08:01:04] INFO  Starting host discovery on 192.168.1.0/24
[08:01:05] FOUND Host 192.168.1.1 is UP (12 open ports)
[08:01:05] FOUND Host 192.168.1.10 is UP (8 open ports)
[08:01:06] VULN  CVE-2026-1001 [CRITICAL] Remote Code Execution on 192.168.1.10:80
[08:01:07] VULN  CVE-2026-2001 [HIGH] SQL Injection on 192.168.1.10:443
```

### 3. Finding Generator

**Responsibility:** Generate realistic findings based on scan type and target.

**Logic:**
- **Web application scan** → XSS, SQLi, CSRF, SSRF, IDOR, directory traversal
- **Basic network scan** → Open services, outdated software, weak ciphers, default credentials
- **Credentialed scan** → Missing patches, misconfigurations, weak permissions
- **Compliance scan** → CIS benchmark failures, PCI-DSS violations
- **Discovery scan** → Host list, open ports, service fingerprints

Findings include: CVE ID, title, severity, affected host/port, brief description, CVSS score.

### 4. Modified NewScan.tsx

**Changes:**
- Import `scanStore` from `src/lib/scan-store.ts`
- In `onSubmit`: call `scanStore.createScan(formValues)` → get scan ID → navigate to `/dashboard/scans/${id}/progress`
- Remove the current `console.log` + direct navigate to AllScans

### 5. Modified AllScans.tsx

**Changes:**
- Remove hardcoded `allScans` array
- Import `scanStore` and read scans via `scanStore.getScans()`
- Use React state + effect to load scans on mount
- New scans created via NewScan will automatically appear

### 6. Modified ScanDetail.tsx

**Changes:**
- Read `id` from `useParams()`
- Load scan data from `scanStore.getScan(id)`
- If scan not found, show "Scan not found" state
- Display dynamic data: hosts, findings, summary based on actual stored scan
- If scan is still running, show "Scan in progress — redirecting..." with link to progress page

### 7. Modified App.tsx

**Changes:**
- Add route: `<Route path=":id/progress" element={<ScanProgress />} />` inside the scans subtree

## Data Flow

### Scan Creation Flow
```
1. User fills NewScan form
2. Zod validates all fields
3. onSubmit fires:
   a. scanStore.createScan(formValues)
      - generates ID from timestamp
      - creates scan object with status="queued"
      - saves to localStorage
      - returns scan object
   b. navigate(`/dashboard/scans/${scan.id}/progress`)
```

### Scan Simulation Flow
```
1. ScanProgress mounts with scan ID from URL
2. Reads scan from scanStore
3. Calls scanStore.simulateScan(id)
   a. Phase: queued (1.5s)
      - updates status to "queued"
      - emits log: "Scan queued, waiting for scanner..."
   b. Phase: initializing (2s)
      - updates status to "initializing"
      - emits logs about template loading, target resolution
   c. Phase: discovering (4s)
      - updates status to "discovering"
      - generates hosts based on target type
      - emits log for each host found
   d. Phase: scanning (8s)
      - updates status to "scanning"
      - progress bar animates 0→100%
      - generates findings based on scanType
      - emits log for each finding
   e. Phase: analyzing (2s)
      - updates status to "analyzing"
      - emits correlation logs
   f. Phase: completed
      - updates status to "completed"
      - sets completedAt, duration
      - persists to localStorage
4. After 3s delay, auto-navigate to ScanDetail
```

### Scan Listing Flow
```
1. AllScans mounts
2. scanStore.getScans() returns all scans
3. Renders table with scan data
4. Filter tabs work on the live data
```

## Error Handling

- **Scan not found:** Show empty state with "Back to Scans" button
- **Simulation interrupted:** If user navigates away mid-simulation, scan retains its current status. Next visit to progress page resumes or shows current state
- **localStorage full:** Graceful fallback to in-memory only (try/catch around localStorage operations)
- **Invalid form data:** Zod validation already handles this — form won't submit

## Testing Strategy

Since this is a mockup/demo feature:
- **Manual testing:** Run through the full flow (NewScan → Progress → Detail → AllScans)
- **Edge cases to verify:**
  - Multiple concurrent scans (open 2 tabs, launch 2 scans)
  - Page refresh during simulation (scan should retain state)
  - Different scan types produce different findings
  - Different target types (IP, CIDR, hostname, URL) work correctly
- **No automated tests needed** for the simulation logic — it's demo-only code

## Open Questions

- **None** — the scope is clear and all edge cases are handled by the design.
