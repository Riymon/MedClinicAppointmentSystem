import Appointments from './classes/appointments.js';
import User from './classes/users.js';
import supabase from './classes/database.js';
import Patient from './classes/patient.js';

document.addEventListener('DOMContentLoaded', async function() {
    // DOM Elements
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const registerBtn = document.getElementById('register-btn');
    const userGreeting = document.getElementById('user-greeting');
    const usernameDisplay = document.getElementById('username-display');
    const loginForm = document.getElementById('login-form');
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const confirmationModal = document.getElementById('confirmation-modal');
    const closeModals = document.querySelectorAll('.close-modal');
    const bookFromViewBtn = document.getElementById('book-from-view');
    const heroBookBtn = document.getElementById('hero-book-btn');
    const registerFromLogin = document.getElementById('register-from-login');
    const loginFromRegister = document.getElementById('login-from-register');
    const bookingForm = document.getElementById('booking-form');
    const departmentSelect = document.getElementById('department');
    const doctors_select = document.getElementById('doctor');
    const dateInput = document.getElementById('date');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const filterStatus = document.getElementById('filter-status');
    const refreshAppointments = document.getElementById('refresh-appointments');
    const appointmentsList = document.getElementById('appointments-list');
    const printAppointmentBtn = document.getElementById('print-appointment');
    const viewAppointmentsBtn = document.getElementById('view-appointments');
    const patientLoginBtn = document.getElementById('patient-login-btn');
    const reason = document.getElementById('reason').value;
    const adminUser = [{username: 'user@wecare.com', password: 'password123'},
    {username: 'user1@wecare.com', password: 'password123'}];
    const nav = document.querySelector('nav ul');
    const ADMIN_PIN = "123456";
    let doctors_data = {};
    let appointmentsChart = null;
    const adminCredentials = { username: "admin", password: "admin123" };
    let calendar = null;
    let appointments = {};

    // Initialize the page
    async function init() {
        // Hide nav links initially
        navLinks.forEach(link => link.style.display = 'none');
        
        // Set current date as min date for appointment
        const today = new Date().toISOString().split('T')[0];
        if (dateInput) dateInput.setAttribute('min', today);
        
        // Load doctors data
        doctors_data = await fetchDoctorsData();
        console.log('Fetched doctors_data:', doctors_data);
        
        // Set up department change listener
        departmentSelect?.addEventListener('change', populateDoctors);
        doctors_select?.addEventListener('change', enableDateInput);
        
        // If there's a default department selected, populate its doctors
        if (departmentSelect && departmentSelect.value) {
            populateDoctors();
        }

        // Check if user is logged in
        await checkLoginStatus();
        
        // Set up event listeners
        setupEventListeners();

        const user_data = JSON.parse(sessionStorage.getItem('loggedInUser'));
        if (user_data && user_data.user_id) {
            renderAppointments();
        }
    }

    // Check if user is logged in and update UI accordingly
    async function checkLoginStatus() {
        const userData = sessionStorage.getItem('loggedInUser');
        if (userData) {
            const user = JSON.parse(userData);

            try {
                const { data: freshUser, error } = await supabase
                    .from('user')
                    .select('*')
                    .eq('email', user.email)
                    .single();

                if (freshUser && !error) {
                    updateUIForLoggedInUser(freshUser);
                    sessionStorage.setItem('loggedInUser', JSON.stringify(freshUser));
                } else {
                    updateUIForLoggedInUser(user);
                }
            } catch (error) {
                console.error('Error checking user status:', error);
                updateUIForLoggedInUser(user);
            }
        } else {
            resetUIForLoggedOutUser();
        }
    }

    function resetUIForLoggedOutUser() {
        if (userGreeting) userGreeting.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (loginBtn) loginBtn.style.display = 'block';
        if (registerBtn) registerBtn.style.display = 'block';
        
        navLinks.forEach(link => {
            if (link.id === 'home-link') {
                link.style.display = 'block';
            } else {
                link.style.display = 'none';
            }
        });
        
        sections.forEach(section => {
            section.style.display = 'none';
        });
        document.getElementById('home-section').style.display = 'block';
    }

    function showNavLinks() {
        navLinks.forEach(link => link.style.display = 'block');
    }

    async function fetchDoctorsData() {
        try {
            const { data, error } = await supabase
                .from('staffs')
                .select(`
                    staff_id,
                    full_name,
                    specialization,
                    doctor_schedule (
                        day_of_week
                    )
                `)
                .eq('staff_type', 'Doctor')
                .order('full_name', { ascending: true });

            if (error) throw error;
            if (!data || data.length === 0) {
                console.warn('No doctors found in database');
                return {};
            }
            
            const organizedData = {};
            data.forEach(doc => {
                const specialization = doc.specialization?.trim().toLowerCase() || 'general';
                
                if (!organizedData[specialization]) {
                    organizedData[specialization] = [];
                }
                
                const availableDays = (doc.doctor_schedule || []).map(sch => sch.day_of_week);
                
                organizedData[specialization].push({
                    id: doc.staff_id,
                    name: doc.full_name,
                    availableDays: availableDays
                });
            });

            return organizedData;
        } catch (error) {
            console.error('Error fetching doctors data:', error);
            return {};
        }
    }

    function populateDoctors() {
        if (!doctors_select) return;
        
        doctors_select.innerHTML = '<option value="">Select Doctor</option>';
        const selectedDept = departmentSelect.value.toLowerCase().trim();
        
        if (selectedDept && doctors_data[selectedDept] && doctors_data[selectedDept].length > 0) {
            doctors_select.disabled = false;
            doctors_data[selectedDept].forEach(doctor => {
                const option = document.createElement('option');
                option.value = doctor.id;
                option.textContent = doctor.name;
                doctors_select.appendChild(option);
            });
        } else {
            doctors_select.disabled = true;
        }
        
        if (dateInput) {
            dateInput.value = '';
            dateInput.disabled = true;
        }
        updatePreview();
    }

    async function populateMyAppointments() {
        try {
            const appointmentsInstance = new Appointments();
            const user = new User();
            const user_id = await user.getUserIDByUserEmail(usernameDisplay.textContent);
            if (!user_id) {
                console.error('No user_id found for current user');
                return [];
            }
            const appointments = await appointmentsInstance.myAppointments(user_id);

            const status_filter = document.getElementById('filter-status').value;
            let filtered_appointments = appointments;

            if (status_filter !== 'all') {
                filtered_appointments = appointments.filter(app => app.status === status_filter);
            }

            return filtered_appointments.map(app => ({
                id: app.appointment_id,
                department: app.staffs?.specialization || '', 
                doctor: app.staffs?.full_name || app.doctor || '',
                date: app.appointment_date_time || app.date,
                patientName: app.patients?.full_name || app.patientName || '',
                email: app.patients?.email || app.email || '',
                phone: app.patients?.contact_no || app.phone || '',
                status: app.status
            }));

        } catch (error) {
            console.error('Error in Populate My Appointments', error);
            throw error;
        }
    }

    departmentSelect?.addEventListener('change', function() {
        console.log('Department changed to:', departmentSelect.value);
        console.log('Available specializations:', Object.keys(doctors_data));
        populateDoctors();
    });

    async function handleRegisterSubmit(e) {
        e.preventDefault();
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;

        try {
            const fullNameInput = document.getElementById('reg-name').value;
            const emailInput = document.getElementById('reg-email').value;
            const phoneInput = document.getElementById('reg-phone').value;
            const passwordInput = document.getElementById('reg-password').value;
            const adminPinInput = document.getElementById('reg-pin').value;

            if (!fullNameInput || !emailInput || !phoneInput || !passwordInput) {
                throw new Error("One or more form elements are missing.");
            }

            let role = 'user';
            if (adminPinInput === ADMIN_PIN) {
                role = 'admin';
            }

            let user = new User(fullNameInput, emailInput, passwordInput, phoneInput, role, 'Active');
            await user.register();
            await user.role(role);
        } finally {
            submitBtn.disabled = false;
        }
    }

    // Enhanced login functionality
    async function handleLoginSubmit(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const submitBtn = e.target.querySelector('button[type="submit"]');
        
        // Validate inputs
        if (!email || !password) {
            alert('Please enter both email and password');
            return;
        }

        // Show loading state
        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';

        try {
            console.log('Attempting login with:', email);
            
            const user = new User();
            const loginResult = await user.login(email, password, 'Active');
            
            if (!loginResult) {
                throw new Error('Invalid email or password');
            }

            // Handle banned account
            if (loginResult.status === 'Banned') {
                await user.isBanned();
                return; // Exit without throwing error
            }

            // Store user data
            const userData = {
                email: loginResult.email,
                role: loginResult.role,
                status: loginResult.status,
                user_id: loginResult.user_id || ''
            };
            sessionStorage.setItem('loggedInUser', JSON.stringify(userData));
            console.log('Login successful, user data:', userData);

            // Update UI
            updateUIForLoggedInUser(userData);
            
            // Close modal and show success
            if (loginModal) loginModal.classList.remove('active');
            alert('Login successful!');

        } catch (error) {
            console.error('Login error:', error);
            if (error.message !== 'banned') { // Only show alert if not banned
                alert(error.message || 'Login failed. Please try again.');
                document.getElementById('login-password').value = '';
            }
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }
    }
    function setupEventListeners() {
        // Navigation
        document.querySelectorAll('nav a').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const sectionId = this.id.replace('-link', '-section');
                showSection(sectionId);
                
                document.querySelectorAll('nav a').forEach(navLink => {
                    navLink.classList.remove('active');
                });
                this.classList.add('active');
            });
        });

        // Forms
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', handleRegisterSubmit);
        }

        if (loginForm) {
            loginForm.addEventListener('submit', handleLoginSubmit);
        }


        logoutBtn?.addEventListener('click', handleLogout);

        // Modal controls
        document.getElementById('login-btn')?.addEventListener('click', () => {
            document.getElementById('login-modal').classList.add('active');
        });
        
        document.getElementById('register-btn')?.addEventListener('click', () => {
            document.getElementById('register-modal').classList.add('active');
        });
        
        closeModals.forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('login-modal').classList.remove('active');
                document.getElementById('register-modal').classList.remove('active');
                document.getElementById('confirmation-modal').classList.remove('active');
            });
        });
        
        registerFromLogin?.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('login-modal').classList.remove('active');
            document.getElementById('register-modal').classList.add('active');
        });
        
        loginFromRegister?.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('register-modal').classList.remove('active');
            document.getElementById('login-modal').classList.add('active');
        });
        function handleLogout() {
            // 1. Clear the stored user data
            sessionStorage.removeItem('loggedInUser');
            
            // 2. Reset the UI to logged-out state (uses your existing function)
            resetUIForLoggedOutUser();
            
            // 3. Show the home section
            showSection('home-section');
            alert('You have been logged out successfully.', 'success');
            // 4. Show confirmation message
            }

        // Other interactive elements
        heroBookBtn?.addEventListener('click', () => {
            if (!isLoggedIn()) {
                alert('Please log in or register first.', 'warning');
                loginModal.classList.add('active');
            } else {
                showSection('book-section');
                document.querySelectorAll('nav a').forEach(navLink => navLink.classList.remove('active'));
                document.getElementById('book-link').classList.add('active');
            }
        });

        bookFromViewBtn?.addEventListener('click', () => {
            if (!isLoggedIn()) {
                alert('Please log in or register first.', 'warning');
                loginModal.classList.add('active');
            } else {
                showSection('book-section');
                document.querySelectorAll('nav a').forEach(navLink => navLink.classList.remove('active'));
                document.getElementById('book-link').classList.add('active');
            }
        });

        bookingForm?.addEventListener('submit', handleBookingSubmit);
        
        [departmentSelect, doctors_select, dateInput, nameInput, emailInput, phoneInput].forEach(input => {
            input?.addEventListener('change', updatePreview);
        });

        filterStatus?.addEventListener('click', renderAppointments);
        refreshAppointments?.addEventListener('click', renderAppointments);

        printAppointmentBtn?.addEventListener('click', () => window.print());
        viewAppointmentsBtn?.addEventListener('click', () => {
            confirmationModal.classList.remove('active');
            showSection('view-section');
            document.querySelectorAll('nav a').forEach(navLink => navLink.classList.remove('active'));
            document.getElementById('view-link').classList.add('active');
        });
    }
    
    function showSection(sectionId) {
        sections.forEach(section => {
            section.style.display = 'none';
        });
        
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.style.display = 'block';
        } else {
            console.error('Section not found:', sectionId);
            document.getElementById('home-section').style.display = 'block';
        }
    }
    
    function enableDateInput() {
        if (doctors_select.value) {
            dateInput.disabled = false;
            const selectedDoctor = doctors_select.options[doctors_select.selectedIndex].text;
            updateCalendar(selectedDoctor);
        } else {
            dateInput.disabled = true;
        }
        
        updatePreview();
    }
    
    function updatePreview() {
        document.getElementById('preview-dept').textContent = departmentSelect.options[departmentSelect.selectedIndex].text || 'Not selected';
        document.getElementById('preview-doc').textContent = doctors_select.options[doctors_select.selectedIndex].text || 'Not selected';
        document.getElementById('preview-date').textContent = dateInput.value ? new Date(dateInput.value).toLocaleDateString('en-US', { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
        }) : 'Not selected';
        document.getElementById('preview-name').textContent = nameInput.value || 'Not provided';
        document.getElementById('preview-email').textContent = emailInput.value || 'Not provided';
        document.getElementById('preview-phone').textContent = phoneInput.value || 'Not provided';
    }

    function updateUIForLoggedInUser(user) {
        // Hide login/register, show greeting and logout
        if (loginBtn) loginBtn.style.display = 'none';
        if (registerBtn) registerBtn.style.display = 'none';
        if (userGreeting) userGreeting.style.display = 'flex';
        if (usernameDisplay) usernameDisplay.textContent = user.email;
        if (logoutBtn) logoutBtn.style.display = 'block';

        // Hide all sections
        sections.forEach(section => {
            section.style.display = 'none';
        });
        
        // Show only home section by default
        document.getElementById('home-section').style.display = 'block';

        // Hide all nav links first
        navLinks.forEach(link => link.style.display = 'none');

        // Show home link to everyone
        document.getElementById('home-link').style.display = 'block';

        // Only show user-specific nav links for user role
        if (user.role === 'user') {
            document.getElementById('book-link').style.display = 'block';
            document.getElementById('view-link').style.display = 'block';
        } 
        else if (user.role === 'admin') {
            window.location.href = 'admin1.html';
        }
    }

    async function handleBookingSubmit(e) {
        e.preventDefault();

        if (!departmentSelect.value || !doctors_select.value || !dateInput.value || 
            !nameInput.value || !phoneInput.value) {
            alert('Please fill in all required fields', 'warning');
            return;
        }

        try {
            const user = new User();
            const reason = document.getElementById('reason').value;
            
            const user_id = await user.getUserIDByUserEmail(emailInput.value);
            if (!user_id) {
                throw new Error('User not found. Please register first.');
            }

            const newPatient = new Patient(
                user_id,
                nameInput.value,
                emailInput.value,
                '',
                phoneInput.value,
                '',
                '2000-01-01'
            );
            
            const patientResult = await newPatient.insertData();
            if (patientResult.error) {
                throw new Error('Patient error: ' + patientResult.error);
            }
            
            const pat_id = patientResult.patient_id;
            if (!pat_id) {
                throw new Error('Failed to get patient ID');
            }

            const appointmentData = {
                patient_id: pat_id,
                user_id: user_id,
                doctor_id: Number(doctors_select.value),
                appointment_date: dateInput.value,
                appointment_type: "Online",
                purpose: reason,
                status: "upcoming"
            };

            const app = new Appointments(
                appointmentData.patient_id, 
                appointmentData.user_id,
                appointmentData.doctor_id,
                appointmentData.appointment_date,
                appointmentData.appointment_type,
                appointmentData.purpose,
                appointmentData.status
            );
            
            const result = await app.insertData();
            
            if (result.error) {
                throw new Error(result.error);
            }

            document.getElementById('confirm-id').textContent = result.data[0]?.appointment_id || 'N/A';
            document.getElementById('confirm-doctor').textContent = doctors_select.options[doctors_select.selectedIndex].text;
            
            const appointmentDate = new Date(dateInput.value);
            document.getElementById('confirm-date').textContent = appointmentDate.toLocaleDateString('en-US', { 
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });

            confirmationModal.classList.add('active');
            bookingForm.reset();
            doctors_select.disabled = true;
            dateInput.disabled = true;
            updatePreview();
            await renderAppointments();

        } catch (error) {
            console.error('Booking failed:', error);
            alert('Failed to book appointment: ' + error.message, 'danger');
        }
    }

    function formatDateForPostgres(date) {
        const pad = num => num.toString().padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    }
    
    function generateAppointmentId() {
        const randomNum = Math.floor(Math.random() * 500) + 100;
        return randomNum;
    }

    async function renderAppointments() {
        const appointmentsList = document.getElementById('appointments-list');
        const statusFilter = document.getElementById('filter-status').value;
        
        const user_data = JSON.parse(sessionStorage.getItem('loggedInUser'));

        try {
            appointments = await populateMyAppointments();
            
            if (!appointments || appointments.length === 0) {
                appointmentsList.innerHTML = `
                    <div class="no-appointments">
                        <i class="far fa-calendar-alt"></i>
                        <p>No ${statusFilter !== 'all' ? statusFilter : ''} appointments found.</p>
                        <button id="book-from-view">Book Appointment</button>
                    </div>
                `;
                
                document.getElementById('book-from-view')?.addEventListener('click', () => {
                    showSection('book-section');
                    document.querySelectorAll('nav a').forEach(navLink => navLink.classList.remove('active'));
                    document.getElementById('book-link').classList.add('active');
                });
                return;
            }

            appointmentsList.innerHTML = '';
            
            appointments.forEach(appointment => {
                const status = (appointment.status || '').toLowerCase();
                const appointmentCard = document.createElement('div');
                appointmentCard.className = 'appointment-card';

                const formattedDate = new Date(appointment.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });

                appointmentCard.innerHTML = `
                    <div class="appointment-info">
                        <h4>${appointment.department} - ${appointment.doctor}</h4>
                        <p>${formattedDate}</p>
                        <p>Patient: ${appointment.patientName}</p>
                        <span class="appointment-status status-${status}">
                            ${appointment.status ? appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1) : ''}
                        </span>
                    </div>
                    <div class="appointment-actions">
                    ${status === 'upcoming' || status === 'scheduled' ? 
                        `<button class="btn btn-dangxer cancel-btn" data-id="${appointment.id}">Cancel</button>` : ''}
                    <button class="btn btn-outline details-btn" data-id="${appointment.id}">Details</button>
                </div>
                `;
                
                appointmentsList.appendChild(appointmentCard);
            });

            setupAppointmentEventListeners();

        } catch (error) {
            console.error('Error rendering appointments:', error);
            appointmentsList.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Failed to load appointments. Please try again.</p>
                </div>
            `;
        }
    }

    function setupAppointmentEventListeners() {
        document.querySelectorAll('.cancel-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const appointmentId = this.getAttribute('data-id');
                cancelAppointment(appointmentId);
            });
        });
        
        document.querySelectorAll('.details-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const appointmentId = this.getAttribute('data-id');
                showAppointmentDetails(appointmentId);
            });
        });
    }
    
    function showAppointmentDetails(appointmentId) {
        const found = appointments.find(app => String(app.id) === String(appointmentId));
        if (found) {
            const formattedDate = new Date(found.date).toLocaleDateString('en-US', { 
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
            });

            const detailsHtml = `
                <h3>Appointment Details</h3>
                <div class="appointment-details">
                    <p><strong>Appointment ID:</strong> ${found.id}</p>
                    <p><strong>Department:</strong> ${found.specialization }</p>
                    <p><strong>Doctor:</strong> ${found.doctor}</p>
                    <p><strong>Date:</strong> ${formattedDate}</p>
                    <p><strong>Patient Name:</strong> ${found.patientName}</p>
                    <p><strong>Email:</strong> ${found.email || usernameDisplay.textContent}</p>
                    <p><strong>Phone:</strong> ${found.phone}</p>
                    <p><strong>Status:</strong> <span class="status-${found.status}">
                        ${found.status.charAt(0).toUpperCase() + found.status.slice(1)}
                    </span></p>
                </div>
            `;

            const detailsModal = document.createElement('div');
            detailsModal.className = 'modal active';
            detailsModal.innerHTML = `
                <div class="modal-content">
                    <span class="close-modal">&times;</span>
                    ${detailsHtml}
                </div>
            `;

            document.body.appendChild(detailsModal);

            detailsModal.querySelector('.close-modal').addEventListener('click', () => {
                detailsModal.remove();
            });
        }
    }

    async function cancelAppointment(appointmentId) {
    if (!appointmentId || appointmentId === 'undefined') {
        alert('Invalid appointment ID');
        return;
    }
    
    if (!confirm('Are you sure you want to cancel this appointment?')) return;

    try {
        const userData = sessionStorage.getItem('loggedInUser');
        const app = new Appointments();
        const user = JSON.parse(userData);
        const user_id = user.user_id;
        const result = await app.cancel(appointmentId, user_id);
        
        if (result.error) {
            throw new Error(result.error);
        }

        const appointmentIndex = appointments.findIndex(
            app => String(app.id) === String(appointmentId)
        );
        
        if (appointmentIndex !== -1) {
            appointments[appointmentIndex].status = 'cancelled';
            renderAppointments();
            alert('Appointment cancelled successfully!', 'success');
        }
    } catch (error) {
        console.error('Cancellation failed:', error);
        alert('Failed to cancel appointment: ' + error.message, 'danger');
    }
}

    function findDoctorByName(name) {
        for (const department in doctors_data) {
            const doctor = doctors_data[department].find(doc => doc.name === name);
            if (doctor) {
                return doctor;
            }
        }
        return null;
    }

    function updateCalendar(doctorName) {
        if (calendar) {
            calendar.destroy();
        }

        const doctor = findDoctorByName(doctorName);
        if (!doctor) {
            console.error("Doctor not found!");
            return;
        }

        const allowedDays = doctor.availableDays;
        const today = new Date();
        const availableDates = [];

        for (let i = 0; i <= 14; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);

            const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
            if (allowedDays.includes(dayName)) {
                availableDates.push(date.toISOString().split('T')[0]);
            }
        }

        calendar = flatpickr(dateInput, {
            dateFormat: "Y-m-d",
            enable: availableDates,
            minDate: "today",
            maxDate: new Date().fp_incr(14)
        });
    }

    function handleAdminLogin(username, password) {
        if (!username || !password) {
            alert('Please enter both username and password', 'warning');
            return;
        }

        if (username === adminCredentials.username && password === adminCredentials.password) {
            document.querySelectorAll('section').forEach(section => {
                section.classList.remove('active-section');
            });
            
            document.getElementById('admin-section').classList.add('active-section');
            document.getElementById('login-modal').classList.remove('active');
            document.querySelector('nav').style.display = 'none';
            document.querySelector('.auth-buttons').innerHTML = '<button id="logout-btn">Logout</button>';
            document.getElementById('logout-btn').addEventListener('click', logoutAdmin);
            initDashboard();
        } else {
            alert('Invalid admin credentials', 'danger');
        }
    }

    function isLoggedIn() {
        const userData = sessionStorage.getItem('loggedInUser');
        if (!userData) return false;
        
        try {
            const user = JSON.parse(userData);
            return !!(user && user.user_id);
        } catch {
            return false;
        }
    }

    function logoutAdmin() {
        document.querySelector('nav').style.display = 'flex';
        document.querySelector('.auth-buttons').innerHTML = `
            <button id="login-btn">Login</button>
            <button id="register-btn">Register</button>
        `;
        
        document.querySelectorAll('section').forEach(section => {
            section.classList.remove('active-section');
        });
        document.getElementById('home-section').classList.add('active-section');
        
        document.querySelectorAll('nav a').forEach(link => link.classList.remove('active'));
        document.getElementById('home-link').classList.add('active');
        
        setupEventListeners();
    }

    function initDashboard() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('dashboard-date').value = today;
        document.getElementById('selected-date-text').textContent = formatDate(today);
        loadDashboardData(today);
        
        document.getElementById('dashboard-date').addEventListener('change', function() {
            const selectedDate = this.value;
            document.getElementById('selected-date-text').textContent = formatDate(selectedDate);
            loadDashboardData(selectedDate);
        });
    }

    function loadDashboardData(date) {
        const sampleData = {
            total: 24,
            booked: 18,
            completed: 4,
            cancelled: 2,
            appointments: [
                { id: 'MC-2023-101', patient: 'John Doe', doctor: 'Dr. Sarah Johnson', department: 'Cardiology', time: '09:00 AM', status: 'booked' },
                { id: 'MC-2023-102', patient: 'Jane Smith', doctor: 'Dr. Michael Chen', department: 'Neurology', time: '10:30 AM', status: 'booked' },
                { id: 'MC-2023-103', patient: 'Robert Brown', doctor: 'Dr. Emily Rodriguez', department: 'General', time: '11:15 AM', status: 'completed' },
                { id: 'MC-2023-104', patient: 'Alice Johnson', doctor: 'Dr. Sarah Johnson', department: 'Cardiology', time: '02:00 PM', status: 'cancelled' }
            ],
            dailyStats: {
                labels: ['8AM', '10AM', '12PM', '2PM', '4PM'],
                booked: [5, 8, 3, 6, 2],
                completed: [1, 2, 0, 1, 0],
                cancelled: [0, 1, 0, 1, 0]
            }
        };
        
        document.getElementById('total-appointments').textContent = sampleData.total;
        document.getElementById('booked-appointments').textContent = sampleData.booked;
        document.getElementById('completed-appointments').textContent = sampleData.completed;
        document.getElementById('cancelled-appointments').textContent = sampleData.cancelled;
        
        const tableBody = document.getElementById('admin-appointments-list');
        tableBody.innerHTML = '';
        
        sampleData.appointments.forEach(appointment => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${appointment.id}</td>
                <td>${appointment.patient}</td>
                <td>${appointment.doctor}</td>
                <td>${appointment.department}</td>
                <td>${appointment.time}</td>
                <td><span class="appointment-status status-${appointment.status}">${appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}</span></td>
            `;
            tableBody.appendChild(row);
        });
        
        updateChart(sampleData.dailyStats);
    }

    function updateChart(data) {
        const ctx = document.getElementById('appointments-chart').getContext('2d');
        
        if (appointmentsChart) {
            appointmentsChart.destroy();
        }
        
        appointmentsChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Booked',
                        data: data.booked,
                        backgroundColor: '#3498db',
                        borderColor: '#2980b9',
                        borderWidth: 1
                    },
                    {
                        label: 'Completed',
                        data: data.completed,
                        backgroundColor: '#27ae60',
                        borderColor: '#219653',
                        borderWidth: 1
                    },
                    {
                        label: 'Cancelled',
                        data: data.cancelled,
                        backgroundColor: '#e74c3c',
                        borderColor: '#c0392b',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Number of Appointments'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Time of Day'
                        }
                    }
                }
            }
        });
    }

    function formatDate(dateString) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }

    // Initialize the page
    init();

    // Prevent scrolling up past the top
    window.addEventListener('scroll', function() {
        if (window.scrollY < 0) {
            window.scrollTo(0, 0);
        }
    });

    document.body.style.overscrollBehaviorY = 'none';
});