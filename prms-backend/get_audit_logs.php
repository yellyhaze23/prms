<?php
require 'cors.php';
require 'config.php';

header("Content-Type: application/json");

// Get pagination parameters
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 25;
$search = isset($_GET['search']) ? trim($_GET['search']) : '';
$sortBy = isset($_GET['sortBy']) ? $_GET['sortBy'] : 'created_at';
$sortOrder = isset($_GET['sortOrder']) ? $_GET['sortOrder'] : 'desc';

// Legacy filter parameters
$user_type = $_GET['user_type'] ?? '';
$action = $_GET['action'] ?? '';
$date_from = $_GET['date_from'] ?? '';
$date_to = $_GET['date_to'] ?? '';

// Validate parameters
$page = max(1, $page);
$limit = max(1, min(100, $limit)); // Limit between 1 and 100
$offset = ($page - 1) * $limit;

// Validate sort fields
$allowedSortFields = ['id', 'user_id', 'user_type', 'action', 'result', 'ip_address', 'user_agent', 'created_at'];
if (!in_array($sortBy, $allowedSortFields)) {
    $sortBy = 'created_at';
}

$sortOrder = strtoupper($sortOrder) === 'DESC' ? 'DESC' : 'ASC';

// Build search and filter conditions with prepared statements
$whereConditions = [];
$params = [];
$paramTypes = '';

if (!empty($search)) {
    $whereConditions[] = "(action LIKE ? OR user_type LIKE ? OR result LIKE ? OR ip_address LIKE ?)";
    $searchParam = "%$search%";
    $params[] = $searchParam;
    $params[] = $searchParam;
    $params[] = $searchParam;
    $params[] = $searchParam;
    $paramTypes .= 'ssss';
}

if ($user_type) {
    $whereConditions[] = "user_type = ?";
    $params[] = $user_type;
    $paramTypes .= 's';
}

if ($action) {
    $whereConditions[] = "action LIKE ?";
    $params[] = "%$action%";
    $paramTypes .= 's';
}

if ($date_from) {
    $whereConditions[] = "DATE(created_at) >= ?";
    $params[] = $date_from;
    $paramTypes .= 's';
}

if ($date_to) {
    $whereConditions[] = "DATE(created_at) <= ?";
    $params[] = $date_to;
    $paramTypes .= 's';
}

$whereClause = !empty($whereConditions) ? "WHERE " . implode(' AND ', $whereConditions) : "WHERE 1=1";

// Get total count for pagination using prepared statements
$countSql = "SELECT COUNT(*) as total FROM audit_logs $whereClause";
$countStmt = $conn->prepare($countSql);
if (!$countStmt) {
    http_response_code(500);
    echo json_encode(['error' => 'Count prepare failed: ' . $conn->error]);
    exit;
}

if (!empty($params)) {
    $countStmt->bind_param($paramTypes, ...$params);
}

if (!$countStmt->execute()) {
    http_response_code(500);
    echo json_encode(['error' => 'Count execute failed: ' . $countStmt->error]);
    exit;
}

$countResult = $countStmt->get_result();
$totalRecords = $countResult->fetch_assoc()['total'];
$totalPages = ceil($totalRecords / $limit);

// Get audit logs with pagination using prepared statements
$sql = "SELECT * FROM audit_logs $whereClause ORDER BY $sortBy $sortOrder LIMIT ? OFFSET ?";
$stmt = $conn->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['error' => 'Prepare failed: ' . $conn->error]);
    exit;
}

// Add limit and offset to parameters
$allParams = $params;
$allParams[] = $limit;
$allParams[] = $offset;
$allParamTypes = $paramTypes . 'ii';

if (!empty($allParams)) {
    $stmt->bind_param($allParamTypes, ...$allParams);
}

if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode(['error' => 'Execute failed: ' . $stmt->error]);
    exit;
}

$result = $stmt->get_result();
$logs = [];
while ($row = $result->fetch_assoc()) {
    $logs[] = $row;
}

// Return paginated response
echo json_encode([
    'success' => true,
    'data' => $logs,
    'pagination' => [
        'currentPage' => $page,
        'totalPages' => $totalPages,
        'totalRecords' => $totalRecords,
        'limit' => $limit,
        'hasNext' => $page < $totalPages,
        'hasPrev' => $page > 1
    ]
]);
?>
