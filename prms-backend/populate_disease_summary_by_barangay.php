<?php
/**
 * Populate disease_summary_by_barangay table from patients and medical_records
 * This script aggregates disease cases by barangay and month
 */

require 'cors.php';
require 'config.php';

header("Content-Type: application/json");

try {
    // First, check if the table exists
    $check_table = "SHOW TABLES LIKE 'disease_summary_by_barangay'";
    $result = $conn->query($check_table);
    
    if ($result->num_rows == 0) {
        throw new Exception("Table disease_summary_by_barangay does not exist. Please create it first using create_disease_summary_by_barangay.sql");
    }
    
    // Clear existing data (optional - comment out if you want to preserve data)
    $conn->query("TRUNCATE TABLE disease_summary_by_barangay");
    
    // Populate disease_summary_by_barangay from patients and medical_records
    $sql = "
    INSERT INTO disease_summary_by_barangay (disease_name, barangay_id, year, month, total_cases)
    SELECT 
        mr.diagnosis as disease_name,
        p.barangay_id,
        YEAR(COALESCE(mr.date_of_consultation, mr.updated_at, mr.created_at)) as year,
        MONTH(COALESCE(mr.date_of_consultation, mr.updated_at, mr.created_at)) as month,
        COUNT(*) as total_cases
    FROM medical_records mr
    INNER JOIN patients p ON mr.patient_id = p.id
    WHERE mr.diagnosis IS NOT NULL 
        AND mr.diagnosis != ''
        AND TRIM(mr.diagnosis) != ''
        AND p.barangay_id IS NOT NULL
        AND (mr.date_of_consultation IS NOT NULL OR mr.updated_at IS NOT NULL OR mr.created_at IS NOT NULL)
    GROUP BY mr.diagnosis, p.barangay_id, 
             YEAR(COALESCE(mr.date_of_consultation, mr.updated_at, mr.created_at)), 
             MONTH(COALESCE(mr.date_of_consultation, mr.updated_at, mr.created_at))
    ON DUPLICATE KEY UPDATE 
        total_cases = VALUES(total_cases),
        updated_at = CURRENT_TIMESTAMP
    ";
    
    if ($conn->query($sql)) {
        // Get statistics
        $stats_sql = "
        SELECT 
            COUNT(*) as total_records,
            COUNT(DISTINCT disease_name) as unique_diseases,
            COUNT(DISTINCT barangay_id) as unique_barangays,
            SUM(total_cases) as total_cases
        FROM disease_summary_by_barangay
        ";
        
        $stats_result = $conn->query($stats_sql);
        $stats = $stats_result->fetch_assoc();
        
        // Get sample data
        $sample_sql = "
        SELECT 
            dsb.disease_name,
            b.name as barangay_name,
            dsb.year,
            dsb.month,
            dsb.total_cases
        FROM disease_summary_by_barangay dsb
        INNER JOIN barangays b ON dsb.barangay_id = b.id
        ORDER BY dsb.updated_at DESC
        LIMIT 10
        ";
        
        $sample_result = $conn->query($sample_sql);
        $samples = [];
        while ($row = $sample_result->fetch_assoc()) {
            $samples[] = $row;
        }
        
        echo json_encode([
            'success' => true, 
            'message' => 'Disease summary by barangay populated successfully',
            'statistics' => [
                'total_records' => (int)$stats['total_records'],
                'unique_diseases' => (int)$stats['unique_diseases'],
                'unique_barangays' => (int)$stats['unique_barangays'],
                'total_cases_aggregated' => (int)$stats['total_cases']
            ],
            'sample_data' => $samples
        ]);
    } else {
        throw new Exception("Failed to populate data: " . $conn->error);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

$conn->close();
?>

