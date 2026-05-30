#!/bin/bash
# ============================================
# SentinelScan Frontend - Environment Manager
# ============================================
# Unified script to manage all environments
# Usage: ./run.sh [dev|staging|prod] [command]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

ENV="${1:-}"
ACTION="${2:-up}"

# Banner
echo "╔══════════════════════════════════════════╗"
echo "║   SentinelScan Frontend - Docker Manager ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# Show usage if no environment specified
if [ -z "$ENV" ]; then
    echo "Usage: $0 <environment> [command]"
    echo ""
    echo "Environments:"
    echo "  dev       - Development (Vite HMR, port 5173)"
    echo "  staging   - Staging (Nginx, port 8080)"
    echo "  prod      - Production (Nginx+SSL, port 443)"
    echo ""
    echo "Commands:"
    echo "  up        - Build and start (default)"
    echo "  down      - Stop container"
    echo "  logs      - Follow logs"
    echo "  rebuild   - Force rebuild and restart"
    echo "  status    - Show container status"
    echo "  clean     - Remove everything (prod only)"
    echo ""
    echo "Examples:"
    echo "  $0 dev              # Start development"
    echo "  $0 staging up       # Start staging"
    echo "  $0 prod logs        # View production logs"
    echo "  $0 prod down        # Stop production"
    exit 0
fi

# Check Docker
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running."
    exit 1
fi

# Route to environment script
case "$ENV" in
  dev|development)
    bash "$SCRIPT_DIR/run-dev.sh"
    ;;

  staging|stg)
    bash "$SCRIPT_DIR/run-staging.sh" "$ACTION"
    ;;

  prod|production)
    bash "$SCRIPT_DIR/run-prod.sh" "$ACTION"
    ;;

  *)
    echo "❌ Unknown environment: $ENV"
    echo "   Valid options: dev, staging, prod"
    exit 1
    ;;
esac
