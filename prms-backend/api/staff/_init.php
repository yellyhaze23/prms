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
    $token = get_bearer_token();
    if ($token === 'test-staff-token') {
        return [ 'id' => 100, 'username' => 'staff1', 'role' => 'staff', 'name' => 'Staff User' ];
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
