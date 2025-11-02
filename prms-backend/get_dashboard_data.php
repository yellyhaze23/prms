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

    // 1. Enhanced Basic Statistics with Trend Data
    $stats = [];
    
    // Total patients - with trend data (last 7 days)
    $stmt = $conn->prepare("SELECT COUNT(*) as total FROM patients");
    $stmt->execute();
    $stats['total_patients'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Get patient count trend (last 7 days)
    $stmt = $conn->prepare("
        SELECT 
            DATE(created_at) as date,
            COUNT(*) as count
        FROM patients
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY DATE(created_at)
        ORDER BY date ASC
    ");
    $stmt->execute();
    $patientTrendRaw = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Calculate cumulative counts for trend
    $patientTrend = [];
    $cumulativeCount = 0;
    $today = new DateTime();
    for ($i = 6; $i >= 0; $i--) {
        $date = clone $today;
        $date->modify("-{$i} days");
        $dateStr = $date->format('Y-m-d');
        
        $dayData = array_filter($patientTrendRaw, function($row) use ($dateStr) {
            return $row['date'] === $dateStr;
        });
        $dayCount = !empty($dayData) ? (int)reset($dayData)['count'] : 0;
        $cumulativeCount += $dayCount;
        
        // Get total count up to this day
        $stmt = $conn->prepare("SELECT COUNT(*) as total FROM patients WHERE DATE(created_at) <= ?");
        $stmt->execute([$dateStr]);
        $cumulativeCount = (int)$stmt->fetch(PDO::FETCH_ASSOC)['total'];
        
        $patientTrend[] = ['date' => $dateStr, 'value' => $cumulativeCount];
    }
    $stats['total_patients_trend'] = $patientTrend;

    // Total diseases - with trend data
    $stmt = $conn->prepare("SELECT COUNT(*) as total FROM diseases");
    $stmt->execute();
    $stats['total_diseases'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Disease trend (last 7 days - using disease_summary table if available, otherwise static)
    $stmt = $conn->prepare("
        SELECT 
            DATE(created_at) as date,
            COUNT(DISTINCT diagnosis) as count
        FROM medical_records
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        AND diagnosis IS NOT NULL AND diagnosis != ''
        GROUP BY DATE(created_at)
        ORDER BY date ASC
    ");
    $stmt->execute();
    $diseaseTrendRaw = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $diseaseTrend = [];
    $today = new DateTime();
    for ($i = 6; $i >= 0; $i--) {
        $date = clone $today;
        $date->modify("-{$i} days");
        $dateStr = $date->format('Y-m-d');
        
        $dayData = array_filter($diseaseTrendRaw, function($row) use ($dateStr) {
            return $row['date'] === $dateStr;
        });
        $dayCount = !empty($dayData) ? (int)reset($dayData)['count'] : 0;
        
        // Get unique disease count up to this day
        $stmt = $conn->prepare("
            SELECT COUNT(DISTINCT diagnosis) as total 
            FROM medical_records 
            WHERE DATE(created_at) <= ? AND diagnosis IS NOT NULL AND diagnosis != ''
        ");
        $stmt->execute([$dateStr]);
        $cumulativeCount = (int)$stmt->fetch(PDO::FETCH_ASSOC)['total'];
        
        $diseaseTrend[] = ['date' => $dateStr, 'value' => max($cumulativeCount, $stats['total_diseases'])];
    }
    $stats['total_diseases_trend'] = $diseaseTrend;

    // New patients this month
    $stmt = $conn->prepare("
        SELECT COUNT(*) as new_patients 
        FROM patients 
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    ");
    $stmt->execute();
    $stats['new_patients_this_month'] = $stmt->fetch(PDO::FETCH_ASSOC)['new_patients'];
    
    // New patients trend (last 7 days)
    $stmt = $conn->prepare("
        SELECT 
            DATE(created_at) as date,
            COUNT(*) as count
        FROM patients
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY DATE(created_at)
        ORDER BY date ASC
    ");
    $stmt->execute();
    $newPatientTrendRaw = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $newPatientTrend = [];
    $today = new DateTime();
    for ($i = 6; $i >= 0; $i--) {
        $date = clone $today;
        $date->modify("-{$i} days");
        $dateStr = $date->format('Y-m-d');
        
        $dayData = array_filter($newPatientTrendRaw, function($row) use ($dateStr) {
            return $row['date'] === $dateStr;
        });
        $dayCount = !empty($dayData) ? (int)reset($dayData)['count'] : 0;
        
        $newPatientTrend[] = ['date' => $dateStr, 'value' => $dayCount];
    }
    $stats['new_patients_trend'] = $newPatientTrend;

    // Active cases - with trend data (last 7 days)
    $stmt = $conn->prepare("
        SELECT COUNT(DISTINCT p.id) as active_cases
        FROM patients p
        INNER JOIN medical_records mr ON p.id = mr.patient_id
        WHERE mr.diagnosis IS NOT NULL AND mr.diagnosis != ''
    ");
    $stmt->execute();
    $stats['active_cases'] = $stmt->fetch(PDO::FETCH_ASSOC)['active_cases'];
    
    // Active cases trend (last 7 days)
    $stmt = $conn->prepare("
        SELECT 
            DATE(mr.updated_at) as date,
            COUNT(DISTINCT mr.patient_id) as count
        FROM medical_records mr
        WHERE mr.updated_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        AND mr.diagnosis IS NOT NULL AND mr.diagnosis != ''
        GROUP BY DATE(mr.updated_at)
        ORDER BY date ASC
    ");
    $stmt->execute();
    $activeCasesTrendRaw = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $activeCasesTrend = [];
    $today = new DateTime();
    for ($i = 6; $i >= 0; $i--) {
        $date = clone $today;
        $date->modify("-{$i} days");
        $dateStr = $date->format('Y-m-d');
        
        $dayData = array_filter($activeCasesTrendRaw, function($row) use ($dateStr) {
            return $row['date'] === $dateStr;
        });
        $dayCount = !empty($dayData) ? (int)reset($dayData)['count'] : 0;
        
        // Get total active cases up to this day
        $stmt = $conn->prepare("
            SELECT COUNT(DISTINCT p.id) as active_cases
            FROM patients p
            INNER JOIN medical_records mr ON p.id = mr.patient_id
            WHERE mr.diagnosis IS NOT NULL AND mr.diagnosis != ''
            AND DATE(mr.updated_at) <= ?
        ");
        $stmt->execute([$dateStr]);
        $cumulativeCount = (int)$stmt->fetch(PDO::FETCH_ASSOC)['active_cases'];
        
        $activeCasesTrend[] = ['date' => $dateStr, 'value' => $cumulativeCount];
    }
    $stats['active_cases_trend'] = $activeCasesTrend;

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

    // 3. Recent Activities (last 10) - Filter out future dates
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
            AND COALESCE(mr2.updated_at, mr2.created_at) <= NOW()
        )
        AND COALESCE(mr.updated_at, p.created_at) <= NOW()
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


    // 9. Create System Alerts as Notifications (instead of returning alerts)
    // Check for high disease cases and create notifications
    if ($stats['active_cases'] > 50) {
        require_once 'notification_service.php';
        $notificationService = new NotificationService($conn);
        
        // Get all admin and staff users to notify
        $userStmt = $conn->prepare("SELECT id FROM users WHERE role IN ('admin', 'staff')");
        $userStmt->execute();
        $users = $userStmt->fetchAll(PDO::FETCH_ASSOC);
        
        $title = 'System Warning';
        $message = "High number of active disease cases detected: {$stats['active_cases']} cases";
        
        foreach ($users as $user) {
            // Check if similar notification already exists today to prevent duplicates
            $checkStmt = $conn->prepare("
                SELECT COUNT(*) as notification_exists 
                FROM notifications 
                WHERE user_id = :user_id 
                AND title = :title 
                AND DATE(created_at) = CURDATE()
            ");
            $checkStmt->bindParam(':user_id', $user['id'], PDO::PARAM_INT);
            $checkStmt->bindParam(':title', $title);
            $checkStmt->execute();
            $exists = $checkStmt->fetch(PDO::FETCH_ASSOC)['notification_exists'];
            
            // Only create if notification doesn't exist today
            if ($exists == 0) {
                $notificationService->createNotification(
                    $user['id'],
                    'warning',
                    $title,
                    $message,
                    '/reports', // action URL
                    'View Reports' // action text
                );
            }
        }
    }

    // Compile all data (alerts removed - now using notifications)
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
