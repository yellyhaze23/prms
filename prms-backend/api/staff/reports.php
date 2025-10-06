<?php
require_once __DIR__ . '/_init.php';
$user = current_user_or_401();

$from = $_GET['from'] ?? null;
$to = $_GET['to'] ?? null;
$disease = $_GET['disease'] ?? null;

json_ok([
  'summary' => [
    'total_patients' => 0,
    'infected_patients' => 0,
    'healthy_patients' => 0,
  ],
  'filters' => compact('from', 'to', 'disease'),
]);
