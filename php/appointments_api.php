<?php
/**
 * Appointments API Endpoints
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
            $date = $_GET['date'] ?? null;
            $appointments = readJSON(APPOINTMENTS_FILE);
            
            // Filter by date if provided
            if ($date) {
                $appointments = array_filter($appointments, function($apt) use ($date) {
                    return $apt['date'] === $date;
                });
                $appointments = array_values($appointments);
            }
            
            successResponse($appointments);
            break;
            
        case 'add':
            $patientId = trim($_POST['patientId'] ?? '');
            $date = trim($_POST['date'] ?? '');
            $time = trim($_POST['time'] ?? '');
            $reason = trim($_POST['reason'] ?? '');
            $notes = trim($_POST['notes'] ?? '');
            $status = trim($_POST['status'] ?? STATUS_PENDING);

            // Validation
            if (empty($patientId)) {
                errorResponse('Paziente è obbligatorio');
            }
            if (empty($date)) {
                errorResponse('Data è obbligatoria');
            }
            if (empty($time)) {
                errorResponse('Ora è obbligatoria');
            }

            // Verify patient exists
            $patient = getPatientById($patientId);
            if (!$patient) {
                errorResponse('Paziente non trovato', 404);
            }

            // Create new appointment
            $newAppointment = [
                'id' => generateId(),
                'patientId' => $patientId,
                'patientName' => $patient['name'],
                'date' => $date,
                'time' => $time,
                'reason' => $reason,
                'notes' => $notes,
                'status' => $status,
                'createdAt' => date('Y-m-d H:i:s')
            ];

            $appointments = readJSON(APPOINTMENTS_FILE);
            $appointments[] = $newAppointment;
            writeJSON(APPOINTMENTS_FILE, $appointments);

            // Send email notification
            sendAppointmentEmail($newAppointment, $patient, 'create');

            successResponse($newAppointment);
            break;
            
        case 'edit':
            $id = $_POST['id'] ?? '';
            $patientId = trim($_POST['patientId'] ?? '');
            $date = trim($_POST['date'] ?? '');
            $time = trim($_POST['time'] ?? '');
            $reason = trim($_POST['reason'] ?? '');
            $notes = trim($_POST['notes'] ?? '');
            $status = trim($_POST['status'] ?? STATUS_PENDING);

            // Validation
            if (empty($id)) {
                errorResponse('ID appuntamento è obbligatorio');
            }
            if (empty($patientId)) {
                errorResponse('Paziente è obbligatorio');
            }
            if (empty($date)) {
                errorResponse('Data è obbligatoria');
            }
            if (empty($time)) {
                errorResponse('Ora è obbligatoria');
            }

            // Verify patient exists
            $patient = getPatientById($patientId);
            if (!$patient) {
                errorResponse('Paziente non trovato', 404);
            }

            $appointments = readJSON(APPOINTMENTS_FILE);
            $found = false;

            foreach ($appointments as &$appointment) {
                if ($appointment['id'] === $id) {
                    $appointment['patientId'] = $patientId;
                    $appointment['patientName'] = $patient['name'];
                    $appointment['date'] = $date;
                    $appointment['time'] = $time;
                    $appointment['reason'] = $reason;
                    $appointment['notes'] = $notes;
                    $appointment['status'] = $status;
                    $appointment['updatedAt'] = date('Y-m-d H:i:s');

                    $found = true;
                    $updatedAppointment = $appointment;
                    break;
                }
            }

            if (!$found) {
                errorResponse('Appuntamento non trovato', 404);
            }

            writeJSON(APPOINTMENTS_FILE, $appointments);

            // Send email notification
            sendAppointmentEmail($updatedAppointment, $patient, 'update');

            successResponse($updatedAppointment);
            break;
            
        case 'delete':
            $id = $_POST['id'] ?? '';
            
            if (empty($id)) {
                errorResponse('ID appuntamento è obbligatorio');
            }
            
            $appointments = readJSON(APPOINTMENTS_FILE);
            $found = false;
            $deletedAppointment = null;
            $newAppointments = [];
            
            foreach ($appointments as $appointment) {
                if ($appointment['id'] === $id) {
                    $found = true;
                    $deletedAppointment = $appointment;
                } else {
                    $newAppointments[] = $appointment;
                }
            }
            
            if (!$found) {
                errorResponse('Appuntamento non trovato', 404);
            }
            
            writeJSON(APPOINTMENTS_FILE, $newAppointments);
            
            // Send email notification
            $patient = getPatientById($deletedAppointment['patientId']);
            if ($patient) {
                sendAppointmentEmail($deletedAppointment, $patient, 'delete');
            }
            
            successResponse(['message' => 'Appuntamento eliminato con successo']);
            break;
            
        case 'update_status':
            $id = $_POST['id'] ?? '';
            $status = trim($_POST['status'] ?? '');
            
            // Validation
            if (empty($id)) {
                errorResponse('ID appuntamento è obbligatorio');
            }
            if (empty($status)) {
                errorResponse('Stato è obbligatorio');
            }
            
            $validStatuses = [STATUS_PENDING, STATUS_COMPLETE, STATUS_NO_SHOW, STATUS_CANCELLED];
            if (!in_array($status, $validStatuses)) {
                errorResponse('Stato non valido');
            }
            
            $appointments = readJSON(APPOINTMENTS_FILE);
            $found = false;
            
            foreach ($appointments as &$appointment) {
                if ($appointment['id'] === $id) {
                    $appointment['status'] = $status;
                    $appointment['statusUpdatedAt'] = date('Y-m-d H:i:s');
                    
                    $found = true;
                    $updatedAppointment = $appointment;
                    break;
                }
            }
            
            if (!$found) {
                errorResponse('Appuntamento non trovato', 404);
            }
            
            writeJSON(APPOINTMENTS_FILE, $appointments);
            
            // Send email notification
            $patient = getPatientById($updatedAppointment['patientId']);
            if ($patient) {
                sendAppointmentEmail($updatedAppointment, $patient, 'status_change');
            }
            
            successResponse($updatedAppointment);
            break;
            
        default:
            errorResponse('Azione non valida', 400);
    }
} catch (Exception $e) {
    error_log("Appointments API Error: " . $e->getMessage());
    errorResponse('Errore interno del server: ' . $e->getMessage(), 500);
}
