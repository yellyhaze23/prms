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
            p.contact_number,
            p.email,
            p.created_at,
            mr.previous_illness as disease,
            mr.status,
            mr.severity,
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
    $patients = [];
    
    while ($row = $result->fetch_assoc()) {
        $patients[] = [
            'id' => (int)$row['id'],
            'full_name' => $row['full_name'],
            'date_of_birth' => $row['date_of_birth'],
            'age' => (int)$row['age'],
            'sex' => $row['sex'],
            'address' => $row['address'],
            'contact_number' => $row['contact_number'],
            'email' => $row['email'],
            'disease' => $row['disease'],
            'status' => $row['status'],
            'severity' => $row['severity'],
            'created_at' => $row['created_at'],
            'last_visit' => $row['last_visit']
        ];
    }
    
    // Get disease statistics
    $diseaseStats = [];
    $diseaseSql = "
        SELECT 
            h.previous_illness as disease,
            COUNT(*) as total_cases,
            SUM(CASE WHEN h.status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_cases,
            SUM(CASE WHEN h.status = 'suspected' THEN 1 ELSE 0 END) as suspected_cases,
            SUM(CASE WHEN h.status = 'recovered' THEN 1 ELSE 0 END) as recovered_cases,
            AVG(TIMESTAMPDIFF(YEAR, p.date_of_birth, CURDATE())) as avg_age,
            SUM(CASE WHEN p.sex = 'Male' THEN 1 ELSE 0 END) as male_cases,
            SUM(CASE WHEN p.sex = 'Female' THEN 1 ELSE 0 END) as female_cases
        FROM patients p
        JOIN (
            SELECT h1.*
            FROM health_examinations h1
            INNER JOIN (
                SELECT patient_id, MAX(updated_at) as max_updated, MAX(id) as max_id
                FROM health_examinations
                GROUP BY patient_id
            ) h2 ON h1.patient_id = h2.patient_id AND h1.updated_at = h2.max_updated AND h1.id = h2.max_id
        ) h ON p.id = h.patient_id
        WHERE h.previous_illness IS NOT NULL AND h.previous_illness != ''
        GROUP BY h.previous_illness
        ORDER BY total_cases DESC
    ";
    
    $diseaseResult = $conn->query($diseaseSql);
    while ($row = $diseaseResult->fetch_assoc()) {
        $diseaseStats[] = [
            'disease' => $row['disease'],
            'total_cases' => (int)$row['total_cases'],
            'confirmed_cases' => (int)$row['confirmed_cases'],
            'suspected_cases' => (int)$row['suspected_cases'],
            'recovered_cases' => (int)$row['recovered_cases'],
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
            SUM(CASE WHEN h.previous_illness IS NOT NULL AND h.previous_illness != '' THEN 1 ELSE 0 END) as infected_cases,
            AVG(TIMESTAMPDIFF(YEAR, p.date_of_birth, CURDATE())) as avg_age
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
        GROUP BY barangay
        ORDER BY total_cases DESC
        LIMIT 20
    ";
    
    $locationResult = $conn->query($locationSql);
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
                SUM(CASE WHEN h.previous_illness IS NOT NULL AND h.previous_illness != '' THEN 1 ELSE 0 END) as infected_patients
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
