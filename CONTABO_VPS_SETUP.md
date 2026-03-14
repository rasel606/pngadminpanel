# Contabo VPS Server Setup — Express & React Deployment

Complete, step-by-step guide for deploying this React admin panel and an Express.js backend **independently** on a Contabo VPS.

| Item | Value |
|---|---|
| **Server IP** | `161.97.180.157` |
| **Frontend domain** | `tiger55.online` / `www.tiger55.online` |
| **Backend API domain** | `api.tiger55.online` |
| **OS** | Ubuntu 22.04 LTS |
| **React repo** | `https://github.com/rasel606/pngadminpanel` |

> ⚠️ **Security Notice**: If any server credentials have been publicly exposed, change them immediately in the [Contabo Customer Control Panel](https://my.contabo.com) before proceeding.

---

## Table of Contents

1. [DNS Configuration](#1-dns-configuration)
2. [Initial Server Access & Hardening](#2-initial-server-access--hardening)
3. [Install Node.js via NVM](#3-install-nodejs-via-nvm)
4. [Install Nginx](#4-install-nginx)
5. [Install PM2](#5-install-pm2)
6. [Deploy the Express Backend](#6-deploy-the-express-backend)
7. [Deploy the React Frontend](#7-deploy-the-react-frontend)
8. [Configure Nginx](#8-configure-nginx)
9. [Secure with SSL — Let's Encrypt](#9-secure-with-ssl--lets-encrypt)
10. [Verify Everything Is Running](#10-verify-everything-is-running)
11. [Useful Commands Reference](#11-useful-commands-reference)

---

## 1. DNS Configuration

In your DNS provider's control panel, add the following **A records** all pointing to `161.97.180.157`:

| Hostname | Type | Value | TTL |
|---|---|---|---|
| `@` (root) | A | `161.97.180.157` | 300 |
| `www` | A | `161.97.180.157` | 300 |
| `api` | A | `161.97.180.157` | 300 |

Wait for DNS propagation (usually 1–15 minutes). Verify with:

```bash
dig tiger55.online +short
dig api.tiger55.online +short
# Both should return: 161.97.180.157
```

---

## 2. Initial Server Access & Hardening

### 2.1 Connect as Root

```bash
ssh root@161.97.180.157
```

### 2.2 Run the Automated Setup Script

The `scripts/server-setup.sh` script in this repo handles all hardening steps. Copy it to the server and run it:

```bash
# On your local machine — copy the script
scp scripts/server-setup.sh root@161.97.180.157:/root/

# On the server
bash /root/server-setup.sh deploy
```

The script will:
- Update all packages
- Create the `deploy` user (prompts securely for password)
- Install Nginx, UFW firewall, Fail2Ban, build tools
- Open only ports 22, 80, 443
- Enable automatic security updates
- Harden SSH (disable root login + password auth)

### 2.3 Add Your SSH Public Key Before Restarting SSH

```bash
mkdir -p /home/deploy/.ssh
# Paste your public key (from: cat ~/.ssh/id_ed25519.pub on your local machine)
echo 'YOUR_PUBLIC_KEY_HERE' >> /home/deploy/.ssh/authorized_keys
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys

# Now it is safe to restart SSH
systemctl restart sshd
```

### 2.4 Log in as the Deploy User

```bash
ssh deploy@161.97.180.157
```

---

## 3. Install Node.js via NVM

As the `deploy` user, run the NVM install script:

```bash
# Copy script to server first (or paste contents manually)
bash ~/nvm-install.sh
source ~/.bashrc

node -v   # e.g. v22.x.x
npm -v    # e.g. 10.x.x
pm2 -v    # e.g. 5.x.x
```

The script installs NVM, Node.js LTS, and PM2, then configures PM2 to start on boot.

---

## 4. Install Nginx

Nginx is installed by `server-setup.sh`. Verify it is running:

```bash
sudo systemctl status nginx
curl -I http://161.97.180.157
# Should return: HTTP/1.1 200 OK
```

---

## 5. Install PM2

PM2 is installed by `nvm-install.sh`. Verify:

```bash
pm2 list
pm2 -v
```

---

## 6. Deploy the Express Backend

### 6.1 Clone Your Backend Repository

```bash
mkdir -p ~/apps
cd ~/apps
git clone https://github.com/YOUR_USERNAME/YOUR_BACKEND_REPO.git backend
cd backend
```

### 6.2 Install Production Dependencies

```bash
npm install --production
```

### 6.3 Configure Environment Variables

```bash
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

### 6.4 Copy the PM2 Config and Start

```bash
# Copy ecosystem.config.js from this repo to the backend folder
cp ~/apps/frontend/ecosystem.config.js ~/apps/backend/

pm2 start ecosystem.config.js --only backend --env production
pm2 save
```

### 6.5 Verify

```bash
pm2 list
pm2 logs backend --lines 20
curl http://localhost:5000/api/health
# Should return: {"status":"ok"} or similar
```

---

## 7. Deploy the React Frontend

### 7.1 Run the Automated Deploy Script

```bash
FRONTEND_REPO_URL=https://github.com/rasel606/pngadminpanel.git \
  bash ~/apps/frontend/../scripts/deploy-frontend.sh main
```

Or step by step:

```bash
cd ~/apps
git clone https://github.com/rasel606/pngadminpanel.git frontend
cd frontend
npm install
npm run build
```

### 7.2 Copy the Build to the Nginx Web Root

```bash
sudo mkdir -p /var/www/tiger55-frontend
sudo rsync -av --delete ~/apps/frontend/dist/ /var/www/tiger55-frontend/
sudo chown -R www-data:www-data /var/www/tiger55-frontend
sudo chmod -R 755 /var/www/tiger55-frontend
```

---

## 8. Configure Nginx

### 8.1 Install the Nginx Config Files

```bash
# Frontend (tiger55.online)
sudo cp /home/deploy/apps/frontend/nginx/frontend.conf \
        /etc/nginx/sites-available/tiger55.online

# Backend API (api.tiger55.online)
sudo cp /home/deploy/apps/frontend/nginx/api.conf \
        /etc/nginx/sites-available/api.tiger55.online
```

### 8.2 Enable the Sites

```bash
sudo ln -s /etc/nginx/sites-available/tiger55.online \
           /etc/nginx/sites-enabled/

sudo ln -s /etc/nginx/sites-available/api.tiger55.online \
           /etc/nginx/sites-enabled/

# Disable the default placeholder site
sudo rm -f /etc/nginx/sites-enabled/default

sudo nginx -t
sudo systemctl reload nginx
```

### 8.3 Quick Test (HTTP)

```bash
curl -I http://tiger55.online        # Should return 200 OK
curl http://api.tiger55.online/api/health  # Should return API health JSON
```

---

## 9. Secure with SSL — Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx

# Issue certificate for the frontend
sudo certbot --nginx -d tiger55.online -d www.tiger55.online

# Issue certificate for the API
sudo certbot --nginx -d api.tiger55.online
```

Certbot automatically:
- Edits your Nginx configs to add HTTPS (port 443)
- Redirects all HTTP traffic to HTTPS
- Schedules auto-renewal via a systemd timer

Verify auto-renewal:

```bash
sudo systemctl status certbot.timer
sudo certbot renew --dry-run
```

---

## 10. Verify Everything Is Running

```bash
# Process manager
pm2 list
pm2 logs backend --lines 30

# Nginx
sudo nginx -t
sudo systemctl status nginx

# Firewall
sudo ufw status

# HTTPS endpoints
curl -I https://tiger55.online
curl https://api.tiger55.online/api/health

# SSL certificate info
echo | openssl s_client -connect tiger55.online:443 2>/dev/null | openssl x509 -noout -dates
echo | openssl s_client -connect api.tiger55.online:443 2>/dev/null | openssl x509 -noout -dates
```

---

## 11. Useful Commands Reference

### Deployment Updates

**Backend (after a code push):**

```bash
cd ~/apps/backend
git pull origin main
npm install --production
pm2 restart backend --update-env
```

**Frontend (after a code push):**

```bash
cd ~/apps/frontend
git pull origin main
npm install
npm run build
sudo rsync -av --delete ~/apps/frontend/dist/ /var/www/tiger55-frontend/
sudo chown -R www-data:www-data /var/www/tiger55-frontend
```

Or just run the script:

```bash
bash ~/apps/frontend/scripts/deploy-frontend.sh
```

### PM2

```bash
pm2 list                    # List all processes
pm2 logs backend            # Stream backend logs
pm2 restart backend         # Restart backend
pm2 stop backend            # Stop backend
pm2 monit                   # Real-time monitoring dashboard
```

### Nginx

```bash
sudo nginx -t               # Test config syntax
sudo systemctl reload nginx # Apply config without downtime
sudo tail -f /var/log/nginx/tiger55_api_error.log
sudo tail -f /var/log/nginx/tiger55_frontend_error.log
```

### System

```bash
df -h                       # Disk usage
free -h                     # Memory usage
htop                        # Interactive process viewer
sudo ufw status             # Firewall rules
fail2ban-client status      # Fail2ban status
```

---

## Architecture

```
Internet (HTTPS)
       │
       ▼
  Nginx  161.97.180.157  (ports 80 → redirect, 443 → TLS termination)
       │
       ├─── tiger55.online  ──────────►  /var/www/tiger55-frontend  (React SPA)
       │     www.tiger55.online
       │
       └─── api.tiger55.online  ──────►  localhost:5000  (Express via PM2)
```

---

## Security Checklist

- [ ] Root SSH login disabled (`PermitRootLogin no`)
- [ ] SSH password authentication disabled (key-only)
- [ ] UFW firewall enabled — only ports 22, 80, 443 open
- [ ] Fail2Ban installed and running
- [ ] SSL certificates issued and auto-renewal confirmed
- [ ] `.env` files not committed to version control (check `.gitignore`)
- [ ] All production secrets are unique and not shared publicly
- [ ] Server root password changed after any exposure
