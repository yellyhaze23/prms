<?php
require 'cors.php';
require 'config.php';

// Get patients with their most recent medical activity (consultation dates or any medical record update)
$sql = "
    SELECT 
        p.*,
        mr.diagnosis,
        mr.status,
        mr.severity,
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
            status,
            severity,
            date_of_consultation,
            date_of_consultation_medical,
            updated_at,
            ROW_NUMBER() OVER (PARTITION BY patient_id ORDER BY updated_at DESC) as rn
        FROM medical_records
    ) mr ON p.id = mr.patient_id AND mr.rn = 1
    ORDER BY p.id
";

$result = mysqli_query($conn, $sql);

if (!$result) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . mysqli_error($conn)]);
    exit;
}

$patients = [];
while ($row = mysqli_fetch_assoc($result)) {
    $patients[] = $row;
}

echo json_encode($patients);
?>
