#!/usr/bin/env bash
# =============================================================================
# apply-nginx-api-config.sh — Install API Nginx config and reload safely
#
# Run this on the VPS where Nginx is installed.
#
# Usage:
#   bash scripts/apply-nginx-api-config.sh
#
# Optional environment variables:
#   SOURCE_CONF   Path to source config file (default: nginx/api.conf)
#   TARGET_CONF   Path to target site config (default: /etc/nginx/sites-available/api.tiger55.online)
#   ENABLE_LINK   Path to enabled symlink (default: /etc/nginx/sites-enabled/api.tiger55.online)
# =============================================================================

set -euo pipefail

SOURCE_CONF="${SOURCE_CONF:-nginx/api.conf}"
TARGET_CONF="${TARGET_CONF:-/etc/nginx/sites-available/api.tiger55.online}"
ENABLE_LINK="${ENABLE_LINK:-/etc/nginx/sites-enabled/api.tiger55.online}"

if [[ "$(id -u)" -eq 0 ]]; then
  SUDO=""
else
  SUDO="sudo"
fi

if ! command -v nginx >/dev/null 2>&1; then
  echo "ERROR: nginx is not installed or not available in PATH."
  exit 1
fi

if [[ ! -f "$SOURCE_CONF" ]]; then
  echo "ERROR: Source config not found: $SOURCE_CONF"
  echo "Run this script from the repository root, or set SOURCE_CONF."
  exit 1
fi

echo "============================================================"
echo "  Applying API Nginx config"
echo "============================================================"
echo "Source: $SOURCE_CONF"
echo "Target: $TARGET_CONF"

echo "[1/4] Installing config file..."
$SUDO install -D -m 644 "$SOURCE_CONF" "$TARGET_CONF"

echo "[2/4] Enabling site symlink..."
$SUDO ln -sfn "$TARGET_CONF" "$ENABLE_LINK"

echo "[3/4] Validating nginx configuration..."
$SUDO nginx -t

echo "[4/4] Reloading nginx..."
$SUDO systemctl reload nginx

echo ""
echo "============================================================"
echo "  Done"
echo ""
echo "Next checks:"
echo "  curl -I https://api.tiger55.online"
echo "  curl -sS \"https://api.tiger55.online/socket.io/?EIO=4&transport=polling\" | head -c 200; echo"
echo "============================================================"
