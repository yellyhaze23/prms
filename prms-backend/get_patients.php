<?php
require 'cors.php';
require 'config.php';

$sql = "SELECT p.*, h.previous_illness, h.onset_date, h.diagnosis_date, h.severity, h.status, h.symptoms, h.treatment, h.vaccination_status, h.contact_tracing, h.notes, h.reported_by, h.reported_date, h.updated_at as last_visit_date
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
        ORDER BY p.id";
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
