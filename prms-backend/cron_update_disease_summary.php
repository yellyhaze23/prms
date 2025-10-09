<?php
require 'config.php';

// Log file for cron job
$log_file = __DIR__ . '/logs/cron_disease_summary.log';

// Create logs directory if it doesn't exist
if (!is_dir(__DIR__ . '/logs')) {
    mkdir(__DIR__ . '/logs', 0755, true);
}

function log_message($message) {
    global $log_file;
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($log_file, "[$timestamp] $message\n", FILE_APPEND);
}

try {
    log_message("Starting disease_summary update...");
    
    // Clear existing data
    $conn->query("DELETE FROM disease_summary");
    log_message("Cleared existing disease_summary data");
    
    // Repopulate from medical_records
    $sql = "INSERT INTO disease_summary (disease_name, year, month, total_cases)
            SELECT 
                mr.diagnosis as disease_name,
                YEAR(mr.created_at) as year,
                MONTH(mr.created_at) as month,
                COUNT(*) as total_cases
            FROM medical_records mr
            WHERE mr.diagnosis IS NOT NULL 
            AND mr.diagnosis != ''
            GROUP BY mr.diagnosis, YEAR(mr.created_at), MONTH(mr.created_at)";
    
    $result = $conn->query($sql);
    
    if ($result) {
        $count_sql = "SELECT COUNT(*) as count FROM disease_summary";
        $count_result = $conn->query($count_sql);
        $count = $count_result->fetch_assoc()['count'];
        
        log_message("Success: $count records updated in disease_summary table");
    } else {
        log_message("Error: " . $conn->error);
    }
    
} catch (Exception $e) {
    log_message("Exception: " . $e->getMessage());
}

$conn->close();
?>
