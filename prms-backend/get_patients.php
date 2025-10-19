<?php
require 'cors.php';
require 'config.php';

// Get pagination parameters
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 25;
$search = isset($_GET['search']) ? trim($_GET['search']) : '';
$disease = isset($_GET['disease']) ? trim($_GET['disease']) : '';
$sortBy = isset($_GET['sortBy']) ? $_GET['sortBy'] : 'id';
$sortOrder = isset($_GET['sortOrder']) ? $_GET['sortOrder'] : 'asc';

// Validate parameters
$page = max(1, $page);
$limit = max(1, min(100, $limit)); // Limit between 1 and 100
$offset = ($page - 1) * $limit;

// Validate sort fields
$allowedSortFields = ['id', 'full_name', 'age', 'sex', 'address', 'created_at', 'last_visit_date'];
if (!in_array($sortBy, $allowedSortFields)) {
    $sortBy = 'id';
}

$sortOrder = strtoupper($sortOrder) === 'DESC' ? 'DESC' : 'ASC';

// Build search condition with prepared statements
$whereConditions = [];
$params = [];
$paramTypes = '';

if (!empty($search)) {
    $whereConditions[] = "(p.full_name LIKE ? OR p.address LIKE ? OR p.sex LIKE ?)";
    $searchParam = "%$search%";
    $params[] = $searchParam;
    $params[] = $searchParam;
    $params[] = $searchParam;
    $paramTypes .= 'sss';
}

if (!empty($disease) && $disease !== 'all') {
    if ($disease === 'healthy') {
        // Filter for patients with no medical records or no diagnosis
        $whereConditions[] = "(mr.diagnosis IS NULL OR mr.diagnosis = '' OR mr.diagnosis = 'Healthy')";
    } else {
        // Filter for patients with specific disease
        $whereConditions[] = "mr.diagnosis = ?";
        $params[] = $disease;
        $paramTypes .= 's';
    }
}

$searchCondition = !empty($whereConditions) ? "WHERE " . implode(' AND ', $whereConditions) : "";

// Debug mode - uncomment to see SQL queries
// error_log("Search condition: " . $searchCondition);
// error_log("Disease filter: " . $disease);

// Get total count for pagination using prepared statements
$countSql = "
    SELECT COUNT(*) as total
    FROM patients p
    LEFT JOIN (
        SELECT 
            patient_id,
            diagnosis,
            ROW_NUMBER() OVER (PARTITION BY patient_id ORDER BY updated_at DESC) as rn
        FROM medical_records
    ) mr ON p.id = mr.patient_id AND mr.rn = 1
    $searchCondition
";

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

// Get patients with pagination using prepared statements
$sql = "
    SELECT 
        p.*,
        mr.diagnosis,
        COALESCE(
            mr.date_of_consultation,
            mr.date_of_consultation_medical, 
            mr.updated_at,
            p.created_at
        ) as last_visit_date
    FROM patients p
    LEFT JOIN (
        SELECT 
            patient_id,
            diagnosis,
            date_of_consultation,
            date_of_consultation_medical,
            updated_at,
            ROW_NUMBER() OVER (PARTITION BY patient_id ORDER BY updated_at DESC) as rn
        FROM medical_records
    ) mr ON p.id = mr.patient_id AND mr.rn = 1
    $searchCondition
    ORDER BY p.$sortBy $sortOrder
    LIMIT ? OFFSET ?
";

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
$patients = [];
while ($row = $result->fetch_assoc()) {
    $patients[] = $row;
}

// Return paginated response
echo json_encode([
    'success' => true,
    'data' => $patients,
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
