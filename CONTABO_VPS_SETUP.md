# Contabo VPS Server Setup — Express & React Deployment

Complete, step-by-step guide for deploying this React admin panel and an Express.js backend
**independently** on a Contabo VPS — with full **Windows (PowerShell)** and **Mac/Linux** instructions.

| Item | Value |
|---|---|
| **Server IP** | `161.97.180.157` |
| **Frontend domain** | `tiger55.online` / `www.tiger55.online` |
| **Backend API domain** | `api.tiger55.online` |
| **OS** | Ubuntu 22.04 LTS |
| **React repo** | `https://github.com/rasel606/pngadminpanel` |

> ⚠️ **Security Notice**: If any server credentials have been publicly exposed, change them
> immediately in the [Contabo Customer Control Panel](https://my.contabo.com) before continuing.

---

## How to Read This Guide

Every command block is labelled with where to run it:

| Label | Meaning |
|---|---|
| 🖥️ **LOCAL** | Run in your own terminal (PowerShell on Windows, or Terminal on Mac/Linux) |
| 🌐 **SERVER** | Run inside an SSH session on the VPS (after `ssh root@161.97.180.157`) |

**You cannot run SERVER commands in your local PowerShell.** Open an SSH session first.

---

## Table of Contents

1. [Prerequisites — Windows Setup](#1-prerequisites--windows-setup)
2. [DNS Configuration](#2-dns-configuration)
3. [Connect to the Server (SSH)](#3-connect-to-the-server-ssh)
4. [Server Hardening & User Creation](#4-server-hardening--user-creation)
5. [Set Up SSH Key Login (Recommended)](#5-set-up-ssh-key-login-recommended)
6. [Install Node.js via NVM](#6-install-nodejs-via-nvm)
7. [Deploy the Express Backend](#7-deploy-the-express-backend)
8. [Deploy the React Frontend](#8-deploy-the-react-frontend)
9. [Configure Nginx](#9-configure-nginx)
10. [Secure with SSL — Let's Encrypt](#10-secure-with-ssl--lets-encrypt)
11. [Enable Automatic Deployment via GitHub Actions](#11-enable-automatic-deployment-via-github-actions)
12. [Verify Everything Is Running](#12-verify-everything-is-running)
13. [Updating After a Code Push](#13-updating-after-a-code-push)
14. [Useful Commands Reference](#14-useful-commands-reference)

---

## 1. Prerequisites — Windows Setup

### 1.1 Check That SSH Works in PowerShell

Open **PowerShell** and run:

```powershell
# 🖥️ LOCAL — PowerShell
ssh -V
```

You should see something like `OpenSSH_for_Windows_8.x`. If not, go to
**Settings → Apps → Optional Features → Add a feature → OpenSSH Client** and install it.

### 1.2 (Optional) Generate an SSH Key Pair

If you don't already have an SSH key:

```powershell
# 🖥️ LOCAL — PowerShell
ssh-keygen -t ed25519 -C "deploy-tiger55"
# Press Enter to accept the default path: C:\Users\YourName\.ssh\id_ed25519
# Set a passphrase or leave blank
```

View your **public key** (you will need this in Step 5):

```powershell
# 🖥️ LOCAL — PowerShell
Get-Content "$env:USERPROFILE\.ssh\id_ed25519.pub"
```

Copy the entire output — it starts with `ssh-ed25519 AAA...`.

---

## 2. DNS Configuration

In your DNS provider's control panel, add these **A records** pointing to `161.97.180.157`:

| Hostname | Type | Value | TTL |
|---|---|---|---|
| `@` (root) | A | `161.97.180.157` | 300 |
| `www` | A | `161.97.180.157` | 300 |
| `api` | A | `161.97.180.157` | 300 |

DNS propagation usually takes 1–15 minutes. You can check from PowerShell:

```powershell
# 🖥️ LOCAL — PowerShell
Resolve-DnsName tiger55.online
Resolve-DnsName api.tiger55.online
# Both should show IPAddress: 161.97.180.157
```

---

## 3. Connect to the Server (SSH)

### ⚠️ Every command in Sections 4–11 must be run INSIDE this SSH session.

```powershell
# 🖥️ LOCAL — PowerShell
# This opens an interactive shell ON THE SERVER. All following commands go here.
ssh root@161.97.180.157
```

Enter the root password when prompted. Your prompt will change to something like
`root@vps:~#` — you are now on the server.

> **Note for Windows users**: `ssh` is a built-in command in PowerShell on Windows 10/11.
> You do NOT need PuTTY. Simply type the command above.

---

## 4. Server Hardening & User Creation

Run all of the following commands **inside the SSH session** (your prompt shows `root@...`).

### 4.1 Update Packages

```bash
# 🌐 SERVER — paste each block into your SSH session
apt-get update -y && apt-get upgrade -y
apt-get install -y curl git ufw fail2ban build-essential htop unattended-upgrades rsync
```

### 4.2 Create the `deploy` User

```bash
# 🌐 SERVER
adduser deploy
# You will be prompted to set a password for the deploy user.
# Fill in the password, then press Enter for the remaining prompts.

# Give the deploy user sudo access
usermod -aG sudo deploy
```

### 4.3 Configure the Firewall

```bash
# 🌐 SERVER
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
ufw status
# Output should show: 22 (OpenSSH), 80, 443 ALLOW
```

### 4.4 Enable Fail2Ban

```bash
# 🌐 SERVER
systemctl enable fail2ban
systemctl start fail2ban
```

### 4.5 Enable Automatic Security Updates

```bash
# 🌐 SERVER
cat > /etc/apt/apt.conf.d/20auto-upgrades <<'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
EOF
```

### 4.6 Install Nginx

```bash
# 🌐 SERVER
apt-get install -y nginx
systemctl enable nginx
systemctl start nginx
systemctl status nginx
# Should show: active (running)
```

---

## 5. Set Up SSH Key Login (Recommended)

Using an SSH key means you will never need a password to log in. **Complete this step
before hardening SSH**, or you may be locked out.

### 5.1 Add Your Public Key to the Server

Still inside your SSH session (as `root`):

```bash
# 🌐 SERVER — replace the key below with your actual public key from Step 1.2
mkdir -p /home/deploy/.ssh
echo 'ssh-ed25519 PASTE_YOUR_FULL_PUBLIC_KEY_HERE deploy-tiger55' \
  >> /home/deploy/.ssh/authorized_keys
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys
```

### 5.2 Test Key Login (open a NEW PowerShell window, keep old one open)

```powershell
# 🖥️ LOCAL — open a NEW PowerShell window and test key login
ssh deploy@161.97.180.157
# Should log in WITHOUT asking for a password
# Type 'exit' to close this test session
```

### 5.3 Harden SSH (only after confirming key login works)

Back in your original SSH session as root:

```bash
# 🌐 SERVER
# Back up the config first
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak

sed -i 's/^#*PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/^#*PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/^#*PubkeyAuthentication.*/PubkeyAuthentication yes/' /etc/ssh/sshd_config

# Apply — do this only after confirming key login works in 5.2!
systemctl restart sshd
```

### 5.4 Log in as the Deploy User

```powershell
# 🖥️ LOCAL — PowerShell
ssh deploy@161.97.180.157
# All remaining commands (Sections 6–12) are run as this user
```

---

## 6. Install Node.js via NVM

From your SSH session as the `deploy` user:

```bash
# 🌐 SERVER (as deploy user)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc

nvm install --lts
nvm use --lts
nvm alias default node

node -v   # e.g. v22.x.x
npm -v    # e.g. 10.x.x
```

### 6.1 Install PM2

```bash
# 🌐 SERVER (as deploy user)
npm install -g pm2

# Configure PM2 to start on server reboot
PM2_STARTUP_CMD="$(pm2 startup 2>&1 | grep '^sudo env' || true)"
if [ -n "$PM2_STARTUP_CMD" ]; then
  eval "$PM2_STARTUP_CMD"
else
  echo "Run 'pm2 startup' and follow the printed instructions."
fi

pm2 save
pm2 -v   # e.g. 5.x.x
```

---

## 7. Deploy the Express Backend

All commands below are run **on the server** as the `deploy` user.

### 7.1 Clone Your Backend Repository

```bash
# 🌐 SERVER (as deploy user)
mkdir -p ~/apps
cd ~/apps
# Replace with your actual backend repo URL:
git clone https://github.com/YOUR_USERNAME/YOUR_BACKEND_REPO.git backend
cd backend
```

### 7.2 Install Production Dependencies

```bash
# 🌐 SERVER (as deploy user)
npm install --production
```

### 7.3 Configure Environment Variables

```bash
# 🌐 SERVER (as deploy user)
cp .env.example .env
nano .env
```

Set your production values:

```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/dbname
JWT_SECRET=your_very_long_random_secret_here
CLIENT_URL=https://tiger55.online
```

Save and exit nano: `Ctrl+O`, `Enter`, `Ctrl+X`.

### 7.4 Start with PM2

```bash
# 🌐 SERVER (as deploy user)
pm2 start src/index.js --name backend --env production
pm2 save

pm2 list
pm2 logs backend --lines 20
curl http://localhost:5000/api/health
# Should return: {"status":"ok"} or similar JSON
```

---

## 8. Deploy the React Frontend

All commands below are run **on the server** as the `deploy` user.

### 8.1 Clone and Build

```bash
# 🌐 SERVER (as deploy user)
cd ~/apps
git clone https://github.com/rasel606/pngadminpanel.git frontend
cd frontend
npm install
npm run build
# Build output is in ~/apps/frontend/build/
```

### 8.2 Copy the Build to the Nginx Web Root

```bash
# 🌐 SERVER (as deploy user)
sudo mkdir -p /var/www/tiger55-frontend
sudo rsync -av --delete ~/apps/frontend/build/ /var/www/tiger55-frontend/
sudo chown -R www-data:www-data /var/www/tiger55-frontend
sudo chmod -R 755 /var/www/tiger55-frontend
```

---

## 9. Configure Nginx

All commands below are run **on the server** as the `deploy` user.

### 9.1 Create the Frontend Nginx Config

```bash
# 🌐 SERVER (as deploy user)
sudo nano /etc/nginx/sites-available/tiger55.online
```

Paste the following exactly:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name tiger55.online www.tiger55.online;

    root /var/www/tiger55-frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|map)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript
               application/javascript application/json application/xml image/svg+xml;
    gzip_min_length 256;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    access_log /var/log/nginx/tiger55_frontend_access.log;
    error_log  /var/log/nginx/tiger55_frontend_error.log;
}
```

Save: `Ctrl+O`, `Enter`, `Ctrl+X`.

### 9.2 Create the API Nginx Config

```bash
# 🌐 SERVER (as deploy user)
sudo nano /etc/nginx/sites-available/api.tiger55.online
```

Paste the following exactly:

```nginx
upstream express_backend {
    server 127.0.0.1:5000;
    keepalive 64;
}

server {
    listen 80;
    listen [::]:80;
    server_name api.tiger55.online;

    client_max_body_size 50M;

    location / {
        proxy_pass         http://express_backend;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade    $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout    60s;
        proxy_read_timeout    60s;
    }

    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    access_log /var/log/nginx/tiger55_api_access.log;
    error_log  /var/log/nginx/tiger55_api_error.log;
}
```

Save: `Ctrl+O`, `Enter`, `Ctrl+X`.

### 9.3 Enable the Sites

```bash
# 🌐 SERVER (as deploy user)
sudo ln -s /etc/nginx/sites-available/tiger55.online     /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/api.tiger55.online /etc/nginx/sites-enabled/

# Remove the default placeholder site
sudo rm -f /etc/nginx/sites-enabled/default

# Test the config
sudo nginx -t
# Should say: syntax is ok / test is successful

sudo systemctl reload nginx
```

### 9.4 Quick Test (HTTP)

```bash
# 🌐 SERVER (as deploy user)
curl -I http://tiger55.online
# Should return: HTTP/1.1 200 OK

curl http://api.tiger55.online/api/health
# Should return JSON health response
```

---

## 10. Secure with SSL — Let's Encrypt

```bash
# 🌐 SERVER (as deploy user)
sudo apt install -y certbot python3-certbot-nginx

# Issue certificate for the frontend
sudo certbot --nginx -d tiger55.online -d www.tiger55.online

# Issue certificate for the API
sudo certbot --nginx -d api.tiger55.online
```

Certbot will:
- Automatically add HTTPS (port 443) to your Nginx configs
- Redirect all HTTP traffic to HTTPS
- Schedule automatic certificate renewal

Verify renewal:

```bash
# 🌐 SERVER (as deploy user)
sudo systemctl status certbot.timer
sudo certbot renew --dry-run
```

### 10.1 Optional: Auto-Renew API SSL + Reapply Nginx via systemd Timer

If your repository is present on the server (for example at `~/apps/frontend` or `/opt/pngadminpanel`),
you can enable a dedicated timer that runs:

- `scripts/ensure-api-ssl-and-apply-nginx.sh`
- `scripts/apply-nginx-api-config.sh`

This keeps API TLS renewal and Nginx API config application in one scheduled flow.

Install and enable the timer:

```bash
# 🌐 SERVER (as deploy user)
cd ~/apps/frontend
REPO_DIR="$PWD" bash scripts/install-api-ssl-renew-timer.sh
```

Set email/domain values used by Certbot:

```bash
# 🌐 SERVER (as deploy user)
sudo nano /etc/default/tiger55-api-ssl-renew
```

Recommended contents:

```dotenv
CERTBOT_EMAIL=admin@tiger55.online
API_DOMAIN=api.tiger55.online
CERTBOT_STAGING=0
DRY_RUN=0
```

Test immediately (do not wait for the schedule):

```bash
# 🌐 SERVER (as deploy user)
sudo systemctl start tiger55-api-ssl-renew.service
sudo journalctl -u tiger55-api-ssl-renew.service -n 100 --no-pager
sudo systemctl list-timers | grep tiger55-api-ssl-renew
```

Notes:
- Default schedule is daily (`03:17`) with randomized delay (`RandomizedDelaySec=30m`).
- If `certbot`/`apt` returns code `100`, verify you are running on the VPS (not local machine/CI container),
  then run `sudo apt-get update` and retry.

---

## 11. Enable Automatic Deployment via GitHub Actions

Once this step is complete, **every push to the `main` branch automatically builds
and deploys the frontend** — no manual steps needed.

The workflow lives in `.github/workflows/deploy.yml` and requires three GitHub Secrets.

### 11.1 Allow the Deploy User to Run Nginx Commands Without a Password

The GitHub Actions runner needs to reload Nginx over SSH. Grant passwordless `sudo`
for just those commands (run this **on the server** as root):

```bash
# 🌐 SERVER (as root)
cat > /etc/sudoers.d/deploy-nginx <<'EOF'
deploy ALL=(ALL) NOPASSWD: /usr/bin/chown -R www-data:www-data /var/www/tiger55-frontend, \
                           /usr/bin/chmod -R 755 /var/www/tiger55-frontend, \
                           /usr/sbin/nginx -t, \
                           /usr/bin/systemctl reload nginx
EOF
chmod 440 /etc/sudoers.d/deploy-nginx
# Verify the file is valid
visudo -c -f /etc/sudoers.d/deploy-nginx && echo "sudoers file OK"
```

### 11.2 Add GitHub Secrets

In your GitHub repository go to **Settings → Secrets and variables → Actions → New repository secret**
and add all three secrets:

| Secret name | Value |
|---|---|
| `DEPLOY_HOST` | `161.97.180.157` |
| `DEPLOY_USER` | `deploy` |
| `DEPLOY_SSH_KEY` | The **private** key (not `.pub`) — see below |

**Get your private key:**

```powershell
# 🖥️ LOCAL — PowerShell (copy the entire output including the BEGIN/END lines)
Get-Content "$env:USERPROFILE\.ssh\id_ed25519"
```

```bash
# 🖥️ LOCAL — Mac/Linux
cat ~/.ssh/id_ed25519
```

Paste the entire output (including `-----BEGIN OPENSSH PRIVATE KEY-----` and the
closing line) into the `DEPLOY_SSH_KEY` secret.

### 11.3 Trigger Your First Auto-Deploy

```powershell
# 🖥️ LOCAL — PowerShell: make any small change and push
git add .
git commit -m "chore: trigger first auto-deploy"
git push origin main
```

Then go to **GitHub → Actions → Deploy Frontend to VPS** to watch the run live.

After a green checkmark, your site is live at `https://tiger55.online`.

> You can also trigger it manually any time: **GitHub → Actions → Deploy Frontend to VPS → Run workflow → Run workflow**.

---

## 12. Verify Everything Is Running

```bash
# 🌐 SERVER (as deploy user)

# Processes
pm2 list
pm2 logs backend --lines 30

# Nginx
sudo nginx -t
sudo systemctl status nginx

# Firewall
sudo ufw status

# End-to-end HTTPS test
curl -I https://tiger55.online
curl https://api.tiger55.online/api/health
```

---

## 13. Updating After a Code Push

### Backend update (run on the server):

```bash
# 🌐 SERVER (as deploy user)
cd ~/apps/backend
git pull origin main
npm install --production
pm2 restart backend --update-env
pm2 logs backend --lines 20
```

### Frontend update (run on the server):

```bash
# 🌐 SERVER (as deploy user)
cd ~/apps/frontend
git pull origin main
npm install
npm run build
sudo rsync -av --delete ~/apps/frontend/build/ /var/www/tiger55-frontend/
sudo chown -R www-data:www-data /var/www/tiger55-frontend
```

Or use the deploy script (from the repo root on the server):

```bash
# 🌐 SERVER (as deploy user)
bash ~/apps/frontend/scripts/deploy-frontend.sh
```

---

## 14. Useful Commands Reference

### PM2

```bash
pm2 list                 # Show all running processes
pm2 logs backend         # Stream backend logs (Ctrl+C to exit)
pm2 restart backend      # Restart the backend process
pm2 stop backend         # Stop the backend
pm2 monit                # Real-time CPU/memory dashboard
```

### Nginx

```bash
sudo nginx -t                                         # Test config syntax
sudo systemctl reload nginx                           # Reload without downtime
sudo tail -f /var/log/nginx/tiger55_api_error.log     # Stream API error logs
sudo tail -f /var/log/nginx/tiger55_frontend_error.log
```

### System

```bash
df -h                    # Disk usage
free -h                  # Memory usage
htop                     # Interactive process viewer (q to exit)
sudo ufw status          # Firewall rules
fail2ban-client status   # Fail2Ban status
```

---

## Architecture

```
Internet (HTTPS)
       │
       ▼
  Nginx on 161.97.180.157  (80 → redirect to HTTPS, 443 → TLS)
       │
       ├── tiger55.online      ──► /var/www/tiger55-frontend  (React SPA)
       │   www.tiger55.online
       │
       └── api.tiger55.online  ──► localhost:5000  (Express via PM2)
```

---

## Security Checklist

- [ ] Root SSH login disabled (`PermitRootLogin no`)
- [ ] SSH password authentication disabled (key-only login)
- [ ] UFW firewall enabled — only ports 22, 80, 443 open
- [ ] Fail2Ban installed and running
- [ ] SSL certificates issued for both domains
- [ ] Auto-renewal verified with `certbot renew --dry-run`
- [ ] `.env` files not committed to version control
- [ ] All production secrets are unique and not shared publicly
- [ ] Server root password changed after any exposure

---

## Common Errors & Fixes

| Error | Cause | Fix |
|---|---|---|
| `scp: stat local "scripts/...": No such file or directory` | Running `scp` from the wrong directory on your PC | You don't need `scp` at all — run all setup commands directly inside your SSH session on the server |
| `bash: command not found` (in PowerShell) | Running a Linux command in your local PowerShell | SSH into the server first: `ssh root@161.97.180.157`, then run the command |
| `systemctl: not recognized` | Running a Linux command in local PowerShell | Same as above — run inside SSH |
| `deploy@...: Permission denied` | deploy user doesn't exist yet or wrong password | Complete Section 4.2 first (as root inside SSH), then try again |
| `nginx -t` fails after editing config | Syntax error in nginx config | Check the error message, fix the config, run `nginx -t` again before reloading |
| `certbot: domain not resolving` | DNS not propagated yet | Wait a few minutes and run `Resolve-DnsName tiger55.online` locally to check |
