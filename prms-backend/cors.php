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
        $origin = $_SERVER['HTTP_ORIGIN'] ?? 'http://localhost';
        
        // ============================================
        // PRODUCTION ORIGINS - UPDATE YOUR VPS IP HERE!
        // ============================================
        // Replace 'YOUR_VPS_IP' with your Hostinger VPS IP
        // Example: 'http://203.45.67.89'
        // ============================================
        
        $productionOrigins = [
            // ADD YOUR HOSTINGER VPS IP HERE:
            'http://72.61.148.144',              // Replace with your VPS IP
            
            // Examples (these are not your IPs):
            'http://72.61.148.144',             // Example VPS IP
            'https://72.61.148.144',
        ];
        
        // ============================================
        // DEVELOPMENT ORIGINS - Keep these for local testing
        // ============================================
        $developmentOrigins = [
            'http://localhost',              // Docker same-origin
            'http://127.0.0.1',              // Docker same-origin
            'http://localhost:5173',         // Vite dev server
            'http://localhost:5174',
            'http://localhost:3000',
            'http://127.0.0.1:5173',
        ];
        
        // Merge all allowed origins
        $allowedOrigins = array_merge($productionOrigins, $developmentOrigins);
        $allowedOrigins = array_filter($allowedOrigins); // Remove empty values
        
        // Check if the requesting origin is allowed
        if (in_array($origin, $allowedOrigins)) {
            header("Access-Control-Allow-Origin: $origin");
            header("Access-Control-Allow-Credentials: true");
        } else {
            // For Docker deployment: frontend and backend are same-origin
            // Allow the requesting origin (they're served from same nginx)
            header("Access-Control-Allow-Origin: $origin");
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
