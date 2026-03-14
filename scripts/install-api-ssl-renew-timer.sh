#!/usr/bin/env bash
# =============================================================================
# install-api-ssl-renew-timer.sh — Install and enable systemd timer for API TLS
# renewal + Nginx config apply.
#
# Usage:
#   REPO_DIR=/opt/pngadminpanel bash scripts/install-api-ssl-renew-timer.sh
# =============================================================================

set -euo pipefail

REPO_DIR="${REPO_DIR:-/opt/pngadminpanel}"
SYSTEMD_DIR="/etc/systemd/system"
SERVICE_NAME="tiger55-api-ssl-renew.service"
TIMER_NAME="tiger55-api-ssl-renew.timer"
ENV_FILE="/etc/default/tiger55-api-ssl-renew"

if [[ "$(id -u)" -eq 0 ]]; then
  SUDO=""
else
  SUDO="sudo"
fi

if [[ ! -d "$REPO_DIR" ]]; then
  echo "ERROR: REPO_DIR does not exist: $REPO_DIR"
  exit 1
fi

echo "============================================================"
echo "  Installing API TLS renewal timer"
echo "============================================================"
echo "Repo: $REPO_DIR"

echo "[1/5] Installing systemd unit files..."
$SUDO install -D -m 644 "$REPO_DIR/scripts/systemd/$SERVICE_NAME" "$SYSTEMD_DIR/$SERVICE_NAME"
$SUDO install -D -m 644 "$REPO_DIR/scripts/systemd/$TIMER_NAME" "$SYSTEMD_DIR/$TIMER_NAME"

echo "[2/5] Rewriting WorkingDirectory in service file..."
$SUDO sed -i "s#^WorkingDirectory=.*#WorkingDirectory=$REPO_DIR#" "$SYSTEMD_DIR/$SERVICE_NAME"

echo "[3/5] Ensuring environment file exists..."
if [[ ! -f "$ENV_FILE" ]]; then
  $SUDO install -D -m 644 "$REPO_DIR/scripts/systemd/tiger55-api-ssl-renew.env.example" "$ENV_FILE"
  echo "  Created $ENV_FILE from example."
  echo "  Edit it and set CERTBOT_EMAIL before first successful issuance."
else
  echo "  Found existing $ENV_FILE"
fi

echo "[4/5] Reloading systemd and enabling timer..."
$SUDO systemctl daemon-reload
$SUDO systemctl enable --now "$TIMER_NAME"

echo "[5/5] Timer status:"
$SUDO systemctl status "$TIMER_NAME" --no-pager

echo ""
echo "============================================================"
echo "  Done"
echo ""
echo "Next checks:"
echo "  sudo systemctl list-timers | grep tiger55-api-ssl-renew"
echo "  sudo systemctl start $SERVICE_NAME"
echo "  sudo journalctl -u $SERVICE_NAME -n 100 --no-pager"
echo "============================================================"
