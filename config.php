<?php
/**
 * Configuration & Constants
 * Studio Medico - Medical Office Management System
 */

// File paths
define('DATA_DIR', __DIR__ . '/data');
define('PATIENTS_DIR', __DIR__ . '/patients');

define('PATIENTS_FILE', DATA_DIR . '/patients.json');
define('PRESCRIPTIONS_FILE', DATA_DIR . '/prescriptions.json');
define('APPOINTMENTS_FILE', DATA_DIR . '/appointments.json');
define('DOCTOR_INFO_FILE', DATA_DIR . '/doctor_info.json');

// Appointment statuses
define('STATUS_PENDING', 'pending');
define('STATUS_COMPLETE', 'complete');
define('STATUS_NO_SHOW', 'no_show');
define('STATUS_CANCELLED', 'cancelled');

// Email configuration
define('SEND_EMAILS', false); // Set to true to actually send emails
define('EMAIL_FROM', 'studio.medico@example.com');
define('EMAIL_FROM_NAME', 'Studio Medico');

// Timezone
date_default_timezone_set('Europe/Rome');

// Error reporting
error_reporting(E_ALL);
ini_set('display_errors', '1');
