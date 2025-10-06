<?php
require_once 'cors.php';
require_once 'config.php';

header('Content-Type: application/json');

// Ensure settings table exists
$createSql = "CREATE TABLE IF NOT EXISTS settings (
  id INT PRIMARY KEY DEFAULT 1,
  clinic_name VARCHAR(150) DEFAULT NULL,
  clinic_address VARCHAR(255) DEFAULT NULL,
  clinic_phone VARCHAR(50) DEFAULT NULL,
  clinic_email VARCHAR(150) DEFAULT NULL,
  map_default_center VARCHAR(100) DEFAULT NULL, -- format: lat,lon
  map_default_zoom INT DEFAULT 12,
  forecast_default_days INT DEFAULT 30,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
mysqli_query($conn, $createSql);

// Ensure one row exists
$check = mysqli_query($conn, "SELECT COUNT(*) AS c FROM settings");
$row = mysqli_fetch_assoc($check);
if ((int)$row['c'] === 0) {
  mysqli_query($conn, "INSERT INTO settings (id, clinic_name, clinic_address, clinic_phone, clinic_email, map_default_center, map_default_zoom, forecast_default_days) VALUES (1, NULL, NULL, NULL, NULL, '14.2794,121.4167', 12, 30)");
}

$res = mysqli_query($conn, "SELECT * FROM settings WHERE id=1");
$settings = mysqli_fetch_assoc($res);

echo json_encode([
  'success' => true,
  'settings' => $settings
]);
?>


