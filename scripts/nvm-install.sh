#!/usr/bin/env bash
# =============================================================================
# nvm-install.sh — Install NVM + Node.js LTS + PM2
# Usage: Run as the deploy user (NOT root):
#   bash nvm-install.sh
# =============================================================================
set -euo pipefail

NVM_VERSION="v0.39.7"

echo "============================================================"
echo "  Installing NVM $NVM_VERSION + Node.js LTS + PM2"
echo "============================================================"

# Install NVM
echo "[1/3] Installing NVM..."
curl -o- "https://raw.githubusercontent.com/nvm-sh/nvm/${NVM_VERSION}/install.sh" | bash
# Load NVM into the current shell
export NVM_DIR="$HOME/.nvm"
# shellcheck source=/dev/null
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

echo "  NVM installed: $(nvm --version)"

# Install Node.js LTS
echo "[2/3] Installing Node.js LTS..."
nvm install --lts
nvm use --lts
nvm alias default node
echo "  Node.js: $(node -v)"
echo "  npm:     $(npm -v)"

# Install PM2 globally
echo "[3/3] Installing PM2..."
npm install -g pm2

# Set up PM2 startup — capture the generated command, validate, then run
PM2_STARTUP_CMD="$(pm2 startup 2>&1 | grep '^sudo env' || true)"
if [ -n "$PM2_STARTUP_CMD" ]; then
  echo "  Running: $PM2_STARTUP_CMD"
  eval "$PM2_STARTUP_CMD"
else
  echo "  ⚠  Could not extract PM2 startup command. Run 'pm2 startup' manually."
fi
pm2 save

echo ""
echo "============================================================"
echo "  ✅ NVM, Node.js, and PM2 installed successfully!"
echo ""
echo "  Run 'source ~/.bashrc' or open a new terminal to use nvm."
echo "============================================================"
