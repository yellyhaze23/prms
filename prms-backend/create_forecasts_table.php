<?php
require 'config.php';

try {
    $sql = "CREATE TABLE IF NOT EXISTS forecasts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        disease VARCHAR(50) NOT NULL,
        forecast_period INT NOT NULL,
        population INT NOT NULL,
        seir_results TEXT NOT NULL,
        indicators TEXT NOT NULL,
        area_data TEXT NOT NULL,
        current_data TEXT NOT NULL,
        generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_disease (disease),
        INDEX idx_generated_at (generated_at)
    )";
    
    if ($conn->query($sql)) {
        echo "Forecasts table created successfully!";
    } else {
        echo "Error creating table: " . $conn->error;
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
