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
$activity_type = $_GET['activity_type'] ?? '';
$date_from = $_GET['date_from'] ?? '';
$date_to = $_GET['date_to'] ?? '';

// Validate parameters
$page = max(1, $page);
$limit = max(1, min(100, $limit)); // Limit between 1 and 100
$offset = ($page - 1) * $limit;

// Validate sort fields
$allowedSortFields = ['id', 'user_id', 'user_type', 'activity_type', 'description', 'ip_address', 'created_at'];
if (!in_array($sortBy, $allowedSortFields)) {
    $sortBy = 'created_at';
}

$sortOrder = strtoupper($sortOrder) === 'DESC' ? 'DESC' : 'ASC';

// Build search condition
$searchCondition = '';
if (!empty($search)) {
    $search = mysqli_real_escape_string($conn, $search);
    $searchCondition = " AND (activity_type LIKE '%$search%' OR user_type LIKE '%$search%' OR description LIKE '%$search%' OR ip_address LIKE '%$search%')";
}

// Build filter conditions
$filterConditions = '';
if ($user_type) {
    $user_type = mysqli_real_escape_string($conn, $user_type);
    $filterConditions .= " AND user_type = '$user_type'";
}

if ($activity_type) {
    $activity_type = mysqli_real_escape_string($conn, $activity_type);
    $filterConditions .= " AND activity_type LIKE '%$activity_type%'";
}

if ($date_from) {
    $date_from = mysqli_real_escape_string($conn, $date_from);
    $filterConditions .= " AND DATE(created_at) >= '$date_from'";
}

if ($date_to) {
    $date_to = mysqli_real_escape_string($conn, $date_to);
    $filterConditions .= " AND DATE(created_at) <= '$date_to'";
}

// Get total count for pagination
$countSql = "SELECT COUNT(*) as total FROM activity_logs WHERE 1=1 $searchCondition $filterConditions";
$countResult = mysqli_query($conn, $countSql);
$totalRecords = mysqli_fetch_assoc($countResult)['total'];
$totalPages = ceil($totalRecords / $limit);

// Get activity logs with pagination
$sql = "SELECT * FROM activity_logs WHERE 1=1 $searchCondition $filterConditions ORDER BY $sortBy $sortOrder LIMIT $limit OFFSET $offset";
$result = mysqli_query($conn, $sql);

if (!$result) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . mysqli_error($conn)]);
    exit;
}

$logs = [];
while ($row = mysqli_fetch_assoc($result)) {
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
