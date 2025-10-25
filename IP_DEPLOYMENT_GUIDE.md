# 🌐 IP-BASED DEPLOYMENT GUIDE
## Para sa VPS IP Lang (Walang Domain)

---

## ✅ **SIMPLIFIED STEPS - Walang Domain**

Mas simple ang deployment kung IP lang ang gagamitin!

### **Ano ang Iba:**
- ❌ NO SSL/HTTPS (kasi hindi pwede sa IP addresses)
- ✅ HTTP lang ang gagamitin (port 80)
- ✅ No DNS configuration needed
- ✅ No domain registration costs
- ⚠️ Users will see "Not Secure" in browser (normal for HTTP)

---

## 📋 **STEP-BY-STEP GUIDE**

### **STEP 1: Kunin ang VPS IP Address**

After purchasing Hostinger VPS, makikita mo sa email:
```
VPS IP Address: 203.45.67.89  ← Example lang to
Root Password: *********
```

**⚠️ I-save mo somewhere ang IP address na ito!**

---

### **STEP 2: Update Frontend .env File**

**📍 Location:** `prms-frontend/.env`

**✏️ Edit the file:**
```env
# Replace YOUR-VPS-IP with your actual IP
VITE_API_BASE_URL=http://203.45.67.89/prms-backend
VITE_STAFF_API_BASE_URL=http://203.45.67.89/prms-backend/api/staff
```

**🔴 EXAMPLE:** If your VPS IP is `198.51.100.45`:
```env
VITE_API_BASE_URL=http://198.51.100.45/prms-backend
VITE_STAFF_API_BASE_URL=http://198.51.100.45/prms-backend/api/staff
```

---

### **STEP 3: Update Backend CORS Configuration**

**📍 Location:** `prms-backend/cors.php`

**Option A: Manual Edit**

Open `prms-backend/cors.php` and find this section:

```php
$productionOrigins = [
    // 🔴 UNCOMMENT AND UPDATE THESE WHEN DEPLOYING:
    // 'http://123.456.789.012',          // Your VPS IP (if no domain)
];
```

**Change it to:**
```php
$productionOrigins = [
    'http://203.45.67.89',  // ← Your actual VPS IP
];
```

**Option B: Use the IP Template**

OR copy from the ready-made template:
```bash
# Copy the IP deployment template
cp prms-backend/cors.ip-deployment.php prms-backend/cors-backup.php
```

Then edit line 18 with your actual IP.

---

### **STEP 4: Build Frontend for Production**

**📍 Location:** `prms-frontend/` folder

```powershell
# Open PowerShell in prms-frontend folder
cd C:\laragon\www\prms\prms-frontend

# Install dependencies (if not yet installed)
npm install

# Build for production
npm run build
```

**⏳ Wait 2-3 minutes...**

**✅ Success kung makikita mo:**
```
✓ built in 45.32s
dist/index.html                   1.23 kB
dist/assets/index-abc123.js      567.89 kB
```

**🔍 Verify:**
```powershell
# Check if dist folder exists
dir dist
```

You should see:
```
dist/
  - index.html
  - assets/
    - *.js files
    - *.css files
```

---

### **STEP 5: Follow Main Deployment Guide**

Now follow your **HOSTINGER_VPS_DEPLOYMENT.md** guide, pero SKIP these sections:

**❌ SKIP:**
- Section 10: Setup SSL Certificate (hindi pwede sa IP)
- DNS configuration steps
- Domain-related steps

**✅ FOLLOW ALL OTHER STEPS:**
- Section 1: Access Your Server ✅
- Section 2: Install Required Software ✅
- Section 3: Upload Your Project Files ✅
- Section 4: Setup MySQL Database ✅
- Section 5: Configure Backend ✅
- Section 6: Build and Deploy Frontend ✅ (already done!)
- Section 7: Configure Web Server ✅ (use IP config)
- Section 8: Setup Python Forecasting ✅
- Section 9: Configure Automated Tasks ✅
- Section 11: Security Hardening ✅
- Section 12: Final Testing ✅

---

## 🔧 **APACHE CONFIGURATION FOR IP**

When you reach **Section 7** of the deployment guide, use this config:

**📍 File:** `/etc/apache2/sites-available/prms.conf`

```apache
<VirtualHost *:80>
    ServerName 203.45.67.89
    
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

**🔴 IMPORTANT:** Replace `203.45.67.89` with YOUR actual VPS IP!

---

## 🧪 **TESTING YOUR DEPLOYMENT**

### **Test 1: Access Website**

1. Open browser
2. Go to: `http://YOUR-VPS-IP` (example: `http://203.45.67.89`)
3. ✅ You should see the PRMS login page

### **Test 2: Check API Connection**

1. Press **F12** in browser
2. Go to **Console** tab
3. ⚠️ You'll see "Not Secure" warning (normal for HTTP)
4. ✅ No CORS errors should appear

### **Test 3: Login**

1. Try logging in with your admin account
2. ✅ Should redirect to dashboard
3. ✅ Data should load normally

### **Test 4: Direct API Test**

Open browser and go to:
```
http://YOUR-VPS-IP/prms-backend/get_diseases.php
```

✅ Should show JSON data (disease list)

---

## ⚠️ **IMPORTANT NOTES FOR IP-BASED DEPLOYMENT**

### **1. No HTTPS/SSL**
- IP addresses cannot have SSL certificates
- Users will see "Not Secure" in browser
- This is NORMAL for IP-based deployments
- Data is still protected by backend security

### **2. Firewall Settings**
Make sure port 80 is open:
```bash
sudo ufw allow 80/tcp
```

### **3. Browser Warnings**
Users might see warnings about:
- "Not Secure" badge
- "Your connection is not private"

**This is expected!** You can ignore these for IP-based deployment.

### **4. Access URL**
Users access your system using:
```
http://YOUR-VPS-IP
```

Example: `http://203.45.67.89`

---

## 🚀 **UPGRADING TO DOMAIN LATER**

Kung magkaroon ka ng domain in the future, simple lang ang upgrade:

### **Step 1: Get a Domain**
Register from Namecheap, GoDaddy, or Hostinger

### **Step 2: Point Domain to IP**
Add A record:
```
Type: A
Host: @
Value: YOUR-VPS-IP
```

### **Step 3: Update Configuration**

**Frontend .env:**
```env
VITE_API_BASE_URL=https://yourdomain.com/prms-backend
VITE_STAFF_API_BASE_URL=https://yourdomain.com/prms-backend/api/staff
```

**Backend cors.php:**
```php
$productionOrigins = [
    'https://yourdomain.com',
    'https://www.yourdomain.com',
    'http://203.45.67.89',  // Keep IP as backup
];
```

### **Step 4: Setup SSL**
Follow Section 10 of the main deployment guide

### **Step 5: Rebuild Frontend**
```bash
npm run build
```

---

## ✅ **PRE-DEPLOYMENT CHECKLIST - IP VERSION**

Ready na ba? Check mo to:

### **Local Preparation:**
- [ ] ✅ VPS IP address noted down
- [ ] ✅ `.env` file created with VPS IP
- [ ] ✅ `cors.php` updated with VPS IP
- [ ] ✅ Frontend built (`dist/` folder exists)
- [ ] ✅ All files committed to git (optional)

### **Files to Upload:**
- [ ] ✅ `prms-backend/` (with updated cors.php)
- [ ] ✅ `prms-frontend/dist/` (built version)
- [ ] ✅ `prms-frontend/package.json`
- [ ] ✅ `forecasting/`
- [ ] ✅ `prms_db.sql`

### **During Deployment:**
- [ ] Apache configured with IP address
- [ ] Port 80 open in firewall
- [ ] Database created and imported
- [ ] File permissions set correctly

### **After Deployment:**
- [ ] Website accessible at `http://YOUR-VPS-IP`
- [ ] Login works
- [ ] API endpoints return data
- [ ] No CORS errors in console

---

## 📊 **IP vs DOMAIN COMPARISON**

| Feature | IP-Based | Domain-Based |
|---------|----------|--------------|
| SSL/HTTPS | ❌ Not available | ✅ Available |
| Cost | ✅ Free | ₱500-800/year |
| Setup Time | ✅ Faster (no DNS) | ⏱️ +30 mins (DNS propagation) |
| Professional | ⚠️ Less professional | ✅ More professional |
| Browser Warning | ⚠️ "Not Secure" | ✅ Secure padlock |
| Memorability | ❌ Hard to remember | ✅ Easy to remember |
| Access URL | `http://203.45.67.89` | `https://prms-manila.com` |

---

## 💡 **RECOMMENDATION**

**For Testing/Internal Use:**
- ✅ IP-based deployment is perfect
- ✅ Saves money and time
- ✅ Works great for staff-only systems

**For Public/Client-Facing:**
- ⚠️ Consider getting a domain
- ⚠️ SSL/HTTPS adds trust
- ⚠️ Easier to remember and share

---

**Kung may tanong ka o may problema, just follow the troubleshooting section sa main deployment guide!** 🚀

**Last Updated:** October 2025

