# Docker Compose Configuration

Multi-environment Docker setup for SentinelScan Frontend.

## File Structure

```
docker-compose/
├── docker-compose.yml           # Base configuration (shared)
├── docker-compose.dev.yml       # Development overrides
├── docker-compose.staging.yml   # Staging overrides
├── docker-compose.prod.yml      # Production overrides
├── nginx/
│   ├── nginx.dev.conf           # Dev: reverse proxy to Vite
│   ├── nginx.staging.conf       # Staging: moderate security
│   └── nginx.prod.conf          # Production: hardened security
├── ssl/
│   ├── cert.pem                 # Self-signed certificate (auto-generated)
│   └── key.pem                  # Private key (auto-generated)
├── .env.dev                     # Development environment variables
├── .env.staging                 # Staging environment variables
├── .env.prod                    # Production environment variables
├── .env.example                 # Template for new environments
├── generate-ssl.sh              # Generate self-signed SSL certificate
├── manage-logs.sh               # Nginx log management utility
├── run.sh                       # Unified environment manager
├── run-dev.sh                   # Development runner
├── run-staging.sh               # Staging runner
└── run-prod.sh                  # Production runner

logs/                            # Nginx access & error logs (auto-created)
├── .gitkeep
├── 2026-05-02-access.log        # Daily access log
└── 2026-05-02-error.log         # Daily error log
```

## Quick Start

### Option 1: Unified Script (Recommended)

```bash
cd docker-compose

# Start development
./run.sh dev

# Start staging
./run.sh staging up

# Start production
./run.sh prod up

# View production logs
./run.sh prod logs

# Stop production
./run.sh prod down
```

### Option 2: Individual Scripts

```bash
cd docker-compose

# Development
./run-dev.sh

# Staging (with commands)
./run-staging.sh up        # Start
./run-staging.sh down      # Stop
./run-staging.sh logs      # View logs
./run-staging.sh rebuild   # Rebuild
./run-staging.sh status    # Check status

# Production (with commands)
./run-prod.sh up           # Start (auto-generates SSL if missing)
./run-prod.sh down         # Stop
./run-prod.sh logs         # View logs
./run-prod.sh rebuild      # Rebuild
./run-prod.sh status       # Check status
./run-prod.sh clean        # Remove everything
```

### Option 3: Docker Compose Commands

```bash
# Development
docker compose -f docker-compose.yml -f docker-compose.dev.yml --env-file .env.dev up

# Staging
docker compose -f docker-compose.yml -f docker-compose.staging.yml --env-file .env.staging up -d

# Production
docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.prod up -d
```

## Environment Comparison

| Feature | Dev | Staging | Production |
|---------|-----|---------|------------|
| **Port** | 5173 | 8080 | 80/443 |
| **HMR** | ✅ | ❌ | ❌ |
| **Volumes** | Source mounted | None | None |
| **Resource Limits** | None | 512M / 1 CPU | 256M / 0.5 CPU |
| **Security Headers** | None | Basic | Hardened (CSP, HSTS, etc.) |
| **SSL** | ❌ | ❌ | ✅ (self-signed) |
| **Rate Limiting** | ❌ | ❌ | ✅ (10 req/s) |
| **Read-only FS** | ❌ | ❌ | ✅ |
| **Restart Policy** | no | unless-stopped | always |

## Available Commands

### Development (`./run-dev.sh`)

| Command | Description |
|---------|-------------|
| `./run-dev.sh` | Start development server (foreground) |

### Staging (`./run-staging.sh`)

| Command | Description |
|---------|-------------|
| `./run-staging.sh up` | Build and start (default) |
| `./run-staging.sh down` | Stop container |
| `./run-staging.sh logs` | Follow container logs |
| `./run-staging.sh rebuild` | Force rebuild and restart |
| `./run-staging.sh status` | Show container status |

### Production (`./run-prod.sh`)

| Command | Description |
|---------|-------------|
| `./run-prod.sh up` | Build and start (default) |
| `./run-prod.sh down` | Stop container |
| `./run-prod.sh logs` | Follow container logs |
| `./run-prod.sh rebuild` | Force rebuild and restart |
| `./run-prod.sh status` | Show container status |
| `./run-prod.sh clean` | Remove containers, images, and volumes |

## Nginx Request Logging

All HTTP requests are automatically logged to the `logs/` directory with **daily rotation**.

### Log File Format

```
logs/
├── 2026-05-02-access.log    # All requests for May 2, 2026
├── 2026-05-02-error.log     # Errors for May 2, 2026
├── 2026-05-03-access.log    # All requests for May 3, 2026
└── 2026-05-03-error.log     # Errors for May 3, 2026
```

### Access Log Format

Each line contains:
```
timestamp | client_ip | method uri | status | bytes_sent | request_time | referer | user_agent
```

Example:
```
02/May/2026:14:30:00 +0000 | 192.168.1.100 | GET /dashboard | 200 | 45230 | 0.002 | "http://localhost:5173/" | "Mozilla/5.0..."
```

### Log Management (`./manage-logs.sh`)

```bash
# List all log files
./manage-logs.sh list

# View today's access log
./manage-logs.sh access

# View access log for specific date
./manage-logs.sh access 2026-05-02

# View today's error log
./manage-logs.sh error

# View statistics (status codes, top IPs, top endpoints)
./manage-logs.sh stats

# Tail access log in real-time
./manage-logs.sh tail

# Search for specific pattern
./manage-logs.sh search "404"
./manage-logs.sh search "POST" 2026-05-02

# Clean up logs older than 30 days
./manage-logs.sh clean

# Clean up logs older than 7 days
./manage-logs.sh clean 7
```

## SSL Certificate

Production uses self-signed SSL certificates for prototype/development.

### Auto-Generated

The production runner (`./run-prod.sh`) automatically generates SSL certificates if they don't exist.

### Manual Generation

```bash
./generate-ssl.sh
```

### Certificate Details

- **Type**: Self-signed X.509
- **Key**: RSA 2048-bit
- **Validity**: 365 days
- **Domains**: `localhost`, `sentinelscan.com`, `www.sentinelscan.com`, `127.0.0.1`

### Browser Warning

Self-signed certificates trigger browser security warnings. For prototype:
- **Chrome**: Click "Advanced" → "Proceed to localhost (unsafe)"
- **Firefox**: Click "Advanced" → "Accept the Risk and Continue"

### Using Your Own Certificate

Replace the files in `ssl/` directory:

```bash
cp your-cert.pem ssl/cert.pem
cp your-key.pem ssl/key.pem
chmod 600 ssl/key.pem
```
