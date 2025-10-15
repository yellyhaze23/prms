<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
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

    // 1. Enhanced Basic Statistics
    $stats = [];
    
    // Total patients
    $stmt = $conn->prepare("SELECT COUNT(*) as total FROM patients");
    $stmt->execute();
    $stats['total_patients'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

    // Total diseases
    $stmt = $conn->prepare("SELECT COUNT(*) as total FROM diseases");
    $stmt->execute();
    $stats['total_diseases'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

    // New patients this month
    $stmt = $conn->prepare("
        SELECT COUNT(*) as new_patients 
        FROM patients 
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    ");
    $stmt->execute();
    $stats['new_patients_this_month'] = $stmt->fetch(PDO::FETCH_ASSOC)['new_patients'];

    // Active cases (patients with diseases in medical records)
    $stmt = $conn->prepare("
        SELECT COUNT(DISTINCT p.id) as active_cases
        FROM patients p
        INNER JOIN medical_records mr ON p.id = mr.patient_id
        WHERE mr.diagnosis IS NOT NULL AND mr.diagnosis != ''
    ");
    $stmt->execute();
    $stats['active_cases'] = $stmt->fetch(PDO::FETCH_ASSOC)['active_cases'];

    // 2. Disease Statistics
    $diseaseStats = [];
    $stmt = $conn->prepare("
        SELECT 
            mr.diagnosis as disease,
            COUNT(*) as case_count,
            COUNT(DISTINCT mr.patient_id) as unique_patients
        FROM medical_records mr
        WHERE mr.diagnosis IS NOT NULL AND mr.diagnosis != ''
        GROUP BY mr.diagnosis
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
            mr.updated_at as last_visit,
            mr.diagnosis as disease,
            'medical_record' as activity_type
        FROM patients p
        LEFT JOIN medical_records mr ON p.id = mr.patient_id
        WHERE mr.id = (
            SELECT MAX(mr2.id) 
            FROM medical_records mr2 
            WHERE mr2.patient_id = p.id
        )
        ORDER BY COALESCE(mr.updated_at, p.created_at) DESC
        LIMIT 10
    ");
    $stmt->execute();
    $recentActivities = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 4. Dynamic Trends Data (supports multiple timeframes)
    $trendsData = [];
    $timeframe = isset($_GET['timeframe']) ? $_GET['timeframe'] : 'weekly';
    
    switch($timeframe) {
        case 'weekly':
            // Generate a full week of data (last 7 days) with proper curve data
            $stmt = $conn->prepare("
                SELECT 
                    DATE(mr.updated_at) as date,
                    COUNT(CASE WHEN mr.diagnosis IS NOT NULL AND mr.diagnosis != '' THEN 1 END) as cases,
                    COUNT(DISTINCT mr.patient_id) as patients
                FROM medical_records mr
                WHERE mr.updated_at >= ?
                GROUP BY DATE(mr.updated_at)
                ORDER BY date ASC
            ");
            $stmt->execute([$lastWeek]);
            $rawData = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Create a complete 7-day dataset with proper curve data
            $trendsData = [];
            $today = new DateTime();
            
            for ($i = 6; $i >= 0; $i--) {
                $date = clone $today;
                $date->modify("-{$i} days");
                $dateStr = $date->format('Y-m-d');
                
                // Find existing data for this date
                $existingData = null;
                foreach ($rawData as $row) {
                    if ($row['date'] === $dateStr) {
                        $existingData = $row;
                        break;
                    }
                }
                
                // real data
                if ($existingData) {
                    $trendsData[] = [
                        'date' => $dateStr,
                        'cases' => $existingData['cases'],
                        'patients' => $existingData['patients']
                    ];
                } else {
                    // For missing days, use 0 values
                    $trendsData[] = [
                        'date' => $dateStr,
                        'cases' => 0,
                        'patients' => 0
                    ];
                }
            }
            break;
            
        case 'monthly':
            $stmt = $conn->prepare("
                SELECT 
                    DATE_FORMAT(mr.created_at, '%Y-%m') as date,
                    COUNT(*) as cases,
                    COUNT(DISTINCT mr.patient_id) as patients
                FROM medical_records mr
                WHERE mr.created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
                GROUP BY DATE_FORMAT(mr.created_at, '%Y-%m')
                ORDER BY date ASC
            ");
            $stmt->execute();
            $trendsData = $stmt->fetchAll(PDO::FETCH_ASSOC);
            break;
            
        case 'quarterly':
            $stmt = $conn->prepare("
                SELECT 
                    DATE_FORMAT(mr.created_at, '%Y-%m') as date,
                    COUNT(*) as cases,
                    COUNT(DISTINCT mr.patient_id) as patients
                FROM medical_records mr
                WHERE mr.created_at >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
                GROUP BY DATE_FORMAT(mr.created_at, '%Y-%m')
                ORDER BY date ASC
            ");
            $stmt->execute();
            $trendsData = $stmt->fetchAll(PDO::FETCH_ASSOC);
            break;
            
        case 'yearly':
            $stmt = $conn->prepare("
                SELECT 
                    DATE_FORMAT(mr.created_at, '%Y-%m') as date,
                    COUNT(*) as cases,
                    COUNT(DISTINCT mr.patient_id) as patients
                FROM medical_records mr
                WHERE mr.created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
                GROUP BY DATE_FORMAT(mr.created_at, '%Y-%m')
                ORDER BY date ASC
            ");
            $stmt->execute();
            $trendsData = $stmt->fetchAll(PDO::FETCH_ASSOC);
            break;
    }

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



    // 9. Recent Consultations (last 7 days)
    $recentConsultations = [];
    $stmt = $conn->prepare("
        SELECT 
            p.full_name,
            mr.diagnosis,
            mr.date_of_consultation,
            mr.chief_complaint,
            mr.updated_at
        FROM medical_records mr
        INNER JOIN patients p ON mr.patient_id = p.id
        WHERE mr.date_of_consultation >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        ORDER BY mr.date_of_consultation DESC
        LIMIT 10
    ");
    $stmt->execute();
    $recentConsultations = $stmt->fetchAll(PDO::FETCH_ASSOC);


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
    
    // Check for recent outbreaks (diseases with 5+ cases in last week) - Only create notifications, not dashboard alerts
    $stmt = $conn->prepare("
        SELECT 
            mr.diagnosis as disease,
            COUNT(*) as recent_cases
        FROM medical_records mr
        WHERE mr.updated_at >= ? AND mr.diagnosis IS NOT NULL AND mr.diagnosis != ''
        GROUP BY mr.diagnosis
        HAVING recent_cases >= 5
    ");
    $stmt->execute([$lastWeek]);
    $outbreakData = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Create notifications for outbreaks (but don't show as dashboard alerts)
    foreach ($outbreakData as $outbreak) {
        // Create notification for this outbreak
        $notificationStmt = $conn->prepare("
            INSERT INTO notifications (user_id, type, title, message, action_url, action_text) 
            VALUES (1, 'urgent', 'Outbreak Alert', 'Potential outbreak: {$outbreak['disease']} with {$outbreak['recent_cases']} cases this week', '/tracker', 'View Tracker')
        ");
        $notificationStmt->execute();
    }

    // Compile all data
    $dashboardData = [
        'success' => true,
        'timestamp' => date('Y-m-d H:i:s'),
        'stats' => $stats,
        'disease_stats' => $diseaseStats,
        'recent_activities' => $recentActivities,
        'trends_data' => $trendsData,
        'current_timeframe' => $timeframe,
        'age_distribution' => $ageDistribution,
        'gender_distribution' => $genderDistribution,
        'top_locations' => $topLocations,
        'recent_consultations' => $recentConsultations,
        'alerts' => $alerts,
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
