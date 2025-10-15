<?php
require 'cors.php';
require 'config.php';

header('Content-Type: application/json');

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Check if user is logged in
if (isset($_SESSION['user_id']) && isset($_SESSION['username'])) {
    // Get user details from database
    $sql = "SELECT id, username FROM users WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $_SESSION['user_id']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();
        echo json_encode([
            'success' => true,
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'name' => $user['username'],
                'role' => 'admin'
            ]
        ]);
    } else {
        // Fallback to session data
        echo json_encode([
            'success' => true,
            'user' => [
                'id' => $_SESSION['user_id'],
                'username' => $_SESSION['username'],
                'name' => $_SESSION['name'] ?? $_SESSION['username'],
                'role' => $_SESSION['role'] ?? 'admin'
            ]
        ]);
    }
} else {
    // No session, get admin user from database (get the first user as admin)
    $sql = "SELECT id, username FROM users ORDER BY id LIMIT 1";
    $result = $conn->query($sql);
    
    if ($result && $result->num_rows > 0) {
        $user = $result->fetch_assoc();
        echo json_encode([
            'success' => true,
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'name' => $user['username'],
                'role' => 'admin'
            ]
        ]);
    } else {
        // Fallback to default admin
        echo json_encode([
            'success' => true,
            'user' => [
                'id' => 1,
                'username' => 'admin',
                'name' => 'Admin',
                'role' => 'admin'
            ]
        ]);
    }
}
?>
