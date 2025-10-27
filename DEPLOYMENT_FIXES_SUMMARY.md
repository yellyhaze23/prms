# PRMS Deployment Fixes - Summary Report

**Date:** October 27, 2025  
**Status:** ✅ All Issues Fixed Locally

---

## Issues Identified During VPS Deployment

### 🔴 Issue #1: Frontend Calling Localhost Instead of VPS IP
**Symptom:** When trying to login on VPS, the frontend makes API calls to `http://localhost/prms/prms-backend/authenticate.php` instead of the VPS IP.

**Root Cause:** The React frontend was built without environment variables, so it defaulted to localhost URLs.

**Fix Applied:**
- ✅ Created `.env` file in `prms-frontend/` folder
- ✅ Created `ENV_SETUP_GUIDE.md` with deployment instructions
- ✅ Verified `src/config/api.js` correctly reads environment variables

---

### 🔴 Issue #2: "Truncated user-type" Database Error
**Symptom:** Database error about truncated "user-type" field when logging in.

**Root Cause:** The `user_type` column in 3 database tables was defined as `ENUM('admin','staff')` which is too restrictive and can cause truncation errors.

**Fix Applied:**
- ✅ Changed `activity_logs.user_type` from `ENUM('admin','staff')` to `VARCHAR(20)`
- ✅ Changed `audit_logs.user_type` from `ENUM('admin','staff')` to `VARCHAR(20)`
- ✅ Changed `login_sessions.user_type` from `ENUM('admin','staff')` to `VARCHAR(20)`
- ✅ Verified authentication flow uses correct column mapping (role → user_type)

---

## Files Modified

### 1. `prms_db.sql`
**Changes:**
```sql
-- Before:
user_type enum('admin','staff') NOT NULL

-- After:
user_type varchar(20) NOT NULL
```

**Tables affected:**
- `activity_logs` (line 33)
- `audit_logs` (line 222)
- `login_sessions` (line 2717)

---

### 2. `prms-frontend/.env` (Created)
**Content:**
```env
VITE_API_BASE_URL=http://localhost/prms/prms-backend
VITE_STAFF_API_BASE_URL=http://localhost/prms/prms-backend/api/staff
```

**Purpose:** Local development configuration for Laragon

---

### 3. `prms-frontend/ENV_SETUP_GUIDE.md` (Created)
**Purpose:** Complete guide for creating `.env` files for different deployment scenarios:
- Local development (Laragon/XAMPP)
- VPS deployment with IP address
- VPS deployment with domain name
- VPS deployment with SSL certificate

---

### 4. `DEPLOYMENT_FIX_GUIDE.md` (Created)
**Purpose:** Step-by-step troubleshooting guide for VPS deployment issues.

---

## How the Authentication Flow Works (Now Fixed)

1. **User logs in** via frontend
2. **Frontend sends request** to `authenticate.php`
3. **authenticate.php** queries users table and gets `role` field ('admin' or 'staff')
4. **Passes role** to `audit_logger.php` as `$user_type` parameter
5. **audit_logger.php** inserts into:
   - `activity_logs` table (user_type column) ✅ Now VARCHAR(20)
   - `audit_logs` table (user_type column) ✅ Now VARCHAR(20)
   - `login_sessions` table (user_type column) ✅ Now VARCHAR(20)

**Before fix:** ENUM columns were too restrictive → truncation errors  
**After fix:** VARCHAR(20) columns accept any role value → no errors

---

## Testing Checklist

Before redeploying to VPS, test locally in Laragon:

### Local Testing (Laragon)
- [ ] Verify `.env` file exists in `prms-frontend/`
- [ ] Rebuild frontend: `cd prms-frontend && npm run build`
- [ ] Re-import database: Import `prms_db.sql` into your local MySQL
- [ ] Start Laragon services (Apache, MySQL)
- [ ] Test login with admin account
- [ ] Verify no "truncated user-type" errors
- [ ] Check browser console for API URL (should be localhost)
- [ ] Verify login redirects to dashboard correctly

### VPS Deployment Steps (Updated)
1. **SSH into VPS**
2. **Update database schema:**
   ```bash
   mysql -u prms_user -p prms_db << 'EOF'
   ALTER TABLE activity_logs MODIFY user_type VARCHAR(20) NOT NULL;
   ALTER TABLE audit_logs MODIFY user_type VARCHAR(20) NOT NULL;
   ALTER TABLE login_sessions MODIFY user_type VARCHAR(20) NOT NULL;
   EOF
   ```

3. **Create .env file on VPS:**
   ```bash
   cd /var/www/prms/prms-frontend
   nano .env
   ```
   
   Paste (replace YOUR_VPS_IP):
   ```env
   VITE_API_BASE_URL=http://YOUR_VPS_IP/prms-backend
   VITE_STAFF_API_BASE_URL=http://YOUR_VPS_IP/prms-backend/api/staff
   ```

4. **Rebuild frontend:**
   ```bash
   rm -rf dist
   npm run build
   ```

5. **Set permissions:**
   ```bash
   sudo chown -R www-data:www-data /var/www/prms
   ```

6. **Restart Apache:**
   ```bash
   sudo systemctl restart apache2
   ```

7. **Test:**
   - Open `http://YOUR_VPS_IP` in browser
   - Login with admin credentials
   - Verify successful login and redirect

---

## Files to Commit to Git

✅ **Commit these files:**
- `prms_db.sql` (fixed database schema)
- `prms-frontend/ENV_SETUP_GUIDE.md` (environment setup guide)
- `DEPLOYMENT_FIX_GUIDE.md` (VPS troubleshooting guide)
- `DEPLOYMENT_FIXES_SUMMARY.md` (this file)

❌ **DO NOT commit:**
- `prms-frontend/.env` (environment-specific, in .gitignore)
- `prms-backend/config.php` (sensitive credentials, in .gitignore)

---

## Git Commands to Commit Fixes

```bash
# Stage the fixed files
git add prms_db.sql
git add prms-frontend/ENV_SETUP_GUIDE.md
git add DEPLOYMENT_FIX_GUIDE.md
git add DEPLOYMENT_FIXES_SUMMARY.md

# Commit with descriptive message
git commit -m "Fix: Database schema and frontend environment configuration

- Changed user_type from ENUM to VARCHAR(20) in activity_logs, audit_logs, login_sessions
- Created .env configuration for frontend API URLs
- Added deployment guides for VPS setup
- Fixes 'truncated user-type' error and localhost redirect issues"

# Push to repository
git push origin development
```

---

## What Changed vs Original Deployment Guide

The `HOSTINGER_VPS_DEPLOYMENT.md` is still valid, but needs these updates:

**Section 6.1 (Create Environment File) - Page 564:**
- ✅ Now has detailed ENV_SETUP_GUIDE.md reference
- ✅ Emphasizes importance of creating .env BEFORE building

**Section 4.2 (Import Database Schema) - Page 422:**
- ✅ The new prms_db.sql already has VARCHAR(20) instead of ENUM
- ✅ No manual ALTER TABLE commands needed if importing fresh

---

## Success Indicators After Fix

✅ **You'll know everything is working when:**

1. Frontend loads at your VPS IP address
2. Login form appears without errors
3. Can successfully login with admin/staff credentials
4. Redirects to dashboard (not to localhost)
5. Browser Network tab shows requests going to VPS IP
6. No "truncated user-type" errors in PHP error logs
7. Audit logs are being created successfully
8. Dashboard displays patient/disease data

---

## Prevention for Future Deployments

### Always Do This Before Building:
1. ✅ Create `.env` file with correct API URLs
2. ✅ Verify `.env` content: `cat .env`
3. ✅ Delete old build: `rm -rf dist`
4. ✅ Build: `npm run build`
5. ✅ Verify build uses correct URLs (check dist/assets/index-*.js)

### Database Schema Design:
- ✅ Use VARCHAR instead of ENUM for fields that might expand
- ✅ Use ENUM only for truly fixed values (like status flags)
- ✅ Always test schema changes locally before deployment

---

## Quick Reference: Environment URLs

| Environment | Frontend .env Setting |
|-------------|----------------------|
| **Local Laragon** | `VITE_API_BASE_URL=http://localhost/prms/prms-backend` |
| **VPS with IP** | `VITE_API_BASE_URL=http://72.61.148.144/prms-backend` |
| **VPS with Domain (No SSL)** | `VITE_API_BASE_URL=http://yourdomain.com/prms-backend` |
| **VPS with Domain (SSL)** | `VITE_API_BASE_URL=https://yourdomain.com/prms-backend` |

---

## Additional Resources Created

1. **ENV_SETUP_GUIDE.md** - Complete .env configuration guide
2. **DEPLOYMENT_FIX_GUIDE.md** - VPS troubleshooting steps
3. **DEPLOYMENT_FIXES_SUMMARY.md** - This summary document

---

## Contact & Support

If you encounter any other issues during deployment:
1. Check error logs: `sudo tail -f /var/log/apache2/prms_error.log`
2. Verify services: `sudo systemctl status apache2 php8.2-fpm mysql`
3. Check CORS configuration in `prms-backend/cors.php`
4. Verify database connection in `prms-backend/config.php`

---

**Status:** ✅ Ready for Testing and Redeployment  
**Next Step:** Test locally in Laragon, then redeploy to VPS

---

**Last Updated:** October 27, 2025  
**Version:** 1.0  
**Author:** PRMS Development Team

