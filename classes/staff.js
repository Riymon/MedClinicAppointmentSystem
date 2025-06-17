import User from './user.js';
import supabase from './database.js';
import Appointments from './appointments.js';

export class Staff extends User {
    constructor(user_id, staff_id, full_name, email, phone_number, password, is_doctor) {
        // First call super() with required User parameters
        super(this.data);

        // Then set Staff-specific properties
        this.data = {
            user_id: user_id,
            staff_id: staff_id,
            full_name: full_name,
            email: email,
            phone_number: phone_number,
            password: password,
            type: '',
            position: '',
            date_hired: '',
            is_doctor: is_doctor,
            specialization: '',
            medical_license: '',
            max_appointments_per_day: ''
        };

        console.log('Staff instance created with data:', this.data);
    }

    applyMixins(targetClass, baseClasses) {
        console.log('Applying mixins to:', targetClass.name);
        baseClasses.forEach(baseClass => {
            Object.getOwnPropertyNames(baseClass.prototype).forEach(name => {
                targetClass.prototype[name] = baseClass.prototype[name];
            });
        });
    }
}