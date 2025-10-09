<?php
require 'config.php';

echo "=== Populating Disease Summary ===\n";

try {
    // Clear existing data
    $conn->query("DELETE FROM disease_summary");
    echo "✅ Cleared existing disease_summary data\n";
    
    // Populate from medical_records
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
        
        echo "✅ Success: {$count} records populated in disease_summary table\n";
        
        // Show sample data
        $sample_sql = "SELECT * FROM disease_summary ORDER BY disease_name, year, month LIMIT 5";
        $sample_result = $conn->query($sample_sql);
        
        echo "📋 Sample data:\n";
        while ($row = $sample_result->fetch_assoc()) {
            echo "  - {$row['disease_name']}: {$row['year']}-{$row['month']} = {$row['total_cases']} cases\n";
        }
    } else {
        echo "❌ Error: " . $conn->error . "\n";
    }
} catch (Exception $e) {
    echo "❌ Exception: " . $e->getMessage() . "\n";
}

$conn->close();
?>
