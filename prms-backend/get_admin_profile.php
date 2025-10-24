<?php
/**
 * Get Admin Profile Information
 * Returns profile data for the currently logged-in admin user
 */

require 'cors.php';
require 'config.php';

// Configure session cookie for cross-origin requests
if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'domain' => '',
        'secure' => false,
        'httponly' => true,
        'samesite' => 'Lax'
    ]);
    session_start();
}

// Log session debug info
error_log("Get Admin Profile - Session ID: " . session_id());
error_log("Get Admin Profile - User ID: " . ($_SESSION['user_id'] ?? 'NOT SET'));
error_log("Get Admin Profile - Role: " . ($_SESSION['role'] ?? 'NOT SET'));
error_log("Get Admin Profile - Cookie: " . (isset($_COOKIE[session_name()]) ? $_COOKIE[session_name()] : 'NOT SET'));
error_log("Get Admin Profile - Session Name: " . session_name());

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    error_log("Get Admin Profile - UNAUTHORIZED: No user_id in session");
    error_log("Get Admin Profile - All SESSION data: " . print_r($_SESSION, true));
    error_log("Get Admin Profile - All COOKIE data: " . print_r($_COOKIE, true));
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized - Please log in']);
    exit;
}

$user_id = $_SESSION['user_id'];

try {
    // Get user profile data
    $stmt = $conn->prepare("
        SELECT 
            id,
            username,
            role,
            full_name,
            email,
            phone,
            position,
            department,
            rhu_name,
            rhu_address,
            created_at
        FROM users 
        WHERE id = ?
    ");
    
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $profile = $result->fetch_assoc();
        
        echo json_encode([
            'success' => true,
            'data' => $profile
        ]);
    } else {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Profile not found'
        ]);
    }
    
    $stmt->close();
} catch (Exception $e) {
    error_log("Error fetching admin profile: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to fetch profile'
    ]);
}

$conn->close();
?>

