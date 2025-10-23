<?php
require 'config.php';

echo "=== COMPREHENSIVE DUMMY DATA GENERATION ===\n";
echo "Generating realistic cases for 5 communicable diseases\n";
echo "Los Baños barangays with seasonal patterns (2021-2025)\n\n";

// Los Baños barangays
$barangays = [
    'Anos', 'Bagong Silang', 'Bambang', 'Batong Malake', 'Baybayin', 
    'Bayog', 'Lalakay', 'Maahas', 'Malinta', 'Mayondon', 
    'Putho-Tuntungin', 'San Antonio', 'Tadlac', 'Timugan'
];

// 5 communicable diseases
$diseases = [
    'dengue' => [
        'name' => 'Dengue',
        'peak_months' => [6, 7, 8, 9, 10], // Rainy season
        'base_cases' => 15,
        'peak_multiplier' => 3.5,
        'low_multiplier' => 0.3
    ],
    'measles' => [
        'name' => 'Measles', 
        'peak_months' => [1, 2, 3, 12], // Cooler months
        'base_cases' => 8,
        'peak_multiplier' => 2.0,
        'low_multiplier' => 0.4
    ],
    'tuberculosis' => [
        'name' => 'Tuberculosis',
        'peak_months' => [1, 2, 3, 4, 5], // Consistent year-round
        'base_cases' => 12,
        'peak_multiplier' => 1.8,
        'low_multiplier' => 0.7
    ],
    'chickenpox' => [
        'name' => 'Chickenpox',
        'peak_months' => [11, 12, 1, 2], // Winter months
        'base_cases' => 6,
        'peak_multiplier' => 2.5,
        'low_multiplier' => 0.3
    ],
    'hepatitis' => [
        'name' => 'Hepatitis',
        'peak_months' => [4, 5, 6, 7], // Summer months
        'base_cases' => 4,
        'peak_multiplier' => 2.2,
        'low_multiplier' => 0.5
    ]
];

// Filipino names for realistic data
$first_names = [
    'Maria', 'Jose', 'Juan', 'Ana', 'Pedro', 'Carmen', 'Antonio', 'Rosa', 'Manuel', 'Teresa',
    'Francisco', 'Isabel', 'Miguel', 'Elena', 'Carlos', 'Luz', 'Ramon', 'Carmen', 'Fernando', 'Concepcion',
    'Ricardo', 'Mercedes', 'Alberto', 'Dolores', 'Eduardo', 'Pilar', 'Roberto', 'Esperanza', 'Jorge', 'Amparo',
    'Luis', 'Rosario', 'Sergio', 'Soledad', 'Rafael', 'Victoria', 'Angel', 'Guadalupe', 'Jesus', 'Cristina',
    'Daniel', 'Patricia', 'Andres', 'Monica', 'Felipe', 'Beatriz', 'Santiago', 'Adela', 'Hector', 'Rebecca'
];

$last_names = [
    'Santos', 'Reyes', 'Cruz', 'Bautista', 'Ocampo', 'Garcia', 'Lopez', 'Mendoza', 'Ramos', 'Gonzales',
    'Torres', 'Flores', 'Rivera', 'Gomez', 'Diaz', 'Morales', 'Jimenez', 'Ruiz', 'Hernandez', 'Martinez',
    'Sanchez', 'Lopez', 'Gonzalez', 'Perez', 'Martin', 'Gomez', 'Ruiz', 'Diaz', 'Herrera', 'Munoz',
    'Alvarez', 'Romero', 'Alonso', 'Gutierrez', 'Navarro', 'Torres', 'Dominguez', 'Vazquez', 'Ramos', 'Gil'
];

$middle_names = [
    'Santos', 'Reyes', 'Cruz', 'Bautista', 'Ocampo', 'Garcia', 'Lopez', 'Mendoza', 'Ramos', 'Gonzales',
    'Torres', 'Flores', 'Rivera', 'Gomez', 'Diaz', 'Morales', 'Jimenez', 'Ruiz', 'Hernandez', 'Martinez'
];

// Symptoms for each disease
$disease_symptoms = [
    'dengue' => [
        'High fever (39-40°C)', 'Severe headache', 'Pain behind eyes', 'Muscle and joint pain',
        'Nausea and vomiting', 'Skin rash', 'Mild bleeding (nose or gums)', 'Fatigue'
    ],
    'measles' => [
        'High fever', 'Cough', 'Runny nose', 'Red, watery eyes', 'Koplik spots in mouth',
        'Rash starting on face and neck', 'Sore throat', 'Loss of appetite'
    ],
    'tuberculosis' => [
        'Persistent cough (3+ weeks)', 'Chest pain', 'Coughing up blood', 'Fatigue',
        'Weight loss', 'Night sweats', 'Fever', 'Loss of appetite'
    ],
    'chickenpox' => [
        'Itchy rash with blisters', 'Fever', 'Headache', 'Loss of appetite', 'Fatigue',
        'Rash starts on chest, back, face', 'Blisters turn to scabs', 'Mild flu-like symptoms'
    ],
    'hepatitis' => [
        'Jaundice (yellow skin/eyes)', 'Fatigue', 'Abdominal pain', 'Dark urine',
        'Pale stool', 'Nausea and vomiting', 'Loss of appetite', 'Joint pain'
    ]
];

// Treatment protocols
$treatments = [
    'dengue' => [
        'Rest and fluid intake', 'Paracetamol for fever', 'Avoid aspirin/NSAIDs',
        'Monitor for warning signs', 'Hospitalization if severe', 'Blood transfusion if needed'
    ],
    'measles' => [
        'Vitamin A supplementation', 'Rest and isolation', 'Fever management',
        'Prevent complications', 'Supportive care', 'Vaccination for contacts'
    ],
    'tuberculosis' => [
        'DOT (Directly Observed Treatment)', 'Isoniazid + Rifampin + Ethambutol + Pyrazinamide',
        '6-month treatment course', 'Regular monitoring', 'Contact tracing', 'Nutritional support'
    ],
    'chickenpox' => [
        'Calamine lotion for itching', 'Antihistamines', 'Cool baths', 'Keep nails short',
        'Isolation until scabs form', 'Prevent secondary infection'
    ],
    'hepatitis' => [
        'Rest and adequate nutrition', 'Avoid alcohol', 'Monitor liver function',
        'Supportive care', 'Prevent transmission', 'Vaccination for contacts'
    ]
];

// Medical advice
$medical_advice = [
    'dengue' => 'Rest at home, drink plenty of fluids, monitor for warning signs, return if symptoms worsen',
    'measles' => 'Stay isolated for 4 days after rash appears, rest, maintain good nutrition',
    'tuberculosis' => 'Complete full 6-month treatment, take medications as prescribed, regular follow-ups',
    'chickenpox' => 'Stay home until all blisters scab over, avoid scratching, keep clean',
    'hepatitis' => 'Rest, avoid alcohol, eat nutritious food, follow up for liver function tests'
];

// Laboratory procedures
$lab_procedures = [
    'dengue' => 'NS1 antigen test, IgM/IgG serology, Complete Blood Count, Platelet count',
    'measles' => 'IgM antibody test, Viral culture, Complete Blood Count',
    'tuberculosis' => 'Sputum AFB smear, Chest X-ray, Tuberculin skin test, Sputum culture',
    'chickenpox' => 'Clinical diagnosis, Viral PCR if needed, Complete Blood Count',
    'hepatitis' => 'Liver function tests, Hepatitis markers, Viral load, Ultrasound'
];

// Prescribed medicines
$prescribed_medicines = [
    'dengue' => 'Paracetamol 500mg every 6 hours, Oral rehydration solution, Vitamin C',
    'measles' => 'Vitamin A 200,000 IU, Paracetamol for fever, Cough syrup',
    'tuberculosis' => 'Isoniazid 300mg daily, Rifampin 600mg daily, Ethambutol 800mg daily, Pyrazinamide 1500mg daily',
    'chickenpox' => 'Calamine lotion, Antihistamine, Paracetamol, Antiviral if severe',
    'hepatitis' => 'Liver support supplements, Vitamin B complex, Rest and nutrition'
];

function getSeasonalMultiplier($disease, $month) {
    global $diseases;
    $disease_data = $diseases[$disease];
    
    if (in_array($month, $disease_data['peak_months'])) {
        return $disease_data['peak_multiplier'];
    } else {
        return $disease_data['low_multiplier'];
    }
}

function generateRandomName() {
    global $first_names, $last_names, $middle_names;
    
    $first = $first_names[array_rand($first_names)];
    $middle = $middle_names[array_rand($middle_names)];
    $last = $last_names[array_rand($last_names)];
    
    $full_name = $first . ' ' . $middle . ' ' . $last;
    
    return [
        'first_name' => $first,
        'middle_name' => $middle,
        'surname' => $last,
        'suffix' => '',
        'full_name' => $full_name
    ];
}

function generateRandomDate($start_year, $end_year) {
    $start = strtotime("$start_year-01-01");
    $end = strtotime("$end_year-12-31");
    $random_time = mt_rand($start, $end);
    return date('Y-m-d', $random_time);
}

function generateRandomDateTime($start_year, $end_year) {
    $start = strtotime("$start_year-01-01");
    $end = strtotime("$end_year-12-31");
    $random_time = mt_rand($start, $end);
    return date('Y-m-d H:i:s', $random_time);
}

try {
    // Clear existing data
    echo "🧹 Clearing existing data...\n";
    $conn->query("DELETE FROM medical_records");
    $conn->query("DELETE FROM patients");
    $conn->query("DELETE FROM disease_summary");
    echo "✅ Cleared existing data\n\n";

    $total_patients = 0;
    $total_medical_records = 0;
    $disease_summary_data = [];

    // Generate realistic number of unique patients (1000 patients)
    $unique_patients = 1000;
    echo "👥 Generating $unique_patients unique patients with consultation history...\n\n";
    
    // Create patients first
    $patient_ids = [];
    for ($i = 0; $i < $unique_patients; $i++) {
        // Generate patient
        $name_data = generateRandomName();
        $age = mt_rand(1, 80);
        $sex = mt_rand(0, 1) ? 'Male' : 'Female';
        $birth_year = 2021 - $age; // Base age on 2021
        $date_of_birth = generateRandomDate($birth_year, $birth_year);
        $barangay = $barangays[array_rand($barangays)];
        $address = "$barangay, Los Baños, Laguna";
        $created_at = generateRandomDateTime(2021, 2021);
        
        // Assign patients to users: 70% to admin (ID 1), 30% to staff (ID 3)
        $added_by = (mt_rand(1, 10) <= 7) ? 1 : 3;
        
        // Insert patient
        $patient_sql = "INSERT INTO patients (full_name, age, sex, date_of_birth, address, created_at, added_by) VALUES (?, ?, ?, ?, ?, ?, ?)";
        $patient_stmt = $conn->prepare($patient_sql);
        $patient_stmt->bind_param("sissssi", 
            $name_data['full_name'], 
            $age, 
            $sex, 
            $date_of_birth, 
            $address, 
            $created_at, 
            $added_by
        );
        $patient_stmt->execute();
        $patient_id = $conn->insert_id;
        $patient_ids[] = $patient_id;
        $total_patients++;
        
        if (($i + 1) % 100 == 0) {
            echo "  ✅ Created " . ($i + 1) . " patients\n";
        }
    }
    
    echo "\n📋 Generating consultation history for each patient...\n";
    
    // Generate consultations for each patient
    foreach ($patient_ids as $patient_id) {
        // Get patient data for medical records
        $patient_sql = "SELECT * FROM patients WHERE id = ?";
        $patient_stmt = $conn->prepare($patient_sql);
        $patient_stmt->bind_param("i", $patient_id);
        $patient_stmt->execute();
        $patient_data = $patient_stmt->get_result()->fetch_assoc();
        
        // Generate 2-3 consultations per patient
        $consultations = mt_rand(2, 3);
        
        for ($consultation = 0; $consultation < $consultations; $consultation++) {
            // Generate consultation date (2021-2025)
            $consultation_year = mt_rand(2021, 2025);
            $consultation_month = mt_rand(1, 12);
            
            // Skip future months for 2025 (current month is October = 10)
            if ($consultation_year == 2025 && $consultation_month > 10) {
                $consultation_month = mt_rand(1, 10); // Allow up to October 2025
            }
            
            $consultation_day = mt_rand(1, 28);
            $consultation_date = $consultation_year . '-' . str_pad($consultation_month, 2, '0', STR_PAD_LEFT) . '-' . str_pad($consultation_day, 2, '0', STR_PAD_LEFT);
            $created_at = generateRandomDateTime($consultation_year, $consultation_year);
            
            // Select disease based on seasonal patterns
            $disease_key = array_rand($diseases);
            $disease_data = $diseases[$disease_key];
            
            // Check if this disease is in peak season
            $seasonal_multiplier = getSeasonalMultiplier($disease_key, $consultation_month);
            $disease_probability = $seasonal_multiplier > 1.5 ? 0.7 : 0.3; // Higher chance during peak season
            
            if (mt_rand(1, 100) / 100 > $disease_probability) {
                // If not peak season, try another disease
                $disease_key = array_rand($diseases);
                $disease_data = $diseases[$disease_key];
            }
            
            // Generate consultation type
            $consultation_types = ['initial', 'follow_up', 'new_issue', 'annual_checkup'];
            $consultation_type = $consultation_types[array_rand($consultation_types)];
            
            // Adjust diagnosis based on consultation type
            if ($consultation_type === 'follow_up') {
                // Follow-up: same disease, different symptoms
                $symptoms = $disease_symptoms[$disease_key];
                $random_symptoms = array_slice($symptoms, 0, mt_rand(2, 4));
                $symptoms_text = "Follow-up: " . implode(', ', $random_symptoms);
                $medical_remarks = "Patient showing improvement. Continue current treatment.";
            } elseif ($consultation_type === 'annual_checkup') {
                // Annual checkup: healthy or minor issues
                $symptoms_text = "Annual checkup - general health assessment";
                $medical_remarks = "Patient in good health. Continue preventive measures.";
            } else {
                // Initial or new issue
                $symptoms = $disease_symptoms[$disease_key];
                $random_symptoms = array_slice($symptoms, 0, mt_rand(3, count($symptoms)));
                $symptoms_text = implode(', ', $random_symptoms);
                $medical_remarks = "Patient responded well to treatment. Follow-up in 1 week.";
            }
            
            $treatment = $treatments[$disease_key];
            $random_treatment = array_slice($treatment, 0, mt_rand(2, count($treatment)));
            $treatment_text = implode(', ', $random_treatment);
            
            // Vital signs (slightly different for each consultation)
            $blood_pressure = mt_rand(90, 140) . '/' . mt_rand(60, 90);
            $temperature = mt_rand(36, 40) . '.' . mt_rand(0, 9);
            $height = mt_rand(120, 190);
            $weight = mt_rand(30, 100);
            
            // Medical record data
            $medical_sql = "INSERT INTO medical_records (
                patient_id, surname, first_name, middle_name, suffix, date_of_birth,
                barangay, philhealth_id, priority, blood_pressure, temperature, height, weight,
                chief_complaint, place_of_consultation, type_of_services, date_of_consultation,
                health_provider, diagnosis, laboratory_procedure, prescribed_medicine,
                medical_advice, medical_remarks, treatment, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            
            $medical_stmt = $conn->prepare($medical_sql);
            $philhealth_id = 'PH' . mt_rand(100000000, 999999999);
            $priority = ['low', 'medium', 'high'][mt_rand(0, 2)];
            $place_of_consultation = "RHU Los Baños";
            $type_of_services = "Outpatient Consultation";
            $health_provider = "Dr. " . $first_names[array_rand($first_names)] . " " . $last_names[array_rand($last_names)];
            $lab_procedure = $lab_procedures[$disease_key];
            $prescribed_medicine = $prescribed_medicines[$disease_key];
            $medical_advice_text = $medical_advice[$disease_key];
            
            // Parse patient name components
            $name_parts = explode(' ', $patient_data['full_name']);
            $surname = isset($name_parts[2]) ? $name_parts[2] : $name_parts[count($name_parts) - 1];
            $first_name = isset($name_parts[0]) ? $name_parts[0] : '';
            $middle_name = isset($name_parts[1]) ? $name_parts[1] : '';
            
            // Parse address components
            $address_parts = explode(', ', $patient_data['address']);
            $barangay_from_address = $address_parts[0];
            
            // Ensure all variables are properly defined
            $date_of_birth = $patient_data['date_of_birth'];
            $suffix = '';
            
            $medical_stmt->bind_param("isssssssssssssssssssssssss",
                $patient_id,
                $surname,
                $first_name,
                $middle_name,
                $suffix,
                $date_of_birth,
                $barangay_from_address,
                $philhealth_id,
                $priority,
                $blood_pressure,
                $temperature,
                $height,
                $weight,
                $symptoms_text,
                $place_of_consultation,
                $type_of_services,
                $consultation_date,
                $health_provider,
                $disease_data['name'],
                $lab_procedure,
                $prescribed_medicine,
                $medical_advice_text,
                $medical_remarks,
                $treatment_text,
                $created_at,
                $created_at
            );
            
            $medical_stmt->execute();
            $total_medical_records++;
            
            // Track for disease summary
            $disease_summary_key = $disease_data['name'] . '_' . $consultation_year . '_' . $consultation_month;
            if (!isset($disease_summary_data[$disease_summary_key])) {
                $disease_summary_data[$disease_summary_key] = [
                    'disease_name' => $disease_data['name'],
                    'year' => $consultation_year,
                    'month' => $consultation_month,
                    'total_cases' => 0
                ];
            }
            $disease_summary_data[$disease_summary_key]['total_cases']++;
        }
        
        if (($patient_id % 100 == 0)) {
            echo "  📋 Generated consultations for " . $patient_id . " patients\n";
        }
    }
    
    // Insert disease summary data
    echo "\n📊 Inserting disease summary data...\n";
    foreach ($disease_summary_data as $summary) {
        $summary_sql = "INSERT INTO disease_summary (disease_name, year, month, total_cases, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())";
        $summary_stmt = $conn->prepare($summary_sql);
        $summary_stmt->bind_param("siii", 
            $summary['disease_name'], 
            $summary['year'], 
            $summary['month'], 
            $summary['total_cases']
        );
        $summary_stmt->execute();
    }
    
    // Get user distribution
    $user_dist_sql = "SELECT added_by, COUNT(*) as count FROM patients GROUP BY added_by";
    $user_dist_result = $conn->query($user_dist_sql);
    $admin_count = 0;
    $staff_count = 0;
    while ($row = $user_dist_result->fetch_assoc()) {
        if ($row['added_by'] == 1) $admin_count = $row['count'];
        if ($row['added_by'] == 3) $staff_count = $row['count'];
    }
    
    echo "\n✅ DUMMY DATA GENERATION COMPLETE!\n";
    echo "📊 Summary:\n";
    echo "  - Total Patients: $total_patients\n";
    echo "  - Total Medical Records: $total_medical_records\n";
    echo "  - Disease Summary Records: " . count($disease_summary_data) . "\n";
    echo "  - Time Period: 2021-2025 (September)\n";
    echo "  - Barangays: " . count($barangays) . " Los Baños barangays\n";
    echo "  - Diseases: 5 communicable diseases with seasonal patterns\n";
    echo "  - User Distribution:\n";
    echo "    * Admin (ID 1): $admin_count patients\n";
    echo "    * Staff (ID 3): $staff_count patients\n\n";
    
    // Show sample data
    echo "📋 Sample Data:\n";
    $sample_sql = "SELECT disease_name, year, month, total_cases FROM disease_summary ORDER BY disease_name, year, month LIMIT 10";
    $sample_result = $conn->query($sample_sql);
    while ($row = $sample_result->fetch_assoc()) {
        echo "  - {$row['disease_name']}: {$row['year']}-{$row['month']} = {$row['total_cases']} cases\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

$conn->close();
?>
