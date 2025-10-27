<?php
/**
 * Centralized Session Initialization
 * Use this to ensure consistent session configuration across all PHP files
 */

// Set session save path explicitly
session_save_path('/var/lib/php/sessions');

// Configure session cookie parameters
if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params([
        'lifetime' => 86400,  // 24 hours
        'path' => '/',
        'domain' => '',
        'secure' => false,
        'httponly' => true,
        'samesite' => 'Lax'
    ]);
    session_start();
}

// Log session info for debugging
error_log("Session initialized - ID: " . session_id() . ", Save Path: " . session_save_path());

