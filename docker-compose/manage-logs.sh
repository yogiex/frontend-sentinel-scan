#!/bin/bash
# ============================================
# SentinelScan Frontend - Log Manager
# ============================================
# Manage Nginx access and error logs
# Usage: ./manage-logs.sh [command]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOGS_DIR="$SCRIPT_DIR/../logs"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Banner
echo -e "${BLUE}╔══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   SentinelScan Frontend - Log Manager    ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════╝${NC}"
echo ""

ACTION="${1:-}"

case "$ACTION" in
  list)
    echo -e "${GREEN}📋 Available log files:${NC}"
    echo ""
    if [ -d "$LOGS_DIR" ]; then
      ls -lh "$LOGS_DIR"/*.log 2>/dev/null || echo -e "  ${YELLOW}No log files found.${NC}"
    else
      echo -e "  ${RED}Logs directory not found: $LOGS_DIR${NC}"
    fi
    ;;

  access)
    DATE="${2:-$(date +%Y-%m-%d)}"
    LOG_FILE="$LOGS_DIR/${DATE}-access.log"
    if [ -f "$LOG_FILE" ]; then
      echo -e "${GREEN}📄 Access log for $DATE:${NC}"
      echo "   $LOG_FILE"
      echo ""
      tail -n 50 "$LOG_FILE"
    else
      echo -e "${YELLOW}⚠️  No access log found for $DATE${NC}"
      echo "   Available dates:"
      ls "$LOGS_DIR"/*-access.log 2>/dev/null | sed 's/.*\///' | sed 's/-access\.log//' || echo "   (none)"
    fi
    ;;

  error)
    DATE="${2:-$(date +%Y-%m-%d)}"
    LOG_FILE="$LOGS_DIR/${DATE}-error.log"
    if [ -f "$LOG_FILE" ]; then
      echo -e "${RED}📄 Error log for $DATE:${NC}"
      echo "   $LOG_FILE"
      echo ""
      cat "$LOG_FILE"
    else
      echo -e "${YELLOW}⚠️  No error log found for $DATE${NC}"
      echo "   Available dates:"
      ls "$LOGS_DIR"/*-error.log 2>/dev/null | sed 's/.*\///' | sed 's/-error\.log//' || echo "   (none)"
    fi
    ;;

  stats)
    DATE="${2:-$(date +%Y-%m-%d)}"
    ACCESS_LOG="$LOGS_DIR/${DATE}-access.log"
    ERROR_LOG="$LOGS_DIR/${DATE}-error.log"

    echo -e "${GREEN}📊 Log statistics for $DATE:${NC}"
    echo ""

    if [ -f "$ACCESS_LOG" ]; then
      TOTAL=$(wc -l < "$ACCESS_LOG")
      echo "  Access log: $TOTAL requests"

      # Status code breakdown
      echo ""
      echo "  Status codes:"
      awk -F'|' '{print $4}' "$ACCESS_LOG" | tr -d ' ' | sort | uniq -c | sort -rn | while read count code; do
        echo "    $code: $count"
      done

      # Top IPs
      echo ""
      echo "  Top 10 IPs:"
      awk -F'|' '{print $2}' "$ACCESS_LOG" | tr -d ' ' | sort | uniq -c | sort -rn | head -10 | while read count ip; do
        echo "    $ip: $count"
      done

      # Top endpoints
      echo ""
      echo "  Top 10 endpoints:"
      awk -F'|' '{print $3}' "$ACCESS_LOG" | tr -d ' ' | sort | uniq -c | sort -rn | head -10 | while read count endpoint; do
        echo "    $endpoint: $count"
      done
    else
      echo -e "  ${YELLOW}No access log for $DATE${NC}"
    fi

    echo ""
    if [ -f "$ERROR_LOG" ]; then
      ERRORS=$(wc -l < "$ERROR_LOG")
      echo -e "  Error log: ${RED}$ERRORS errors${NC}"
    else
      echo -e "  Error log: ${GREEN}0 errors${NC}"
    fi
    ;;

  clean)
    DAYS="${2:-30}"
    echo -e "${YELLOW}🧹 Cleaning up logs older than $DAYS days...${NC}"
    echo ""

    if [ -d "$LOGS_DIR" ]; then
      find "$LOGS_DIR" -name "*.log" -mtime +"$DAYS" -print -delete 2>/dev/null | while read file; do
        echo "  Deleted: $(basename "$file")"
      done
      echo ""
      echo -e "${GREEN}✅ Cleanup complete.${NC}"
    else
      echo -e "  ${YELLOW}Logs directory not found.${NC}"
    fi
    ;;

  tail)
    DATE="${2:-$(date +%Y-%m-%d)}"
    LOG_FILE="$LOGS_DIR/${DATE}-access.log"
    if [ -f "$LOG_FILE" ]; then
      echo -e "${GREEN}📡 Tailing access log for $DATE (Ctrl+C to stop):${NC}"
      echo ""
      tail -f "$LOG_FILE"
    else
      echo -e "${YELLOW}⚠️  No access log found for $DATE${NC}"
    fi
    ;;

  search)
    QUERY="${2:-}"
    if [ -z "$QUERY" ]; then
      echo -e "${RED}❌ Usage: $0 search <query> [date]${NC}"
      echo ""
      echo "Examples:"
      echo "  $0 search 404              # Search for 404 errors today"
      echo "  $0 search 'POST' 2026-05-01  # Search for POST requests on specific date"
      exit 1
    fi

    DATE="${3:-$(date +%Y-%m-%d)}"
    LOG_FILE="$LOGS_DIR/${DATE}-access.log"

    if [ -f "$LOG_FILE" ]; then
      echo -e "${GREEN}🔍 Searching for '$QUERY' in $DATE access log:${NC}"
      echo ""
      grep -i "$QUERY" "$LOG_FILE" || echo -e "${YELLOW}No matches found.${NC}"
    else
      echo -e "${YELLOW}⚠️  No access log found for $DATE${NC}"
    fi
    ;;

  *)
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  list              - List all available log files"
    echo "  access [date]     - Show access log for date (default: today)"
    echo "  error [date]      - Show error log for date (default: today)"
    echo "  stats [date]      - Show statistics for date (default: today)"
    echo "  tail [date]       - Tail access log in real-time"
    echo "  search <q> [date] - Search access log for query"
    echo "  clean [days]      - Delete logs older than N days (default: 30)"
    echo ""
    echo "Examples:"
    echo "  $0 list"
    echo "  $0 access 2026-05-02"
    echo "  $0 error"
    echo "  $0 stats"
    echo "  $0 search 404"
    echo "  $0 clean 7"
    exit 1
    ;;
esac
