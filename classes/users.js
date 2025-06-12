import supabase from './database.js';

export default class User {

    constructor(full_name, email, password, contact_no, role){
        this.data = {
            full_name: full_name,
            email: email,
            password: password,
            contact_no: contact_no,
            role: role,
            update_at: ''
        }
    }
    async register() {

    try {
        const { data: userData, error: userError } = await supabase
            .from('user')
            .insert([{
                full_name: this.data.full_name,
                email: this.data.email,
                password: this.data.password,
                contact_no: this.data.contact_no,
                role: this.data.role
            }]);

             
           if (userError) {
            throw new Error(userError.message);
        }

        // Store additional user data in profiles table if needed

        alert('Registration successful!');
        document.getElementById('register-modal').classList.remove('active');
        } catch (error) {
            alert(error.message);
    }
}
    role(admin_pin_input){
        let role = 'user';
        if (this.data.email.endsWith('@wecare.com')) {
            if (!admin_pin_input) {
                throw new Error("Admin PIN is required for @wecare.com email addresses.");
            }
            if (admin_pin_input !== '456123') {
                throw new Error("Invalid admin PIN.");
            }
            role = 'admin';
        }
            this.data.role = role;

        return role;
    }

    async  getUserIDByUserEmail(email) {
        try {
            const { data, error } = await supabase 
                .from('user')
                .select('user_id')
                .eq('email', email)
                .single();
  
            if (error) {
                console.error('Error fetching User ID:', error);
                return null;
            }

            return data?.user_id;
        } catch (error) {
            console.error('Error:', error);
            return null;
        }
    }
async login(email, password) {
    try {
        const { data, error } = await supabase
            .from('user')
            .select('email, password, role')
            .eq('email', email)
            .eq('password', password)
            .single();

        if (error || !data) {
            return null;
        }
        this.data = { ...data };
        return data;
    } catch (err) {
        return null;
    }
}
}