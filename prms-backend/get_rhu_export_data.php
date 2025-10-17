<?php
require 'cors.php';
require 'config.php';

header("Content-Type: application/json");

try {
    // Get filter parameters
    $disease = isset($_GET['disease']) ? $_GET['disease'] : null;
    $days = isset($_GET['days']) ? (int)$_GET['days'] : 30;
    $barangay = isset($_GET['barangay']) ? $_GET['barangay'] : null;
    
    // Build WHERE conditions
    $where_conditions = [];
    $params = [];
    
    // Date range filter
    $where_conditions[] = "mr.updated_at >= DATE_SUB(NOW(), INTERVAL ? DAY)";
    $params[] = $days;
    
    // Disease filter
    if ($disease && $disease !== 'All') {
        $where_conditions[] = "mr.diagnosis = ?";
        $params[] = $disease;
    }
    
    // Barangay filter
    if ($barangay && $barangay !== 'All') {
        $where_conditions[] = "SUBSTRING_INDEX(p.address, ',', 1) = ?";
        $params[] = $barangay;
    }
    
    $where_clause = !empty($where_conditions) ? "WHERE " . implode(" AND ", $where_conditions) : "";
    
    // Get aggregated data per barangay, month, year with disease, age, and gender
    $sql = "
        SELECT 
            SUBSTRING_INDEX(p.address, ',', 1) as barangay,
            mr.diagnosis as disease,
            TIMESTAMPDIFF(YEAR, p.date_of_birth, CURDATE()) as age,
            p.sex as gender,
            DATE_FORMAT(mr.updated_at, '%Y-%m') as month_year,
            COUNT(*) as case_count
        FROM patients p
        JOIN (
            SELECT mr1.*
            FROM medical_records mr1
            INNER JOIN (
                SELECT patient_id, MAX(updated_at) as max_updated, MAX(id) as max_id
                FROM medical_records
                GROUP BY patient_id
            ) mr2 ON mr1.patient_id = mr2.patient_id AND mr1.updated_at = mr2.max_updated AND mr1.id = mr2.max_id
        ) mr ON p.id = mr.patient_id
        $where_clause
        AND mr.diagnosis IS NOT NULL AND mr.diagnosis != ''
        GROUP BY SUBSTRING_INDEX(p.address, ',', 1), mr.diagnosis, TIMESTAMPDIFF(YEAR, p.date_of_birth, CURDATE()), p.sex, DATE_FORMAT(mr.updated_at, '%Y-%m')
        ORDER BY barangay, month_year, disease, age, gender
    ";
    
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    
    if (!empty($params)) {
        $types = str_repeat('s', count($params));
        $stmt->bind_param($types, ...$params);
    }
    
    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }
    
    $result = $stmt->get_result();
    $exportData = [];
    
    while ($row = $result->fetch_assoc()) {
        $exportData[] = [
            'barangay' => $row['barangay'],
            'disease' => $row['disease'],
            'icd_code' => 'N/A', // ICD code not available in current database
            'age' => (int)$row['age'],
            'gender' => $row['gender'],
            'month_year' => $row['month_year'],
            'case_count' => (int)$row['case_count']
        ];
    }
    
    // Get all unique barangays for summary
    $barangaySql = "
        SELECT DISTINCT SUBSTRING_INDEX(p.address, ',', 1) as barangay
        FROM patients p
        WHERE p.address IS NOT NULL AND p.address != ''
        ORDER BY barangay
    ";
    
    $barangayResult = $conn->query($barangaySql);
    $barangays = [];
    while ($row = $barangayResult->fetch_assoc()) {
        $barangays[] = $row['barangay'];
    }
    
    echo json_encode([
        'success' => true,
        'data' => $exportData,
        'barangays' => $barangays,
        'total_records' => count($exportData),
        'generated_at' => date('Y-m-d H:i:s')
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
