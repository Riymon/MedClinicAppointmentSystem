// Make loadDashboard function available globally
let loadDashboard;

document.addEventListener('DOMContentLoaded', () => {
    const datePicker = document.getElementById('datePicker');
    const todayValueElement = document.querySelector('.stat-card.today .stat-value');
    const menuBtn = document.getElementById('menu-btn');
    const menu = document.getElementById('menu');
    const mainContent = document.querySelector('.admin-main');
    const dashboardLink = document.getElementById('dashboardLink');

    // Initialize Today's date with proper formatting (Month Day)
    const today = new Date();
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const formattedToday = `${months[today.getMonth()]} ${today.getDate()}`;
    todayValueElement.textContent = formattedToday;
    datePicker.value = today.toISOString().split('T')[0];

    // Define loadDashboard function
    loadDashboard = function() {
        // Reset the main content to the original dashboard
        mainContent.innerHTML = `
            <h1 class="dashboard-title">Appointments Overview</h1>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-content">
                        <div>
                            <div class="stat-value"></div>
                            <div class="stat-label">All</div>
                        </div>
                        <img src="pics/all.png" class="stat-icon" alt="Calendar">
                    </div>
                </div>
                <div class="stat-card new">
                    <div class="stat-content">
                        <div>
                            <div class="stat-value"></div>
                            <div class="stat-label">New</div>
                        </div>
                        <img src="pics/new.png" class="stat-icon" alt="New">
                    </div>
                </div>
                <div class="stat-card today">
                    <div class="stat-content">
                        <div>
                            <div class="stat-value"></div>
                            <div class="stat-label">Today</div>
                        </div>
                        <img src="pics/today.png" class="stat-icon" alt="Today">
                    </div>
                </div>
                <div class="stat-card cancelled">
                    <div class="stat-content">
                        <div>
                            <div class="stat-value"></div>
                            <div class="stat-label">Cancelled</div>
                        </div>
                        <img src="pics/cancelled.jpg" class="stat-icon" alt="Cancelled">
                    </div>
                </div>
            </div>
            <div class="dashboard-content">
                <div class="chart-container">
                    <h2>Appointments</h2>
                    <canvas id="appointmentsChart"></canvas>
                </div>
                <div class="sidebar">
                    <div class="calendar-card">
                        <h3>Date</h3>
                        <div class="date-picker-container">
                            <input type="date" id="datePicker" style="padding: 0.5rem; border: 1px solid #ccc; border-radius: 6px;">
                        </div>
                        <div id="calendar"></div>
                        <div class="date-appointments">
                            <div id="date-appointments-list" class="appointments-list">
                            </div>
                        </div>
                    </div>
                    <div class="specialization-card">
                        <h3>Appointment Booked</h3>
                        <canvas id="specializationChart"></canvas>
                        <div class="legend">
                            <div><span class="cardiology-dot"></span> Cardiology </div>
                            <div><span class="neurology-dot"></span> Neurology </div>
                            <div><span class="generalmedecine-dot"></span> General Medecine </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Reinitialize the charts and calendar
        initAppointmentsChart();
        initSpecializationChart();
        initCalendar();
    };

    // Make loadDashboard available globally
    window.loadDashboard = loadDashboard;

    // Update date picker change event to use same formatting
    datePicker.addEventListener('change', function () {
        const selectedDate = new Date(this.value);
        const formattedDate = `${months[selectedDate.getMonth()]} ${selectedDate.getDate()}`;
        todayValueElement.textContent = formattedDate;
    });

    // Menu toggle functionality
    menuBtn.addEventListener('click', () => {
        menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
    });

    // Close menu when clicking outside
    document.addEventListener('click', (event) => {
        if (!menu.contains(event.target) && !menuBtn.contains(event.target)) {
            menu.style.display = 'none';
        }
    });

    // Handle menu item clicks
    document.querySelectorAll('.menu li a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all links
            document.querySelectorAll('.menu li a').forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            link.classList.add('active');
            
            // Hide menu on mobile
            menu.style.display = 'none';
            
            // Handle different menu items
            const section = link.getAttribute('href').substring(1);
            
            // Always call loadSection which will handle dashboard and other sections
            loadSection(section);
        });
    });

    // Dashboard navigation from logo
    dashboardLink.addEventListener('click', (e) => {
        e.preventDefault();
        // Remove active class from all menu items
        document.querySelectorAll('.menu li a').forEach(l => l.classList.remove('active'));
        // Add active class to dashboard menu item
        document.getElementById('dashboardMenuLink').classList.add('active');
        // Load dashboard through loadSection
        loadSection('dashboard');
    });

    function loadSection(section) {
        // Clear any existing content first
        mainContent.innerHTML = '';
        
        if (section === 'dashboard') {
            loadDashboard();
            return;
        }

        // Update page title
        const title = document.createElement('h1');
        title.className = 'section-title';
        title.textContent = section.charAt(0).toUpperCase() + section.slice(1).replace(/-/g, ' ');
        
        // Here you would typically load the content for each section
        switch(section) {
            case 'appointments':
                loadAppointmentsSection();
                break;
            case 'patients':
                loadPatientsSection();
                break;
            case 'doctors':
                loadDoctorsSection();
                break;
            case 'payments':
                loadPaymentsSection();
                break;
            case 'update-info':
                loadUpdateInfoSection();
                break;
            case 'create-account':
                loadCreateAccountSection();
                break;
            default:
                loadDashboard();
                break;
        }
    }

    function loadAppointmentsSection() {
        mainContent.innerHTML = `
            <div class="section-header">
                <h1 class="section-title">Appointment Management</h1>
                <div class="section-actions">
                    <button class="action-btn primary" onclick="openAppointmentModal('new')">Book New Appointment</button>
                </div>
            </div>
            <div class="search-filters">
                <div class="filter-group">
                <input type="text" id="appointmentSearch" placeholder="Search appointments...">
                    <select id="searchType">
                        <option value="all">All Fields</option>
                        <option value="patient">Patient Name</option>
                        <option value="doctor">Doctor Name</option>
                    </select>
                </div>
                <div class="filter-group">
                <select id="statusFilter">
                    <option value="">All Status</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
                    <select id="timeFrameFilter">
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                </select>
                <input type="date" id="dateFilter">
                </div>
            </div>
            <div class="appointments-table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Patient Name</th>
                            <th>Doctor</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Type</th>
                            <th>Purpose</th>
                            <th>Status</th>
                            <th>Last Updated</th>
                            <th>Updated By</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="appointmentsTableBody">
                        <!-- Data will be loaded here -->
                    </tbody>
                </table>
            </div>

            <!-- Appointment Modal -->
            <div id="appointmentModal" class="modal" style="display: none;">
                <div class="modal-content">
                    <h2 id="modalTitle">Book New Appointment</h2>
                    <form id="appointmentForm">
                        <div class="form-group">
                            <label for="patientSelect">Patient</label>
                            <select id="patientSelect" required>
                                <option value="">Select Patient</option>
                            </select>
                            <button type="button" onclick="openQuickPatientRegistration()" class="secondary-btn">Quick Register</button>
                        </div>
                        <div class="form-group">
                            <label for="doctorSelect">Doctor</label>
                            <select id="doctorSelect" required>
                                <option value="">Select Doctor</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="appointmentDate">Date</label>
                            <input type="date" id="appointmentDate" required>
                        </div>
                        <div class="form-group">
                            <label for="appointmentTime">Time</label>
                            <select id="appointmentTime" required>
                                <option value="">Select Time</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="appointmentType">Type</label>
                            <select id="appointmentType" required>
                                <option value="consultation">Consultation</option>
                                <option value="followup">Follow-up</option>
                                <option value="procedure">Procedure</option>
                                <option value="checkup">Regular Check-up</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="appointmentPurpose">Purpose</label>
                            <textarea id="appointmentPurpose" required></textarea>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="action-btn primary">Save Appointment</button>
                            <button type="button" onclick="closeAppointmentModal()" class="action-btn">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        // Initialize the appointment management features
        initializeAppointmentManagement();
    }

    function initializeAppointmentManagement() {
        // Load initial data
        loadAppointmentsData();
        
        // Set up event listeners for filters
        document.getElementById('appointmentSearch').addEventListener('input', filterAppointments);
        document.getElementById('statusFilter').addEventListener('change', filterAppointments);
        document.getElementById('timeFrameFilter').addEventListener('change', filterAppointments);
        document.getElementById('dateFilter').addEventListener('change', filterAppointments);
        
        // Set up form submission handler
        document.getElementById('appointmentForm').addEventListener('submit', handleAppointmentSubmit);
        
        // Load doctors and patients for dropdowns
        loadDoctorsForAppointments();
        loadPatientsForAppointments();
    }

    function loadAppointmentsData() {
        // Simulated data - replace with actual API call
        const appointments = [
            {
                id: 1,
                patientName: "John Doe",
                doctor: "Dr. Smith",
                date: "2024-03-20",
                time: "10:00 AM",
                type: "consultation",
                purpose: "Regular checkup",
                status: "scheduled",
                lastUpdated: "2024-03-19 15:30",
                updatedBy: "Admin User"
            },
            {
                id: 2,
                patientName: "Jane Smith",
                doctor: "Dr. Johnson",
                date: "2024-03-20",
                time: "11:30 AM",
                type: "followup",
                purpose: "Review test results",
                status: "completed",
                lastUpdated: "2024-03-20 12:00",
                updatedBy: "Dr. Johnson"
            }
        ];
        
        const tableBody = document.getElementById('appointmentsTableBody');
        tableBody.innerHTML = appointments.map(appointment => `
            <tr>
                <td>${appointment.patientName}</td>
                <td>${appointment.doctor}</td>
                <td>${appointment.date}</td>
                <td>${appointment.time}</td>
                <td>${appointment.type}</td>
                <td>${appointment.purpose}</td>
                <td><span class="status-badge ${appointment.status}">${appointment.status}</span></td>
                <td>${appointment.lastUpdated}</td>
                <td>${appointment.updatedBy}</td>
                <td>
                    <button onclick="viewAppointment(${appointment.id})" class="icon-btn view" title="Assign appointments">👁️</button>
                    <button onclick="editAppointment(${appointment.id})" class="icon-btn edit" title="Edit">✏️</button>
                    <button onclick="rescheduleAppointment(${appointment.id})" class="icon-btn reschedule" title="Reschedule">📅</button>
                    <button onclick="cancelAppointment(${appointment.id})" class="icon-btn cancel" title="Cancel">❌</button>
                </td>
            </tr>
        `).join('');
    }

    function openAppointmentModal(mode, appointmentId = null) {
        const modal = document.getElementById('appointmentModal');
        const modalTitle = document.getElementById('modalTitle');
        
        modalTitle.textContent = mode === 'new' ? 'Book New Appointment' : 'Edit Appointment';
        modal.style.display = 'block';
        
        if (appointmentId) {
            // Load appointment data for editing
            loadAppointmentData(appointmentId);
        }
    }

    function closeAppointmentModal() {
        document.getElementById('appointmentModal').style.display = 'none';
        document.getElementById('appointmentForm').reset();
    }

    function handleAppointmentSubmit(e) {
        e.preventDefault();
        // Gather form data and submit to backend
        const formData = {
            patient: document.getElementById('patientSelect').value,
            doctor: document.getElementById('doctorSelect').value,
            date: document.getElementById('appointmentDate').value,
            time: document.getElementById('appointmentTime').value,
            type: document.getElementById('appointmentType').value,
            purpose: document.getElementById('appointmentPurpose').value
        };
        
        // Submit to backend and handle response
        console.log('Submitting appointment:', formData);
        closeAppointmentModal();
        loadAppointmentsData(); // Refresh the table
    }

    function filterAppointments() {
        // Implement filtering logic based on search and filter values
        const searchTerm = document.getElementById('appointmentSearch').value.toLowerCase();
        const status = document.getElementById('statusFilter').value;
        const timeFrame = document.getElementById('timeFrameFilter').value;
        const date = document.getElementById('dateFilter').value;
        
        // Apply filters and update the table
        loadAppointmentsData(); // This should be modified to use the filter parameters
    }

    function generateAppointmentReport() {
        // Implement report generation logic
        alert('Generating appointment report...');
    }

    function viewAppointment(id) {
        // Implement appointment viewing logic
        console.log('Viewing appointment:', id);
    }

    function editAppointment(id) {
        openAppointmentModal('edit', id);
    }

    function rescheduleAppointment(id) {
        // Implement rescheduling logic
        console.log('Rescheduling appointment:', id);
    }

    function cancelAppointment(id) {
        if (confirm('Are you sure you want to cancel this appointment?')) {
            // Implement cancellation logic
            console.log('Cancelling appointment:', id);
        }
    }

    function loadDoctorsForAppointments() {
        // Load doctors for the dropdown
        const doctorSelect = document.getElementById('doctorSelect');
        if (doctorSelect) {
            // Simulated data - replace with actual API call
            const doctors = [
                { id: 1, name: "Dr. Smith" },
                { id: 2, name: "Dr. Johnson" }
            ];
            
            doctorSelect.innerHTML = '<option value="">Select Doctor</option>' +
                doctors.map(doctor => `<option value="${doctor.id}">${doctor.name}</option>`).join('');
        }
    }

    function loadPatientsForAppointments() {
        // Load patients for the dropdown
        const patientSelect = document.getElementById('patientSelect');
        if (patientSelect) {
            // Simulated data - replace with actual API call
            const patients = [
                { id: 1, name: "John Doe" },
                { id: 2, name: "Jane Smith" }
            ];
            
            patientSelect.innerHTML = '<option value="">Select Patient</option>' +
                patients.map(patient => `<option value="${patient.id}">${patient.name}</option>`).join('');
        }
    }

    function openQuickPatientRegistration() {
        // Implement quick patient registration modal
        alert('Opening quick patient registration...');
    }

    function loadPatientsSection() {
        mainContent.innerHTML = `
            <div class="section-header">
                <h1 class="section-title">Patient Management</h1>
                <div class="section-actions">
                    <button class="action-btn primary" onclick="openPatientModal('new')">Add New Patient</button>
                </div>
            </div>
            <div class="search-filters">
                <div class="filter-group">
                <input type="text" id="patientSearch" placeholder="Search patients...">
                    <select id="searchType">
                        <option value="all">All Fields</option>
                        <option value="name">Name</option>
                        <option value="id">Patient ID</option>
                        <option value="phone">Phone</option>
                        <option value="email">Email</option>
                </select>
                </div>
                <div class="filter-group">
                    <select id="statusFilter">
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </div>
            <div class="patients-grid">
                <!-- Patient cards will be dynamically added here -->
            </div>

            <!-- Patient Modal -->
            <div id="patientModal" class="modal" style="display: none;">
                <div class="modal-content">
                    <h2 id="modalTitle">Add New Patient</h2>
                    <form id="patientForm">
                        <div class="form-section">
                            <h3>Personal Information</h3>
                            <div class="form-group">
                                <label for="patientName">Full Name</label>
                                <input type="text" id="patientName" required>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="patientDOB">Date of Birth</label>
                                    <input type="date" id="patientDOB" required>
                                </div>
                                <div class="form-group">
                                    <label for="patientGender">Gender</label>
                                    <select id="patientGender" required>
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="form-section">
                            <h3>Contact Information</h3>
                            <div class="form-group">
                                <label for="patientPhone">Phone Number</label>
                                <input type="tel" id="patientPhone" required>
                            </div>
                            <div class="form-group">
                                <label for="patientEmail">Email</label>
                                <input type="email" id="patientEmail">
                            </div>
                            <div class="form-group">
                                <label for="patientAddress">Address</label>
                                <textarea id="patientAddress" required></textarea>
                            </div>
                        </div>
                        <div class="form-section">
                            <h3>Medical Information</h3>
                            <div class="form-group">
                                <label for="patientBloodGroup">Blood Group</label>
                                <select id="patientBloodGroup" required>
                                    <option value="">Select Blood Group</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="patientAllergies">Allergies</label>
                                <textarea id="patientAllergies" placeholder="List any known allergies"></textarea>
                            </div>
                            <div class="form-group">
                                <label for="patientMedicalHistory">Medical History</label>
                                <textarea id="patientMedicalHistory" placeholder="Previous conditions, surgeries, etc."></textarea>
                            </div>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="action-btn primary">Save Patient</button>
                            <button type="button" onclick="closePatientModal()" class="action-btn">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Patient Details Modal -->
            <div id="patientDetailsModal" class="modal" style="display: none;">
                <div class="modal-content">
                    <h2>Patient Details</h2>
                    <div class="patient-details-content">
                        <!-- Content will be dynamically loaded -->
                    </div>
                    <div class="patient-history-tabs">
                        <button class="tab-btn active" data-tab="appointments">Appointments History</button>
                        <button class="tab-btn" data-tab="payments">Payment History</button>
                        <button class="tab-btn" data-tab="medical">Medical History</button>
                    </div>
                    <div class="patient-history-content">
                        <!-- Tab content will be dynamically loaded -->
                    </div>
                    <div class="modal-actions">
                        <button onclick="editPatient(currentPatientId)" class="action-btn">Edit</button>
                        <button onclick="closePatientDetailsModal()" class="action-btn">Close</button>
                    </div>
                </div>
            </div>
        `;
        
        initializePatientManagement();
    }

    function initializePatientManagement() {
        // Load initial data
        loadPatientsData();
        
        // Set up event listeners for filters
        document.getElementById('patientSearch').addEventListener('input', filterPatients);
        document.getElementById('statusFilter').addEventListener('change', filterPatients);
        
        // Set up form submission handler
        document.getElementById('patientForm').addEventListener('submit', handlePatientSubmit);
        
        // Set up tab switching in patient details
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => switchPatientHistoryTab(btn.dataset.tab));
        });
    }

    function loadPatientsData() {
        // Simulated data - replace with actual API call
        const patients = [
            {
                id: 1,
                name: "John Doe",
                age: 45,
                gender: "Male",
                phone: "555-0123",
                email: "john@example.com",
                bloodGroup: "O+",
                lastVisit: "2024-03-15",
                status: "active",
                createdAt: "2024-01-15 10:00:00",
                updatedBy: "Dr. Smith",
                updatedAt: "2024-03-15 15:30:00"
            },
            {
                id: 2,
                name: "Jane Smith",
                age: 32,
                gender: "Female",
                phone: "555-0124",
                email: "jane@example.com",
                bloodGroup: "A+",
                lastVisit: "2024-03-18",
                status: "active",
                createdAt: "2024-02-01 09:15:00",
                updatedBy: "Dr. Johnson",
                updatedAt: "2024-03-18 14:20:00"
            }
        ];

        const patientsGrid = document.querySelector('.patients-grid');
        patientsGrid.innerHTML = patients.map(patient => `
            <div class="patient-card">
                <div class="patient-info">
                    <h3>${patient.name}</h3>
                    <p>ID: PAT-${String(patient.id).padStart(4, '0')}</p>
                    <p>Age: ${patient.age} | Gender: ${patient.gender}</p>
                    <p>Blood Group: ${patient.bloodGroup}</p>
                    <p>Phone: ${patient.phone}</p>
                    <p>Last Visit: ${patient.lastVisit}</p>
                    <p class="record-info">Created: ${patient.createdAt}</p>
                    <p class="record-info">Last Updated: ${patient.updatedAt} by ${patient.updatedBy}</p>
                    <span class="status-badge ${patient.status}">${patient.status}</span>
                </div>
                <div class="patient-actions">
                    <button onclick="viewPatient(${patient.id})" class="action-btn">View Details</button>
                    <button onclick="editPatient(${patient.id})" class="action-btn">Edit</button>
                </div>
            </div>
        `).join('');
    }

    function openPatientModal(mode, patientId = null) {
        const modal = document.getElementById('patientModal');
        const modalTitle = document.getElementById('modalTitle');
        
        modalTitle.textContent = mode === 'new' ? 'Add New Patient' : 'Edit Patient';
        modal.style.display = 'block';
        
        if (patientId) {
            // Load patient data for editing
            loadPatientData(patientId);
        }
    }

    function closePatientModal() {
        document.getElementById('patientModal').style.display = 'none';
        document.getElementById('patientForm').reset();
    }

    function handlePatientSubmit(e) {
        e.preventDefault();
        // Gather form data and submit to backend
        const formData = {
            name: document.getElementById('patientName').value,
            dob: document.getElementById('patientDOB').value,
            gender: document.getElementById('patientGender').value,
            phone: document.getElementById('patientPhone').value,
            email: document.getElementById('patientEmail').value,
            address: document.getElementById('patientAddress').value,
            bloodGroup: document.getElementById('patientBloodGroup').value,
            allergies: document.getElementById('patientAllergies').value,
            medicalHistory: document.getElementById('patientMedicalHistory').value
        };
        
        // Submit to backend and handle response
        console.log('Submitting patient data:', formData);
        closePatientModal();
        loadPatientsData(); // Refresh the grid
    }

    function viewPatient(id) {
        const modal = document.getElementById('patientDetailsModal');
        modal.style.display = 'block';
        loadPatientDetails(id);
    }

    function loadPatientDetails(id) {
        // Simulated data - replace with actual API call
        const patient = {
            id: id,
            name: "John Doe",
            age: 45,
            gender: "Male",
            phone: "555-0123",
            email: "john@example.com",
            address: "123 Main St",
            bloodGroup: "O+",
            allergies: "Penicillin",
            medicalHistory: "Hypertension",
            appointments: [
                { 
                    date: "2024-03-15", 
                    doctor: "Dr. Smith", 
                    purpose: "Check-up",
                    status: "completed",
                    updatedBy: "Dr. Smith",
                    updatedAt: "2024-03-15 16:00:00"
                },
                { 
                    date: "2024-02-28", 
                    doctor: "Dr. Johnson", 
                    purpose: "Follow-up",
                    status: "completed",
                    updatedBy: "Dr. Johnson",
                    updatedAt: "2024-02-28 15:30:00"
                }
            ],
            payments: [
                { 
                    date: "2024-03-15", 
                    amount: 150, 
                    status: "paid",
                    appointmentId: "APT-001",
                    updatedBy: "Admin",
                    updatedAt: "2024-03-15 16:30:00"
                },
                { 
                    date: "2024-02-28", 
                    amount: 75, 
                    status: "paid",
                    appointmentId: "APT-002",
                    updatedBy: "Admin",
                    updatedAt: "2024-02-28 16:00:00"
                }
            ]
        };

        const detailsContent = document.querySelector('.patient-details-content');
        detailsContent.innerHTML = `
            <div class="details-section">
                <h3>Personal Information</h3>
                <p><strong>Name:</strong> ${patient.name}</p>
                <p><strong>Age:</strong> ${patient.age}</p>
                <p><strong>Gender:</strong> ${patient.gender}</p>
                <p><strong>Blood Group:</strong> ${patient.bloodGroup}</p>
            </div>
            <div class="details-section">
                <h3>Contact Information</h3>
                <p><strong>Phone:</strong> ${patient.phone}</p>
                <p><strong>Email:</strong> ${patient.email}</p>
                <p><strong>Address:</strong> ${patient.address}</p>
            </div>
            <div class="details-section">
                <h3>Medical Information</h3>
                <p><strong>Allergies:</strong> ${patient.allergies}</p>
                <p><strong>Medical History:</strong> ${patient.medicalHistory}</p>
            </div>
        `;

        // Load the first tab by default
        switchPatientHistoryTab('appointments', patient);
    }

    function switchPatientHistoryTab(tab, patientData) {
        // Update active tab
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });

        const contentDiv = document.querySelector('.patient-history-content');
        let content = '';

        switch(tab) {
            case 'appointments':
                content = `
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Doctor</th>
                                <th>Purpose</th>
                                <th>Status</th>
                                <th>Last Updated</th>
                                <th>Updated By</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${patientData.appointments.map(apt => `
                                <tr>
                                    <td>${apt.date}</td>
                                    <td>${apt.doctor}</td>
                                    <td>${apt.purpose}</td>
                                    <td><span class="status-badge ${apt.status}">${apt.status}</span></td>
                                    <td>${apt.updatedAt}</td>
                                    <td>${apt.updatedBy}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
                break;
            case 'payments':
                content = `
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Appointment ID</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Last Updated</th>
                                <th>Updated By</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${patientData.payments.map(payment => `
                                <tr>
                                    <td>${payment.date}</td>
                                    <td>${payment.appointmentId}</td>
                                    <td>$${payment.amount}</td>
                                    <td><span class="status-badge ${payment.status}">${payment.status}</span></td>
                                    <td>${payment.updatedAt}</td>
                                    <td>${payment.updatedBy}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
                break;
            case 'medical':
                content = `
                    <div class="medical-history-section">
                        <h4>Allergies</h4>
                        <p>${patientData.allergies || 'No known allergies'}</p>
                        
                        <h4>Medical History</h4>
                        <p>${patientData.medicalHistory || 'No medical history recorded'}</p>
                    </div>
                `;
                break;
        }

        contentDiv.innerHTML = content;
    }

    function closePatientDetailsModal() {
        document.getElementById('patientDetailsModal').style.display = 'none';
    }

    function filterPatients() {
        const searchTerm = document.getElementById('patientSearch').value.toLowerCase();
        const status = document.getElementById('statusFilter').value;
        
        // Apply filters and update the grid
        loadPatientsData(); // This should be modified to use the filter parameters
    }

    function generatePatientReport() {
        // Implement report generation logic
        alert('Generating patient report...');
    }

    function bookAppointment(patientId) {
        // Open appointment booking modal with patient pre-selected
        openAppointmentModal('new');
        document.getElementById('patientSelect').value = patientId;
    }

    function loadDoctorsSection() {
        mainContent.innerHTML = `
            <div class="section-header">
                <h1 class="section-title">Doctor/Staff Management</h1>
                <div class="section-actions">
                    <button class="action-btn primary" onclick="openDoctorModal('new')">Add New Doctor/Staff</button>
                </div>
            </div>
            <div class="doctors-grid">
                <!-- Doctor cards will be dynamically added here -->
            </div>

            <!-- Doctor Assignment Modal -->
            <div id="doctorAssignmentModal" class="modal" style="display: none;">
                <div class="modal-content">
                    <h2>Assign Appointments</h2>
                    <div class="assignment-content">
                        <div class="doctor-details">
                            <!-- Doctor details will be shown here -->
                        </div>
                        <div class="available-appointments">
                            <h3>Available Appointments</h3>
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Patient</th>
                                        <th>Purpose</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody id="availableAppointmentsBody">
                                    <!-- Available appointments will be loaded here -->
                                </tbody>
                            </table>
                        </div>
                        <div class="assigned-appointments">
                            <h3>Assigned Appointments</h3>
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Patient</th>
                                        <th>Purpose</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody id="assignedAppointmentsBody">
                                    <!-- Assigned appointments will be loaded here -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button onclick="closeDoctorAssignmentModal()" class="action-btn">Close</button>
                    </div>
                </div>
            </div>
        `;
        
        loadDoctorsData();
    }

    function loadDoctorsData() {
        // Simulated data - replace with actual API call
        const doctors = [
            {
                id: 1,
                name: "Dr. Sarah Johnson",
                specialization: "Cardiology",
                licenseNumber: "MD12345",
                phone: "555-0101",
                email: "sarah.johnson@example.com",
                status: "active",
                schedule: {
                    workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
                    workingHours: { start: "09:00", end: "17:00" },
                    consultationDuration: 30
                },
                assignedAppointments: [
                    {
                        id: 1,
                        date: "2024-03-20",
                        time: "09:00",
                        patient: "John Doe",
                        purpose: "Check-up",
                        status: "scheduled"
                    }
                ]
            },
            {
                id: 2,
                name: "Dr. Michael Chen",
                specialization: "Neurology",
                licenseNumber: "MD12346",
                phone: "555-0102",
                email: "michael.chen@example.com",
                status: "active",
                schedule: {
                    workingDays: ["monday", "wednesday", "friday"],
                    workingHours: { start: "10:00", end: "18:00" },
                    consultationDuration: 45
                },
                assignedAppointments: []
            }
        ];

        const doctorsGrid = document.querySelector('.doctors-grid');
        doctorsGrid.innerHTML = doctors.map(doctor => `
            <div class="doctor-card">
                <div class="doctor-info">
                    <h3>${doctor.name}</h3>
                    <p>Specialization: ${doctor.specialization}</p>
                    <p>Schedule: ${doctor.schedule.workingDays.map(day => day.charAt(0).toUpperCase() + day.slice(1)).join(', ')}</p>
                    <p>Hours: ${doctor.schedule.workingHours.start} - ${doctor.schedule.workingHours.end}</p>
                    <p>Appointments Assigned: ${doctor.assignedAppointments.length}</p>
                    <span class="status-badge ${doctor.status}">${doctor.status}</span>
                </div>
                <div class="doctor-actions">
                    <button onclick="assignAppointments(${doctor.id})" class="action-btn primary">Assign Appointments</button>
                    <button onclick="editDoctor(${doctor.id})" class="action-btn">Edit</button>
                </div>
            </div>
        `).join('');
    }

    function assignAppointments(doctorId) {
        const modal = document.getElementById('doctorAssignmentModal');
        modal.style.display = 'block';
        loadDoctorAssignments(doctorId);
    }

    function loadDoctorAssignments(doctorId) {
        // Simulated data - replace with actual API call
        const availableAppointments = [
            {
                id: 1,
                date: "2024-03-21",
                time: "10:00",
                patient: "Alice Brown",
                purpose: "Consultation"
            },
            {
                id: 2,
                date: "2024-03-21",
                time: "11:00",
                patient: "Bob Wilson",
                purpose: "Follow-up"
            }
        ];

        const assignedAppointments = [
            {
                id: 3,
                date: "2024-03-20",
                time: "09:00",
                patient: "John Doe",
                purpose: "Check-up",
                status: "scheduled"
            }
        ];

        // Load doctor details
        const doctorDetails = document.querySelector('.doctor-details');
        doctorDetails.innerHTML = `
            <h3>Doctor Information</h3>
            <p><strong>Name:</strong> Dr. Sarah Johnson</p>
            <p><strong>Specialization:</strong> Cardiology</p>
            <p><strong>Schedule:</strong> Monday - Friday, 09:00 - 17:00</p>
        `;

        // Load available appointments
        const availableAppointmentsBody = document.getElementById('availableAppointmentsBody');
        availableAppointmentsBody.innerHTML = availableAppointments.map(apt => `
            <tr>
                <td>${apt.date}</td>
                <td>${apt.time}</td>
                <td>${apt.patient}</td>
                <td>${apt.purpose}</td>
                <td>
                    <button onclick="assignAppointmentToDoctor(${doctorId}, ${apt.id})" class="action-btn primary">Assign</button>
                </td>
            </tr>
        `).join('');

        // Load assigned appointments
        const assignedAppointmentsBody = document.getElementById('assignedAppointmentsBody');
        assignedAppointmentsBody.innerHTML = assignedAppointments.map(apt => `
            <tr>
                <td>${apt.date}</td>
                <td>${apt.time}</td>
                <td>${apt.patient}</td>
                <td>${apt.purpose}</td>
                <td><span class="status-badge ${apt.status}">${apt.status}</span></td>
                <td>
                    <button onclick="unassignAppointment(${doctorId}, ${apt.id})" class="action-btn">Unassign</button>
                </td>
            </tr>
        `).join('');
    }

    function assignAppointmentToDoctor(doctorId, appointmentId) {
        // Implementation for assigning appointment
        console.log(`Assigning appointment ${appointmentId} to doctor ${doctorId}`);
        // After successful assignment, reload the assignments
        loadDoctorAssignments(doctorId);
    }

    function unassignAppointment(doctorId, appointmentId) {
        if(confirm('Are you sure you want to unassign this appointment?')) {
            // Implementation for unassigning appointment
            console.log(`Unassigning appointment ${appointmentId} from doctor ${doctorId}`);
            // After successful unassignment, reload the assignments
            loadDoctorAssignments(doctorId);
        }
    }

    function closeDoctorAssignmentModal() {
        document.getElementById('doctorAssignmentModal').style.display = 'none';
    }

    function editDoctor(id) {
        openDoctorModal('edit', id);
    }

    function deleteDoctor(id) {
        if(confirm('Are you sure you want to delete this doctor?')) {
            // Implementation for deleting doctor
        }
    }

    function loadPaymentsSection() {
        mainContent.innerHTML = `
            <div class="section-header">
                <h1 class="section-title">Payment Management</h1>
                <div class="section-actions">
                    <button class="action-btn primary" onclick="createNewPayment()">Record Payment</button>
                </div>
            </div>
            <div class="payment-summary-cards">
                <div class="summary-card">
                    <h3>Total Revenue</h3>
                    <p class="amount">$<span id="totalRevenue">0.00</span></p>
                </div>
                <div class="summary-card">
                    <h3>Pending Payments</h3>
                    <p class="amount">$<span id="pendingAmount">0.00</span></p>
                </div>
                <div class="summary-card">
                    <h3>Today's Collections</h3>
                    <p class="amount">$<span id="todayCollections">0.00</span></p>
                </div>
            </div>
            <div class="search-filters">
                <input type="text" id="paymentSearch" placeholder="Search payments...">
                <select id="paymentStatus">
                    <option value="">All Status</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="overdue">Overdue</option>
                </select>
                <input type="date" id="paymentDateFilter">
            </div>
            <div class="payments-table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Invoice ID</th>
                            <th>Patient</th>
                            <th>Service</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="paymentsTableBody">
                        <!-- Data will be loaded here -->
                    </tbody>
                </table>
            </div>
        `;
        loadPaymentsData();
    }

    function loadPaymentsData() {
        // Simulated data - replace with actual API call
        const payments = [
            { id: "INV-2024-001", patient: "John Doe", service: "Consultation", amount: 150.00, status: "paid", date: "2024-03-20" },
            { id: "INV-2024-002", patient: "Jane Smith", service: "Lab Test", amount: 75.00, status: "pending", date: "2024-03-20" }
        ];

        const tableBody = document.getElementById('paymentsTableBody');
        tableBody.innerHTML = payments.map(payment => `
            <tr>
                <td>${payment.id}</td>
                <td>${payment.patient}</td>
                <td>${payment.service}</td>
                <td>$${payment.amount.toFixed(2)}</td>
                <td><span class="status-badge ${payment.status}">${payment.status}</span></td>
                <td>${payment.date}</td>
                <td>
                    <button onclick="viewPayment('${payment.id}')" class="icon-btn view">👁️</button>
                    <button onclick="editPayment('${payment.id}')" class="icon-btn edit">✏️</button>
                    <button onclick="deletePayment('${payment.id}')" class="icon-btn delete">🗑️</button>
                </td>
            </tr>
        `).join('');

        // Update summary cards
        document.getElementById('totalRevenue').textContent = "225.00";
        document.getElementById('pendingAmount').textContent = "75.00";
        document.getElementById('todayCollections').textContent = "150.00";
    }

    function viewPayment(id) {
        // Implementation for viewing payment details
    }

    function editPayment(id) {
        // Implementation for editing payment
    }

    function deletePayment(id) {
        if(confirm('Are you sure you want to delete this payment record?')) {
            // Implementation for deleting payment
        }
    }

    function exportAppointments() {
        // Implementation for exporting appointments data
        alert('Exporting appointments data...');
    }

    function exportPatients() {
        // Implementation for exporting patients data
        alert('Exporting patients data...');
    }

    function exportStaffData() {
        // Implementation for exporting staff data
        alert('Exporting staff data...');
    }

    function exportPayments() {
        // Implementation for exporting payments data
        alert('Exporting payments data...');
    }

    function loadUpdateInfoSection() {
        mainContent.innerHTML = `
            <div class="section-header">
                <h1 class="section-title">Update User Information</h1>
            </div>
            <div class="update-info-container">
                <form id="userInfoForm" class="info-form">
                    <div class="form-section">
                        <h3>User Information</h3>
                        <div class="form-group">
                            <label for="userId">User ID</label>
                            <input type="text" id="userId" readonly>
                        </div>
                        <div class="form-group">
                            <label for="fullName">Full Name</label>
                            <input type="text" id="fullName" required>
                        </div>
                        <div class="form-group">
                            <label for="email">Email</label>
                            <input type="email" id="email" required>
                        </div>
                        <div class="form-group">
                            <label for="password">Password</label>
                            <input type="password" id="password" placeholder="Leave blank to keep current password">
                        </div>
                        <div class="form-group">
                            <label for="contactNumber">Contact Number</label>
                            <input type="tel" id="contactNumber" required>
                    </div>
                        <div class="form-group">
                            <label for="emergencyContact">Emergency Contact</label>
                            <input type="tel" id="emergencyContact" required>
                            </div>
                        <div class="form-group">
                            <label for="useEmergencyAsDefault">
                                <input type="checkbox" id="useEmergencyAsDefault">
                                Use Emergency Contact as Default
                            </label>
                        </div>
                        <div class="form-group">
                            <label for="role">Role</label>
                            <input type="text" id="role" readonly>
                            </div>
                        <div class="form-group">
                            <label>Created At</label>
                            <input type="text" id="createdAt" readonly>
                        </div>
                        <div class="form-group">
                            <label>Last Updated</label>
                            <input type="text" id="updatedAt" readonly>
                        </div>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="action-btn primary">Save Changes</button>
                        <button type="reset" class="action-btn">Reset</button>
                    </div>
                </form>
            </div>
        `;
        loadUserInfo();
    }

    function loadUserInfo() {
        // Simulated data - replace with actual API call
        const userInfo = {
            userId: "USR001",
            fullName: "John Doe",
            email: "john@example.com",
            contactNumber: "555-0123",
            emergencyContact: "555-4567",
            useEmergencyAsDefault: false,
            role: "Doctor",
            createdAt: "2024-01-01 10:00:00",
            updatedAt: "2024-03-20 15:30:00"
        };

        // Populate form fields
        document.getElementById('userId').value = userInfo.userId;
        document.getElementById('fullName').value = userInfo.fullName;
        document.getElementById('email').value = userInfo.email;
        document.getElementById('contactNumber').value = userInfo.contactNumber;
        document.getElementById('emergencyContact').value = userInfo.emergencyContact;
        document.getElementById('useEmergencyAsDefault').checked = userInfo.useEmergencyAsDefault;
        document.getElementById('role').value = userInfo.role;
        document.getElementById('createdAt').value = userInfo.createdAt;
        document.getElementById('updatedAt').value = userInfo.updatedAt;

        // Add form submission handler
        document.getElementById('userInfoForm').addEventListener('submit', handleUserInfoSubmit);
    }

    function handleUserInfoSubmit(e) {
        e.preventDefault();
        const formData = {
            fullName: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            contactNumber: document.getElementById('contactNumber').value,
            emergencyContact: document.getElementById('emergencyContact').value,
            useEmergencyAsDefault: document.getElementById('useEmergencyAsDefault').checked
        };
        
        // Submit to backend and handle response
        console.log('Updating user information:', formData);
        alert('User information updated successfully!');
    }

    function loadCreateAccountSection() {
        mainContent.innerHTML = `
            <div class="section-header">
                <h1 class="section-title">Create New Account</h1>
            </div>
            <div class="create-account-container">
                <form id="createAccountForm" class="account-form">
                    <div class="form-section">
                        <h3>Account Information</h3>
                        <div class="form-group">
                            <label for="accountType">Account Type</label>
                            <select id="accountType" required>
                                <option value="">Select Type</option>
                                <option value="doctor">Doctor</option>
                                <option value="patient">Patient</option>
                                <option value="staff">Staff</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="fullName">Full Name</label>
                            <input type="text" id="fullName" required>
                        </div>
                        <div class="form-group">
                            <label for="email">Email</label>
                            <input type="email" id="email" required>
                        </div>
                        <div class="form-group">
                            <label for="phone">Phone Number</label>
                            <input type="tel" id="phone" required>
                        </div>
                    </div>
                    <div class="form-section">
                        <h3>Access Credentials</h3>
                        <div class="form-group">
                            <label for="username">Username</label>
                            <input type="text" id="username" required>
                        </div>
                        <div class="form-group">
                            <label for="password">Password</label>
                            <input type="password" id="password" required>
                        </div>
                        <div class="form-group">
                            <label for="confirmPassword">Confirm Password</label>
                            <input type="password" id="confirmPassword" required>
                        </div>
                    </div>
                    <div class="form-section" id="roleSpecificFields">
                        <!-- Dynamic fields based on account type will be loaded here -->
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="action-btn primary">Create Account</button>
                        <button type="reset" class="action-btn">Clear Form</button>
                    </div>
                </form>
            </div>
        `;
        setupCreateAccountHandlers();
    }

    function setupCreateAccountHandlers() {
        const accountType = document.getElementById('accountType');
        const roleSpecificFields = document.getElementById('roleSpecificFields');

        accountType.addEventListener('change', () => {
            const type = accountType.value;
            let additionalFields = '';

            switch(type) {
                case 'doctor':
                    additionalFields = `
                        <h3>Doctor Specific Information</h3>
                        <div class="form-group">
                            <label for="specialization">Specialization</label>
                            <select id="specialization" required>
                                <option value="">Select Specialization</option>
                                <option value="cardiology">Cardiology</option>
                                <option value="neurology">Neurology</option>
                                <option value="general">General Medicine</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="licenseNumber">License Number</label>
                            <input type="text" id="licenseNumber" required>
                        </div>
                    `;
                    break;
                case 'patient':
                    additionalFields = `
                        <h3>Patient Specific Information</h3>
                        <div class="form-group">
                            <label for="dateOfBirth">Date of Birth</label>
                            <input type="date" id="dateOfBirth" required>
                        </div>
                        <div class="form-group">
                            <label for="bloodGroup">Blood Group</label>
                            <select id="bloodGroup" required>
                                <option value="">Select Blood Group</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                            </select>
                        </div>
                    `;
                    break;
            }

            roleSpecificFields.innerHTML = additionalFields;
        });

        // Form submission handler
        document.getElementById('createAccountForm').addEventListener('submit', (e) => {
            e.preventDefault();
            // Add your account creation logic here
            alert('Account created successfully!');
            loadDashboard();
        });
    }

    // Initialize the dashboard
    initAppointmentsChart();
    initSpecializationChart();
    initCalendar();
});

document.addEventListener('DOMContentLoaded', () => {
    // Logout functionality
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('adminLoggedIn');
            window.location.href = 'index.html'; // Make sure this file exists
        });
    }
});

// Initialize Charts
initAppointmentsChart();
initSpecializationChart();
initCalendar();

// Burger menu functionality
menuBtn.addEventListener('click', () => {
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
});

// Close the menu when clicking outside of it
document.addEventListener('click', (event) => {
    if (!menu.contains(event.target) && !menuBtn.contains(event.target)) {
        menu.style.display = 'none';
    }
});

// Logout functionality
document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('adminLoggedIn');
    window.location.href = 'index.html';
});

function initAppointmentsChart() {
    const ctx = document.getElementById('appointmentsChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
            datasets: [
                {
                    label: 'Completed Appointments',
                    data: [65, 59, 80, 81, 56, 55, 40],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Cancelled Appointments',
                    data: [28, 48, 40, 19, 86, 27, 90],
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'New Appointments',
                    data: [18, 38, 50, 29, 76, 37, 60],
                    borderColor: '#10b981', // Changed to a distinct green
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Monthly Appointments' }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

function initSpecializationChart() {
    const ctx = document.getElementById('specializationChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Cardiology', 'Neurology', 'General Medicine'],
            datasets: [{
                data: [45, 35, 20],
                backgroundColor: [
                    '#06b6d4', // Cyan
                    '#fde047', // Yellow
                    '#f472b6'  // Pink
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            cutout: '70%',
            plugins: {
                legend: { display: false },
                tooltip: { enabled: true }
            }
        }
    });
}

function initCalendar() {
    const calendarEl = document.getElementById('calendar');
    const dateAppointmentsList = document.getElementById('date-appointments-list');
    const selectedDateSpan = document.getElementById('selected-date');

    const calendar = new FullCalendar.Calendar(calendarEl, {
        plugins: [FullCalendar.dayGridPlugin, FullCalendar.interactionPlugin],
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek,dayGridDay'
        },
        dateClick: function(info) {
            const clickedDate = new Date(info.dateStr);
            const formattedDate = `${months[clickedDate.getMonth()]} ${clickedDate.getDate()}`;
            
            // Update the "Today" card and selected date display
            document.querySelector('.stat-card.today .stat-value').textContent = formattedDate;
            if (selectedDateSpan) {
                selectedDateSpan.textContent = formattedDate;
            }
            
            // Filter and display appointments
            const filteredAppointments = window.appointments ? window.appointments.filter(app => 
                app.date === info.dateStr
            ) : [];
            
            renderDateAppointments(filteredAppointments);
        }
    });

    calendar.render();
}

function renderDateAppointments(appointments) {
    const container = document.getElementById('date-appointments-list');
    container.innerHTML = '';

    if (appointments.length === 0) {
        container.innerHTML = `<div class="text-muted">No appointments for this date</div>`;
        return;
    }

    appointments.forEach(appointment => {
        const appointmentHTML = `
            <div class="appointment-item">
                <div>
                    <div class="font-medium">${appointment.doctor}</div>
                    <div class="appointment-time">${appointment.time}</div>
                </div>
                <span class="appointment-status status-${appointment.status}">
                    ${appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </span>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', appointmentHTML);
    });
}

