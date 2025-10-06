<?php
require_once __DIR__ . '/_init.php';
$user = current_user_or_401();
json_ok(['url' => null]);
