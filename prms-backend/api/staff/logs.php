<?php
require_once __DIR__ . '/_init.php';
$user = current_user_or_401();

$logs = [
  [ 'created_at' => date('Y-m-d H:i:s'), 'action' => 'login', 'entity_type' => 'user', 'entity_id' => $user['id'], 'result' => 'success' ],
  [ 'created_at' => date('Y-m-d H:i:s', strtotime('-1 hour')), 'action' => 'view', 'entity_type' => 'patient', 'entity_id' => 4, 'result' => 'success' ],
];
json_ok($logs);
