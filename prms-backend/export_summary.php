<?php
require 'cors.php';
require 'config.php';

$query = "SELECT year, month, disease, SUM(total_cases) as total_cases 
          FROM disease_summary 
          GROUP BY year, month, disease
          ORDER BY year, month";

$result = $conn->query($query);

$fp = fopen('forecast_data.csv', 'w');
fputcsv($fp, ['year', 'month', 'disease', 'total_cases']);

while ($row = $result->fetch_assoc()) {
    fputcsv($fp, $row);
}

fclose($fp);
echo "Data exported successfully!";
?>
