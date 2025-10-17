<?php
// CORS handling without hardcoding
function setCorsHeaders() {
    if (!headers_sent()) {
        // Get the origin from the request
        $origin = $_SERVER['HTTP_ORIGIN'] ?? 'http://localhost:5173';
        
        // Allow specific origins for credentials
        $allowedOrigins = [
            'http://localhost:5173',
            'http://localhost:3000',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:3000'
        ];
        
        if (in_array($origin, $allowedOrigins)) {
            header("Access-Control-Allow-Origin: $origin");
        } else {
            header("Access-Control-Allow-Origin: *");
        }
        
        header("Access-Control-Allow-Credentials: true");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
        header("Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS");
        header('Content-Type: application/json');
    }
}

// Set headers only if not already sent
setCorsHeaders();

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit; 
}
