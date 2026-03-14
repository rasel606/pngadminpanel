#!/usr/bin/env bash
# =============================================================================
# server-setup.sh — Initial Contabo VPS Setup Script (optional helper)
#
# Usage: Run as root inside an SSH session on the server:
#   bash server-setup.sh [deploy_username]
#
# This script automates Sections 4.1–4.6 of CONTABO_VPS_SETUP.md.
# SSH hardening (Section 5.3) is intentionally NOT automated here because
# you must confirm key-based login works before disabling password auth.
# Follow CONTABO_VPS_SETUP.md Section 5 manually after this script completes.
# =============================================================================
set -euo pipefail

DEPLOY_USER="${1:-deploy}"

echo "============================================================"
echo "  Contabo VPS Initial Setup"
echo "  Deploy user: $DEPLOY_USER"
echo "============================================================"
echo ""

# --- 1. Update system packages ---
echo "[1/6] Updating system packages..."
apt-get update -y && apt-get upgrade -y
apt-get install -y curl git ufw fail2ban build-essential htop unattended-upgrades rsync
echo "  Packages updated."

# --- 2. Create deploy user ---
echo "[2/6] Creating deploy user: $DEPLOY_USER"
if id "$DEPLOY_USER" &>/dev/null; then
  echo "  User '$DEPLOY_USER' already exists, skipping creation."
else
  # adduser will interactively prompt for a password and user details.
  # --gecos "" skips the name/contact prompts, leaving only the password prompt.
  adduser --gecos "" "$DEPLOY_USER"
  usermod -aG sudo "$DEPLOY_USER"
  echo "  User '$DEPLOY_USER' created and added to sudo group."
fi

# --- 3. Install Nginx ---
echo "[3/6] Installing Nginx..."
apt-get install -y nginx
systemctl enable nginx
systemctl start nginx
echo "  Nginx installed and started."

# --- 4. Configure UFW firewall ---
echo "[4/6] Configuring UFW firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
echo "  UFW configured. Open ports: SSH (22), HTTP (80), HTTPS (443)."

# --- 5. Enable Fail2Ban ---
echo "[5/6] Enabling Fail2Ban..."
systemctl enable fail2ban
systemctl start fail2ban
echo "  Fail2Ban enabled."

# --- 6. Enable automatic security updates ---
echo "[6/6] Enabling automatic security updates..."
cat > /etc/apt/apt.conf.d/20auto-upgrades <<'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
EOF
echo "  Unattended upgrades configured."

echo ""
echo "============================================================"
echo "  ✅ Initial setup complete!"
echo ""
echo "  NEXT: Follow Section 5 of CONTABO_VPS_SETUP.md to:"
echo "    1. Add your SSH public key to /home/$DEPLOY_USER/.ssh/authorized_keys"
echo "    2. Test key-based login in a new terminal"
echo "    3. ONLY THEN harden SSH (disable root login + password auth)"
echo "    4. Restart sshd:  systemctl restart sshd"
echo ""
echo "  Then log in as: ssh $DEPLOY_USER@$(hostname -I | awk '{print $1}')"
echo "============================================================"

