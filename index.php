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
                                    <th>Note</th>
                                    <th>Azioni</th>
                                </tr>
                            </thead>
                            <tbody id="prescriptionsTableBody">
                                <tr><td colspan="5" class="text-center">Caricamento...</td></tr>
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
                        <div class="mb-3">
                            <label for="prescriptionNotes" class="form-label">Note</label>
                            <textarea class="form-control" id="prescriptionNotes" rows="3" placeholder="Note aggiuntive per il paziente..."></textarea>
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

    <!-- Bootstrap 5 JS Bundle -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- Custom JS -->
    <script src="js/app.js"></script>
</body>
</html>
