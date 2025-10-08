<?php
// Disable error display to prevent HTML output
error_reporting(0);
ini_set('display_errors', 0);

// Use proper CORS handling
require 'cors.php';
require 'config.php';

$data = json_decode(file_get_contents("php://input"), true);

// Debug logging (commented out for production)
// error_log("Received data: " . json_encode($data));
// error_log("Patient ID: " . $patient_id);
// error_log("Data keys: " . implode(', ', array_keys($data)));

if (!$data || !isset($data['id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required patient ID.']);
    exit;
}

$patient_id = intval($data['id']);

// Start transaction
mysqli_autocommit($conn, false);

try {
    // Update patient basic information
    if (isset($data['full_name']) || isset($data['date_of_birth']) || isset($data['sex']) || isset($data['address'])) {
        $full_name = mysqli_real_escape_string($conn, $data['full_name'] ?? '');
        $date_of_birth = $data['date_of_birth'] ?? '';
        $sex = mysqli_real_escape_string($conn, $data['sex'] ?? '');
        $address = mysqli_real_escape_string($conn, $data['address'] ?? '');

        // Handle empty date_of_birth - set to NULL
        if (empty($date_of_birth)) {
            $date_of_birth_sql = 'NULL';
            $age = 0;
        } else {
            $date_of_birth = mysqli_real_escape_string($conn, $date_of_birth);
            $date_of_birth_sql = "'$date_of_birth'";
            
            // Calculate age from date of birth
            $birthDate = new DateTime($date_of_birth);
            $today = new DateTime();
            $age = $today->diff($birthDate)->y;
        }

        $patientSql = "UPDATE patients SET 
                        full_name = '$full_name',
                        date_of_birth = $date_of_birth_sql,
                        sex = '$sex',
                        age = '$age',
                        address = '$address'
                    WHERE id = $patient_id";

        if (!mysqli_query($conn, $patientSql)) {
            throw new Exception('Failed to update patient: ' . mysqli_error($conn));
        }
    }

    // Update medical records
    $medicalFields = [
        'surname', 'first_name', 'middle_name', 'suffix', 'date_of_birth', 'philhealth_id', 'priority',
        'blood_pressure', 'temperature', 'height', 'weight', 'chief_complaint', 'place_of_consultation', 
        'type_of_services', 'date_of_consultation', 'health_provider', 'diagnosis', 'laboratory_procedure', 
        'prescribed_medicine', 'medical_advice', 'place_of_consultation_medical', 'date_of_consultation_medical', 
        'health_provider_medical', 'medical_remarks', 'exam_date', 'bmi', 'ideal_weight', 'vision_with_glasses', 
        'vision_without_glasses', 'eent', 'lungs', 'heart', 'abdomen', 'extremities', 'previous_illness', 
        'recommendation', 'onset_date', 'diagnosis_date', 'severity', 'status', 'symptoms', 'treatment', 
        'vaccination_status', 'contact_tracing', 'notes', 'reported_by', 'reported_date'
    ];

    $updateFields = [];
    foreach ($medicalFields as $field) {
        if (isset($data[$field])) {
            if (in_array($field, ['height', 'weight', 'bmi', 'ideal_weight'])) {
                $value = floatval($data[$field]);
                $updateFields[] = "$field = $value";
            } else {
                $value = $data[$field];
                // Handle empty date fields - set to NULL instead of empty string
                if (in_array($field, ['date_of_birth', 'date_of_consultation', 'date_of_consultation_medical', 'exam_date', 'onset_date', 'diagnosis_date', 'reported_date']) && empty($value)) {
                    $updateFields[] = "$field = NULL";
                } else {
                    $value = mysqli_real_escape_string($conn, $value);
                    $updateFields[] = "$field = '$value'";
                }
            }
            // error_log("Processing field: $field = " . $data[$field]);
        }
    }
    
    // error_log("Total fields to update: " . count($updateFields));

    if (!empty($updateFields)) {
        $updateFields[] = "updated_at = NOW()";
        
        // Automatically set consultation date to today if not explicitly provided
        // This ensures Last Visit updates when any medical record is modified
        if (!isset($data['date_of_consultation']) || empty($data['date_of_consultation'])) {
            $updateFields[] = "date_of_consultation = CURDATE()";
        }
        
        // Check if medical record exists for this patient
        $checkSql = "SELECT id FROM medical_records WHERE patient_id = $patient_id";
        $checkResult = mysqli_query($conn, $checkSql);
        
        if (mysqli_num_rows($checkResult) > 0) {
            // UPDATE existing medical record
            $medicalSql = "UPDATE medical_records SET " . implode(', ', $updateFields) . " WHERE patient_id = $patient_id";
            // error_log("Updating existing medical record: " . $medicalSql);
        } else {
            // INSERT new medical record for new patients
            $insertFields = ['patient_id'];
            $insertValues = [$patient_id];
            
            foreach ($updateFields as $field) {
                if (strpos($field, ' = ') !== false) {
                    $fieldName = trim(explode(' = ', $field)[0]);
                    $fieldValue = trim(explode(' = ', $field)[1]);
                    $insertFields[] = $fieldName;
                    $insertValues[] = $fieldValue;
                }
            }
            
            $medicalSql = "INSERT INTO medical_records (" . implode(', ', $insertFields) . ") VALUES (" . implode(', ', $insertValues) . ")";
            // error_log("Creating new medical record: " . $medicalSql);
        }

        if (!mysqli_query($conn, $medicalSql)) {
            throw new Exception('Failed to update medical records: ' . mysqli_error($conn));
        }
    } else {
        // error_log("No medical fields to update");
    }

    // Commit transaction
    mysqli_commit($conn);

    echo json_encode([
        'success' => true,
        'message' => 'Patient and medical records updated successfully'
    ]);

} catch (Exception $e) {
    // Rollback transaction
    mysqli_rollback($conn);
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

// Re-enable autocommit
mysqli_autocommit($conn, true);
?>
