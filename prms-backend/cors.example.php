<?php
/**
 * CORS Configuration Example - For Production Deployment
 * 
 * This file shows you EXACTLY how to configure CORS when deploying.
 * Copy the relevant section to cors.php when you're ready to deploy.
 */

// ============================================
// EXAMPLE 1: Deploying with a DOMAIN NAME
// ============================================
// If your website will be at: https://myprms.com
// Your PRODUCTION ORIGINS should look like this:

/*
$productionOrigins = [
    'https://myprms.com',              // HTTPS with domain (after SSL setup)
    'https://www.myprms.com',          // HTTPS with www subdomain
    'http://myprms.com',               // HTTP (before SSL, remove after SSL setup)
    'http://www.myprms.com',           // HTTP www (before SSL, remove after SSL setup)
];
*/

// ============================================
// EXAMPLE 2: Deploying with VPS IP ONLY (No Domain)
// ============================================
// If your VPS IP is: 203.45.67.89
// Your PRODUCTION ORIGINS should look like this:

/*
$productionOrigins = [
    'http://203.45.67.89',             // VPS IP (no SSL available with IP only)
];
*/

// ============================================
// EXAMPLE 3: Both Domain AND IP (Most Flexible)
// ============================================
// Best practice: Support both your domain and IP during migration

/*
$productionOrigins = [
    // Domain with SSL
    'https://myprms.com',
    'https://www.myprms.com',
    
    // Domain without SSL (temporary, during setup)
    'http://myprms.com',
    'http://www.myprms.com',
    
    // VPS IP (for testing before domain setup)
    'http://203.45.67.89',
];
*/

// ============================================
// STEPS TO UPDATE CORS.PHP FOR PRODUCTION:
// ============================================
// 
// 1. Open prms-backend/cors.php in a text editor
// 
// 2. Find this section:
//    $productionOrigins = [
//        // 🔴 UNCOMMENT AND UPDATE THESE WHEN DEPLOYING:
//        // 'https://yourdomain.com',
//    ];
// 
// 3. Uncomment the lines and replace with your actual URLs
// 
// 4. Example - if your domain is prms.example.com:
//    $productionOrigins = [
//        'https://prms.example.com',
//        'https://www.prms.example.com',
//        'http://prms.example.com',     // Before SSL
//    ];
// 
// 5. Save the file
// 
// 6. Upload to your VPS at: /var/www/prms/prms-backend/cors.php
// 
// 7. Test by accessing your website and checking if API calls work
// 
// ============================================

// ============================================
// WHEN TO UPDATE EACH STEP:
// ============================================
// 
// STAGE 1 - Initial Upload to VPS (No Domain Yet)
// ------------------------------------------------
// Add your VPS IP:
// $productionOrigins = [
//     'http://123.456.789.012',
// ];
//
// STAGE 2 - After Domain Points to VPS (Before SSL)
// ------------------------------------------------
// Add HTTP domain:
// $productionOrigins = [
//     'http://yourdomain.com',
//     'http://www.yourdomain.com',
//     'http://123.456.789.012',  // Keep IP for backup
// ];
//
// STAGE 3 - After SSL Certificate Installed (HTTPS)
// ------------------------------------------------
// Add HTTPS and keep HTTP temporarily:
// $productionOrigins = [
//     'https://yourdomain.com',        // Primary
//     'https://www.yourdomain.com',    // Primary
//     'http://yourdomain.com',         // Remove after testing HTTPS works
//     'http://www.yourdomain.com',     // Remove after testing HTTPS works
// ];
//
// STAGE 4 - Production Final (HTTPS Only)
// ------------------------------------------------
// Remove HTTP after confirming HTTPS works:
// $productionOrigins = [
//     'https://yourdomain.com',
//     'https://www.yourdomain.com',
// ];
//
// ============================================

// ============================================
// TROUBLESHOOTING:
// ============================================
// 
// Problem: "CORS error" in browser console
// Solution: Make sure your origin is in the $productionOrigins array
// 
// Problem: "Mixed content" warning
// Solution: Use HTTPS for both frontend and backend URLs
// 
// Problem: API calls work in development but not production
// Solution: Check that your production domain/IP is added to cors.php
// 
// ============================================

