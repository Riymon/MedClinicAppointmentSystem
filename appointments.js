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
                        status: status
                    }
                }
    async insertData() {
        const { data: userData, error: userError } = await supabase
            .from('appointments')
            .insert([{
                appointment_id: this.data.appointment_id,
                patient_id: this.data.patient_id,
                user_id: this.data.user_id,
                doctor_id: this.data.doctor_id,
                appointment_date_time: this.data.appointment_date,
                appointment_type: this.data.appointment_type,
                purpose: this.data.purpose,
                status: this.data.status
            }]);

             
        if (userError) {
            console.error('Insert error:', userError);
            alert("There was an error creating the appointment.");
            return;
        }
        if (userData) {
            alert("Appointment created successfully!");
            console.log("Appointment created successfully:", userData);
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
                updated_at: NOW(),
            }])
            
    }
}
