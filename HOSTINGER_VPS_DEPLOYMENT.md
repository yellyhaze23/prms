# PRMS Deployment Guide - Hostinger VPS
## Complete Step-by-Step Instructions

This guide will walk you through deploying the Patient Record Management System (PRMS) on a Hostinger VPS server. Follow each step carefully in order.

### What You're Deploying
- **Frontend**: React application with Vite and Tailwind CSS
- **Backend**: PHP 8.x API with MySQL 8.x database
- **Forecasting**: Python scripts for disease prediction
- **Web Server**: Apache with SSL (HTTPS)
- **Cost**: ~₱400-500/month for VPS + ₱500-800/year for domain

### What You'll Need
- [ ] Hostinger VPS account (purchased)
- [ ] Domain name (optional but recommended)
- [ ] Your local PRMS project at `C:\laragon\www\prms`
- [ ] 1-2 hours of time
- [ ] Basic knowledge of copy/paste commands

---

## Table of Contents

1. [Access Your Server](#1-access-your-server)
2. [Install Required Software](#2-install-required-software)
3. [Upload Your Project Files](#3-upload-your-project-files)
4. [Setup MySQL Database](#4-setup-mysql-database)
5. [Configure Backend](#5-configure-backend)
6. [Build and Deploy Frontend](#6-build-and-deploy-frontend)
7. [Configure Web Server](#7-configure-web-server)
8. [Setup Python Forecasting](#8-setup-python-forecasting)
9. [Configure Automated Tasks](#9-configure-automated-tasks)
10. [Setup SSL Certificate (HTTPS)](#10-setup-ssl-certificate-https)
11. [Security Hardening](#11-security-hardening)
12. [Final Testing](#12-final-testing)
13. [Troubleshooting](#13-troubleshooting)

---

## 1. Access Your Server

### Step 1.1: Get Your VPS Credentials

After purchasing your Hostinger VPS, check your email for:
- **VPS IP Address** (example: 123.456.789.012)
- **Root Password**
- **SSH Port** (usually 22)

### Step 1.2: Connect to Your VPS

**📍 WHERE:** On your local Windows computer

**➡️ ACTION:** Open PowerShell

**⌨️ TYPE THIS:** (Replace `your-vps-ip` with your actual IP address)
```bash
ssh root@your-vps-ip
```

**📝 EXAMPLE:**
```bash
ssh root@203.0.113.45
```

**❓ If asked "Are you sure you want to continue connecting?"**
- Type `yes` and press Enter
- Then enter your root password when prompted

**✅ SUCCESS:** You should see a welcome message and a prompt like `root@server:~#`

---

### Step 1.3: Update Your Server

**📍 WHERE:** In your VPS terminal (you're now connected via SSH)

**⌨️ TYPE THESE COMMANDS ONE BY ONE:**

```bash
apt update
```
⏳ *Wait for it to finish (shows package list update)*

```bash
apt upgrade -y
```
⏳ *This takes 2-5 minutes (upgrades all packages)*

```bash
apt install -y curl wget git unzip vim nano htop
```
⏳ *This takes 1-2 minutes (installs essential tools)*

**✅ SUCCESS:** All commands complete without errors

---

### Step 1.4: Create a Non-Root User (Security Best Practice)

**📍 WHERE:** Still in your VPS terminal

**⌨️ TYPE THIS:**
```bash
adduser prmsuser
```

**📝 YOU'LL BE ASKED TO ENTER:**
- **Password:** Choose a strong password (you'll type it twice)
- **Full Name:** Press Enter (optional)
- **Room Number:** Press Enter (optional)
- **Work Phone:** Press Enter (optional)
- **Home Phone:** Press Enter (optional)
- **Other:** Press Enter (optional)
- **Is the information correct?** Type `Y` and press Enter

**⌨️ NOW TYPE THIS:**
```bash
usermod -aG sudo prmsuser
```
*This gives the user admin powers*

**⌨️ SWITCH TO THE NEW USER:**
```bash
su - prmsuser
```

**✅ SUCCESS:** Your prompt changes to `prmsuser@server:~$`

---

## 2. Install Required Software

Now you'll install Apache (web server), PHP, MySQL (database), Node.js, and Python.

### Step 2.1: Install Apache Web Server

**📍 WHERE:** In your VPS terminal (logged in as prmsuser)

**⌨️ TYPE THIS:**
```bash
sudo apt install -y apache2
```
⏳ *Takes 1-2 minutes*

**📝 NOTE:** If asked for password, enter your prmsuser password

**⌨️ ENABLE REQUIRED MODULES:**
```bash
sudo a2enmod rewrite
```
```bash
sudo a2enmod headers
```
```bash
sudo a2enmod ssl
```

**⌨️ START APACHE:**
```bash
sudo systemctl start apache2
```
```bash
sudo systemctl enable apache2
```

**✅ TEST:** Open your browser and go to `http://your-vps-ip` - you should see the Apache default page

---

### Step 2.2: Install PHP 8.2 and Extensions

**📍 WHERE:** In your VPS terminal

**⌨️ STEP 1 - Add PHP Repository:**
```bash
sudo apt install -y software-properties-common
```
⏳ *Takes 1 minute*

```bash
sudo add-apt-repository ppa:ondrej/php -y
```
⏳ *Takes 30 seconds*

```bash
sudo apt update
```

**⌨️ STEP 2 - Install PHP 8.2:**
```bash
sudo apt install -y php8.2 php8.2-cli php8.2-fpm php8.2-mysql php8.2-curl php8.2-gd php8.2-mbstring php8.2-xml php8.2-xmlrpc php8.2-soap php8.2-intl php8.2-zip php8.2-bcmath php8.2-opcache
```
⏳ *Takes 3-5 minutes (this is a big install)*

**⌨️ VERIFY INSTALLATION:**
```bash
php -v
```

**✅ SUCCESS:** You should see something like `PHP 8.2.x`

---

### Step 2.3: Install MySQL 8.x Database

**📍 WHERE:** In your VPS terminal

**⌨️ INSTALL MYSQL:**
```bash
sudo apt install -y mysql-server
```
⏳ *Takes 2-3 minutes*

**⌨️ SECURE MYSQL (IMPORTANT!):**
```bash
sudo mysql_secure_installation
```

**📝 YOU'LL BE ASKED SEVERAL QUESTIONS - ANSWER LIKE THIS:**

1. **"Would you like to setup VALIDATE PASSWORD component?"**
   - Type `Y` and press Enter

2. **"Please enter 0 = LOW, 1 = MEDIUM and 2 = STRONG"**
   - Type `1` and press Enter (MEDIUM strength)

3. **"New password:"**
   - Type a strong password (e.g., `PrmsDb2024!Secure`)
   - **⚠️ WRITE THIS DOWN! You'll need it later**

4. **"Re-enter new password:"**
   - Type the same password again

5. **"Do you wish to continue with the password provided?"**
   - Type `Y` and press Enter

6. **"Remove anonymous users?"**
   - Type `Y` and press Enter

7. **"Disallow root login remotely?"**
   - Type `Y` and press Enter

8. **"Remove test database and access to it?"**
   - Type `Y` and press Enter

9. **"Reload privilege tables now?"**
   - Type `Y` and press Enter

**✅ SUCCESS:** You see "All done!"

---

### Step 2.4: Install Node.js and npm

**📍 WHERE:** In your VPS terminal

**⌨️ DOWNLOAD AND RUN NODE.JS INSTALLER:**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
```
⏳ *Takes 30 seconds*

**⌨️ INSTALL NODE.JS:**
```bash
sudo apt install -y nodejs
```
⏳ *Takes 1-2 minutes*

**⌨️ VERIFY INSTALLATION:**
```bash
node -v
```
```bash
npm -v
```

**✅ SUCCESS:** You should see version numbers (e.g., `v20.x.x` and `10.x.x`)

---

### Step 2.5: Install Python 3 and Pip

**📍 WHERE:** In your VPS terminal

**⌨️ INSTALL PYTHON:**
```bash
sudo apt install -y python3 python3-pip python3-venv
```
⏳ *Takes 1-2 minutes*

**⌨️ VERIFY INSTALLATION:**
```bash
python3 --version
```
```bash
pip3 --version
```

**✅ SUCCESS:** You should see version numbers (e.g., `Python 3.10.x` and `pip 22.x.x`)

---

## 3. Upload Your Project Files

Now you'll transfer your PRMS project from your local computer to the VPS.

### Step 3.1: Create Project Directory on VPS

**📍 WHERE:** In your VPS terminal

**⌨️ CREATE DIRECTORY:**
```bash
sudo mkdir -p /var/www/prms
```

**⌨️ GIVE YOURSELF OWNERSHIP:**
```bash
sudo chown -R prmsuser:prmsuser /var/www/prms
```

**⌨️ GO TO THE DIRECTORY:**
```bash
cd /var/www/prms
```

---

### Step 3.2: Upload Files from Your Computer

**📍 WHERE:** On your local Windows computer

**➡️ ACTION:** Open a NEW PowerShell window (keep your SSH connection open in the other window)

**⌨️ NAVIGATE TO YOUR PROJECT:**
```powershell
cd C:\laragon\www\prms
```

**⌨️ UPLOAD FILES TO VPS:** (Replace `your-vps-ip` with your actual IP)
```powershell
scp -r * prmsuser@your-vps-ip:/var/www/prms/
```

**📝 NOTE:**
- You'll be asked for your prmsuser password
- This will take 5-10 minutes depending on your internet speed
- You'll see many files being copied

**✅ SUCCESS:** The upload completes without errors

**⌨️ VERIFY FILES WERE UPLOADED:**

Switch back to your VPS terminal and type:
```bash
ls -la /var/www/prms
```

**✅ YOU SHOULD SEE:**
- `prms-backend/`
- `prms-frontend/`
- `forecasting/`
- `prms_db.sql`
- Other project files

---

## 4. Setup MySQL Database

Now you'll create the database and import your schema.

### Step 4.1: Create Database and User

**📍 WHERE:** In your VPS terminal

**⌨️ LOGIN TO MYSQL:**
```bash
sudo mysql -u root -p
```
*Enter the MySQL root password you created in Step 2.3*

**📝 YOUR PROMPT CHANGES TO:** `mysql>`

---

**⌨️ NOW TYPE THESE SQL COMMANDS ONE BY ONE:**

**Create the database:**
```sql
CREATE DATABASE prms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```
✅ *You should see: `Query OK, 1 row affected`*

**Create a database user:** (Replace `YourSecurePassword123!` with your own strong password)
```sql
CREATE USER 'prms_user'@'localhost' IDENTIFIED BY 'YourSecurePassword123!';
```
⚠️ **WRITE DOWN THIS PASSWORD! You'll need it in the next section**

✅ *You should see: `Query OK, 0 rows affected`*

**Give the user permissions:**
```sql
GRANT ALL PRIVILEGES ON prms_db.* TO 'prms_user'@'localhost';
```
✅ *You should see: `Query OK, 0 rows affected`*

**Apply the permissions:**
```sql
FLUSH PRIVILEGES;
```
✅ *You should see: `Query OK, 0 rows affected`*

**Exit MySQL:**
```sql
EXIT;
```

**📝 YOUR PROMPT CHANGES BACK TO:** `prmsuser@server:~$`

---

### Step 4.2: Import Your Database Schema

**📍 WHERE:** In your VPS terminal

**⌨️ GO TO PROJECT DIRECTORY:**
```bash
cd /var/www/prms
```

**⌨️ IMPORT THE SQL FILE:**
```bash
mysql -u prms_user -p prms_db < prms_db.sql
```

**📝 WHEN ASKED:**
- Enter the password you created for `prms_user` (from Step 4.1)

⏳ *This takes 30-60 seconds*

**✅ SUCCESS:** No errors appear, and you're back at the command prompt

**⌨️ VERIFY THE IMPORT:**
```bash
mysql -u prms_user -p prms_db -e "SHOW TABLES;"
```

**✅ YOU SHOULD SEE A LIST OF TABLES** including:
- `users`
- `patients`
- `diseases`
- `disease_cases`
- `medical_records`
- And more...

---

## 5. Configure Backend

Now you'll set up the PHP backend configuration.

### Step 5.1: Create config.php File

**📍 WHERE:** In your VPS terminal

**⌨️ GO TO BACKEND DIRECTORY:**
```bash
cd /var/www/prms/prms-backend
```

**⌨️ CHECK IF config.example.php EXISTS:**
```bash
ls -la config.example.php
```

✅ *You should see the file listed*

**⌨️ COPY IT TO config.php:**
```bash
cp config.example.php config.php
```

---

### Step 5.2: Edit Database Credentials

**⌨️ OPEN THE FILE IN NANO EDITOR:**
```bash
nano config.php
```

**📝 YOU'LL SEE:** The file opens in a text editor

**➡️ ACTION:** Use arrow keys to navigate to the lines that need to be changed

**🔍 FIND THIS SECTION:**
```php
$dbpass   = 'your_password';       // Database password
```

**✏️ CHANGE IT TO:** (Use the password you created in Step 4.1)
```php
$dbpass   = 'YourSecurePassword123!';       // Database password
```

**⚠️ IMPORTANT:** Make sure these values are correct:
- `$host = 'localhost';` ✓ (don't change)
- `$dbuser = 'prms_user';` ✓ (don't change)
- `$dbpass = 'YourSecurePassword123!';` ← **CHANGE THIS to your actual password**
- `$dbname = 'prms_db';` ✓ (don't change)

**⌨️ SAVE AND EXIT:**
1. Press `Ctrl + O` (that's letter O, not zero)
2. Press `Enter` to confirm
3. Press `Ctrl + X` to exit

**✅ SUCCESS:** You're back at the command prompt

---

### Step 5.3: Set Proper File Permissions

**📍 WHERE:** In your VPS terminal

**⌨️ SET OWNERSHIP TO WEB SERVER:**
```bash
sudo chown -R www-data:www-data /var/www/prms
```
⏳ *Takes a few seconds*

**⌨️ SET DIRECTORY PERMISSIONS:**
```bash
sudo find /var/www/prms -type d -exec chmod 755 {} \;
```
⏳ *Takes 10-20 seconds*

**⌨️ SET FILE PERMISSIONS:**
```bash
sudo find /var/www/prms -type f -exec chmod 644 {} \;
```
⏳ *Takes 10-20 seconds*

**⌨️ SET WRITE PERMISSIONS FOR UPLOAD/LOG DIRECTORIES:**
```bash
sudo chmod -R 775 /var/www/prms/prms-backend/uploads
```
```bash
sudo chmod -R 775 /var/www/prms/prms-backend/logs
```
```bash
sudo chmod -R 775 /var/www/prms/forecasting/cache
```

**📝 NOTE:** These folders need write permissions so PHP can save uploaded files and logs

**✅ SUCCESS:** All commands complete without errors

---

## 6. Build and Deploy Frontend

Now you'll build the React frontend for production.

### Step 6.1: Create Environment File

**📍 WHERE:** In your VPS terminal

**⌨️ GO TO FRONTEND DIRECTORY:**
```bash
cd /var/www/prms/prms-frontend
```

**⌨️ CHECK IF .env.example EXISTS:**
```bash
ls -la .env.example
```

**IF THE FILE EXISTS:**
```bash
cp .env.example .env
```

**IF THE FILE DOESN'T EXIST, CREATE IT:**
```bash
nano .env
```

**✏️ TYPE THIS IN THE FILE:** (Replace `yourdomain.com` with your actual domain, or use your VPS IP if you don't have a domain yet)

**If you have a domain:**
```env
VITE_API_BASE_URL=https://yourdomain.com/prms-backend
VITE_STAFF_API_BASE_URL=https://yourdomain.com/prms-backend/api/staff
```

**If you DON'T have a domain yet (use IP):**
```env
VITE_API_BASE_URL=http://your-vps-ip/prms-backend
VITE_STAFF_API_BASE_URL=http://your-vps-ip/prms-backend/api/staff
```

**⌨️ SAVE AND EXIT:**
1. Press `Ctrl + O`
2. Press `Enter`
3. Press `Ctrl + X`

---

### Step 6.2: Install Dependencies and Build

**📍 WHERE:** In your VPS terminal (in `/var/www/prms/prms-frontend`)

**⌨️ INSTALL NPM PACKAGES:**
```bash
npm install
```
⏳ *Takes 5-10 minutes (this installs all React dependencies)*

**📝 NOTE:** You may see some warnings - this is normal

**⌨️ BUILD FOR PRODUCTION:**
```bash
npm run build
```
⏳ *Takes 2-3 minutes*

**✅ SUCCESS:** You see a message like:
```
✓ built in 45.32s
dist/index.html                   1.23 kB
dist/assets/index-abc123.js      567.89 kB
```

**⌨️ VERIFY THE BUILD:**
```bash
ls -la dist
```

**✅ YOU SHOULD SEE:**
- `index.html`
- `assets/` folder
- Other build files

---

## 7. Configure Web Server

Now you'll set up Apache to serve your application.

### Step 7.1: Create Apache Configuration File

**📍 WHERE:** In your VPS terminal

**⌨️ CREATE NEW CONFIGURATION FILE:**
```bash
sudo nano /etc/apache2/sites-available/prms.conf
```

**📝 YOU'LL SEE:** An empty text editor

**✏️ COPY AND PASTE THIS ENTIRE CONFIGURATION:**
(Replace `yourdomain.com` with your actual domain, or use your VPS IP if you don't have a domain)

**If you have a domain:**
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

**If you DON'T have a domain (use IP only):**
```apache
<VirtualHost *:80>
    ServerName your-vps-ip
    
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

**⌨️ SAVE AND EXIT:**
1. Press `Ctrl + O`
2. Press `Enter`
3. Press `Ctrl + X`

---

### Step 7.2: Enable Required Apache Modules

**📍 WHERE:** In your VPS terminal

**⌨️ ENABLE PROXY MODULES FOR PHP:**
```bash
sudo a2enmod proxy_fcgi setenvif
```

**⌨️ ENABLE PHP-FPM CONFIGURATION:**
```bash
sudo a2enconf php8.2-fpm
```

**⌨️ ENABLE YOUR NEW SITE:**
```bash
sudo a2ensite prms.conf
```

**⌨️ DISABLE THE DEFAULT APACHE SITE:**
```bash
sudo a2dissite 000-default.conf
```

**⌨️ TEST APACHE CONFIGURATION:**
```bash
sudo apache2ctl configtest
```

**✅ YOU SHOULD SEE:** 
- `Syntax OK` (or warnings you can ignore about ServerName)

**⌨️ RESTART APACHE:**
```bash
sudo systemctl restart apache2
```

**✅ SUCCESS:** Apache restarts without errors

---

### Step 7.3: Configure PHP Settings

**📍 WHERE:** In your VPS terminal

**⌨️ OPEN PHP CONFIGURATION FILE:**
```bash
sudo nano /etc/php/8.2/fpm/php.ini
```

**📝 NOTE:** This is a LONG file with thousands of lines

**🔍 FIND AND CHANGE THESE SETTINGS:**

**Method 1: Use Ctrl+W to search**
1. Press `Ctrl + W`
2. Type `upload_max_filesize` and press Enter
3. Change the line to: `upload_max_filesize = 10M`

**Do the same for these settings:**

- `upload_max_filesize = 10M` (search for "upload_max_filesize")
- `post_max_size = 10M` (search for "post_max_size")
- `max_execution_time = 300` (search for "max_execution_time")
- `max_input_time = 300` (search for "max_input_time")
- `memory_limit = 256M` (search for "memory_limit")
- `date.timezone = Asia/Manila` (search for "date.timezone", remove the `;` at the start if there is one)

**⌨️ SAVE AND EXIT:**
1. Press `Ctrl + O`
2. Press `Enter`
3. Press `Ctrl + X`

**⌨️ RESTART PHP-FPM:**
```bash
sudo systemctl restart php8.2-fpm
```

**✅ SUCCESS:** PHP-FPM restarts without errors

---

### Step 7.4: Test Your Application

**📍 WHERE:** In your web browser

**➡️ ACTION:** Open your browser and go to:
- If you have a domain: `http://yourdomain.com`
- If using IP: `http://your-vps-ip`

**✅ SUCCESS:** You should see the PRMS login page!

**❌ IF YOU SEE AN ERROR:** Don't worry, check the [Troubleshooting](#13-troubleshooting) section at the end

---

## 8. Setup Python Forecasting

Now you'll set up the Python environment for disease forecasting.

### Step 8.1: Create Python Virtual Environment

**📍 WHERE:** In your VPS terminal

**⌨️ GO TO FORECASTING DIRECTORY:**
```bash
cd /var/www/prms/forecasting
```

**⌨️ CREATE VIRTUAL ENVIRONMENT:**
```bash
python3 -m venv venv
```
⏳ *Takes 30 seconds*

**✅ SUCCESS:** You see a new `venv/` folder appear

**⌨️ ACTIVATE THE VIRTUAL ENVIRONMENT:**
```bash
source venv/bin/activate
```

**📝 YOU'LL NOTICE:** Your prompt changes to show `(venv)` at the beginning

**⌨️ INSTALL PYTHON PACKAGES:**
```bash
pip install -r requirements.txt
```
⏳ *Takes 5-10 minutes (downloads numpy, pandas, statsmodels, etc.)*

**📝 NOTE:** You may see some warnings about pip version - this is normal

**✅ SUCCESS:** You see "Successfully installed..." messages

**⌨️ DEACTIVATE THE VIRTUAL ENVIRONMENT:**
```bash
deactivate
```

**📝 YOU'LL NOTICE:** The `(venv)` disappears from your prompt

---

### Step 8.2: Test Forecasting Script (Optional)

**📍 WHERE:** In your VPS terminal

**⌨️ ACTIVATE VIRTUAL ENVIRONMENT AND RUN TEST:**
```bash
cd /var/www/prms/forecasting
source venv/bin/activate
python3 forecast_arima.py
```
⏳ *Takes 1-2 minutes*

**✅ SUCCESS:** Script runs and creates forecast files

**⌨️ DEACTIVATE:**
```bash
deactivate
```

**📝 NOTE:** If this fails with "not enough data", that's okay - it just means you need more disease records in the database

---

## 9. Configure Automated Tasks

Now you'll set up cron jobs to run tasks automatically.

### Step 9.1: Create Log Directory First

**📍 WHERE:** In your VPS terminal

**⌨️ CREATE LOGS DIRECTORY:**
```bash
mkdir -p /var/www/prms/prms-backend/logs
```

**⌨️ SET PERMISSIONS:**
```bash
sudo chown -R www-data:www-data /var/www/prms/prms-backend/logs
```
```bash
sudo chmod -R 775 /var/www/prms/prms-backend/logs
```

---

### Step 9.2: Setup Cron Jobs

**📍 WHERE:** In your VPS terminal

**⌨️ OPEN CRONTAB EDITOR:**
```bash
crontab -e
```

**📝 IF ASKED "Select an editor":**
- Choose `1` for nano (easiest)
- Press Enter

**📝 YOU'LL SEE:** A file that may be empty or have some comments

**➡️ ACTION:** Scroll to the bottom of the file

**✏️ COPY AND PASTE THESE LINES AT THE BOTTOM:**

```cron
# PRMS Automated Tasks

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

**📝 WHAT THESE DO:**
- **Daily at 1 AM:** Updates disease statistics
- **Monday at 2 AM:** Generates forecast predictions
- **Monday at 3 AM:** Updates forecast data in database
- **Daily at 8 AM:** Creates notification alerts
- **Sunday at 3 AM:** Deletes old log files (older than 30 days)

**⌨️ SAVE AND EXIT:**
1. Press `Ctrl + O`
2. Press `Enter`
3. Press `Ctrl + X`

**✅ SUCCESS:** You see "crontab: installing new crontab"

**⌨️ VERIFY CRON JOBS:**
```bash
crontab -l
```

**✅ YOU SHOULD SEE:** Your cron jobs listed

---

## 10. Setup SSL Certificate (HTTPS)

**📝 IMPORTANT:** This step only works if you have a domain name. Skip this section if you're using IP only.

### Step 10.1: Install Certbot

**📍 WHERE:** In your VPS terminal

**⌨️ INSTALL CERTBOT:**
```bash
sudo apt install -y certbot python3-certbot-apache
```
⏳ *Takes 1-2 minutes*

**✅ SUCCESS:** Certbot is installed

---

### Step 10.2: Obtain SSL Certificate

**⚠️ BEFORE RUNNING THIS:**
- Make sure your domain's DNS is pointing to your VPS IP
- Wait 15-30 minutes after updating DNS

**📍 WHERE:** In your VPS terminal

**⌨️ GET SSL CERTIFICATE:** (Replace with your actual domain)
```bash
sudo certbot --apache -d yourdomain.com -d www.yourdomain.com
```

**📝 YOU'LL BE ASKED SEVERAL QUESTIONS:**

1. **"Enter email address":**
   - Type your email address (used for renewal reminders)

2. **"Please read the Terms of Service":**
   - Type `Y` and press Enter

3. **"Would you be willing to share your email address":**
   - Type `N` and press Enter (optional)

4. **"Please choose whether or not to redirect HTTP traffic to HTTPS":**
   - Type `2` and press Enter (redirects all traffic to HTTPS - recommended)

⏳ *Takes 30 seconds to 1 minute*

**✅ SUCCESS:** You see "Congratulations! You have successfully enabled HTTPS..."

---

### Step 10.3: Test Auto-Renewal

**📍 WHERE:** In your VPS terminal

**⌨️ TEST CERTIFICATE RENEWAL:**
```bash
sudo certbot renew --dry-run
```
⏳ *Takes 30 seconds*

**✅ SUCCESS:** You see "Congratulations, all simulated renewals succeeded"

**📝 NOTE:** Your SSL certificate will automatically renew every 90 days. You don't need to do anything!

**➡️ NOW TEST YOUR SITE:**
- Open browser and go to `https://yourdomain.com` (with HTTPS!)
- You should see the secure padlock icon 🔒

---

## 11. Security Hardening

Now you'll secure your server against common attacks.

### Step 11.1: Configure Firewall (UFW)

**📍 WHERE:** In your VPS terminal

**⌨️ INSTALL UFW FIREWALL:**
```bash
sudo apt install -y ufw
```

**⚠️ CRITICAL - DO THIS FIRST:**
Allow SSH before enabling the firewall, or you'll lock yourself out!

**⌨️ ALLOW SSH:**
```bash
sudo ufw allow 22/tcp
```
**✅ YOU SHOULD SEE:** "Rules updated"

**⌨️ ALLOW HTTP:**
```bash
sudo ufw allow 80/tcp
```

**⌨️ ALLOW HTTPS:**
```bash
sudo ufw allow 443/tcp
```

**⌨️ ENABLE FIREWALL:**
```bash
sudo ufw enable
```

**📝 WHEN ASKED:** "Command may disrupt existing ssh connections. Proceed with operation (y|n)?"
- Type `y` and press Enter

**✅ SUCCESS:** "Firewall is active and enabled on system startup"

**⌨️ CHECK FIREWALL STATUS:**
```bash
sudo ufw status
```

**✅ YOU SHOULD SEE:**
```
Status: active

To                         Action      From
--                         ------      ----
22/tcp                     ALLOW       Anywhere
80/tcp                     ALLOW       Anywhere
443/tcp                    ALLOW       Anywhere
```

---

### Step 11.2: Secure MySQL

**📍 WHERE:** In your VPS terminal

**⌨️ OPEN MYSQL CONFIGURATION:**
```bash
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
```

**🔍 FIND THE `[mysqld]` SECTION:**
- Use `Ctrl + W` to search for `[mysqld]`

**✏️ ADD THESE LINES UNDER `[mysqld]`:**
```ini
bind-address = 127.0.0.1
local-infile = 0
```

**📝 WHAT THIS DOES:**
- `bind-address = 127.0.0.1` - Only allows local connections to MySQL (no external access)
- `local-infile = 0` - Prevents loading local files (security best practice)

**⌨️ SAVE AND EXIT:**
1. Press `Ctrl + O`
2. Press `Enter`
3. Press `Ctrl + X`

**⌨️ RESTART MYSQL:**
```bash
sudo systemctl restart mysql
```

**✅ SUCCESS:** MySQL restarts without errors

---

### Step 11.3: Protect Sensitive Files

**📍 WHERE:** In your VPS terminal

**⌨️ PROTECT config.php:**
```bash
sudo chmod 640 /var/www/prms/prms-backend/config.php
```
```bash
sudo chown www-data:www-data /var/www/prms/prms-backend/config.php
```

**⌨️ CREATE .htaccess FILE:**
```bash
sudo nano /var/www/prms/prms-backend/.htaccess
```

**✏️ PASTE THIS CONTENT:**
```apache
# Deny access to config files
<Files "config.php">
    Require all denied
</Files>

# Deny access to SQL files
<FilesMatch "\.(sql)$">
    Require all denied
</FilesMatch>

# Deny access to log files
<FilesMatch "\.(log)$">
    Require all denied
</FilesMatch>
```

**⌨️ SAVE AND EXIT:**
1. Press `Ctrl + O`
2. Press `Enter`
3. Press `Ctrl + X`

**📝 NOTE:** Directory listing is already disabled in your Apache config with `Options -Indexes`

---

### Step 11.4: Setup Fail2Ban (Prevents Brute Force Attacks)

**📍 WHERE:** In your VPS terminal

**⌨️ INSTALL FAIL2BAN:**
```bash
sudo apt install -y fail2ban
```
⏳ *Takes 1 minute*

**⌨️ CREATE LOCAL CONFIGURATION:**
```bash
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
```

**⌨️ EDIT CONFIGURATION:**
```bash
sudo nano /etc/fail2ban/jail.local
```

**🔍 FIND THE `[sshd]` SECTION:**
- Press `Ctrl + W`
- Type `[sshd]` and press Enter

**✏️ MAKE SURE THESE SETTINGS ARE SET:**
```ini
[sshd]
enabled = true
port = ssh
logpath = %(sshd_log)s
maxretry = 3
bantime = 3600
```

**📝 WHAT THIS DOES:**
- Bans IPs that fail SSH login 3 times
- Ban lasts for 3600 seconds (1 hour)

**⌨️ SAVE AND EXIT:**
1. Press `Ctrl + O`
2. Press `Enter`
3. Press `Ctrl + X`

**⌨️ START FAIL2BAN:**
```bash
sudo systemctl start fail2ban
```
```bash
sudo systemctl enable fail2ban
```

**⌨️ CHECK STATUS:**
```bash
sudo fail2ban-client status sshd
```

**✅ YOU SHOULD SEE:** Status information showing "Currently banned: 0"

---

## 12. Final Testing

Let's make sure everything is working correctly.

### Step 12.1: Test Website Access

**📍 WHERE:** In your web browser

**➡️ ACTION:** Go to your website:
- If you have a domain with SSL: `https://yourdomain.com`
- If you have a domain without SSL: `http://yourdomain.com`
- If using IP only: `http://your-vps-ip`

**✅ YOU SHOULD SEE:** The PRMS login page

---

### Step 12.2: Test Login

**➡️ ACTION:** Try logging in with the default admin account

**📝 DEFAULT CREDENTIALS:** (Check your database or initial setup)
- Usually: `admin@prms.com` / password from your database

**✅ SUCCESS:** You can log in and see the dashboard

---

### Step 12.3: Test Backend API

**📍 WHERE:** In your web browser

**➡️ ACTION:** Open your browser and go to:
- `http://your-domain-or-ip/prms-backend/get_diseases.php`

**✅ YOU SHOULD SEE:** JSON data showing disease records

**❌ IF YOU SEE:** "Database connection error" - check your config.php credentials

---

### Step 12.4: Check System Services

**📍 WHERE:** In your VPS terminal

**⌨️ CHECK APACHE:**
```bash
sudo systemctl status apache2
```
**✅ SHOULD SEE:** "active (running)" in green

**⌨️ CHECK PHP-FPM:**
```bash
sudo systemctl status php8.2-fpm
```
**✅ SHOULD SEE:** "active (running)" in green

**⌨️ CHECK MYSQL:**
```bash
sudo systemctl status mysql
```
**✅ SHOULD SEE:** "active (running)" in green

---

### Step 12.5: Check Disk Space and Memory

**⌨️ CHECK DISK SPACE:**
```bash
df -h
```
**✅ GOOD:** If `/` (root) has at least 20% free

**⌨️ CHECK MEMORY:**
```bash
free -m
```
**✅ GOOD:** If you have some free memory available

---

## 13. Troubleshooting

Having issues? Here's how to fix common problems.

### Problem 1: "Can't Access Website" (Shows Nothing)

**📍 WHERE:** In your VPS terminal

**⌨️ CHECK IF APACHE IS RUNNING:**
```bash
sudo systemctl status apache2
```

**IF NOT RUNNING:**
```bash
sudo systemctl start apache2
```

**⌨️ CHECK APACHE LOGS:**
```bash
sudo tail -n 50 /var/log/apache2/prms_error.log
```

**⌨️ CHECK APACHE CONFIGURATION:**
```bash
sudo apache2ctl configtest
```

**IF YOU SEE ERRORS:** Fix the issues mentioned, then:
```bash
sudo systemctl restart apache2
```

---

### Problem 2: "PHP Files Download Instead of Running"

**📍 WHERE:** In your VPS terminal

**⌨️ CHECK PHP-FPM STATUS:**
```bash
sudo systemctl status php8.2-fpm
```

**IF NOT RUNNING:**
```bash
sudo systemctl start php8.2-fpm
```

**⌨️ RESTART BOTH SERVICES:**
```bash
sudo systemctl restart php8.2-fpm
sudo systemctl restart apache2
```

---

### Problem 3: "Database Connection Error"

**📍 WHERE:** In your VPS terminal

**⌨️ TEST MYSQL LOGIN:**
```bash
mysql -u prms_user -p prms_db
```
*Enter your prms_user password*

**IF LOGIN FAILS:**
- Your password in config.php is wrong
- Edit it again:
```bash
nano /var/www/prms/prms-backend/config.php
```

**⌨️ CHECK IF MYSQL IS RUNNING:**
```bash
sudo systemctl status mysql
```

**IF NOT RUNNING:**
```bash
sudo systemctl start mysql
```

---

### Problem 4: "Permission Denied" or "Can't Upload Files"

**📍 WHERE:** In your VPS terminal

**⌨️ FIX FILE PERMISSIONS:**
```bash
sudo chown -R www-data:www-data /var/www/prms
```
```bash
sudo find /var/www/prms -type d -exec chmod 755 {} \;
```
```bash
sudo find /var/www/prms -type f -exec chmod 644 {} \;
```
```bash
sudo chmod -R 775 /var/www/prms/prms-backend/uploads
```
```bash
sudo chmod -R 775 /var/www/prms/prms-backend/logs
```
```bash
sudo chmod -R 775 /var/www/prms/forecasting/cache
```

---

### Problem 5: "404 Not Found" on Frontend Pages

**📍 WHERE:** In your VPS terminal

**⌨️ ENABLE REWRITE MODULE:**
```bash
sudo a2enmod rewrite
```
```bash
sudo systemctl restart apache2
```

**⌨️ CHECK IF dist FOLDER EXISTS:**
```bash
ls -la /var/www/prms/prms-frontend/dist
```

**IF FOLDER DOESN'T EXIST:**
```bash
cd /var/www/prms/prms-frontend
npm run build
```

---

### Problem 6: "Python Forecasting Script Fails"

**📍 WHERE:** In your VPS terminal

**⌨️ CHECK IF VIRTUAL ENVIRONMENT EXISTS:**
```bash
ls -la /var/www/prms/forecasting/venv
```

**IF IT DOESN'T EXIST:**
```bash
cd /var/www/prms/forecasting
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
deactivate
```

**⌨️ CHECK CRON LOGS:**
```bash
tail -f /var/www/prms/prms-backend/logs/forecast.log
```

**⌨️ TEST MANUALLY:**
```bash
cd /var/www/prms/forecasting
source venv/bin/activate
python3 forecast_arima.py
deactivate
```

---

### Problem 7: "CORS Error" - Frontend Can't Connect to Backend

**📍 WHERE:** In your VPS terminal

**⌨️ OPEN CORS CONFIGURATION:**
```bash
nano /var/www/prms/prms-backend/cors.php
```

**📝 IF YOU HAVE A DOMAIN:** Make sure it matches:
```php
header("Access-Control-Allow-Origin: https://yourdomain.com");
```

**📝 IF USING IP:** Change to:
```php
header("Access-Control-Allow-Origin: http://your-vps-ip");
```

**⌨️ SAVE AND EXIT:** (Ctrl+O, Enter, Ctrl+X)

---

### Problem 8: "SSL Certificate Failed"

**⚠️ COMMON REASONS:**
- Your domain DNS isn't pointing to your VPS IP yet
- You haven't waited 15-30 minutes after updating DNS
- Firewall is blocking port 80

**⌨️ CHECK DNS:**
```bash
ping yourdomain.com
```
**✅ SHOULD SHOW:** Your VPS IP address

**⌨️ CHECK IF PORT 80 IS OPEN:**
```bash
sudo ufw status
```

**IF PORT 80 ISN'T ALLOWED:**
```bash
sudo ufw allow 80/tcp
```

**⌨️ TRY AGAIN:**
```bash
sudo certbot --apache -d yourdomain.com -d www.yourdomain.com
```

---

### Useful Diagnostic Commands

**⌨️ CHECK ALL SERVICE STATUS:**
```bash
sudo systemctl status apache2
sudo systemctl status php8.2-fpm
sudo systemctl status mysql
```

**⌨️ VIEW REAL-TIME APACHE ERRORS:**
```bash
sudo tail -f /var/log/apache2/prms_error.log
```

**⌨️ VIEW REAL-TIME APACHE ACCESS:**
```bash
sudo tail -f /var/log/apache2/prms_access.log
```

**⌨️ CHECK DISK SPACE:**
```bash
df -h
```

**⌨️ CHECK MEMORY USAGE:**
```bash
free -m
```

**⌨️ CHECK RUNNING PROCESSES:**
```bash
htop
```
*Press Q to exit*

**⌨️ CHECK WHICH PORTS ARE OPEN:**
```bash
sudo netstat -tlnp
```

---

## 14. Post-Deployment Checklist

**📋 VERIFY YOU'VE COMPLETED ALL THESE STEPS:**

### Server Setup
- [ ] Connected to VPS via SSH
- [ ] Created non-root user (prmsuser)
- [ ] Apache installed and running
- [ ] PHP 8.2 installed and configured
- [ ] MySQL 8.x installed and secured
- [ ] Node.js and npm installed
- [ ] Python 3 and pip installed

### Database
- [ ] Database `prms_db` created
- [ ] Database user `prms_user` created
- [ ] SQL file imported successfully
- [ ] Tables exist in database

### Backend
- [ ] Project files uploaded to `/var/www/prms`
- [ ] `config.php` created with correct credentials
- [ ] File permissions set correctly
- [ ] Backend API accessible (test with get_diseases.php)

### Frontend
- [ ] `.env` file created with correct API URLs
- [ ] npm dependencies installed
- [ ] Production build completed
- [ ] `dist/` folder exists

### Web Server
- [ ] Apache virtual host configured
- [ ] Site enabled and default site disabled
- [ ] PHP settings configured (upload size, timezone, etc.)
- [ ] Website accessible in browser

### Python & Automation
- [ ] Python virtual environment created
- [ ] Python packages installed from requirements.txt
- [ ] Forecasting script tested (optional)
- [ ] Cron jobs configured
- [ ] Log directory created

### Security
- [ ] SSL certificate installed (if using domain)
- [ ] Firewall (UFW) enabled with correct ports
- [ ] MySQL secured (bind-address set)
- [ ] Sensitive files protected (.htaccess)
- [ ] Fail2Ban installed and running

### Testing
- [ ] Website loads in browser
- [ ] Can login to system
- [ ] Backend API returns data
- [ ] All services running (Apache, PHP, MySQL)
- [ ] No permission errors

---

## 15. Automated Database Backups

Set up automatic database backups to protect your data.

### Step 15.1: Create Backup Script

**📍 WHERE:** In your VPS terminal

**⌨️ CREATE BACKUP SCRIPT:**
```bash
sudo nano /usr/local/bin/backup-prms.sh
```

**✏️ PASTE THIS SCRIPT:**
(Replace `your_password` with your actual prms_user password)

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

echo "Backup completed at $(date)" >> $BACKUP_DIR/backup.log
```

**⌨️ SAVE AND EXIT:** (Ctrl+O, Enter, Ctrl+X)

**⌨️ MAKE IT EXECUTABLE:**
```bash
sudo chmod +x /usr/local/bin/backup-prms.sh
```

---

### Step 15.2: Schedule Daily Backups

**⌨️ OPEN CRONTAB:**
```bash
crontab -e
```

**✏️ ADD THIS LINE AT THE BOTTOM:**
```cron
# Daily database backup at 4:00 AM
0 4 * * * /usr/local/bin/backup-prms.sh
```

**⌨️ SAVE AND EXIT:** (Ctrl+O, Enter, Ctrl+X)

**⌨️ TEST THE BACKUP SCRIPT:**
```bash
sudo /usr/local/bin/backup-prms.sh
```

**⌨️ VERIFY BACKUP WAS CREATED:**
```bash
ls -lh /var/backups/prms
```

**✅ YOU SHOULD SEE:** SQL and tar.gz backup files

---

## 16. Performance Optimization

### Step 16.1: Enable PHP OPcache

**📍 WHERE:** In your VPS terminal

**⌨️ OPEN PHP CONFIGURATION:**
```bash
sudo nano /etc/php/8.2/fpm/php.ini
```

**🔍 SEARCH FOR `[opcache]`:**
- Press `Ctrl + W`
- Type `[opcache]` and press Enter

**✏️ ADD OR UPDATE THESE SETTINGS:**
```ini
[opcache]
opcache.enable=1
opcache.memory_consumption=128
opcache.interned_strings_buffer=8
opcache.max_accelerated_files=4000
opcache.revalidate_freq=60
opcache.fast_shutdown=1
```

**⌨️ SAVE AND EXIT:** (Ctrl+O, Enter, Ctrl+X)

**⌨️ RESTART PHP-FPM:**
```bash
sudo systemctl restart php8.2-fpm
```

**📝 WHAT THIS DOES:** Speeds up PHP by caching compiled code

---

## 17. Domain Setup (If You Have a Domain)

### Step 17.1: Point Your Domain to VPS

**📍 WHERE:** In your domain registrar's control panel (e.g., Namecheap, GoDaddy, Hostinger)

**➡️ ACTION:** Add DNS records:

1. **A Record for root domain:**
   - Type: `A`
   - Host: `@` (or leave blank)
   - Value: `Your VPS IP address`
   - TTL: `3600` (or Auto)

2. **A Record for www subdomain:**
   - Type: `A`
   - Host: `www`
   - Value: `Your VPS IP address`
   - TTL: `3600` (or Auto)

**⏳ WAIT:** 15-30 minutes for DNS propagation

**⌨️ TEST DNS FROM YOUR VPS:**
```bash
ping yourdomain.com
```
**✅ SHOULD SHOW:** Your VPS IP address

---

## 18. Regular Maintenance

### Weekly Tasks

**⌨️ CHECK DISK SPACE:**
```bash
df -h
```
**⚠️ IF BELOW 20% FREE:** Clean up old logs or backups

**⌨️ CHECK ERROR LOGS:**
```bash
sudo tail -n 50 /var/log/apache2/prms_error.log
```

**⌨️ VERIFY BACKUPS:**
```bash
ls -lh /var/backups/prms
```

---

### Monthly Tasks

**⌨️ UPDATE SYSTEM PACKAGES:**
```bash
sudo apt update
sudo apt upgrade -y
```

**⌨️ RESTART SERVICES:**
```bash
sudo systemctl restart apache2
sudo systemctl restart php8.2-fpm
sudo systemctl restart mysql
```

**⌨️ CHECK SECURITY:**
```bash
sudo fail2ban-client status sshd
```

---

### As Needed

**⌨️ MONITOR APACHE ERRORS:**
```bash
sudo tail -f /var/log/apache2/prms_error.log
```

**⌨️ CHECK MYSQL PERFORMANCE:**
```bash
mysql -u prms_user -p -e "SHOW PROCESSLIST;"
```

**⌨️ CLEAR OLD LOGS:**
```bash
find /var/www/prms/prms-backend/logs -name "*.log" -mtime +30 -delete
```

---

## 19. Estimated Costs

### Monthly Costs
- **Hostinger VPS**: ₱400-500/month
- **Domain Name**: ₱40-70/month (₱500-800/year)
- **SSL Certificate**: FREE (Let's Encrypt)

**💰 TOTAL: ~₱450-570 per month**

### One-Time Costs
- Initial domain registration: ₱500-800
- VPS setup: FREE (DIY)

---

## 20. Additional Resources

### Documentation
- **Hostinger VPS Tutorials:** https://www.hostinger.ph/tutorials/vps
- **Let's Encrypt (SSL):** https://letsencrypt.org/
- **Apache Docs:** https://httpd.apache.org/docs/
- **PHP Manual:** https://www.php.net/docs.php
- **MySQL Docs:** https://dev.mysql.com/doc/

### Community Support
- **Stack Overflow:** https://stackoverflow.com/
- **PHP Community:** https://www.php.net/support.php
- **React Community:** https://react.dev/community

---

## 🎉 Congratulations!

You've successfully deployed your PRMS application to a production server!

### What You've Accomplished:
✅ Set up a secure VPS server  
✅ Installed and configured LAMP stack (Linux, Apache, MySQL, PHP)  
✅ Deployed your React frontend and PHP backend  
✅ Set up Python forecasting with automation  
✅ Secured your server with SSL, firewall, and Fail2Ban  
✅ Configured automated backups and maintenance  

### Next Steps:
1. Share your website URL with users
2. Monitor error logs regularly
3. Keep your system updated
4. Test your backups monthly
5. Add more features to your PRMS!

---

**📧 Questions or Issues?**  
Contact your system administrator or development team.

**📅 Last Updated:** October 2025  
**📝 Version:** 2.0 - Complete Step-by-Step Guide

