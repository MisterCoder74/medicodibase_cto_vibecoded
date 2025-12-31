<?php
/**
 * Sensitive Patients API Endpoint
 * Studio Medico - Medical Office Management System
 */

header('Content-Type: application/json');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../functions.php';

$action = $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'list':
            $patients = readJSON(PATIENTS_FILE);
            
            // Filter only sensitive patients (not deleted)
            $sensitivePatients = array_filter($patients, function($patient) {
                return $patient['isSensitive'] === true && 
                       (!isset($patient['deleted']) || $patient['deleted'] === false);
            });
            
            // Re-index array
            $sensitivePatients = array_values($sensitivePatients);
            
            successResponse($sensitivePatients);
            break;
            
        default:
            errorResponse('Azione non valida', 400);
    }
} catch (Exception $e) {
    error_log("Sensitive Patients API Error: " . $e->getMessage());
    errorResponse('Errore interno del server: ' . $e->getMessage(), 500);
}
