#!/bin/bash
# ============================================
# SentinelScan Frontend - Development Runner
# ============================================
# Starts the development environment with:
#   - Vite dev server (HMR enabled)
#   - Port 5173
#   - Source code live-sync via volumes
#   - No SSL (HTTP only)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🚀 Starting SentinelScan Frontend - DEVELOPMENT"
echo "================================================"
echo ""
echo "  → Vite Dev Server (HMR enabled)"
echo "  → Port: 5173"
echo "  → Source: Live-sync via volumes"
echo "  → API:    http://localhost:8080/api"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Please start Docker and try again."
    exit 1
fi

# Start development environment
echo "📦 Building and starting containers..."
docker compose \
  -f docker-compose.yml \
  -f docker-compose.dev.yml \
  --env-file .env.dev \
  up --build
