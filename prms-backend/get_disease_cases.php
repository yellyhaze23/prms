<?php
require 'cors.php';
require 'config.php';

header("Content-Type: application/json");

$disease = $_GET['disease'] ?? '';

if (empty($disease)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Disease parameter is required']);
    exit;
}

try {
    // Get patients with specific disease from medical records
    $sql = "
        SELECT 
            p.id,
            p.full_name,
            p.date_of_birth,
            p.sex,
            p.address,
            mr.diagnosis,
            mr.chief_complaint,
            mr.health_provider,
            mr.prescribed_medicine,
            mr.medical_advice,
            mr.medical_remarks,
            mr.treatment,
            mr.date_of_consultation,
            mr.created_at,
            mr.updated_at
        FROM patients p
        INNER JOIN medical_records mr ON p.id = mr.patient_id
        WHERE mr.diagnosis = ?
        ORDER BY mr.date_of_consultation DESC, mr.created_at DESC
    ";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $disease);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $cases = [];
    while ($row = $result->fetch_assoc()) {
        // Calculate age from date of birth
        $age = 0;
        if ($row['date_of_birth']) {
            $birthDate = new DateTime($row['date_of_birth']);
            $today = new DateTime();
            $age = $today->diff($birthDate)->y;
        }
        
        $cases[] = [
            'patient_id' => $row['id'],
            'patient_name' => $row['full_name'],
            'age' => $age,
            'sex' => $row['sex'],
            'address' => $row['address'],
            'diagnosis' => $row['diagnosis'],
            'chief_complaint' => $row['chief_complaint'],
            'health_provider' => $row['health_provider'],
            'prescribed_medicine' => $row['prescribed_medicine'],
            'medical_advice' => $row['medical_advice'],
            'medical_remarks' => $row['medical_remarks'],
            'treatment' => $row['treatment'],
            'consultation_date' => $row['date_of_consultation'],
            'created_at' => $row['created_at'],
            'last_updated' => $row['updated_at']
        ];
    }
    
    echo json_encode([
        'success' => true,
        'disease' => $disease,
        'total_cases' => count($cases),
        'cases' => $cases
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to fetch disease cases: ' . $e->getMessage()
    ]);
}

$conn->close();
?>
