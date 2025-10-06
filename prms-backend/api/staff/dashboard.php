<?php
require_once __DIR__ . '/_init.php';
$user = current_user_or_401();

$kpis = [
  'assigned_patients' => 3,
  'active_cases' => 1,
  'tasks_due_today' => 2,
];
json_ok([ 'kpis' => $kpis, 'charts' => [] ]);
