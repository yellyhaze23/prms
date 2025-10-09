<?php
require 'cors.php';
require 'config.php';

header("Content-Type: application/json");

try {
    // Get comprehensive report data
    $sql = "
        SELECT 
            p.id,
            p.full_name,
            p.date_of_birth,
            p.sex,
            p.address,
            p.created_at,
            mr.diagnosis as disease,
            mr.updated_at as last_visit,
            TIMESTAMPDIFF(YEAR, p.date_of_birth, CURDATE()) as age
        FROM patients p
        LEFT JOIN (
            SELECT mr1.*
            FROM medical_records mr1
            INNER JOIN (
                SELECT patient_id, MAX(updated_at) as max_updated, MAX(id) as max_id
                FROM medical_records
                GROUP BY patient_id
            ) mr2 ON mr1.patient_id = mr2.patient_id AND mr1.updated_at = mr2.max_updated AND mr1.id = mr2.max_id
        ) mr ON p.id = mr.patient_id
        ORDER BY p.created_at DESC
    ";
    
    $result = $conn->query($sql);
    if (!$result) {
        throw new Exception("Main query failed: " . $conn->error);
    }
    $patients = [];
    
    while ($row = $result->fetch_assoc()) {
        $patients[] = [
            'id' => (int)$row['id'],
            'full_name' => $row['full_name'],
            'date_of_birth' => $row['date_of_birth'],
            'age' => (int)$row['age'],
            'sex' => $row['sex'],
            'address' => $row['address'],
            'disease' => $row['disease'],
            'created_at' => $row['created_at'],
            'last_visit' => $row['last_visit']
        ];
    }
    
    // Get disease statistics
    $diseaseStats = [];
    $diseaseSql = "
        SELECT 
            mr.diagnosis as disease,
            COUNT(*) as total_cases,
            AVG(TIMESTAMPDIFF(YEAR, p.date_of_birth, CURDATE())) as avg_age,
            SUM(CASE WHEN p.sex = 'Male' THEN 1 ELSE 0 END) as male_cases,
            SUM(CASE WHEN p.sex = 'Female' THEN 1 ELSE 0 END) as female_cases
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
        WHERE mr.diagnosis IS NOT NULL AND mr.diagnosis != ''
        GROUP BY mr.diagnosis
        ORDER BY total_cases DESC
    ";
    
    $diseaseResult = $conn->query($diseaseSql);
    if (!$diseaseResult) {
        throw new Exception("Disease query failed: " . $conn->error);
    }
    while ($row = $diseaseResult->fetch_assoc()) {
        $diseaseStats[] = [
            'disease' => $row['disease'],
            'total_cases' => (int)$row['total_cases'],
            'avg_age' => round($row['avg_age'], 1),
            'male_cases' => (int)$row['male_cases'],
            'female_cases' => (int)$row['female_cases']
        ];
    }
    
    // Get location statistics
    $locationStats = [];
    $locationSql = "
        SELECT 
            SUBSTRING_INDEX(p.address, ',', 1) as barangay,
            COUNT(*) as total_cases,
            SUM(CASE WHEN mr.diagnosis IS NOT NULL AND mr.diagnosis != '' THEN 1 ELSE 0 END) as infected_cases,
            AVG(TIMESTAMPDIFF(YEAR, p.date_of_birth, CURDATE())) as avg_age
        FROM patients p
        LEFT JOIN (
            SELECT mr1.*
            FROM medical_records mr1
            INNER JOIN (
                SELECT patient_id, MAX(updated_at) as max_updated, MAX(id) as max_id
                FROM medical_records
                GROUP BY patient_id
            ) mr2 ON mr1.patient_id = mr2.patient_id AND mr1.updated_at = mr2.max_updated AND mr1.id = mr2.max_id
        ) mr ON p.id = mr.patient_id
        WHERE p.address IS NOT NULL AND p.address != ''
        GROUP BY SUBSTRING_INDEX(p.address, ',', 1)
        ORDER BY total_cases DESC
        LIMIT 20
    ";
    
    $locationResult = $conn->query($locationSql);
    if (!$locationResult) {
        throw new Exception("Location query failed: " . $conn->error);
    }
    while ($row = $locationResult->fetch_assoc()) {
        $locationStats[] = [
            'barangay' => $row['barangay'],
            'total_cases' => (int)$row['total_cases'],
            'infected_cases' => (int)$row['infected_cases'],
            'avg_age' => round($row['avg_age'], 1)
        ];
    }
    
    // Get trend data (last 30 days)
    $trendData = [];
    for ($i = 29; $i >= 0; $i--) {
        $date = date('Y-m-d', strtotime("-$i days"));
        $nextDate = date('Y-m-d', strtotime("-$i days +1 day"));
        
        $trendSql = "
            SELECT 
                COUNT(*) as total_patients,
                SUM(CASE WHEN mr.diagnosis IS NOT NULL AND mr.diagnosis != '' THEN 1 ELSE 0 END) as infected_patients
            FROM patients p
            LEFT JOIN (
                SELECT mr1.*
                FROM medical_records mr1
                INNER JOIN (
                    SELECT patient_id, MAX(updated_at) as max_updated, MAX(id) as max_id
                    FROM medical_records
                    GROUP BY patient_id
                ) mr2 ON mr1.patient_id = mr2.patient_id AND mr1.updated_at = mr2.max_updated AND mr1.id = mr2.max_id
            ) mr ON p.id = mr.patient_id
            WHERE DATE(p.created_at) = ?
        ";
        
        $stmt = $conn->prepare($trendSql);
        $stmt->bind_param("s", $date);
        $stmt->execute();
        $trendResult = $stmt->get_result();
        $trendRow = $trendResult->fetch_assoc();
        
        $trendData[] = [
            'date' => $date,
            'total_patients' => (int)$trendRow['total_patients'],
            'infected_patients' => (int)$trendRow['infected_patients']
        ];
    }
    
    // Calculate summary statistics
    $totalPatients = count($patients);
    $infectedPatients = count(array_filter($patients, function($p) { return $p['disease'] && $p['disease'] !== ''; }));
    $healthyPatients = $totalPatients - $infectedPatients;
    $infectionRate = $totalPatients > 0 ? round(($infectedPatients / $totalPatients) * 100, 1) : 0;
    
    // Age distribution
    $ageGroups = [
        '0-17' => 0,
        '18-30' => 0,
        '31-50' => 0,
        '51-70' => 0,
        '70+' => 0
    ];
    
    foreach ($patients as $patient) {
        $age = $patient['age'];
        if ($age <= 17) $ageGroups['0-17']++;
        elseif ($age <= 30) $ageGroups['18-30']++;
        elseif ($age <= 50) $ageGroups['31-50']++;
        elseif ($age <= 70) $ageGroups['51-70']++;
        else $ageGroups['70+']++;
    }
    
    // Gender distribution
    $genderStats = [
        'Male' => count(array_filter($patients, function($p) { return $p['sex'] === 'Male'; })),
        'Female' => count(array_filter($patients, function($p) { return $p['sex'] === 'Female'; }))
    ];
    
    echo json_encode([
        'success' => true,
        'data' => [
            'patients' => $patients,
            'summary' => [
                'total_patients' => $totalPatients,
                'infected_patients' => $infectedPatients,
                'healthy_patients' => $healthyPatients,
                'infection_rate' => $infectionRate
            ],
            'disease_stats' => $diseaseStats,
            'location_stats' => $locationStats,
            'trend_data' => $trendData,
            'age_distribution' => $ageGroups,
            'gender_distribution' => $genderStats
        ],
        'generated_at' => date('Y-m-d H:i:s')
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to fetch report data: ' . $e->getMessage()
    ]);
}
?>
