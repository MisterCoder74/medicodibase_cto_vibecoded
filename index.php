<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Studio Medico - Sistema di Gestione</title>
    
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css" rel="stylesheet">
    
    <!-- Custom CSS -->
    <link href="css/style.css" rel="stylesheet">
</head>
<body>
    <!-- Header -->
    <header class="header">
        <div class="container">
            <h1><i class="bi bi-heart-pulse-fill"></i> Studio Medico</h1>
            <p class="lead">Sistema di Gestione Ambulatorio</p>
        </div>
    </header>

    <!-- Main Container -->
    <div class="main-container">
        <!-- Alerts -->
        <div id="alerts"></div>
        
        <!-- Navigation Tabs -->
        <ul class="nav nav-tabs" id="mainTabs" role="tablist">
            <li class="nav-item" role="presentation">
                <button class="nav-link active" id="patients-tab" data-bs-toggle="tab" data-bs-target="#patients" type="button" role="tab">
                    <i class="bi bi-people-fill"></i> Pazienti
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="prescriptions-tab" data-bs-toggle="tab" data-bs-target="#prescriptions" type="button" role="tab">
                    <i class="bi bi-file-medical-fill"></i> Ricette
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="appointments-tab" data-bs-toggle="tab" data-bs-target="#appointments" type="button" role="tab">
                    <i class="bi bi-calendar-check-fill"></i> Appuntamenti
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="inventory-tab" data-bs-toggle="tab" data-bs-target="#inventory" type="button" role="tab">
                    <i class="bi bi-box-seam"></i> Farmaci
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="sensitive-tab" data-bs-toggle="tab" data-bs-target="#sensitive" type="button" role="tab">
                    <i class="bi bi-exclamation-triangle-fill"></i> Pazienti Sensibili
                </button>
            </li>
        </ul>

        <!-- Tab Content -->
        <div class="tab-content" id="mainTabContent">
            
            <!-- Patients Tab -->
            <div class="tab-pane fade show active" id="patients" role="tabpanel">
                <div class="table-container">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h3><i class="bi bi-people-fill"></i> Gestione Pazienti</h3>
                        <button class="btn btn-primary" onclick="openPatientModal()">
                            <i class="bi bi-plus-circle"></i> Nuovo Paziente
                        </button>
                    </div>
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>Codice Fiscale</th>
                                    <th>Data Nascita</th>
                                    <th>Telefono</th>
                                    <th>Email</th>
                                    <th>Sensibile</th>
                                    <th>Azioni</th>
                                </tr>
                            </thead>
                            <tbody id="patientsTableBody">
                                <tr><td colspan="7" class="text-center">Caricamento...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Prescriptions Tab -->
            <div class="tab-pane fade" id="prescriptions" role="tabpanel">
                <div class="table-container">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h3><i class="bi bi-file-medical-fill"></i> Gestione Ricette</h3>
                        <button class="btn btn-primary" onclick="openPrescriptionModal()">
                            <i class="bi bi-plus-circle"></i> Nuova Ricetta
                        </button>
                    </div>
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>Paziente</th>
                                    <th>Data</th>
                                    <th>Farmaci</th>
                                    <th>Farmaco Dispensato</th>
                                    <th>Note</th>
                                    <th>Azioni</th>
                                </tr>
                            </thead>
                            <tbody id="prescriptionsTableBody">
                                <tr><td colspan="6" class="text-center">Caricamento...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Appointments Tab -->
            <div class="tab-pane fade" id="appointments" role="tabpanel">
                <div class="calendar-container">
                    <div class="calendar-header">
                        <h3 id="calendarMonth">Calendario</h3>
                        <div>
                            <button class="btn btn-outline-primary" id="prevMonth">
                                <i class="bi bi-chevron-left"></i>
                            </button>
                            <button class="btn btn-primary" id="todayBtn">Oggi</button>
                            <button class="btn btn-outline-primary" id="nextMonth">
                                <i class="bi bi-chevron-right"></i>
                            </button>
                            <button class="btn btn-success ms-3" onclick="openAppointmentModal()">
                                <i class="bi bi-plus-circle"></i> Nuovo Appuntamento
                            </button>
                        </div>
                    </div>
                    <div class="calendar-grid" id="calendarGrid">
                        <!-- Calendar will be rendered here -->
                    </div>
                </div>
            </div>

            <!-- Inventory Tab -->
            <div class="tab-pane fade" id="inventory" role="tabpanel">
                <div class="table-container">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h3><i class="bi bi-box-seam"></i> Gestione Farmaci</h3>
                        <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#medicationModal" 
                                onclick="clearMedicationForm()">
                            <i class="bi bi-plus-circle"></i> Aggiungi Farmaco
                        </button>
                    </div>
                    
                    <div class="alert alert-info">
                        <strong><i class="bi bi-info-circle"></i> Low Stock Alert:</strong> Farmaci con meno di 5 unità sono evidenziati in rosso.
                    </div>
                    
                    <div class="table-responsive">
                        <table class="table table-hover" id="inventoryTable">
                            <thead>
                                <tr>
                                    <th>Nome Farmaco</th>
                                    <th>Quantità</th>
                                    <th>Stato</th>
                                    <th>Azioni</th>
                                </tr>
                            </thead>
                            <tbody id="inventoryTableBody">
                                <tr><td colspan="4" class="text-center">Caricamento...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Sensitive Patients Tab -->
            <div class="tab-pane fade" id="sensitive" role="tabpanel">
                <div class="mb-4">
                    <h3>
                        <i class="bi bi-exclamation-triangle-fill text-danger"></i> 
                        Pazienti con Condizioni Sensibili
                    </h3>
                    <p class="text-muted">
                        Lista dei pazienti che richiedono attenzione particolare per condizioni mediche sensibili.
                    </p>
                </div>
                <div id="sensitivePatientsContainer">
                    <!-- Sensitive patients will be rendered here -->
                </div>
            </div>
        </div>
    </div>

    <!-- Patient Modal -->
    <div class="modal fade" id="patientModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="patientModalTitle">Nuovo Paziente</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="patientForm">
                        <input type="hidden" id="patientId">
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="patientName" class="form-label">Nome Completo *</label>
                                <input type="text" class="form-control" id="patientName" required>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="patientSSN" class="form-label">Codice Fiscale *</label>
                                <input type="text" class="form-control" id="patientSSN" required>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="patientDOB" class="form-label">Data di Nascita *</label>
                                <input type="date" class="form-control" id="patientDOB" required>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="patientPhone" class="form-label">Telefono</label>
                                <input type="tel" class="form-control" id="patientPhone">
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="patientAddress" class="form-label">Indirizzo</label>
                            <input type="text" class="form-control" id="patientAddress">
                        </div>
                        <div class="mb-3">
                            <label for="patientEmail" class="form-label">Email *</label>
                            <input type="email" class="form-control" id="patientEmail" required>
                        </div>
                        <div class="mb-3">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="patientSensitive" onchange="toggleSensitiveSection()">
                                <label class="form-check-label" for="patientSensitive">
                                    <strong>Paziente con condizioni sensibili</strong>
                                </label>
                            </div>
                        </div>
                        <div id="sensitiveSection" style="display: none;">
                            <div class="mb-3">
                                <label for="patientSensitiveNotes" class="form-label">Note Cliniche Importanti</label>
                                <textarea class="form-control" id="patientSensitiveNotes" rows="3" placeholder="Descrivi le condizioni mediche che richiedono attenzione particolare..."></textarea>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annulla</button>
                            <button type="submit" class="btn btn-primary">Salva</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- Prescription Modal -->
    <div class="modal fade" id="prescriptionModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="prescriptionModalTitle">Nuova Ricetta</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="prescriptionForm">
                        <input type="hidden" id="prescriptionId">
                        <div class="mb-3">
                            <label for="prescriptionPatientId" class="form-label">Paziente *</label>
                            <select class="form-select" id="prescriptionPatientId" required>
                                <option value="">Seleziona paziente...</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="prescriptionDate" class="form-label">Data *</label>
                            <input type="date" class="form-control" id="prescriptionDate" required>
                        </div>
                        <div class="mb-3">
                            <label for="prescriptionDrugs" class="form-label">Farmaci Prescritti *</label>
                            <textarea class="form-control" id="prescriptionDrugs" rows="5" required placeholder="Elenco dei farmaci con dosaggi e modalità di assunzione..."></textarea>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="prescriptionDosage" class="form-label">Posologia</label>
                                <input type="text" class="form-control" id="prescriptionDosage" placeholder="Es. 1 compressa al giorno">
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="prescriptionDuration" class="form-label">Durata</label>
                                <input type="text" class="form-control" id="prescriptionDuration" placeholder="Es. 7 giorni">
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="prescriptionNotes" class="form-label">Note</label>
                            <textarea class="form-control" id="prescriptionNotes" rows="3" placeholder="Note aggiuntive per il paziente..."></textarea>
                        </div>
                        <div class="mb-3">
                            <label for="prescriptionMedicationSelect" class="form-label">Dispensa Farmaco (Opzionale)</label>
                            <select class="form-select" id="prescriptionMedicationSelect">
                                <option value="">-- Seleziona farmaco da dispensare --</option>
                            </select>
                            <small class="text-muted">Il farmaco verrà dispensato al salvataggio della ricetta</small>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annulla</button>
                            <button type="submit" class="btn btn-primary">Salva</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- Appointment Modal -->
    <div class="modal fade" id="appointmentModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="appointmentModalTitle">Nuovo Appuntamento</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="appointmentForm">
                        <input type="hidden" id="appointmentId">
                        <div class="mb-3">
                            <label for="appointmentPatientId" class="form-label">Paziente *</label>
                            <select class="form-select" id="appointmentPatientId" required>
                                <option value="">Seleziona paziente...</option>
                            </select>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="appointmentDate" class="form-label">Data *</label>
                                <input type="date" class="form-control" id="appointmentDate" required>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="appointmentTime" class="form-label">Ora *</label>
                                <input type="time" class="form-control" id="appointmentTime" required>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="appointmentReason" class="form-label">Motivo</label>
                            <input type="text" class="form-control" id="appointmentReason" placeholder="Motivo della visita...">
                        </div>
                        <div class="mb-3">
                            <label for="appointmentNotes" class="form-label">Note</label>
                            <textarea class="form-control" id="appointmentNotes" rows="2" placeholder="Note aggiuntive..."></textarea>
                        </div>
                        <div class="mb-3">
                            <label for="appointmentStatus" class="form-label">Stato</label>
                            <select class="form-select" id="appointmentStatus">
                                <option value="pending">In Attesa</option>
                                <option value="complete">Completato</option>
                                <option value="cancelled">Cancellato</option>
                                <option value="no_show">Non Presentato</option>
                            </select>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annulla</button>
                            <button type="submit" class="btn btn-primary">Salva</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- Day Appointments Modal -->
    <div class="modal fade" id="dayAppointmentsModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="dayAppointmentsTitle">Appuntamenti</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body" id="dayAppointmentsBody">
                    <!-- Day appointments will be rendered here -->
                </div>
            </div>
        </div>
    </div>

    <!-- Patient Detail Modal -->
    <div class="modal fade" id="patientDetailModal" tabindex="-1">
        <div class="modal-dialog modal-fullscreen">
            <div class="modal-content">
                <div class="modal-header">
                    <div>
                        <h5 class="modal-title mb-0">
                            <span id="detailPatientName"></span>
                        </h5>
                        <small class="text-white" id="detailPatientSubtitle"></small>
                    </div>
                    <div>
                        <button class="btn btn-sm btn-light me-2" onclick="printPatientRecord()">
                            <i class="bi bi-printer"></i> Stampa
                        </button>
                        <button type="button" class="btn btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                </div>

                <div class="modal-body">
                    <!-- Tab Navigation -->
                    <ul class="nav nav-tabs mb-3" role="tablist">
                        <li class="nav-item">
                            <a class="nav-link active" href="#overviewTab" role="tab" data-bs-toggle="tab">
                                <i class="bi bi-person"></i> Anagrafica
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#clinicalTab" role="tab" data-bs-toggle="tab">
                                <i class="bi bi-clipboard-pulse"></i> Patologie e Note
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#prescriptionsTab" role="tab" data-bs-toggle="tab">
                                <i class="bi bi-file-medical"></i> Ricette
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#appointmentsTab" role="tab" data-bs-toggle="tab">
                                <i class="bi bi-calendar-check"></i> Appuntamenti
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#documentsTab" role="tab" data-bs-toggle="tab">
                                <i class="bi bi-folder"></i> Allegati
                            </a>
                        </li>
                    </ul>

                    <!-- Tab Content -->
                    <div class="tab-content">

                        <!-- Tab 1: Overview (Anagrafica) -->
                        <div class="tab-pane fade show active" id="overviewTab">
                            <div class="row">
                                <div class="col-md-3">
                                    <div class="patient-avatar text-center mb-3">
                                        <div class="avatar-placeholder">
                                            <i class="bi bi-person"></i>
                                        </div>
                                        <span id="detailStatusBadge" class="badge mt-2"></span>
                                    </div>
                                    <div class="card mb-3">
                                        <div class="card-body text-center">
                                            <h6 class="card-subtitle mb-2 text-muted">Azioni Rapide</h6>
                                            <div class="d-grid gap-2">
                                                <button class="btn btn-outline-primary btn-sm" id="editOverviewBtn" onclick="toggleEditMode('overview')">
                                                    <i class="bi bi-pencil"></i> Modifica Anagrafica
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-9">
                                    <form id="overviewForm">
                                        <div class="row mb-3">
                                            <div class="col-md-6">
                                                <label class="form-label">Nome Completo</label>
                                                <input type="text" class="form-control" id="detailPatientNameInput" disabled>
                                            </div>
                                            <div class="col-md-6">
                                                <label class="form-label">Codice Fiscale</label>
                                                <input type="text" class="form-control" id="detailSSN" disabled>
                                            </div>
                                        </div>
                                        <div class="row mb-3">
                                            <div class="col-md-6">
                                                <label class="form-label">Email</label>
                                                <input type="email" class="form-control" id="detailEmail" disabled>
                                            </div>
                                            <div class="col-md-6">
                                                <label class="form-label">Telefono</label>
                                                <input type="tel" class="form-control" id="detailPhone" disabled>
                                            </div>
                                        </div>
                                        <div class="row mb-3">
                                            <div class="col-md-6">
                                                <label class="form-label">Data di Nascita</label>
                                                <input type="date" class="form-control" id="detailDOB" disabled>
                                            </div>
                                            <div class="col-md-6">
                                                <label class="form-label">Indirizzo</label>
                                                <input type="text" class="form-control" id="detailAddress" disabled>
                                            </div>
                                        </div>
                                        <div class="row mb-3">
                                            <div class="col-md-6">
                                                <div class="form-check">
                                                    <input class="form-check-input" type="checkbox" id="detailStatus" disabled>
                                                    <label class="form-check-label" for="detailStatus">Paziente Attivo</label>
                                                </div>
                                            </div>
                                            <div class="col-md-6">
                                                <div class="form-check">
                                                    <input class="form-check-input" type="checkbox" id="detailSensitive" disabled>
                                                    <label class="form-check-label" for="detailSensitive">Paziente Sensibile</label>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="row mb-3">
                                            <div class="col-md-6">
                                                <small class="text-muted">Creato: <span id="detailCreatedDate"></span></small>
                                            </div>
                                            <div class="col-md-6">
                                                <small class="text-muted">Aggiornato: <span id="detailUpdatedDate"></span></small>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>

                        <!-- Tab 2: Clinical Data (Patologie e Note) -->
                        <div class="tab-pane fade" id="clinicalTab">
                            <div id="sensitiveWarning" class="alert alert-warning d-none">
                                <i class="bi bi-exclamation-triangle-fill"></i>
                                <strong>Attenzione:</strong> Questo è un paziente sensibile - gestire con particolare cura.
                            </div>
                            <div class="card mb-4">
                                <div class="card-header d-flex justify-content-between align-items-center">
                                    <h6 class="mb-0"><i class="bi bi-clipboard-pulse"></i> Note Cliniche e Storia Medica</h6>
                                    <button class="btn btn-sm btn-outline-primary" id="editClinicalBtn" onclick="toggleEditMode('clinical')">
                                        <i class="bi bi-pencil"></i> Modifica
                                    </button>
                                </div>
                                <div class="card-body">
                                    <textarea class="form-control" id="clinicalNotes" rows="12" disabled
                                        placeholder="Inserisci note cliniche, storia medica, allergie, patologie, ecc..."></textarea>
                                    <div class="mt-2">
                                        <small class="text-muted">Ultimo aggiornamento: <span id="lastUpdatedDate">N/A</span></small>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Tab 3: Prescriptions -->
                        <div class="tab-pane fade" id="prescriptionsTab">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h5><i class="bi bi-file-medical"></i> Ricette Prescritte</h5>
                                <button class="btn btn-primary" onclick="addPrescriptionFromDetail()">
                                    <i class="bi bi-plus-circle"></i> Nuova Ricetta
                                </button>
                            </div>
                            <div class="table-responsive">
                                <table class="table table-hover" id="patientPrescriptionsTable">
                                    <thead>
                                        <tr>
                                            <th>Data</th>
                                            <th>Farmaci</th>
                                            <th>Posologia</th>
                                            <th>Durata</th>
                                            <th>Farmaco Dispensato</th>
                                            <th>Note</th>
                                            <th>Azioni</th>
                                        </tr>
                                    </thead>
                                    <tbody></tbody>
                                </table>
                            </div>
                            <div id="prescriptionsEmpty" class="text-center text-muted py-4 d-none">
                                <i class="bi bi-file-medical" style="font-size: 3rem;"></i>
                                <p class="mt-2">Nessuna ricetta prescritta</p>
                            </div>
                        </div>

                        <!-- Tab 4: Appointments -->
                        <div class="tab-pane fade" id="appointmentsTab">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h5><i class="bi bi-calendar-check"></i> Appuntamenti</h5>
                                <button class="btn btn-primary" onclick="addAppointmentFromDetail()">
                                    <i class="bi bi-plus-circle"></i> Nuovo Appuntamento
                                </button>
                            </div>
                            <div class="table-responsive">
                                <table class="table table-hover" id="patientAppointmentsTable">
                                    <thead>
                                        <tr>
                                            <th>Data</th>
                                            <th>Ora</th>
                                            <th>Motivo</th>
                                            <th>Stato</th>
                                            <th>Note</th>
                                            <th>Azioni</th>
                                        </tr>
                                    </thead>
                                    <tbody></tbody>
                                </table>
                            </div>
                            <div id="appointmentsEmpty" class="text-center text-muted py-4 d-none">
                                <i class="bi bi-calendar-check" style="font-size: 3rem;"></i>
                                <p class="mt-2">Nessun appuntamento</p>
                            </div>
                        </div>

                        <!-- Tab 5: Documents -->
                        <div class="tab-pane fade" id="documentsTab">
                            <div class="row">
                                <div class="col-md-4">
                                    <div class="card mb-4">
                                        <div class="card-header">
                                            <h6 class="mb-0"><i class="bi bi-cloud-upload"></i> Carica Documento</h6>
                                        </div>
                                        <div class="card-body">
                                            <div class="mb-3">
                                                <label class="form-label">Categoria</label>
                                                <select class="form-select" id="documentCategory">
                                                    <option value="Diagnosis">Diagnosi</option>
                                                    <option value="Lab Results">Esami di Laboratorio</option>
                                                    <option value="Imaging">Immagini Diagnostiche</option>
                                                    <option value="Prescription">Ricette</option>
                                                    <option value="Other">Altro</option>
                                                </select>
                                            </div>
                                            <div class="mb-3">
                                                <label class="form-label">File (Max 5MB)</label>
                                                <input type="file" class="form-control" id="documentFileInput"
                                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx">
                                                <small class="text-muted">Formati: PDF, JPG, PNG, DOC, DOCX</small>
                                            </div>
                                            <button class="btn btn-success w-100" onclick="uploadPatientDocument()">
                                                <i class="bi bi-upload"></i> Carica Documento
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-8">
                                    <h5 class="mb-3"><i class="bi bi-folder"></i> Documenti Caricati</h5>
                                    <div id="documentsList">
                                        <div class="text-center text-muted py-4">
                                            <i class="bi bi-folder" style="font-size: 3rem;"></i>
                                            <p class="mt-2">Nessun documento caricato</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                <div class="modal-footer">
                    <div class="me-auto" id="editModeActions" style="display: none;">
                        <button type="button" class="btn btn-secondary" onclick="cancelEditMode()">
                            <i class="bi bi-x-circle"></i> Annulla
                        </button>
                        <button type="button" class="btn btn-success" onclick="savePatientChanges()">
                            <i class="bi bi-check-circle"></i> Salva Modifiche
                        </button>
                    </div>
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                        <i class="bi bi-x-lg"></i> Chiudi
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Medication Modal -->
    <div class="modal fade" id="medicationModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="medicationModalTitle">Aggiungi Farmaco</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="medicationForm">
                        <input type="hidden" id="medicationId">
                        <div class="mb-3">
                            <label for="medicationName" class="form-label">Nome Farmaco *</label>
                            <input type="text" class="form-control" id="medicationName" placeholder="es. Paracetamolo 500mg" required>
                        </div>
                        <div class="mb-3">
                            <label for="medicationQuantity" class="form-label">Quantità *</label>
                            <input type="number" class="form-control" id="medicationQuantity" min="0" placeholder="0" required>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annulla</button>
                            <button type="submit" class="btn btn-primary" id="saveMedicationBtn">Salva</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- Bootstrap 5 JS Bundle -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- Custom JS -->
   <script src="js/app.js?v=<?= time() ?>"></script>
</body>
</html>
