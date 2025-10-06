<?php
require 'cors.php';
require 'config.php';

header("Content-Type: application/json");

// Get the address from the query parameter
$address = $_GET['address'] ?? '';

if (empty($address)) {
    http_response_code(400);
    echo json_encode(['error' => 'Address parameter is required']);
    exit;
}

try {
    // Use Nominatim API through server-side request to avoid CORS
    $encodedAddress = urlencode($address);
    $url = "https://nominatim.openstreetmap.org/search?format=json&q={$encodedAddress}&limit=1";
    
    // Set up cURL to make the request
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_USERAGENT, 'RHU-PRMS/1.0');
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($response === false || $httpCode !== 200) {
        throw new Exception('Failed to fetch geocoding data');
    }
    
    $data = json_decode($response, true);
    
    if (empty($data)) {
        echo json_encode(['error' => 'No results found for the given address']);
        exit;
    }
    
    // Return the first result with lat/lon
    $result = $data[0];
    echo json_encode([
        'success' => true,
        'lat' => floatval($result['lat']),
        'lon' => floatval($result['lon']),
        'display_name' => $result['display_name']
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Geocoding failed: ' . $e->getMessage()]);
}
?>
