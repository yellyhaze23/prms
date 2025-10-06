<?php
require_once __DIR__ . '/_init.php';
$user = current_user_or_401();

$sql = "
    SELECT p.id, p.full_name, p.address, he.previous_illness AS disease
    FROM patients p
    LEFT JOIN (
      SELECT h1.* FROM health_examinations h1
      INNER JOIN (
        SELECT patient_id, MAX(updated_at) as max_updated, MAX(id) as max_id
        FROM health_examinations GROUP BY patient_id
      ) h2 ON h1.patient_id = h2.patient_id AND h1.updated_at = h2.max_updated AND h1.id = h2.max_id
    ) he ON he.patient_id = p.id
    WHERE p.address IS NOT NULL AND p.address != ''
    ORDER BY p.id DESC LIMIT 50
";
$res = $conn->query($sql);
$list = [];
if ($res) { while ($row = $res->fetch_assoc()) { $list[] = $row; } }

$stats = [
  'total' => count($list),
  'sick' => count(array_filter($list, fn($r) => !empty($r['disease']))),
  'healthy' => count(array_filter($list, fn($r) => empty($r['disease']))),
];

json_ok([ 'patients' => $list, 'stats' => $stats ]);
