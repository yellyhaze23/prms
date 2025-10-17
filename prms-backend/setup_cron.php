<?php
// Setup automatic notification generation
// This creates a simple scheduler for Windows

echo "Setting up automatic notification generation...\n";

// Create a batch file for Windows Task Scheduler
$batchContent = '@echo off
cd /d "C:\laragon\www\prms\prms-backend"
php generate_notifications.php
echo Notifications generated at %date% %time% >> notification_log.txt';

file_put_contents('generate_notifications.bat', $batchContent);

echo "Created generate_notifications.bat\n";
echo "To set up automatic notifications:\n";
echo "1. Open Windows Task Scheduler\n";
echo "2. Create Basic Task\n";
echo "3. Name: 'PRMS Notifications'\n";
echo "4. Trigger: Daily at 9:00 AM\n";
echo "5. Action: Start Program\n";
echo "6. Program: C:\\laragon\\www\\prms\\prms-backend\\generate_notifications.bat\n";
echo "\nOr run manually: php generate_notifications.php\n";

// Test the notification generation
echo "\nTesting notification generation...\n";
exec('php generate_notifications.php', $output, $returnCode);

if ($returnCode === 0) {
    echo "Notification generation test successful!\n";
} else {
    echo "Error in notification generation test.\n";
}
?>
