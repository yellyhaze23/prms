<?php
require_once __DIR__ . '/_init.php';
$user = current_user_or_401();
json_ok([ 'id' => $user['id'], 'username' => $user['username'], 'role' => $user['role'], 'name' => $user['name'] ]);
