# PRMS Docker Deployment Guide
## Madaling Paraan ng Pag-deploy Gamit ang Docker

Mas simple at madali ang Docker compared sa manual VPS setup. One-command lang para magrun ang lahat!

---

## 🎯 Ano ang Kailangan Mo?

### Local Development (sa laptop/PC mo)
- [ ] Docker Desktop installed
- [ ] Git installed
- [ ] Text editor (VS Code recommended)

### Production Deployment (sa server)
- [ ] VPS server (Hostinger, DigitalOcean, AWS, etc.)
- [ ] Docker at Docker Compose installed sa server
- [ ] Domain name (optional)
- [ ] SSH access sa server

---

## 📋 Table of Contents

1. [Local Development Setup](#1-local-development-setup)
2. [Production VPS Deployment](#2-production-vps-deployment)
3. [Environment Configuration](#3-environment-configuration)
4. [Docker Commands Cheat Sheet](#4-docker-commands-cheat-sheet)
5. [Troubleshooting](#5-troubleshooting)
6. [Updates and Maintenance](#6-updates-and-maintenance)

---

## 1. Local Development Setup

### Step 1.1: Install Docker Desktop

**📍 WHERE:** Sa laptop/PC mo

**⬇️ DOWNLOAD:**
- **Windows/Mac:** https://www.docker.com/products/docker-desktop/
- **Linux:** https://docs.docker.com/engine/install/

**✅ VERIFY INSTALLATION:**
```powershell
docker --version
docker-compose --version
```

**📝 EXPECTED OUTPUT:**
```
Docker version 24.x.x
Docker Compose version v2.x.x
```

---

### Step 1.2: Clone Repository

**⌨️ OPEN POWERSHELL:**
```powershell
cd C:\laragon\www
git clone https://github.com/your-username/prms.git
cd prms
```

---

### Step 1.3: Setup Environment File

**⌨️ COPY EXAMPLE FILE:**
```powershell
Copy-Item env.docker.example .env
```

**✏️ EDIT .env FILE:**
```env
DB_ROOT_PASSWORD=prms_root_2024
DB_NAME=prms_db
DB_USER=prms_user
DB_PASSWORD=prms_pass_2024

VITE_API_BASE_URL=http://localhost/prms-backend
VITE_STAFF_API_BASE_URL=http://localhost/prms-backend/api/staff
```

**💡 TIP:** For local development, default values are okay!

---

### Step 1.4: Build Frontend .env

**⌨️ CREATE FRONTEND ENV:**
```powershell
cd prms-frontend
echo "VITE_API_BASE_URL=http://localhost/prms-backend" > .env
echo "VITE_STAFF_API_BASE_URL=http://localhost/prms-backend/api/staff" >> .env
cd ..
```

---

### Step 1.5: Create Backend Config

**⌨️ COPY CONFIG:**
```powershell
cd prms-backend
Copy-Item config.docker.php config.php
cd ..
```

**📝 NOTE:** Ang `config.docker.php` ay automatic na kumukuha ng credentials from environment variables!

---

### Step 1.6: Start Docker Containers

**⌨️ RUN DOCKER COMPOSE:**
```powershell
docker-compose up -d
```

**📝 WHAT HAPPENS:**
- ⏳ Downloads required Docker images (first time only - 5-10 minutes)
- 🏗️ Builds frontend and backend containers
- 🗄️ Creates MySQL database
- 📦 Imports database schema
- 🚀 Starts all services

**✅ VERIFY ALL CONTAINERS ARE RUNNING:**
```powershell
docker-compose ps
```

**📝 EXPECTED OUTPUT:**
```
NAME                COMMAND                  SERVICE       STATUS
prms-backend        "docker-php-entrypoi…"   backend       Up
prms-db             "docker-entrypoint.s…"   db            Up (healthy)
prms-forecasting    "sh -c 'while true; …"   forecasting   Up
prms-frontend       "/docker-entrypoint.…"   frontend      Up
prms-webserver      "/docker-entrypoint.…"   webserver     Up
```

---

### Step 1.7: Access Your Application

**🌐 OPEN BROWSER:**
```
http://localhost
```

**✅ SUCCESS:** You should see the PRMS login page!

**🔐 DEFAULT LOGIN:**
- Check your database for admin credentials
- Or create one using the application

---

### Step 1.8: View Logs (if needed)

**⌨️ VIEW ALL LOGS:**
```powershell
docker-compose logs -f
```

**⌨️ VIEW SPECIFIC SERVICE:**
```powershell
docker-compose logs -f backend
docker-compose logs -f db
docker-compose logs -f webserver
```

**📝 TIP:** Press `Ctrl+C` to stop viewing logs

---

## 2. Production VPS Deployment

### 🎯 Prerequisites Checklist

Before starting, make sure you have:
- [ ] VPS with Ubuntu/Debian (recommended: 2GB RAM, 2 CPU cores)
- [ ] Root SSH access to your VPS
- [ ] VPS IP address or domain name
- [ ] Local Docker build successful (tested locally)

---

### Step 2.1: Connect to Your VPS

**⌨️ SSH TO SERVER:**
```bash
ssh root@YOUR_VPS_IP
```

**📝 EXAMPLE:**
```bash
ssh root@203.0.113.45
# Or if using domain:
ssh root@yourdomain.com
```

**✅ VERIFY CONNECTION:**
```bash
pwd  # Should show /root
whoami  # Should show root
```

---

### Step 2.2: Install Docker on VPS

**⌨️ UPDATE SYSTEM:**
```bash
apt update && apt upgrade -y
```

**⌨️ INSTALL DOCKER:**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh
```

**⌨️ INSTALL DOCKER COMPOSE:**
```bash
apt install -y docker-compose-plugin
```

**✅ VERIFY INSTALLATION:**
```bash
docker --version
docker compose version
```

**Expected output:**
```
Docker version 24.x.x or higher
Docker Compose version v2.x.x
```

**⌨️ START DOCKER ON BOOT:**
```bash
systemctl enable docker
systemctl start docker
systemctl status docker  # Should show "active (running)"
```

---

### Step 2.3: Upload Your Project to VPS

**OPTION A: Using Git (Recommended)**

```bash
# Install Git
apt install -y git

# Navigate to /opt directory
cd /opt

# Clone your repository
git clone https://github.com/your-username/prms.git

# Enter project directory
cd prms

# Verify files
ls -la
```

**OPTION B: Using SCP/SFTP**

On your **LOCAL machine** (PowerShell):
```powershell
# Compress your project
cd C:\laragon\www
Compress-Archive -Path prms -DestinationPath prms.zip

# Upload to VPS
scp prms.zip root@YOUR_VPS_IP:/opt/

# On VPS, extract
ssh root@YOUR_VPS_IP
cd /opt
apt install -y unzip
unzip prms.zip
cd prms
```

**💡 TIP:** Project can be in `/opt/prms`, `/var/www/prms`, or any directory you prefer.

---

### Step 2.4: Configure Environment Files

**📍 You're now in:** `/opt/prms` (or your chosen directory)

**A. Create Root .env File**

```bash
# Check if .env exists
cat .env

# If doesn't exist or need to create fresh:
cat > .env << 'EOF'
# Database Configuration (CHANGE THESE!)
DB_ROOT_PASSWORD=YOUR_STRONG_ROOT_PASSWORD_HERE
DB_NAME=prms_db
DB_USER=prms_user
DB_PASSWORD=YOUR_STRONG_USER_PASSWORD_HERE
EOF

# Verify
cat .env
```

**⚠️ SECURITY:** Generate strong passwords:
```bash
# Generate random password
openssl rand -base64 32
```

**B. Create Frontend .env File**

```bash
# Using your VPS IP
cat > prms-frontend/.env << 'EOF'
VITE_API_BASE_URL=/prms-backend
VITE_STAFF_API_BASE_URL=/prms-backend/api/staff
EOF

# Verify
cat prms-frontend/.env
```

**💡 NOTE:** We use relative paths (`/prms-backend`) instead of full URLs for better portability.

---

### Step 2.5: Configure Backend

**⌨️ COPY DOCKER CONFIG:**
```bash
cd /opt/prms
cp prms-backend/config.docker.php prms-backend/config.php

# Verify
head -n 15 prms-backend/config.php
```

This config automatically reads from environment variables - no manual editing needed!

---

### Step 2.6: Update CORS for Production 🔴 CRITICAL

```bash
# Edit CORS configuration
nano prms-backend/cors.php
```

**Find line ~21 and update `$productionOrigins`:**

```php
$productionOrigins = [
    // Add your VPS IP or domain
    'http://YOUR_VPS_IP',           // Replace with actual IP (e.g., http://203.45.67.89)
    'http://localhost',             // Keep for Docker internal network
    
    // If you have a domain, add it too:
    // 'http://yourdomain.com',
    // 'https://yourdomain.com',    // When SSL is setup
];
```

**Example (VPS IP: 203.45.67.89):**
```php
$productionOrigins = [
    'http://203.45.67.89',
    'http://localhost',
];
```

**⌨️ SAVE:** Press `Ctrl+O`, Enter, then `Ctrl+X`

---

### Step 2.7: Configure Firewall (Security First!)

```bash
# Install UFW if not installed
apt install -y ufw

# Default policies
ufw default deny incoming
ufw default allow outgoing

# Allow SSH (DON'T skip this or you'll lock yourself out!)
ufw allow 22/tcp

# Allow HTTP/HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Enable firewall
ufw --force enable

# Verify rules
ufw status verbose
```

**Expected output:**
```
Status: active
To                         Action      From
--                         ------      ----
22/tcp                     ALLOW       Anywhere
80/tcp                     ALLOW       Anywhere
443/tcp                    ALLOW       Anywhere
```

---

### Step 2.8: Build and Start Docker Containers

**⌨️ NAVIGATE TO PROJECT:**
```bash
cd /opt/prms
pwd  # Should show: /opt/prms
```

**⌨️ BUILD ALL IMAGES:**
```bash
docker compose build --no-cache
```

**⏳ WAIT:** This takes 5-10 minutes. You'll see:
- ✓ Building backend (Python + PHP dependencies)
- ✓ Building frontend (React build)
- ✓ Building forecasting (Python ML libraries)

**⌨️ START ALL CONTAINERS:**
```bash
docker compose up -d
```

**Expected output:**
```
✓ Container prms-db           Started
✓ Container prms-forecasting  Started
✓ Container prms-backend      Started
✓ Container prms-frontend     Started
✓ Container prms-webserver    Started
```

---

### Step 2.9: Verify Deployment

**A. Check Container Status**

```bash
docker compose ps
```

**All containers should show "Up" or "Up (healthy)":**
```
NAME                STATUS              PORTS
prms-db             Up (healthy)        
prms-backend        Up                  
prms-frontend       Up                  
prms-forecasting    Up                  
prms-webserver      Up                  0.0.0.0:80->80/tcp
```

**B. Check Logs (if any issues)**

```bash
# View all logs
docker compose logs

# View specific service
docker compose logs backend
docker compose logs db
docker compose logs webserver

# Follow logs in real-time
docker compose logs -f
```

---

### Step 2.10: Test Your Deployment 🎉

**🌐 OPEN BROWSER:**
```
http://YOUR_VPS_IP
```

**Examples:**
```
http://203.45.67.89
http://yourdomain.com
```

**✅ SUCCESS INDICATORS:**
- ✓ PRMS login page appears
- ✓ No CORS errors in browser console (F12)
- ✓ Page loads completely with styling
- ✓ Login form is visible

**🔐 DEFAULT LOGIN:**
Check your database for admin credentials or create a new user.

---

### Step 2.11: Post-Deployment Security 🔒

**A. Remove MySQL Port Exposure (IMPORTANT!)**

```bash
nano /opt/prms/docker-compose.yml
```

Find the `db:` service and comment out ports:
```yaml
db:
  # ports:
  #   - "3306:3306"  # ❌ Remove in production
```

**Restart containers:**
```bash
docker compose down
docker compose up -d
```

**B. Verify Database is Not Accessible Externally**

From your **local machine**:
```bash
# This should FAIL (connection refused)
mysql -h YOUR_VPS_IP -u prms_user -p
```

If it connects, port 3306 is still exposed - go back and fix it!

---

### Step 2.12: Setup Automated Backups

```bash
# Create backup directory
mkdir -p /root/prms-backups

# Create backup script
nano /root/backup-prms.sh
```

**Paste this script:**
```bash
#!/bin/bash
BACKUP_DIR="/root/prms-backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup database
docker compose -f /opt/prms/docker-compose.yml exec -T db \
  mysqldump -u prms_user -pYOUR_DB_PASSWORD prms_db > $BACKUP_DIR/prms_db_$DATE.sql

# Compress
gzip $BACKUP_DIR/prms_db_$DATE.sql

# Delete backups older than 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

**Make executable:**
```bash
chmod +x /root/backup-prms.sh
```

**Test it:**
```bash
/root/backup-prms.sh
ls -lh /root/prms-backups/
```

**Schedule daily backups:**
```bash
crontab -e
```

Add this line:
```cron
0 2 * * * /root/backup-prms.sh >> /root/prms-backups/backup.log 2>&1
```

---

### 🎯 Quick VPS Commands Reference

All commands assume you're in `/opt/prms`:

```bash
# Navigate to project
cd /opt/prms

# Start containers
docker compose up -d

# Stop containers
docker compose down

# Restart containers
docker compose restart

# View status
docker compose ps

# View logs
docker compose logs -f

# Rebuild after code changes
docker compose up -d --build

# Backup database
docker compose exec db mysqldump -u prms_user -p prms_db > backup.sql
```

---

## 3. Environment Configuration

### 3.1: Database Environment Variables

```env
DB_ROOT_PASSWORD=prms_root_2024      # MySQL root password
DB_NAME=prms_db                       # Database name
DB_USER=prms_user                     # Database user
DB_PASSWORD=prms_pass_2024            # Database password
```

---

### 3.2: Frontend Environment Variables

```env
# Local Development
VITE_API_BASE_URL=http://localhost/prms-backend
VITE_STAFF_API_BASE_URL=http://localhost/prms-backend/api/staff

# Production with Domain (HTTP)
VITE_API_BASE_URL=http://yourdomain.com/prms-backend
VITE_STAFF_API_BASE_URL=http://yourdomain.com/prms-backend/api/staff

# Production with SSL (HTTPS)
VITE_API_BASE_URL=https://yourdomain.com/prms-backend
VITE_STAFF_API_BASE_URL=https://yourdomain.com/prms-backend/api/staff

# Production with VPS IP
VITE_API_BASE_URL=http://203.0.113.45/prms-backend
VITE_STAFF_API_BASE_URL=http://203.0.113.45/prms-backend/api/staff
```

---

## 4. Docker Commands Cheat Sheet

### Starting and Stopping

**⌨️ START ALL CONTAINERS:**
```bash
docker-compose up -d
```

**⌨️ STOP ALL CONTAINERS:**
```bash
docker-compose down
```

**⌨️ RESTART ALL CONTAINERS:**
```bash
docker-compose restart
```

**⌨️ RESTART SPECIFIC SERVICE:**
```bash
docker-compose restart backend
docker-compose restart webserver
docker-compose restart db
```

---

### Viewing Logs

**⌨️ ALL LOGS (FOLLOW MODE):**
```bash
docker-compose logs -f
```

**⌨️ SPECIFIC SERVICE LOGS:**
```bash
docker-compose logs -f backend
docker-compose logs -f db
docker-compose logs -f webserver
docker-compose logs -f forecasting
```

**⌨️ LAST 100 LINES:**
```bash
docker-compose logs --tail=100 backend
```

---

### Managing Containers

**⌨️ LIST RUNNING CONTAINERS:**
```bash
docker-compose ps
```

**⌨️ LIST ALL CONTAINERS:**
```bash
docker ps -a
```

**⌨️ EXEC INTO CONTAINER:**
```bash
docker-compose exec backend bash
docker-compose exec db mysql -u prms_user -p
docker-compose exec webserver sh
```

**⌨️ EXIT CONTAINER:**
```bash
exit
```

---

### Rebuilding

**⌨️ REBUILD ALL CONTAINERS:**
```bash
docker-compose up -d --build
```

**⌨️ REBUILD SPECIFIC SERVICE:**
```bash
docker-compose up -d --build backend
docker-compose up -d --build frontend
```

**⌨️ REBUILD FROM SCRATCH (DELETE EVERYTHING):**
```bash
docker-compose down -v
docker-compose up -d --build
```

**⚠️ WARNING:** `-v` flag deletes all data including database!

---

### Database Management

**⌨️ BACKUP DATABASE:**
```bash
docker-compose exec db mysqldump -u prms_user -p prms_db > backup_$(date +%Y%m%d).sql
```

**⌨️ RESTORE DATABASE:**
```bash
docker-compose exec -T db mysql -u prms_user -p prms_db < backup.sql
```

**⌨️ ACCESS MYSQL CLI:**
```bash
docker-compose exec db mysql -u prms_user -p prms_db
```

---

### Cleaning Up

**⌨️ REMOVE STOPPED CONTAINERS:**
```bash
docker container prune
```

**⌨️ REMOVE UNUSED IMAGES:**
```bash
docker image prune -a
```

**⌨️ REMOVE UNUSED VOLUMES:**
```bash
docker volume prune
```

**⌨️ CLEAN EVERYTHING:**
```bash
docker system prune -a --volumes
```

**⚠️ WARNING:** This deletes ALL unused Docker data!

---

## 5. Troubleshooting

### Problem 1: "Cannot connect to Docker daemon"

**📍 SOLUTION:**
```bash
# On Windows - Make sure Docker Desktop is running
# On Linux
systemctl start docker
systemctl enable docker
```

---

### Problem 2: "Port already in use"

**📍 CAUSE:** Another service is using port 80 or 3306

**⌨️ CHECK WHAT'S USING PORT 80:**
```bash
# Windows
netstat -ano | findstr :80

# Linux
netstat -tlnp | grep :80
```

**📍 SOLUTIONS:**
1. Stop the conflicting service
2. Or change ports in `docker-compose.yml`:
```yaml
webserver:
  ports:
    - "8080:80"  # Use port 8080 instead
```

---

### Problem 3: "Database connection error"

**⌨️ CHECK DB CONTAINER:**
```bash
docker-compose logs db
```

**⌨️ VERIFY DB IS HEALTHY:**
```bash
docker-compose ps
```

**📍 IF NOT HEALTHY:**
```bash
docker-compose restart db
```

**⌨️ CHECK DB CONNECTION:**
```bash
docker-compose exec db mysql -u prms_user -p
```

---

### Problem 4: "Frontend shows white screen"

**⌨️ CHECK FRONTEND LOGS:**
```bash
docker-compose logs frontend
docker-compose logs webserver
```

**📍 REBUILD FRONTEND:**
```bash
docker-compose up -d --build frontend
docker-compose restart webserver
```

**⌨️ CHECK BROWSER CONSOLE:**
- Press F12 in browser
- Check for errors

---

### Problem 5: "CORS Error"

**📍 SOLUTION:** Update `prms-backend/cors.php`

**⌨️ EDIT FILE:**
```bash
nano prms-backend/cors.php
```

**✏️ UPDATE ALLOWED ORIGINS:**
```php
$productionOrigins = [
    'http://your-domain.com',
    'https://your-domain.com',
    // or your VPS IP
    'http://203.0.113.45',
];
```

**⌨️ RESTART BACKEND:**
```bash
docker-compose restart backend webserver
```

---

### Problem 6: "Permission denied" errors

**⌨️ FIX PERMISSIONS:**
```bash
docker-compose exec backend chown -R www-data:www-data /var/www/html
docker-compose exec backend chmod -R 775 /var/www/html/uploads
docker-compose exec backend chmod -R 775 /var/www/html/logs
```

---

### Problem 7: Container keeps restarting

**⌨️ CHECK LOGS:**
```bash
docker-compose logs --tail=50 container-name
```

**⌨️ CHECK CONTAINER STATUS:**
```bash
docker-compose ps
```

**📍 COMMON CAUSES:**
- Wrong environment variables
- Missing .env file
- Database not ready
- Port conflicts

---

## 6. Updates and Maintenance

### 6.1: Update Code from Git

**⌨️ PULL LATEST CODE:**
```bash
cd /opt/prms
git pull origin main
```

**⌨️ REBUILD CONTAINERS:**
```bash
docker-compose up -d --build
```

---

### 6.2: Update Frontend Only

**⌨️ IF YOU CHANGED REACT CODE:**
```bash
docker-compose up -d --build frontend
docker-compose restart webserver
```

---

### 6.3: Update Backend Only

**⌨️ IF YOU CHANGED PHP CODE:**
```bash
docker-compose restart backend
# or rebuild if you changed Dockerfile
docker-compose up -d --build backend
```

---

### 6.4: Update Database Schema

**⌨️ BACKUP FIRST:**
```bash
docker-compose exec db mysqldump -u prms_user -p prms_db > backup_before_update.sql
```

**⌨️ RUN ALTER STATEMENTS:**
```bash
docker-compose exec db mysql -u prms_user -p prms_db
```

Then run your ALTER TABLE commands manually.

**OR IMPORT UPDATED SQL FILE:**
```bash
docker-compose exec -T db mysql -u prms_user -p prms_db < prms_db.sql
```

---

### 6.5: Scheduled Backups (Automated)

**⌨️ CREATE BACKUP SCRIPT:**
```bash
nano /root/backup-prms-docker.sh
```

**✏️ PASTE THIS:**
```bash
#!/bin/bash
BACKUP_DIR="/root/prms-backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
docker-compose -f /opt/prms/docker-compose.yml exec -T db mysqldump -u prms_user -pPASSWORD prms_db > $BACKUP_DIR/prms_db_$DATE.sql

# Backup uploads
docker cp prms-backend:/var/www/html/uploads $BACKUP_DIR/uploads_$DATE

# Compress
tar -czf $BACKUP_DIR/backup_$DATE.tar.gz $BACKUP_DIR/prms_db_$DATE.sql $BACKUP_DIR/uploads_$DATE
rm -rf $BACKUP_DIR/prms_db_$DATE.sql $BACKUP_DIR/uploads_$DATE

# Delete old backups (keep 7 days)
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE" >> $BACKUP_DIR/backup.log
```

**⌨️ MAKE EXECUTABLE:**
```bash
chmod +x /root/backup-prms-docker.sh
```

**⌨️ ADD TO CRON:**
```bash
crontab -e
```

**✏️ ADD LINE:**
```cron
0 2 * * * /root/backup-prms-docker.sh
```

---

### 6.6: Monitor Resource Usage

**⌨️ CHECK CONTAINER STATS:**
```bash
docker stats
```

**⌨️ CHECK DISK USAGE:**
```bash
docker system df
```

**⌨️ CHECK SPECIFIC CONTAINER:**
```bash
docker stats prms-backend prms-db prms-webserver
```

---

## 7. SSL/HTTPS Setup with Docker

### 7.1: Using Let's Encrypt with Nginx

**⌨️ INSTALL CERTBOT:**
```bash
apt install -y certbot
```

**⌨️ STOP WEBSERVER TEMPORARILY:**
```bash
docker-compose stop webserver
```

**⌨️ GET CERTIFICATE:**
```bash
certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
```

**⌨️ UPDATE NGINX CONFIG:**
```bash
nano nginx/conf.d/prms-ssl.conf
```

**✏️ ADD SSL CONFIGURATION:**
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    root /usr/share/nginx/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /prms-backend {
        alias /var/www/html/backend;
        
        location ~ \.php$ {
            fastcgi_pass backend:9000;
            fastcgi_index index.php;
            fastcgi_param SCRIPT_FILENAME /var/www/html$fastcgi_script_name;
            include fastcgi_params;
        }
    }
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

**⌨️ UPDATE DOCKER-COMPOSE TO MOUNT CERTIFICATES:**
```yaml
webserver:
  volumes:
    - /etc/letsencrypt:/etc/letsencrypt:ro
```

**⌨️ RESTART WEBSERVER:**
```bash
docker-compose up -d webserver
```

---

### 7.2: Auto-Renewal Setup

**⌨️ TEST RENEWAL:**
```bash
certbot renew --dry-run
```

**⌨️ ADD CRON FOR AUTO-RENEWAL:**
```bash
crontab -e
```

**✏️ ADD:**
```cron
0 3 * * * certbot renew --quiet --post-hook "docker-compose -f /opt/prms/docker-compose.yml restart webserver"
```

## 8. Advanced Docker Configuration

### 8.1: Custom Docker Network

Kung gusto mo ng custom network settings:

**⌨️ CREATE CUSTOM NETWORK:**
```bash
docker network create --subnet=172.20.0.0/16 prms-custom-network
```

**✏️ UPDATE docker-compose.yml:**
```yaml
networks:
  prms-network:
    external: true
    name: prms-custom-network
```

---

### 8.2: Resource Limits

Para limitahan ang memory at CPU usage:

**✏️ EDIT docker-compose.yml:**
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
          
  db:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

---

### 8.3: Health Checks

Add health checks para sa automatic recovery:

**✏️ ADD TO docker-compose.yml:**
```yaml
services:
  backend:
    healthcheck:
      test: ["CMD", "php-fpm-healthcheck"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
      
  webserver:
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

---

### 8.4: Docker Secrets (For Production)

Para mas secure ang passwords:

**⌨️ CREATE SECRETS:**
```bash
echo "your_db_password" | docker secret create db_password -
echo "your_root_password" | docker secret create db_root_password -
```

**✏️ UPDATE docker-compose.yml:**
```yaml
services:
  db:
    secrets:
      - db_password
      - db_root_password
    environment:
      MYSQL_ROOT_PASSWORD_FILE: /run/secrets/db_root_password
      MYSQL_PASSWORD_FILE: /run/secrets/db_password

secrets:
  db_password:
    external: true
  db_root_password:
    external: true
```

---

### 8.5: Multi-Stage Build Optimization

Para mas maliit ang image size, already implemented sa frontend Dockerfile:

```dockerfile
# Build stage - compile and build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --silent
COPY . .
RUN npm run build

# Production stage - serve only
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```

**💡 BENEFITS:**
- Mas maliit ang final image (300MB → 50MB)
- Walang dev dependencies sa production
- Mas mabilis ang deployment

---

## 9. Performance Optimization

### 9.1: Enable Gzip Compression

Already configured sa nginx.conf, pero pwede mo pa i-optimize:

**✏️ EDIT nginx/nginx.conf:**
```nginx
gzip on;
gzip_vary on;
gzip_comp_level 6;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss;
```

---

### 9.2: Database Optimization

**⌨️ CREATE MYSQL CONFIG:**
```bash
mkdir -p mysql/conf.d
nano mysql/conf.d/custom.cnf
```

**✏️ ADD OPTIMIZATIONS:**
```ini
[mysqld]
# Performance
innodb_buffer_pool_size = 256M
innodb_log_file_size = 64M
max_connections = 100
query_cache_type = 1
query_cache_size = 32M

# Security
bind-address = 0.0.0.0
local-infile = 0
```

**✏️ MOUNT CONFIG IN docker-compose.yml:**
```yaml
db:
  volumes:
    - ./mysql/conf.d:/etc/mysql/conf.d
```

---

### 9.3: PHP OPcache Tuning

Already enabled sa backend Dockerfile, pero pwede pa i-tweak:

**✏️ EDIT prms-backend/Dockerfile:**
```dockerfile
RUN echo "opcache.memory_consumption=256" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "opcache.max_accelerated_files=10000" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "opcache.interned_strings_buffer=16" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "opcache.fast_shutdown=1" >> /usr/local/etc/php/conf.d/opcache.ini
```

**⌨️ REBUILD BACKEND:**
```bash
docker-compose up -d --build backend
```

---

### 9.4: Frontend Caching Headers

**✏️ ADD TO nginx/conf.d/prms.conf:**
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

---

## 10. Monitoring and Logging

### 10.1: Container Logs Management

**⌨️ LIMIT LOG SIZE IN docker-compose.yml:**
```yaml
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
  
  webserver:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

**💡 BENEFIT:** Prevents logs from filling up disk space

---

### 10.2: Application Log Files

**⌨️ CREATE LOG DIRECTORY:**
```bash
docker-compose exec backend mkdir -p /var/www/html/logs
docker-compose exec backend chown -R www-data:www-data /var/www/html/logs
```

**⌨️ VIEW APPLICATION LOGS:**
```bash
docker-compose exec backend tail -f /var/www/html/logs/app.log
docker-compose exec backend tail -f /var/www/html/logs/error.log
```

---

### 10.3: MySQL Slow Query Log

**⌨️ ENABLE IN mysql/conf.d/custom.cnf:**
```ini
[mysqld]
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow-query.log
long_query_time = 2
```

**⌨️ VIEW SLOW QUERIES:**
```bash
docker-compose exec db tail -f /var/log/mysql/slow-query.log
```

---

### 10.4: Docker Stats Monitoring

**⌨️ REAL-TIME MONITORING:**
```bash
docker stats --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
```

**⌨️ SAVE TO FILE:**
```bash
docker stats --no-stream > docker-stats-$(date +%Y%m%d).txt
```

---

## 11. Security Best Practices

### 11.1: Change Default Passwords

**⚠️ NEVER USE DEFAULT PASSWORDS IN PRODUCTION!**

**✏️ UPDATE .env:**
```env
DB_ROOT_PASSWORD=STRONG_Random_P@ssw0rd_2024!
DB_PASSWORD=Another_Str0ng_P@ssw0rd!
```

**💡 TIP:** Use password generator for strong passwords
```bash
openssl rand -base64 32
```

---

### 11.2: Restrict Database Access

**✏️ UPDATE docker-compose.yml:**
```yaml
db:
  networks:
    - prms-network
  # Remove any port mappings - no external access needed
  # ports:
  #   - "3306:3306"  # REMOVE THIS LINE
```

---

### 11.3: Run Containers as Non-Root

Already configured in Dockerfiles, pero verify:

**⌨️ CHECK USER:**
```bash
docker-compose exec backend whoami
# Should return: www-data
```

---

### 11.4: Regular Security Updates

**⌨️ UPDATE BASE IMAGES:**
```bash
docker-compose pull
docker-compose up -d --build
```

**⌨️ SCHEDULE MONTHLY UPDATES:**
```cron
0 4 1 * * cd /opt/prms && docker-compose pull && docker-compose up -d --build
```

---

### 11.5: Firewall Configuration

**⌨️ SECURE UFW RULES:**
```bash
# Reset firewall
ufw --force reset

# Default policies
ufw default deny incoming
ufw default allow outgoing

# Allow SSH (change 22 to your custom port if modified)
ufw allow 22/tcp

# Allow HTTP/HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Enable firewall
ufw --force enable

# Check status
ufw status verbose
```

---

### 11.6: SSL/TLS Only (Production)

**✏️ FORCE HTTPS IN nginx:**
```nginx
# Redirect all HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$host$request_uri;
}
```

---

## 12. Backup and Recovery

### 12.1: Complete Backup Strategy

**⌨️ CREATE COMPREHENSIVE BACKUP SCRIPT:**
```bash
nano /root/prms-full-backup.sh
```

**✏️ PASTE:**
```bash
#!/bin/bash

# Configuration
BACKUP_DIR="/root/prms-backups"
PROJECT_DIR="/opt/prms"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

echo "Starting PRMS backup: $DATE"

# 1. Backup database
echo "Backing up database..."
docker-compose -f $PROJECT_DIR/docker-compose.yml exec -T db \
  mysqldump -u root -p${DB_ROOT_PASSWORD} --all-databases \
  > $BACKUP_DIR/database_$DATE.sql

# 2. Backup volumes
echo "Backing up volumes..."
docker run --rm -v prms_db_data:/data -v $BACKUP_DIR:/backup \
  alpine tar czf /backup/db_volume_$DATE.tar.gz -C /data .

# 3. Backup uploads/files
echo "Backing up uploads..."
docker cp prms-backend:/var/www/html/uploads $BACKUP_DIR/uploads_$DATE 2>/dev/null || true

# 4. Backup configuration files
echo "Backing up configs..."
tar czf $BACKUP_DIR/configs_$DATE.tar.gz \
  $PROJECT_DIR/.env \
  $PROJECT_DIR/docker-compose.yml \
  $PROJECT_DIR/prms-backend/config.php \
  $PROJECT_DIR/prms-backend/cors.php

# 5. Create master archive
echo "Creating master archive..."
tar czf $BACKUP_DIR/prms_complete_$DATE.tar.gz \
  $BACKUP_DIR/database_$DATE.sql \
  $BACKUP_DIR/db_volume_$DATE.tar.gz \
  $BACKUP_DIR/uploads_$DATE \
  $BACKUP_DIR/configs_$DATE.tar.gz

# 6. Cleanup individual files
rm -f $BACKUP_DIR/database_$DATE.sql
rm -f $BACKUP_DIR/db_volume_$DATE.tar.gz
rm -rf $BACKUP_DIR/uploads_$DATE
rm -f $BACKUP_DIR/configs_$DATE.tar.gz

# 7. Delete old backups
find $BACKUP_DIR -name "prms_complete_*.tar.gz" -mtime +$RETENTION_DAYS -delete

# 8. Log completion
BACKUP_SIZE=$(du -h $BACKUP_DIR/prms_complete_$DATE.tar.gz | cut -f1)
echo "Backup completed: $DATE | Size: $BACKUP_SIZE" >> $BACKUP_DIR/backup.log

echo "Backup completed successfully!"
```

**⌨️ MAKE EXECUTABLE:**
```bash
chmod +x /root/prms-full-backup.sh
```

**⌨️ TEST BACKUP:**
```bash
/root/prms-full-backup.sh
```

---

### 12.2: Automated Daily Backups

**⌨️ SCHEDULE WITH CRON:**
```bash
crontab -e
```

**✏️ ADD:**
```cron
# Daily backup at 2 AM
0 2 * * * /root/prms-full-backup.sh >> /root/prms-backups/cron.log 2>&1
```

---

### 12.3: Disaster Recovery - Restore from Backup

**⌨️ RESTORE COMPLETE BACKUP:**
```bash
# Stop all containers
cd /opt/prms
docker-compose down

# Extract backup
cd /root/prms-backups
tar xzf prms_complete_YYYYMMDD_HHMMSS.tar.gz

# Restore database
docker-compose up -d db
sleep 30  # Wait for DB to start
docker-compose exec -T db mysql -u root -p < database_YYYYMMDD_HHMMSS.sql

# Restore uploads
docker cp uploads_YYYYMMDD/* prms-backend:/var/www/html/uploads/

# Start all services
docker-compose up -d
```

**✅ VERIFY:** Test login and check if data is restored

---

### 12.4: Offsite Backup (Recommended for Production)

**⌨️ SYNC TO REMOTE SERVER:**
```bash
# Install rsync
apt install -y rsync

# Sync backups to remote server
rsync -avz --delete /root/prms-backups/ user@backup-server:/backups/prms/
```

**OR USE CLOUD STORAGE:**
```bash
# AWS S3
apt install -y awscli
aws s3 sync /root/prms-backups/ s3://your-bucket/prms-backups/

# Google Drive (rclone)
curl https://rclone.org/install.sh | bash
rclone sync /root/prms-backups/ gdrive:prms-backups/
```

## 13. Quick Reference

### 13.1: Most Common Commands

**🚀 START APPLICATION:**
```bash
docker-compose up -d
```

**🛑 STOP APPLICATION:**
```bash
docker-compose down
```

**🔄 RESTART APPLICATION:**
```bash
docker-compose restart
```

**📊 CHECK STATUS:**
```bash
docker-compose ps
```

**📝 VIEW LOGS:**
```bash
docker-compose logs -f
```

**🔧 REBUILD AFTER CODE CHANGES:**
```bash
docker-compose up -d --build
```

**💾 BACKUP DATABASE:**
```bash
docker-compose exec db mysqldump -u prms_user -p prms_db > backup.sql
```

**📦 UPDATE FROM GIT:**
```bash
git pull origin main
docker-compose up -d --build
```

---

### 13.2: Troubleshooting Quick Fixes

**PROBLEM: Container won't start**
```bash
docker-compose logs container-name
docker-compose restart container-name
```

**PROBLEM: Database connection error**
```bash
docker-compose restart db
docker-compose restart backend
```

**PROBLEM: Port already in use**
```bash
# Edit docker-compose.yml ports section
# Change "80:80" to "8080:80"
docker-compose up -d
```

**PROBLEM: Out of disk space**
```bash
docker system prune -a --volumes
```

**PROBLEM: Changes not reflecting**
```bash
docker-compose down
docker-compose up -d --build --force-recreate
```

---

##

---

## 14. Production Deployment Checklist

### Before Deploying to Production:

- [ ] **Security**
  - [ ] Changed all default passwords in `.env`
  - [ ] Removed port 3306 mapping (no external DB access)
  - [ ] Configured firewall (UFW)
  - [ ] SSL certificate installed
  - [ ] Configured CORS properly in `cors.php`

- [ ] **Configuration**
  - [ ] Created `.env` file with production values
  - [ ] Created `prms-frontend/.env` with production URLs
  - [ ] Updated `cors.php` with production domain
  - [ ] Configured `config.php` to use docker environment


  - [ ] **Testing**
  - [ ] Tested locally with Docker first
  - [ ] Verified database import works
  - [ ] Tested login
  - [ ] Checked all major features work
  - [ ] Verified forecasting scripts run

- [ ] **Backups**
  - [ ] Automated backup script created
  - [ ] Tested backup and restore
  - [ ] Backup schedule configured (cron)
  - [ ] Offsite backup configured (optional)

- [ ] **Monitoring**
  - [ ] Log rotation configured
  - [ ] Resource limits set
  - [ ] Health checks enabled
  - [ ] Error monitoring in place

- [ ] **Performance**
  - [ ] OPcache enabled
  - [ ] Gzip compression enabled
  - [ ] Database optimizations applied
  - [ ] Frontend caching configured

---

## 15. Comparison: Docker vs Manual VPS Setup

### Why Docker is Better:

**✅ ADVANTAGES:**
- **One-command deployment:** `docker-compose up -d` vs 2-3 hours manual setup
- **Consistent environment:** Same sa local at production
- **Easy updates:** `docker-compose up -d --build` vs manual rebuild
- **Isolated services:** Each service sa own container
- **Easy rollback:** Restore previous version quickly
- **Portable:** Move to any server easily
- **Scalable:** Easy to add more containers

**❌ DISADVANTAGES:**
- Needs Docker knowledge (pero mas simple pa rin!)
- Uses more disk space (pero sulit!)
- Slight overhead (minimal lang)

### Time Comparison:

| Task | Manual VPS | Docker |
|------|-----------|---------|
| Initial Setup | 2-3 hours | 10-15 minutes |
| Updates | 30-60 minutes | 5 minutes |
| Backup/Restore | Complex | Simple script |
| Troubleshooting | Difficult | Easy with logs |
| Moving to new server | 2-3 hours | 15 minutes |

---

## 16. FAQs (Frequently Asked Questions)

### Q1: Pwede ba gamitin sa shared hosting?
**A:** Hindi. Kailangan VPS o dedicated server na may Docker support.

### Q2: Magkano ang gastos?
**A:** 
- Local dev: **FREE** (Docker Desktop libre)
- Production VPS: **₱400-500/month** (Hostinger, DigitalOcean, etc.)
- Domain: **₱500-800/year** (optional)

### Q3: Ano mas recommended: Docker o Manual?
**A:** **Docker!** Mas madali, mas mabilis, mas consistent.

### Q4: Pwede ba mag-auto-scale?
**A:** Yes! Gamit Docker Swarm or Kubernetes, pero advance