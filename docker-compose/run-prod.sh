#!/bin/bash
# ============================================
# SentinelScan Frontend - Production Runner
# ============================================
# Starts the production environment with:
#   - Production build (multi-stage Dockerfile)
#   - Hardened Nginx (CSP, HSTS, rate limiting)
#   - SSL/TLS (self-signed for prototype)
#   - Ports: 80 (HTTP redirect) + 443 (HTTPS)
#   - Resource limits: 256M RAM, 0.5 CPU
#   - Read-only filesystem + tmpfs

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🚀 Starting SentinelScan Frontend - PRODUCTION"
echo "=============================================="
echo ""
echo "  → Production Build (multi-stage)"
echo "  → Nginx (hardened: CSP, HSTS, rate limiting)"
echo "  → Ports: 80 (HTTP→HTTPS redirect) + 443 (HTTPS)"
echo "  → API:     https://api.sentinelscan.com/api"
echo "  → Limits:  256M RAM, 0.5 CPU"
echo "  → Security: Read-only FS, no-new-privileges"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check SSL certificates
if [ ! -f "ssl/cert.pem" ] || [ ! -f "ssl/key.pem" ]; then
    echo "⚠️  SSL certificates not found in ssl/ directory."
    echo "   Generating self-signed certificate for prototype..."
    echo ""
    bash "$SCRIPT_DIR/generate-ssl.sh"
    echo ""
fi

# Verify SSL permissions
if [ "$(stat -c %a ssl/key.pem)" != "600" ]; then
    echo "⚠️  Fixing SSL key permissions..."
    chmod 600 ssl/key.pem
fi

# Parse arguments
ACTION="${1:-up}"

case "$ACTION" in
  up)
    echo "📦 Building and starting production container..."
    docker compose \
      -f docker-compose.yml \
      -f docker-compose.prod.yml \
      --env-file .env.prod \
      up --build -d
    echo ""
    echo "✅ Production started!"
    echo "   → HTTPS: https://localhost:443"
    echo "   → HTTP:  http://localhost:80 (redirects to HTTPS)"
    echo "   → Logs:  docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.prod logs -f"
    echo ""
    echo "⚠️  Self-signed certificate: browser will show security warning."
    echo "   Click 'Advanced → Proceed' to continue."
    ;;

  down)
    echo "🛑 Stopping production container..."
    docker compose \
      -f docker-compose.yml \
      -f docker-compose.prod.yml \
      --env-file .env.prod \
      down
    echo "✅ Production stopped."
    ;;

  logs)
    echo "📋 Showing production logs..."
    docker compose \
      -f docker-compose.yml \
      -f docker-compose.prod.yml \
      --env-file .env.prod \
      logs -f
    ;;

  rebuild)
    echo "🔄 Rebuilding production container..."
    docker compose \
      -f docker-compose.yml \
      -f docker-compose.prod.yml \
      --env-file .env.prod \
      up --build -d --force-recreate
    echo "✅ Production rebuilt and restarted."
    ;;

  status)
    echo "📊 Production container status:"
    docker compose \
      -f docker-compose.yml \
      -f docker-compose.prod.yml \
      --env-file .env.prod \
      ps
    ;;

  clean)
    echo "🧹 Cleaning up production (containers, images, volumes)..."
    docker compose \
      -f docker-compose.yml \
      -f docker-compose.prod.yml \
      --env-file .env.prod \
      down --rmi all -v
    echo "✅ Production cleaned up."
    ;;

  *)
    echo "Usage: $0 {up|down|logs|rebuild|status|clean}"
    echo ""
    echo "Commands:"
    echo "  up      - Build and start production (default)"
    echo "  down    - Stop production container"
    echo "  logs    - Follow production logs"
    echo "  rebuild - Force rebuild and restart"
    echo "  status  - Show container status"
    echo "  clean   - Remove containers, images, and volumes"
    exit 1
    ;;
esac
