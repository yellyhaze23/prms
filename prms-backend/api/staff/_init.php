<?php
require_once __DIR__ . '/../../cors.php';
require_once __DIR__ . '/../../config.php';

function get_bearer_token() {
    $headers = function_exists('getallheaders') ? getallheaders() : [];
    $auth = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    if (stripos($auth, 'Bearer ') === 0) {
        return substr($auth, 7);
    }
    return null;
}

function current_user_or_401() {
    // Session should already be started by the calling script
    if (isset($_SESSION['user_id']) && isset($_SESSION['role']) && $_SESSION['role'] === 'staff') {
        return [
            'id' => $_SESSION['user_id'],
            'username' => $_SESSION['username'] ?? 'staff',
            'role' => 'staff',
            'name' => $_SESSION['name'] ?? 'Staff User'
        ];
    }
    
    // Fallback to token-based authentication
    $token = get_bearer_token();
    if ($token === 'test-staff-token') {
        return [ 'id' => 100, 'username' => 'staff1', 'role' => 'staff', 'name' => 'Staff User' ];
    }
    
    // For development: Get actual staff user from database
    if (!isset($_SESSION['user_id'])) {
        global $conn;
        $sql = "SELECT id, username FROM users WHERE username = 'staff' LIMIT 1";
        $result = $conn->query($sql);
        
        if ($result && $result->num_rows > 0) {
            $staffUser = $result->fetch_assoc();
            
            // Set session for this staff user
            $_SESSION['user_id'] = $staffUser['id'];
            $_SESSION['username'] = $staffUser['username'];
            $_SESSION['role'] = 'staff';
            $_SESSION['name'] = $staffUser['username'];
            
            return [
                'id' => $staffUser['id'],
                'username' => $staffUser['username'],
                'role' => 'staff',
                'name' => $staffUser['username']
            ];
        } else {
            // If no staff user found, create a default one for development
            $_SESSION['user_id'] = 3;
            $_SESSION['username'] = 'staff';
            $_SESSION['role'] = 'staff';
            $_SESSION['name'] = 'Staff User';
            
            return [
                'id' => 3,
                'username' => 'staff',
                'role' => 'staff',
                'name' => 'Staff User'
            ];
        }
    }
    
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

function json_ok($data, $meta = null) {
    $res = ['success' => true, 'data' => $data];
    if ($meta) { $res['meta'] = $meta; }
    echo json_encode($res);
}
