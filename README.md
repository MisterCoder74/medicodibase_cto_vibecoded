# Studio Medico - Medical Office Management System MVP
Alessandro Demontis for Vivacity Design Web Agency
Vibecoded with CTO.NEW
31-12-2025

A complete web application for managing medical office operations including patient records, prescriptions, appointments, and file attachments.

## Technology Stack

- **Frontend**: Vanilla JavaScript (ES6) + AJAX/fetch + Bootstrap 5 (CDN)
- **Backend**: PHP 7+ for CRUD operations
- **Storage**: JSON files only (no database)
- **Features**: All fetch calls use `{ cache: 'no-store' }` to bypass browser caching

## Project Structure

```
/root
├── index.php                      → Main dashboard with 4 Bootstrap tabs
├── config.php                     → Configuration & constants
├── functions.php                  → Helper functions & file locking
│
├── /php
│   ├── patients_api.php          → Patient CRUD endpoints
│   ├── prescriptions_api.php     → Prescription CRUD endpoints
│   ├── appointments_api.php      → Appointment CRUD + calendar
│   └── sensitive_patients.php    → Auto-generated sensitive patients list
│
├── /data
│   ├── patients.json             → Patient registry (5 sample patients)
│   ├── prescriptions.json        → Prescriptions (8 sample prescriptions)
│   ├── appointments.json         → Appointments (15 sample appointments)
│   └── doctor_info.json          → Doctor info
│
├── /patients/                     → Patient folders structure (created dynamically)
├── /css/style.css                → Custom Bootstrap 5 styling
└── /js/app.js                    → Client-side application logic
```

## Features

### 1. Patient Management
- Add, edit, delete patients (soft delete)
- Store patient information (name, SSN, DOB, contact details)
- Mark patients as sensitive with clinical notes
- File attachment support (stored in `/patients/<SSN>/assets/`)

### 2. Prescription Management
- Create and manage prescriptions
- Link prescriptions to patients
- Print prescription forms
- Track medication history

### 3. Appointment Calendar
- Monthly calendar view with navigation
- Visual indicators for appointment status
- Click day to view all appointments
- Quick add appointment from calendar
- Email notifications (configurable)
- Status tracking (pending, complete, no_show, cancelled)

### 4. Sensitive Patients
- Auto-filtered list of patients requiring special attention
- Display clinical notes and warnings
- Easy access to critical patient information

## Installation

### Requirements
- PHP 7.0 or higher
- Web server (Apache, Nginx, or PHP built-in server)
- Write permissions for `/data` and `/patients` directories

### Setup

1. Clone or download the repository
2. Ensure PHP is installed:
   ```bash
   php -v
   ```

3. Make sure data directories have write permissions:
   ```bash
   chmod -R 755 data patients
   ```

4. Start PHP built-in server:
   ```bash
   php -S localhost:8000
   ```

5. Open browser and navigate to:
   ```
   http://localhost:8000
   ```

## Configuration

Edit `config.php` to customize:

- **File paths**: Data directory locations
- **Email settings**: Enable/disable email notifications
- **Timezone**: Default timezone for timestamps
- **Appointment statuses**: Customize status options

## Security Features

- **File Locking**: Prevents race conditions with PHP `flock()`
- **Input Sanitization**: `htmlspecialchars()` for all output
- **Email Validation**: `filter_var()` for email addresses
- **Server-side Validation**: All inputs validated before storage
- **XSS Prevention**: HTML escaping in JavaScript

## Sample Data

The application comes pre-loaded with:
- **5 Patients**: 3 sensitive (with medical conditions), 2 regular
- **8 Prescriptions**: Various medications across patients
- **15 Appointments**: Mix of past and future appointments with different statuses
- **1 Doctor**: Dr. Giovanni Bianchi

## API Endpoints

### Patients API (`php/patients_api.php`)
- `GET ?action=list` - List all patients
- `POST ?action=add` - Add new patient
- `POST ?action=edit` - Edit patient
- `POST ?action=delete` - Delete patient (soft delete)
- `POST ?action=upload_attachment` - Upload file to patient folder

### Prescriptions API (`php/prescriptions_api.php`)
- `GET ?action=list` - List all prescriptions
- `POST ?action=add` - Add new prescription
- `POST ?action=edit` - Edit prescription
- `POST ?action=delete` - Delete prescription
- `GET ?action=print&id=<id>` - Print prescription

### Appointments API (`php/appointments_api.php`)
- `GET ?action=list[&date=YYYY-MM-DD]` - List appointments (optionally filtered)
- `POST ?action=add` - Add new appointment
- `POST ?action=edit` - Edit appointment
- `POST ?action=delete` - Delete appointment
- `POST ?action=update_status` - Update appointment status

### Sensitive Patients API (`php/sensitive_patients.php`)
- `GET ?action=list` - List sensitive patients only

## Email Notifications

Email notifications are sent for:
- Appointment creation
- Appointment modification
- Appointment deletion
- Status changes

To enable email sending, edit `config.php`:
```php
define('SEND_EMAILS', true);
```

In development mode (default), emails are logged to PHP error log instead of being sent.

## File Locking Implementation

The application uses a robust file locking mechanism to handle concurrent access:

- `withLock()` wrapper function for all JSON operations
- `LOCK_EX` for write operations
- `LOCK_SH` for read operations
- 50ms retry delay with 5-second timeout
- Automatic file creation if missing

## Browser Compatibility

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Modern mobile browsers

## Development

### Adding New Features

1. **New API Endpoint**: Create in `/php/` directory
2. **Frontend Function**: Add to `js/app.js`
3. **UI Component**: Update `index.php` with Bootstrap markup
4. **Styling**: Add custom styles to `css/style.css`

### Testing APIs

Use command line to test:
```bash
# Test patients API
php -r "$_GET['action'] = 'list'; require 'php/patients_api.php';"

# Test with curl
curl "http://localhost:8000/php/patients_api.php?action=list"
```

## License

This is an MVP (Minimum Viable Product) created for educational and demonstration purposes.

## Support

For issues or questions, please refer to the inline code comments which provide detailed documentation of all functions and features.
