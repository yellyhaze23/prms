<?php
// Start session BEFORE any headers
if (session_status() === PHP_SESSION_NONE) {
    session_name('STAFFSESSID');
    session_start();
}

require_once __DIR__ . '/_init.php';
$user = current_user_or_401();

$page = max(1, intval($_GET['page'] ?? 1));
$pageSize = max(1, min(100, intval($_GET['limit'] ?? 25))); // Allow 1-100 items per page
$offset = ($page - 1) * $pageSize;
$q = trim($_GET['q'] ?? '');
$disease = trim($_GET['disease'] ?? '');
$sortBy = $_GET['sortBy'] ?? 'id';
$sortOrder = strtoupper($_GET['sortOrder'] ?? 'asc') === 'DESC' ? 'DESC' : 'ASC';

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

// Add disease filtering
if (!empty($disease) && $disease !== 'All Patients') {
    $disease = $conn->real_escape_string($disease);
    if ($disease === 'healthy') {
        // For healthy patients, we need to join with medical_records to check diagnosis
        $whereParts[] = "id NOT IN (SELECT DISTINCT patient_id FROM medical_records WHERE diagnosis IS NOT NULL AND diagnosis != '' AND diagnosis != 'Healthy')";
    } else {
        // For specific diseases, join with medical_records
        $whereParts[] = "id IN (SELECT DISTINCT patient_id FROM medical_records WHERE diagnosis = '$disease')";
    }
}

$where = 'WHERE ' . implode(' AND ', $whereParts);

$totalRes = $conn->query("SELECT COUNT(*) as c FROM patients $where");
$total = $totalRes ? intval($totalRes->fetch_assoc()['c']) : 0;

// Validate sort field
$allowedSortFields = ['id', 'full_name', 'age', 'sex', 'address', 'created_at'];
if (!in_array($sortBy, $allowedSortFields)) {
    $sortBy = 'id';
}

$sql = "SELECT 
    p.id, 
    p.full_name, 
    p.age, 
    p.sex, 
    p.date_of_birth, 
    p.address, 
    p.created_at,
    (SELECT mr.surname FROM medical_records mr WHERE mr.patient_id = p.id ORDER BY mr.updated_at DESC LIMIT 1) as surname,
    (SELECT mr.first_name FROM medical_records mr WHERE mr.patient_id = p.id ORDER BY mr.updated_at DESC LIMIT 1) as first_name,
    (SELECT mr.middle_name FROM medical_records mr WHERE mr.patient_id = p.id ORDER BY mr.updated_at DESC LIMIT 1) as middle_name,
    (SELECT mr.suffix FROM medical_records mr WHERE mr.patient_id = p.id ORDER BY mr.updated_at DESC LIMIT 1) as suffix,
    (SELECT mr.philhealth_id FROM medical_records mr WHERE mr.patient_id = p.id ORDER BY mr.updated_at DESC LIMIT 1) as philhealth_id,
    (SELECT mr.priority FROM medical_records mr WHERE mr.patient_id = p.id ORDER BY mr.updated_at DESC LIMIT 1) as priority,
    (SELECT mr2.diagnosis 
     FROM medical_records mr2 
     WHERE mr2.patient_id = p.id 
     AND mr2.diagnosis IS NOT NULL 
     AND mr2.diagnosis != '' 
     AND mr2.diagnosis != 'Healthy'
     ORDER BY mr2.updated_at DESC 
     LIMIT 1) as diagnosis,
    (SELECT mr3.updated_at 
     FROM medical_records mr3 
     WHERE mr3.patient_id = p.id 
     ORDER BY mr3.updated_at DESC 
     LIMIT 1) as last_visit_date
FROM patients p 
$where 
ORDER BY p.$sortBy $sortOrder 
LIMIT $pageSize OFFSET $offset";

$res = $conn->query($sql);
$list = [];
if ($res) {
  while ($row = $res->fetch_assoc()) { $list[] = $row; }
}

$totalPages = max(1, (int)ceil($total / $pageSize));
echo json_encode([
  'success' => true,
  'data' => $list,
  'pagination' => [
    'currentPage' => $page,
    'totalPages' => $totalPages,
    'totalRecords' => $total,
    'limit' => $pageSize,
    'hasNext' => $page < $totalPages,
    'hasPrev' => $page > 1
  ]
]);
