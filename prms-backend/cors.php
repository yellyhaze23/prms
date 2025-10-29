<?php
/**
 * CORS Configuration - Production Ready
 * Automatically detects and allows requests from your VPS and localhost.
 */

function setCorsHeaders() {
    if (!headers_sent()) {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

        // === Allowed Origins ===
        $allowedOrigins = [
            // Production (your VPS)
            'http://72.61.148.144',
            'https://72.61.148.144',

            // Development
            'http://localhost',
            'http://127.0.0.1',
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:3000',
            'http://127.0.0.1:5173',
        ];

        // ✅ Match if current request comes from allowed origins
        if (in_array($origin, $allowedOrigins)) {
            header("Access-Control-Allow-Origin: $origin");
        } else {
            // fallback (only for same-origin nginx serving frontend + backend)
            header("Access-Control-Allow-Origin: http://72.61.148.144");
        }

        header("Access-Control-Allow-Credentials: true");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        header("Access-Control-Max-Age: 3600");
        header('Content-Type: application/json; charset=utf-8');
    }
}

setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

