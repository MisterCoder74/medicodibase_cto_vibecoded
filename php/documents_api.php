<?php
/**
 * Documents API Endpoints
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
            $ssn = trim($_GET['ssn'] ?? '');
            
            if (empty($ssn)) {
                errorResponse('Codice Fiscale è obbligatorio');
            }
            
            $patientDir = PATIENTS_DIR . '/' . $ssn;
            $assetsDir = $patientDir . '/assets';
            
            if (!is_dir($assetsDir)) {
                successResponse(['documents' => []]);
                break;
            }
            
            $documents = [];
            $files = scandir($assetsDir);
            
            foreach ($files as $file) {
                if ($file === '.' || $file === '..') {
                    continue;
                }
                
                $filepath = $assetsDir . '/' . $file;
                if (!is_file($filepath)) {
                    continue;
                }
                
                // Try to extract metadata from filename
                // Expected format: [timestamp]_[originalName]_[category].[ext]
                $parts = explode('_', $file, 3);
                $category = 'Other';
                $originalName = $file;
                $uploadDate = date('Y-m-d H:i:s', filemtime($filepath));
                
                if (count($parts) >= 2) {
                    $timestamp = $parts[0];
                    if (count($parts) === 3) {
                        $categoryPart = explode('.', $parts[2]);
                        $category = end($categoryPart) === 'pdf' || end($categoryPart) === 'jpg' || 
                                   end($categoryPart) === 'png' || end($categoryPart) === 'doc' || 
                                   end($categoryPart) === 'docx' ? $category : 'Other';
                        $originalName = $parts[2];
                    }
                    
                    if (is_numeric($timestamp)) {
                        $uploadDate = date('Y-m-d H:i:s', $timestamp);
                    }
                }
                
                $fileInfo = pathinfo($file);
                $filesize = filesize($filepath);
                $filesizeFormatted = formatFileSize($filesize);
                
                $documents[] = [
                    'filename' => $file,
                    'originalName' => $originalName,
                    'uploadDate' => $uploadDate,
                    'category' => $category,
                    'filesize' => $filesize,
                    'filesizeFormatted' => $filesizeFormatted,
                    'extension' => strtolower($fileInfo['extension'] ?? '')
                ];
            }
            
            // Sort by upload date descending
            usort($documents, function($a, $b) {
                return strtotime($b['uploadDate']) - strtotime($a['uploadDate']);
            });
            
            successResponse(['documents' => $documents]);
            break;
            
        case 'upload':
            $ssn = trim($_POST['ssn'] ?? '');
            $category = trim($_POST['category'] ?? 'Other');
            
            if (empty($ssn)) {
                errorResponse('Codice Fiscale è obbligatorio');
            }
            
            if (!isset($_FILES['file'])) {
                errorResponse('Nessun file caricato');
            }
            
            $file = $_FILES['file'];
            
            if ($file['error'] !== UPLOAD_ERR_OK) {
                errorResponse('Errore durante il caricamento del file');
            }
            
            // Validate file size (max 5MB)
            $maxFileSize = 5 * 1024 * 1024; // 5MB
            if ($file['size'] > $maxFileSize) {
                errorResponse('Il file supera il limite di 5MB');
            }
            
            // Validate file type
            $allowedTypes = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'];
            $fileInfo = pathinfo($file['name']);
            $extension = strtolower($fileInfo['extension'] ?? '');
            
            if (!in_array($extension, $allowedTypes)) {
                errorResponse('Tipo di file non supportato. Tipi permessi: ' . implode(', ', $allowedTypes));
            }
            
            // Create patient directory
            $patientDir = createPatientDirectory($ssn);
            $assetsDir = $patientDir . '/assets';
            
            // Generate unique filename with timestamp and category
            $timestamp = time();
            $safeOriginalName = preg_replace('/[^a-zA-Z0-9._-]/', '_', $fileInfo['filename']);
            $filename = $timestamp . '_' . $safeOriginalName . '_' . $category . '.' . $extension;
            $filepath = $assetsDir . '/' . $filename;
            
            if (!move_uploaded_file($file['tmp_name'], $filepath)) {
                errorResponse('Errore durante il salvataggio del file');
            }
            
            successResponse([
                'filename' => $filename,
                'originalName' => $file['name'],
                'uploadDate' => date('Y-m-d H:i:s', $timestamp),
                'category' => $category,
                'message' => 'File caricato con successo'
            ]);
            break;
            
        case 'delete':
            $ssn = trim($_POST['ssn'] ?? '');
            $filename = trim($_POST['filename'] ?? '');
            
            if (empty($ssn)) {
                errorResponse('Codice Fiscale è obbligatorio');
            }
            
            if (empty($filename)) {
                errorResponse('Nome del file è obbligatorio');
            }
            
            // Sanitize filename to prevent path traversal
            $filename = basename($filename);
            
            $filepath = PATIENTS_DIR . '/' . $ssn . '/assets/' . $filename;
            
            if (!file_exists($filepath)) {
                errorResponse('File non trovato', 404);
            }
            
            if (!unlink($filepath)) {
                errorResponse('Errore durante l\'eliminazione del file');
            }
            
            successResponse(['message' => 'File eliminato con successo']);
            break;
            
        default:
            errorResponse('Azione non valida', 400);
    }
} catch (Exception $e) {
    error_log("Documents API Error: " . $e->getMessage());
    errorResponse('Errore interno del server: ' . $e->getMessage(), 500);
}

/**
 * Format file size for human readable display
 * 
 * @param int $bytes File size in bytes
 * @return string Formatted file size
 */
function formatFileSize($bytes) {
    if ($bytes >= 1073741824) {
        return number_format($bytes / 1073741824, 2) . ' GB';
    } elseif ($bytes >= 1048576) {
        return number_format($bytes / 1048576, 2) . ' MB';
    } elseif ($bytes >= 1024) {
        return number_format($bytes / 1024, 2) . ' KB';
    } else {
        return $bytes . ' bytes';
    }
}
