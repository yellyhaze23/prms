# 🌐 CORS Setup Guide - Gabay sa Tagalog

## Ano ang CORS at Bakit Kailangan Natin Ito?

**CORS** = Cross-Origin Resource Sharing

Ito ay security feature ng browser na nagpoprotekta sa mga users mula sa malicious websites.

### Simple na Halimbawa:

```
Iyong React App:     http://yourdomain.com  (FRONTEND)
Iyong PHP API:       http://yourdomain.com/prms-backend  (BACKEND)
```

Kapag ang React app ay tumawag sa PHP API, ang browser ay mag-check:
> "Pwede ba ang website na ito na tumawag sa API na iyan?"

Kung **WALANG CORS headers**, ang browser ay mag-BLOCK ng request = ❌ **CORS ERROR**

Kung **MAY TAMANG CORS headers**, ang browser ay mag-ALLOW ng request = ✅ **SUCCESS**

---

## 📋 Paano I-Setup ang CORS para sa Production

### **STEP 1: Alamin ang Iyong Production URL**

Bago ka mag-deploy, kailangan mong malaman ang iyong:
- **Domain name** (example: `https://prms-manila.com`) O
- **VPS IP address** (example: `http://203.45.67.89`)

---

### **STEP 2: I-Edit ang `cors.php`**

1. **Buksan** ang file: `prms-backend/cors.php`

2. **Hanapin** ang section na ito:
   ```php
   $productionOrigins = [
       // 🔴 UNCOMMENT AND UPDATE THESE WHEN DEPLOYING:
       // 'https://yourdomain.com',
       // 'https://www.yourdomain.com',
   ];
   ```

3. **I-uncomment** (tanggalin ang `//`) at **palitan** ng iyong actual URLs

---

### **HALIMBAWA A: May Domain Ka (Recommended)**

Kung ang iyong website ay: `https://prms-cebu.com`

I-edit mo ang `cors.php` to look like this:

```php
$productionOrigins = [
    // Production - UPDATE TO YOUR DOMAIN
    'https://prms-cebu.com',           // ✅ With SSL
    'https://www.prms-cebu.com',       // ✅ With www
    'http://prms-cebu.com',            // Temporary (before SSL)
    'http://www.prms-cebu.com',        // Temporary (before SSL)
];
```

**NOTE:** After mag-setup ng SSL, pwede mo na tanggalin ang HTTP lines (yung walang 's')

---

### **HALIMBAWA B: Walang Domain (Using IP Only)**

Kung ang iyong VPS IP ay: `203.45.67.89`

I-edit mo ang `cors.php` to look like this:

```php
$productionOrigins = [
    // VPS IP - UPDATE TO YOUR ACTUAL IP
    'http://203.45.67.89',             // ✅ Your VPS IP
];
```

**NOTE:** Hindi pwede mag-SSL sa IP address, so HTTP lang ang gagamitin

---

## 🔍 Paano Mo Malalaman Kung May CORS Problem?

### Symptoms ng CORS Error:

1. **Sa Browser Console** (Press F12):
   ```
   ❌ Access to fetch at 'http://api.com/data' from origin 
      'http://mysite.com' has been blocked by CORS policy
   ```

2. **Network Tab** (sa Developer Tools):
   - Status: `(failed)` sa mga API requests
   - May red color sa request

3. **Sa Application**:
   - Hindi lumalabas ang data
   - "Network Error" or "CORS Error" messages

---

## ✅ Paano I-Test Kung Working ang CORS?

### Test 1: Check sa Browser Console

1. Open your website (example: `https://yourdomain.com`)
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Tingnan kung may CORS errors (**wala dapat!**)

### Test 2: Check sa Network Tab

1. Press **F12** to open Developer Tools
2. Go to **Network** tab
3. Refresh the page
4. Tingnan ang mga API calls (dapat **green status code 200**)

### Test 3: Check Response Headers

Sa Network tab, i-click ang kahit anong API request:
```
Response Headers:
✅ Access-Control-Allow-Origin: https://yourdomain.com
✅ Access-Control-Allow-Credentials: true
```

---

## 🚀 Deployment Checklist - CORS Edition

Sundin ang mga steps na ito IN ORDER:

### **BEFORE Deployment (Sa Local Computer)**

- [ ] **Step 1:** I-update ang `prms-backend/cors.php`
  - Add production domain/IP sa `$productionOrigins`
  - Save the file

- [ ] **Step 2:** Test locally muna (optional)
  ```bash
  cd prms-backend
  php -l cors.php
  ```
  Should say: "No syntax errors detected"

---

### **DURING Deployment (Sa VPS Server)**

- [ ] **Step 3:** Upload ang updated `cors.php` to VPS
  ```bash
  scp prms-backend/cors.php prmsuser@your-vps-ip:/var/www/prms/prms-backend/
  ```

- [ ] **Step 4:** Verify na na-upload correctly
  ```bash
  cat /var/www/prms/prms-backend/cors.php
  ```
  Check kung nandun ang iyong production URLs

- [ ] **Step 5:** Restart Apache (para mag-reload ang PHP)
  ```bash
  sudo systemctl restart apache2
  ```

---

### **AFTER Deployment (Testing)**

- [ ] **Step 6:** Open your production website sa browser
  
- [ ] **Step 7:** Press F12, check Console for errors
  - ✅ **GOOD:** Walang CORS errors
  - ❌ **BAD:** May "blocked by CORS policy" error
  
- [ ] **Step 8:** Try to login and use the system
  - ✅ **GOOD:** Everything works normally
  - ❌ **BAD:** API calls fail or don't return data

---

## 🔧 Common Problems at Solutions

### Problem 1: "CORS Error" kahit naka-setup na

**Posibleng Dahilan:**
- Mali ang spelling ng domain sa `cors.php`
- Naka-HTTP ka pero HTTPS ang naka-configure (or vice versa)
- May `www.` ang binrowse mo pero wala sa configuration

**Solution:**
```php
// Make sure ALL variations are included:
$productionOrigins = [
    'https://yourdomain.com',      // ← Without www
    'https://www.yourdomain.com',  // ← With www
    'http://yourdomain.com',       // ← HTTP version
    'http://www.yourdomain.com',   // ← HTTP with www
];
```

---

### Problem 2: Working sa localhost pero hindi sa production

**Dahilan:** Hindi na-update ang `cors.php` sa server

**Solution:**
1. Check ang file sa VPS:
   ```bash
   nano /var/www/prms/prms-backend/cors.php
   ```
2. Make sure production URLs are there
3. Save and restart Apache

---

### Problem 3: "Mixed Content" Warning

**Dahilan:** Frontend is HTTPS pero Backend is HTTP (o vice versa)

**Solution:** Use HTTPS for both:
```env
# In .env file:
VITE_API_BASE_URL=https://yourdomain.com/prms-backend  # ← HTTPS!
```

And in `cors.php`:
```php
$productionOrigins = [
    'https://yourdomain.com',  // ← HTTPS!
];
```

---

## 📞 Quick Reference

### Files to Update:
1. ✅ `prms-backend/cors.php` - Add production URLs
2. ✅ `prms-frontend/.env` - Set API URLs to production

### What to Add in cors.php:
```php
$productionOrigins = [
    'https://YOUR-ACTUAL-DOMAIN.com',     // ← Change this!
    'https://www.YOUR-ACTUAL-DOMAIN.com', // ← Change this!
];
```

### When to Update:
- **Before uploading to VPS** (best practice)
- **During deployment** (if you forgot)
- **After getting domain** (if started with IP)
- **After SSL setup** (add HTTPS versions)

---

## ✨ Pro Tips

1. **Start with IP first** kung wala ka pang domain
2. **Add both HTTP and HTTPS** during SSL transition period
3. **Remove HTTP after** SSL is confirmed working
4. **Keep development origins** para pwede pa rin mag-test locally
5. **Document your changes** - lagyan ng comment kung kelan mo binago

---

## 🎯 Summary

**Ang CORS ay parang bouncer sa club:**
- Kung naka-list ka (allowed origins), papasok ka ✅
- Kung wala ka sa list, bawal ka pumasok ❌

**Para gumana ang iyong PRMS sa production:**
1. I-update ang `cors.php` with your domain/IP
2. Upload to VPS
3. Restart Apache
4. Test sa browser

**That's it!** Simple lang pag naintindihan mo na. 😊

---

**Last Updated:** October 2025
**Version:** 1.0 - Tagalog Edition

