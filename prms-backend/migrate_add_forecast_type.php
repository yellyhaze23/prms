<?php
/**
 * Database Migration: Add forecast_type column
 * 
 * Run this script ONCE by visiting:
 * http://localhost/prms/prms-backend/migrate_add_forecast_type.php
 */

require 'config.php';

header("Content-Type: application/json");

try {
    // Check if column already exists
    $check_sql = "SHOW COLUMNS FROM forecasts LIKE 'forecast_type'";
    $result = $conn->query($check_sql);
    
    if ($result->num_rows > 0) {
        echo json_encode([
            'success' => true,
            'message' => 'Column forecast_type already exists. No migration needed.',
            'already_exists' => true
        ]);
        exit;
    }
    
    // Add the forecast_type column
    $alter_sql = "ALTER TABLE forecasts 
                  ADD COLUMN forecast_type VARCHAR(20) DEFAULT 'overall' AFTER disease";
    
    if (!$conn->query($alter_sql)) {
        throw new Exception("Failed to add column: " . $conn->error);
    }
    
    // Update existing records
    $update_sql = "UPDATE forecasts 
                   SET forecast_type = 'overall' 
                   WHERE forecast_type IS NULL OR forecast_type = ''";
    
    if (!$conn->query($update_sql)) {
        throw new Exception("Failed to update existing records: " . $conn->error);
    }
    
    // Get count of updated records
    $count_sql = "SELECT COUNT(*) as total FROM forecasts";
    $count_result = $conn->query($count_sql);
    $count_row = $count_result->fetch_assoc();
    
    // Verify the column was added
    $verify_sql = "SHOW COLUMNS FROM forecasts LIKE 'forecast_type'";
    $verify_result = $conn->query($verify_sql);
    
    if ($verify_result->num_rows == 0) {
        throw new Exception("Column was not added successfully");
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Migration completed successfully!',
        'details' => [
            'column_added' => true,
            'records_updated' => $count_row['total'],
            'next_steps' => 'You can now generate barangay forecasts and they will appear in Recent Forecasts with the proper badge.'
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'help' => 'If this fails, try running the migration manually using HeidiSQL or MySQL command line. See BARANGAY_FORECAST_FIX.md for instructions.'
    ]);
}

$conn->close();
?>

