#!/bin/bash
# ============================================
# SentinelScan Frontend - Staging Runner
# ============================================
# Starts the staging environment with:
#   - Production-like build (multi-stage Dockerfile)
#   - Nginx with moderate security headers
#   - Port 8080
#   - Resource limits: 512M RAM, 1 CPU
#   - No SSL (HTTP only)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🚀 Starting SentinelScan Frontend - STAGING"
echo "============================================"
echo ""
echo "  → Production Build (multi-stage)"
echo "  → Nginx (moderate security headers)"
echo "  → Port: 8080"
echo "  → API:    https://staging-api.sentinelscan.com/api"
echo "  → Limits: 512M RAM, 1 CPU"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Please start Docker and try again."
    exit 1
fi

# Parse arguments
ACTION="${1:-up}"

case "$ACTION" in
  up)
    echo "📦 Building and starting staging container..."
    docker compose \
      -f docker-compose.yml \
      -f docker-compose.staging.yml \
      --env-file .env.staging \
      up --build -d
    echo ""
    echo "✅ Staging started!"
    echo "   → Access: http://localhost:8080"
    echo "   → Logs:   docker compose -f docker-compose.yml -f docker-compose.staging.yml --env-file .env.staging logs -f"
    ;;

  down)
    echo "🛑 Stopping staging container..."
    docker compose \
      -f docker-compose.yml \
      -f docker-compose.staging.yml \
      --env-file .env.staging \
      down
    echo "✅ Staging stopped."
    ;;

  logs)
    echo "📋 Showing staging logs..."
    docker compose \
      -f docker-compose.yml \
      -f docker-compose.staging.yml \
      --env-file .env.staging \
      logs -f
    ;;

  rebuild)
    echo "🔄 Rebuilding staging container..."
    docker compose \
      -f docker-compose.yml \
      -f docker-compose.staging.yml \
      --env-file .env.staging \
      up --build -d --force-recreate
    echo "✅ Staging rebuilt and restarted."
    ;;

  status)
    echo "📊 Staging container status:"
    docker compose \
      -f docker-compose.yml \
      -f docker-compose.staging.yml \
      --env-file .env.staging \
      ps
    ;;

  *)
    echo "Usage: $0 {up|down|logs|rebuild|status}"
    echo ""
    echo "Commands:"
    echo "  up      - Build and start staging (default)"
    echo "  down    - Stop staging container"
    echo "  logs    - Follow staging logs"
    echo "  rebuild - Force rebuild and restart"
    echo "  status  - Show container status"
    exit 1
    ;;
esac
