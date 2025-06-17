import supabase from './database.js';


export default class Appointments {
    
    constructor(appointment_id, patient_id, user_id, doctor_id,
                 appointment_date, appointment_type, purpose, status){
                    this.data = {
                        appointment_id: appointment_id,
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
        // First check doctor availability based only on daily max appointments
        const dateOnly = new Date(this.data.appointment_date).toISOString().split('T')[0];
        const availability = await this.checkDoctorAvailability(
            this.data.doctor_id,
            dateOnly
        );
        
        if (!availability.available) {
            alert(availability.reason || "Doctor cannot accept more appointments today");
            return { error: availability.reason || "Not available" };
        }
        
        // Proceed with insertion
        const { data, error } = await supabase
            .from('appointments')
            .insert([{
                appointment_id: this.data.appointment_id,
                patient_id: this.data.patient_id,
                user_id: this.data.user_id,
                doctor_id: this.data.doctor_id,
                appointment_date_time: this.data.appointment_date,
                appointment_type: this.data.appointment_type,
                purpose: this.data.purpose,
                status: 'upcoming'
            }])
            .select();
        
        if (error) throw error;
        
        alert(`Appointment created successfully!`);
        return { 
            data: data[0], 
            availability: {
                count: availability.count + 1,
                maxAllowed: availability.maxAllowed
            }
        };
        
    } catch (error) {
        console.error('Insert error:', error);
        alert("Error creating appointment: " + error.message);
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
    async cancel(appointment_id) {
        console.log('Attempting to cancel appointment:', appointmentId);
        console.log('Supabase client:', supabase);  // Should show initialized client
        console.log('supabase.from exists:', !!supabase.from);  // Should be true
        try {
            appointment_id = this.data.appointment_id;
            const { data: user, error } = await supabase
                .from('appointments')
                .update({ status: 'cancelled', cancelled_by: 'User itself' }
                .eq('appointment_id', appointment_id)
                )
        
        return { success: true, data };
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            return { error: error.message };
        }
    }
    async getListAppointments() {
        try {
            const {data: appointments, error} = await supabase
                .from('appointments')
                .select('*, staffs:doctor_id(full_name), patients:patient_id(full_name)')
                .order('appointment_date_time', { ascending: true });
            if (appointments){
                return appointments.map(appointment => ({
                    ...appointment,
                    appointment_date_time: new Date(appointment.appointment_date_time).toLocaleString(),
                    doctor_name: appointment.doctor?.full_name || 'Unknown'
                }));
            }
            if (error) {
                console.error('Error fetching appointments:', error);
                return [];
            }
        }catch (error) {
                console.error('Error fetching appointments:', error);
                return [];
            }
        }

}
