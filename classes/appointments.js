import supabase from './database.js';


export default class Appointments {
    
    constructor(patient_id, user_id, doctor_id,
                 appointment_date, appointment_type, purpose, status){
                    this.data = {
                        patient_id: patient_id, 
                        user_id: user_id,
                        doctor_id: doctor_id,
                        appointment_date: appointment_date,
                        appointment_type: appointment_type,
                        purpose: purpose,
                        status: status,
                        count: 0
                    }
                }
 async insertData() {
    try {
        // Validate all required fields
        const { data, error } = await supabase
            .from('appointments')
            .insert([{
                patient_id: this.data.patient_id,
                user_id: this.data.user_id,
                doctor_id: this.data.doctor_id,
                appointment_date_time: this.data.appointment_date,
                appointment_type: this.data.appointment_type,
                purpose: this.data.purpose,
                status: this.data.status,
            }])
            .select();

        if (error) throw error;
        return { data };
    } catch (error) {
        console.error('Appointment insert error:', error);
        return { error: error.message };
    }
}
    async Update(data){
        const { data: userData, error: userError } = await supabase
            .from('appointments')
            .update([{
                appointment_id: data.appointment_id ?? '',
                patient_id: data.patient_id ?? '',
                user_id: data.user_id ?? '',
                doctor_id: data.staff_id ?? '',
                doctor_id: data.doctor_id ?? '',
                appointment_date_time: data.appointment_date ?? '',
                appointment_type: data.appointment_type ?? '',
                purpose: data.purpose ?? '',
                status: data.status ?? '',
                updated_at: 'NOW()',
            }])
    }
    async myAppointments(user_id) {
        try {
            const { data, error } = await supabase
                .from('appointments')
                .select(`
                    *,
                    patients:patient_id (full_name, contact_no),
                    staffs:doctor_id (full_name, specialization)
                `)
                .eq('user_id', user_id)
                .order('appointment_date_time', { ascending: false });
                
            if (error) throw error;

            // Map the data to include specialization as department
            return data.map(appointment => ({
                ...appointment,
                department: appointment.staffs?.specialization || 'General'
            }));
            
        } catch (error) {
            console.error('Error fetching appointments:', error);
            return [];
        }
    }
    
async checkDoctorAvailability(doctorId, requestedDate) {
    try {
        // Get doctor's max appointments in one query
        const { data: doctor, error } = await supabase
            .from('staffs')
            .select('max_online_appointments')
            .eq('staff_id', doctorId)
            .single();
        
        if (error) throw error;
        if (!doctor) return { available: false, reason: "Doctor not found" };

        const maxAppointments = doctor.max_online_appointments;
        
        // Get start and end of the selected day

        // Count existing appointments for this doctor on this day
        const { count, error: countError } = await supabase
            .from('appointments')
            .select('*', { count: 'exact' })
            .eq('doctor_id', doctorId)
            .eq('appointment_date_time', requestedDate)
            .neq('status', 'cancelled');
        
        if (countError) throw countError;
        
        return { 
            available: count < maxAppointments,
            count: count,
            maxAllowed: maxAppointments,
            reason: count >= maxAppointments 
                ? "Doctor has reached maximum appointments for this day" 
                : null
        };
        
    } catch (error) {
        console.error('Availability check error:', error);
        return { available: false, error: error.message };
    }
    }

    showLimitedAppointmentOnline() {
        const detailsHtml = `
            <h3>Appointment Limit Reached</h3>
            <div class="appointment-details">
                <p><strong>Sorry!</strong> The doctor has reached the maximum online appointments for this day.</p>
                <p>We prioritize walk-in appointments when online slots are full.</p>
                <p>Please choose another day or doctor for your appointment.</p>
            </div>
        `;

        // Create a modal for details
        const detailsModal = document.createElement('div');
        detailsModal.className = 'modal active';
        detailsModal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                ${detailsHtml}
            </div>
        `;

        document.body.appendChild(detailsModal);

        // Add close event
        detailsModal.querySelector('.close-modal').addEventListener('click', () => {
            detailsModal.remove();
        });

        return detailsModal;
    }
async cancel(appointment_id, user_id) {
    console.log('Attempting to cancel appointment:', appointment_id);
    try {
        const { data, error } = await supabase
            .from('appointments')
            .update({ status: 'cancelled', updated_at: new Date().toISOString(),
                cancelled_by: user_id
            })
            .eq('appointment_id', appointment_id);

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        return { error: error.message };
    }
}

async getListAppointments(search, selection, status, date) {
    try {
        // Initialize base query
        let query = supabase
            .from('appointments')
            .select(`
                *,
                staffs:doctor_id(full_name, specialization),
                patients:patient_id(full_name, contact_no)
            `);

        // Apply search filters
        if (search && search.trim() !== '') {
            switch(selection) {
                case 'patient':
                    query = query.ilike('patients.full_name', `%${search}%`);
                    break;
                case 'doctor':
                    query = query.ilike('staffs.full_name', `%${search}%`);
                    break;
                case 'all':
                    query = query.or(
                        `patients.full_name.ilike.%${search}%,staffs.full_name.ilike.%${search}%`
                    );
                    break;
                default:
                    break;
            }
        }

        // Apply status filter
        if (status && status.trim() !== '') {
            query = query.eq('status', status);
        }

        // Apply date filter
        if (date && date.trim() !== '') {
            const dateObj = new Date(date);
            const startOfDay = new Date(dateObj.setHours(0, 0, 0, 0)).toISOString();
            const endOfDay = new Date(dateObj.setHours(23, 59, 59, 999)).toISOString();
            
            query = query.gte('appointment_date_time', startOfDay)
                         .lte('appointment_date_time', endOfDay);
        }

        // Execute the query
        const { data, error } = await query;

        if (error) throw error;

        // Transform the data for the frontend
        return data.map(appointment => ({
            ...appointment,
            id: appointment.appointment_id,
            patientName: appointment.patients?.full_name || 'N/A',
            doctor: appointment.staffs?.full_name || 'N/A',
            date: new Date(appointment.appointment_date_time).toLocaleDateString(),
            time: new Date(appointment.appointment_date_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: appointment.appointment_type,
            purpose: appointment.purpose,
            status: appointment.status,
            lastUpdated: appointment.updated_at ? new Date(appointment.updated_at).toLocaleString() : 'N/A',
            updatedBy: appointment.updated_by || 'N/A'
        }));

    } catch (error) {
        console.error('Error in getListAppointments:', error);
        return []; // Return empty array on error
    }
}
        
}
