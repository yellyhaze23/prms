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

// Build search condition
$searchCondition = '';
$conditions = [];

if (!empty($search)) {
    $search = mysqli_real_escape_string($conn, $search);
    $conditions[] = "(p.full_name LIKE '%$search%' OR p.address LIKE '%$search%' OR p.sex LIKE '%$search%')";
}

if (!empty($disease) && $disease !== 'all') {
    $disease = mysqli_real_escape_string($conn, $disease);
    if ($disease === 'healthy') {
        // Filter for patients with no medical records or no diagnosis
        $conditions[] = "(mr.diagnosis IS NULL OR mr.diagnosis = '' OR mr.diagnosis = 'Healthy')";
    } else {
        // Filter for patients with specific disease
        $conditions[] = "mr.diagnosis = '$disease'";
    }
}

if (!empty($conditions)) {
    $searchCondition = "WHERE " . implode(' AND ', $conditions);
}

// Debug mode - uncomment to see SQL queries
// error_log("Search condition: " . $searchCondition);
// error_log("Disease filter: " . $disease);

// Get total count for pagination
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

$countResult = mysqli_query($conn, $countSql);
if (!$countResult) {
    http_response_code(500);
    echo json_encode(['error' => 'Count query error: ' . mysqli_error($conn), 'sql' => $countSql]);
    exit;
}
$totalRecords = mysqli_fetch_assoc($countResult)['total'];
$totalPages = ceil($totalRecords / $limit);

// Get patients with pagination
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
    LIMIT $limit OFFSET $offset
";

$result = mysqli_query($conn, $sql);

if (!$result) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . mysqli_error($conn), 'sql' => $sql]);
    exit;
}

$patients = [];
while ($row = mysqli_fetch_assoc($result)) {
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
