# PRMS Deployment Fix Guide
## Fixing Common VPS Deployment Issues

This guide addresses the two main errors encountered during Hostinger VPS deployment:
1. **Frontend calling `localhost` instead of VPS IP**
2. **Database "truncated user-type" error**

---

## Problem 1: Frontend Calling Localhost (404 Error)

### Root Cause
The React frontend was built without the correct environment variables, so it's still pointing to `http://localhost/prms/prms-backend` instead of your VPS IP.

### Solution: Rebuild Frontend with Correct Environment Variables

**Step 1: SSH into Your VPS**
```bash
ssh prmsuser@your-vps-ip
```

**Step 2: Go to Frontend Directory**
```bash
cd /var/www/prms/prms-frontend
```

**Step 3: Create/Edit .env File**
```bash
nano .env
```

**Step 4: Add Your VPS IP** (Replace `YOUR_VPS_IP` with your actual IP)

**If you DON'T have a domain (using IP only):**
```env
VITE_API_BASE_URL=http://YOUR_VPS_IP/prms-backend
VITE_STAFF_API_BASE_URL=http://YOUR_VPS_IP/prms-backend/api/staff
```

**Example:**
```env
VITE_API_BASE_URL=http://72.61.148.144/prms-backend
VITE_STAFF_API_BASE_URL=http://72.61.148.144/prms-backend/api/staff
```

**If you HAVE a domain:**
```env
VITE_API_BASE_URL=https://yourdomain.com/prms-backend
VITE_STAFF_API_BASE_URL=https://yourdomain.com/prms-backend/api/staff
```

**Step 5: Save the File**
- Press `Ctrl + O` (letter O, not zero)
- Press `Enter`
- Press `Ctrl + X` to exit

**Step 6: Delete Old Build**
```bash
rm -rf dist
```

**Step 7: Rebuild the Frontend**
```bash
npm run build
```
⏳ This takes 2-3 minutes. Wait for it to complete.

**Step 8: Verify the Build**
```bash
ls -la dist/
```
✅ You should see `index.html` and an `assets/` folder

**Step 9: Set Correct Permissions**
```bash
sudo chown -R www-data:www-data /var/www/prms/prms-frontend/dist
sudo chmod -R 755 /var/www/prms/prms-frontend/dist
```

**Step 10: Restart Apache**
```bash
sudo systemctl restart apache2
```

**Step 11: Clear Browser Cache and Test**
- Open your browser
- Press `Ctrl + Shift + Delete` to clear cache
- Or open an Incognito/Private window
- Go to `http://YOUR_VPS_IP`
- Try logging in

✅ **SUCCESS:** The login should now work without redirecting to localhost!

---

## Problem 2: "Truncated user-type" Database Error

### Root Cause
The `user_type` column in several database tables is defined as `ENUM('admin','staff')`, but the application might be trying to insert a value that doesn't match exactly or is too long.

### Solution A: Check What's Being Inserted

**Step 1: Check PHP Error Logs**
```bash
sudo tail -f /var/log/apache2/prms_error.log
```

Try logging in and look for the exact error message. Press `Ctrl + C` to stop viewing.

### Solution B: Fix Database Column Size

The issue might be that the `user_type` column is too restrictive. Let's expand it to varchar:

**Step 1: Login to MySQL**
```bash
mysql -u prms_user -p prms_db
```
Enter your database password when prompted.

**Step 2: Run These SQL Commands**
```sql
-- Change user_type from ENUM to VARCHAR in all affected tables
ALTER TABLE activity_logs MODIFY user_type VARCHAR(20) NOT NULL;
ALTER TABLE audit_logs MODIFY user_type VARCHAR(20) NOT NULL;
ALTER TABLE login_sessions MODIFY user_type VARCHAR(20) NOT NULL;

-- Verify the changes
DESCRIBE activity_logs;
DESCRIBE audit_logs;
DESCRIBE login_sessions;

-- Exit MySQL
EXIT;
```

✅ You should see `user_type` is now `varchar(20)` instead of `enum('admin','staff')`

### Solution C: Ensure Role Values Match

**Step 1: Check Users Table**
```bash
mysql -u prms_user -p prms_db -e "SELECT id, username, role FROM users LIMIT 5;"
```

✅ Make sure all users have `role` set to either 'admin' or 'staff' (not empty, not null)

**Step 2: Update Any Blank Roles**
```sql
mysql -u prms_user -p prms_db
```

Then run:
```sql
-- Update any users without a role to 'staff'
UPDATE users SET role = 'staff' WHERE role IS NULL OR role = '';

-- Verify all users have roles
SELECT id, username, role, status FROM users;

EXIT;
```

---

## Problem 3: CORS Issues (If Login Still Fails)

If you're still having issues after the above fixes, check CORS configuration:

**Step 1: Edit CORS File**
```bash
nano /var/www/prms/prms-backend/cors.php
```

**Step 2: Verify Your VPS IP is Listed**

Look for the `$productionOrigins` array around line 21-28. Make sure your VPS IP is uncommented:

```php
$productionOrigins = [
    'http://72.61.148.144',          // Your VPS IP
    // Add your domain when you have one:
    // 'https://yourdomain.com',
    // 'https://www.yourdomain.com',
];
```

**Step 3: Save and Exit**
- Press `Ctrl + O`, Enter, `Ctrl + X`

---

## Complete Testing Checklist

After applying the fixes, test everything:

### Test 1: Frontend Loads
```
✅ Open browser: http://YOUR_VPS_IP
✅ You should see the login page
✅ Check browser console (F12) - no errors about localhost
```

### Test 2: Backend API Works
```
✅ Open: http://YOUR_VPS_IP/prms-backend/get_diseases.php
✅ You should see JSON data (not an error)
```

### Test 3: Login Works
```
✅ Enter username and password
✅ Click Login
✅ Should redirect to dashboard (NOT localhost)
✅ No "truncated user-type" error
```

### Test 4: Check Error Logs
```bash
# Check for errors
sudo tail -n 50 /var/log/apache2/prms_error.log

# Check PHP errors
sudo tail -n 50 /var/log/apache2/error.log
```

---

## Additional Debugging Commands

**Check if Apache is Running:**
```bash
sudo systemctl status apache2
```

**Check if PHP-FPM is Running:**
```bash
sudo systemctl status php8.2-fpm
```

**Check if MySQL is Running:**
```bash
sudo systemctl status mysql
```

**View Real-Time Error Logs:**
```bash
sudo tail -f /var/log/apache2/prms_error.log
```
(Press Ctrl+C to stop)

**Check Frontend Build Configuration:**
```bash
cat /var/www/prms/prms-frontend/.env
```

**Test Database Connection from PHP:**
```bash
php -r "
\$conn = mysqli_connect('localhost', 'prms_user', 'YOUR_DB_PASSWORD', 'prms_db');
if (\$conn) {
    echo 'Database connection successful!\n';
    mysqli_close(\$conn);
} else {
    echo 'Database connection failed: ' . mysqli_connect_error() . '\n';
}
"
```

---

## Quick Reset (If All Else Fails)

If nothing works, here's a complete reset procedure:

```bash
# 1. Go to project directory
cd /var/www/prms

# 2. Pull latest changes from Git (if using Git)
git pull origin main  # or 'development' branch

# 3. Rebuild frontend
cd prms-frontend
rm -rf dist node_modules
npm install
npm run build

# 4. Fix permissions
sudo chown -R www-data:www-data /var/www/prms
sudo find /var/www/prms -type d -exec chmod 755 {} \;
sudo find /var/www/prms -type f -exec chmod 644 {} \;
sudo chmod -R 775 /var/www/prms/prms-backend/uploads
sudo chmod -R 775 /var/www/prms/prms-backend/logs

# 5. Restart services
sudo systemctl restart php8.2-fpm
sudo systemctl restart apache2
sudo systemctl restart mysql
```

---

## Common Error Messages and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "Failed to fetch" | CORS issue or backend not running | Check cors.php, restart Apache |
| "404 Not Found" | Wrong API URL in frontend | Rebuild frontend with correct .env |
| "Database connection error" | Wrong credentials | Check config.php |
| "Truncated user-type" | Column size too small | Alter table to VARCHAR(20) |
| "Permission denied" | Wrong file permissions | Run chmod/chown commands |
| PHP files download | PHP-FPM not running | Restart php8.2-fpm |

---

## Need More Help?

### Check These Files:
1. **Frontend API Config:** `/var/www/prms/prms-frontend/.env`
2. **Backend DB Config:** `/var/www/prms/prms-backend/config.php`
3. **CORS Config:** `/var/www/prms/prms-backend/cors.php`
4. **Apache Config:** `/etc/apache2/sites-available/prms.conf`

### View Logs:
```bash
# Apache errors
sudo tail -100 /var/log/apache2/prms_error.log

# Apache access log
sudo tail -100 /var/log/apache2/prms_access.log

# PHP-FPM errors
sudo tail -100 /var/log/php8.2-fpm.log

# MySQL errors
sudo tail -100 /var/log/mysql/error.log
```

---

## Success Indicators

You'll know everything is working when:

1. ✅ Opening `http://YOUR_VPS_IP` shows the login page
2. ✅ Browser DevTools (F12) Network tab shows requests going to your VPS IP (not localhost)
3. ✅ Login works and redirects to dashboard
4. ✅ No errors in `/var/log/apache2/prms_error.log`
5. ✅ Dashboard loads patient data successfully

---

## Post-Fix Security Reminder

After everything is working:

1. **Change default passwords** for admin users
2. **Update CORS** to only allow your specific domain/IP
3. **Enable SSL** if you have a domain (Let's Encrypt)
4. **Setup backups** (see main deployment guide)
5. **Monitor error logs** weekly

---

**Last Updated:** October 27, 2025  
**Version:** 1.0 - Deployment Fix Guide

