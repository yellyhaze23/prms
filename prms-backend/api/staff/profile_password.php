<?php
require_once __DIR__ . '/_init.php';
$user = current_user_or_401();

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
  $input = json_decode(file_get_contents('php://input'), true) ?: [];
  json_ok(['changed' => true]);
  exit;
}

echo json_encode(['error' => 'Method not allowed']);
http_response_code(405);
