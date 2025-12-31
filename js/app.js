/**
 * Client-side Application Logic
 * Studio Medico - Medical Office Management System
 */

// Global data arrays
let allPatients = [];
let allPrescriptions = [];
let allAppointments = [];
let currentCalendarDate = new Date();

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
  loadAllData();
  initializeEventListeners();
  renderCalendar();
});

/**
 * Load all data from API endpoints
 */
async function loadAllData() {
  try {
    showLoading();
    
    // Fetch all data with cache disabled
    const [patientsRes, prescriptionsRes, appointmentsRes] = await Promise.all([
      fetch('php/patients_api.php?action=list', { cache: 'no-store' }),
      fetch('php/prescriptions_api.php?action=list', { cache: 'no-store' }),
      fetch('php/appointments_api.php?action=list', { cache: 'no-store' })
    ]);
    
    const patientsData = await patientsRes.json();
    const prescriptionsData = await prescriptionsRes.json();
    const appointmentsData = await appointmentsRes.json();
    
    if (patientsData.success) {
      allPatients = patientsData.data.filter(p => !p.deleted);
    }
    if (prescriptionsData.success) {
      allPrescriptions = prescriptionsData.data;
    }
    if (appointmentsData.success) {
      allAppointments = appointmentsData.data;
    }
    
    renderPatients();
    renderPrescriptions();
    renderCalendar();
    loadSensitivePatients();
    
    hideLoading();
  } catch (error) {
    console.error('Error loading data:', error);
    showError('Errore nel caricamento dei dati');
    hideLoading();
  }
}

/**
 * Initialize event listeners
 */
function initializeEventListeners() {
  // Calendar navigation
  document.getElementById('prevMonth')?.addEventListener('click', () => {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
    renderCalendar();
  });
  
  document.getElementById('nextMonth')?.addEventListener('click', () => {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
    renderCalendar();
  });
  
  document.getElementById('todayBtn')?.addEventListener('click', () => {
    currentCalendarDate = new Date();
    renderCalendar();
  });
  
  // Form submissions
  document.getElementById('patientForm')?.addEventListener('submit', handlePatientSubmit);
  document.getElementById('prescriptionForm')?.addEventListener('submit', handlePrescriptionSubmit);
  document.getElementById('appointmentForm')?.addEventListener('submit', handleAppointmentSubmit);
}

/**
 * Render patients table
 */
function renderPatients() {
  const tbody = document.getElementById('patientsTableBody');
  if (!tbody) return;
  
  if (allPatients.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center">Nessun paziente trovato</td></tr>';
    return;
  }
  
  tbody.innerHTML = allPatients.map(patient => `
    <tr>
      <td>${escapeHtml(patient.name)}</td>
      <td>${escapeHtml(patient.ssn)}</td>
      <td>${escapeHtml(patient.dateOfBirth)}</td>
      <td>${escapeHtml(patient.phone)}</td>
      <td>${escapeHtml(patient.email)}</td>
      <td>
        ${patient.isSensitive ? '<span class="badge badge-sensitive">Sensibile</span>' : '<span class="badge bg-secondary">No</span>'}
      </td>
      <td>
        <button class="btn btn-sm btn-primary btn-action" onclick="editPatient('${patient.id}')">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn btn-sm btn-danger btn-action" onclick="deletePatient('${patient.id}')">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

/**
 * Render prescriptions table
 */
function renderPrescriptions() {
  const tbody = document.getElementById('prescriptionsTableBody');
  if (!tbody) return;
  
  if (allPrescriptions.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center">Nessuna ricetta trovata</td></tr>';
    return;
  }
  
  tbody.innerHTML = allPrescriptions.map(prescription => `
    <tr>
      <td>${escapeHtml(prescription.patientName)}</td>
      <td>${escapeHtml(prescription.date)}</td>
      <td><div style="max-width: 300px; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(prescription.drugs)}</div></td>
      <td>${escapeHtml(prescription.notes || '-')}</td>
      <td>
        <button class="btn btn-sm btn-success btn-action" onclick="printPrescription('${prescription.id}')">
          <i class="bi bi-printer"></i>
        </button>
        <button class="btn btn-sm btn-primary btn-action" onclick="editPrescription('${prescription.id}')">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn btn-sm btn-danger btn-action" onclick="deletePrescription('${prescription.id}')">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

/**
 * Render calendar
 */
function renderCalendar() {
  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();
  
  // Update header
  const monthNames = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
                      'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
  const headerEl = document.getElementById('calendarMonth');
  if (headerEl) {
    headerEl.textContent = `${monthNames[month]} ${year}`;
  }
  
  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  
  // Build calendar grid
  const calendarGrid = document.getElementById('calendarGrid');
  if (!calendarGrid) return;
  
  let html = '';
  
  // Day headers
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
  dayNames.forEach(day => {
    html += `<div class="calendar-day-header">${day}</div>`;
  });
  
  // Previous month days
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    html += `<div class="calendar-day other-month">
      <div class="calendar-day-number">${day}</div>
    </div>`;
  }
  
  // Current month days
  const today = new Date();
  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayAppointments = allAppointments.filter(apt => apt.date === currentDate);
    
    const isToday = today.getDate() === day && 
                    today.getMonth() === month && 
                    today.getFullYear() === year;
    
    const hasAppointments = dayAppointments.length > 0;
    
    let classes = 'calendar-day';
    if (isToday) classes += ' today';
    if (hasAppointments) classes += ' has-appointments';
    
    html += `<div class="${classes}" onclick="showDayAppointments('${currentDate}')">
      <div class="calendar-day-number">${day}</div>
      <button class="calendar-add-btn" onclick="event.stopPropagation(); addAppointmentForDate('${currentDate}')" title="Aggiungi appuntamento">+</button>`;
    
    // Show up to 2-3 appointments
    const displayAppointments = dayAppointments.slice(0, 2);
    displayAppointments.forEach(apt => {
      html += `<div class="calendar-appointment status-${apt.status}" title="${escapeHtml(apt.patientName)} - ${escapeHtml(apt.time)}">
        ${escapeHtml(apt.time)} ${escapeHtml(apt.patientName)}
      </div>`;
    });
    
    if (dayAppointments.length > 2) {
      html += `<div class="calendar-more">+${dayAppointments.length - 2} altro/i</div>`;
    }
    
    html += '</div>';
  }
  
  // Next month days
  const remainingCells = 42 - (firstDay + daysInMonth);
  for (let day = 1; day <= remainingCells; day++) {
    html += `<div class="calendar-day other-month">
      <div class="calendar-day-number">${day}</div>
    </div>`;
  }
  
  calendarGrid.innerHTML = html;
}

/**
 * Load and render sensitive patients
 */
async function loadSensitivePatients() {
  try {
    const response = await fetch('php/sensitive_patients.php?action=list', { cache: 'no-store' });
    const data = await response.json();
    
    if (data.success) {
      renderSensitivePatients(data.data);
    }
  } catch (error) {
    console.error('Error loading sensitive patients:', error);
  }
}

/**
 * Render sensitive patients cards
 */
function renderSensitivePatients(patients) {
  const container = document.getElementById('sensitivePatientsContainer');
  if (!container) return;
  
  if (patients.length === 0) {
    container.innerHTML = '<div class="alert alert-info">Nessun paziente sensibile trovato</div>';
    return;
  }
  
  container.innerHTML = patients.map(patient => `
    <div class="sensitive-card">
      <h5>
        <i class="bi bi-exclamation-triangle-fill text-danger"></i>
        ${escapeHtml(patient.name)}
      </h5>
      <div class="card-info">
        <div class="info-item">
          <span class="info-label">Codice Fiscale</span>
          <span class="info-value">${escapeHtml(patient.ssn)}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Data di Nascita</span>
          <span class="info-value">${escapeHtml(patient.dateOfBirth)}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Telefono</span>
          <span class="info-value">${escapeHtml(patient.phone)}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Email</span>
          <span class="info-value">${escapeHtml(patient.email)}</span>
        </div>
      </div>
      ${patient.sensitiveNotes ? `
        <div class="notes-section">
          <h6><i class="bi bi-clipboard-pulse"></i> Note Cliniche Importanti</h6>
          <p>${escapeHtml(patient.sensitiveNotes)}</p>
        </div>
      ` : ''}
    </div>
  `).join('');
}

/**
 * Show appointments for a specific day
 */
function showDayAppointments(date) {
  const dayAppointments = allAppointments.filter(apt => apt.date === date);
  
  const modal = new bootstrap.Modal(document.getElementById('dayAppointmentsModal'));
  const titleEl = document.getElementById('dayAppointmentsTitle');
  const bodyEl = document.getElementById('dayAppointmentsBody');
  
  if (titleEl) {
    titleEl.textContent = `Appuntamenti - ${date}`;
  }
  
  if (bodyEl) {
    if (dayAppointments.length === 0) {
      bodyEl.innerHTML = '<p class="text-center text-muted">Nessun appuntamento per questa data</p>';
    } else {
      bodyEl.innerHTML = `
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Ora</th>
                <th>Paziente</th>
                <th>Motivo</th>
                <th>Stato</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              ${dayAppointments.map(apt => `
                <tr>
                  <td><strong>${escapeHtml(apt.time)}</strong></td>
                  <td>${escapeHtml(apt.patientName)}</td>
                  <td>${escapeHtml(apt.reason || '-')}</td>
                  <td><span class="status-badge status-${apt.status}">${getStatusLabel(apt.status)}</span></td>
                  <td>
                    <button class="btn btn-sm btn-primary btn-action" onclick="editAppointment('${apt.id}')">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-success btn-action" onclick="updateAppointmentStatus('${apt.id}', 'complete')">
                      <i class="bi bi-check-circle"></i>
                    </button>
                    <button class="btn btn-sm btn-danger btn-action" onclick="deleteAppointment('${apt.id}')">
                      <i class="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }
  }
  
  modal.show();
}

/**
 * Add appointment for specific date
 */
function addAppointmentForDate(date) {
  document.getElementById('appointmentId').value = '';
  document.getElementById('appointmentDate').value = date;
  document.getElementById('appointmentTime').value = '';
  document.getElementById('appointmentPatientId').value = '';
  document.getElementById('appointmentReason').value = '';
  document.getElementById('appointmentStatus').value = 'pending';
  document.getElementById('appointmentModalTitle').textContent = 'Nuovo Appuntamento';
  
  populatePatientSelect('appointmentPatientId');
  
  const modal = new bootstrap.Modal(document.getElementById('appointmentModal'));
  modal.show();
}

/**
 * Open patient modal
 */
function openPatientModal() {
  document.getElementById('patientForm').reset();
  document.getElementById('patientId').value = '';
  document.getElementById('patientModalTitle').textContent = 'Nuovo Paziente';
  document.getElementById('sensitiveSection').style.display = 'none';
  
  const modal = new bootstrap.Modal(document.getElementById('patientModal'));
  modal.show();
}

/**
 * Edit patient
 */
function editPatient(id) {
  const patient = allPatients.find(p => p.id === id);
  if (!patient) return;
  
  document.getElementById('patientId').value = patient.id;
  document.getElementById('patientName').value = patient.name;
  document.getElementById('patientSSN').value = patient.ssn;
  document.getElementById('patientDOB').value = patient.dateOfBirth;
  document.getElementById('patientAddress').value = patient.address;
  document.getElementById('patientPhone').value = patient.phone;
  document.getElementById('patientEmail').value = patient.email;
  document.getElementById('patientSensitive').checked = patient.isSensitive;
  document.getElementById('patientSensitiveNotes').value = patient.sensitiveNotes || '';
  document.getElementById('patientModalTitle').textContent = 'Modifica Paziente';
  
  toggleSensitiveSection();
  
  const modal = new bootstrap.Modal(document.getElementById('patientModal'));
  modal.show();
}

/**
 * Delete patient
 */
async function deletePatient(id) {
  if (!confirm('Sei sicuro di voler eliminare questo paziente?')) return;
  
  try {
    const formData = new FormData();
    formData.append('action', 'delete');
    formData.append('id', id);
    
    const response = await fetch('php/patients_api.php', {
      method: 'POST',
      body: formData,
      cache: 'no-store'
    });
    
    const data = await response.json();
    
    if (data.success) {
      showSuccess('Paziente eliminato con successo');
      loadAllData();
    } else {
      showError(data.error || 'Errore durante l\'eliminazione');
    }
  } catch (error) {
    console.error('Error deleting patient:', error);
    showError('Errore durante l\'eliminazione');
  }
}

/**
 * Handle patient form submit
 */
async function handlePatientSubmit(e) {
  e.preventDefault();
  
  const id = document.getElementById('patientId').value;
  const action = id ? 'edit' : 'add';
  
  const formData = new FormData();
  formData.append('action', action);
  if (id) formData.append('id', id);
  formData.append('name', document.getElementById('patientName').value);
  formData.append('ssn', document.getElementById('patientSSN').value);
  formData.append('dateOfBirth', document.getElementById('patientDOB').value);
  formData.append('address', document.getElementById('patientAddress').value);
  formData.append('phone', document.getElementById('patientPhone').value);
  formData.append('email', document.getElementById('patientEmail').value);
  formData.append('isSensitive', document.getElementById('patientSensitive').checked);
  formData.append('sensitiveNotes', document.getElementById('patientSensitiveNotes').value);
  
  try {
    const response = await fetch('php/patients_api.php', {
      method: 'POST',
      body: formData,
      cache: 'no-store'
    });
    
    const data = await response.json();
    
    if (data.success) {
      showSuccess(action === 'add' ? 'Paziente aggiunto con successo' : 'Paziente modificato con successo');
      bootstrap.Modal.getInstance(document.getElementById('patientModal')).hide();
      loadAllData();
    } else {
      showError(data.error || 'Errore durante il salvataggio');
    }
  } catch (error) {
    console.error('Error saving patient:', error);
    showError('Errore durante il salvataggio');
  }
}

/**
 * Toggle sensitive section visibility
 */
function toggleSensitiveSection() {
  const checkbox = document.getElementById('patientSensitive');
  const section = document.getElementById('sensitiveSection');
  section.style.display = checkbox.checked ? 'block' : 'none';
}

/**
 * Open prescription modal
 */
function openPrescriptionModal() {
  document.getElementById('prescriptionForm').reset();
  document.getElementById('prescriptionId').value = '';
  document.getElementById('prescriptionModalTitle').textContent = 'Nuova Ricetta';
  document.getElementById('prescriptionDate').value = new Date().toISOString().split('T')[0];
  
  populatePatientSelect('prescriptionPatientId');
  
  const modal = new bootstrap.Modal(document.getElementById('prescriptionModal'));
  modal.show();
}

/**
 * Edit prescription
 */
function editPrescription(id) {
  const prescription = allPrescriptions.find(p => p.id === id);
  if (!prescription) return;
  
  document.getElementById('prescriptionId').value = prescription.id;
  document.getElementById('prescriptionPatientId').value = prescription.patientId;
  document.getElementById('prescriptionDate').value = prescription.date;
  document.getElementById('prescriptionDrugs').value = prescription.drugs;
  document.getElementById('prescriptionNotes').value = prescription.notes || '';
  document.getElementById('prescriptionModalTitle').textContent = 'Modifica Ricetta';
  
  populatePatientSelect('prescriptionPatientId');
  
  const modal = new bootstrap.Modal(document.getElementById('prescriptionModal'));
  modal.show();
}

/**
 * Delete prescription
 */
async function deletePrescription(id) {
  if (!confirm('Sei sicuro di voler eliminare questa ricetta?')) return;
  
  try {
    const formData = new FormData();
    formData.append('action', 'delete');
    formData.append('id', id);
    
    const response = await fetch('php/prescriptions_api.php', {
      method: 'POST',
      body: formData,
      cache: 'no-store'
    });
    
    const data = await response.json();
    
    if (data.success) {
      showSuccess('Ricetta eliminata con successo');
      loadAllData();
    } else {
      showError(data.error || 'Errore durante l\'eliminazione');
    }
  } catch (error) {
    console.error('Error deleting prescription:', error);
    showError('Errore durante l\'eliminazione');
  }
}

/**
 * Print prescription
 */
function printPrescription(id) {
  window.open(`php/prescriptions_api.php?action=print&id=${id}`, '_blank');
}

/**
 * Handle prescription form submit
 */
async function handlePrescriptionSubmit(e) {
  e.preventDefault();
  
  const id = document.getElementById('prescriptionId').value;
  const action = id ? 'edit' : 'add';
  
  const formData = new FormData();
  formData.append('action', action);
  if (id) formData.append('id', id);
  formData.append('patientId', document.getElementById('prescriptionPatientId').value);
  formData.append('date', document.getElementById('prescriptionDate').value);
  formData.append('drugs', document.getElementById('prescriptionDrugs').value);
  formData.append('notes', document.getElementById('prescriptionNotes').value);
  
  try {
    const response = await fetch('php/prescriptions_api.php', {
      method: 'POST',
      body: formData,
      cache: 'no-store'
    });
    
    const data = await response.json();
    
    if (data.success) {
      showSuccess(action === 'add' ? 'Ricetta aggiunta con successo' : 'Ricetta modificata con successo');
      bootstrap.Modal.getInstance(document.getElementById('prescriptionModal')).hide();
      loadAllData();
    } else {
      showError(data.error || 'Errore durante il salvataggio');
    }
  } catch (error) {
    console.error('Error saving prescription:', error);
    showError('Errore durante il salvataggio');
  }
}

/**
 * Open appointment modal
 */
function openAppointmentModal() {
  document.getElementById('appointmentForm').reset();
  document.getElementById('appointmentId').value = '';
  document.getElementById('appointmentModalTitle').textContent = 'Nuovo Appuntamento';
  document.getElementById('appointmentDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('appointmentStatus').value = 'pending';
  
  populatePatientSelect('appointmentPatientId');
  
  const modal = new bootstrap.Modal(document.getElementById('appointmentModal'));
  modal.show();
}

/**
 * Edit appointment
 */
function editAppointment(id) {
  const appointment = allAppointments.find(a => a.id === id);
  if (!appointment) return;
  
  document.getElementById('appointmentId').value = appointment.id;
  document.getElementById('appointmentPatientId').value = appointment.patientId;
  document.getElementById('appointmentDate').value = appointment.date;
  document.getElementById('appointmentTime').value = appointment.time;
  document.getElementById('appointmentReason').value = appointment.reason || '';
  document.getElementById('appointmentStatus').value = appointment.status;
  document.getElementById('appointmentModalTitle').textContent = 'Modifica Appuntamento';
  
  populatePatientSelect('appointmentPatientId');
  
  // Close day appointments modal if open
  const dayModal = bootstrap.Modal.getInstance(document.getElementById('dayAppointmentsModal'));
  if (dayModal) dayModal.hide();
  
  const modal = new bootstrap.Modal(document.getElementById('appointmentModal'));
  modal.show();
}

/**
 * Delete appointment
 */
async function deleteAppointment(id) {
  if (!confirm('Sei sicuro di voler eliminare questo appuntamento?')) return;
  
  try {
    const formData = new FormData();
    formData.append('action', 'delete');
    formData.append('id', id);
    
    const response = await fetch('php/appointments_api.php', {
      method: 'POST',
      body: formData,
      cache: 'no-store'
    });
    
    const data = await response.json();
    
    if (data.success) {
      showSuccess('Appuntamento eliminato con successo');
      
      // Close day appointments modal if open
      const dayModal = bootstrap.Modal.getInstance(document.getElementById('dayAppointmentsModal'));
      if (dayModal) dayModal.hide();
      
      loadAllData();
    } else {
      showError(data.error || 'Errore durante l\'eliminazione');
    }
  } catch (error) {
    console.error('Error deleting appointment:', error);
    showError('Errore durante l\'eliminazione');
  }
}

/**
 * Update appointment status
 */
async function updateAppointmentStatus(id, status) {
  try {
    const formData = new FormData();
    formData.append('action', 'update_status');
    formData.append('id', id);
    formData.append('status', status);
    
    const response = await fetch('php/appointments_api.php', {
      method: 'POST',
      body: formData,
      cache: 'no-store'
    });
    
    const data = await response.json();
    
    if (data.success) {
      showSuccess('Stato appuntamento aggiornato');
      loadAllData();
    } else {
      showError(data.error || 'Errore durante l\'aggiornamento');
    }
  } catch (error) {
    console.error('Error updating appointment status:', error);
    showError('Errore durante l\'aggiornamento');
  }
}

/**
 * Handle appointment form submit
 */
async function handleAppointmentSubmit(e) {
  e.preventDefault();
  
  const id = document.getElementById('appointmentId').value;
  const action = id ? 'edit' : 'add';
  
  const formData = new FormData();
  formData.append('action', action);
  if (id) formData.append('id', id);
  formData.append('patientId', document.getElementById('appointmentPatientId').value);
  formData.append('date', document.getElementById('appointmentDate').value);
  formData.append('time', document.getElementById('appointmentTime').value);
  formData.append('reason', document.getElementById('appointmentReason').value);
  formData.append('status', document.getElementById('appointmentStatus').value);
  
  try {
    const response = await fetch('php/appointments_api.php', {
      method: 'POST',
      body: formData,
      cache: 'no-store'
    });
    
    const data = await response.json();
    
    if (data.success) {
      showSuccess(action === 'add' ? 'Appuntamento aggiunto con successo' : 'Appuntamento modificato con successo');
      bootstrap.Modal.getInstance(document.getElementById('appointmentModal')).hide();
      loadAllData();
    } else {
      showError(data.error || 'Errore durante il salvataggio');
    }
  } catch (error) {
    console.error('Error saving appointment:', error);
    showError('Errore durante il salvataggio');
  }
}

/**
 * Populate patient select dropdown
 */
function populatePatientSelect(selectId) {
  const select = document.getElementById(selectId);
  if (!select) return;
  
  const currentValue = select.value;
  
  select.innerHTML = '<option value="">Seleziona paziente...</option>' +
    allPatients.map(p => `<option value="${p.id}">${escapeHtml(p.name)} (${escapeHtml(p.ssn)})</option>`).join('');
  
  if (currentValue) {
    select.value = currentValue;
  }
}

/**
 * Get status label
 */
function getStatusLabel(status) {
  const labels = {
    'pending': 'In Attesa',
    'complete': 'Completato',
    'cancelled': 'Cancellato',
    'no_show': 'Non Presentato'
  };
  return labels[status] || status;
}

/**
 * Show loading indicator
 */
function showLoading() {
  const alerts = document.getElementById('alerts');
  if (alerts) {
    alerts.innerHTML = `
      <div class="loading">
        <div class="loading-spinner"></div>
        <p>Caricamento in corso...</p>
      </div>
    `;
  }
}

/**
 * Hide loading indicator
 */
function hideLoading() {
  const alerts = document.getElementById('alerts');
  if (alerts) {
    alerts.innerHTML = '';
  }
}

/**
 * Show success message
 */
function showSuccess(message) {
  const alerts = document.getElementById('alerts');
  if (alerts) {
    alerts.innerHTML = `
      <div class="alert alert-success alert-dismissible fade show" role="alert">
        <i class="bi bi-check-circle-fill"></i> ${escapeHtml(message)}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>
    `;
    setTimeout(() => { alerts.innerHTML = ''; }, 5000);
  }
}

/**
 * Show error message
 */
function showError(message) {
  const alerts = document.getElementById('alerts');
  if (alerts) {
    alerts.innerHTML = `
      <div class="alert alert-danger alert-dismissible fade show" role="alert">
        <i class="bi bi-exclamation-triangle-fill"></i> ${escapeHtml(message)}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>
    `;
  }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}
