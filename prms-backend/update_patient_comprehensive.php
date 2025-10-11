<?php
// Disable error display to prevent HTML output
error_reporting(0);
ini_set('display_errors', 0);

// Use proper CORS handling
require 'cors.php';
require 'config.php';

// Set connection collation to avoid collation conflicts
mysqli_query($conn, "SET NAMES utf8mb4 COLLATE utf8mb4_general_ci");
mysqli_query($conn, "SET CHARACTER SET utf8mb4");
mysqli_query($conn, "SET collation_connection = 'utf8mb4_general_ci'");

$data = json_decode(file_get_contents("php://input"), true);

// Debug logging for troubleshooting
error_log("Received data: " . json_encode($data));
error_log("Data keys: " . implode(', ', array_keys($data)));

if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'No data received.']);
    exit;
}

if (!isset($data['id']) || empty($data['id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing or invalid patient ID. Received: ' . json_encode($data)]);
    exit;
}

$patient_id = intval($data['id']);

// Start transaction
mysqli_autocommit($conn, false);

try {
    error_log("Starting update process for patient ID: " . $patient_id);
    
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

    // Update medical records - only include essential fields that should be in medical records
    $medicalFields = [
        'surname', 'first_name', 'middle_name', 'suffix', 'date_of_birth', 'philhealth_id', 'priority',
        'blood_pressure', 'temperature', 'height', 'weight', 'chief_complaint', 'place_of_consultation', 
        'type_of_services', 'date_of_consultation', 'health_provider', 'diagnosis', 'laboratory_procedure', 
        'prescribed_medicine', 'medical_advice', 'place_of_consultation_medical', 'date_of_consultation_medical', 
        'health_provider_medical', 'medical_remarks'
    ];

    // Key medical fields that should trigger a new consultation entry
    $criticalMedicalFields = [
        'diagnosis', 'chief_complaint', 'health_provider', 'prescribed_medicine', 
        'medical_advice', 'laboratory_procedure', 'medical_remarks'
    ];

    $updateFields = [];
    $hasMedicalChanges = false;
    
    foreach ($medicalFields as $field) {
        if (isset($data[$field])) {
            if (in_array($field, ['height', 'weight'])) {
                $value = floatval($data[$field]);
                $updateFields[] = "$field = $value";
            } else {
                $value = $data[$field];
                // Handle empty date fields - set to NULL instead of empty string
                if (in_array($field, ['date_of_birth', 'date_of_consultation', 'date_of_consultation_medical']) && empty($value)) {
                    $updateFields[] = "$field = NULL";
                } else {
                    $value = mysqli_real_escape_string($conn, $value);
                    $updateFields[] = "$field = '$value'";
                }
            }
            
            // Check if this is a critical medical field with actual content
            if (in_array($field, $criticalMedicalFields) && !empty(trim($data[$field]))) {
                $hasMedicalChanges = true;
            }
        }
    }
    
    error_log("Medical changes detected: " . ($hasMedicalChanges ? 'YES' : 'NO'));
    error_log("Total fields to update: " . count($updateFields));

    if (!empty($updateFields)) {
        $updateFields[] = "updated_at = NOW()";
        
        // Only create new consultation entry if there are actual medical changes
        if ($hasMedicalChanges) {
            error_log("Creating new consultation entry due to medical changes");
            
            // Automatically set consultation date to today if not explicitly provided
            if (!isset($data['date_of_consultation']) || empty($data['date_of_consultation'])) {
                // Only add if not already in the fields
                $hasDateOfConsultation = false;
                foreach ($updateFields as $field) {
                    if (strpos($field, 'date_of_consultation') === 0) {
                        $hasDateOfConsultation = true;
                        break;
                    }
                }
                if (!$hasDateOfConsultation) {
                    $updateFields[] = "date_of_consultation = CURDATE()";
                }
            }
            
            // INSERT a new medical record for new consultation
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

            if (!mysqli_query($conn, $medicalSql)) {
                throw new Exception('Failed to create new consultation record: ' . mysqli_error($conn));
            }
        } else {
            error_log("No medical changes detected - skipping new consultation entry");
        }
    } else {
        error_log("No medical fields to update");
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
