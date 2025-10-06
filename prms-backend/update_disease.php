<?php
require 'cors.php';
require 'config.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

// Validate required fields
if (
    !isset($data['id']) ||
    !isset($data['name']) || empty($data['name']) ||
    !isset($data['description']) || empty($data['description']) ||
    !isset($data['symptoms']) || empty($data['symptoms'])
) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields: ID, Name, Description, and Symptoms are required.']);
    exit;
}

try {
    // Sanitize input data
    $id = (int)$data['id'];
    $name = mysqli_real_escape_string($conn, $data['name']);
    $description = mysqli_real_escape_string($conn, $data['description']);
    $symptoms = mysqli_real_escape_string($conn, $data['symptoms']);
    $incubation_period = mysqli_real_escape_string($conn, $data['incubation_period'] ?? '');
    $contagious_period = mysqli_real_escape_string($conn, $data['contagious_period'] ?? '');
    $color = mysqli_real_escape_string($conn, $data['color'] ?? 'blue');
    $icon = mysqli_real_escape_string($conn, $data['icon'] ?? 'FaVirus');

    // Check if disease exists
    $checkSql = "SELECT id FROM diseases WHERE id = $id";
    $checkResult = $conn->query($checkSql);
    if ($checkResult->num_rows === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'Disease not found.']);
        exit;
    }

    // Check if another disease with same name exists (excluding current one)
    $nameCheckSql = "SELECT id FROM diseases WHERE name = '$name' AND id != $id";
    $nameCheckResult = $conn->query($nameCheckSql);
    if ($nameCheckResult->num_rows > 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Disease with this name already exists.']);
        exit;
    }

    // Update disease
    $sql = "UPDATE diseases SET 
                name = '$name',
                description = '$description',
                symptoms = '$symptoms',
                incubation_period = '$incubation_period',
                contagious_period = '$contagious_period',
                color = '$color',
                icon = '$icon',
                updated_at = NOW()
            WHERE id = $id";

    if (mysqli_query($conn, $sql)) {
        echo json_encode([
            'success' => true,
            'message' => 'Disease updated successfully',
            'id' => $id,
            'name' => $name,
            'description' => $description,
            'symptoms' => $symptoms,
            'incubation_period' => $incubation_period,
            'contagious_period' => $contagious_period,
            'color' => $color,
            'icon' => $icon
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . mysqli_error($conn)]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>
