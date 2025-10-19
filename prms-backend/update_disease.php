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
    // Get input data without escaping (prepared statements will handle it)
    $id = (int)$data['id'];
    $name = $data['name'];
    $description = $data['description'];
    $symptoms = $data['symptoms'];
    $incubation_period = $data['incubation_period'] ?? '';
    $contagious_period = $data['contagious_period'] ?? '';
    $color = $data['color'] ?? 'blue';
    $icon = $data['icon'] ?? 'FaVirus';

    // Check if disease exists using prepared statement
    $checkStmt = $conn->prepare("SELECT id FROM diseases WHERE id = ?");
    $checkStmt->bind_param("i", $id);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();
    if ($checkResult->num_rows === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'Disease not found.']);
        exit;
    }

    // Check if another disease with same name exists (excluding current one) using prepared statement
    $nameCheckStmt = $conn->prepare("SELECT id FROM diseases WHERE name = ? AND id != ?");
    $nameCheckStmt->bind_param("si", $name, $id);
    $nameCheckStmt->execute();
    $nameCheckResult = $nameCheckStmt->get_result();
    if ($nameCheckResult->num_rows > 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Disease with this name already exists.']);
        exit;
    }

    // Update disease using prepared statement
    $stmt = $conn->prepare("UPDATE diseases SET name = ?, description = ?, symptoms = ?, incubation_period = ?, contagious_period = ?, color = ?, icon = ?, updated_at = NOW() WHERE id = ?");
    $stmt->bind_param("sssssssi", $name, $description, $symptoms, $incubation_period, $contagious_period, $color, $icon, $id);

    if ($stmt->execute()) {
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
        echo json_encode(['error' => 'Database error: ' . $stmt->error]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>
