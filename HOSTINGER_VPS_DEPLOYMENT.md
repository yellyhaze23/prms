# PRMS Deployment Guide - Hostinger VPS

## System Requirements

This guide covers deploying the Patient Record Management System (PRMS) on a Hostinger VPS

### Tech Stack
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: PHP 8.x + MySQL 8.x
- **Forecasting**: Python 3.8+ with data science libraries
- **Web Server**: Apache or Nginx
- **SSL**: Let's Encrypt (Free)

---

## Table of Contents

1. [Initial VPS Setup](#1-initial-vps-setup)
2. [Install Required Software](#2-install-required-software)
3. [Setup MySQL Database](#3-setup-mysql-database)
4. [Configure Backend](#4-configure-backend)
5. [Build and Deploy Frontend](#5-build-and-deploy-frontend)
6. [Configure Web Server](#6-configure-web-server)
7. [Setup Python Forecasting](#7-setup-python-forecasting)
8. [Configure Cron Jobs](#8-configure-cron-jobs)
9. [Setup SSL Certificate](#9-setup-ssl-certificate)
10. [Security Hardening](#10-security-hardening)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. Initial VPS Setup

### 1.1 Access Your VPS

After purchasing your Hostinger VPS plan, you'll receive SSH credentials via email.

```bash
# Connect via SSH (Windows PowerShell, Git Bash, or PuTTY)
ssh root@your-vps-ip-address
```

### 1.2 Update System Packages

```bash
# Update package list
apt update

# Upgrade all packages
apt upgrade -y

# Install essential utilities
apt install -y curl wget git unzip vim nano htop
```

### 1.3 Create a New User (Security Best Practice)

```bash
# Create a new user (replace 'prmsuser' with your preferred username)
adduser prmsuser

# Add user to sudo group
usermod -aG sudo prmsuser

# Switch to new user
su - prmsuser
```

---

## 2. Install Required Software

### 2.1 Install Apache Web Server

```bash
sudo apt install -y apache2

# Enable Apache modules
sudo a2enmod rewrite
sudo a2enmod headers
sudo a2enmod ssl

# Start and enable Apache
sudo systemctl start apache2
sudo systemctl enable apache2
```

### 2.2 Install PHP 8.x and Extensions

```bash
# Add PHP repository
sudo apt install -y software-properties-common
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update

# Install PHP 8.2 and required extensions
sudo apt install -y php8.2 php8.2-cli php8.2-fpm php8.2-mysql \
    php8.2-curl php8.2-gd php8.2-mbstring php8.2-xml \
    php8.2-xmlrpc php8.2-soap php8.2-intl php8.2-zip \
    php8.2-bcmath php8.2-opcache

# Verify PHP installation
php -v
```

### 2.3 Install MySQL 8.x

```bash
# Install MySQL Server
sudo apt install -y mysql-server

# Secure MySQL installation
sudo mysql_secure_installation
```

**MySQL Secure Installation Prompts:**
- Set root password: **YES** (use a strong password)
- Remove anonymous users: **YES**
- Disallow root login remotely: **YES**
- Remove test database: **YES**
- Reload privilege tables: **YES**

### 2.4 Install Node.js and npm

```bash
# Install Node.js 20.x LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node -v
npm -v
```

### 2.5 Install Python and Dependencies

```bash
# Install Python 3 and pip
sudo apt install -y python3 python3-pip python3-venv

# Verify installation
python3 --version
pip3 --version
```

---

## 3. Setup MySQL Database

### 3.1 Create Database and User

```bash
# Login to MySQL
sudo mysql -u root -p
```

```sql
-- Create database
CREATE DATABASE prms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user (replace 'your_password' with a strong password)
CREATE USER 'prms_user'@'localhost' IDENTIFIED BY 'your_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON prms_db.* TO 'prms_user'@'localhost';

-- Flush privileges
FLUSH PRIVILEGES;

-- Exit MySQL
EXIT;
```

### 3.2 Import Database Schema

```bash
# Navigate to project directory (we'll create this next)
cd /var/www/prms

# Import the SQL file
mysql -u prms_user -p prms_db < prms_db.sql
```

---

## 4. Configure Backend

### 4.1 Clone Your Project

```bash
# Create web directory
sudo mkdir -p /var/www/prms
sudo chown -R $USER:$USER /var/www/prms
cd /var/www/prms

# Clone from Git (if using Git)
git clone https://github.com/yourusername/prms.git .

# OR upload files using SCP/SFTP from your local machine
# From local machine (PowerShell):
# scp -r C:\laragon\www\prms prmsuser@your-vps-ip:/var/www/prms
```

### 4.2 Configure Database Connection

```bash
# Copy the example config file
cp prms-backend/config.example.php prms-backend/config.php

# Edit config.php with your credentials
nano prms-backend/config.php
```

Update with your database credentials:

```php
<?php
$host     = 'localhost';
$dbuser   = 'prms_user';           // Database user (same as created in Step 3.1)
$dbpass   = 'your_password';       // Database password (CHANGE THIS!)
$dbname   = 'prms_db';

$conn = mysqli_connect($host, $dbuser, $dbpass, $dbname);
if (!$conn) {
    die("DB connection error: " . mysqli_connect_error());
}
mysqli_set_charset($conn, 'utf8mb4');
mysqli_query($conn, "SET collation_connection = 'utf8mb4_general_ci'");
```

> **🔒 Security Note**: The `config.php` file is ignored by Git (in `.gitignore`) to prevent exposing credentials. Only `config.example.php` is tracked.

### 4.3 Set Proper Permissions

```bash
# Set ownership
sudo chown -R www-data:www-data /var/www/prms

# Set directory permissions
sudo find /var/www/prms -type d -exec chmod 755 {} \;

# Set file permissions
sudo find /var/www/prms -type f -exec chmod 644 {} \;

# Set write permissions for upload directories
sudo chmod -R 775 /var/www/prms/prms-backend/uploads
sudo chmod -R 775 /var/www/prms/prms-backend/logs
sudo chmod -R 775 /var/www/prms/forecasting/cache
```

---

## 5. Build and Deploy Frontend

### 5.1 Install Dependencies and Build

```bash
# Navigate to frontend directory
cd /var/www/prms/prms-frontend

# Install dependencies
npm install

# Update API URL in frontend config
# Edit src/config.js or wherever your API URL is defined
nano src/config.js
```

Update API URL to point to your domain:

```javascript
// Change from localhost to your domain
export const API_BASE_URL = 'https://yourdomain.com/prms-backend';
```

```bash
# Build for production
npm run build

# The build output will be in the 'dist' folder
```

---

## 6. Configure Web Server

### 6.1 Create Apache Virtual Host

```bash
# Create virtual host configuration
sudo nano /etc/apache2/sites-available/prms.conf
```

Add the following configuration:

```apache
<VirtualHost *:80>
    ServerName yourdomain.com
    ServerAlias www.yourdomain.com
    
    DocumentRoot /var/www/prms/prms-frontend/dist
    
    # Frontend (React app)
    <Directory /var/www/prms/prms-frontend/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        # React Router support
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
    
    # Backend API
    Alias /prms-backend /var/www/prms/prms-backend
    <Directory /var/www/prms/prms-backend>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        # Enable PHP
        <FilesMatch \.php$>
            SetHandler "proxy:unix:/var/run/php/php8.2-fpm.sock|fcgi://localhost"
        </FilesMatch>
    </Directory>
    
    # Uploads directory
    <Directory /var/www/prms/prms-backend/uploads>
        Options -Indexes
        AllowOverride None
        Require all granted
    </Directory>
    
    # Security headers
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    
    ErrorLog ${APACHE_LOG_DIR}/prms_error.log
    CustomLog ${APACHE_LOG_DIR}/prms_access.log combined
</VirtualHost>
```

### 6.2 Enable Site and Required Modules

```bash
# Enable proxy modules for PHP-FPM
sudo a2enmod proxy_fcgi setenvif
sudo a2enconf php8.2-fpm

# Enable the site
sudo a2ensite prms.conf

# Disable default site
sudo a2dissite 000-default.conf

# Test Apache configuration
sudo apache2ctl configtest

# Restart Apache
sudo systemctl restart apache2
```

### 6.3 Configure PHP-FPM

```bash
# Edit PHP-FPM configuration
sudo nano /etc/php/8.2/fpm/php.ini
```

Update these settings:

```ini
upload_max_filesize = 10M
post_max_size = 10M
max_execution_time = 300
max_input_time = 300
memory_limit = 256M
date.timezone = Asia/Manila
```

```bash
# Restart PHP-FPM
sudo systemctl restart php8.2-fpm
```

---

## 7. Setup Python Forecasting

### 7.1 Create Python Virtual Environment

```bash
# Navigate to forecasting directory
cd /var/www/prms/forecasting

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Deactivate when done
deactivate
```

### 7.2 Test Forecasting Script

```bash
# Test the forecasting script
cd /var/www/prms/forecasting
source venv/bin/activate
python3 forecast_arima.py
deactivate
```

---

## 8. Configure Cron Jobs

### 8.1 Setup Automated Tasks

```bash
# Edit crontab
crontab -e
```

Add the following cron jobs:

```cron
# Update disease summary daily at 1:00 AM
0 1 * * * /usr/bin/php /var/www/prms/prms-backend/cron_update_disease_summary.php >> /var/www/prms/prms-backend/logs/cron.log 2>&1

# Generate forecasts weekly on Monday at 2:00 AM
0 2 * * 1 cd /var/www/prms/forecasting && /var/www/prms/forecasting/venv/bin/python3 /var/www/prms/forecasting/forecast_arima.py >> /var/www/prms/prms-backend/logs/forecast.log 2>&1

# Update ARIMA forecast in database weekly on Monday at 3:00 AM
0 3 * * 1 /usr/bin/php /var/www/prms/prms-backend/arima_forecast_disease_summary.php >> /var/www/prms/prms-backend/logs/arima_cron.log 2>&1

# Generate notifications daily at 8:00 AM
0 8 * * * /usr/bin/php /var/www/prms/prms-backend/generate_notifications.php >> /var/www/prms/prms-backend/logs/notifications.log 2>&1

# Clean old logs weekly on Sunday at 3:00 AM
0 3 * * 0 find /var/www/prms/prms-backend/logs -name "*.log" -mtime +30 -delete
```

### 8.2 Create Log Directory

```bash
# Ensure logs directory exists
mkdir -p /var/www/prms/prms-backend/logs
sudo chown -R www-data:www-data /var/www/prms/prms-backend/logs
sudo chmod -R 775 /var/www/prms/prms-backend/logs
```

---

## 9. Setup SSL Certificate

### 9.1 Install Certbot

```bash
# Install Certbot for Apache
sudo apt install -y certbot python3-certbot-apache
```

### 9.2 Obtain SSL Certificate

```bash
# Get SSL certificate (replace with your domain)
sudo certbot --apache -d yourdomain.com -d www.yourdomain.com
```

**Certbot Prompts:**
- Enter email address: your-email@example.com
- Agree to terms: **YES**
- Share email: **NO** (optional)
- Redirect HTTP to HTTPS: **2** (recommended)

### 9.3 Test Auto-Renewal

```bash
# Test certificate renewal
sudo certbot renew --dry-run
```

The certificate will auto-renew before expiration.

---

## 10. Security Hardening

### 10.1 Configure Firewall (UFW)

```bash
# Install UFW
sudo apt install -y ufw

# Allow SSH (IMPORTANT: Do this first!)
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### 10.2 Secure MySQL

```bash
# Edit MySQL configuration
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
```

Add/verify these settings:

```ini
[mysqld]
bind-address = 127.0.0.1
local-infile = 0
```

```bash
# Restart MySQL
sudo systemctl restart mysql
```

### 10.3 Disable Directory Listing

Already configured in Apache virtual host with `Options -Indexes`

### 10.4 Secure Sensitive Files

```bash
# Protect config files
sudo chmod 640 /var/www/prms/prms-backend/config.php
sudo chown www-data:www-data /var/www/prms/prms-backend/config.php

# Create .htaccess for backend config
sudo nano /var/www/prms/prms-backend/.htaccess
```

Add:

```apache
# Deny access to config files
<Files "config.php">
    Require all denied
</Files>

# Deny access to SQL files
<FilesMatch "\.(sql)$">
    Require all denied
</FilesMatch>
```

### 10.5 Setup Fail2Ban (SSH Protection)

```bash
# Install Fail2Ban
sudo apt install -y fail2ban

# Create local configuration
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# Edit configuration
sudo nano /etc/fail2ban/jail.local
```

Find `[sshd]` section and ensure it's enabled:

```ini
[sshd]
enabled = true
port = ssh
logpath = %(sshd_log)s
maxretry = 3
bantime = 3600
```

```bash
# Start and enable Fail2Ban
sudo systemctl start fail2ban
sudo systemctl enable fail2ban

# Check status
sudo fail2ban-client status sshd
```

---

## 11. Troubleshooting

### Common Issues and Solutions

#### 11.1 Apache Won't Start

```bash
# Check Apache error logs
sudo tail -f /var/log/apache2/error.log

# Check configuration syntax
sudo apache2ctl configtest

# Check if port 80/443 is already in use
sudo netstat -tlnp | grep :80
```

#### 11.2 PHP Files Download Instead of Execute

```bash
# Ensure PHP-FPM is running
sudo systemctl status php8.2-fpm

# Restart PHP-FPM and Apache
sudo systemctl restart php8.2-fpm
sudo systemctl restart apache2
```

#### 11.3 Database Connection Error

```bash
# Test MySQL connection
mysql -u prms_user -p prms_db

# Check if MySQL is running
sudo systemctl status mysql

# Check MySQL error logs
sudo tail -f /var/log/mysql/error.log
```

#### 11.4 Permission Denied Errors

```bash
# Reset permissions
sudo chown -R www-data:www-data /var/www/prms
sudo chmod -R 755 /var/www/prms
sudo chmod -R 775 /var/www/prms/prms-backend/uploads
sudo chmod -R 775 /var/www/prms/prms-backend/logs
```

#### 11.5 Frontend Not Loading (404 Errors)

```bash
# Ensure .htaccess is enabled
sudo a2enmod rewrite

# Check if dist folder exists
ls -la /var/www/prms/prms-frontend/dist

# Rebuild frontend if needed
cd /var/www/prms/prms-frontend
npm run build
```

#### 11.6 Python Forecasting Fails

```bash
# Check if virtual environment exists
ls -la /var/www/prms/forecasting/venv

# Reinstall dependencies
cd /var/www/prms/forecasting
source venv/bin/activate
pip install --upgrade -r requirements.txt

# Check cron logs
tail -f /var/www/prms/prms-backend/logs/forecast.log
```

#### 11.7 CORS Issues

If frontend can't connect to backend, edit `prms-backend/cors.php`:

```php
<?php
// Allow your domain
header("Access-Control-Allow-Origin: https://yourdomain.com");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}
```

### Useful Commands

```bash
# Check Apache status
sudo systemctl status apache2

# Check PHP-FPM status
sudo systemctl status php8.2-fpm

# Check MySQL status
sudo systemctl status mysql

# View real-time Apache error logs
sudo tail -f /var/log/apache2/prms_error.log

# View real-time Apache access logs
sudo tail -f /var/log/apache2/prms_access.log

# Check disk space
df -h

# Check memory usage
free -m

# Check running processes
htop
```

---

## Post-Deployment Checklist

- [ ] VPS is accessible via SSH
- [ ] Apache, PHP, MySQL, Node.js, Python are installed
- [ ] Database is created and imported
- [ ] Backend config.php has correct database credentials
- [ ] Frontend is built and API URL is updated
- [ ] Apache virtual host is configured
- [ ] SSL certificate is installed
- [ ] Firewall is configured
- [ ] Cron jobs are set up
- [ ] File permissions are correct
- [ ] Can access the site via HTTPS
- [ ] Can login to the system
- [ ] Forecasting script runs successfully
- [ ] Email notifications work (if applicable)

---

## Backup Strategy

### Daily Database Backup

```bash
# Create backup script
sudo nano /usr/local/bin/backup-prms.sh
```

Add:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/prms"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
mysqldump -u prms_user -p'your_password' prms_db > $BACKUP_DIR/prms_db_$DATE.sql

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /var/www/prms/prms-backend/uploads

# Delete backups older than 7 days
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

```bash
# Make executable
sudo chmod +x /usr/local/bin/backup-prms.sh

# Add to crontab (daily at 4 AM)
0 4 * * * /usr/local/bin/backup-prms.sh
```

---

## Performance Optimization

### Enable OPcache

```bash
# Edit PHP configuration
sudo nano /etc/php/8.2/fpm/php.ini
```

Add/update:

```ini
[opcache]
opcache.enable=1
opcache.memory_consumption=128
opcache.interned_strings_buffer=8
opcache.max_accelerated_files=4000
opcache.revalidate_freq=60
opcache.fast_shutdown=1
```

```bash
# Restart PHP-FPM
sudo systemctl restart php8.2-fpm
```

---

## Domain Configuration

### Update DNS Records

In your domain registrar (e.g., Namecheap, GoDaddy):

1. Add **A Record**: 
   - Host: `@`
   - Value: Your VPS IP address
   - TTL: 3600

2. Add **A Record** for www:
   - Host: `www`
   - Value: Your VPS IP address
   - TTL: 3600

Wait 15-30 minutes for DNS propagation.

---

## Support and Maintenance

### Regular Maintenance Tasks

**Weekly:**
- Check disk space: `df -h`
- Check error logs
- Verify backups are working

**Monthly:**
- Update system packages: `sudo apt update && sudo apt upgrade`
- Review security logs
- Test disaster recovery procedures

**As Needed:**
- Monitor Apache/PHP error logs
- Review application logs
- Check database performance

---

## Estimated Costs

- **Hostinger VPS (400+ PHP/month)**: ₱400-500/month
- **Domain Name**: ₱500-800/year
- **SSL Certificate**: Free (Let's Encrypt)
- **Total Monthly**: ~₱450-500

---

## Additional Resources

- Hostinger VPS Documentation: https://www.hostinger.ph/tutorials/vps
- Let's Encrypt: https://letsencrypt.org/
- Apache Documentation: https://httpd.apache.org/docs/
- PHP Documentation: https://www.php.net/docs.php
- MySQL Documentation: https://dev.mysql.com/doc/

---

## Contact Information

For deployment support, contact your system administrator or development team.

**Last Updated**: October 2025

