<?php
require_once __DIR__ . '/_init.php';

header('Content-Type: application/json');

$user = current_user_or_401();

echo json_encode([
    'success' => true,
    'user' => $user
]);
