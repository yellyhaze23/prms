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
            mr.diagnosis_date,
            mr.onset_date,
            mr.symptoms,
            mr.treatment,
            mr.medical_advice,
            mr.notes,
            mr.date_of_consultation,
            mr.updated_at
        FROM patients p
        INNER JOIN medical_records mr ON p.id = mr.patient_id
        WHERE mr.diagnosis = ?
        ORDER BY mr.diagnosis_date DESC, mr.updated_at DESC
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
            'diagnosis_date' => $row['diagnosis_date'],
            'onset_date' => $row['onset_date'],
            'symptoms' => $row['symptoms'],
            'treatment' => $row['treatment'],
            'medical_advice' => $row['medical_advice'],
            'notes' => $row['notes'],
            'consultation_date' => $row['date_of_consultation'],
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
