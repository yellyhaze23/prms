<?php
require 'cors.php';
require 'config.php';

header("Content-Type: application/json");

$sql = "
    SELECT 
        p.id AS patient_id,
        p.full_name,
        p.address,
        h.previous_illness AS disease
    FROM patients p
    LEFT JOIN (
        SELECT h1.*
        FROM health_examinations h1
        INNER JOIN (
            SELECT patient_id, MAX(updated_at) as max_updated, MAX(id) as max_id
            FROM health_examinations
            GROUP BY patient_id
        ) h2 ON h1.patient_id = h2.patient_id AND h1.updated_at = h2.max_updated AND h1.id = h2.max_id
    ) h ON p.id = h.patient_id
    WHERE p.address IS NOT NULL AND p.address != ''
";

$result = $conn->query($sql);

if (!$result) {
    http_response_code(500);
    echo json_encode(['error' => 'Query failed: ' . $conn->error]);
    exit;
}

$patients = [];

while ($row = $result->fetch_assoc()) {
    $patients[] = $row;
}

echo json_encode($patients);
?>
