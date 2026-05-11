# SentinelScan Backend

> A high-performance vulnerability scanning engine powered by Nuclei templates, with credential vault and on-demand PDF reporting.

[![Go Version](https://img.shields.io/badge/Go-1.26+-00ADD8?style=flat&logo=go)](https://go.dev)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## Overview

SentinelScan Backend is a DAST (Dynamic Application Security Testing) engine that enables authenticated vulnerability scanning, real-time result streaming, and on-demand PDF report generation. Inspired by enterprise scanners like Tenable Web App Scanner and Nessus.

- **Concurrent vulnerability scanning** using a configurable worker pool with autoscaling
- **Authenticated scanning** via credential vault (login form, cookie, bearer token, API key, Selenium)
- **Credential health monitoring** with automatic re-authentication
- **On-demand PDF reports** generated via headless Chrome (chromedp)
- **Real-time result streaming** via WebSocket connections
- **Nuclei template integration** for industry-standard detection rules
- **Event-driven architecture** with pub/sub messaging (in-memory + RabbitMQ)
- **Persistent storage** with PostgreSQL (GORM)
- **Role-based access control** (RBAC) with granular permissions

## Features

| Feature | Status | Description |
|---------|--------|-------------|
| Active Vulnerability Scanning | ✅ Production | Scan targets using Nuclei YAML templates |
| Concurrent Worker Pool | ✅ Production | Configurable parallelism with autoscaling |
| Credential Vault | ✅ Production | M:N reusable auth credentials (login_form, cookie, bearer, api_key, selenium) |
| Authenticated Scanning | ✅ Production | Session manager with health checker & automatic re-auth |
| PDF Report Generation | ✅ Production | On-demand hybrid (HTML+chromedp) A4 PDF export |
| Report Data API | ✅ Production | Structured JSON scan report aggregation |
| Real-time Streaming | ✅ Production | WebSocket endpoint for live scan results |
| Template Management | ✅ Production | Load, filter, and execute Nuclei templates |
| PostgreSQL Persistence | ✅ Production | GORM-based ORM with AutoMigrate + SQL migrations |
| Event-Driven Architecture | ✅ Production | Decoupled pub/sub with RabbitMQ fallback to in-memory |
| RBAC System | ✅ Production | Roles: admin, security_analyst, auditor, viewer |
| Scan Scheduling | 🔄 Planned | Cron-based recurring scan scheduling |
| Scope & Advanced Settings | 🔄 Planned | Include/exclude URLs, rate limiting, timeouts |
| API Scanning | 🔄 Planned | OpenAPI-based API endpoint fuzzing |
| CVE/NVD Integration | 🔄 Planned | Enrich findings with CVE database info |
| EPSS Integration | 🔄 Planned | Exploit Prediction Scoring System |

## Tech Stack

| Component | Technology |
|-----------|------------|
| **Language** | Go 1.26+ |
| **HTTP Router** | gorilla/mux |
| **WebSocket** | gorilla/websocket |
| **Configuration** | spf13/viper |
| **Database ORM** | GORM |
| **Database** | PostgreSQL |
| **Message Queue** | RabbitMQ (with in-memory fallback) |
| **Headless Browser** | chromedp / cdproto |
| **Vulnerability Engine** | Nuclei templates |
| **PDF Generation** | chromedp `Page.printToPDF` |
| **Authentication** | JWT + bcrypt |
| **Testing** | testify |
| **Concurrency** | Native goroutines + channels |

## Architecture

SentinelScan follows **Domain-Driven Design (DDD)** with hexagonal architecture layers:

```
┌──────────────────────────────────────────────────────────────┐
│                     API / Transport Layer                      │
│  api/ (HTTP handlers, routes, WebSocket, swagger)            │
└──────────────────────────────────────────────────────────────┘
                                ↓
┌──────────────────────────────────────────────────────────────┐
│                    Application Layer                           │
│  internal/application/                                        │
│  ├── scan_service.go       (scan lifecycle)                   │
│  ├── auth_service.go       (user auth)                        │
│  ├── auth_credential_service.go  (credential vault)           │
│  ├── ticket_service.go     (remediation tickets)              │
│  └── report_service.go     (report data aggregation)          │
└──────────────────────────────────────────────────────────────┘
                                ↓
┌──────────────────────────────────────────────────────────────┐
│                      Domain Layer                              │
│  internal/domain/                                             │
│  ├── entity/     (ScanJob, Finding, AuthCredential, Report)   │
│  ├── repository/ (interfaces: Scan, Finding, AuthCred, etc.)  │
│  └── service/    (domain services, planned)                   │
└──────────────────────────────────────────────────────────────┘
                                ↓
┌──────────────────────────────────────────────────────────────┐
│                   Infrastructure Layer                         │
│  internal/infrastructure/                                     │
│  ├── database/postgres/  (GORM repositories)                  │
│  ├── scanner/            (HTTP + headless engines)            │
│  ├── authscan/           (credential executors + session mgr) │
│  ├── auth/               (JWT + bcrypt)                       │
│  ├── worker/             (pool + autoscaler)                  │
│  ├── messaging/          (RabbitMQ pub/sub)                   │
│  ├── event/              (in-memory event bus)                │
│  └── report/             (PDF + HTML template)                │
└──────────────────────────────────────────────────────────────┘
                                ↓
┌──────────────────────────────────────────────────────────────┐
│                   External Integrations                        │
│  PostgreSQL / RabbitMQ / chromedp / Nuclei templates          │
└──────────────────────────────────────────────────────────────┘
```

### Data Flow — Standard Scan

```
Client POST /api/scans  { targets, template_selectors, auth_credential_id? }
    ↓
API Handler.CreateScan()
    ↓
ScanService.StartScan() – persist to DB [status: "pending"]
    ↓
[optional] SessionManager.StartSession() – authenticate + start health checker
    ↓
Orchestrator.StartScan() – update status to "running"
    ↓
Load Templates (TemplateLoader) → filter by selectors
    ↓
Create Tasks (target × template) → enqueue to task queue
    ↓
Worker Pool → resolveSession() → attach cookies/headers from session
    ↓
HTTPEngine / HeadlessEngine executes task
    ↓
Results → FindingRepository.CreateBatch() + EventBus.Publish()
    ↓
WebSocket streams findings to clients in real-time
    ↓
All tasks complete → status → "completed"
```

### Data Flow — PDF Report (On-Demand)

```
Client POST /api/scans/{id}/report/export
    ↓
ReportService.GetReportData() – aggregate scan + findings
    ↓
ReportGenerator.GeneratePDF()
    ├── RenderHTML(template.go → templates/report.html)
    └── PDFGenerator (chromedp Page.printToPDF → A4)
    ↓
PDF cached to ./reports/scan_{id}.pdf
    ↓
Response → { status: "ready", download_url: "/api/scans/{id}/report/download" }

## Quick Start

### Prerequisites

- Go 1.25 or higher
- PostgreSQL 12+
- Nuclei templates (cloned to `./templates/`)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/inkubasi-btp-cybersecurity/vulnerability-scanner.git
   cd vulnerability-scanner/code/backend-golang
   ```

2. **Install dependencies**
   ```bash
   go mod download
   ```

3. **Configure the application**
   ```bash
   # Uses environment variables or config.yaml (optional)
   cp deployments/development/.env.example .env
   # Or set environment variables directly (see table below)
   ```

4. **Set up the database**
   ```bash
   # Create PostgreSQL database
   createdb vulnscanner
   ```

5. **Download Nuclei templates**
   ```bash
   git clone https://github.com/projectdiscovery/nuclei-templates.git ./templates
   ```

6. **Run the application**
   ```bash
   go run main.go
   ```

The server will start on `http://localhost:8080` by default.

## Configuration

SentinelScan uses **Viper** for configuration management, supporting both YAML files and environment variables.

### Configuration File (`config.yaml`)

```yaml
server:
  host: localhost
  port: 8080

database:
  host: localhost
  port: 5432
  user: postgres
  password: postgres
  dbname: vulnscanner
  sslmode: disable

worker:
  size: 50            # Worker pool size
  maxretries: 3       # Max retry attempts per task
  tasktimeout: 30     # Task timeout in seconds
  autoscale:
    enabled: false
    minworkers: 5
    maxworkers: 100
    scaleupthreshold: 5
    scaledownthreshold: 1

template:
  dir: ./templates    # Path to Nuclei templates

scanner:
  chromium_path: ""   # Path to Chromium for headless engine
  timeout_sec: 15     # Scanner timeout per request
  headless_size: 10   # Headless worker pool size

authscan:
  session_check_interval: 30  # Health check interval (seconds)
  verify_timeout: 10           # Session verification timeout
  max_retries: 3               # Max re-auth retries

report:
  output_dir: ./reports  # PDF report output directory

rabbitmq:
  host: localhost
  port: 5672
  user: admin
  password: admin
  vhost: /
  prefetch_count: 10
```

### Environment Variables

All configuration options can be overridden via environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `SERVER_HOST` | Server host | `localhost` |
| `SERVER_PORT` | Server port | `8080` |
| `DATABASE_HOST` | PostgreSQL host | `localhost` |
| `DATABASE_PORT` | PostgreSQL port | `5432` |
| `DATABASE_USER` | PostgreSQL user | `postgres` |
| `DATABASE_PASSWORD` | PostgreSQL password | `postgres` |
| `DATABASE_DBNAME` | PostgreSQL database | `vulnscanner` |
| `WORKER_SIZE` | Worker pool size | `50` |
| `WORKER_MAXRETRIES` | Max task retries | `3` |
| `WORKER_TASKTIMEOUT` | Task timeout (seconds) | `30` |
| `SCANNER_CHROMIUM_PATH` | Chromium binary path | `""` |
| `SCANNER_TIMEOUT_SEC` | Scanner timeout | `15` |
| `SCANNER_HEADLESS_SIZE` | Headless workers | `10` |
| `AUTHSCAN_SESSION_CHECK_INTERVAL` | Session health check interval (s) | `30` |
| `AUTHSCAN_VERIFY_TIMEOUT` | Session verify timeout (s) | `10` |
| `AUTHSCAN_MAX_RETRIES` | Re-auth retries | `3` |
| `REPORT_OUTPUT_DIR` | PDF report output path | `./reports` |
| `RABBITMQ_HOST` | RabbitMQ host | `localhost` |
| `RABBITMQ_PORT` | RabbitMQ port | `5672` |
| `RABBITMQ_USER` | RabbitMQ user | `admin` |
| `RABBITMQ_PASSWORD` | RabbitMQ password | `admin` |
| `TEMPLATE_DIR` | Nuclei templates path | `./templates` |

## API Documentation

### Base URL

```
http://localhost:8080/api
```

### Scan Endpoints

#### Create a Scan

```http
POST /api/scans
Content-Type: application/json

{
  "targets": ["http://example.com", "https://test.com"],
  "template_selectors": "{\"severity\":[\"high\",\"critical\"]}"
}
```

**With credential (authenticated scanning):**

```http
POST /api/scans
Content-Type: application/json

{
  "targets": ["https://example.com"],
  "template_selectors": {"severity": ["high", "critical"]},
  "auth_credential_id": 1
}
```

**Response (201 Created)**
```json
{
  "id": 1,
  "targets": ["http://example.com"],
  "template_selectors": {"severity": ["high", "critical"]},
  "status": "pending",
  "auth_credential_id": 1,
  "created_at": "2026-05-04T10:00:00Z",
  "updated_at": "2026-05-04T10:00:00Z"
}
```

#### Get Scan Status

```http
GET /api/scans/{id}
```

**Response (200 OK)**
```json
{
  "id": 1,
  "targets": ["http://example.com"],
  "status": "running",
  "progress": {
    "total_tasks": 100,
    "completed": 45,
    "failed": 2,
    "in_progress": 53
  },
  "auth_credential_id": 1,
  "created_at": "2026-05-04T10:00:00Z"
}
```

#### Get Scan Results

```http
GET /api/scans/{id}/results
```

#### Stream Real-time Results (WebSocket)

```javascript
const ws = new WebSocket('ws://localhost:8080/api/scans/1/stream');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Event:', data.type); // finding, progress, complete, failed
  console.log('Data:', data.payload);
};
```

**Event Types:**

| Type | Description |
|------|-------------|
| `finding` | Vulnerability detected |
| `progress` | Scan progress update (total/completed) |
| `complete` | Scan finished successfully |
| `failed` | Scan failed with error |

### Credential Vault Endpoints

#### List Credentials

```http
GET /api/credentials
```

#### Create Credential

```http
POST /api/credentials
Content-Type: application/json

{
  "name": "My Login Form",
  "method": "login_form",
  "config": {
    "login_url": "https://example.com/login",
    "fields": [
      {"selector": "username", "type": "text", "value": "admin"},
      {"selector": "password", "type": "password", "value": "secret123"}
    ],
    "submit_selector": "button[type=submit]"
  },
  "verify_url": "https://example.com/dashboard",
  "verify_pattern": "Welcome, admin"
}
```

**Supported auth methods:**
| Method | Config Structure | Use Case |
|--------|-----------------|----------|
| `login_form` | `login_url`, `fields[]`, `submit_selector` | Login page with form |
| `cookie` | `cookies[]` (name, value, domain, path) | Session cookie replay |
| `bearer` | `token` (string) | Bearer token auth |
| `api_key` | `headers[]` (name, value) | API key in header |
| `selenium` | `script_path` | Complex browser auth |

#### Get Credential

```http
GET /api/credentials/{id}
```

#### Update Credential

```http
PUT /api/credentials/{id}
```

#### Delete Credential

```http
DELETE /api/credentials/{id}
```

#### Verify Credential

```http
POST /api/credentials/{id}/verify
```

Verifies the credential by performing a test authentication against the target.

### Report Endpoints

#### Get Report Data (JSON)

```http
GET /api/scans/{id}/report-data
```

Returns structured scan report with findings grouped by severity and template.

#### Export Report (PDF)

```http
POST /api/scans/{id}/report/export
```

Generates a PDF report via headless Chrome. Returns `"download_url"` when ready. PDF is cached on disk — subsequent requests return immediately.

**Response:**
```json
{
  "status": "ready",
  "download_url": "/api/scans/1/report/download"
}
```

#### Download Report

```http
GET /api/scans/{id}/report/download
```

Downloads the generated PDF report (if it exists).

### Template Endpoints

#### List Templates

```http
GET /api/templates?severity=critical,high&tags=cicd
```

#### Get Template Details

```http
GET /api/templates/{id}
```

## Project Structure

```
backend-golang/
├── main.go                       # Application entry point
├── cmd/migrate/main.go           # Migration CLI
│
├── api/                          # HTTP & WebSocket transport
│   ├── handlers.go               # Scan/auth/report handlers
│   ├── auth_credential_handlers.go  # Credential vault CRUD
│   ├── report_handlers.go        # Report data & PDF export
│   ├── routes.go                 # Route definitions
│   ├── websocket.go              # WebSocket streaming
│   └── handlers_test.go          # Handler tests
│
├── config/                       # Configuration
│   └── config.go                 # Viper loader (YAML + env)
│
├── deployments/                  # Docker & env configs
│   ├── development/
│   ├── staging/
│   └── production/
│
├── detection/                    # Detection engine
│   ├── engine.go                 # Nuclei-based detection
│   └── fingerprint.go            # Version fingerprinting
│
├── docs/                         # API docs & feature plans
│   ├── docs.go                   # Swagger annotations
│   ├── swagger.json / .yaml
│   └── features/                 # Feature development plans
│
├── internal/                     # DDD internal packages
│   ├── domain/
│   │   ├── entity/               # ScanJob, Finding, AuthCredential,
│   │   │                         # AuthSession, ScanReport, Ticket, User
│   │   └── repository/           # Repository interfaces + tests
│   ├── application/
│   │   ├── scan_service.go       # Scan lifecycle
│   │   ├── auth_service.go       # User auth
│   │   ├── auth_credential_service.go  # Credential vault
│   │   ├── report_service.go     # Report data aggregation
│   │   └── ticket_service.go     # Remediation tickets
│   └── infrastructure/
│       ├── auth/                 # JWT + bcrypt
│       ├── authscan/             # Auth executors + session manager
│       │   ├── executor.go       # Factory pattern
│       │   ├── login_form.go     # Login form auth
│       │   ├── cookie_auth.go    # Cookie replay auth
│       │   ├── bearer_auth.go    # Bearer token auth
│       │   ├── apikey_auth.go    # API key auth
│       │   └── session_manager.go  # Session health checker
│       ├── database/postgres/    # GORM repositories + models
│       ├── event/                # In-memory event bus
│       ├── messaging/           # RabbitMQ pub/sub
│       ├── report/              # PDF + HTML template generator
│       │   ├── generator.go     # Orchestrates HTML→PDF
│       │   ├── template.go      # html/template + FuncMap
│       │   ├── pdf.go           # chromedp Page.printToPDF
│       │   └── templates/       # Embed.FS HTML templates
│       ├── scanner/             # HTTP + Headless engines
│       ├── template/            # Template caching
│       └── worker/              # Pool + autoscaler
│
├── migrations/                   # SQL migrations (001–007)
├── orchestrator/                 # Scan job coordination
├── pkg/errors/                   # Custom error types
├── template/                     # Nuclei template types + loader
├── test/                         # Integration & benchmark tests
│   ├── integration/              # 2 files — migrator e2e, scan e2e (build tag: integration)
│   └── benchmarks/               # 4 files — loader, engine, config, finding (Go benchmarks)
├── PLAN.md                       # Milestone plan
├── ARCHITECTURE.md               # Architecture overview
└── README.md                     # This file
```

## Test Coverage

**Status: ✅ All 23 packages pass `go test ./...` and `go vet ./...`**

| Package | Tests | Status |
|---------|-------|--------|
| `pkg/errors` | ✅ Full coverage | 100% |
| `config` | ✅ Full coverage | 97.6% |
| `internal/infrastructure/event` | ✅ Good coverage | 90.5% |
| `template` | ✅ Good coverage | 71.8% |
| `internal/infrastructure/auth` | ✅ Good coverage | ~70% |
| `internal/infrastructure/authscan` | ✅ Good coverage | ~70% |
| `internal/domain/entity` | 🟡 Moderate | ~65% |
| `internal/application` | 🟡 Moderate | ~55% |
| `internal/infrastructure/messaging` | 🟡 Moderate | ~40% |
| `internal/infrastructure/scanner` | 🟡 Moderate | ~25% |
| `api` | 🟡 Moderate | ~45% |
| `orchestrator` | 🟡 Growing | ~30% |
| `internal/infrastructure/database` | 🟡 Moderate | ~30% |
| Remaining packages | 🟡 Various | 20–50% |

~275 test functions · 10 benchmarks · ~60 test files · 5 dispatch loop tests

### Running Tests

```bash
# Run all unit tests
go test ./...

# Run tests with race detector
go test -race -count=1 ./...

# Run tests with coverage
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out -o coverage.html

# Run specific package tests
go test -count=1 -v ./internal/application/...

# Run integration tests (requires external services)
go test -tags=integration -count=1 ./test/integration/...

# Run benchmarks
go test -bench=. -benchmem ./test/benchmarks/...

# Short mode (skip integration-dependent subtests)
go test -short ./...
```

### Code Quality

```bash
# Run go vet
go vet ./...

# Run linter (requires golangci-lint)
golangci-lint run

# Format code
gofmt -w .
```

### Test Plan

Detailed TDD roadmap and gap analysis in [docs/features/](docs/features/):
- **[tdd-plan.md](docs/features/tdd-plan.md)** — Full TDD plan with phase-by-phase status
- **[test-gap-analysis.md](docs/features/test-gap-analysis.md)** — Gap analysis and remaining items
- **[scan-features.md](docs/features/scan-features.md)** — Scan feature development plan

### Building

```bash
# Build binary
go build -o vulnscanner main.go

# Build with version info
go build -ldflags "-X main.Version=$(git describe --tags)" -o vulnscanner main.go
```

## Database Schema

### ScanJob
| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Primary key |
| `created_by` | bigint | User ID who created the scan |
| `targets` | jsonb | Array of target URLs |
| `template_selectors` | jsonb | Template filter criteria |
| `status` | varchar | pending, running, completed, failed, cancelled |
| `progress` | jsonb | ScanProgress (total, completed, failed, in_progress) |
| `auth_credential_id` | bigint | FK to auth_credentials (nullable) |
| `created_at` | timestamp | Creation time |
| `updated_at` | timestamp | Last update time |

### Finding
| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Primary key |
| `scan_id` | bigint | FK to ScanJob (CASCADE delete) |
| `target` | varchar | Scanned target |
| `template_id` | varchar | Nuclei template ID |
| `matched` | boolean | Whether vulnerability matched |
| `severity` | varchar | info, low, medium, high, critical |
| `details` | jsonb | Vulnerability details |
| `created_at` | timestamp | Creation time |

### AuthCredential
| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Primary key |
| `user_id` | bigint | Owner user ID |
| `name` | varchar | Credential display name |
| `method` | varchar | login_form, cookie, bearer, api_key, selenium |
| `config` | jsonb | Auth method-specific configuration |
| `login_url` | varchar | Target login URL |
| `verify_url` | varchar | Session verification URL |
| `verify_pattern` | varchar | Expected content for verification |
| `is_active` | boolean | Whether credential is usable |

## RBAC Roles

| Role | Permissions |
|------|-------------|
| **admin** | Full access to all resources |
| **security_analyst** | Create scans, manage credentials, view results, manage tickets |
| **auditor** | View-only access to scans, results, and credentials |
| **viewer** | Limited view access |

Extra permissions for credential vault:
- `credential:create` — Create new auth credentials
- `credential:read` — View credential metadata (secrets masked)
- `credential:update` — Modify existing credentials
- `credential:delete` — Remove credentials
- `credential:verify` — Test credential against target

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

This project follows the guidelines in [CODE_STYLE.md](CODE_STYLE.md). Please review it before submitting contributions.

## Documentation

- **[PLAN.md](PLAN.md)** — Milestone plan with progress tracking
- **[ARCHITECTURE.md](ARCHITECTURE.md)** — Comprehensive architecture overview
- **[CODE_STYLE.md](CODE_STYLE.md)** — Code style guide
- **[docs/features/scan-features.md](docs/features/scan-features.md)** — Scan feature development plan
- **[GO-PROJECT-STRUCTURE-BEST-PRACTICES.md](GO-PROJECT-STRUCTURE-BEST-PRACTICES.md)** — DDD/Go project conventions
- Swagger UI: `http://localhost:8080/api/docs/`

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [ProjectDiscovery Nuclei](https://github.com/projectdiscovery/nuclei) — Vulnerability scanning engine
- [Nuclei Templates](https://github.com/projectdiscovery/nuclei-templates) — Community-driven template library
- [Tenable Web App Scanner](https://docs.tenable.com/web-app-scanning/) — Feature reference for DAST capabilities
- [chromedp](https://github.com/chromedp/chromedp) — Headless Chrome for PDF generation

---

**Built with ❤️ for cybersecurity professionals**
