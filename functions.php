<?php
/**
 * Helper Functions & File Locking Utilities
 * Studio Medico - Medical Office Management System
 */

/**
 * File locking wrapper for safe concurrent access
 * 
 * @param string $filepath Path to the file
 * @param callable $callback Function to execute while file is locked
 * @return mixed Result from callback
 * @throws Exception if unable to acquire lock
 */
function withLock($filepath, callable $callback) {
    $maxRetries = 100;
    $retryDelay = 50000; // 50ms in microseconds
    $timeout = 5; // 5 seconds
    $startTime = time();
    
    // Ensure directory exists
    $dir = dirname($filepath);
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    
    // Create file if it doesn't exist
    if (!file_exists($filepath)) {
        file_put_contents($filepath, '[]');
    }
    
    $retries = 0;
    while ($retries < $maxRetries) {
        if (time() - $startTime > $timeout) {
            throw new Exception("Timeout waiting for file lock: $filepath");
        }
        
        $handle = fopen($filepath, 'r+');
        if ($handle === false) {
            throw new Exception("Unable to open file: $filepath");
        }
        
        if (flock($handle, LOCK_EX)) {
            try {
                $result = $callback($handle);
                flock($handle, LOCK_UN);
                fclose($handle);
                return $result;
            } catch (Exception $e) {
                flock($handle, LOCK_UN);
                fclose($handle);
                throw $e;
            }
        }
        
        fclose($handle);
        usleep($retryDelay);
        $retries++;
    }
    
    throw new Exception("Unable to acquire lock after $maxRetries retries: $filepath");
}

/**
 * Read JSON file with lock
 * 
 * @param string $file Path to JSON file
 * @return array Decoded JSON data
 */
function readJSON($file) {
    return withLock($file, function($handle) {
        $content = '';
        rewind($handle);
        while (!feof($handle)) {
            $content .= fread($handle, 8192);
        }
        
        if (empty($content)) {
            return [];
        }
        
        $data = json_decode($content, true);
        if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
            error_log("JSON decode error in file: " . json_last_error_msg());
            return [];
        }
        
        return $data;
    });
}

/**
 * Write JSON file with lock
 * 
 * @param string $file Path to JSON file
 * @param array $data Data to write
 * @return bool Success status
 */
function writeJSON($file, $data) {
    return withLock($file, function($handle) use ($data) {
        $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        
        if ($json === false) {
            throw new Exception("JSON encode error: " . json_last_error_msg());
        }
        
        ftruncate($handle, 0);
        rewind($handle);
        fwrite($handle, $json);
        
        return true;
    });
}

/**
 * Sanitize input for safe output
 * 
 * @param mixed $input Input to sanitize
 * @return mixed Sanitized input
 */
function sanitizeInput($input) {
    if (is_array($input)) {
        return array_map('sanitizeInput', $input);
    }
    return htmlspecialchars($input, ENT_QUOTES, 'UTF-8');
}

/**
 * Validate email address
 * 
 * @param string $email Email to validate
 * @return bool Valid email
 */
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Send appointment email notification
 * 
 * @param array $appointment Appointment data
 * @param array $patient Patient data
 * @param string $action Action type (create, update, delete, status_change)
 * @return bool Success status
 */
function sendAppointmentEmail($appointment, $patient, $action = 'create') {
    if (!SEND_EMAILS) {
        error_log("Email notification (disabled): $action appointment for " . $patient['name']);
        return true;
    }
    
    if (!validateEmail($patient['email'])) {
        error_log("Invalid email address: " . $patient['email']);
        return false;
    }
    
    // Load doctor info
    $doctorInfo = readJSON(DOCTOR_INFO_FILE);
    
    // Prepare email content
    $subject = '';
    $message = '';
    
    switch ($action) {
        case 'create':
            $subject = 'Conferma Appuntamento - Studio Medico';
            $message = "Gentile {$patient['name']},\n\n";
            $message .= "Il suo appuntamento è stato confermato:\n\n";
            break;
        case 'update':
            $subject = 'Modifica Appuntamento - Studio Medico';
            $message = "Gentile {$patient['name']},\n\n";
            $message .= "Il suo appuntamento è stato modificato:\n\n";
            break;
        case 'delete':
            $subject = 'Cancellazione Appuntamento - Studio Medico';
            $message = "Gentile {$patient['name']},\n\n";
            $message .= "Il suo appuntamento è stato cancellato:\n\n";
            break;
        case 'status_change':
            $subject = 'Aggiornamento Appuntamento - Studio Medico';
            $message = "Gentile {$patient['name']},\n\n";
            $message .= "Lo stato del suo appuntamento è stato aggiornato:\n\n";
            break;
    }
    
    $message .= "Data: {$appointment['date']}\n";
    $message .= "Ora: {$appointment['time']}\n";
    if (!empty($appointment['reason'])) {
        $message .= "Motivo: {$appointment['reason']}\n";
    }
    $message .= "Stato: {$appointment['status']}\n\n";
    
    if (!empty($doctorInfo)) {
        $message .= "---\n";
        $message .= "{$doctorInfo['name']}\n";
        $message .= "{$doctorInfo['specialization']}\n";
        $message .= "Tel: {$doctorInfo['phone']}\n";
        $message .= "Email: {$doctorInfo['email']}\n";
    }
    
    $headers = [
        'From: ' . EMAIL_FROM_NAME . ' <' . EMAIL_FROM . '>',
        'Reply-To: ' . ($doctorInfo['email'] ?? EMAIL_FROM),
        'X-Mailer: PHP/' . phpversion(),
        'Content-Type: text/plain; charset=UTF-8'
    ];
    
    $result = mail($patient['email'], $subject, $message, implode("\r\n", $headers));
    
    if (!$result) {
        error_log("Failed to send email to: " . $patient['email']);
    }
    
    return $result;
}

/**
 * Return standardized error response
 * 
 * @param string $message Error message
 * @param int $code HTTP status code
 */
function errorResponse($message, $code = 400) {
    http_response_code($code);
    echo json_encode(['success' => false, 'error' => $message]);
    exit;
}

/**
 * Return standardized success response
 * 
 * @param mixed $data Response data
 */
function successResponse($data = null) {
    echo json_encode(['success' => true, 'data' => $data]);
    exit;
}

/**
 * Generate unique ID
 * 
 * @return string Unique ID
 */
function generateId() {
    return uniqid('', true);
}

/**
 * Get patient by ID
 * 
 * @param string $patientId Patient ID
 * @return array|null Patient data or null
 */
function getPatientById($patientId) {
    $patients = readJSON(PATIENTS_FILE);
    foreach ($patients as $patient) {
        if ($patient['id'] === $patientId) {
            return $patient;
        }
    }
    return null;
}

/**
 * Create patient directory structure
 * 
 * @param string $ssn Patient SSN
 * @return string Patient directory path
 */
function createPatientDirectory($ssn) {
    $patientDir = PATIENTS_DIR . '/' . $ssn;
    $assetsDir = $patientDir . '/assets';
    
    if (!is_dir($patientDir)) {
        mkdir($patientDir, 0755, true);
    }
    if (!is_dir($assetsDir)) {
        mkdir($assetsDir, 0755, true);
    }
    
    return $patientDir;
}
