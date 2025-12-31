# Studio Medico - Quick Start Guide

## 🚀 Running the Application

### Prerequisites
- PHP 7.0+ installed on your system

### Start the Application (3 steps)

1. **Navigate to project directory**:
   ```bash
   cd /path/to/studio-medico
   ```

2. **Start PHP built-in server**:
   ```bash
   php -S localhost:8000
   ```

3. **Open your browser**:
   ```
   http://localhost:8000
   ```

That's it! The application is now running.

## 📱 Using the Application

### Dashboard Tabs

#### 1️⃣ Pazienti (Patients)
- View all registered patients
- Click **"Nuovo Paziente"** to add a new patient
- Click ✏️ (edit) to modify patient information
- Click 🗑️ (delete) to remove a patient
- Check "Paziente con condizioni sensibili" for patients requiring special attention

#### 2️⃣ Ricette (Prescriptions)
- View all prescriptions
- Click **"Nuova Ricetta"** to create a prescription
- Click 🖨️ (print) to print a prescription form
- Click ✏️ (edit) to modify prescription
- Click 🗑️ (delete) to remove prescription

#### 3️⃣ Appuntamenti (Appointments)
- Monthly calendar view showing all appointments
- **Navigation**:
  - ◀️ Previous month
  - **Oggi** = Go to today
  - ▶️ Next month
- **Adding appointments**:
  - Click **+** button on any day, OR
  - Click **"Nuovo Appuntamento"** button
- **Viewing appointments**:
  - Days with appointments have a **red border**
  - Today has a **blue border**
  - Click any day to see all appointments for that day
- **Managing appointments**:
  - ✏️ Edit appointment details
  - ✓ Mark as complete
  - 🗑️ Delete appointment

#### 4️⃣ Pazienti Sensibili (Sensitive Patients)
- Auto-filtered list of patients requiring special attention
- Shows clinical notes and warnings
- Displays patient contact information

## 📊 Sample Data

The application comes pre-loaded with:

### Patients (5)
1. **Mario Rossi** - 🔴 Sensitive (diabete, ipertensione)
2. **Giulia Verdi** - 🔴 Sensitive (problemi cardiaci)
3. **Paolo Bianchi** - Regular patient
4. **Anna Neri** - 🔴 Sensitive (asma, allergie)
5. **Marco Ferrari** - Regular patient

### Prescriptions (8)
- Various medications across all patients
- Complete dosage and administration instructions

### Appointments (15)
- Scheduled from April to May 2024
- Various statuses: pending, complete, no_show, cancelled

## 🎨 Status Colors

### Appointments
- 🟡 **Giallo** (Yellow) = In Attesa (Pending)
- 🟢 **Verde** (Green) = Completato (Complete)
- 🔴 **Rosso** (Red) = Cancellato (Cancelled)
- ⚫ **Grigio** (Gray) = Non Presentato (No Show)

### Patients
- 🔴 **Badge Rosso** = Paziente Sensibile
- ⚫ **Badge Grigio** = Paziente Regolare

## ⌨️ Keyboard Shortcuts

- **ESC** = Close modal
- **Enter** = Submit form (when inside form)

## 💾 Data Storage

All data is stored in JSON files:
- `/data/patients.json` - Patient records
- `/data/prescriptions.json` - Prescriptions
- `/data/appointments.json` - Appointments
- `/data/doctor_info.json` - Doctor information

Patient files are stored in:
- `/patients/<SSN>/assets/` - Patient attachments

## 🔧 Configuration

Edit `config.php` to customize:

```php
// Enable email notifications
define('SEND_EMAILS', true);

// Change timezone
date_default_timezone_set('Europe/Rome');
```

## 🐛 Troubleshooting

### Issue: "Address already in use"
**Solution**: Port 8000 is busy. Use a different port:
```bash
php -S localhost:8080
```
Then open: `http://localhost:8080`

### Issue: "Permission denied" on data files
**Solution**: Set write permissions:
```bash
chmod -R 755 data patients
```

### Issue: Changes not appearing
**Solution**: The app disables cache. Hard refresh browser:
- Windows/Linux: `Ctrl + F5`
- Mac: `Cmd + Shift + R`

## 📖 API Testing

Test API endpoints directly:

```bash
# List all patients
curl "http://localhost:8000/php/patients_api.php?action=list"

# List sensitive patients
curl "http://localhost:8000/php/sensitive_patients.php?action=list"

# List appointments
curl "http://localhost:8000/php/appointments_api.php?action=list"

# List prescriptions
curl "http://localhost:8000/php/prescriptions_api.php?action=list"
```

## 🎯 Next Steps

1. Customize doctor information in `data/doctor_info.json`
2. Modify appointment statuses in `config.php`
3. Enable email notifications by setting `SEND_EMAILS` to `true`
4. Add your own patients, prescriptions, and appointments
5. Deploy to a web server (Apache/Nginx) for production use

## 📞 Support

- Check `README.md` for detailed documentation
- Review `IMPLEMENTATION_SUMMARY.md` for technical details
- Examine inline code comments for function documentation

---

**Enjoy managing your medical office! 🏥**
