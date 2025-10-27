# PRMS Local Testing Checklist - Before VPS Deployment

**Purpose:** Test all fixes in Laragon before deploying to VPS  
**Estimated Time:** 15-20 minutes

---

## Prerequisites

- ✅ Laragon is installed and running
- ✅ Apache and MySQL services are started in Laragon
- ✅ All fixes have been applied (see DEPLOYMENT_FIXES_SUMMARY.md)

---

## Step 1: Verify Files Are Updated

### Check Database Schema Fix
```bash
# Open PowerShell in project root
cd C:\laragon\www\prms
```

Search for VARCHAR in SQL file:
```powershell
Select-String -Path "prms_db.sql" -Pattern "user_type varchar"
```

**Expected Output:** Should show 3 matches (activity_logs, audit_logs, login_sessions)

---

### Check Frontend .env File
```powershell
cd prms-frontend
Get-Content .env
```

**Expected Output:**
```
VITE_API_BASE_URL=http://localhost/prms/prms-backend
VITE_STAFF_API_BASE_URL=http://localhost/prms/prms-backend/api/staff
```

**❌ If file doesn't exist, create it:**
```powershell
@"
VITE_API_BASE_URL=http://localhost/prms/prms-backend
VITE_STAFF_API_BASE_URL=http://localhost/prms/prms-backend/api/staff
"@ | Out-File -FilePath .env -Encoding utf8
```

---

## Step 2: Re-import Database

**Why:** The updated schema needs to be imported into your local MySQL.

### Option A: Using phpMyAdmin (Easiest)
1. Open Laragon Menu
2. Click "phpMyAdmin" or go to `http://localhost/phpmyadmin`
3. Login (usually root with no password)
4. Click on `prms_db` database (create if doesn't exist)
5. Click "Import" tab
6. Choose file: `C:\laragon\www\prms\prms_db.sql`
7. Click "Go" button
8. Wait for import to complete

### Option B: Using MySQL Command Line
```powershell
# Open PowerShell
cd C:\laragon\www\prms

# Import database (you may need to adjust the path to mysql.exe)
& "C:\laragon\bin\mysql\mysql-8.0.30-winx64\bin\mysql.exe" -u root -p prms_db < prms_db.sql
```

**✅ Success:** You should see "Import completed successfully" or no errors.

---

## Step 3: Verify Database Schema

Open phpMyAdmin and check the tables:

### Check activity_logs table:
```sql
DESCRIBE activity_logs;
```
**Look for:** `user_type` should be `varchar(20)` NOT `enum('admin','staff')`

### Check audit_logs table:
```sql
DESCRIBE audit_logs;
```
**Look for:** `user_type` should be `varchar(20)` NOT `enum('admin','staff')`

### Check login_sessions table:
```sql
DESCRIBE login_sessions;
```
**Look for:** `user_type` should be `varchar(20)` NOT `enum('admin','staff')`

### Check users table has data:
```sql
SELECT id, username, role, status FROM users LIMIT 5;
```
**Expected:** You should see admin and staff users with roles.

---

## Step 4: Rebuild Frontend

```powershell
# Go to frontend directory
cd C:\laragon\www\prms\prms-frontend

# Delete old build
Remove-Item -Path "dist" -Recurse -Force -ErrorAction SilentlyContinue

# Install dependencies (if not already installed)
npm install

# Build for production
npm run build
```

**⏳ Wait:** This takes 2-3 minutes

**✅ Success Indicators:**
- No errors during build
- `dist/` folder is created
- You see: `✓ built in XX.XXs`
- `dist/index.html` exists
- `dist/assets/` folder has JS and CSS files

---

## Step 5: Verify Build Configuration

Check if the built files contain correct API URLs:

```powershell
# Search for localhost in built files
Select-String -Path "dist\assets\*.js" -Pattern "localhost/prms/prms-backend" | Select-Object -First 1
```

**Expected:** Should find matches with "http://localhost/prms/prms-backend"

**❌ If it shows different URL:** Your .env file wasn't read during build. Repeat Step 2 and Step 4.

---

## Step 6: Start Laragon Services

1. Open Laragon
2. Click "Start All" button
3. Verify both Apache and MySQL are green/running

**Or check via browser:**
- `http://localhost` - Should show Laragon welcome or directory listing
- `http://localhost/phpmyadmin` - Should show phpMyAdmin login

---

## Step 7: Test Backend API Directly

Open these URLs in your browser:

### Test 1: Check Database Connection
```
http://localhost/prms/prms-backend/get_diseases.php
```
**Expected:** JSON response with disease data (or empty array `[]`)
**❌ If error:** Check `prms-backend/config.php` credentials

### Test 2: Check Users Table
```
http://localhost/prms/prms-backend/get_users.php
```
**Expected:** JSON response with user data or authentication error
**❌ If error:** Database not imported correctly

---

## Step 8: Test Frontend Login

### Open the Application
```
http://localhost/prms/prms-frontend/dist/
```

**Expected:** You should see the PRMS login page

---

### Test Admin Login

**Default Admin Credentials** (check your database if different):
- Username: `admin` or email from users table
- Password: Check your database or use the default you set up

**Steps:**
1. Enter username/email
2. Enter password
3. Click "Login" button
4. **⏳ Wait** for response (2-3 seconds)

**✅ SUCCESS Indicators:**
- No browser console errors (Press F12 to check)
- No "truncated user-type" error
- No redirect to localhost/prms-backend
- Successfully redirects to admin dashboard
- Dashboard shows data (patients, diseases, charts)

**❌ FAILURE Indicators:**
- Console shows "Failed to fetch"
- "truncated user-type" error in console
- 404 Not Found errors
- Blank white screen
- Redirects to wrong URL

---

### Open Browser Console (Important!)

**Press F12** to open Developer Tools

**Go to Console tab** and check for:
- ❌ Red error messages
- ❌ 404 Not Found errors
- ❌ CORS errors
- ❌ Database errors
- ✅ No errors = Good!

**Go to Network tab** and check:
- Find the `authenticate.php` request
- Check Request URL: Should be `http://localhost/prms/prms-backend/authenticate.php`
- Check Response: Should be `{"success":true,"user":{...}}`

---

## Step 9: Test Staff Login

**Logout** from admin account

**Login with Staff Credentials:**
- Use a staff account from your users table
- Should redirect to staff dashboard
- Verify staff interface loads correctly

---

## Step 10: Check Database Logs

After successful login, verify logs were created:

**Open phpMyAdmin** and run these queries:

### Check activity_logs:
```sql
SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 5;
```
**Expected:** Should see recent login activities with `user_type` = 'admin' or 'staff'

### Check audit_logs:
```sql
SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 5;
```
**Expected:** Should see recent login audit entries with `user_type` = 'admin' or 'staff'

### Check login_sessions:
```sql
SELECT * FROM login_sessions ORDER BY login_time DESC LIMIT 5;
```
**Expected:** Should see active session with `user_type` = 'admin' or 'staff'

**❌ If no records:** Check PHP error logs at `C:\laragon\www\prms\prms-backend\logs\`

---

## Step 11: Test Dashboard Features

After successful login, test these features:

### Admin Dashboard:
- [ ] Dashboard loads with statistics
- [ ] Can view patient list
- [ ] Can view diseases list
- [ ] Can view medical records
- [ ] Charts/graphs display correctly
- [ ] Can access settings
- [ ] Can view reports
- [ ] Notifications work (if any)

### Staff Dashboard:
- [ ] Dashboard loads with assigned patients
- [ ] Can view own patient list
- [ ] Can add medical records
- [ ] Can view disease tracker
- [ ] Profile page loads

---

## Step 12: Check for Errors

### Check PHP Error Logs:
```powershell
# If logs directory exists
Get-Content C:\laragon\www\prms\prms-backend\logs\*.log -Tail 20
```

### Check Apache Error Logs:
```
C:\laragon\bin\apache\apache-2.4.54-win64\logs\error.log
```

### Check MySQL Error Logs:
```
C:\laragon\bin\mysql\mysql-8.0.30-winx64\data\*.err
```

**❌ Look for:**
- "truncated user-type" errors
- Database connection errors
- CORS errors
- Session errors

**✅ If no errors:** Your fixes are working!

---

## Common Issues and Solutions

### Issue: "truncated user-type" still appears

**Solution:**
```sql
-- Manually update the tables
ALTER TABLE activity_logs MODIFY user_type VARCHAR(20) NOT NULL;
ALTER TABLE audit_logs MODIFY user_type VARCHAR(20) NOT NULL;
ALTER TABLE login_sessions MODIFY user_type VARCHAR(20) NOT NULL;
```

### Issue: Frontend still calls wrong URL

**Solution:**
1. Verify `.env` file: `Get-Content prms-frontend\.env`
2. Delete build: `Remove-Item prms-frontend\dist -Recurse -Force`
3. Rebuild: `cd prms-frontend; npm run build`
4. Clear browser cache (Ctrl+Shift+Delete)

### Issue: Database connection error

**Solution:**
1. Check Laragon MySQL is running
2. Verify credentials in `prms-backend\config.php`
3. Test connection:
```powershell
& "C:\laragon\bin\mysql\mysql-8.0.30-winx64\bin\mysql.exe" -u root -p prms_db -e "SELECT 1"
```

### Issue: Cannot see login page

**Solution:**
1. Check Apache is running in Laragon
2. Verify files exist: `Test-Path C:\laragon\www\prms\prms-frontend\dist\index.html`
3. Access via: `http://localhost/prms/prms-frontend/dist/`

---

## Final Checklist Before VPS Deployment

Once all local tests pass:

- [ ] ✅ Database schema is updated (VARCHAR instead of ENUM)
- [ ] ✅ Frontend .env file is configured correctly
- [ ] ✅ Frontend build successful with correct API URLs
- [ ] ✅ Admin login works without errors
- [ ] ✅ Staff login works without errors
- [ ] ✅ No "truncated user-type" errors
- [ ] ✅ No console errors in browser
- [ ] ✅ Database logs are being created correctly
- [ ] ✅ Dashboard features work properly
- [ ] ✅ All test cases passed

**🎉 If all checked:** You're ready to deploy to VPS!

---

## Next Steps After Local Testing

1. **Commit your changes to Git:**
   ```powershell
   git add prms_db.sql prms-frontend/ENV_SETUP_GUIDE.md DEPLOYMENT_FIX_GUIDE.md DEPLOYMENT_FIXES_SUMMARY.md
   git commit -m "Fix: Database schema and frontend config for VPS deployment"
   git push origin development
   ```

2. **Deploy to VPS:**
   - Follow the updated `DEPLOYMENT_FIX_GUIDE.md`
   - Or pull the latest code: `git pull origin development`
   - Create `.env` with VPS IP
   - Rebuild frontend on VPS
   - Update database schema on VPS

3. **Test on VPS:**
   - Access `http://YOUR_VPS_IP`
   - Login and verify everything works
   - Check VPS logs for errors

---

## Need Help?

**Check these files:**
- `DEPLOYMENT_FIX_GUIDE.md` - VPS troubleshooting
- `ENV_SETUP_GUIDE.md` - Environment configuration
- `DEPLOYMENT_FIXES_SUMMARY.md` - Summary of all fixes
- `HOSTINGER_VPS_DEPLOYMENT.md` - Complete VPS deployment guide

---

**Testing Date:** _________________  
**Tested By:** _________________  
**Result:** ☐ PASS  ☐ FAIL (see notes below)  
**Notes:**

---

**Last Updated:** October 27, 2025  
**Version:** 1.0

