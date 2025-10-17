<?php
require 'cors.php';
require 'config.php';

// Get pagination parameters
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 25;
$search = isset($_GET['search']) ? trim($_GET['search']) : '';
$sortBy = isset($_GET['sortBy']) ? $_GET['sortBy'] : 'updated_at';
$sortOrder = isset($_GET['sortOrder']) ? $_GET['sortOrder'] : 'desc';
$diseaseFilter = isset($_GET['disease']) ? trim($_GET['disease']) : '';
$patientId = isset($_GET['patient_id']) ? (int)$_GET['patient_id'] : null;

// Validate parameters
$page = max(1, $page);
$limit = max(1, min(100, $limit)); // Limit between 1 and 100
$offset = ($page - 1) * $limit;

// Validate sort fields
$allowedSortFields = ['id', 'patient_id', 'diagnosis', 'date_of_consultation', 'updated_at', 'created_at', 'full_name'];
if (!in_array($sortBy, $allowedSortFields)) {
    $sortBy = 'updated_at';
}

$sortOrder = strtoupper($sortOrder) === 'DESC' ? 'DESC' : 'ASC';

// Build search condition
$searchCondition = '';
$params = [];
$paramTypes = '';

if (!empty($search)) {
    $search = mysqli_real_escape_string($conn, $search);
    $searchCondition .= " AND (mr.diagnosis LIKE '%$search%' OR p.full_name LIKE '%$search%' OR mr.chief_complaint LIKE '%$search%')";
}

if (!empty($diseaseFilter) && $diseaseFilter !== 'all') {
    $diseaseFilter = mysqli_real_escape_string($conn, $diseaseFilter);
    $searchCondition .= " AND mr.diagnosis = '$diseaseFilter'";
}

// Filter by patient_id if provided
if (!empty($patientId) && $patientId > 0) {
    $patientId = (int)$patientId; // Ensure it's an integer
    $searchCondition .= " AND mr.patient_id = $patientId";
}

// Get total count for pagination
$countSql = "
    SELECT COUNT(*) as total
    FROM medical_records mr
    JOIN patients p ON mr.patient_id = p.id
    WHERE 1=1 $searchCondition
";

$countResult = mysqli_query($conn, $countSql);
$totalRecords = mysqli_fetch_assoc($countResult)['total'];
$totalPages = ceil($totalRecords / $limit);

// Get medical records with pagination
$sql = "
    SELECT 
        mr.id,
        mr.patient_id,
        mr.surname,
        mr.first_name,
        mr.middle_name,
        mr.suffix,
        mr.date_of_birth,
        mr.philhealth_id,
        mr.priority,
        mr.blood_pressure,
        mr.temperature,
        mr.height,
        mr.weight,
        mr.chief_complaint,
        mr.place_of_consultation,
        mr.type_of_services,
        mr.date_of_consultation,
        mr.health_provider,
        mr.diagnosis,
        mr.laboratory_procedure,
        mr.prescribed_medicine,
        mr.medical_advice,
        mr.place_of_consultation_medical,
        mr.date_of_consultation_medical,
        mr.health_provider_medical,
        mr.medical_remarks,
        mr.treatment,
        mr.created_at,
        mr.updated_at,
        p.sex,
        p.full_name,
        p.age,
        p.address
    FROM medical_records mr
    JOIN patients p ON mr.patient_id = p.id
    WHERE 1=1 $searchCondition
    ORDER BY mr.$sortBy $sortOrder
    LIMIT $limit OFFSET $offset
";

$result = mysqli_query($conn, $sql);

if (!$result) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . mysqli_error($conn)]);
    exit;
}

$records = [];
while ($row = mysqli_fetch_assoc($result)) {
    $records[] = $row;
}

// Return paginated response
echo json_encode([
    'success' => true,
    'data' => $records,
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