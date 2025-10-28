# VPS Session Fix Guide - Hostinger Docker Deployment

## 🔴 Problem
After deploying to Hostinger VPS with Docker (HTTP, no domain), users are automatically logged out after a few seconds. Session cookies are not persisting.

## ✅ Root Causes Identified
1. **CORS origin mismatch** - VPS IP not in allowed origins
2. **Session persistence missing** - PHP sessions stored in `/tmp` without Docker volume
3. **Inconsistent session configuration** - Some PHP files missing `session_save_path('/tmp')`

## 🛠️ Fixes Applied

### ✓ Fix 1: Added Session Persistence Volume
**File:** `docker-compose.yml`

Added persistent volume for PHP sessions:
```yaml
backend:
  volumes:
    - php_sessions:/tmp    # ← NEW: Persists sessions across container restarts

volumes:
  php_sessions:           # ← NEW: Session storage
    driver: local
```

### ✓ Fix 2: Standardized Session Configuration
**Files Updated:**
- `prms-backend/check_session.php`
- `prms-backend/logout.php`
- `prms-backend/init_admin_session.php`
- `prms-backend/get_current_user.php`

Added `session_save_path('/tmp')` to all session files for consistency.

### ✓ Fix 3: Improved CORS Configuration
**File:** `prms-backend/cors.php`

- Changed fallback behavior to allow requesting origin (for same-origin Docker deployment)
- Updated comments with clear instructions for adding VPS IP
- Simplified origin matching logic

---

## 🚀 Deployment Steps on VPS

### Option A: Apply Fixes Locally, Then Push to VPS

If you're working from your local machine and have the code in Git:

**1. On Local Machine (already done):**
```powershell
# Fixes are already applied to your local files
# Commit the changes
git add .
git commit -m "Fix session persistence for Docker deployment"
git push origin dev
```

**2. On VPS:**
```bash
# SSH to your VPS
ssh root@YOUR_VPS_IP

# Navigate to project
cd /opt/prms

# Pull latest changes
git pull origin dev

# Restart containers with new configuration
docker compose down
docker compose up -d

# Wait for containers to start
sleep 10

# Check container status
docker compose ps
```

---

### Option B: Manual File Upload (If Not Using Git)

**1. Upload Updated Files to VPS:**

From your **local machine**:
```powershell
# Navigate to project
cd C:\laragon\www\prms

# Upload specific files via SCP
scp docker-compose.yml root@YOUR_VPS_IP:/opt/prms/
scp prms-backend/cors.php root@YOUR_VPS_IP:/opt/prms/prms-backend/
scp prms-backend/check_session.php root@YOUR_VPS_IP:/opt/prms/prms-backend/
scp prms-backend/logout.php root@YOUR_VPS_IP:/opt/prms/prms-backend/
scp prms-backend/init_admin_session.php root@YOUR_VPS_IP:/opt/prms/prms-backend/
scp prms-backend/get_current_user.php root@YOUR_VPS_IP:/opt/prms/prms-backend/
```

**2. On VPS, Restart Containers:**
```bash
# SSH to VPS
ssh root@YOUR_VPS_IP

# Navigate to project
cd /opt/prms

# Restart Docker containers
docker compose down
docker compose up -d

# Verify
docker compose ps
```

---

### Option C: Using the Fix Script (Automated)

**1. Upload the fix script to VPS:**
```powershell
scp fix-session-issue.sh root@YOUR_VPS_IP:/opt/prms/
```

**2. On VPS, run the script:**
```bash
ssh root@YOUR_VPS_IP
cd /opt/prms
chmod +x fix-session-issue.sh
./fix-session-issue.sh YOUR_ACTUAL_VPS_IP
```

---

## 🧪 Testing After Deployment

### 1. Clear Browser Cache
```
Press Ctrl+Shift+Delete
Clear cookies and cached data
```

### 2. Access Application
```
http://YOUR_VPS_IP
```

### 3. Test Login
- Enter credentials
- Login should succeed
- Dashboard should load and STAY loaded
- Refresh page → should remain logged in

### 4. Check Browser Console
Press `F12` → Console tab
- **✅ Should see:** No errors
- **❌ Should NOT see:** CORS errors, 401 Unauthorized errors

---

## 🔍 Debugging (If Still Having Issues)

### Check Backend Logs
```bash
docker compose logs -f backend
```

Look for:
```
Login Success - Session ID: [should see a session ID]
Get Admin Profile - Session ID: [should match login session ID]
Get Admin Profile - User ID: [should show user ID, not "NOT SET"]
```

### Check Session Files
```bash
# Enter backend container
docker compose exec backend bash

# List session files
ls -lah /tmp/sess_*

# You should see session files being created
```

### Check CORS Headers
In browser (F12 → Network tab):
1. Click on any API request
2. Go to "Headers" tab
3. Look for "Response Headers"
4. Check: `Access-Control-Allow-Origin` should match your VPS IP or localhost

---

## 📝 Optional: Add Your VPS IP to CORS

While the current fix allows all origins (safe for Docker same-origin deployment), you can explicitly add your VPS IP for extra security:

**Edit:** `prms-backend/cors.php` (line 22-23)

```php
$productionOrigins = [
    // ADD YOUR HOSTINGER VPS IP HERE:
    'http://203.45.67.89',              // Replace with YOUR actual VPS IP
    
    // Examples (keep or remove):
    'http://72.61.148.144',
    'https://72.61.148.144',
];
```

Then restart:
```bash
docker compose restart backend webserver
```

---

## 🎯 Expected Result

✅ **Before Fix:**
- Login succeeds
- Immediately logged out (401 Unauthorized)
- `get_admin_profile.php` returns error

✅ **After Fix:**
- Login succeeds
- Session persists
- Dashboard loads and stays loaded
- Can navigate between pages
- Refresh works without logging out

---

## 🔒 Security Notes

1. **Port 3306 Exposure**: Remember to remove MySQL port exposure in production:
   ```yaml
   db:
     # ports:
     #   - "3306:3306"  # ❌ Remove this in production
   ```

2. **Session Security**: Current settings are optimized for HTTP deployment. When you add SSL/HTTPS:
   - Change `'secure' => true` in session cookie params
   - Update CORS to use `https://` URLs

3. **Firewall**: Ensure UFW is configured:
   ```bash
   ufw status
   # Should allow: 22, 80, 443
   ```

---

## 📞 Need Help?

If issues persist after applying fixes:

1. **Check Docker logs:**
   ```bash
   docker compose logs -f backend
   docker compose logs -f webserver
   ```

2. **Verify container health:**
   ```bash
   docker compose ps
   # All should show "Up" or "Up (healthy)"
   ```

3. **Check session volume:**
   ```bash
   docker volume ls | grep php_sessions
   # Should show: prms_php_sessions
   ```

4. **Restart everything:**
   ```bash
   docker compose down -v  # ⚠️ WARNING: Removes all data!
   docker compose up -d --build
   ```

---

**Last Updated:** October 28, 2025
**Tested On:** Hostinger VPS, Docker, HTTP (no domain)

