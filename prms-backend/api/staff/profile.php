<?php
require_once __DIR__ . '/_init.php';
$user = current_user_or_401();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  json_ok([ 'username' => $user['username'], 'name' => $user['name'], 'email' => '', 'phone' => '' ]);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
  $input = json_decode(file_get_contents('php://input'), true) ?: [];
  // Placeholder: accept and echo
  json_ok(['updated' => true]);
  exit;
}

echo json_encode(['error' => 'Method not allowed']);
http_response_code(405);
