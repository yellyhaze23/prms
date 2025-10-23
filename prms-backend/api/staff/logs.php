<?php
// Add CORS headers
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/_init.php';
$user = current_user_or_401();
$staffId = intval($user['id']);

// Get pagination parameters
$page = isset($_GET['page']) ? intval($_GET['page']) : 1;
$limit = isset($_GET['limit']) ? intval($_GET['limit']) : 25;
$offset = ($page - 1) * $limit;

// Get filter parameters
$action = $_GET['action'] ?? '';
$dateFrom = $_GET['date_from'] ?? '';
$dateTo = $_GET['date_to'] ?? '';

// Build WHERE clause
$where = ["user_id = $staffId", "user_type = 'staff'"];

if ($action) {
    $where[] = "action = '" . $conn->real_escape_string($action) . "'";
}

if ($dateFrom) {
    $where[] = "DATE(created_at) >= '" . $conn->real_escape_string($dateFrom) . "'";
}

if ($dateTo) {
    $where[] = "DATE(created_at) <= '" . $conn->real_escape_string($dateTo) . "'";
}

$whereClause = implode(' AND ', $where);

// Get total count
$countQuery = "SELECT COUNT(*) as total FROM audit_logs WHERE $whereClause";
$countResult = $conn->query($countQuery);
$totalRecords = $countResult ? intval($countResult->fetch_assoc()['total']) : 0;
$totalPages = ceil($totalRecords / $limit);

// Get logs with pagination
$query = "SELECT 
    al.*,
    s.username,
    s.full_name
FROM audit_logs al
LEFT JOIN staff s ON al.user_id = s.id AND al.user_type = 'staff'
WHERE $whereClause
ORDER BY al.created_at DESC
LIMIT $limit OFFSET $offset";

$result = $conn->query($query);
$logs = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $logs[] = $row;
    }
}

json_ok([
    'data' => $logs,
    'pagination' => [
        'currentPage' => $page,
        'totalPages' => $totalPages,
        'totalRecords' => $totalRecords,
        'itemsPerPage' => $limit
    ]
]);
