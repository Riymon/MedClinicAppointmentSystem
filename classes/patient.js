import supabase from './database.js';

export default class Patient {
    constructor(user_id, full_name, email, gender, contact_no, address, date_of_birth ) {
        this.data = {
            user_id: user_id,
            full_name: full_name,
            email: email,
            contact_no: contact_no,
            address: address,
            date_of_birth: date_of_birth,
            gender: gender,
            updated_at: ''
        };
    }
    async getPatientIDByName(full_name) {
        try {
            // First check if patient exists
            let { data, error } = await supabase 
                .from('patients')
                .select('patient_id')
                .eq('full_name', full_name.value)
                .single();

                console.log(full_name.value);

            return data.patient_id;    
        } catch (error) {
            console.error('Error:', error);
            return null;
        }
    }
    async insertData() {
        try {
            const id = this.isPatientExist(this.data.full_name, this.data.date_of_birth);
            if(!id){
                 const { data, error } = await supabase
                .from('patients')
                .insert([{
                    user_id: this.data.user_id,
                    full_name: this.data.full_name,
                    email: this.data.email,
                    contact_no: this.data.contact_no,
                    address: this.data.address,
                    date_of_birth: this.data.date_of_birth,
                }]);
            }
            else {
                alert("Patient Already Existed!");
                return;
            }
            if (error) {
                console.error('Insert error:', error);
                alert("There was an error creating the patient record.");
                return;
            } (data) => {
                console.log("Patient created successfully:", data);
                alert("Patient record created successfully!");
            }
        }catch (error) {
            console.error('Error:', error);
            alert("An unexpected error occurred while creating the patient record.");
        }
    }
    async isPatientExist (full_name, date_of_birth) {
        try {
            const { data, error } = await supabase
                .from('patients')
                .select('patient_id')
                .eq('full_name', full_name)
                .eq('date_of_birth', date_of_birth)
                .single();

            if (error) {
                console.error('Error checking patient existence:', error);
                return false;
            }
            return data ? true : false;
        } catch (error) {
            console.error('Unexpected error:', error);
            return false;
        }
    }
    async setPatientPhoneNumber(phone_number) {
        const patient_id = await getPatientIDByName();
        const { data, error } = await supabase
            .from('patients')
            .update({ contact_no: phone_number })
            .eq('patient_id', patient_id);
    
        if (error) {    
            console.error('Update error:', error);
            alert("There was an error setting the phone number.");
            return;
        }
        if (data) {
            alert("Phone number set successfully!");
            console.log("Phone number set successfully:", data);
        }
    }
}