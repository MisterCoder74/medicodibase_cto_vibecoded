/**
 * Client-side Application Logic
 * Studio Medico - Medical Office Management System
 */

// Global data arrays
let allPatients = [];
let allPrescriptions = [];
let allAppointments = [];
let allMedications = [];
let currentCalendarDate = new Date();
let medicationModal = null;

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
    const [patientsRes, prescriptionsRes, appointmentsRes, inventoryRes] = await Promise.all([
      fetch('php/patients_api.php?action=list', { cache: 'no-store' }),
      fetch('php/prescriptions_api.php?action=list', { cache: 'no-store' }),
      fetch('php/appointments_api.php?action=list', { cache: 'no-store' }),
      fetch('php/inventory_api.php?action=list', { cache: 'no-store' })
    ]);

    const patientsData = await patientsRes.json();
    const prescriptionsData = await prescriptionsRes.json();
    const appointmentsData = await appointmentsRes.json();
    const inventoryData = await inventoryRes.json();

    if (patientsData.success) {
      allPatients = patientsData.data.filter(p => !p.deleted);
    }
    if (prescriptionsData.success) {
      allPrescriptions = prescriptionsData.data;
    }
    if (appointmentsData.success) {
      allAppointments = appointmentsData.data;
    }
    if (inventoryData.success) {
      allMedications = inventoryData.data;
    }

    renderPatients();
    renderPrescriptions();
    renderCalendar();
    renderInventory();
    populatePrescriptionMedicationSelect();
    await loadSensitivePatients();

    hideLoading();
    return true;
  } catch (error) {
    console.error('Error loading data:', error);
    showError('Errore nel caricamento dei dati');
    hideLoading();
    return false;
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
  document.getElementById('medicationForm')?.addEventListener('submit', handleMedicationSubmit);

  // Initialize medication modal
  const medicationModalEl = document.getElementById('medicationModal');
  if (medicationModalEl) {
    medicationModal = new bootstrap.Modal(medicationModalEl);
  }
}

/**
 * Render patients table
 */
function renderPatients() {
  const tbody = document.getElementById('patientsTableBody');
  if (!tbody) return;
  
  if (allPatients.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center">Nessun paziente trovato</td></tr>';
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
       <button class="btn btn-sm btn-info" onclick="openPatientDetail('${patient.id}')">
         <i class="bi bi-eye"></i> View Details
       </button>
       <button class="btn btn-sm btn-primary btn-action" onclick="editPatient('${patient.id}')" title="Modifica">
         <i class="bi bi-pencil"></i>
       </button>
       <button class="btn btn-sm btn-danger btn-action" onclick="deletePatient('${patient.id}')" title="Elimina">
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
    const response = await fetch('./php/sensitive_patients.php?action=list', { cache: 'no-store' });
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
    
    const response = await fetch('./php/patients_api.php', {
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
    const response = await fetch('./php/patients_api.php', {
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
 * Populate patient select dropdown
 */
function populatePatientSelect(selectId, selectedPatientId = null) {
  const select = document.getElementById(selectId);
  if (!select) return;

  // Save current value
  const currentValue = select.value;

  // Clear options
  select.innerHTML = '<option value="">Seleziona paziente...</option>';

  // Add patient options
  allPatients.forEach(patient => {
    const option = document.createElement('option');
    option.value = patient.id;
    option.textContent = `${patient.name} (${patient.ssn})`;
    select.appendChild(option);
  });

  // Set selected value
  if (selectedPatientId) {
    select.value = selectedPatientId;
  } else if (currentValue) {
    select.value = currentValue;
  }
}

/**
 * Open prescription modal
 */
function openPrescriptionModal() {
  document.getElementById('prescriptionForm').reset();
  document.getElementById('prescriptionId').value = '';
  document.getElementById('prescriptionDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('prescriptionModalTitle').textContent = 'Nuova Ricetta';

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
  document.getElementById('prescriptionDosage').value = prescription.dosage || '';
  document.getElementById('prescriptionDuration').value = prescription.duration || '';
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
    
    const response = await fetch('./php/prescriptions_api.php', {
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
  window.open(`./php/prescriptions_api.php?action=print&id=${id}`, '_blank');
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
  formData.append('dosage', document.getElementById('prescriptionDosage').value);
  formData.append('duration', document.getElementById('prescriptionDuration').value);
  formData.append('notes', document.getElementById('prescriptionNotes').value);

  try {
    const response = await fetch('./php/prescriptions_api.php', {
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
  document.getElementById('appointmentNotes').value = appointment.notes || '';
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
    
    const response = await fetch('./php/appointments_api.php', {
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
    
    const response = await fetch('./php/appointments_api.php', {
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
  formData.append('notes', document.getElementById('appointmentNotes').value);
  formData.append('status', document.getElementById('appointmentStatus').value);

  try {
    const response = await fetch('./php/appointments_api.php', {
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

/**
 * Patient Detail Modal Functions
 */

// Global variables for patient detail modal
let patientDetailModal = null;
let currentPatientId = null;
let currentEditMode = null;

/**
 * Open patient detail modal
 */
function openPatientDetail(patientId) {
  currentPatientId = patientId;
  const patient = allPatients.find(p => p.id == patientId);

  if (!patient) {
    showError('Paziente non trovato');
    return;
  }

  // Initialize modal if not already done
  if (!patientDetailModal) {
    patientDetailModal = new bootstrap.Modal('#patientDetailModal');
  }

  // Reset edit mode
  currentEditMode = null;
  document.getElementById('editModeActions').style.display = 'none';

  // Populate all sections
  populateOverviewTab(patient);
  populateClinicalTab(patient);
  populatePrescriptionsTab(patientId);
  populateAppointmentsTab(patientId);
  populateDocumentsTab(patient);

  patientDetailModal.show();
}

/**
 * Populate Overview Tab
 */
function populateOverviewTab(patient) {
  document.getElementById('detailPatientName').textContent = patient.name;
  document.getElementById('detailPatientSubtitle').textContent = `Codice Fiscale: ${patient.ssn}`;
  document.getElementById('detailPatientNameInput').value = patient.name;
  document.getElementById('detailSSN').value = patient.ssn;
  document.getElementById('detailEmail').value = patient.email;
  document.getElementById('detailPhone').value = patient.phone;
  document.getElementById('detailDOB').value = patient.dateOfBirth;
  document.getElementById('detailAddress').value = patient.address;
  document.getElementById('detailStatus').checked = !patient.deleted;
  document.getElementById('detailSensitive').checked = patient.isSensitive;

  // Status badge
  const statusBadge = document.getElementById('detailStatusBadge');
  if (patient.isSensitive) {
    statusBadge.className = 'badge badge-sensitive';
    statusBadge.textContent = 'Sensibile';
  } else if (patient.deleted) {
    statusBadge.className = 'badge bg-secondary';
    statusBadge.textContent = 'Inattivo';
  } else {
    statusBadge.className = 'badge bg-success';
    statusBadge.textContent = 'Attivo';
  }

  // Dates
  document.getElementById('detailCreatedDate').textContent =
    patient.createdAt ? formatDateItalian(patient.createdAt) : 'N/A';
  document.getElementById('detailUpdatedDate').textContent =
    patient.updatedAt ? formatDateItalian(patient.updatedAt) : 'N/A';
}

/**
 * Populate Clinical Tab
 */
function populateClinicalTab(patient) {
  const notes = patient.sensitiveNotes || '';
  document.getElementById('clinicalNotes').value = notes;

  // Display last updated date
  document.getElementById('lastUpdatedDate').textContent =
    patient.updatedAt ? formatDateItalian(patient.updatedAt) : 'N/A';

  if (patient.isSensitive) {
    document.getElementById('sensitiveWarning').style.display = 'block';
  } else {
    document.getElementById('sensitiveWarning').style.display = 'none';
  }
}

/**
 * Populate Prescriptions Tab
 */
function populatePrescriptionsTab(patientId) {
  const patientPrescriptions = allPrescriptions.filter(p => p.patientId == patientId);
  // Sort by date descending
  patientPrescriptions.sort((a, b) => new Date(b.date) - new Date(a.date));

  const tbody = document.getElementById('patientPrescriptionsTable').querySelector('tbody');
  tbody.innerHTML = '';

  if (patientPrescriptions.length === 0) {
    document.getElementById('prescriptionsEmpty').classList.remove('d-none');
    document.getElementById('patientPrescriptionsTable').classList.add('d-none');
  } else {
    document.getElementById('prescriptionsEmpty').classList.add('d-none');
    document.getElementById('patientPrescriptionsTable').classList.remove('d-none');

    patientPrescriptions.forEach(prescription => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${escapeHtml(prescription.date)}</td>
        <td><div style="max-width: 300px; white-space: pre-wrap;">${escapeHtml(prescription.drugs)}</div></td>
        <td>${escapeHtml(prescription.dosage || '-')}</td>
        <td>${escapeHtml(prescription.duration || '-')}</td>
        <td><div style="max-width: 200px; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(prescription.notes || '-')}</div></td>
        <td>
          <button class="btn btn-sm btn-success btn-action" onclick="printPrescription('${prescription.id}')" title="Stampa">
            <i class="bi bi-printer"></i>
          </button>
          <button class="btn btn-sm btn-warning btn-action" onclick="editPrescriptionFromDetail('${prescription.id}')" title="Modifica">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-danger btn-action" onclick="deletePrescriptionFromDetail('${prescription.id}')" title="Elimina">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      `;
      tbody.appendChild(row);
    });
  }
}

/**
 * Populate Appointments Tab
 */
function populateAppointmentsTab(patientId) {
  const patientAppointments = allAppointments.filter(a => a.patientId == patientId);
  // Sort by date descending
  patientAppointments.sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time));

  const tbody = document.getElementById('patientAppointmentsTable').querySelector('tbody');
  tbody.innerHTML = '';

  if (patientAppointments.length === 0) {
    document.getElementById('appointmentsEmpty').classList.remove('d-none');
    document.getElementById('patientAppointmentsTable').classList.add('d-none');
  } else {
    document.getElementById('appointmentsEmpty').classList.add('d-none');
    document.getElementById('patientAppointmentsTable').classList.remove('d-none');

    patientAppointments.forEach(appointment => {
      const statusClass = appointment.status === 'complete' ? 'success' :
                         appointment.status === 'no_show' ? 'danger' :
                         appointment.status === 'cancelled' ? 'secondary' : 'warning';
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${escapeHtml(appointment.date)}</td>
        <td><strong>${escapeHtml(appointment.time)}</strong></td>
        <td>${escapeHtml(appointment.reason || '-')}</td>
        <td><span class="badge bg-${statusClass}">${getStatusLabel(appointment.status)}</span></td>
        <td><div style="max-width: 200px; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(appointment.notes || '-')}</div></td>
        <td>
          <button class="btn btn-sm btn-warning btn-action" onclick="editAppointmentFromDetail('${appointment.id}')" title="Modifica">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-danger btn-action" onclick="deleteAppointmentFromDetail('${appointment.id}')" title="Elimina">
            <i class="bi bi-trash"></i>
          </button>
          ${appointment.status === 'pending' ? `
            <button class="btn btn-sm btn-success btn-action" onclick="changeAppointmentStatus('${appointment.id}', 'complete')" title="Segna come completato">
              <i class="bi bi-check"></i>
            </button>
          ` : ''}
        </td>
      `;
      tbody.appendChild(row);
    });
  }
}

/**
 * Populate Documents Tab
 */
function populateDocumentsTab(patient) {
  const documentsList = document.getElementById('documentsList');

  fetch(`./php/documents_api.php?action=list&ssn=${patient.ssn}`, { cache: 'no-store' })
    .then(response => response.json())
    .then(data => {
      documentsList.innerHTML = '';

      const documents = data.data && data.data.documents ? data.data.documents : [];

        if (!data.success || documents.length === 0) {
        documentsList.innerHTML = `
          <div class="text-center text-muted py-4">
            <i class="bi bi-folder" style="font-size: 3rem;"></i>
            <p class="mt-2">Nessun documento caricato</p>
          </div>
        `;
        return;
      }

      documents.forEach(doc => {
        const icon = getDocumentIcon(doc.extension);
        const item = document.createElement('div');
        item.className = 'document-item card mb-2';
        item.innerHTML = `
          <div class="card-body">
            <div class="row align-items-center">
              <div class="col-auto">
                <i class="${icon}" style="font-size: 2rem;"></i>
              </div>
              <div class="col">
                <strong>${escapeHtml(doc.originalName)}</strong><br>
                <small class="text-muted">
                  Caricato: ${formatDateItalian(doc.uploadDate)} |
                  Categoria: ${escapeHtml(doc.category)} |
                  Dimensione: ${escapeHtml(doc.filesizeFormatted)}
                </small>
              </div>
              <div class="col-auto">
                <a href="../patients/${patient.ssn}/assets/${doc.filename}"
                   class="btn btn-sm btn-info" download title="Scarica">
                  <i class="bi bi-download"></i>
                </a>
                <button class="btn btn-sm btn-danger" onclick="deleteDocument('${patient.ssn}', '${doc.filename}')" title="Elimina">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
          </div>
        `;
        documentsList.appendChild(item);
      });
    })
    .catch(error => {
      console.error('Error loading documents:', error);
      documentsList.innerHTML = `
        <div class="alert alert-danger">
          <i class="bi bi-exclamation-triangle-fill"></i>
          Errore durante il caricamento dei documenti
        </div>
      `;
    });
}

/**
 * Toggle edit mode for tabs
 */
function toggleEditMode(mode) {
  currentEditMode = mode;
  const editModeActions = document.getElementById('editModeActions');
  editModeActions.style.display = 'flex';

  if (mode === 'overview') {
    document.getElementById('detailPatientNameInput').disabled = false;
    document.getElementById('detailEmail').disabled = false;
    document.getElementById('detailPhone').disabled = false;
    document.getElementById('detailDOB').disabled = false;
    document.getElementById('detailAddress').disabled = false;
    document.getElementById('detailStatus').disabled = false;
    document.getElementById('detailSensitive').disabled = false;
    document.getElementById('editOverviewBtn').style.display = 'none';
  } else if (mode === 'clinical') {
    document.getElementById('clinicalNotes').disabled = false;
    document.getElementById('editClinicalBtn').style.display = 'none';
  }
}

/**
 * Cancel edit mode
 */
function cancelEditMode() {
  if (!currentPatientId) return;

  currentEditMode = null;
  document.getElementById('editModeActions').style.display = 'none';

  // Restore original data
  const patient = allPatients.find(p => p.id == currentPatientId);
  if (patient) {
    populateOverviewTab(patient);
    populateClinicalTab(patient);
  }

  // Reset buttons
  document.getElementById('editOverviewBtn').style.display = 'block';
  document.getElementById('editClinicalBtn').style.display = 'block';

  // Disable all inputs
  document.getElementById('detailPatientNameInput').disabled = true;
  document.getElementById('detailSSN').disabled = true;
  document.getElementById('detailEmail').disabled = true;
  document.getElementById('detailPhone').disabled = true;
  document.getElementById('detailDOB').disabled = true;
  document.getElementById('detailAddress').disabled = true;
  document.getElementById('detailStatus').disabled = true;
  document.getElementById('detailSensitive').disabled = true;
  document.getElementById('clinicalNotes').disabled = true;
}

/**
 * Save patient changes
 */
function savePatientChanges() {
  if (!currentPatientId) return;

  const patient = allPatients.find(p => p.id == currentPatientId);
  if (!patient) {
    showError('Paziente non trovato');
    return;
  }

  const updatedData = {
    id: currentPatientId,
    name: document.getElementById('detailPatientNameInput').value,
    ssn: document.getElementById('detailSSN').value,
    email: document.getElementById('detailEmail').value,
    phone: document.getElementById('detailPhone').value,
    dateOfBirth: document.getElementById('detailDOB').value,
    address: document.getElementById('detailAddress').value,
    isSensitive: document.getElementById('detailSensitive').checked,
    sensitiveNotes: document.getElementById('clinicalNotes').value
  };

  // Convert checkbox to string for API
  const formData = new FormData();
  formData.append('action', 'edit');
  formData.append('id', currentPatientId);
  formData.append('name', updatedData.name);
  formData.append('ssn', updatedData.ssn);
  formData.append('email', updatedData.email);
  formData.append('phone', updatedData.phone);
  formData.append('dateOfBirth', updatedData.dateOfBirth);
  formData.append('address', updatedData.address);
  formData.append('isSensitive', updatedData.isSensitive ? 'true' : 'false');
  formData.append('sensitiveNotes', updatedData.sensitiveNotes);

  fetch('./php/patients_api.php', {
    method: 'POST',
    body: formData,
    cache: 'no-store'
  })
  .then(response => response.json())
  .then(result => {
    if (result.success) {
      showSuccess('Paziente aggiornato con successo');
      loadAllData().then(() => {
        // Refresh modal with updated data
        const updatedPatient = allPatients.find(p => p.id == currentPatientId);
        if (updatedPatient) {
          populateOverviewTab(updatedPatient);
          populateClinicalTab(updatedPatient);
        }
      });

      // Exit edit mode
      currentEditMode = null;
      document.getElementById('editModeActions').style.display = 'none';
      document.getElementById('editOverviewBtn').style.display = 'block';
      document.getElementById('editClinicalBtn').style.display = 'block';

      // Disable inputs
      document.getElementById('detailPatientNameInput').disabled = true;
      document.getElementById('detailEmail').disabled = true;
      document.getElementById('detailPhone').disabled = true;
      document.getElementById('detailDOB').disabled = true;
      document.getElementById('detailAddress').disabled = true;
      document.getElementById('detailStatus').disabled = true;
      document.getElementById('detailSensitive').disabled = true;
      document.getElementById('clinicalNotes').disabled = true;
    } else {
      showError('Errore: ' + (result.error || 'Impossibile salvare le modifiche'));
    }
  })
  .catch(error => {
    console.error('Error saving patient:', error);
    showError('Errore durante il salvataggio');
  });
}

/**
 * Print patient record
 */
function printPatientRecord() {
  if (!currentPatientId) return;

  const patient = allPatients.find(p => p.id == currentPatientId);
  if (!patient) return;

  const patientPrescriptions = allPrescriptions.filter(p => p.patientId == currentPatientId);
  const patientAppointments = allAppointments.filter(a => a.patientId == currentPatientId);

  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Scheda Paziente - ${patient.name}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { color: #0066cc; border-bottom: 2px solid #0066cc; }
        h2 { color: #333; margin-top: 30px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f8f9fa; }
        .section { margin-bottom: 20px; }
        .label { font-weight: bold; width: 150px; display: inline-block; }
      </style>
    </head>
    <body>
      <h1>Scheda Paziente</h1>
      <p><strong>Stampato il:</strong> ${new Date().toLocaleString('it-IT')}</p>

      <h2>Anagrafica</h2>
      <div class="section">
        <p><span class="label">Nome:</span> ${escapeHtml(patient.name)}</p>
        <p><span class="label">Codice Fiscale:</span> ${escapeHtml(patient.ssn)}</p>
        <p><span class="label">Data di Nascita:</span> ${formatDateItalian(patient.dateOfBirth)}</p>
        <p><span class="label">Email:</span> ${escapeHtml(patient.email)}</p>
        <p><span class="label">Telefono:</span> ${escapeHtml(patient.phone)}</p>
        <p><span class="label">Indirizzo:</span> ${escapeHtml(patient.address)}</p>
        <p><span class="label">Stato:</span> ${patient.isSensitive ? 'Paziente Sensibile' : 'Normale'}</p>
      </div>

      <h2>Note Cliniche</h2>
      <div class="section">
        <p>${escapeHtml(patient.sensitiveNotes || 'Nessuna nota clinica')}</p>
      </div>

      <h2>Ricette (${patientPrescriptions.length})</h2>
      ${patientPrescriptions.length > 0 ? `
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Farmaci</th>
              ${patientPrescriptions.some(p => p.dosage) ? '<th>Posologia</th>' : ''}
              ${patientPrescriptions.some(p => p.duration) ? '<th>Durata</th>' : ''}
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            ${patientPrescriptions.map(p => `
              <tr>
                <td>${escapeHtml(p.date)}</td>
                <td>${escapeHtml(p.drugs)}</td>
                ${p.dosage ? `<td>${escapeHtml(p.dosage)}</td>` : ''}
                ${p.duration ? `<td>${escapeHtml(p.duration)}</td>` : ''}
                <td>${escapeHtml(p.notes || '-')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : '<p>Nessuna ricetta</p>'}

      <h2>Appuntamenti (${patientAppointments.length})</h2>
      ${patientAppointments.length > 0 ? `
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Ora</th>
              <th>Motivo</th>
              <th>Stato</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            ${patientAppointments.map(a => `
              <tr>
                <td>${escapeHtml(a.date)}</td>
                <td>${escapeHtml(a.time)}</td>
                <td>${escapeHtml(a.reason || '-')}</td>
                <td>${getStatusLabel(a.status)}</td>
                <td>${escapeHtml(a.notes || '-')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : '<p>Nessun appuntamento</p>'}

      <p style="margin-top: 50px; color: #666; font-size: 12px;">
        Studio Medico - Sistema di Gestione Ambulatorio
      </p>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  printWindow.document.write(printContent);
  printWindow.document.close();
  printWindow.print();
}

/**
 * Upload patient document
 */
function uploadPatientDocument() {
  if (!currentPatientId) return;

  const patient = allPatients.find(p => p.id == currentPatientId);
  if (!patient) {
    showError('Paziente non trovato');
    return;
  }

  const fileInput = document.getElementById('documentFileInput');
  const categorySelect = document.getElementById('documentCategory');
  const file = fileInput.files[0];

  if (!file) {
    showError('Seleziona un file');
    return;
  }

  // Validate file size (5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    showError('Il file supera il limite di 5MB');
    return;
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('ssn', patient.ssn);
  formData.append('category', categorySelect.value);

  fetch('./php/documents_api.php?action=upload', {
    method: 'POST',
    body: formData,
    cache: 'no-store'
  })
  .then(response => response.json())
  .then(result => {
    if (result.success) {
      showSuccess('Documento caricato con successo');
      populateDocumentsTab(patient);
      fileInput.value = '';
    } else {
      showError('Errore: ' + (result.error || 'Impossibile caricare il documento'));
    }
  })
  .catch(error => {
    console.error('Error uploading document:', error);
    showError('Errore durante il caricamento del documento');
  });
}

/**
 * Delete document
 */
function deleteDocument(ssn, filename) {
  if (!confirm('Sei sicuro di voler eliminare questo documento?')) return;

  const formData = new FormData();
  formData.append('action', 'delete');
  formData.append('ssn', ssn);
  formData.append('filename', filename);

  fetch('./php/documents_api.php', {
    method: 'POST',
    body: formData,
    cache: 'no-store'
  })
  .then(response => response.json())
  .then(result => {
    if (result.success) {
      showSuccess('Documento eliminato con successo');
      const patient = allPatients.find(p => p.id == currentPatientId);
      if (patient) {
        populateDocumentsTab(patient);
      }
    } else {
      showError('Errore: ' + (result.error || 'Impossibile eliminare il documento'));
    }
  })
  .catch(error => {
    console.error('Error deleting document:', error);
    showError('Errore durante l\'eliminazione del documento');
  });
}

/**
 * Add prescription from detail modal
 */
function addPrescriptionFromDetail() {
  if (!currentPatientId) return;

  document.getElementById('prescriptionId').value = '';
  document.getElementById('prescriptionDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('prescriptionPatientId').value = currentPatientId;
  document.getElementById('prescriptionDrugs').value = '';
  document.getElementById('prescriptionDosage').value = '';
  document.getElementById('prescriptionDuration').value = '';
  document.getElementById('prescriptionNotes').value = '';
  document.getElementById('prescriptionModalTitle').textContent = 'Nuova Ricetta';

  populatePatientSelect('prescriptionPatientId', currentPatientId);

  const modal = new bootstrap.Modal(document.getElementById('prescriptionModal'));
  modal.show();
}

/**
 * Edit prescription from detail modal
 */
function editPrescriptionFromDetail(id) {
  editPrescription(id);
}

/**
 * Delete prescription from detail modal
 */
async function deletePrescriptionFromDetail(id) {
  await deletePrescription(id);
  if (currentPatientId) {
    populatePrescriptionsTab(currentPatientId);
  }
}

/**
 * Add appointment from detail modal
 */
function addAppointmentFromDetail() {
  if (!currentPatientId) return;

  document.getElementById('appointmentId').value = '';
  document.getElementById('appointmentDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('appointmentTime').value = '09:00';
  document.getElementById('appointmentPatientId').value = currentPatientId;
  document.getElementById('appointmentReason').value = '';
  document.getElementById('appointmentNotes').value = '';
  document.getElementById('appointmentStatus').value = 'pending';
  document.getElementById('appointmentModalTitle').textContent = 'Nuovo Appuntamento';

  populatePatientSelect('appointmentPatientId', currentPatientId);

  const modal = new bootstrap.Modal(document.getElementById('appointmentModal'));
  modal.show();
}

/**
 * Edit appointment from detail modal
 */
function editAppointmentFromDetail(id) {
  editAppointment(id);
}

/**
 * Delete appointment from detail modal
 */
async function deleteAppointmentFromDetail(id) {
  await deleteAppointment(id);
  if (currentPatientId) {
    populateAppointmentsTab(currentPatientId);
  }
}

/**
 * Change appointment status from detail modal
 */
function changeAppointmentStatus(id, newStatus) {
  const appointment = allAppointments.find(a => a.id === id);
  if (!appointment) return;

  const formData = new FormData();
  formData.append('action', 'edit');
  formData.append('id', id);
  formData.append('patientId', appointment.patientId);
  formData.append('date', appointment.date);
  formData.append('time', appointment.time);
  formData.append('reason', appointment.reason || '');
  formData.append('status', newStatus);
  formData.append('notes', appointment.notes || '');

  fetch('./php/appointments_api.php', {
    method: 'POST',
    body: formData,
    cache: 'no-store'
  })
  .then(response => response.json())
  .then(result => {
    if (result.success) {
      showSuccess('Stato aggiornato con successo');
      loadAllData().then(() => {
        if (currentPatientId) {
          const patient = allPatients.find(p => p.id == currentPatientId);
          if (patient) {
            populateAppointmentsTab(currentPatientId);
          }
        }
      });
    } else {
      showError('Errore: ' + (result.error || 'Impossibile aggiornare lo stato'));
    }
  })
  .catch(error => {
    console.error('Error updating appointment status:', error);
    showError('Errore durante l\'aggiornamento dello stato');
  });
}

/**
 * Get document icon based on file extension
 */
function getDocumentIcon(extension) {
  switch (extension.toLowerCase()) {
    case 'pdf':
      return 'bi bi-file-earmark-pdf text-danger';
    case 'jpg':
    case 'jpeg':
    case 'png':
      return 'bi bi-file-earmark-image text-primary';
    case 'doc':
    case 'docx':
      return 'bi bi-file-earmark-word text-primary';
    default:
      return 'bi bi-file-earmark text-secondary';
  }
}

/**
 * Format date to Italian format
 */
function formatDateItalian(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/*** INVENTORY MANAGEMENT FUNCTIONS ***/

/**
 * Render inventory table
 */
function renderInventory() {
  const tbody = document.getElementById('inventoryTableBody');
  if (!tbody) return;
  
  if (allMedications.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center">Nessun farmaco in magazzino</td></tr>';
    return;
  }
  
  // Sort by quantity (low stock first)
  const sortedMeds = [...allMedications].sort((a, b) => a.quantity - b.quantity);
  
  tbody.innerHTML = sortedMeds.map(medication => {
    const isLowStock = medication.quantity < 5;
    const statusBadge = isLowStock 
      ? `<span class="badge bg-danger"><i class="bi bi-exclamation-triangle"></i> Low Stock (${medication.quantity})</span>`
      : `<span class="badge bg-success">${medication.quantity}</span>`;
    
    const rowClass = isLowStock ? 'table-danger' : '';
    
    return `
      <tr class="${rowClass}">
        <td>${escapeHtml(medication.name)}</td>
        <td>${medication.quantity}</td>
        <td>${statusBadge}</td>
        <td>
          <div class="d-flex gap-2 flex-wrap">
            <button class="btn btn-sm btn-warning" onclick="editMedication('${medication.id}')">
              <i class="bi bi-pencil"></i> Modifica
            </button>
            <button class="btn btn-sm btn-danger" onclick="deleteMedication('${medication.id}')">
              <i class="bi bi-trash"></i> Elimina
            </button>
            <div class="btn-group btn-group-sm" role="group">
              <button class="btn btn-info" onclick="addStock('${medication.id}', 10)">+10</button>
              <button class="btn btn-info" onclick="addStock('${medication.id}', 20)">+20</button>
              <button class="btn btn-info" onclick="addStock('${medication.id}', 50)">+50</button>
            </div>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Populate medication select in prescription form
 */
function populatePrescriptionMedicationSelect() {
  console.log('Populating medication select. Total medications:', allMedications.length);
  
  const select = document.getElementById('prescriptionMedicationSelect');
  if (!select) {
    console.error('prescriptionMedicationSelect element not found!');
    return;
  }
  
  select.innerHTML = '<option value="">-- Seleziona farmaco da dispensare --</option>';
  
  allMedications.forEach((med, index) => {
    console.log(`Adding option ${index}: ID=${med.id}, Name=${med.name}, Qty=${med.quantity}`);
    
    const option = document.createElement('option');
    const stockWarning = med.quantity < 5 ? ` ⚠️ (${med.quantity})` : ` (${med.quantity})`;
    option.value = String(med.id); // Ensure consistent string type
    option.textContent = med.name + stockWarning;
    option.disabled = med.quantity === 0; // Disable if out of stock
    select.appendChild(option);
  });
  
  console.log('Select list populated with', select.options.length - 1, 'medications');
}

/**
 * Clear medication form
 */
function clearMedicationForm() {
  document.getElementById('medicationId').value = '';
  document.getElementById('medicationName').value = '';
  document.getElementById('medicationQuantity').value = '';
  document.getElementById('medicationModalTitle').textContent = 'Aggiungi Farmaco';
  document.getElementById('saveMedicationBtn').textContent = 'Salva';
}

/**
 * Edit medication
 */
function editMedication(medId) {
  const medication = allMedications.find(m => m.id === medId);
  if (!medication) return;
  
  document.getElementById('medicationId').value = medication.id;
  document.getElementById('medicationName').value = medication.name;
  document.getElementById('medicationQuantity').value = medication.quantity;
  document.getElementById('medicationModalTitle').textContent = 'Modifica Farmaco';
  document.getElementById('saveMedicationBtn').textContent = 'Aggiorna';
  
  if (medicationModal) {
    medicationModal.show();
  }
}

/**
 * Handle medication form submit
 */
async function handleMedicationSubmit(e) {
  e.preventDefault();
  
  const id = document.getElementById('medicationId').value;
  const name = document.getElementById('medicationName').value.trim();
  const quantity = parseInt(document.getElementById('medicationQuantity').value);
  
  if (!name || isNaN(quantity) || quantity < 0) {
    alert('Input non valido');
    return;
  }
  
  const action = id ? 'edit' : 'add';
  const url = 'php/inventory_api.php?action=' + action;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name, quantity }),
      cache: 'no-store'
    });
    
    const data = await response.json();
    if (data.success) {
      alert(action === 'add' ? 'Farmaco aggiunto con successo' : 'Farmaco aggiornato');
      if (medicationModal) medicationModal.hide();
      clearMedicationForm();
      await loadAllData();
    } else {
      alert('Errore: ' + data.error);
    }
  } catch (error) {
    console.error('Error saving medication:', error);
    alert('Errore durante il salvataggio');
  }
}

/**
 * Delete medication
 */
async function deleteMedication(medId) {
  if (!confirm('Sei sicuro di voler eliminare questo farmaco?')) return;
  
  try {
    const response = await fetch('php/inventory_api.php?action=delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: medId }),
      cache: 'no-store'
    });
    
    const data = await response.json();
    if (data.success) {
      alert('Farmaco eliminato con successo');
      await loadAllData();
    } else {
      alert('Errore: ' + data.error);
    }
  } catch (error) {
    console.error('Error deleting medication:', error);
    alert('Errore durante l\'eliminazione');
  }
}

/**
 * Add stock to medication
 */
async function addStock(medId, amount) {
  try {
    const response = await fetch('php/inventory_api.php?action=add_stock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: medId, amount }),
      cache: 'no-store'
    });
    
    const data = await response.json();
    if (data.success) {
      alert(`Aggiunti ${amount} unit\u00e0`);
      await loadAllData();
    } else {
      alert('Errore: ' + data.error);
    }
  } catch (error) {
    console.error('Error adding stock:', error);
    alert('Errore durante l\'aggiornamento');
  }
}

/**
 * Dispense medication (reduce by 1)
 */
async function dispenseMedication(medId) {
  console.log('Dispensing medication:', medId, 'Type:', typeof medId);
  
  // Validate input
  if (!medId || medId === '' || medId === 'undefined' || medId === 'null') {
    console.log('No valid medication selected');
    return; 
  }
  
  // Find medication to verify it exists
  const medication = allMedications.find(m => m.id == medId);
  console.log('Found medication:', medication);
  
  if (!medication) {
    alert('Errore: Farmaco non trovato nell\'inventario');
    document.getElementById('prescriptionMedicationSelect').value = '';
    return;
  }
  
  if (medication.quantity <= 0) {
    alert('Errore: Farmaco non disponibile in magazzino');
    document.getElementById('prescriptionMedicationSelect').value = '';
    return;
  }
  
  try {
    console.log('Making API request to dispense medication:', medId);
    
    const response = await fetch('php/inventory_api.php?action=dispense', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: medId }),
      cache: 'no-store'
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('API Response:', data);
    
    if (data.success) {
      alert(`✓ ${data.message}`);
      await loadAllData(); // Reload all data to update UI
      // Clear selection after successful dispensing
      document.getElementById('prescriptionMedicationSelect').value = '';
    } else {
      alert('Errore: ' + (data.error || 'Errore sconosciuto'));
      document.getElementById('prescriptionMedicationSelect').value = '';
    }
  } catch (error) {
    console.error('Error dispensing medication:', error);
    alert('Errore durante la dispensazione: ' + error.message);
    document.getElementById('prescriptionMedicationSelect').value = '';
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
  return text.toString().replace(/[&<>"']/g, m => map[m]);
}
