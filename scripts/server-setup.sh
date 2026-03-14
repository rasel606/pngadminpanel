#!/usr/bin/env bash
# =============================================================================
# server-setup.sh — Initial Contabo VPS Setup Script
# Usage: Run as root immediately after first login:
#   bash server-setup.sh [deploy_username]
#   (password for the new user is prompted interactively)
# =============================================================================
set -euo pipefail

DEPLOY_USER="${1:-deploy}"

echo "============================================================"
echo "  Contabo VPS Initial Setup"
echo "============================================================"

# Prompt for password interactively (never pass passwords as CLI args)
read -r -s -p "Enter password for user '$DEPLOY_USER': " DEPLOY_PASS
echo
read -r -s -p "Confirm password: " DEPLOY_PASS_CONFIRM
echo
if [ "$DEPLOY_PASS" != "$DEPLOY_PASS_CONFIRM" ]; then
  echo "ERROR: Passwords do not match."
  exit 1
fi

# --- 1. Update system packages ---
echo "[1/7] Updating system packages..."
apt-get update -y && apt-get upgrade -y
apt-get install -y curl git ufw fail2ban build-essential htop unattended-upgrades

# --- 2. Create deploy user ---
echo "[2/7] Creating deploy user: $DEPLOY_USER"
if id "$DEPLOY_USER" &>/dev/null; then
  echo "  User '$DEPLOY_USER' already exists, skipping creation."
else
  adduser --gecos "" --disabled-password "$DEPLOY_USER"
  if [ -n "$DEPLOY_PASS" ]; then
    echo "$DEPLOY_USER:$DEPLOY_PASS" | chpasswd
  fi
  usermod -aG sudo "$DEPLOY_USER"
  echo "  User '$DEPLOY_USER' created and added to sudo group."
fi

# --- 3. Install Nginx ---
echo "[3/7] Installing Nginx..."
apt-get install -y nginx
systemctl enable nginx
systemctl start nginx
echo "  Nginx installed and started."

# --- 4. Configure UFW firewall ---
echo "[4/7] Configuring UFW firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
echo "  UFW configured. Open ports: SSH (22), HTTP (80), HTTPS (443)."

# --- 5. Enable Fail2Ban ---
echo "[5/7] Enabling Fail2Ban..."
systemctl enable fail2ban
systemctl start fail2ban
echo "  Fail2Ban enabled."

# --- 6. Enable automatic security updates ---
echo "[6/7] Enabling automatic security updates..."
cat > /etc/apt/apt.conf.d/20auto-upgrades <<'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
EOF
echo "  Unattended upgrades configured."

# --- 7. Harden SSH (disable root login & password auth) ---
echo "[7/7] Hardening SSH configuration..."
SSHD_CONFIG="/etc/ssh/sshd_config"

# Back up original config
cp "$SSHD_CONFIG" "${SSHD_CONFIG}.bak.$(date +%Y%m%d%H%M%S)"

# Apply hardening settings
sed -i 's/^#*PermitRootLogin.*/PermitRootLogin no/' "$SSHD_CONFIG"
sed -i 's/^#*PasswordAuthentication.*/PasswordAuthentication no/' "$SSHD_CONFIG"
sed -i 's/^#*PubkeyAuthentication.*/PubkeyAuthentication yes/' "$SSHD_CONFIG"

echo ""
echo "============================================================"
echo "  ⚠  SSH hardening applied."
echo "  IMPORTANT: Before restarting SSH, ensure you have added"
echo "  your public SSH key to /home/$DEPLOY_USER/.ssh/authorized_keys"
echo "  Otherwise you will be locked out!"
echo ""
echo "  To add your key:"
echo "    mkdir -p /home/$DEPLOY_USER/.ssh"
echo "    echo 'YOUR_PUBLIC_KEY' >> /home/$DEPLOY_USER/.ssh/authorized_keys"
echo "    chown -R $DEPLOY_USER:$DEPLOY_USER /home/$DEPLOY_USER/.ssh"
echo "    chmod 700 /home/$DEPLOY_USER/.ssh"
echo "    chmod 600 /home/$DEPLOY_USER/.ssh/authorized_keys"
echo ""
echo "  Then restart SSH:  systemctl restart sshd"
echo "============================================================"
echo ""
echo "  ✅ Initial setup complete!"
echo "  Next step: Run nvm-install.sh as the '$DEPLOY_USER' user."
echo "============================================================"
