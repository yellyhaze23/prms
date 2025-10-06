<?php
require 'cors.php';
require 'config.php';

header("Content-Type: application/json");

// DOH SEIR Parameters for Top 5 Diseases
$diseaseParams = [
    'Chickenpox' => [
        'name' => 'Chickenpox',
        'incubation_period' => 14, // days
        'infectious_period' => 7, // days
        'recovery_period' => 14, // days
        'basic_reproduction_number' => 4.0, // R0
        'mortality_rate' => 0.0001, // 0.01%
        'vaccination_coverage' => 0.85, // 85%
        'contact_rate' => 0.3, // per day
        'transmission_probability' => 0.4,
        'recovery_rate' => 0.07, // 1/recovery_period
        'latency_rate' => 0.07, // 1/incubation_period
        'description' => 'Varicella-zoster virus infection'
    ],
    'Measles' => [
        'name' => 'Measles',
        'incubation_period' => 10,
        'infectious_period' => 8,
        'recovery_period' => 12,
        'basic_reproduction_number' => 15.0,
        'mortality_rate' => 0.001, // 0.1%
        'vaccination_coverage' => 0.90,
        'contact_rate' => 0.4,
        'transmission_probability' => 0.6,
        'recovery_rate' => 0.08,
        'latency_rate' => 0.10,
        'description' => 'Highly contagious viral disease'
    ],
    'Tuberculosis' => [
        'name' => 'Tuberculosis',
        'incubation_period' => 60, // 2 months
        'infectious_period' => 180, // 6 months
        'recovery_period' => 270, // 9 months
        'basic_reproduction_number' => 2.5,
        'mortality_rate' => 0.05, // 5%
        'vaccination_coverage' => 0.70,
        'contact_rate' => 0.1,
        'transmission_probability' => 0.3,
        'recovery_rate' => 0.004,
        'latency_rate' => 0.017,
        'description' => 'Bacterial infection primarily affecting lungs'
    ],
    'Hepatitis' => [
        'name' => 'Hepatitis',
        'incubation_period' => 30,
        'infectious_period' => 45,
        'recovery_period' => 90,
        'basic_reproduction_number' => 3.0,
        'mortality_rate' => 0.01, // 1%
        'vaccination_coverage' => 0.80,
        'contact_rate' => 0.2,
        'transmission_probability' => 0.25,
        'recovery_rate' => 0.011,
        'latency_rate' => 0.033,
        'description' => 'Inflammation of the liver'
    ],
    'Dengue' => [
        'name' => 'Dengue',
        'incubation_period' => 7,
        'infectious_period' => 5,
        'recovery_period' => 10,
        'basic_reproduction_number' => 2.0,
        'mortality_rate' => 0.02, // 2%
        'vaccination_coverage' => 0.60,
        'contact_rate' => 0.15, // mosquito-dependent
        'transmission_probability' => 0.3,
        'recovery_rate' => 0.10,
        'latency_rate' => 0.14,
        'description' => 'Mosquito-borne viral infection'
    ]
];

// Get real population data from the area
function getAreaPopulation($conn) {
    // Get population data from patients' addresses
    $sql = "
        SELECT 
            COUNT(DISTINCT p.id) as total_patients,
            COUNT(DISTINCT CASE WHEN h.previous_illness IS NOT NULL AND h.previous_illness != '' THEN p.id END) as sick_patients,
            AVG(p.age) as avg_age,
            COUNT(DISTINCT CASE WHEN p.address LIKE '%Los Baños%' OR p.address LIKE '%Laguna%' THEN p.id END) as local_patients
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
    ";
    
    $result = $conn->query($sql);
    $data = $result->fetch_assoc();
    
    // Estimate population based on patient data
    // Assuming 1 patient represents ~100-200 people in the community
    $estimatedPopulation = max(5000, $data['total_patients'] * 150);
    
    return [
        'total_population' => $estimatedPopulation,
        'total_patients' => $data['total_patients'],
        'sick_patients' => $data['sick_patients'],
        'avg_age' => round($data['avg_age'], 1),
        'local_patients' => $data['local_patients']
    ];
}

// Get current disease data from database with more detailed information
function getCurrentDiseaseData($conn, $disease) {
    $sql = "
        SELECT 
            COUNT(*) as total_cases,
            SUM(CASE WHEN h.previous_illness = ? AND h.status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_cases,
            SUM(CASE WHEN h.previous_illness = ? AND h.status = 'suspected' THEN 1 ELSE 0 END) as suspected_cases,
            SUM(CASE WHEN h.previous_illness = ? AND h.status = 'recovered' THEN 1 ELSE 0 END) as recovered_cases,
            SUM(CASE WHEN h.previous_illness = ? AND h.updated_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as new_cases_7d,
            SUM(CASE WHEN h.previous_illness = ? AND h.updated_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as new_cases_30d,
            AVG(CASE WHEN h.previous_illness = ? AND p.age IS NOT NULL THEN p.age END) as avg_age,
            COUNT(DISTINCT CASE WHEN h.previous_illness = ? AND p.sex = 'Male' THEN p.id END) as male_cases,
            COUNT(DISTINCT CASE WHEN h.previous_illness = ? AND p.sex = 'Female' THEN p.id END) as female_cases,
            MIN(CASE WHEN h.previous_illness = ? THEN h.updated_at END) as first_case_date,
            MAX(CASE WHEN h.previous_illness = ? THEN h.updated_at END) as last_case_date
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
        WHERE h.previous_illness = ?
    ";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssssssssss", $disease, $disease, $disease, $disease, $disease, $disease, $disease, $disease, $disease, $disease, $disease);
    $stmt->execute();
    $result = $stmt->get_result();
    return $result->fetch_assoc();
}

// Get disease progression data for more accurate modeling
function getDiseaseProgressionData($conn, $disease) {
    $sql = "
        SELECT 
            DATE(h.updated_at) as case_date,
            COUNT(*) as daily_cases,
            SUM(CASE WHEN h.status = 'confirmed' THEN 1 ELSE 0 END) as daily_confirmed,
            SUM(CASE WHEN h.status = 'suspected' THEN 1 ELSE 0 END) as daily_suspected,
            SUM(CASE WHEN h.status = 'recovered' THEN 1 ELSE 0 END) as daily_recovered
        FROM health_examinations h
        WHERE h.previous_illness = ? 
        AND h.updated_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)
        GROUP BY DATE(h.updated_at)
        ORDER BY case_date ASC
    ";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $disease);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $progression = [];
    while ($row = $result->fetch_assoc()) {
        $progression[] = $row;
    }
    
    return $progression;
}

// Enhanced SEIR Model Calculation with real data
function calculateSEIR($params, $currentData, $population, $days = 30) {
    // Use real data from database
    $S0 = $population - $currentData['confirmed_cases'] - $currentData['suspected_cases']; // Susceptible
    $E0 = $currentData['suspected_cases']; // Exposed
    $I0 = $currentData['confirmed_cases']; // Infected
    $R0 = $currentData['recovered_cases']; // Recovered
    
    // Adjust for vaccination coverage
    $S0 = $S0 * (1 - $params['vaccination_coverage']);
    
    // Calculate transmission rate based on real data
    $beta = $params['contact_rate'] * $params['transmission_probability'];
    
    // Adjust beta based on recent case trends
    if ($currentData['new_cases_7d'] > 0) {
        $trend_factor = min(2.0, $currentData['new_cases_7d'] / max(1, $currentData['total_cases']));
        $beta = $beta * $trend_factor;
    }
    
    $sigma = $params['latency_rate']; // Latency rate
    $gamma = $params['recovery_rate']; // Recovery rate
    
    $results = [];
    $S = $S0;
    $E = $E0;
    $I = $I0;
    $R = $R0;
    
    for ($day = 0; $day <= $days; $day++) {
        $new_infections = $day > 0 ? $beta * $S * $I / $population : 0;
        
        $results[] = [
            'day' => $day,
            'susceptible' => round($S),
            'exposed' => round($E),
            'infected' => round($I),
            'recovered' => round($R),
            'total_population' => $population,
            'new_infections' => round($new_infections)
        ];
        
        // SEIR differential equations (discrete approximation)
        $dS = -$beta * $S * $I / $population;
        $dE = $beta * $S * $I / $population - $sigma * $E;
        $dI = $sigma * $E - $gamma * $I;
        $dR = $gamma * $I;
        
        $S = max(0, $S + $dS);
        $E = max(0, $E + $dE);
        $I = max(0, $I + $dI);
        $R = max(0, $R + $dR);
    }
    
    return $results;
}

// Calculate spread indicators based on real data
function calculateSpreadIndicators($results, $params, $currentData, $progressionData) {
    $peak_infected = max(array_column($results, 'infected'));
    $peak_day = array_search($peak_infected, array_column($results, 'infected'));
    $total_infected = end($results)['infected'] + end($results)['recovered'];
    $attack_rate = $total_infected / end($results)['total_population'];
    
    // Calculate trend from real data
    $trend = 'stable';
    if (count($progressionData) >= 7) {
        $recent_cases = array_slice($progressionData, -7);
        $earlier_cases = array_slice($progressionData, -14, 7);
        
        $recent_avg = array_sum(array_column($recent_cases, 'daily_cases')) / 7;
        $earlier_avg = array_sum(array_column($earlier_cases, 'daily_cases')) / 7;
        
        if ($recent_avg > $earlier_avg * 1.2) {
            $trend = 'increasing';
        } elseif ($recent_avg < $earlier_avg * 0.8) {
            $trend = 'decreasing';
        }
    }
    
    // Risk levels based on real data
    $risk_level = 'Low';
    if ($currentData['total_cases'] > 10 || $currentData['new_cases_7d'] > 3) {
        $risk_level = 'High';
    } elseif ($currentData['total_cases'] > 5 || $currentData['new_cases_7d'] > 1) {
        $risk_level = 'Moderate';
    }
    
    // Calculate effective reproduction number based on real data
    $effective_r0 = $params['basic_reproduction_number'];
    if ($currentData['total_cases'] > 0) {
        $effective_r0 = $effective_r0 * (1 - ($currentData['recovered_cases'] / $currentData['total_cases']));
    }
    
    return [
        'peak_infected' => $peak_infected,
        'peak_day' => $peak_day,
        'total_infected' => $total_infected,
        'attack_rate' => round($attack_rate * 100, 2),
        'risk_level' => $risk_level,
        'reproduction_number' => round($effective_r0, 2),
        'doubling_time' => round(log(2) / ($params['latency_rate'] * ($effective_r0 - 1)), 1),
        'trend' => $trend,
        'current_cases' => $currentData['total_cases'],
        'new_cases_7d' => $currentData['new_cases_7d'],
        'new_cases_30d' => $currentData['new_cases_30d']
    ];
}

// Get barangay-level data with more details
function getBarangayData($conn, $disease) {
    $sql = "
        SELECT 
            p.address,
            COUNT(*) as cases,
            SUM(CASE WHEN h.status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_cases,
            SUM(CASE WHEN h.status = 'suspected' THEN 1 ELSE 0 END) as suspected_cases,
            SUM(CASE WHEN h.status = 'recovered' THEN 1 ELSE 0 END) as recovered_cases,
            AVG(p.age) as avg_age,
            COUNT(DISTINCT CASE WHEN p.sex = 'Male' THEN p.id END) as male_cases,
            COUNT(DISTINCT CASE WHEN p.sex = 'Female' THEN p.id END) as female_cases,
            MIN(h.updated_at) as first_case,
            MAX(h.updated_at) as last_case
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
        WHERE h.previous_illness = ? AND p.address IS NOT NULL AND p.address != ''
        GROUP BY p.address
        ORDER BY cases DESC
    ";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $disease);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $barangays = [];
    while ($row = $result->fetch_assoc()) {
        $barangays[] = $row;
    }
    
    return $barangays;
}

// Main execution
$disease = $_GET['disease'] ?? '';
$days = intval($_GET['days'] ?? 30);
$population = intval($_GET['population'] ?? 0);

if (empty($disease) || !isset($diseaseParams[$disease])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid disease parameter']);
    exit;
}

try {
    $params = $diseaseParams[$disease];
    
    // Get real population data
    $areaData = getAreaPopulation($conn);
    if ($population <= 0) {
        $population = $areaData['total_population'];
    }
    
    // Get current disease data
    $currentData = getCurrentDiseaseData($conn, $disease);
    
    // Get disease progression data
    $progressionData = getDiseaseProgressionData($conn, $disease);
    
    // Calculate SEIR model
    $seirResults = calculateSEIR($params, $currentData, $population, $days);
    
    // Calculate indicators
    $indicators = calculateSpreadIndicators($seirResults, $params, $currentData, $progressionData);
    
    // Get barangay data
    $barangayData = getBarangayData($conn, $disease);
    
    // Generate forecast summary
    $forecastSummary = [
        'disease' => $disease,
        'parameters' => $params,
        'area_data' => $areaData,
        'current_data' => $currentData,
        'progression_data' => $progressionData,
        'forecast_period' => $days,
        'population' => $population,
        'seir_results' => $seirResults,
        'indicators' => $indicators,
        'barangay_risk' => $barangayData,
        'generated_at' => date('Y-m-d H:i:s'),
        'interpretation' => generateInterpretation($indicators, $params, $currentData, $areaData)
    ];
    
    echo json_encode($forecastSummary);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Forecast calculation failed: ' . $e->getMessage()]);
}

function generateInterpretation($indicators, $params, $currentData, $areaData) {
    $interpretation = [];
    
    // Risk assessment based on real data
    $interpretation['risk_assessment'] = "The disease shows a {$indicators['risk_level']} risk level with an attack rate of {$indicators['attack_rate']}%. " .
        "Current cases: {$indicators['current_cases']}, New cases (7d): {$indicators['new_cases_7d']}";
    
    // Peak prediction
    $interpretation['peak_prediction'] = "Peak infection is predicted to occur on day {$indicators['peak_day']} with approximately {$indicators['peak_infected']} infected individuals.";
    
    // Reproduction number analysis
    if ($indicators['reproduction_number'] > 1) {
        $interpretation['reproduction_analysis'] = "The effective reproduction number (R = {$indicators['reproduction_number']}) indicates the disease will continue to spread without intervention.";
    } else {
        $interpretation['reproduction_analysis'] = "The effective reproduction number (R = {$indicators['reproduction_number']}) indicates the disease will decline naturally.";
    }
    
    // Trend analysis
    $interpretation['trend_analysis'] = "Based on recent data, the trend is {$indicators['trend']}. " .
        "New cases in the last 7 days: {$indicators['new_cases_7d']}, Last 30 days: {$indicators['new_cases_30d']}";
    
    // Recommendations based on real data
    $recommendations = [];
    if ($indicators['risk_level'] === 'High') {
        $recommendations[] = "Implement immediate containment measures";
        $recommendations[] = "Increase surveillance and testing";
        $recommendations[] = "Consider vaccination campaigns";
        $recommendations[] = "Isolate confirmed cases immediately";
    } elseif ($indicators['risk_level'] === 'Moderate') {
        $recommendations[] = "Monitor closely and prepare response measures";
        $recommendations[] = "Implement targeted interventions";
        $recommendations[] = "Enhance contact tracing";
    } else {
        $recommendations[] = "Maintain current surveillance levels";
        $recommendations[] = "Continue preventive measures";
        $recommendations[] = "Monitor for any changes in trend";
    }
    
    // Add specific recommendations based on trend
    if ($indicators['trend'] === 'increasing') {
        $recommendations[] = "Trend is increasing - prepare for potential outbreak";
    } elseif ($indicators['trend'] === 'decreasing') {
        $recommendations[] = "Trend is decreasing - maintain current measures";
    }
    
    $interpretation['recommendations'] = $recommendations;
    
    return $interpretation;
}
?>