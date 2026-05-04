---
date: 2026-05-04
topic: "Deployment Pipeline for Go Backend"
status: validated
---

# Deployment Pipeline Design for SentinelScan Go Backend

## Problem Statement
Need a reproducible, environment-separated deployment setup for the SentinelScan Go backend supporting development (hot reload), staging (pre-production validation), and production (hardened, scalable runtime).

## Constraints
- Must use Docker and Docker Compose for consistency across environments
- Must support 3 distinct environments: development, staging, production
- Must align with existing project structure (Go 1.25.7, PostgreSQL, GORM, Viper config)
- Sensitive data must be handled via Docker secrets in production
- Development environment must support live code reloading

## Approach
Use a layered Dockerfile strategy with a shared multi-stage build for staging/production, and a dev-specific Dockerfile with hot reload. Each environment has isolated docker-compose configs with environment-appropriate settings for worker pools, database credentials, and restart policies.

## Architecture
### Deployment Flow
1. **Development**: Local code mounts → Air hot reload → Fast iteration
2. **Staging**: Multi-stage build → Staging DB → Pre-production validation
3. **Production**: Optimized multi-stage build → Secrets management → Resource-constrained, restart-on-failure runtime

### Key Components
| Component | Development | Staging | Production |
|-----------|-------------|---------|-------------|
| Runtime Image | golang:1.25.7-alpine | alpine:3.20 (multi-stage) | alpine:3.20 (multi-stage) |
| Reload Mechanism | Air | None (static binary) | None (static binary) |
| Database | PostgreSQL 16-alpine (local) | PostgreSQL 16-alpine (local) | PostgreSQL 16-alpine (local) |
| Secrets | Env vars | Env vars | Docker secrets |
| Restart Policy | No restart | unless-stopped | always |
| Resource Limits | None | None | 2 CPU, 2GB RAM |

## Components
### 1. Shared Multi-Stage Dockerfile (`deployments/shared/Dockerfile.base`)
- Stage 1: Build Go binary with CGO disabled, optimized with `-ldflags="-s -w"`
- Stage 2: Minimal Alpine runtime with CA certificates
- Runs as non-root user (UID 1000) for security

### 2. Development Dockerfile (`deployments/development/Dockerfile`)
- Uses Go 1.25.7-alpine with Air installed
- Mounts local code for live reloading
- Exposes port 8080 with debug-friendly settings

### 3. Docker Compose Files
- **Development**: Includes backend, PostgreSQL, Adminer (DB management)
- **Staging**: Backend + PostgreSQL with staging-specific env vars
- **Production**: Backend + PostgreSQL with secrets, resource limits, healthchecks

## Data Flow
1. Developer writes code → Local changes mount to dev container → Air rebuilds and restarts
2. Staging deploy → Build from `deployments/shared/Dockerfile.base` → Connects to staging DB
3. Production deploy → Build optimized image → Loads secrets from `/run/secrets/` → Starts with resource limits

## Error Handling
- Healthchecks on all services (30s interval for backend, 5s for PostgreSQL)
- Staging/production use `restart: unless-stopped` / `restart: always` to recover from crashes
- PostgreSQL uses `pg_isready` healthchecks to delay backend startup until DB is ready

## Testing Strategy
- Dev: Manual testing via live reload, Adminer for DB inspection
- Staging: Validate build process, run integration tests against staging environment
- Production: Canary deployments (out of scope for initial setup), monitor healthcheck endpoints

## Open Questions
- Should production use a reverse proxy (Nginx/Traefik) for TLS termination? (Currently binds to 127.0.0.1 only)
- Should staging use a managed PostgreSQL instance instead of local container?
- Do we need Redis or other services added to the compose files for future features?
