<?php
$host     = 'localhost';
$dbuser   = 'root';
$dbpass   = '';
$dbname   = 'prms_db';

$conn = mysqli_connect($host, $dbuser, $dbpass, $dbname);
if (!$conn) {
    die("DB connection error: " . mysqli_connect_error());
}
mysqli_set_charset($conn, 'utf8mb4');
