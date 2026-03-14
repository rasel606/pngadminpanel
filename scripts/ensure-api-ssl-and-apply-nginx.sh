#!/usr/bin/env bash
# =============================================================================
# ensure-api-ssl-and-apply-nginx.sh — Request/renew API TLS cert, then apply
# Nginx API config in one flow.
#
# Usage:
#   API_DOMAIN=api.tiger55.online \
#   CERTBOT_EMAIL=admin@tiger55.online \
#   bash scripts/ensure-api-ssl-and-apply-nginx.sh
#
# Optional environment variables:
#   API_DOMAIN        TLS domain (default: api.tiger55.online)
#   CERTBOT_EMAIL     Email used by Let's Encrypt (required unless DRY_RUN=1)
#   CERTBOT_STAGING   1 to use Let's Encrypt staging endpoint (default: 0)
#   DRY_RUN           1 to run certbot with --dry-run where supported
#   APPLY_SCRIPT      Path to apply script (default: scripts/apply-nginx-api-config.sh)
# =============================================================================

set -euo pipefail

API_DOMAIN="${API_DOMAIN:-api.tiger55.online}"
CERTBOT_EMAIL="${CERTBOT_EMAIL:-}"
CERTBOT_STAGING="${CERTBOT_STAGING:-0}"
DRY_RUN="${DRY_RUN:-0}"
APPLY_SCRIPT="${APPLY_SCRIPT:-scripts/apply-nginx-api-config.sh}"

CERT_PATH="/etc/letsencrypt/live/${API_DOMAIN}/fullchain.pem"

if [[ "$(id -u)" -eq 0 ]]; then
  SUDO=""
else
  SUDO="sudo"
fi

echo "============================================================"
echo "  Ensuring SSL certificate and applying Nginx API config"
echo "============================================================"
echo "Domain: $API_DOMAIN"

install_certbot_if_missing() {
  if command -v certbot >/dev/null 2>&1; then
    return
  fi

  echo "[1/5] Installing Certbot + nginx plugin..."
  $SUDO apt-get update -y
  $SUDO apt-get install -y certbot python3-certbot-nginx
}

request_initial_cert() {
  if [[ -z "$CERTBOT_EMAIL" ]]; then
    echo "ERROR: CERTBOT_EMAIL is required for initial certificate request."
    echo "Set CERTBOT_EMAIL and rerun."
    exit 1
  fi

  echo "[2/5] Requesting initial certificate for $API_DOMAIN..."

  certbot_args=(
    certonly
    --nginx
    --non-interactive
    --agree-tos
    --email "$CERTBOT_EMAIL"
    -d "$API_DOMAIN"
    --keep-until-expiring
  )

  if [[ "$CERTBOT_STAGING" == "1" ]]; then
    certbot_args+=(--staging)
  fi

  if [[ "$DRY_RUN" == "1" ]]; then
    certbot_args+=(--dry-run)
  fi

  $SUDO certbot "${certbot_args[@]}"
}

renew_existing_cert() {
  echo "[2/5] Existing certificate found. Running renewal check..."

  certbot_args=(renew --non-interactive)

  if [[ "$CERTBOT_STAGING" == "1" ]]; then
    certbot_args+=(--staging)
  fi

  if [[ "$DRY_RUN" == "1" ]]; then
    certbot_args+=(--dry-run)
  fi

  $SUDO certbot "${certbot_args[@]}"
}

run_apply_script() {
  if [[ ! -f "$APPLY_SCRIPT" ]]; then
    echo "ERROR: Apply script not found: $APPLY_SCRIPT"
    exit 1
  fi

  echo "[3/5] Applying Nginx API config..."
  bash "$APPLY_SCRIPT"
}

show_certificate_summary() {
  echo "[4/5] Certificate summary:"
  if [[ -f "$CERT_PATH" ]]; then
    $SUDO openssl x509 -in "$CERT_PATH" -noout -subject -issuer -dates
  else
    echo "  WARNING: Certificate file not found at $CERT_PATH"
  fi
}

smoke_test() {
  echo "[5/5] Smoke testing HTTPS endpoint..."
  curl -sS -I "https://${API_DOMAIN}" | sed -n '1,10p'
}

install_certbot_if_missing

if [[ -f "$CERT_PATH" ]]; then
  renew_existing_cert
else
  request_initial_cert
fi

run_apply_script
show_certificate_summary
smoke_test

echo ""
echo "============================================================"
echo "  Done"
echo "  API TLS + Nginx config flow completed for $API_DOMAIN"
echo "============================================================"
