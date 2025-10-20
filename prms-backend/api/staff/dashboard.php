<?php
require_once __DIR__ . '/_init.php';
$user = current_user_or_401();
$staffId = intval($user['id']);

try {
    // Get total assigned patients
    $totalPatientsQuery = "SELECT COUNT(*) as total FROM patients WHERE added_by = $staffId";
    $totalResult = $conn->query($totalPatientsQuery);
    $totalPatients = $totalResult ? intval($totalResult->fetch_assoc()['total']) : 0;

    // Get active cases (patients with recent medical records)
    $activeCasesQuery = "SELECT COUNT(DISTINCT p.id) as active 
                        FROM patients p 
                        INNER JOIN medical_records mr ON p.id = mr.patient_id 
                        WHERE p.added_by = $staffId 
                        AND mr.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
    $activeResult = $conn->query($activeCasesQuery);
    $activeCases = $activeResult ? intval($activeResult->fetch_assoc()['active']) : 0;

    // Get infected patients (those with diagnoses)
    $infectedQuery = "SELECT COUNT(DISTINCT p.id) as infected 
                      FROM patients p 
                      INNER JOIN medical_records mr ON p.id = mr.patient_id 
                      WHERE p.added_by = $staffId 
                      AND mr.diagnosis IS NOT NULL 
                      AND mr.diagnosis != '' 
                      AND mr.diagnosis != 'Healthy'";
    $infectedResult = $conn->query($infectedQuery);
    $infectedPatients = $infectedResult ? intval($infectedResult->fetch_assoc()['infected']) : 0;

    // Get healthy patients
    $healthyPatients = $totalPatients - $infectedPatients;

    // Get recent patients (last 7 days)
    $recentPatientsQuery = "SELECT COUNT(*) as recent 
                           FROM patients 
                           WHERE added_by = $staffId 
                           AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
    $recentResult = $conn->query($recentPatientsQuery);
    $recentPatients = $recentResult ? intval($recentResult->fetch_assoc()['recent']) : 0;

    // Get tasks due today (patients with follow-up appointments)
    $tasksQuery = "SELECT COUNT(DISTINCT p.id) as tasks 
                  FROM patients p 
                  INNER JOIN medical_records mr ON p.id = mr.patient_id 
                  WHERE p.added_by = $staffId 
                  AND mr.medical_advice LIKE '%follow%' 
                  AND mr.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
    $tasksResult = $conn->query($tasksQuery);
    $tasksDueToday = $tasksResult ? intval($tasksResult->fetch_assoc()['tasks']) : 0;

    // Get disease distribution for charts
    $diseaseQuery = "SELECT mr.diagnosis, COUNT(*) as count 
                     FROM patients p 
                     INNER JOIN medical_records mr ON p.id = mr.patient_id 
                     WHERE p.added_by = $staffId 
                     AND mr.diagnosis IS NOT NULL 
                     AND mr.diagnosis != '' 
                     AND mr.diagnosis != 'Healthy'
                     GROUP BY mr.diagnosis 
                     ORDER BY count DESC 
                     LIMIT 5";
    $diseaseResult = $conn->query($diseaseQuery);
    $diseaseDistribution = [];
    if ($diseaseResult) {
        while ($row = $diseaseResult->fetch_assoc()) {
            $diseaseDistribution[] = [
                'disease' => $row['diagnosis'],
                'count' => intval($row['count'])
            ];
        }
    }

    // Get weekly trends (last 7 days)
    $trendsQuery = "SELECT DATE(mr.created_at) as date, COUNT(*) as cases 
                    FROM patients p 
                    INNER JOIN medical_records mr ON p.id = mr.patient_id 
                    WHERE p.added_by = $staffId 
                    AND mr.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                    GROUP BY DATE(mr.created_at) 
                    ORDER BY date ASC";
    $trendsResult = $conn->query($trendsQuery);
    $weeklyTrends = [];
    if ($trendsResult) {
        while ($row = $trendsResult->fetch_assoc()) {
            $weeklyTrends[] = [
                'date' => $row['date'],
                'cases' => intval($row['cases'])
            ];
        }
    }

    // Get age distribution
    $ageQuery = "SELECT 
                    CASE 
                        WHEN age < 18 THEN 'Under 18'
                        WHEN age BETWEEN 18 AND 30 THEN '18-30'
                        WHEN age BETWEEN 31 AND 50 THEN '31-50'
                        WHEN age BETWEEN 51 AND 70 THEN '51-70'
                        ELSE 'Over 70'
                    END as age_group,
                    COUNT(*) as count
                 FROM patients 
                 WHERE added_by = $staffId 
                 GROUP BY age_group 
                 ORDER BY 
                    CASE age_group
                        WHEN 'Under 18' THEN 1
                        WHEN '18-30' THEN 2
                        WHEN '31-50' THEN 3
                        WHEN '51-70' THEN 4
                        ELSE 5
                    END";
    $ageResult = $conn->query($ageQuery);
    $ageDistribution = [];
    if ($ageResult) {
        while ($row = $ageResult->fetch_assoc()) {
            $ageDistribution[] = [
                'age_group' => $row['age_group'],
                'count' => intval($row['count'])
            ];
        }
    }

    // Get recent activities
    $activitiesQuery = "SELECT 
                          'New Patient' as activity,
                          p.full_name as patient_name,
                          p.created_at as timestamp
                       FROM patients p 
                       WHERE p.added_by = $staffId 
                       AND p.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                       UNION ALL
                       SELECT 
                          'Medical Record' as activity,
                          p.full_name as patient_name,
                          mr.created_at as timestamp
                       FROM patients p 
                       INNER JOIN medical_records mr ON p.id = mr.patient_id 
                       WHERE p.added_by = $staffId 
                       AND mr.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                       ORDER BY timestamp DESC 
                       LIMIT 10";
    $activitiesResult = $conn->query($activitiesQuery);
    $recentActivities = [];
    if ($activitiesResult) {
        while ($row = $activitiesResult->fetch_assoc()) {
            $recentActivities[] = [
                'activity' => $row['activity'],
                'patient_name' => $row['patient_name'],
                'timestamp' => $row['timestamp']
            ];
        }
    }

    json_ok([
        'kpis' => [
            'total_patients' => $totalPatients,
            'active_cases' => $activeCases,
            'infected_patients' => $infectedPatients,
            'healthy_patients' => $healthyPatients,
            'recent_patients' => $recentPatients,
            'tasks_due_today' => $tasksDueToday
        ],
        'charts' => [
            'disease_distribution' => $diseaseDistribution,
            'weekly_trends' => $weeklyTrends,
            'age_distribution' => $ageDistribution
        ],
        'recent_activities' => $recentActivities
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
}
