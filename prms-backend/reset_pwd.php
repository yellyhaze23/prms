<?php
// Check which config exists
if (file_exists('config.docker.php')) {
    require 'config.docker.php';
} else {
    require 'config.php';
}

$new_password = 'password';
$hashed = password_hash($new_password, PASSWORD_BCRYPT);

$sql = "UPDATE users SET password = ? WHERE username = 'Admin'";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $hashed);

if ($stmt->execute()) {
    echo "SUCCESS! Password updated for Admin\n";
    echo "New password: password\n";
    
    // Test if it works
    $test_sql = "SELECT password FROM users WHERE username = 'Admin'";
    $result = $conn->query($test_sql);
    $user = $result->fetch_assoc();
    
    if (password_verify($new_password, $user['password'])) {
        echo "VERIFIED! Password 'password' works!\n";
    } else {
        echo "ERROR: Password verification failed\n";
    }
} else {
    echo "Error: " . $stmt->error . "\n";
}

$conn->close();
?>

