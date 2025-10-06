<?php
require 'cors.php';
require 'config.php';

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

// Debug: Log the input
error_log("Delete forecast input: " . json_encode($input));

if (!$input || !isset($input['forecast_id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Forecast ID is required']);
    exit;
}

$forecast_id = (int)$input['forecast_id'];

// Debug: Log the forecast ID
error_log("Attempting to delete forecast ID: " . $forecast_id);

try {
    // Check if forecast exists
    $check_sql = "SELECT id FROM forecasts WHERE id = ?";
    $check_stmt = $conn->prepare($check_sql);
    $check_stmt->bind_param("i", $forecast_id);
    $check_stmt->execute();
    $result = $check_stmt->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception('Forecast not found');
    }
    
    // Delete the forecast
    $delete_sql = "DELETE FROM forecasts WHERE id = ?";
    $delete_stmt = $conn->prepare($delete_sql);
    $delete_stmt->bind_param("i", $forecast_id);
    
    if ($delete_stmt->execute()) {
        $affected_rows = $delete_stmt->affected_rows;
        error_log("Delete executed successfully. Affected rows: " . $affected_rows);
        echo json_encode([
            'success' => true,
            'message' => 'Forecast deleted successfully',
            'affected_rows' => $affected_rows
        ]);
    } else {
        error_log("Delete failed: " . $delete_stmt->error);
        throw new Exception('Failed to delete forecast: ' . $delete_stmt->error);
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
