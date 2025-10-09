<?php
require 'config.php';

echo "=== Setting up Database Triggers ===\n";

try {
    // Drop existing triggers if they exist
    $conn->query("DROP TRIGGER IF EXISTS update_disease_summary_after_insert");
    $conn->query("DROP TRIGGER IF EXISTS update_disease_summary_after_update");
    $conn->query("DROP TRIGGER IF EXISTS update_disease_summary_after_delete");
    echo "✅ Dropped existing triggers\n";
    
    // Create INSERT trigger
    $insert_trigger = "
    CREATE TRIGGER update_disease_summary_after_insert
    AFTER INSERT ON medical_records
    FOR EACH ROW
    BEGIN
        IF NEW.diagnosis IS NOT NULL AND NEW.diagnosis != '' THEN
            INSERT INTO disease_summary (disease_name, year, month, total_cases)
            VALUES (NEW.diagnosis, YEAR(NEW.created_at), MONTH(NEW.created_at), 1)
            ON DUPLICATE KEY UPDATE total_cases = total_cases + 1;
        END IF;
    END";
    
    if ($conn->query($insert_trigger)) {
        echo "✅ INSERT trigger created\n";
    } else {
        echo "❌ INSERT trigger failed: " . $conn->error . "\n";
    }
    
    // Create UPDATE trigger
    $update_trigger = "
    CREATE TRIGGER update_disease_summary_after_update
    AFTER UPDATE ON medical_records
    FOR EACH ROW
    BEGIN
        -- Handle old diagnosis
        IF OLD.diagnosis IS NOT NULL AND OLD.diagnosis != '' THEN
            UPDATE disease_summary 
            SET total_cases = total_cases - 1
            WHERE disease_name = OLD.diagnosis 
            AND year = YEAR(OLD.created_at) 
            AND month = MONTH(OLD.created_at);
            
            DELETE FROM disease_summary 
            WHERE disease_name = OLD.diagnosis 
            AND year = YEAR(OLD.created_at) 
            AND month = MONTH(OLD.created_at)
            AND total_cases <= 0;
        END IF;
        
        -- Handle new diagnosis
        IF NEW.diagnosis IS NOT NULL AND NEW.diagnosis != '' THEN
            INSERT INTO disease_summary (disease_name, year, month, total_cases)
            VALUES (NEW.diagnosis, YEAR(NEW.created_at), MONTH(NEW.created_at), 1)
            ON DUPLICATE KEY UPDATE total_cases = total_cases + 1;
        END IF;
    END";
    
    if ($conn->query($update_trigger)) {
        echo "✅ UPDATE trigger created\n";
    } else {
        echo "❌ UPDATE trigger failed: " . $conn->error . "\n";
    }
    
    // Create DELETE trigger
    $delete_trigger = "
    CREATE TRIGGER update_disease_summary_after_delete
    AFTER DELETE ON medical_records
    FOR EACH ROW
    BEGIN
        IF OLD.diagnosis IS NOT NULL AND OLD.diagnosis != '' THEN
            UPDATE disease_summary 
            SET total_cases = total_cases - 1
            WHERE disease_name = OLD.diagnosis 
            AND year = YEAR(OLD.created_at) 
            AND month = MONTH(OLD.created_at);
            
            DELETE FROM disease_summary 
            WHERE disease_name = OLD.diagnosis 
            AND year = YEAR(OLD.created_at) 
            AND month = MONTH(OLD.created_at)
            AND total_cases <= 0;
        END IF;
    END";
    
    if ($conn->query($delete_trigger)) {
        echo "✅ DELETE trigger created\n";
    } else {
        echo "❌ DELETE trigger failed: " . $conn->error . "\n";
    }
    
    echo "✅ All triggers created successfully!\n";
    
} catch (Exception $e) {
    echo "❌ Exception: " . $e->getMessage() . "\n";
}

$conn->close();
?>
