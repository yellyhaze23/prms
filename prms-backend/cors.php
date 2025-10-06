<?php
// CORS handling without hardcoding
function setCorsHeaders() {
    if (!headers_sent()) {
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Headers: Content-Type, Authorization");
        header("Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS");
        header('Content-Type: application/json');
    }
}

// Set headers only if not already sent
setCorsHeaders();

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit; 
}
