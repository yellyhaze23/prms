<?php
/**
 * Generate Staff Notifications - Manual Script
 * This script generates test notifications for staff users
 */

require_once 'config.php';
require_once 'notification_service.php';

header('Content-Type: application/json');

try {
    // Connect to database
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $dbuser, $dbpass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $notificationService = new NotificationService($conn);
    
    // Get all staff users
    $stmt = $conn->prepare("SELECT id, username, full_name, role FROM users WHERE role = 'staff'");
    $stmt->execute();
    $staffUsers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($staffUsers) === 0) {
        echo json_encode([
            'success' => false,
            'error' => 'No staff users found in the database',
            'help' => 'Please add staff users first'
        ], JSON_PRETTY_PRINT);
        exit;
    }
    
    $results = [];
    
    foreach ($staffUsers as $staff) {
        $staffResults = [
            'user_id' => $staff['id'],
            'username' => $staff['username'],
            'name' => $staff['full_name'],
            'notifications_created' => []
        ];
        
        // Create sample notifications for staff
        $sampleNotifications = [
            [
                'type' => 'success',
                'title' => 'New Patient Registered',
                'message' => 'A new patient has been registered and assigned to you.',
                'action_url' => '/patients',
                'action_text' => 'View Patients'
            ],
            [
                'type' => 'warning',
                'title' => 'High Disease Cases',
                'message' => 'Dengue cases have increased in your area. Please monitor patients.',
                'action_url' => '/diseases',
                'action_text' => 'View Diseases'
            ],
            [
                'type' => 'info',
                'title' => 'Medical Record Updated',
                'message' => 'A medical record has been updated in your assigned patients.',
                'action_url' => '/records',
                'action_text' => 'View Records'
            ]
        ];
        
        foreach ($sampleNotifications as $notif) {
            // Check if this notification already exists today
            $checkStmt = $conn->prepare("
                SELECT COUNT(*) as exists_count 
                FROM notifications 
                WHERE user_id = ? 
                AND title = ? 
                AND DATE(created_at) = CURDATE()
            ");
            $checkStmt->execute([$staff['id'], $notif['title']]);
            $exists = $checkStmt->fetch(PDO::FETCH_ASSOC)['exists_count'];
            
            if ($exists == 0) {
                $notificationId = $notificationService->createNotification(
                    $staff['id'],
                    $notif['type'],
                    $notif['title'],
                    $notif['message'],
                    $notif['action_url'],
                    $notif['action_text']
                );
                
                if ($notificationId) {
                    $staffResults['notifications_created'][] = [
                        'id' => $notificationId,
                        'title' => $notif['title'],
                        'type' => $notif['type']
                    ];
                }
            }
        }
        
        $results[] = $staffResults;
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Staff notifications generated successfully!',
        'staff_users_found' => count($staffUsers),
        'results' => $results
    ], JSON_PRETTY_PRINT);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
?>

