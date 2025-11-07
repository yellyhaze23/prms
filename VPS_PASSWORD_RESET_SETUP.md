# Password Reset Feature - VPS Production Setup Guide

## Overview
Step-by-step guide para i-setup ang password reset feature sa existing VPS production.

---

## Step 1: SSH to VPS

```bash
ssh root@YOUR_VPS_IP
# O kung may domain:
ssh root@yourdomain.com
```

---

## Step 2: Navigate to Project Directory

```bash
cd /opt/prms
# O kung saan mo nilagay ang project
# cd /var/www/prms
```

---

## Step 3: Pull Latest Code

```bash
# Check current branch
git branch

# Pull latest changes
git pull origin vps-prod

# Verify new files exist
ls -la prms-backend/send_reset_code.php
ls -la prms-backend/verify_code_reset.php
ls -la prms-backend/composer.json
ls -la prms-frontend/src/components/AdminPasswordResetModal.jsx
```

---

## Step 4: Database Migration

### Option A: Using MySQL Command Line

```bash
# Access MySQL
docker compose exec db mysql -u prms_user -pprms_pass_2024 prms_db

# Then run the SQL:
```

```sql
-- Table to track login attempts per username/IP (Admin only)
CREATE TABLE IF NOT EXISTS login_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    attempts INT DEFAULT 1,
    last_attempt DATETIME DEFAULT CURRENT_TIMESTAMP,
    locked_until DATETIME NULL,
    INDEX idx_username (username),
    INDEX idx_ip (ip_address),
    INDEX idx_locked (locked_until)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table for verification codes
CREATE TABLE IF NOT EXISTS password_reset_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    code VARCHAR(6) NOT NULL,
    email VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    used TINYINT(1) DEFAULT 0,
    attempts INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_code (code),
    INDEX idx_user (user_id),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Verify tables created
SHOW TABLES LIKE '%attempt%';
SHOW TABLES LIKE '%reset%';
```

### Option B: Using SQL File

```bash
# Copy SQL file to container
docker compose cp prms-backend/database_migrations/password_reset_tables.sql prms-db:/tmp/

# Execute SQL
docker compose exec db mysql -u prms_user -pprms_pass_2024 prms_db < /tmp/password_reset_tables.sql

# Verify
docker compose exec db mysql -u prms_user -pprms_pass_2024 prms_db -e "SHOW TABLES LIKE '%attempt%'; SHOW TABLES LIKE '%reset%';"
```

---

## Step 5: Configure Email Settings

### Add Email Variables to Root `.env` File

```bash
# Edit root .env file
nano .env
# O kung saan mo nilagay ang .env file
```

**Add these lines sa `.env` file:**

```env
# Email Configuration for Password Reset (PHPMailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_ENCRYPTION=tls
FROM_EMAIL=your-email@gmail.com
FROM_NAME=PRMS System
```

**Replace:**
- `your-email@gmail.com` → Your Gmail address
- `your-app-password` → Gmail App Password (16 characters)

### Gmail App Password Setup

1. Go to Google Account → Security
2. Enable 2-Step Verification (if not enabled)
3. Go to App passwords
4. Generate password for "Mail" → "Other (Custom name)"
5. Name: "PRMS VPS"
6. Copy the 16-character password

---

## Step 6: Update docker-compose.yml (Add Email Env Vars)

```bash
# Edit docker-compose.yml
nano docker-compose.yml
```

**Find the `backend` service section and add email environment variables:**

```yaml
  backend:
    build:
      context: ./prms-backend
      dockerfile: Dockerfile
    container_name: prms-backend
    restart: unless-stopped
    volumes:
      - ./prms-backend:/var/www/html
      # ... other volumes
    environment:
      - DB_HOST=db
      - DB_NAME=${DB_NAME:-prms_db}
      - DB_USER=${DB_USER:-prms_user}
      - DB_PASSWORD=${DB_PASSWORD:-prms_pass_2024}
      - FORECASTING_DIR=/var/www/forecasting
      - BACKUP_DIR=/var/www/html/backups
      - DB_CONTAINER_NAME=prms-db
      - DB_ROOT_PASSWORD=${DB_ROOT_PASSWORD:-prms_root_2024}
      # Add these email environment variables:
      - SMTP_HOST=${SMTP_HOST:-smtp.gmail.com}
      - SMTP_PORT=${SMTP_PORT:-587}
      - SMTP_USERNAME=${SMTP_USERNAME:-}
      - SMTP_PASSWORD=${SMTP_PASSWORD:-}
      - SMTP_ENCRYPTION=${SMTP_ENCRYPTION:-tls}
      - FROM_EMAIL=${FROM_EMAIL:-noreply@prms.local}
      - FROM_NAME=${FROM_NAME:-PRMS System}
```

**Save and exit** (Ctrl+X, then Y, then Enter)

---

## Step 7: Verify Admin Email in Database

```bash
# Check admin email
docker compose exec db mysql -u prms_user -pprms_pass_2024 prms_db -e "SELECT id, username, email, role FROM users WHERE role = 'admin';"

# If no email, update it:
docker compose exec db mysql -u prms_user -pprms_pass_2024 prms_db -e "UPDATE users SET email = 'your-email@gmail.com' WHERE role = 'admin' AND username = 'Admin';"
```

---

## Step 8: Rebuild Containers

### Rebuild Backend (for PHPMailer)

```bash
# Rebuild backend container (installs PHPMailer)
docker compose build backend --no-cache

# O rebuild all:
docker compose build --no-cache
```

### Rebuild Frontend (for new modal component)

```bash
# Rebuild frontend container
docker compose build frontend --no-cache
```

---

## Step 9: Restart Containers

```bash
# Stop all containers
docker compose down

# Start all containers
docker compose up -d

# Check status
docker compose ps

# Check logs
docker compose logs backend --tail 50
docker compose logs frontend --tail 50
```

---

## Step 10: Verify PHPMailer Installation

```bash
# Check if PHPMailer is installed
docker compose exec backend ls -la /var/www/html/vendor/phpmailer/phpmailer

# Should show PHPMailer files
```

---

## Step 11: Test the Feature

1. **Open your VPS URL:** `http://YOUR_VPS_IP` or `http://yourdomain.com`
2. **Test Failed Attempts:**
   - Login with admin username
   - Enter wrong password 5 times
   - Modal should auto-open
3. **Check Email:**
   - Check admin's email inbox
   - Look for verification code
4. **Test Code Verification:**
   - Enter 6-digit code
   - Set new password
   - Try logging in with new password

---

## Step 12: Verify Everything Works

### Check Backend Logs

```bash
# Check if email sending works
docker compose logs backend | grep -i mail

# Check for errors
docker compose logs backend | grep -i error
```

### Check Database

```bash
# Check if tables exist
docker compose exec db mysql -u prms_user -pprms_pass_2024 prms_db -e "SHOW TABLES LIKE '%attempt%'; SHOW TABLES LIKE '%reset%';"

# Check recent codes (after testing)
docker compose exec db mysql -u prms_user -pprms_pass_2024 prms_db -e "SELECT * FROM password_reset_codes ORDER BY created_at DESC LIMIT 5;"
```

---

## Troubleshooting

### Issue: PHPMailer not found

**Solution:**
```bash
# Rebuild backend
docker compose build backend --no-cache
docker compose up -d backend
```

### Issue: Email not sending

**Check:**
1. SMTP credentials in `.env`
2. Gmail App Password (not regular password)
3. Firewall allows port 587
4. Backend logs: `docker compose logs backend | grep -i mail`

### Issue: Tables not created

**Solution:**
```bash
# Run migration manually
docker compose exec db mysql -u prms_user -pprms_pass_2024 prms_db < prms-backend/database_migrations/password_reset_tables.sql
```

### Issue: Frontend not updated

**Solution:**
```bash
# Rebuild frontend
docker compose build frontend --no-cache
docker compose up -d frontend
```

---

## Quick Command Reference

```bash
# Navigate to project
cd /opt/prms

# Pull latest code
git pull origin vps-prod

# Rebuild backend (PHPMailer)
docker compose build backend --no-cache

# Rebuild frontend (new modal)
docker compose build frontend --no-cache

# Restart all
docker compose down
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f backend
docker compose logs -f frontend

# Check database
docker compose exec db mysql -u prms_user -pprms_pass_2024 prms_db -e "SHOW TABLES;"
```

---

## File Structure Summary

```
/opt/prms/
├── .env                          # Root .env (add email vars here)
├── docker-compose.yml            # Add email env vars to backend service
├── prms-backend/
│   ├── composer.json             # PHPMailer dependency
│   ├── email_config.php          # Email configuration
│   ├── send_email.php            # PHPMailer implementation
│   ├── send_reset_code.php       # API: Send code
│   ├── verify_code_reset.php     # API: Verify code
│   └── database_migrations/
│       └── password_reset_tables.sql
└── prms-frontend/
    └── src/
        └── components/
            └── AdminPasswordResetModal.jsx
```

---

## Checklist

- [ ] Pulled latest code from git
- [ ] Database tables created (`login_attempts`, `password_reset_codes`)
- [ ] Email variables added to root `.env`
- [ ] Email env vars added to `docker-compose.yml` backend service
- [ ] Admin email verified in database
- [ ] Backend container rebuilt (PHPMailer installed)
- [ ] Frontend container rebuilt (new modal)
- [ ] Containers restarted
- [ ] PHPMailer verified installed
- [ ] Feature tested (5 failed attempts → email → code → reset)

---

## Next Steps After Setup

1. Test the feature thoroughly
2. Monitor logs for any issues
3. Update documentation if needed
4. Inform users about the feature

---

**Note:** Make sure to backup your database before running migrations!

```bash
# Quick backup before migration
docker compose exec db mysqldump -u prms_user -pprms_pass_2024 prms_db > backup_before_password_reset_$(date +%Y%m%d_%H%M%S).sql
```

