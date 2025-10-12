<?php
// Start session BEFORE any headers
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/_init.php';
$user = current_user_or_401();

$page = max(1, intval($_GET['page'] ?? 1));
$pageSize = 10;
$offset = ($page - 1) * $pageSize;
$q = trim($_GET['q'] ?? '');

// Ensure patients.added_by column exists; if not, instruct migration
$colCheck = $conn->query("SELECT COUNT(*) AS c FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'patients' AND COLUMN_NAME = 'added_by'");
$hasAddedBy = $colCheck && intval(($colCheck->fetch_assoc()['c'] ?? 0)) > 0;
if (!$hasAddedBy) {
    http_response_code(409);
    echo json_encode([
        'success' => false,
        'error' => "Missing column patients.added_by. Run: ALTER TABLE patients ADD COLUMN added_by INT NULL;",
        'meta' => [ 'page' => $page, 'pageSize' => $pageSize, 'total' => 0 ]
    ]);
    exit;
}

$staffId = intval($user['id']);

$whereParts = ["added_by = $staffId"];
if ($q !== '') {
    $qLike = '%' . $conn->real_escape_string($q) . '%';
    $whereParts[] = "(full_name LIKE '$qLike' OR address LIKE '$qLike')";
}
$where = 'WHERE ' . implode(' AND ', $whereParts);

$totalRes = $conn->query("SELECT COUNT(*) as c FROM patients $where");
$total = $totalRes ? intval($totalRes->fetch_assoc()['c']) : 0;

$sql = "SELECT id, full_name, age, sex, date_of_birth, address, created_at FROM patients $where ORDER BY id LIMIT $pageSize OFFSET $offset";
$res = $conn->query($sql);
$list = [];
if ($res) {
  while ($row = $res->fetch_assoc()) { $list[] = $row; }
}

$totalPages = max(1, (int)ceil($total / $pageSize));
echo json_encode([
  'success' => true,
  'data' => $list,
  'page' => $page,
  'total_pages' => $totalPages,
  'meta' => [ 'page' => $page, 'pageSize' => $pageSize, 'total' => $total ]
]);
