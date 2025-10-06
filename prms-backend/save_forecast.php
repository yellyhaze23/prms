<?php
require 'cors.php';
require 'config.php';

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON input']);
    exit;
}

$required_fields = ['disease', 'forecast_period', 'population', 'seir_results', 'indicators', 'area_data', 'current_data', 'interpretation', 'barangay_risk'];
foreach ($required_fields as $field) {
    if (!isset($input[$field])) {
        http_response_code(400);
        echo json_encode(['error' => "Missing required field: $field"]);
        exit;
    }
}

try {
    // Insert forecast data
    $sql = "INSERT INTO forecasts (
        disease, 
        forecast_period, 
        population, 
        seir_results, 
        indicators, 
        area_data, 
        current_data, 
        interpretation,
        barangay_risk,
        generated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param(
        "siissssss",
        $input['disease'],
        $input['forecast_period'],
        $input['population'],
        json_encode($input['seir_results']),
        json_encode($input['indicators']),
        json_encode($input['area_data']),
        json_encode($input['current_data']),
        json_encode($input['interpretation']),
        json_encode($input['barangay_risk'])
    );
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Forecast saved successfully',
            'forecast_id' => $conn->insert_id
        ]);
    } else {
        throw new Exception('Failed to save forecast: ' . $stmt->error);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>
