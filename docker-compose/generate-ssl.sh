#!/bin/bash
# Generate self-signed SSL certificate for development/prototype
# Usage: cd docker-compose && ./generate-ssl.sh

set -e

# Get the directory where this script lives
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SSL_DIR="$SCRIPT_DIR/ssl"
DAYS=365

echo "🔐 Generating self-signed SSL certificate..."

# Create SSL directory
mkdir -p "$SSL_DIR"

# Generate private key
echo "  → Generating RSA private key (2048-bit)..."
openssl genrsa -out "$SSL_DIR/key.pem" 2048 2>/dev/null

# Generate self-signed certificate
echo "  → Generating self-signed certificate (valid for $DAYS days)..."
openssl req -new -x509 \
  -key "$SSL_DIR/key.pem" \
  -out "$SSL_DIR/cert.pem" \
  -days $DAYS \
  -subj "/C=ID/ST=Jakarta/L=Jakarta/O=SentinelScan/OU=Development/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,DNS:sentinelscan.com,DNS:www.sentinelscan.com,IP:127.0.0.1"

# Set permissions
chmod 600 "$SSL_DIR/key.pem"
chmod 644 "$SSL_DIR/cert.pem"

echo ""
echo "✅ SSL certificate generated successfully!"
echo "   Certificate: $SSL_DIR/cert.pem"
echo "   Private Key: $SSL_DIR/key.pem"
echo "   Valid for:   $DAYS days"
echo ""
echo "⚠️  This is a self-signed certificate. Browsers will show a security warning."
echo "   For prototype/development, click 'Advanced → Proceed' in the browser."
