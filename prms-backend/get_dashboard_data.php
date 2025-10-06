<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

require_once 'config.php';

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $dbuser, $dbpass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Get current date for calculations
    $currentDate = date('Y-m-d');
    $lastWeek = date('Y-m-d', strtotime('-7 days'));
    $lastMonth = date('Y-m-d', strtotime('-30 days'));

    // 1. Basic Statistics
    $stats = [];
    
    // Total patients
    $stmt = $conn->prepare("SELECT COUNT(*) as total FROM patients");
    $stmt->execute();
    $stats['total_patients'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

    // Total diseases
    $stmt = $conn->prepare("SELECT COUNT(*) as total FROM diseases");
    $stmt->execute();
    $stats['total_diseases'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

    // Active cases (patients with diseases in health examinations)
    $stmt = $conn->prepare("
        SELECT COUNT(DISTINCT p.id) as active_cases
        FROM patients p
        INNER JOIN health_examinations he ON p.id = he.patient_id
        WHERE he.previous_illness IS NOT NULL AND he.previous_illness != ''
    ");
    $stmt->execute();
    $stats['active_cases'] = $stmt->fetch(PDO::FETCH_ASSOC)['active_cases'];

    // Healthy patients
    $stats['healthy_patients'] = $stats['total_patients'] - $stats['active_cases'];

    // 2. Disease Statistics
    $diseaseStats = [];
    $stmt = $conn->prepare("
        SELECT 
            he.previous_illness as disease,
            COUNT(*) as case_count,
            COUNT(DISTINCT he.patient_id) as unique_patients
        FROM health_examinations he
        WHERE he.previous_illness IS NOT NULL AND he.previous_illness != ''
        GROUP BY he.previous_illness
        ORDER BY case_count DESC
        LIMIT 5
    ");
    $stmt->execute();
    $diseaseStats = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 3. Recent Activities (last 10)
    $recentActivities = [];
    $stmt = $conn->prepare("
        SELECT 
            p.full_name,
            p.created_at as patient_created,
            he.updated_at as last_visit,
            he.previous_illness as disease,
            'health_examination' as activity_type
        FROM patients p
        LEFT JOIN health_examinations he ON p.id = he.patient_id
        WHERE he.id = (
            SELECT MAX(he2.id) 
            FROM health_examinations he2 
            WHERE he2.patient_id = p.id
        )
        ORDER BY COALESCE(he.updated_at, p.created_at) DESC
        LIMIT 10
    ");
    $stmt->execute();
    $recentActivities = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 4. Weekly Statistics
    $weeklyStats = [];
    $stmt = $conn->prepare("
        SELECT 
            DATE(he.updated_at) as date,
            COUNT(*) as daily_cases,
            COUNT(DISTINCT he.patient_id) as daily_patients
        FROM health_examinations he
        WHERE he.updated_at >= ?
        GROUP BY DATE(he.updated_at)
        ORDER BY date DESC
        LIMIT 7
    ");
    $stmt->execute([$lastWeek]);
    $weeklyStats = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 5. Age Distribution
    $ageDistribution = [];
    $stmt = $conn->prepare("
        SELECT 
            CASE 
                WHEN TIMESTAMPDIFF(YEAR, p.date_of_birth, CURDATE()) < 18 THEN 'Under 18'
                WHEN TIMESTAMPDIFF(YEAR, p.date_of_birth, CURDATE()) BETWEEN 18 AND 30 THEN '18-30'
                WHEN TIMESTAMPDIFF(YEAR, p.date_of_birth, CURDATE()) BETWEEN 31 AND 50 THEN '31-50'
                WHEN TIMESTAMPDIFF(YEAR, p.date_of_birth, CURDATE()) BETWEEN 51 AND 70 THEN '51-70'
                ELSE 'Over 70'
            END as age_group,
            COUNT(*) as count
        FROM patients p
        GROUP BY age_group
        ORDER BY 
            CASE age_group
                WHEN 'Under 18' THEN 1
                WHEN '18-30' THEN 2
                WHEN '31-50' THEN 3
                WHEN '51-70' THEN 4
                WHEN 'Over 70' THEN 5
            END
    ");
    $stmt->execute();
    $ageDistribution = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 6. Gender Distribution
    $genderDistribution = [];
    $stmt = $conn->prepare("
        SELECT 
            sex,
            COUNT(*) as count
        FROM patients
        GROUP BY sex
    ");
    $stmt->execute();
    $genderDistribution = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 7. Top Locations (by patient count)
    $topLocations = [];
    $stmt = $conn->prepare("
        SELECT 
            address,
            COUNT(*) as patient_count
        FROM patients
        WHERE address IS NOT NULL AND address != ''
        GROUP BY address
        ORDER BY patient_count DESC
        LIMIT 5
    ");
    $stmt->execute();
    $topLocations = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 8. System Health Check
    $systemHealth = [
        'database_connected' => true,
        'api_services' => true,
        'last_backup' => date('Y-m-d H:i:s', strtotime('-1 day')), // Mock data
        'uptime' => '99.9%' // Mock data
    ];

    // 9. Alerts and Notifications
    $alerts = [];
    
    // Check for high disease cases
    if ($stats['active_cases'] > 50) {
        $alerts[] = [
            'type' => 'warning',
            'message' => 'High number of active disease cases detected',
            'count' => $stats['active_cases']
        ];
    }
    
    // Check for recent outbreaks (diseases with 5+ cases in last week)
    $stmt = $conn->prepare("
        SELECT 
            he.previous_illness as disease,
            COUNT(*) as recent_cases
        FROM health_examinations he
        WHERE he.updated_at >= ? AND he.previous_illness IS NOT NULL AND he.previous_illness != ''
        GROUP BY he.previous_illness
        HAVING recent_cases >= 5
    ");
    $stmt->execute([$lastWeek]);
    $outbreakData = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($outbreakData as $outbreak) {
        $alerts[] = [
            'type' => 'danger',
            'message' => "Potential outbreak: {$outbreak['disease']} with {$outbreak['recent_cases']} cases this week",
            'disease' => $outbreak['disease'],
            'count' => $outbreak['recent_cases']
        ];
    }

    // 10. Performance Metrics
    $performanceMetrics = [
        'avg_response_time' => '120ms', // Mock data
        'database_queries_per_second' => '45', // Mock data
        'memory_usage' => '68%', // Mock data
        'cpu_usage' => '23%' // Mock data
    ];

    // Compile all data
    $dashboardData = [
        'success' => true,
        'timestamp' => date('Y-m-d H:i:s'),
        'stats' => $stats,
        'disease_stats' => $diseaseStats,
        'recent_activities' => $recentActivities,
        'weekly_stats' => $weeklyStats,
        'age_distribution' => $ageDistribution,
        'gender_distribution' => $genderDistribution,
        'top_locations' => $topLocations,
        'system_health' => $systemHealth,
        'alerts' => $alerts,
        'performance_metrics' => $performanceMetrics
    ];

    echo json_encode($dashboardData, JSON_PRETTY_PRINT);

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Server error: ' . $e->getMessage()
    ]);
}
?>
