<?php
/**
 * Prescriptions API Endpoints
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
            $prescriptions = readJSON(PRESCRIPTIONS_FILE);
            successResponse($prescriptions);
            break;
            
        case 'add':
            $patientId = trim($_POST['patientId'] ?? '');
            $date = trim($_POST['date'] ?? '');
            $drugs = trim($_POST['drugs'] ?? '');
            $dosage = trim($_POST['dosage'] ?? '');
            $duration = trim($_POST['duration'] ?? '');
            $notes = trim($_POST['notes'] ?? '');

            // Validation
            if (empty($patientId)) {
                errorResponse('Paziente è obbligatorio');
            }
            if (empty($date)) {
                errorResponse('Data è obbligatoria');
            }
            if (empty($drugs)) {
                errorResponse('Farmaci sono obbligatori');
            }

            // Verify patient exists
            $patient = getPatientById($patientId);
            if (!$patient) {
                errorResponse('Paziente non trovato', 404);
            }

            // Create new prescription
            $newPrescription = [
                'id' => generateId(),
                'patientId' => $patientId,
                'patientName' => $patient['name'],
                'date' => $date,
                'drugs' => $drugs,
                'dosage' => $dosage,
                'duration' => $duration,
                'notes' => $notes,
                'createdAt' => date('Y-m-d H:i:s')
            ];

            $prescriptions = readJSON(PRESCRIPTIONS_FILE);
            $prescriptions[] = $newPrescription;
            writeJSON(PRESCRIPTIONS_FILE, $prescriptions);

            successResponse($newPrescription);
            break;
            
        case 'edit':
            $id = $_POST['id'] ?? '';
            $patientId = trim($_POST['patientId'] ?? '');
            $date = trim($_POST['date'] ?? '');
            $drugs = trim($_POST['drugs'] ?? '');
            $dosage = trim($_POST['dosage'] ?? '');
            $duration = trim($_POST['duration'] ?? '');
            $notes = trim($_POST['notes'] ?? '');

            // Validation
            if (empty($id)) {
                errorResponse('ID ricetta è obbligatorio');
            }
            if (empty($patientId)) {
                errorResponse('Paziente è obbligatorio');
            }
            if (empty($date)) {
                errorResponse('Data è obbligatoria');
            }
            if (empty($drugs)) {
                errorResponse('Farmaci sono obbligatori');
            }

            // Verify patient exists
            $patient = getPatientById($patientId);
            if (!$patient) {
                errorResponse('Paziente non trovato', 404);
            }

            $prescriptions = readJSON(PRESCRIPTIONS_FILE);
            $found = false;

            foreach ($prescriptions as &$prescription) {
                if ($prescription['id'] === $id) {
                    $prescription['patientId'] = $patientId;
                    $prescription['patientName'] = $patient['name'];
                    $prescription['date'] = $date;
                    $prescription['drugs'] = $drugs;
                    $prescription['dosage'] = $dosage;
                    $prescription['duration'] = $duration;
                    $prescription['notes'] = $notes;
                    $prescription['updatedAt'] = date('Y-m-d H:i:s');

                    $found = true;
                    $updatedPrescription = $prescription;
                    break;
                }
            }

            if (!$found) {
                errorResponse('Ricetta non trovata', 404);
            }

            writeJSON(PRESCRIPTIONS_FILE, $prescriptions);
            successResponse($updatedPrescription);
            break;
            
        case 'delete':
            $id = $_POST['id'] ?? '';
            
            if (empty($id)) {
                errorResponse('ID ricetta è obbligatorio');
            }
            
            $prescriptions = readJSON(PRESCRIPTIONS_FILE);
            $found = false;
            $newPrescriptions = [];
            
            foreach ($prescriptions as $prescription) {
                if ($prescription['id'] === $id) {
                    $found = true;
                } else {
                    $newPrescriptions[] = $prescription;
                }
            }
            
            if (!$found) {
                errorResponse('Ricetta non trovata', 404);
            }
            
            writeJSON(PRESCRIPTIONS_FILE, $newPrescriptions);
            successResponse(['message' => 'Ricetta eliminata con successo']);
            break;
            
        case 'print':
            $id = $_GET['id'] ?? '';
            
            if (empty($id)) {
                errorResponse('ID ricetta è obbligatorio');
            }
            
            $prescriptions = readJSON(PRESCRIPTIONS_FILE);
            $prescription = null;
            
            foreach ($prescriptions as $p) {
                if ($p['id'] === $id) {
                    $prescription = $p;
                    break;
                }
            }
            
            if (!$prescription) {
                errorResponse('Ricetta non trovata', 404);
            }
            
            $patient = getPatientById($prescription['patientId']);
            if (!$patient) {
                errorResponse('Paziente non trovato', 404);
            }
            
            $doctorInfo = readJSON(DOCTOR_INFO_FILE);
            
            // Return HTML for printing
            header('Content-Type: text/html; charset=UTF-8');
            ?>
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ricetta Medica - <?php echo htmlspecialchars($patient['name']); ?></title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            margin: 0;
            color: #0066cc;
        }
        .doctor-info {
            text-align: center;
            margin-bottom: 30px;
        }
        .prescription-info {
            margin-bottom: 30px;
        }
        .prescription-info dt {
            font-weight: bold;
            margin-top: 10px;
        }
        .drugs {
            background: #f5f5f5;
            padding: 15px;
            border-left: 4px solid #0066cc;
            margin: 20px 0;
        }
        .footer {
            margin-top: 50px;
            border-top: 1px solid #ccc;
            padding-top: 20px;
        }
        @media print {
            button {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>RICETTA MEDICA</h1>
    </div>
    
    <div class="doctor-info">
        <h2><?php echo htmlspecialchars($doctorInfo['name'] ?? 'Studio Medico'); ?></h2>
        <p><?php echo htmlspecialchars($doctorInfo['specialization'] ?? ''); ?></p>
        <p>Tel: <?php echo htmlspecialchars($doctorInfo['phone'] ?? ''); ?> | Email: <?php echo htmlspecialchars($doctorInfo['email'] ?? ''); ?></p>
        <p><?php echo htmlspecialchars($doctorInfo['address'] ?? ''); ?></p>
    </div>
    
    <dl class="prescription-info">
        <dt>Paziente:</dt>
        <dd><?php echo htmlspecialchars($patient['name']); ?></dd>
        
        <dt>Codice Fiscale:</dt>
        <dd><?php echo htmlspecialchars($patient['ssn']); ?></dd>
        
        <dt>Data Nascita:</dt>
        <dd><?php echo htmlspecialchars($patient['dateOfBirth']); ?></dd>
        
        <dt>Data Prescrizione:</dt>
        <dd><?php echo htmlspecialchars($prescription['date']); ?></dd>
    </dl>
    
    <div class="drugs">
        <h3>Farmaci Prescritti:</h3>
        <p style="white-space: pre-line;"><?php echo htmlspecialchars($prescription['drugs']); ?></p>
        <?php if (!empty($prescription['dosage'])): ?>
        <p><strong>Posologia:</strong> <?php echo htmlspecialchars($prescription['dosage']); ?></p>
        <?php endif; ?>
        <?php if (!empty($prescription['duration'])): ?>
        <p><strong>Durata:</strong> <?php echo htmlspecialchars($prescription['duration']); ?></p>
        <?php endif; ?>
    </div>

    <?php if (!empty($prescription['notes'])): ?>
    <div>
        <h3>Note:</h3>
        <p style="white-space: pre-line;"><?php echo htmlspecialchars($prescription['notes']); ?></p>
    </div>
    <?php endif; ?>
    
    <div class="footer">
        <p><strong>Firma del Medico:</strong> _______________________</p>
        <p style="font-size: 12px; color: #666;">Documento generato il <?php echo date('d/m/Y H:i'); ?></p>
    </div>
    
    <div style="text-align: center; margin-top: 30px;">
        <button onclick="window.print()" style="padding: 10px 30px; font-size: 16px; cursor: pointer;">Stampa</button>
        <button onclick="window.close()" style="padding: 10px 30px; font-size: 16px; cursor: pointer; margin-left: 10px;">Chiudi</button>
    </div>
</body>
</html>
            <?php
            exit;
            break;
            
        default:
            errorResponse('Azione non valida', 400);
    }
} catch (Exception $e) {
    error_log("Prescriptions API Error: " . $e->getMessage());
    errorResponse('Errore interno del server: ' . $e->getMessage(), 500);
}
