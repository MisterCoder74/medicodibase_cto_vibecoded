<?php
/**
 * Inventory API Endpoints
 * Studio Medico - Medical Office Management System
 */

header('Content-Type: application/json');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../functions.php';

$action = $_GET['action'] ?? $_POST['action'] ?? '';

// Handle JSON input from JavaScript fetch requests
$inputData = [];
if ($_SERVER['REQUEST_METHOD'] === 'POST' && empty($_POST)) {
    $json = file_get_contents('php://input');
    $inputData = json_decode($json, true) ?? [];
} else {
    $inputData = $_POST;
}

try {
    switch ($action) {
        case 'list':
            $medications = readJSON(INVENTORY_FILE);
            
            // Add warning flag for low stock
            $medications = array_map(function($med) {
                $med['lowStock'] = $med['quantity'] < 5;
                return $med;
            }, $medications);
            
            successResponse($medications);
            break;
            
        case 'add':
            $name = trim($inputData['name'] ?? '');
            $quantity = intval($inputData['quantity'] ?? 0);
            
            // Validation
            if (empty($name)) {
                errorResponse('Nome farmaco è obbligatorio');
            }
            if ($quantity < 1) {
                errorResponse('Quantità deve essere un numero positivo');
            }
            
            $medications = readJSON(INVENTORY_FILE);
            
            // Create new medication
            $newMedication = [
                'id' => generateId(),
                'name' => $name,
                'quantity' => $quantity,
                'createdAt' => date('Y-m-d H:i:s'),
                'updatedAt' => date('Y-m-d H:i:s')
            ];
            
            $medications[] = $newMedication;
            writeJSON(INVENTORY_FILE, $medications);
            
            successResponse($newMedication);
            break;
            
        case 'edit':
            $id = $inputData['id'] ?? '';
            $name = trim($inputData['name'] ?? '');
            $quantity = intval($inputData['quantity'] ?? 0);
            
            // Validation
            if (empty($id)) {
                errorResponse('ID farmaco è obbligatorio');
            }
            if (empty($name)) {
                errorResponse('Nome farmaco è obbligatorio');
            }
            if ($quantity < 0) {
                errorResponse('Quantità non può essere negativa');
            }
            
            $medications = readJSON(INVENTORY_FILE);
            $found = false;
            
            foreach ($medications as &$medication) {
                if ($medication['id'] === $id) {
                    $medication['name'] = $name;
                    $medication['quantity'] = $quantity;
                    $medication['updatedAt'] = date('Y-m-d H:i:s');
                    $found = true;
                    $updatedMedication = $medication;
                    break;
                }
            }
            
            if (!$found) {
                errorResponse('Farmaco non trovato', 404);
            }
            
            writeJSON(INVENTORY_FILE, $medications);
            successResponse($updatedMedication);
            break;
            
        case 'delete':
            $id = $inputData['id'] ?? '';
            
            if (empty($id)) {
                errorResponse('ID farmaco è obbligatorio');
            }
            
            $medications = readJSON(INVENTORY_FILE);
            $found = false;
            
            foreach ($medications as $key => $medication) {
                if ($medication['id'] === $id) {
                    unset($medications[$key]);
                    $found = true;
                    break;
                }
            }
            
            if (!$found) {
                errorResponse('Farmaco non trovato', 404);
            }
            
            // Re-index array
            $medications = array_values($medications);
            writeJSON(INVENTORY_FILE, $medications);
            successResponse(['message' => 'Farmaco eliminato con successo']);
            break;
            
        case 'dispense':
            $id = $inputData['id'] ?? '';
            
            if (empty($id)) {
                errorResponse('ID farmaco è obbligatorio');
            }
            
            $medications = readJSON(INVENTORY_FILE);
            $found = false;
            
            foreach ($medications as &$medication) {
                // Use loose comparison to handle string/number ID mismatches
                if ($medication['id'] == $id) {
                    if ($medication['quantity'] <= 0) {
                        errorResponse('Farmaco non disponibile in magazzino', 400);
                    }
                    
                    $medication['quantity'] = $medication['quantity'] - 1;
                    $medication['updatedAt'] = date('Y-m-d H:i:s');
                    $medicationName = $medication['name'];
                    $found = true;
                    break;
                }
            }
            
            if (!$found) {
                errorResponse('Farmaco non trovato', 404);
            }
            
            writeJSON(INVENTORY_FILE, $medications);
            successResponse([
                'message' => "$medicationName: 1 unità dispensata. Nuova quantità: {$medication['quantity']}",
                'data' => $medication
            ]);
            break;
            
        case 'add_stock':
            $id = $inputData['id'] ?? '';
            $amount = intval($inputData['amount'] ?? 0);
            
            if (empty($id)) {
                errorResponse('ID farmaco è obbligatorio');
            }
            if ($amount < 1) {
                errorResponse('Quantità deve essere positiva');
            }
            
            $medications = readJSON(INVENTORY_FILE);
            $found = false;
            
            foreach ($medications as &$medication) {
                if ($medication['id'] === $id) {
                    $medication['quantity'] = $medication['quantity'] + $amount;
                    $medication['updatedAt'] = date('Y-m-d H:i:s');
                    $medicationName = $medication['name'];
                    $found = true;
                    break;
                }
            }
            
            if (!$found) {
                errorResponse('Farmaco non trovato', 404);
            }
            
            writeJSON(INVENTORY_FILE, $medications);
            successResponse(['message' => "Aggiunti $amount unità a $medicationName. Nuova quantità: {$medication['quantity']}"]);
            break;
            
        default:
            errorResponse('Azione non valida', 400);
    }
} catch (Exception $e) {
    error_log("Inventory API Error: " . $e->getMessage());
    errorResponse('Errore interno del server: ' . $e->getMessage(), 500);
}