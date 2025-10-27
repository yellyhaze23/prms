# PRMS Deployment Guide - Version 3.0 Updates

**Date:** October 27, 2025  
**Updated By:** Development Team  
**Version:** 3.0 - Complete Git-Based Deployment Guide

---

## 🎯 Major Changes Summary

The `HOSTINGER_VPS_DEPLOYMENT.md` has been completely updated from SCP-based file upload to a professional **Git-based workflow**.

---

## ✨ What's New in Version 3.0

### 1. **Section 0: Pre-Deployment Preparation** (NEW!)
- Push code to GitHub before deploying
- Verify files checklist
- Local testing requirements
- Repository verification steps

### 2. **Section 3: Git Clone Instead of SCP Upload** (REPLACED)
**Before (v2.0):** Used SCP to copy files from local computer
```powershell
scp -r * prmsuser@your-vps-ip:/var/www/prms/
```

**After (v3.0):** Clone from GitHub repository
```bash
git clone git@github.com:your-username/prms.git
```

**New Sub-sections:**
- 3.1: Setup Git and GitHub Access
- 3.2: Generate SSH Key for GitHub (Recommended)
- 3.3: Alternative - Using HTTPS with Personal Access Token
- 3.4: Clone Your Repository
- 3.5: Switch to Correct Branch

---

### 3. **Section 5.3: CORS Configuration** (NEW!)
Added step to configure CORS settings with VPS IP or domain:
```php
$productionOrigins = [
    'http://YOUR_VPS_IP',
    // 'https://yourdomain.com',
];
```

---

### 4. **Section 6.1: Frontend Environment Setup** (ENHANCED)
**Before:** Basic .env creation
**After:** Detailed configuration with examples and references

- Added reference to `ENV_SETUP_GUIDE.md`
- Multiple examples for different scenarios
- Verification steps
- Warning about correct URL format

---

### 5. **Section 20: Updating Deployment from Git** (NEW!)
Complete guide for updating deployment after code changes:

**Sub-sections:**
- 20.1: Pull Latest Changes
- 20.2: Update Backend Only (PHP Changes)
- 20.3: Update Frontend (React Changes)
- 20.4: Update Database Schema
- 20.5: Update Python Dependencies
- 20.6: Full Update Script (Automated)

**Automated Update Script:**
```bash
#!/bin/bash
cd /var/www/prms
git pull origin development
cd prms-frontend
npm install
npm run build
sudo systemctl restart apache2
```

---

### 6. **Section 21: Troubleshooting Resources** (NEW!)
References to all the fix documentation:
- `ENV_SETUP_GUIDE.md`
- `DEPLOYMENT_FIX_GUIDE.md`
- `DEPLOYMENT_FIXES_SUMMARY.md`
- `LOCAL_TESTING_CHECKLIST.md`

---

### 7. **Section 22: Additional Resources** (ENHANCED)
Added:
- Git documentation links
- GitHub SSH setup guide
- Quick command reference for Git
- Service management commands
- Log viewing commands
- Database backup/restore commands

---

## 📋 Complete Section List

**Updated Table of Contents:**
- **0.** Before You Start - Prepare Your Repository ⭐ NEW
- **1.** Access Your Server
- **2.** Install Required Software
- **3.** Upload Your Project Files Using Git ⭐ REPLACED
- **4.** Setup MySQL Database
- **5.** Configure Backend (with CORS) ⭐ ENHANCED
- **6.** Build and Deploy Frontend ⭐ ENHANCED
- **7.** Configure Web Server
- **8.** Setup Python Forecasting
- **9.** Configure Automated Tasks
- **10.** Setup SSL Certificate (HTTPS)
- **11.** Security Hardening
- **12.** Final Testing
- **13.** Troubleshooting
- **14.** Post-Deployment Checklist
- **15.** Automated Database Backups
- **16.** Performance Optimization
- **17.** Domain Setup (If You Have a Domain)
- **18.** Regular Maintenance
- **19.** Estimated Costs
- **20.** Updating Your Deployment from Git ⭐ NEW
- **21.** Troubleshooting Resources ⭐ NEW
- **22.** Additional Resources ⭐ ENHANCED

---

## 🔧 Technical Improvements

### Git Workflow
- **SSH Key Authentication** - More secure than passwords
- **Personal Access Token** - Alternative HTTPS method
- **Branch Management** - Switch between development/main
- **Pull Updates** - Easy deployment updates

### Configuration Management
- **CORS Settings** - Proper origin configuration
- **Environment Variables** - Structured .env setup
- **Documentation References** - Links to detailed guides

### Update Procedures
- **Selective Updates** - Backend-only, Frontend-only, or Full
- **Automated Scripts** - One-command deployment updates
- **Safety Checks** - Verification before destructive operations

---

## 📊 Comparison: v2.0 vs v3.0

| Feature | v2.0 | v3.0 |
|---------|------|------|
| File Upload Method | SCP | Git Clone ✅ |
| Update Method | Manual re-upload | Git Pull ✅ |
| CORS Configuration | Not mentioned | Detailed steps ✅ |
| Environment Setup | Basic | Comprehensive with guide ✅ |
| Pre-deployment Testing | Not mentioned | Full checklist ✅ |
| Update Scripts | Manual steps | Automated script ✅ |
| Troubleshooting Docs | Basic | 4 dedicated guides ✅ |
| GitHub Integration | No | Full SSH/HTTPS setup ✅ |

---

## 🎯 Benefits of v3.0

### For First-Time Deployment:
✅ Clearer step-by-step instructions  
✅ Professional Git-based workflow  
✅ Better error prevention  
✅ Comprehensive troubleshooting  

### For Updates:
✅ Simple `git pull` command  
✅ No need to re-upload entire project  
✅ Version control integration  
✅ Easy rollback if needed  

### For Team Collaboration:
✅ Multiple developers can deploy  
✅ Consistent deployment process  
✅ Git history for tracking changes  
✅ SSH keys for secure access  

---

## 📝 Migration Guide (v2.0 to v3.0)

If you already deployed using v2.0, here's how to migrate to v3.0:

### Step 1: Setup Git on VPS
```bash
cd /var/www/prms
git init
git remote add origin git@github.com:your-username/prms.git
git fetch origin
git checkout -b development origin/development
```

### Step 2: Configure CORS
```bash
nano /var/www/prms/prms-backend/cors.php
# Add your VPS IP to $productionOrigins array
```

### Step 3: Create Frontend .env
```bash
nano /var/www/prms/prms-frontend/.env
# Add VITE_API_BASE_URL with your VPS IP
```

### Step 4: Rebuild Frontend
```bash
cd /var/www/prms/prms-frontend
npm run build
sudo systemctl restart apache2
```

---

## 🔍 What Wasn't Changed

These sections remain the same:
- Server access and setup
- Software installation (Apache, PHP, MySQL, Node.js, Python)
- Database creation and import
- Apache configuration
- Python forecasting setup
- Cron job configuration
- SSL certificate setup
- Security hardening
- Backup procedures
- Performance optimization

---

## 📚 Related Documentation

Make sure to review these files created with the fixes:

1. **`DEPLOYMENT_FIX_GUIDE.md`**
   - "Truncated user-type" error solution
   - Frontend localhost redirect fix
   - CORS issues
   - Database connection problems

2. **`ENV_SETUP_GUIDE.md`** (in prms-frontend/)
   - Creating .env files
   - Different deployment scenarios
   - Troubleshooting environment issues

3. **`DEPLOYMENT_FIXES_SUMMARY.md`**
   - Overview of all fixes
   - Authentication flow explanation
   - Files modified list

4. **`LOCAL_TESTING_CHECKLIST.md`**
   - Pre-deployment testing steps
   - Verification procedures
   - Common mistakes to avoid

---

## ✅ Deployment Checklist (Updated for v3.0)

### Before Deployment:
- [ ] Code pushed to GitHub
- [ ] All fixes applied (database schema, .env)
- [ ] Local testing passed
- [ ] .gitignore configured correctly
- [ ] Documentation files included

### During Deployment:
- [ ] VPS accessed successfully
- [ ] Software installed (Apache, PHP, MySQL, Node.js, Python)
- [ ] Git configured and SSH key added to GitHub
- [ ] Repository cloned from GitHub
- [ ] Database imported
- [ ] Backend config.php created with credentials
- [ ] CORS configured with VPS IP
- [ ] Frontend .env created with VPS IP
- [ ] Frontend built successfully
- [ ] Apache configured and restarted
- [ ] All services running

### After Deployment:
- [ ] Website accessible via browser
- [ ] Login works without errors
- [ ] No "truncated user-type" errors
- [ ] No localhost redirect issues
- [ ] All features working
- [ ] SSL certificate installed (if using domain)
- [ ] Firewall configured
- [ ] Backups configured
- [ ] Cron jobs running

---

## 🚀 Future Enhancements

Possible additions for v4.0:
- Docker containerization option
- CI/CD pipeline with GitHub Actions
- Staging environment setup
- Database migration tool
- Rollback procedures
- Load balancing for high traffic
- CDN integration for assets
- Advanced monitoring setup

---

## 📧 Support

For questions about v3.0 updates:
1. Review the updated `HOSTINGER_VPS_DEPLOYMENT.md`
2. Check `DEPLOYMENT_FIX_GUIDE.md` for common issues
3. Refer to specific guides (ENV_SETUP_GUIDE.md, etc.)
4. Contact development team

---

**Last Updated:** October 27, 2025  
**Document Version:** 1.0  
**Deployment Guide Version:** 3.0

