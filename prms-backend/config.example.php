<?php
/**
 * Database Configuration Template
 * 
 * INSTRUCTIONS:
 * 1. Copy this file and rename it to 'config.php'
 * 2. Update the values below with your actual database credentials
 * 3. NEVER commit config.php to Git - it's in .gitignore for security
 */

$host     = 'localhost';           // Database host
$dbuser   = 'your_db_username';    // Database username (e.g., prms_user)
$dbpass   = 'your_db_password';    // Database password (CHANGE THIS!)
$dbname   = 'prms_db';             // Database name

$conn = mysqli_connect($host, $dbuser, $dbpass, $dbname);
if (!$conn) {
    die("DB connection error: " . mysqli_connect_error());
}
mysqli_set_charset($conn, 'utf8mb4');
mysqli_query($conn, "SET collation_connection = 'utf8mb4_general_ci'");

