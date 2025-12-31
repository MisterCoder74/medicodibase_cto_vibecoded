<?php
/**
 * Patients API Endpoints
 * Studio Medico - Medical Office Management System
 */

header('Content-Type: application/json');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../functions.php';

$action = $_GET['action'] ?? $_POST['action'] ?? '';

try {
    switch ($action) {
        case 'list':
            $patients = readJSON(PATIENTS_FILE);
            successResponse($patients);
            break;
            
        case 'add':
            $name = trim($_POST['name'] ?? '');
            $ssn = trim($_POST['ssn'] ?? '');
            $dateOfBirth = trim($_POST['dateOfBirth'] ?? '');
            $address = trim($_POST['address'] ?? '');
            $phone = trim($_POST['phone'] ?? '');
            $email = trim($_POST['email'] ?? '');
            $isSensitive = isset($_POST['isSensitive']) && $_POST['isSensitive'] === 'true';
            $sensitiveNotes = trim($_POST['sensitiveNotes'] ?? '');
            
            // Validation
            if (empty($name)) {
                errorResponse('Nome è obbligatorio');
            }
            if (empty($ssn)) {
                errorResponse('Codice Fiscale è obbligatorio');
            }
            if (empty($email) || !validateEmail($email)) {
                errorResponse('Email valida è obbligatoria');
            }
            
            // Check if SSN already exists
            $patients = readJSON(PATIENTS_FILE);
            foreach ($patients as $patient) {
                if ($patient['ssn'] === $ssn) {
                    errorResponse('Codice Fiscale già esistente');
                }
            }
            
            // Create new patient
            $newPatient = [
                'id' => generateId(),
                'name' => $name,
                'ssn' => $ssn,
                'dateOfBirth' => $dateOfBirth,
                'address' => $address,
                'phone' => $phone,
                'email' => $email,
                'isSensitive' => $isSensitive,
                'sensitiveNotes' => $sensitiveNotes,
                'createdAt' => date('Y-m-d H:i:s'),
                'deleted' => false
            ];
            
            // Create patient directory
            createPatientDirectory($ssn);
            
            // Add to patients array
            $patients[] = $newPatient;
            writeJSON(PATIENTS_FILE, $patients);
            
            successResponse($newPatient);
            break;
            
        case 'edit':
            $id = $_POST['id'] ?? '';
            $name = trim($_POST['name'] ?? '');
            $ssn = trim($_POST['ssn'] ?? '');
            $dateOfBirth = trim($_POST['dateOfBirth'] ?? '');
            $address = trim($_POST['address'] ?? '');
            $phone = trim($_POST['phone'] ?? '');
            $email = trim($_POST['email'] ?? '');
            $isSensitive = isset($_POST['isSensitive']) && $_POST['isSensitive'] === 'true';
            $sensitiveNotes = trim($_POST['sensitiveNotes'] ?? '');
            
            // Validation
            if (empty($id)) {
                errorResponse('ID paziente è obbligatorio');
            }
            if (empty($name)) {
                errorResponse('Nome è obbligatorio');
            }
            if (empty($ssn)) {
                errorResponse('Codice Fiscale è obbligatorio');
            }
            if (empty($email) || !validateEmail($email)) {
                errorResponse('Email valida è obbligatoria');
            }
            
            $patients = readJSON(PATIENTS_FILE);
            $found = false;
            
            foreach ($patients as &$patient) {
                if ($patient['id'] === $id) {
                    // Check if SSN is being changed and if it conflicts
                    if ($patient['ssn'] !== $ssn) {
                        foreach ($patients as $p) {
                            if ($p['id'] !== $id && $p['ssn'] === $ssn) {
                                errorResponse('Codice Fiscale già esistente');
                            }
                        }
                    }
                    
                    $patient['name'] = $name;
                    $patient['ssn'] = $ssn;
                    $patient['dateOfBirth'] = $dateOfBirth;
                    $patient['address'] = $address;
                    $patient['phone'] = $phone;
                    $patient['email'] = $email;
                    $patient['isSensitive'] = $isSensitive;
                    $patient['sensitiveNotes'] = $sensitiveNotes;
                    $patient['updatedAt'] = date('Y-m-d H:i:s');
                    
                    $found = true;
                    $updatedPatient = $patient;
                    break;
                }
            }
            
            if (!$found) {
                errorResponse('Paziente non trovato', 404);
            }
            
            writeJSON(PATIENTS_FILE, $patients);
            successResponse($updatedPatient);
            break;
            
        case 'delete':
            $id = $_POST['id'] ?? '';
            
            if (empty($id)) {
                errorResponse('ID paziente è obbligatorio');
            }
            
            $patients = readJSON(PATIENTS_FILE);
            $found = false;
            
            foreach ($patients as &$patient) {
                if ($patient['id'] === $id) {
                    $patient['deleted'] = true;
                    $patient['deletedAt'] = date('Y-m-d H:i:s');
                    $found = true;
                    break;
                }
            }
            
            if (!$found) {
                errorResponse('Paziente non trovato', 404);
            }
            
            writeJSON(PATIENTS_FILE, $patients);
            successResponse(['message' => 'Paziente eliminato con successo']);
            break;
            
        case 'upload_attachment':
            $patientId = $_POST['patientId'] ?? '';
            
            if (empty($patientId)) {
                errorResponse('ID paziente è obbligatorio');
            }
            
            $patient = getPatientById($patientId);
            if (!$patient) {
                errorResponse('Paziente non trovato', 404);
            }
            
            if (!isset($_FILES['file'])) {
                errorResponse('Nessun file caricato');
            }
            
            $file = $_FILES['file'];
            
            if ($file['error'] !== UPLOAD_ERR_OK) {
                errorResponse('Errore durante il caricamento del file');
            }
            
            // Create patient directory
            $patientDir = createPatientDirectory($patient['ssn']);
            $assetsDir = $patientDir . '/assets';
            
            // Generate unique filename
            $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
            $filename = uniqid() . '_' . basename($file['name']);
            $filepath = $assetsDir . '/' . $filename;
            
            if (!move_uploaded_file($file['tmp_name'], $filepath)) {
                errorResponse('Errore durante il salvataggio del file');
            }
            
            successResponse([
                'filename' => $filename,
                'path' => $filepath,
                'message' => 'File caricato con successo'
            ]);
            break;
            
        default:
            errorResponse('Azione non valida', 400);
    }
} catch (Exception $e) {
    error_log("Patients API Error: " . $e->getMessage());
    errorResponse('Errore interno del server: ' . $e->getMessage(), 500);
}
