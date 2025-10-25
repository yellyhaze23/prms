# ✅ PRMS DEPLOYMENT READINESS - IP-BASED
## Final Checklist Before Upload

---

## 🎉 **GOOD NEWS: 95% READY!**

Na-prepare ko na lahat para sa IP-based deployment mo!

---

## ✅ **COMPLETED PREPARATIONS**

### **1. Frontend Environment File** ✅
- **File:** `prms-frontend/.env`
- **Status:** Created with IP template
- **Action Needed:** Replace `YOUR-VPS-IP` with actual IP

```
prms-frontend/.env
VITE_API_BASE_URL=http://YOUR-VPS-IP/prms-backend
VITE_STAFF_API_BASE_URL=http://YOUR-VPS-IP/prms-backend/api/staff
```

---

### **2. CORS Configuration** ✅
- **File:** `prms-backend/cors.php`
- **Status:** Updated with IP deployment instructions
- **Action Needed:** Uncomment and update IP address

**Current Line 24-26:**
```php
// OPTION 1: If using VPS IP only (no domain):
// 'http://YOUR-VPS-IP',
```

**Change to:**
```php
// OPTION 1: If using VPS IP only (no domain):
'http://203.45.67.89',  // ← Your actual VPS IP
```

---

### **3. Documentation** ✅
- **IP_DEPLOYMENT_GUIDE.md** - Complete guide for IP-based deployment
- **cors.ip-deployment.php** - Ready-to-use CORS example
- **HOSTINGER_VPS_DEPLOYMENT.md** - Full deployment guide

---

### **4. Code Structure** ✅
- Backend: Complete ✅
- Frontend: Complete ✅
- Database: Ready ✅
- Forecasting: Ready ✅

---

## ⏳ **REMAINING TASKS** (Before Upload)

### **TASK 1: Update .env with Your VPS IP** 🔴

**When:** AFTER you get your VPS IP address

**File:** `prms-frontend/.env`

**Steps:**
1. Wait for Hostinger email with VPS IP
2. Open `prms-frontend/.env`
3. Replace `YOUR-VPS-IP` with actual IP
4. Example: `http://203.45.67.89/prms-backend`
5. Save file

**Estimated Time:** 2 minutes

---

### **TASK 2: Update CORS with Your VPS IP** 🔴

**When:** Same time as Task 1

**File:** `prms-backend/cors.php`

**Steps:**
1. Open `prms-backend/cors.php`
2. Go to line 24-26
3. Uncomment the line (remove `//`)
4. Replace `YOUR-VPS-IP` with actual IP
5. Example: `'http://203.45.67.89',`
6. Save file

**Estimated Time:** 2 minutes

---

### **TASK 3: Build Frontend** 🔴

**When:** AFTER updating .env file

**Location:** `prms-frontend/` folder

**Commands:**
```powershell
cd prms-frontend
npm install
npm run build
```

**Expected Output:**
```
✓ built in 45.32s
dist/index.html                   1.23 kB
dist/assets/index-abc123.js      567.89 kB
```

**Estimated Time:** 10 minutes

---

## 📋 **DEPLOYMENT DAY CHECKLIST**

### **Before You Start:**
- [ ] VPS purchased from Hostinger
- [ ] VPS IP address received (check email)
- [ ] SSH access tested
- [ ] Local PRMS project backed up

### **Step 1: Update Local Files (2 minutes)**
- [ ] Update `prms-frontend/.env` with VPS IP
- [ ] Update `prms-backend/cors.php` with VPS IP
- [ ] Verify changes saved

### **Step 2: Build Frontend (10 minutes)**
- [ ] Run `npm install` in prms-frontend
- [ ] Run `npm run build`
- [ ] Verify `dist/` folder created
- [ ] Check `dist/index.html` exists

### **Step 3: Prepare for Upload (5 minutes)**
- [ ] Commit changes to git (optional)
- [ ] Test if `php -l prms-backend/cors.php` passes
- [ ] Verify all files are present

### **Step 4: Follow Main Deployment Guide (60-90 minutes)**
- [ ] SSH into VPS
- [ ] Install Apache, PHP, MySQL
- [ ] Upload project files
- [ ] Setup database
- [ ] Configure Apache
- [ ] Setup Python environment
- [ ] Test website

---

## 🎯 **QUICK REFERENCE**

### **Files You Need to Edit:**

| File | What to Change | Example |
|------|----------------|---------|
| `prms-frontend/.env` | `YOUR-VPS-IP` | `203.45.67.89` |
| `prms-backend/cors.php` | Line 25: Uncomment & update IP | `'http://203.45.67.89',` |

### **Commands You'll Run:**

```powershell
# 1. Build frontend
cd prms-frontend
npm install
npm run build

# 2. Test PHP syntax
cd ..\prms-backend
php -l cors.php

# 3. Upload to VPS (when ready)
scp -r * prmsuser@YOUR-VPS-IP:/var/www/prms/
```

---

## 🚀 **ACCESS AFTER DEPLOYMENT**

### **Website URL:**
```
http://YOUR-VPS-IP
```

Example: `http://203.45.67.89`

### **API Endpoint:**
```
http://YOUR-VPS-IP/prms-backend
```

Example: `http://203.45.67.89/prms-backend`

---

## ⚠️ **IMPORTANT REMINDERS**

### **1. No HTTPS with IP**
- ✅ This is NORMAL
- ✅ Browser will show "Not Secure"
- ✅ System will still work perfectly
- ⚠️ Don't worry about the warning

### **2. Firewall**
Make sure port 80 is open:
```bash
sudo ufw allow 80/tcp
```

### **3. Apache Config**
Use IP address in Apache config:
```apache
ServerName YOUR-VPS-IP
```

---

## 📞 **IF YOU NEED HELP**

### **Before Deployment:**
- Check this file again
- Review `IP_DEPLOYMENT_GUIDE.md`
- Test locally first

### **During Deployment:**
- Follow `HOSTINGER_VPS_DEPLOYMENT.md`
- Skip Section 10 (SSL - not for IP)
- Check Apache error logs if issues

### **After Deployment:**
- Test at `http://YOUR-VPS-IP`
- Check browser console for errors
- Verify API calls work

---

## 🎊 **YOU'RE ALMOST THERE!**

**Current Progress: 95%**

**Remaining:**
1. Get VPS IP address (0 minutes - wait for email)
2. Update 2 files with IP (4 minutes)
3. Build frontend (10 minutes)
4. Deploy to VPS (90 minutes)

**Total Time Left: ~2 hours**

---

**Pag ready ka na mag-deploy, just:**
1. Get your VPS IP
2. Update the 2 files
3. Build frontend
4. Follow the guide!

**Good luck!** 🚀

---

**Last Updated:** October 2025
**Status:** Ready for IP-based deployment

