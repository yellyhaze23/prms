<?php
/**
 * CORS Configuration - Production Ready
 * 
 * IMPORTANT: When deploying to production, update the PRODUCTION ORIGINS section below
 * with your actual domain name or VPS IP address.
 */

function setCorsHeaders() {
    if (!headers_sent()) {
        // Get the origin from the request
        $origin = $_SERVER['HTTP_ORIGIN'] ?? 'http://localhost:5173';
        
        // ============================================
        // PRODUCTION ORIGINS - UPDATE THESE BEFORE DEPLOYING!
        // ============================================
        // Replace 'yourdomain.com' with your actual domain
        // Replace '123.456.789.012' with your actual VPS IP
        // ============================================
        
        $productionOrigins = [
            // UNCOMMENT AND UPDATE THESE WHEN DEPLOYING:
            // 'https://yourdomain.com',
            // 'https://www.yourdomain.com',
            // 'http://yourdomain.com',           // HTTP (before SSL)
            // 'http://www.yourdomain.com',       // HTTP (before SSL)
            'http://72.61.148.144',             // Your VPS IP (if no domain)
            'https://72.61.148.144',            // HTTPS VPS IP
        ];
        
        // ============================================
        // DEVELOPMENT ORIGINS - Keep these for local testing
        // ============================================
        $developmentOrigins = [
            'http://localhost',              // For Docker deployment
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:3000',
            'http://127.0.0.1',              // For Docker deployment
            'http://127.0.0.1:5173',
            'http://127.0.0.1:5174',
            'http://127.0.0.1:3000',
        ];
        
        // Merge production and development origins
        $allowedOrigins = array_merge($productionOrigins, $developmentOrigins);
        
        // Remove empty values (from commented production origins)
        $allowedOrigins = array_filter($allowedOrigins);
        
        // Check if the requesting origin is allowed
        if (in_array($origin, $allowedOrigins)) {
            header("Access-Control-Allow-Origin: $origin");
            header("Access-Control-Allow-Credentials: true");
        } else {
            // Default to localhost:5173 if origin not recognized
            // In production, you might want to block unknown origins
            header("Access-Control-Allow-Origin: http://localhost:5173");
            header("Access-Control-Allow-Credentials: true");
        }
        
        // Standard CORS headers
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        header("Access-Control-Max-Age: 3600");
        header('Content-Type: application/json; charset=utf-8');
    }
}

// Set headers only if not already sent
setCorsHeaders();

// Handle preflight OPTIONS request
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}
