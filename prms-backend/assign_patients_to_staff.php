<?php
/**
 * Assign some patients to staff users so they appear in staff portal
 */

require_once 'config.php';

echo "======================================\n";
echo "Assigning Patients to Staff\n";
echo "======================================\n\n";

// 1. Check current distribution
echo "1. Current patient distribution:\n";
$distSql = "SELECT 
    COALESCE(added_by, 'NULL') as staff_id, 
    COUNT(*) as count 
FROM patients 
GROUP BY added_by 
ORDER BY added_by";
$result = $conn->query($distSql);
while ($row = $result->fetch_assoc()) {
    echo "   Staff ID {$row['staff_id']}: {$row['count']} patients\n";
}
echo "\n";

// 2. Find staff users
echo "2. Finding staff users in database:\n";
$staffSql = "SELECT id, username, role FROM users WHERE role = 'staff' OR username LIKE '%staff%'";
$result = $conn->query($staffSql);
$staffUsers = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $staffUsers[] = $row;
        echo "   Found: ID {$row['id']}, Username: {$row['username']}, Role: {$row['role']}\n";
    }
} else {
    echo "   ⚠️  No staff users found!\n";
    echo "   Creating default staff user (ID: 3)...\n";
    
    // Create staff user if doesn't exist
    $createStaffSql = "INSERT INTO users (id, username, password, role) 
                       VALUES (3, 'staff', ?, 'staff') 
                       ON DUPLICATE KEY UPDATE role = 'staff'";
    $stmt = $conn->prepare($createStaffSql);
    $hashedPassword = password_hash('staff123', PASSWORD_DEFAULT);
    $stmt->bind_param("s", $hashedPassword);
    $stmt->execute();
    
    $staffUsers[] = ['id' => 3, 'username' => 'staff', 'role' => 'staff'];
    echo "   ✅ Created staff user (ID: 3, Username: staff, Password: staff123)\n";
}
echo "\n";

// 3. Assign 30% of patients to staff users
echo "3. Assigning patients to staff users...\n";

foreach ($staffUsers as $staff) {
    $staffId = $staff['id'];
    $username = $staff['username'];
    
    // Count current assignments
    $countSql = "SELECT COUNT(*) as count FROM patients WHERE added_by = $staffId";
    $result = $conn->query($countSql);
    $currentCount = $result->fetch_assoc()['count'];
    
    if ($currentCount > 0) {
        echo "   Staff '$username' (ID: $staffId) already has $currentCount patients\n";
        continue;
    }
    
    // Assign 30% of unassigned or admin patients to this staff
    $updateSql = "UPDATE patients 
                  SET added_by = $staffId 
                  WHERE (added_by = 1 OR added_by IS NULL) 
                  AND id IN (
                      SELECT id FROM (
                          SELECT id FROM patients 
                          WHERE (added_by = 1 OR added_by IS NULL)
                          ORDER BY RAND() 
                          LIMIT (SELECT FLOOR(COUNT(*) * 0.3) FROM patients WHERE (added_by = 1 OR added_by IS NULL))
                      ) as temp
                  )";
    
    $conn->query($updateSql);
    $affected = $conn->affected_rows;
    
    echo "   ✅ Assigned $affected patients to staff '$username' (ID: $staffId)\n";
}

echo "\n";

// 4. Final distribution
echo "4. Final patient distribution:\n";
$result = $conn->query($distSql);
while ($row = $result->fetch_assoc()) {
    echo "   Staff ID {$row['staff_id']}: {$row['count']} patients\n";
}
echo "\n";

// 5. Check if staff patients have barangay_id
foreach ($staffUsers as $staff) {
    $staffId = $staff['id'];
    $username = $staff['username'];
    
    $checkSql = "SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN barangay_id IS NOT NULL THEN 1 ELSE 0 END) as with_barangay
    FROM patients 
    WHERE added_by = $staffId";
    
    $result = $conn->query($checkSql);
    $stats = $result->fetch_assoc();
    
    echo "5. Staff '$username' (ID: $staffId):\n";
    echo "   Total patients: {$stats['total']}\n";
    echo "   With barangay_id: {$stats['with_barangay']}\n";
    
    if ($stats['total'] > 0 && $stats['with_barangay'] > 0) {
        echo "   ✅ READY! This staff should see data in the tracker.\n";
    } else if ($stats['total'] > 0 && $stats['with_barangay'] == 0) {
        echo "   ⚠️  Has patients but NO barangay_id! Run fix_patient_barangay_ids.php again.\n";
    } else {
        echo "   ⚠️  No patients assigned yet.\n";
    }
    echo "\n";
}

echo "======================================\n";
echo "Done!\n";
echo "======================================\n";
echo "\n";
echo "NEXT STEPS:\n";
echo "1. Make sure you're logged in as one of the staff users above\n";
echo "2. Refresh the Staff Portal Disease Tracker page\n";
echo "3. You should now see data!\n";
echo "\n";
?>

