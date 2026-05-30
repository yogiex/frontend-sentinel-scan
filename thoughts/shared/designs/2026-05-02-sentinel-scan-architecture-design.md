---
date: 2026-05-02
topic: "SentinelScan Architecture Design (Nessus-like Vulnerability Scanner)"
status: draft
---

# SentinelScan Architecture Design

## Problem Statement

We need to build a production-grade vulnerability assessment platform like Nessus/OpenVAS with:
- High-performance scanning engine (concurrent, low footprint)
- Comprehensive vulnerability database (100k+ checks)
- Enterprise features (remediation, compliance, integrations)
- Modern React frontend (already have MVP)

**Current State**: React MVP frontend with mock data, no backend, no scanning engine.

---

## Constraints

1. **Performance**: Must handle 1000+ assets concurrently
2. **Compatibility**: Should leverage existing OpenVAS NVTs (100k+ plugins)
3. **Maintainability**: Go preferred (like OpenVAS's new Rust scanner)
4. **Extensibility**: Plugin system for custom checks
5. **Enterprise-ready**: SSO, SIEM integration, ticketing

---

## Approach: Hybrid Go + OpenVAS

### Why Hybrid?
- **Go**: Perfect for orchestration (concurrent, single binary, low footprint)
- **OpenVAS NVTs**: 100k+ battle-tested vulnerability checks
- **NASL Runtime**: Need to interpret OpenVAS plugins

### Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  - Dashboard, Scans, Reports, Users, Templates       │
│  - Already built (MVP) - needs API integration         │
└──────────────────────┬──────────────────────────────┘
                       │ REST API (JSON)
┌──────────────────────▼──────────────────────────────┐
│               Go Backend (Orchestrator)                │
│  - API Server (Gin/Fiber)                         │
│  - Scan Scheduler & Queue (Redis)                   │
│  - NASL Runtime (Go implementation)                  │
│  - CVE Database Sync (NVD + OpenVAS feed)          │
│  - Export Engine (HTML/PDF/CSV/Nessus XML)          │
│  - Audit Logging (PostgreSQL)                        │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│              OpenVAS Components (Integrated)              │
│  - NVT Feed (100k+ vulnerability tests)             │
│  - NASL Scripts (vulnerability detection logic)       │
│  - OpenVAS Scanner (optional - for compatibility)      │
└───────────────────────────────────────────────────────┘
```

---

## Components

### 1. Frontend (Already Built - Needs API Integration)

**Stack**: React 18 + TypeScript + Vite + Tailwind CSS

**Pages Built (MVP)**:
- ✅ Dashboard (stats, charts, quick actions)
- ✅ New Scan (6 scan types, stealth options)
- ✅ All Scans / My Scans (tables, filters, status)
- ✅ Scan Detail (hosts, vulns, CVSS)
- ✅ Reports (list, filters, export)
- ✅ Templates (pre-configured scans)
- ✅ Users (role management)
- ✅ Audit Logs (access/error logs)

**API Integration Needed**:
```go
// REST API Endpoints to Implement
POST   /api/scans              // Create new scan
GET    /api/scans              // List all scans
GET    /api/scans/:id          // Scan details
DELETE /api/scans/:id          // Cancel/delete scan
GET    /api/scans/:id/results  // Scan results

GET    /api/reports            // List reports
POST   /api/reports/export    // Export report

GET    /api/users              // List users
POST   /api/users              // Create user
PUT    /api/users/:id          // Update user

GET    /api/templates          // List templates
POST   /api/templates          // Create template

GET    /api/cves               // CVE database search
GET    /api/cves/:id           // CVE details

POST   /api/auth/login         // Authentication
POST   /api/auth/logout        // Logout
```

---

### 2. Go Backend (New - Core Orchestrator)

**Stack**: Go 1.22+ with:
- **Web Framework**: Gin or Fiber (fast HTTP)
- **Database**: PostgreSQL (scans, users, audit logs)
- **Cache/Queue**: Redis (scan jobs, rate limiting)
- **Task Queue**: Asynq or Machinery (background scans)

**Key Packages**:
```go
// Project Structure
sentinelscan-backend/
├── cmd/
│   └── api/           // API server entrypoint
├── internal/
│   ├── api/          // HTTP handlers, middleware
│   ├── scanner/      // Scan orchestration
│   ├── nasl/         // NASL runtime (interpret OpenVAS plugins)
│   ├── vulndb/       // Vulnerability database
│   ├── export/       // Export engine (HTML/PDF/CSV/Nessus)
│   ├── auth/         // Authentication (JWT, SSO)
│   └── audit/        // Audit logging
├── pkg/
│   ├── nvt/          // OpenVAS NVT parser
│   ├── cvss/         // CVSS v3.1 calculator
│   └── plugins/      // Custom Go plugins
├── migrations/         // SQL migrations
├── nvt-feed/          // OpenVAS NVT feed (git submodule)
└── config/            // Configuration
```

#### 2.1 Scan Orchestrator
```go
package scanner

type Orchestrator struct {
    queue   *redis.Client
    nasl    *nasl.Runtime
    vulnDB  *vulndb.DB
}

// StartScan creates a new scan job
func (o *Orchestrator) StartScan(req ScanRequest) (*Scan, error) {
    // 1. Validate targets (IP/CIDR/domain)
    // 2. Check credentials (if credentialed scan)
    // 3. Create scan record in DB
    // 4. Queue scan job to Redis
    // 5. Return scan ID for polling
}
```

#### 2.2 NASL Runtime (Go Implementation)
```go
package nasl

type Runtime struct {
    scripts map[string]*Script  // Loaded NVT scripts
}

// Execute runs a NASL script against a target
func (n *Runtime) Execute(scriptPath string, target Target) (*Result, error) {
    // 1. Parse NASL script
    // 2. Setup sandbox environment
    // 3. Execute vulnerability check
    // 4. Return finding (CVE, severity, proof)
}
```

#### 2.3 Vulnerability Database
```go
package vulndb

type DB struct {
    pg *postgres.Client
}

// SyncFromNVD downloads and indexes CVE feed
func (db *DB) SyncFromNVD() error {
    // 1. Download NVD JSON feed (daily)
    // 2. Parse CVEs, CVSS scores
    // 3. Upsert into PostgreSQL
}

// SyncFromOpenVAS syncs NVT feed
func (db *DB) SyncFromOpenVAS() error {
    // 1. Git pull latest NVT feed
    // 2. Parse .nasl files
    // 3. Index vulnerability checks
}
```

---

### 3. OpenVAS Integration

#### 3.1 NVT Feed (Vulnerability Tests)
- **Source**: `https://github.com/greenbone/nasl` (OpenVAS NASL scripts)
- **Format**: `.nasl` files (NASL scripting language)
- **Count**: 100,000+ vulnerability checks
- **Update**: Daily via git pull

#### 3.2 NASL Compatibility
Two options:
1. **Port NASL to Go** (recommended) - full control, no C dependencies
2. **Wrap OpenVAS Scanner** (quick start) - call `openvas-scanner` binary

**Option 1: Pure Go NASL Runtime** (Recommended)
```go
// Interpret NASL scripts in Go
type NASLInterpreter struct {
    functions map[string]Function
}

// Register NASL built-ins
func (n *NASLInterpreter) RegisterBuiltins() {
    n.functions["http_get"] = httpGet
    n.functions["scan_tcp"] = scanTCP
    n.functions["banner_grab"] = bannerGrab
    // ... 100+ built-in functions
}
```

---

## Data Flow

### Scanning Flow
```
1. User creates scan (Frontend)
   ↓
2. POST /api/scans (Backend)
   ↓
3. Validate targets, credentials
   ↓
4. Queue scan job (Redis)
   ↓
5. Worker picks up job
   ↓
6. For each target:
   a. Port scan (nmap-like)
   b. Service detection
   c. For each service:
      - Load relevant NVTs (by port/service)
      - Execute NASL scripts (Go runtime)
      - Return vulnerabilities found
   ↓
7. Aggregate results
   ↓
8. Save to PostgreSQL
   ↓
9. Update scan status (completed/failed)
   ↓
10. Notify user (WebSocket/email)
```

### Export Flow
```
1. User requests export (Frontend)
   ↓
2. POST /api/reports/export
   ↓
3. Load scan results from DB
   ↓
4. Format output:
   - HTML: Go template + CSS
   - PDF: Chrome DevTools Protocol (headless)
   - CSV: Simple string builder
   - Nessus XML: Custom XML builder (compatible)
   ↓
5. Return download URL
```

---

## Database Schema (PostgreSQL)

```sql
-- Scans table
CREATE TABLE scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target TEXT NOT NULL,
    scan_type VARCHAR(50),
    profile VARCHAR(50),
    status VARCHAR(20),
    owner UUID REFERENCES users(id),
    credentials JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    duration INTERVAL,
    summary JSONB
);

-- Hosts table
CREATE TABLE hosts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id UUID REFERENCES scans(id),
    ip INET NOT NULL,
    hostname TEXT,
    status VARCHAR(10),
    open_ports INTEGER[],
    vulnerabilities INTEGER DEFAULT 0
);

-- Vulnerabilities table
CREATE TABLE vulnerabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_id UUID REFERENCES hosts(id),
    cve_id VARCHAR(20),
    title TEXT,
    severity VARCHAR(10),
    cvss_score DECIMAL(3,1),
    description TEXT,
    proof TEXT,
    remediation TEXT,
    references TEXT[]
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    role VARCHAR(20),
    status VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    level VARCHAR(10),
    category VARCHAR(20),
    action TEXT,
    details JSONB,
    timestamp TIMESTAMP DEFAULT NOW()
);
```

---

## Error Handling Strategy

### Backend
- **Scan Failures**: Retry logic (max 3 attempts), log to audit
- **NASL Errors**: Sandbox isolation, timeout (30s per script)
- **DB Errors**: Connection pooling, circuit breaker
- **API Errors**: Structured error responses, log to Sentry

### Frontend
- **API Errors**: Toast notifications, retry with backoff
- **Scan Failures**: Display error banner with details
- **Network Issues**: Offline detection, queue requests

---

## Testing Strategy

### Backend
1. **Unit Tests**: NASL runtime, CVSS calculator, plugins
2. **Integration Tests**: API endpoints, DB operations
3. **Scanning Tests**: Mock NVTs, test scan flow
4. **Performance Tests**: 1000+ concurrent scans

### Frontend
1. **Component Tests**: React Testing Library
2. **E2E Tests**: Playwright (scan creation → results)
3. **API Mocking**: MSW (Mock Service Worker)

---

## Open Questions

1. **NASL Compatibility**: Should we port NASL to Go or wrap OpenVAS binary?
   - *Recommendation*: Port to Go (no C dependencies, easier deployment)

2. **Real-time Updates**: WebSocket vs polling?
   - *Recommendation*: WebSocket for scan progress, polling as fallback

3. **Container Scanning**: Separate service or integrate?
   - *Recommendation*: Separate microservice (Docker/K8s API)

4. **Cloud Integration**: AWS/Azure/GCP scanners?
   - *Recommendation*: Phase 2 (after MVP stable)

5. **SSO**: SAML, OIDC, or both?
   - *Recommendation*: OIDC (modern, easier to implement)

---

## Next Steps

### Phase 1: MVP Backend (2-3 months)
1. Set up Go project structure
2. Implement NASL runtime (port to Go)
3. NVD + OpenVAS feed sync
4. Basic scan orchestration (port scan + vuln check)
5. PostgreSQL schema + migrations
6. REST API (scans, results, auth)
7. Frontend API integration
8. Export engine (HTML, PDF, Nessus XML)

### Phase 2: Enterprise Features (3-4 months)
9. Remediation workflow (Jira integration)
10. Compliance reports (CIS, PCI-DSS)
11. Asset inventory (CMDB)
12. SSO (OIDC/SAML)
13. SIEM integration (Splunk, QRadar)
14. Container scanning (Docker/K8s)

### Phase 3: Advanced (4-6 months)
15. Cloud config scanning (AWS, Azure, GCP)
16. Mobile app (iOS/Android companion)
17. API scanning (REST, GraphQL, SOAP)
18. Machine learning (false positive reduction)
19. Agent-based scanning (lightweight endpoints)

---

**Recommendation**: Start with **Phase 1** - build Go NASL runtime + basic scanning + API. Use OpenVAS NVT feed for vulnerability checks. This gives us 100k+ plugins from day 1.
