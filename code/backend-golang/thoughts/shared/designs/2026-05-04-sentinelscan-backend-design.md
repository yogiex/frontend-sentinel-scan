---
date: 2026-05-04
topic: "SentinelScan Backend Architecture (Professional Go)"
status: validated
---

# SentinelScan Backend Design — Professional Go Architecture

## Problem Statement

We need to complete and professionalize the SentinelScan backend, a vulnerability assessment platform built in Go. The existing codebase has:

**Already Implemented:**
- Basic API layer with Gorilla Mux
- Worker pool pattern with producer-consumer channels
- Event bus for real-time streaming via WebSocket
- Nuclei template loading (YAML parsing works)
- GORM + PostgreSQL persistence
- Viper configuration management

**Critical Gaps:**
1. **No authentication/authorization** — Frontend expects JWT + RBAC with 4 roles
2. **Detection engine is a placeholder** — `detection.Engine.Execute()` returns dummy data
3. **No repository interfaces** — Direct GORM usage, untestable
4. **No middleware layer** — No auth, logging, CORS, rate limiting
5. **Missing tables** — `users`, `tickets`, `audit_logs` don't exist
6. **No result consumer** — `resultQueue` channel never consumed
7. **No progress tracking** — Scan progress not tracked/streamed properly

**Goal:** Complete the backend to production-grade quality using idiomatic Go patterns (golang-pro skill), matching frontend expectations.

---

## Constraints

**Non-negotiables:**
- Must use Go 1.21+ with idiomatic patterns
- Must maintain backward compatibility with existing API contracts
- PostgreSQL + GORM for persistence (established stack)
- WebSocket for real-time streaming (already working)
- Nuclei templates as primary detection engine
- JWT-based authentication (frontend expects Bearer tokens)
- RBAC matching frontend's permission matrix (4 roles, 15+ permissions)

**Limitations:**
- MVP focuses on network vulnerability scanning (web app scanning in v2)
- Single-node deployment first (distributed scanning as future enhancement)
- Simplified RBAC (1 role per user, not multiple roles)

---

## Approach

I evaluated three architectural approaches:

### Option 1: Clean Architecture + Hexagonal (Chosen ✅)

**Design:** 
- Domain layer (entities, repository interfaces, service interfaces)
- Application layer (use cases orchestrating domain + infrastructure)
- Infrastructure layer (GORM, Nuclei, JWT, WebSocket implementations)
- Interface layer (HTTP handlers, middleware, routes)

**Why I chose it:**
- **Testability:** Interfaces allow easy mocking (golang-pro requirement)
- **Separation of concerns:** Clear boundaries between business logic and frameworks
- **Maintainability:** Changes in GORM/Nuclei don't affect business logic
- **Scalability:** Can add gRPC interface later without touching core logic
- **Professional standard:** Used by Go enterprises (Uber, Google, etc.)

**Trade-offs:**
- More files/boilerplate initially
- Learning curve for developers unfamiliar with Clean Architecture
- **Mitigation:** Clear documentation + examples in codebase

### Option 2: Keep Current Layered Architecture

**Design:** Extend current structure (api/ → orchestrator → worker → detection) with minor additions.

**Why I rejected it:**
- No interface abstractions → hard to test
- Tightly coupled to GORM and Nuclei
- Adding authentication would be hacky without middleware
- Violates golang-pro "interface first" principle

### Option 3: Domain-Driven Design (DDD) Full

**Design:** Aggregates, value objects, domain events, repositories, etc.

**Why I rejected it:**
- Over-engineering for MVP
- Team may not be familiar with DDD concepts
- Clean Architecture gives us 80% of benefits with 20% of complexity

---

## Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                     Interface Layer                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  HTTP    │  │Middleware│  │  Routes  │              │
│  │ Handlers │  │ (Auth,   │  │ (Mux)    │              │
│  │          │  │  CORS,   │  │          │              │
│  │          │  │  Logging)│  │          │              │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘              │
│       │              │              │                      │
│  ┌────▼────────────▼──────────────▼─────┐              │
│  │         Application Layer              │              │
│  │  ┌──────────┐  ┌──────────┐      │              │
│  │  │  Scan    │  │  Auth    │      │              │
│  │  │ Use Cases│  │ Use Cases│      │              │
│  │  └────┬─────┘  └────┬─────┘      │              │
│  └───────┼──────────────┼──────────────┘              │
│          │              │                              │
│  ┌───────▼──────────────▼──────────────┐              │
│  │         Domain Layer                  │              │
│  │  ┌──────────┐  ┌──────────┐      │              │
│  │  │Entities  │  │Interfaces│      │              │
│  │  │(Scan,    │  │(Repo,   │      │              │
│  │  │ User,    │  │ Service) │      │              │
│  │  │ Ticket)  │  │          │      │              │
│  │  └──────────┘  └──────────┘      │              │
│  └───────┬──────────────┬──────────────┘              │
│          │              │                              │
│  ┌───────▼──────────────▼──────────────┐              │
│  │      Infrastructure Layer             │              │
│  │  ┌────────┐ ┌────────┐ ┌────────┐│              │
│  │  │ GORM   │ │ Nuclei │ │ JWT    ││              │
│  │  │(Post-  │ │ Engine │ │ Auth   ││              │
│  │  │greSQL) │ │        │ │        ││              │
│  │  └────────┘ └────────┘ └────────┘│              │
│  │  ┌────────┐ ┌────────┐ ┌────────┐│              │
│  │  │WebSocket│ │ Event  │ │ Config ││              │
│  │  │ Hub    │ │ Bus    │ │(Viper) ││              │
│  │  └────────┘ └────────┘ └────────┘│              │
│  └───────────────────────────────────────┘              │
└──────────────────────────────────────────────────────────┘
```

**Key Insight:** We're refactoring existing code into Clean Architecture incrementally. The worker pool, event bus, and template loader move to infrastructure layer. New domain interfaces get added. HTTP handlers become thin (just parse → call use case → return).

---

## Components

### 1. Domain Layer (`internal/domain/`)

**Responsibilities:**
- Enterprise business rules (entities, value objects)
- Repository interfaces (contracts for data access)
- Service interfaces (domain service contracts)

**Key Files:**
```
internal/domain/
├── entity/
│   ├── scan.go          // ScanJob, ScanResult, ScanStatus
│   ├── user.go          // User, Role, Permission
│   ├── ticket.go        // Ticket, TicketStatus
│   └── template.go     // Template, TemplateFilter
├── repository/
│   ├── scan_repository.go
│   ├── user_repository.go
│   ├── ticket_repository.go
│   └── audit_repository.go
└── service/
    ├── scan_service.go
    ├── auth_service.go
    └── ticket_service.go
```

**Example Interface (repository/scan_repository.go):**
```go
package repository

import "context"

type ScanRepository interface {
    Create(ctx context.Context, scan *entity.ScanJob) error
    FindByID(ctx context.Context, id uint) (*entity.ScanJob, error)
    Update(ctx context.Context, scan *entity.ScanJob) error
    List(ctx context.Context, filter ScanFilter) ([]*entity.ScanJob, error)
    Delete(ctx context.Context, id uint) error
}

type ScanFilter struct {
    CreatedBy uint
    Status    string
    Page      int
    PageSize  int
}
```

---

### 2. Application Layer (`internal/application/`)

**Responsibilities:**
- Application business rules (use cases)
- Orchestrate domain entities + infrastructure services
- No framework dependencies (pure Go)

**Key Files:**
```
internal/application/
├── scan/
│   ├── create_scan.go      // Use case: create + start scan
│   ├── get_scan.go         // Use case: get scan details
│   └── cancel_scan.go     // Use case: cancel running scan
├── auth/
│   ├── login.go            // Use case: authenticate user
│   └── validate_token.go  // Use case: validate JWT
└── ticket/
    ├── create_ticket.go
    └── update_ticket.go
```

**Example Use Case (scan/create_scan.go):**
```go
package scan

import (
    "context"
    "github.com/sentinelscan/internal/domain/entity"
    "github.com/sentinelscan/internal/domain/repository"
)

type CreateScanUseCase struct {
    scanRepo  repository.ScanRepository
    userRepo  repository.UserRepository
    orchestrator OrchestratorService // domain service interface
}

func (uc *CreateScanUseCase) Execute(ctx context.Context, req CreateScanRequest) (*entity.ScanJob, error) {
    // 1. Validate user exists
    user, err := uc.userRepo.FindByID(ctx, req.CreatedBy)
    if err != nil {
        return nil, fmt.Errorf("user not found: %w", err)
    }
    
    // 2. Create scan job entity
    scan := &entity.ScanJob{
        CreatedBy: user.ID,
        Targets: req.Targets,
        Status:   entity.ScanStatusPending,
    }
    
    // 3. Persist to DB
    if err := uc.scanRepo.Create(ctx, scan); err != nil {
        return nil, fmt.Errorf("create scan: %w", err)
    }
    
    // 4. Trigger orchestrator (async)
    go uc.orchestrator.StartScan(ctx, scan.ID)
    
    return scan, nil
}
```

---

### 3. Infrastructure Layer (`internal/infrastructure/`)

**Responsibilities:**
- Implement domain interfaces with concrete technologies
- Framework-specific code (GORM, Nuclei, JWT, etc.)
- External integrations

**Key Files:**
```
internal/infrastructure/
├── database/
│   ├── postgres/
│   │   ├── scan_repo.go      // Implements repository.ScanRepository
│   │   ├── user_repo.go      // Implements repository.UserRepository
│   │   └── models/          // GORM models (DB-specific)
│   │       ├── scan_model.go
│   │       └── user_model.go
│   └── connection.go         // PostgreSQL connection
├── scanner/
│   ├── nuclei/
│   │   ├── engine.go         // Implements detection engine
│   │   └── template_loader.go
│   └── worker/
│       ├── pool.go           // Existing worker pool (refactor)
│       └── task.go
├── auth/
│   ├── jwt_service.go       // JWT implementation
│   └── rbac.go              // RBAC enforcer
├── event/
│   └── bus.go               // Existing event bus (keep)
└── websocket/
    └── hub.go                // WebSocket hub for real-time
```

**Example Repository Implementation (database/postgres/scan_repo.go):**
```go
package postgres

import (
    "context"
    "github.com/sentinelscan/internal/domain/entity"
    "github.com/sentinelscan/internal/domain/repository"
    "gorm.io/gorm"
)

type ScanRepository struct {
    db *gorm.DB
}

func NewScanRepository(db *gorm.DB) repository.ScanRepository {
    return &ScanRepository{db: db}
}

func (r *ScanRepository) Create(ctx context.Context, scan *entity.ScanJob) error {
    // Convert domain entity to GORM model
    model := toScanModel(scan)
    if err := r.db.WithContext(ctx).Create(model).Error; err != nil {
        return fmt.Errorf("create scan: %w", err)
    }
    scan.ID = model.ID
    return nil
}

func (r *ScanRepository) FindByID(ctx context.Context, id uint) (*entity.ScanJob, error) {
    var model ScanJobModel
    if err := r.db.WithContext(ctx).First(&model, id).Error; err != nil {
        return nil, fmt.Errorf("find scan: %w", err)
    }
    return toScanEntity(&model), nil
}
```

---

### 4. Interface Layer (`internal/interface/`)

**Responsibilities:**
- HTTP handlers (thin, just parse → call use case → return)
- Middleware chain (auth, CORS, logging, rate limiting)
- Route definitions

**Key Files:**
```
internal/interface/
├── http/
│   ├── handler/
│   │   ├── scan_handler.go    // HTTP handlers for scans
│   │   ├── auth_handler.go    // Login, refresh token
│   │   └── ticket_handler.go
│   ├── middleware/
│   │   ├── auth.go            // JWT authentication middleware
│   │   ├── rbac.go            // Permission enforcement
│   │   ├── cors.go
│   │   ├── logging.go
│   │   └── ratelimit.go
│   ├── routes.go              // Route definitions
│   └── server.go             // HTTP server setup
└── grpc/                      // Future: gRPC interface
```

**Example Middleware (middleware/auth.go):**
```go
package middleware

import (
    "context"
    "net/http"
)

type contextKey string

const userContextKey contextKey = "user"

func Auth(jwtService AuthService) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            token := extractToken(r)
            claims, err := jwtService.Validate(token)
            if err != nil {
                writeUnauthorized(w)
                return
            }
            
            ctx := context.WithValue(r.Context(), userContextKey, claims)
            next.ServeHTTP(w, r.WithContext(ctx))
        })
    }
}

// Helper to get user from context in handlers
func GetUserFromContext(ctx context.Context) (*UserClaims, bool) {
    u, ok := ctx.Value(userContextKey).(*UserClaims)
    return u, ok
}
```

---

## Data Flow

### Scan Initiation Flow

```
Client POST /api/scans {targets, selectors}
        ↓
HTTP Handler (interface/http/handler/scan_handler.go)
        ↓ Parse request, extract user from context
CreateScanUseCase.Execute(ctx, req)
        ↓
[Application Layer]
  1. Validate user (userRepo.FindByID)
        ↓
  2. Create ScanJob entity
        ↓
  3. Persist (scanRepo.Create)
        ↓
  4. Trigger orchestrator (async goroutine)
        ↓
Return 202 Accepted {scan_id}
```

### Task Execution Flow

```
Orchestrator.StartScan(scanID)
        ↓
  1. Load templates (templateLoader.List)
        ↓
  2. Create task plan (target × template)
        ↓
  3. Push tasks to taskQueue channel
        ↓
  4. Update scan status → "running"
        ↓
Worker Pool (N goroutines)
        ↓ Pull task from taskQueue
  5. Execute task (detectionEngine.Execute)
        ↓
  6. Push result to resultQueue
        ↓
  7. If matched → publish finding to event bus
        ↓
Result Consumer goroutine
        ↓ Pull result from resultQueue
  8. Persist finding (scanResultRepo.Create)
        ↓
  9. Update progress (atomic counter)
        ↓
  10. Publish progress event (eventBus.PublishProgress)
        ↓
  11. If all tasks done → publish complete event
```

### Real-Time Streaming Flow

```
Client GET /api/scans/:id/stream
        ↓ Upgrade HTTP → WebSocket
WebSocket Handler (interface/http/handler/websocket_handler.go)
        ↓
  1. Subscribe to event bus (eventBus.Subscribe(scanID))
        ↓
  2. Loop: receive events from channel
        ↓
  3. Write JSON to WebSocket connection
        ↓
  4. On disconnect → unsubscribe
```

---

## Error Handling Strategy

### Error Types

```go
// pkg/errors/errors.go
package errors

import "net/http"

type AppError struct {
    Code    string `json:"code"`
    Message string `json:"message"`
    Status  int    `json:"-"`
}

func (e *AppError) Error() string {
    return e.Message
}

// Predefined errors
var (
    ErrNotFound       = &AppError{Code: "NOT_FOUND", Message: "Resource not found", Status: http.StatusNotFound}
    ErrUnauthorized   = &AppError{Code: "UNAUTHORIZED", Message: "Unauthorized", Status: http.StatusUnauthorized}
    ErrForbidden      = &AppError{Code: "FORBIDDEN", Message: "Insufficient permissions", Status: http.StatusForbidden}
    ErrInvalidInput   = &AppError{Code: "INVALID_INPUT", Message: "Invalid request body", Status: http.StatusBadRequest}
    ErrConflict       = &AppError{Code: "CONFLICT", Message: "Resource conflict", Status: http.StatusConflict}
    ErrInternalServer = &AppError{Code: "INTERNAL_ERROR", Message: "Internal server error", Status: http.StatusInternalServerError}
)
```

### Error Handling Patterns

**1. Wrap errors with context (golang-pro requirement):**
```go
result, err := uc.scanRepo.FindByID(ctx, id)
if err != nil {
    return nil, fmt.Errorf("get scan %d: %w", id, err)
}
```

**2. Handle domain errors in handlers:**
```go
scan, err := h.createScanUseCase.Execute(r.Context(), req)
if err != nil {
    var appErr *errors.AppError
    if errors.As(err, &appErr) {
        response.Error(w, appErr.Status, appErr.Code, appErr.Message)
        return
    }
    response.Error(w, http.StatusInternalServerError, "INTERNAL_ERROR", "An unexpected error occurred")
    return
}
```

**3. Task-level retry logic (worker/pool.go):**
```go
func (p *Pool) executeTask(ctx context.Context, task Task) Result {
    var lastErr error
    for attempt := 0; attempt <= task.Retries; attempt++ {
        if attempt > 0 {
            time.Sleep(exponentialBackoff(attempt))
        }
        finding, err := p.detectionEngine.Execute(ctx, task)
        if err == nil {
            return Result{TaskID: task.ID, Finding: finding}
        }
        lastErr = err
        if !isRetryable(err) {
            break
        }
    }
    return Result{TaskID: task.ID, Error: lastErr}
}
```

**4. Event bus backpressure handling:**
```go
func (b *Bus) Publish(scanID string, event Event) {
    b.mu.RLock()
    defer b.mu.RUnlock()
    
    for _, ch := range b.subscribers[scanID] {
        select {
        case ch <- event:
            // Sent successfully
        default:
            // Channel full, skip (non-blocking)
            log.Warn("subscriber channel full, skipping event")
        }
    }
}
```

---

## Testing Strategy (golang-pro Aligned)

### Unit Tests (per package)

**Pattern:** Table-driven tests with subtests

```go
func TestCreateScan_Success(t *testing.T) {
    tests := []struct {
        name    string
        req     CreateScanRequest
        wantErr bool
    }{
        {
            name: "valid scan request",
            req:  CreateScanRequest{Targets: []string{"example.com"}},
            wantErr: false,
        },
        {
            name: "empty targets",
            req:  CreateScanRequest{Targets: []string{}},
            wantErr: true,
        },
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            mockRepo := &MockScanRepository{}
            useCase := NewCreateScanUseCase(mockRepo)
            
            _, err := useCase.Execute(context.Background(), tt.req)
            
            if (err != nil) != tt.wantErr {
                t.Errorf("Execute() error = %v, wantErr %v", err, tt.wantErr)
            }
        })
    }
}
```

**Requirements:**
- Run with `-race` flag: `go test -race ./...`
- 80%+ coverage for business logic
- Mock interfaces using `testify/mock` or `gomock`

### Integration Tests

**Build tag:** `//go:build integration`

```go
// scan_integration_test.go
//go:build integration

func TestScanFlow_Integration(t *testing.T) {
    // Spin up test server with real PostgreSQL (testcontainers)
    // Execute scan against known target
    // Verify results persisted correctly
}
```

**Run:** `go test -tags=integration ./...`

### Benchmark Tests

```go
func BenchmarkDetectionEngine(b *testing.B) {
    engine := setupTestEngine()
    task := createBenchmarkTask()
    
    b.ResetTimer()
    for i := 0; i < b.N; i++ {
        engine.Execute(context.Background(), task)
    }
}
```

**Run:** `go test -bench=. -benchmem ./...`

### Test Coverage

```bash
# Generate coverage report
go test -race -coverprofile=coverage.out ./...

# View coverage
go tool cover -html=coverage.out
```

**Target:** 80%+ coverage for domain and application layers.

---

## Open Questions

### 1. Nuclei Integration Approach

**Option A:** Use Nuclei as a library (import `github.com/projectdiscovery/nuclei/v3`)
- ✅ Better performance (no process spawning)
- ✅ More control over execution
- ❌ Steeper learning curve
- ❌ Tied to Nuclei's internal APIs

**Option B:** Shell out to Nuclei CLI (`exec.Command("nuclei", ...)`)
- ✅ Simpler integration
- ✅ Easier to upgrade Nuclei versions
- ❌ Slower (process spawning overhead)
- ❌ Less control

**Recommendation:** Option A for better performance, but start with Option B for MVP speed.

### 2. Template Selector Syntax

**Current:** `template_selectors` as opaque JSONB

**Proposed:** Structured query:
```json
{
  "severity": ["high", "critical"],
  "tags": ["wordpress", "cms"],
  "exclude_tags": ["dos", "brute-force"],
  "template_ids": ["cve-2021-xxxxx"]
}
```

**Decision needed:** How users specify which templates to run.

### 3. Result Storage Strategy

**Option A (Current):** Flat JSONB in `scan_results.finding`
- ✅ Simple
- ❌ Hard to query (need JSONB queries)

**Option B:** Normalize findings into separate tables (`vulnerabilities`, `evidence`, `remediation`)
- ✅ Queryable
- ❌ More complex schema

**Recommendation:** Keep flat for MVP, normalize later if needed.

### 4. Progress Tracking Granularity

**Option A:** Per-template progress (coarse)
**Option B:** Per-target per-template progress (fine)

**Recommendation:** Option A for MVP (simpler), add Option B if users need more detail.

---

## Next Steps

Once this design is validated, the **planner agent** will create a detailed implementation plan covering:

### Phase 1: Foundation (Week 1)
1. Create new directory structure (internal/domain, internal/application, etc.)
2. Define domain entities and repository interfaces
3. Implement JWT authentication + RBAC middleware
4. Create database migration for new tables (users, tickets, audit_logs)

### Phase 2: Core Scanning (Week 1-2)
1. Refactor worker pool into infrastructure layer
2. Complete `detection.Engine.Execute()` with Nuclei integration
3. Implement result consumer (persist findings)
4. Add progress tracking and streaming

### Phase 3: API Completion (Week 2-3)
1. Implement all HTTP handlers (thin, use case driven)
2. Add middleware chain (auth, CORS, logging, rate limiting)
3. Standardize API responses
4. Complete WebSocket streaming

### Phase 4: Frontend Alignment (Week 3-4)
1. Implement user management endpoints
2. Implement ticket management endpoints
3. Implement audit log endpoints
4. Test against frontend expectations

### Phase 5: Testing & Hardening (Week 4-5)
1. Achieve 80%+ test coverage
2. Run benchmarks and optimize
3. Load testing
4. Security audit

---

**I'm proceeding to create the design doc. Interrupt if you want changes.**
