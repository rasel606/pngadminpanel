#!/usr/bin/env bash
# =============================================================================
# deploy-backend.sh — Deploy / Update the Express.js Backend
# Usage: Run as the deploy user:
#   bash deploy-backend.sh [git_branch]
# =============================================================================
set -euo pipefail

BRANCH="${1:-main}"
APP_DIR="$HOME/apps/backend"
APP_NAME="backend"
REPO_URL="${BACKEND_REPO_URL:-}" # Set via environment or edit below:
# REPO_URL="https://github.com/YOUR_USERNAME/YOUR_BACKEND_REPO.git"

echo "============================================================"
echo "  Deploying Express Backend  (branch: $BRANCH)"
echo "============================================================"

# Load NVM
export NVM_DIR="$HOME/.nvm"
# shellcheck source=/dev/null
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# --- Clone or pull the repository ---
if [ ! -d "$APP_DIR/.git" ]; then
  if [ -z "$REPO_URL" ]; then
    echo "ERROR: BACKEND_REPO_URL is not set."
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
echo "[2/4] Installing production dependencies..."
npm install --production

# --- Ensure .env exists ---
echo "[3/4] Checking environment variables..."
if [ ! -f ".env" ]; then
  if [ -f ".env.example" ]; then
    cp .env.example .env
    echo "  ⚠  Created .env from .env.example — please edit $APP_DIR/.env with production values!"
  else
    echo "  ⚠  No .env file found. Create $APP_DIR/.env with your production settings."
  fi
else
  echo "  .env file found."
fi

# --- Start or restart with PM2 ---
echo "[4/4] Starting/restarting with PM2..."
if pm2 describe "$APP_NAME" > /dev/null 2>&1; then
  pm2 restart "$APP_NAME" --update-env
  echo "  PM2 process '$APP_NAME' restarted."
else
  # Prefer ecosystem config if present, otherwise start directly
  if [ -f "ecosystem.config.js" ]; then
    pm2 start ecosystem.config.js --only "$APP_NAME" --env production
  else
    pm2 start src/index.js --name "$APP_NAME" --env production
  fi
  echo "  PM2 process '$APP_NAME' started."
fi

pm2 save

echo ""
echo "============================================================"
echo "  ✅ Backend deployed successfully!"
echo ""
echo "  Check status:  pm2 list"
echo "  View logs:     pm2 logs $APP_NAME"
echo "  Health check:  curl http://localhost:5000/api/health"
echo "============================================================"
