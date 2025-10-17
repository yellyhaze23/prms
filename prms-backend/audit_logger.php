<?php
require 'config.php';
require 'ip_utils.php';

class AuditLogger {
    private $conn;
    
    public function __construct($connection) {
        $this->conn = $connection;
    }
    
    // Log user actions
    public function logAction($user_id, $user_type, $username, $action, $entity_type = null, $entity_id = null, $old_values = null, $new_values = null, $result = 'success', $error_message = null) {
        $ip_address = $this->getClientIP();
        $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? '';
        $session_id = session_id();
        
        $sql = "INSERT INTO audit_logs (user_id, user_type, username, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent, session_id, result, error_message) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $this->conn->prepare($sql);
        $old_json = $old_values ? json_encode($old_values) : null;
        $new_json = $new_values ? json_encode($new_values) : null;
        
        $stmt->bind_param("issssisssssss", $user_id, $user_type, $username, $action, $entity_type, $entity_id, $old_json, $new_json, $ip_address, $user_agent, $session_id, $result, $error_message);
        $stmt->execute();
    }
    
    // Log activities
    public function logActivity($user_id, $user_type, $username, $activity_type, $description, $metadata = null) {
        $ip_address = $this->getClientIP();
        $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? '';
        $session_id = session_id();
        
        $sql = "INSERT INTO activity_logs (user_id, user_type, username, activity_type, description, ip_address, user_agent, session_id, metadata) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $this->conn->prepare($sql);
        $metadata_json = $metadata ? json_encode($metadata) : null;
        
        $stmt->bind_param("issssssss", $user_id, $user_type, $username, $activity_type, $description, $ip_address, $user_agent, $session_id, $metadata_json);
        $stmt->execute();
    }
    
    // Log login
    public function logLogin($user_id, $user_type, $username, $result = 'success', $error_message = null) {
        $session_id = session_id();
        
        // Generate a proper session ID if none exists
        if (empty($session_id)) {
            $session_id = uniqid('sess_', true);
        }
        
        if ($result === 'success') {
            // Log successful login
            $this->logActivity($user_id, $user_type, $username, 'login', 'User logged in successfully');
            $this->logAction($user_id, $user_type, $username, 'login', 'user', $user_id, null, null, 'success');
            
            // Create session record
            $sql = "INSERT INTO login_sessions (user_id, user_type, username, session_id, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)";
            $stmt = $this->conn->prepare($sql);
            $ip_address = $this->getClientIP();
            $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? '';
            $stmt->bind_param("isssss", $user_id, $user_type, $username, $session_id, $ip_address, $user_agent);
            $stmt->execute();
        } else {
            // Log failed login
            $this->logActivity($user_id, $user_type, $username, 'login_failed', 'Failed login attempt', ['error' => $error_message]);
        }
    }
    
    // Log logout
    public function logLogout($user_id, $user_type, $username) {
        $session_id = session_id();
        
        // Update session record
        $sql = "UPDATE login_sessions SET logout_time = NOW(), is_active = FALSE WHERE session_id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("s", $session_id);
        $stmt->execute();
        
        // Log logout activity
        $this->logActivity($user_id, $user_type, $username, 'logout', 'User logged out');
    }
    
    // Log patient operations
    public function logPatientOperation($user_id, $user_type, $username, $operation, $patient_id, $old_data = null, $new_data = null, $result = 'success', $error_message = null) {
        $this->logAction(
            $user_id, 
            $user_type, 
            $username, 
            $operation, 
            'patient', 
            $patient_id, 
            $old_data, 
            $new_data, 
            $result, 
            $error_message
        );
    }
    
    // Log medical record operations
    public function logMedicalRecordOperation($user_id, $user_type, $username, $operation, $record_id, $patient_id, $old_data = null, $new_data = null, $result = 'success', $error_message = null) {
        $this->logAction(
            $user_id, 
            $user_type, 
            $username, 
            $operation, 
            'medical_record', 
            $record_id, 
            $old_data, 
            $new_data, 
            $result, 
            $error_message
        );
    }
    
    // Log system events
    public function logSystemEvent($event_type, $description, $metadata = null) {
        $this->logActivity(0, 'system', 'system', $event_type, $description, $metadata);
    }
    
    private function getClientIP() {
        return IPUtils::getRealClientIP();
    }
}

// Global instance
$auditLogger = new AuditLogger($conn);
?>
