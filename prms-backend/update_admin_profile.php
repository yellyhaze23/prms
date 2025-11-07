<?php
/**
 * Update Admin Profile Information
 * Updates profile data for the currently logged-in admin user
 */

require 'cors.php';
require 'config.php';

// Set JSON header
header('Content-Type: application/json');

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
error_log("Update Profile - Session ID: " . session_id());
error_log("Update Profile - User ID: " . ($_SESSION['user_id'] ?? 'NOT SET'));

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    error_log("Update Profile - Unauthorized: No user_id in session");
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized - Please log in']);
    exit;
}

$user_id = $_SESSION['user_id'];

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
$errors = [];

if (empty($input['full_name'])) {
    $errors[] = 'Full name is required';
}

if (empty($input['email'])) {
    $errors[] = 'Email is required';
} elseif (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Invalid email format';
}

if (empty($input['phone'])) {
    $errors[] = 'Phone number is required';
}

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Validation failed',
        'errors' => $errors
    ]);
    exit;
}

try {
    // Update profile
    $stmt = $conn->prepare("
        UPDATE users 
        SET 
            full_name = ?,
            email = ?,
            phone = ?,
            position = ?,
            department = ?,
            rhu_name = ?,
            rhu_address = ?
        WHERE id = ?
    ");
    
    $full_name = $input['full_name'];
    $email = $input['email'];
    $phone = $input['phone'];
    $position = $input['position'] ?? '';
    $department = $input['department'] ?? '';
    $rhu_name = $input['rhu_name'] ?? '';
    $rhu_address = $input['rhu_address'] ?? '';
    
    $stmt->bind_param(
        "sssssssi",
        $full_name,
        $email,
        $phone,
        $position,
        $department,
        $rhu_name,
        $rhu_address,
        $user_id
    );
    
    if ($stmt->execute()) {
        $stmt->close();
        
        // Log activity (non-blocking - don't fail if logging fails)
        try {
            $activity_stmt = $conn->prepare("
                INSERT INTO activity_logs (user_id, username, activity_type, description)
                VALUES (?, (SELECT username FROM users WHERE id = ?), 'profile_update', 'Updated profile information')
            ");
            if ($activity_stmt) {
                $activity_stmt->bind_param("ii", $user_id, $user_id);
                $activity_stmt->execute();
                $activity_stmt->close();
            }
        } catch (Exception $logError) {
            // Log error but don't fail the request
            error_log("Failed to log activity: " . $logError->getMessage());
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Profile updated successfully'
        ]);
        exit;
    } else {
        throw new Exception("Failed to update profile");
    }
    
} catch (Exception $e) {
    error_log("Error updating admin profile: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to update profile: ' . $e->getMessage()
    ]);
    exit;
}

