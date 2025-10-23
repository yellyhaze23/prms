<?php
require 'cors.php';
require 'config.php';

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Check if session exists and is valid
if (isset($_SESSION['user_id']) && isset($_SESSION['last_activity'])) {
    // Get timeout settings from database
    $settingsSql = "SELECT session_timeout_minutes, session_warning_minutes FROM settings WHERE id = 1";
    $settingsResult = $conn->query($settingsSql);
    
    if ($settingsResult && $settingsResult->num_rows > 0) {
        $settings = $settingsResult->fetch_assoc();
        $timeout = $settings['session_timeout_minutes'] ?? 30; // minutes
        $warningTime = $settings['session_warning_minutes'] ?? 5; // minutes
    } else {
        $timeout = 30;
        $warningTime = 5;
    }
    
    $lastActivity = $_SESSION['last_activity'];
    $currentTime = time();
    $timeSinceActivity = ($currentTime - $lastActivity) / 60; // minutes
    
    if ($timeSinceActivity > $timeout) {
        // Session expired
        session_destroy();
        echo json_encode([
            'success' => false, 
            'expired' => true,
            'message' => 'Session expired due to inactivity'
        ]);
    } else {
        // Don't update last activity here - let the frontend handle activity detection
        $timeRemaining = $timeout - $timeSinceActivity;
        
        echo json_encode([
            'success' => true, 
            'timeRemaining' => round($timeRemaining, 2),
            'warningTime' => $warningTime,
            'shouldWarn' => $timeRemaining <= $warningTime && $timeRemaining > 0
        ]);
    }
} else {
    // No valid session
    echo json_encode([
        'success' => false, 
        'expired' => true,
        'message' => 'No active session found'
    ]);
}
?>
