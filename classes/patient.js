import supabase from './database.js';

export default class Patient {
    constructor(user_id, full_name, email, gender, contact_no, address, date_of_birth) {
        this.data = {
            user_id: user_id,
            full_name: full_name,
            email: email,
            contact_no: contact_no,
            address: address,
            date_of_birth: date_of_birth || '2000-01-01',
            gender: gender,
            updated_at: ''
        };
    }

    async getPatientIDByName(full_name) {
        try {
            const { data, error } = await supabase 
                .from('patients')
                .select('patient_id')
                .eq('full_name', full_name)
                .maybeSingle(); // Changed from single() to maybeSingle()

            if (error) {
                console.error('Patient lookup error:', error);
                return null;
            }
            return data?.patient_id || null;
        } catch (error) {
            console.error('Error:', error);
            return null;
        }
    }

    async insertData() {
        try {
            // First check if patient exists by name and email
            const existingPatient = await this.getExistingPatient();
            
            if (existingPatient) {
                console.log('Patient already exists, returning existing record');
                return {
                    data: existingPatient,
                    patient_id: existingPatient.patient_id,
                    isNew: false
                };
            }

            // Patient doesn't exist, create new one
            const { data, error } = await supabase
                .from('patients')
                .insert([{
                    user_id: this.data.user_id,
                    full_name: this.data.full_name,
                    contact_no: this.data.contact_no,
                    address: this.data.address,
                    date_of_birth: this.data.date_of_birth,
                    gender: this.data.gender
                }])

            const query = supabase.from('patients')
                    .select('patient_id')
                    .eq('full_name', data.full_name)
                    .eq('user_id', data.user_id)
                    .eq('contact_no', data.contact_no)
                    
            if (error) throw error;

            console.log("Patient created successfully");
            return {
                data: data[0],
                patient_id: query.patient_id,
                isNew: true
            };

        } catch (error) {
            console.error('Error in insertData:', error);
            return { 
                error: error.message,
                details: 'Failed to create or find patient record'
            };
        }
    }

    async getExistingPatient() {
        try {
            const { data, error } = await supabase
                .from('patients')
                .select('*')
                .eq('full_name', this.data.full_name)
                .maybeSingle();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error checking patient existence:', error);
            return null;
        }
    }

    async setPatientPhoneNumber(phone_number) {
        try {
            const patient_id = await this.getPatientIDByName(this.data.full_name);
            if (!patient_id) {
                throw new Error('Patient not found');
            }

            const { data, error } = await supabase
                .from('patients')
                .update({ contact_no: phone_number })
                .eq('patient_id', patient_id)
                .select();

            if (error) throw error;
            
            if (data) {
                console.log("Phone number set successfully:", data);
                return { success: true, data };
            }
        } catch (error) {
            console.error('Update error:', error);
            return { error: error.message };
        }
    }
async getPatients(search, field, status) {
    try {
        let query = supabase.from('patients').select('*, users:user_id(email)');
        
        // Get the selected values from the dropdowns
        const searchField = field?.value || 'all';
        const statusValue = status?.value || '';
        
        // Apply search filter if search term exists
        if (search) {
            switch (searchField) {
                case 'name':
                    query = query.ilike('full_name', `%${search}%`);
                    break;
                case 'patient_id':
                    query = query.eq('patient_id', search);
                    break;
                case 'phone':
                    query = query.ilike('contact_no', `%${search}%`);
                    break;
                case 'email':
                    query = query.ilike('email', `%${search}%`);
                    break;
     
            }
        }
        
        // Apply status filter if selected
        if (statusValue) {
            query = query.eq('status', statusValue);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        return data || []; // Always return an array
    } catch(error) {
        console.error('Error fetching patients:', error);
        return []; // Return empty array on error
    }
}
}