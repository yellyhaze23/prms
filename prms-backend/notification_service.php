<?php
require_once 'config.php';

class NotificationService {
    private $conn;
    
    public function __construct($connection) {
        $this->conn = $connection;
    }
    
    // Create a notification
    public function createNotification($userId, $type, $title, $message, $actionUrl = null, $actionText = null, $expiresAt = null) {
        try {
            $sql = "INSERT INTO notifications (user_id, type, title, message, action_url, action_text, expires_at) 
                    VALUES (:user_id, :type, :title, :message, :action_url, :action_text, :expires_at)";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
            $stmt->bindParam(':type', $type);
            $stmt->bindParam(':title', $title);
            $stmt->bindParam(':message', $message);
            $stmt->bindParam(':action_url', $actionUrl);
            $stmt->bindParam(':action_text', $actionText);
            $stmt->bindParam(':expires_at', $expiresAt);
            
            $stmt->execute();
            return $this->conn->lastInsertId();
        } catch (PDOException $e) {
            error_log("Error creating notification: " . $e->getMessage());
            return false;
        }
    }
    
    // Generate notifications based on system events
    public function generateSystemNotifications($userId = 1) {
        $notifications = [];
        
        // 1. Check for new patients today
        $stmt = $this->conn->prepare("
            SELECT COUNT(*) as new_patients 
            FROM patients 
            WHERE DATE(created_at) = CURDATE()
        ");
        $stmt->execute();
        $newPatients = $stmt->fetch(PDO::FETCH_ASSOC)['new_patients'];
        
        if ($newPatients > 0) {
            // Get the actual patient names for dynamic content
            $patientStmt = $this->conn->prepare("
                SELECT full_name, id 
                FROM patients 
                WHERE DATE(created_at) = CURDATE()
                ORDER BY created_at DESC 
                LIMIT 3
            ");
            $patientStmt->execute();
            $recentPatients = $patientStmt->fetchAll(PDO::FETCH_ASSOC);
            
            if (count($recentPatients) == 1) {
                $notifications[] = [
                    'type' => 'success',
                    'title' => 'New Patient Registered',
                    'message' => "Patient {$recentPatients[0]['full_name']} has been successfully registered in the system.",
                    'action_url' => "/patient/{$recentPatients[0]['id']}",
                    'action_text' => 'View Patient'
                ];
            } else {
                $patientNames = array_column($recentPatients, 'full_name');
                $notifications[] = [
                    'type' => 'success',
                    'title' => 'New Patients Registered',
                    'message' => "{$newPatients} new patients registered today: " . implode(', ', $patientNames),
                    'action_url' => '/patient',
                    'action_text' => 'View Patients'
                ];
            }
        }
        
        // 2. Check for high disease cases
        $stmt = $this->conn->prepare("
            SELECT 
                mr.diagnosis,
                COUNT(*) as case_count
            FROM medical_records mr
            WHERE mr.updated_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            AND mr.diagnosis IS NOT NULL AND mr.diagnosis != ''
            GROUP BY mr.diagnosis
            HAVING case_count >= 5
            ORDER BY case_count DESC
        ");
        $stmt->execute();
        $highCases = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($highCases as $disease) {
            $notifications[] = [
                'type' => 'warning',
                'title' => 'High Disease Cases',
                'message' => "{$disease['diagnosis']} has {$disease['case_count']} cases this week",
                'action_url' => '/diseases',
                'action_text' => 'View Diseases'
            ];
        }
        
        // 3. Check for system health
        $stmt = $this->conn->prepare("
            SELECT COUNT(*) as total_patients FROM patients
        ");
        $stmt->execute();
        $totalPatients = $stmt->fetch(PDO::FETCH_ASSOC)['total_patients'];
        
        if ($totalPatients > 1000) {
            $notifications[] = [
                'type' => 'info',
                'title' => 'System Milestone',
                'message' => "System now has {$totalPatients} patients registered",
                'action_url' => '/',
                'action_text' => 'View Dashboard'
            ];
        }
        
        // 4. Check for recent medical records
        $stmt = $this->conn->prepare("
            SELECT COUNT(*) as recent_records
            FROM medical_records 
            WHERE updated_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        ");
        $stmt->execute();
        $recentRecords = $stmt->fetch(PDO::FETCH_ASSOC)['recent_records'];
        
        if ($recentRecords > 10) {
            $notifications[] = [
                'type' => 'success',
                'title' => 'High Activity',
                'message' => "{$recentRecords} medical records updated in the last 24 hours",
                'action_url' => '/records',
                'action_text' => 'View Records'
            ];
        }
        
        // 5. Check for potential outbreaks (with proper duplicate prevention)
        $stmt = $this->conn->prepare("
            SELECT 
                mr.diagnosis,
                COUNT(*) as cases,
                COUNT(DISTINCT mr.patient_id) as unique_patients
            FROM medical_records mr
            WHERE mr.updated_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            AND mr.diagnosis IS NOT NULL AND mr.diagnosis != ''
            AND mr.diagnosis IN ('Hepatitis', 'Tuberculosis', 'Dengue', 'Chickenpox', 'Measles')
            GROUP BY mr.diagnosis
            HAVING cases >= 5 AND unique_patients >= 3
        ");
        $stmt->execute();
        $outbreaks = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($outbreaks as $outbreak) {
            // Check if outbreak notification already exists today
            $checkStmt = $this->conn->prepare("
                SELECT COUNT(*) as notification_exists 
                FROM notifications 
                WHERE user_id = :user_id 
                AND title = 'Outbreak Alert'
                AND message LIKE :message_pattern
                AND DATE(created_at) = CURDATE()
            ");
            $messagePattern = "%{$outbreak['diagnosis']}%";
            $checkStmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
            $checkStmt->bindParam(':message_pattern', $messagePattern);
            $checkStmt->execute();
            $exists = $checkStmt->fetch(PDO::FETCH_ASSOC)['notification_exists'];
            
            if ($exists == 0) {
                $notifications[] = [
                    'type' => 'urgent',
                    'title' => 'Outbreak Alert',
                    'message' => "Potential outbreak: {$outbreak['diagnosis']} with {$outbreak['cases']} cases this week",
                    'action_url' => '/tracker',
                    'action_text' => 'View Tracker'
                ];
            }
        }
        
        return $notifications;
    }
    
    // Auto-generate notifications for all users (with proper limits and outbreak alerts)
    public function autoGenerateNotifications() {
        // Get all users
        $stmt = $this->conn->prepare("SELECT id FROM users");
        $stmt->execute();
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($users as $user) {
            // Check if user already has too many notifications (limit to 10)
            $countStmt = $this->conn->prepare("SELECT COUNT(*) as count FROM notifications WHERE user_id = :user_id");
            $countStmt->bindParam(':user_id', $user['id'], PDO::PARAM_INT);
            $countStmt->execute();
            $currentCount = $countStmt->fetch(PDO::FETCH_ASSOC)['count'];
            
            if ($currentCount >= 10) {
                continue; // Skip this user, they already have enough notifications
            }
            
            $notifications = $this->generateSystemNotifications($user['id']);
            
            // Limit to maximum 3 new notifications per user per day
            $newNotifications = 0;
            $maxNew = 3;
            
            foreach ($notifications as $notification) {
                if ($newNotifications >= $maxNew) {
                    break; // Stop adding more notifications
                }
                
                // Check if similar notification already exists today
                $checkStmt = $this->conn->prepare("
                    SELECT COUNT(*) as notification_exists 
                    FROM notifications 
                    WHERE user_id = :user_id 
                    AND title = :title 
                    AND message = :message
                    AND DATE(created_at) = CURDATE()
                ");
                $checkStmt->bindParam(':user_id', $user['id'], PDO::PARAM_INT);
                $checkStmt->bindParam(':title', $notification['title']);
                $checkStmt->bindParam(':message', $notification['message']);
                $checkStmt->execute();
                $exists = $checkStmt->fetch(PDO::FETCH_ASSOC)['notification_exists'];
                
                if ($exists == 0) {
                    $this->createNotification(
                        $user['id'],
                        $notification['type'],
                        $notification['title'],
                        $notification['message'],
                        $notification['action_url'],
                        $notification['action_text']
                    );
                    $newNotifications++;
                }
            }
        }
    }
    
    // Clean up old notifications
    public function cleanupOldNotifications($daysOld = 30) {
        $stmt = $this->conn->prepare("
            DELETE FROM notifications 
            WHERE created_at < DATE_SUB(NOW(), INTERVAL :days DAY)
        ");
        $stmt->bindParam(':days', $daysOld, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->rowCount();
    }
}

// Auto-generate notifications when called
if (basename($_SERVER['PHP_SELF']) == 'notification_service.php') {
    try {
        $conn = new PDO("mysql:host=$host;dbname=$dbname", $dbuser, $dbpass);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        $notificationService = new NotificationService($conn);
        $notificationService->autoGenerateNotifications();
        $notificationService->cleanupOldNotifications();
        
        echo json_encode([
            'success' => true,
            'message' => 'Notifications generated successfully'
        ]);
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'error' => 'Database error: ' . $e->getMessage()
        ]);
    }
}
?>
