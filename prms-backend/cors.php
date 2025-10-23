<?php
// CORS handling without hardcoding
function setCorsHeaders() {
    if (!headers_sent()) {
        // Get the origin from the request
        $origin = $_SERVER['HTTP_ORIGIN'] ?? 'http://localhost:5173';
        
        // Allow specific origins for credentials
        $allowedOrigins = [
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:3000',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:5174',
            'http://127.0.0.1:3000'
        ];
        
        // Always use specific origin when credentials are involved
        if (in_array($origin, $allowedOrigins)) {
            header("Access-Control-Allow-Origin: $origin");
            header("Access-Control-Allow-Credentials: true");
        } else {
            // Default to localhost:5173 if origin not recognized
            header("Access-Control-Allow-Origin: http://localhost:5173");
            header("Access-Control-Allow-Credentials: true");
        }
        
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
