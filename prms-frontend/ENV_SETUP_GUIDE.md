# Frontend Environment Configuration Guide

## Overview
The PRMS frontend uses environment variables to configure API endpoints. You need to create a `.env` file before building for deployment.

---

## Local Development (Laragon/XAMPP)

**Create a file named `.env` in the `prms-frontend` folder with this content:**

```env
VITE_API_BASE_URL=http://localhost/prms/prms-backend
VITE_STAFF_API_BASE_URL=http://localhost/prms/prms-backend/api/staff
VITE_BASE_PATH=/prms/prms-frontend/dist/
```

**Important:** The `VITE_BASE_PATH` is needed for Vite to correctly resolve asset paths (CSS, JS files) in subdirectory deployments.

---

## VPS Deployment (Using IP Address)

**On your VPS, create `.env` file with your VPS IP address:**

Replace `YOUR_VPS_IP` with your actual IP (e.g., 72.61.148.144)

```env
VITE_API_BASE_URL=http://YOUR_VPS_IP/prms-backend
VITE_STAFF_API_BASE_URL=http://YOUR_VPS_IP/prms-backend/api/staff
VITE_BASE_PATH=/
```

**Example:**
```env
VITE_API_BASE_URL=http://72.61.148.144/prms-backend
VITE_STAFF_API_BASE_URL=http://72.61.148.144/prms-backend/api/staff
VITE_BASE_PATH=/
```

**Note:** On VPS, use `VITE_BASE_PATH=/` because the dist folder is served from the document root.

---

## VPS Deployment (Using Domain Name)

**If you have a domain and SSL certificate:**

```env
VITE_API_BASE_URL=https://yourdomain.com/prms-backend
VITE_STAFF_API_BASE_URL=https://yourdomain.com/prms-backend/api/staff
VITE_BASE_PATH=/
```

**If you have a domain but NO SSL yet:**

```env
VITE_API_BASE_URL=http://yourdomain.com/prms-backend
VITE_STAFF_API_BASE_URL=http://yourdomain.com/prms-backend/api/staff
VITE_BASE_PATH=/
```

---

## How to Create .env File

### On Windows (Local Development)

**Method 1: Using Notepad**
1. Open Notepad
2. Copy the appropriate configuration above
3. Save as `.env` (with the dot at the beginning)
4. Make sure "Save as type" is set to "All Files (*.*)"
5. Save in the `prms-frontend` folder

**Method 2: Using Command Prompt**
```cmd
cd C:\laragon\www\prms\prms-frontend
echo VITE_API_BASE_URL=http://localhost/prms/prms-backend > .env
echo VITE_STAFF_API_BASE_URL=http://localhost/prms/prms-backend/api/staff >> .env
```

**Method 3: Using PowerShell**
```powershell
cd C:\laragon\www\prms\prms-frontend
@"
VITE_API_BASE_URL=http://localhost/prms/prms-backend
VITE_STAFF_API_BASE_URL=http://localhost/prms/prms-backend/api/staff
"@ | Out-File -FilePath .env -Encoding utf8
```

---

### On Linux/VPS (Production Deployment)

**Using nano:**
```bash
cd /var/www/prms/prms-frontend
nano .env
```

Then paste your configuration and save (Ctrl+O, Enter, Ctrl+X)

**Using echo:**
```bash
cd /var/www/prms/prms-frontend
cat > .env << 'EOF'
VITE_API_BASE_URL=http://YOUR_VPS_IP/prms-backend
VITE_STAFF_API_BASE_URL=http://YOUR_VPS_IP/prms-backend/api/staff
EOF
```

---

## After Creating .env File

**You MUST rebuild the frontend:**

```bash
# Delete old build
rm -rf dist

# Install dependencies (if not already installed)
npm install

# Build for production
npm run build
```

The build process will read the `.env` file and embed the API URLs into the compiled JavaScript files.

---

## Verifying the Configuration

After building, check if the configuration is correct:

### On Windows:
```powershell
cd prms-frontend
Get-Content .env
```

### On Linux/VPS:
```bash
cd /var/www/prms/prms-frontend
cat .env
```

### Check the Built Files:
After `npm run build`, open `dist/assets/index-*.js` and search for your API URL to verify it was included in the build.

---

## Common Mistakes to Avoid

❌ **Building WITHOUT creating .env first**
- Result: Frontend uses default localhost URLs

❌ **Wrong IP address in .env**
- Result: 404 errors, "Failed to fetch"

❌ **Forgetting to rebuild after changing .env**
- Result: Old API URLs still in use

❌ **Using https:// without SSL certificate**
- Result: Connection refused, security errors

❌ **Typos in variable names**
- Must be exactly: `VITE_API_BASE_URL` and `VITE_STAFF_API_BASE_URL`

---

## Troubleshooting

### Problem: Frontend still calls localhost after deployment

**Solution:**
1. Check if `.env` file exists: `ls -la /var/www/prms/prms-frontend/.env`
2. Verify the content: `cat /var/www/prms/prms-frontend/.env`
3. Delete old build: `rm -rf dist`
4. Rebuild: `npm run build`
5. Restart Apache: `sudo systemctl restart apache2`
6. Clear browser cache (Ctrl+Shift+Delete)

### Problem: "Failed to fetch" or CORS errors

**Check:**
1. `.env` has correct VPS IP
2. Backend `cors.php` includes your VPS IP in allowed origins
3. Apache is running: `sudo systemctl status apache2`
4. PHP-FPM is running: `sudo systemctl status php8.2-fpm`

---

## .gitignore Configuration

The `.env` file should NOT be committed to Git (it contains environment-specific configuration).

Our `.gitignore` already includes `.env`, so it won't be tracked by Git.

However, this ENV_SETUP_GUIDE.md WILL be committed, so team members know how to set up their environment.

---

## Quick Reference

| Environment | VITE_API_BASE_URL |
|-------------|-------------------|
| Local (Laragon) | `http://localhost/prms/prms-backend` |
| VPS (IP, No SSL) | `http://YOUR_VPS_IP/prms-backend` |
| VPS (Domain, No SSL) | `http://yourdomain.com/prms-backend` |
| VPS (Domain, With SSL) | `https://yourdomain.com/prms-backend` |

---

**Last Updated:** October 27, 2025  
**Version:** 1.0

