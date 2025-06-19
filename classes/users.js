import supabase from './database.js';

export default class User {

    constructor(full_name, email, password, contact_no, role,status){
        this.data = {
            full_name: full_name,
            email: email,
            password: password,
            contact_no: contact_no,
            role: role,
            status: status,
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
                role: this.data.role,
                status: this.data.status
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
            .select('email, password, role, status')
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
 async isBanned() {
        const detailsHtml = `
            <h3>Account Problem</h3>
            <div class="appointment-details">
                <p><strong>Sorry! </strong>your Account is currently not Available.</p>
                <p>Please contact us in the contact page to assist you.</p>
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
}