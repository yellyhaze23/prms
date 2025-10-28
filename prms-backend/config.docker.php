<?php
/**
 * Database Configuration for Docker Environment
 * This file is used when running PRMS in Docker containers
 */

// Get database credentials from environment variables
$host     = getenv('DB_HOST') ?: 'db';
$dbuser   = getenv('DB_USER') ?: 'prms_user';
$dbpass   = getenv('DB_PASSWORD') ?: 'prms_pass_2024';
$dbname   = getenv('DB_NAME') ?: 'prms_db';

// Create database connection
try {
    $conn = new mysqli($host, $dbuser, $dbpass, $dbname);
    
    // Check connection
    if ($conn->connect_error) {
        error_log("Database connection failed: " . $conn->connect_error);
        die(json_encode([
            'success' => false,
            'message' => 'Database connection failed'
        ]));
    }
    
    // Set charset to utf8mb4
    $conn->set_charset("utf8mb4");
    
} catch (Exception $e) {
    error_log("Database error: " . $e->getMessage());
    die(json_encode([
        'success' => false,
        'message' => 'Database error occurred'
    ]));
}
?>