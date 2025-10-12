<?php
require 'cors.php';
require 'config.php';

header("Content-Type: application/json");

try {
    // Get active users (logged in within last 24 hours)
    $activeUsersSql = "SELECT COUNT(DISTINCT user_id) as active_users FROM login_sessions WHERE is_active = TRUE AND login_time >= DATE_SUB(NOW(), INTERVAL 24 HOUR)";
    $activeUsersResult = $conn->query($activeUsersSql);
    $activeUsers = $activeUsersResult->fetch_assoc()['active_users'];

    // Get today's logins
    $todayLoginsSql = "SELECT COUNT(*) as today_logins FROM activity_logs WHERE activity_type = 'login' AND DATE(created_at) = CURDATE()";
    $todayLoginsResult = $conn->query($todayLoginsSql);
    $todayLogins = $todayLoginsResult->fetch_assoc()['today_logins'];

    // Get failed logins today
    $failedLoginsSql = "SELECT COUNT(*) as failed_logins FROM activity_logs WHERE activity_type = 'login_failed' AND DATE(created_at) = CURDATE()";
    $failedLoginsResult = $conn->query($failedLoginsSql);
    $failedLogins = $failedLoginsResult->fetch_assoc()['failed_logins'];

    // Get security events (failed logins, errors, etc.)
    $securityEventsSql = "SELECT COUNT(*) as security_events FROM activity_logs WHERE activity_type IN ('login_failed', 'error', 'security_alert') AND DATE(created_at) = CURDATE()";
    $securityEventsResult = $conn->query($securityEventsSql);
    $securityEvents = $securityEventsResult->fetch_assoc()['security_events'];

    // Get recent activities (last 10)
    $recentActivitiesSql = "SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 10";
    $recentActivitiesResult = $conn->query($recentActivitiesSql);
    $recentActivities = [];
    while ($row = $recentActivitiesResult->fetch_assoc()) {
        $recentActivities[] = $row;
    }

    echo json_encode([
        'success' => true,
        'activeUsers' => $activeUsers,
        'todayLogins' => $todayLogins,
        'failedLogins' => $failedLogins,
        'securityEvents' => $securityEvents,
        'recentActivities' => $recentActivities
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
