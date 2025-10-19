<?php
require 'cors.php';
require 'config.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

// Validate required fields
if (
    !isset($data['name']) || empty($data['name']) ||
    !isset($data['description']) || empty($data['description']) ||
    !isset($data['symptoms']) || empty($data['symptoms'])
) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields: Name, Description, and Symptoms are required.']);
    exit;
}

try {
    // Get input data
    $name = $data['name'];
    $description = $data['description'];
    $symptoms = $data['symptoms'];
    $incubation_period = $data['incubation_period'] ?? '';
    $contagious_period = $data['contagious_period'] ?? '';
    $color = $data['color'] ?? 'blue';
    $icon = $data['icon'] ?? 'FaVirus';

    // Check if disease name already exists using prepared statement
    $checkStmt = $conn->prepare("SELECT id FROM diseases WHERE name = ?");
    $checkStmt->bind_param("s", $name);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();
    
    if ($checkResult->num_rows > 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Disease with this name already exists.']);
        exit;
    }

    // Insert new disease using prepared statement
    $stmt = $conn->prepare("INSERT INTO diseases (name, description, symptoms, incubation_period, contagious_period, color, icon) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sssssss", $name, $description, $symptoms, $incubation_period, $contagious_period, $color, $icon);

    if ($stmt->execute()) {
        $newId = $conn->insert_id;
        
        echo json_encode([
            'success' => true,
            'message' => 'Disease added successfully',
            'id' => $newId,
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
