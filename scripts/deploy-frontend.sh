#!/usr/bin/env bash
# =============================================================================
# deploy-frontend.sh — Deploy / Update the React (Vite) Frontend
# Usage: Run as the deploy user:
#   bash deploy-frontend.sh [git_branch]
# =============================================================================
set -euo pipefail

BRANCH="${1:-main}"
APP_DIR="$HOME/apps/frontend"
BUILD_DIR="$APP_DIR/build"
NGINX_ROOT="/var/www/tiger55-frontend"
REPO_URL="${FRONTEND_REPO_URL:-https://github.com/rasel606/pngadminpanel.git}"

echo "============================================================"
echo "  Deploying React Frontend  (branch: $BRANCH)"
echo "============================================================"

# Load NVM
export NVM_DIR="$HOME/.nvm"
# shellcheck source=/dev/null
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# --- Clone or pull the repository ---
if [ ! -d "$APP_DIR/.git" ]; then
  if [ -z "$REPO_URL" ]; then
    echo "ERROR: FRONTEND_REPO_URL is not set."
    echo "  Set it as an environment variable or edit this script."
    exit 1
  fi
  echo "[1/4] Cloning repository..."
  mkdir -p "$(dirname "$APP_DIR")"
  git clone --branch "$BRANCH" "$REPO_URL" "$APP_DIR"
else
  echo "[1/4] Pulling latest changes from $BRANCH..."
  cd "$APP_DIR"
  git fetch origin
  git checkout "$BRANCH"
  git pull origin "$BRANCH"
fi

cd "$APP_DIR"

# --- Install dependencies ---
echo "[2/4] Installing dependencies..."
npm install

# --- Build the app ---
echo "[3/4] Building production bundle..."
npm run build

echo "  Build complete. Output: $BUILD_DIR"

# --- Deploy to Nginx web root ---
echo "[4/4] Deploying to Nginx web root..."
sudo mkdir -p "$NGINX_ROOT"
# Note: --delete removes files from the destination that no longer exist in the
# source. $NGINX_ROOT is dedicated to this application only.
sudo rsync -av --delete "$BUILD_DIR/" "$NGINX_ROOT/"
sudo chown -R www-data:www-data "$NGINX_ROOT"
sudo chmod -R 755 "$NGINX_ROOT"

# Reload Nginx to apply any config changes
sudo nginx -t && sudo systemctl reload nginx

echo ""
echo "============================================================"
echo "  ✅ Frontend deployed successfully!"
echo ""
echo "  Files served from: $NGINX_ROOT"
echo "  Accessible at:     https://tiger55.online"
echo "============================================================"
