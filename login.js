import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/+esm';
const supabaseUrl = 'https://caeytkufykvjrfizvqcc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhZXl0a3VmeWt2anJmaXp2cWNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0NTQ2NzYsImV4cCI6MjA2NTAzMDY3Nn0.bKHsVqCkmnH-CtX1HlcsxO6fCcUjLboMx4xRqXRsxgg'; // Replace with your actual public key
const supabase = createClient(supabaseUrl, supabaseKey);


document.addEventListener('DOMContentLoaded', function () {
    document.querySelector(".submit-btn").addEventListener('click', async function (event) {
        event.preventDefault();

        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-password').value;

        // Validate input fields
        if (!email || !pass) {
            alert("Please enter both email and password.");
            return;
        }

        // Fetch user data
        const { data, error } = await supabase
            .from('user')
            .select('email', 'password')
            .eq('email', email)
            .eq('password', pass);

        if (error) {
            console.error('Error fetching data:', error);
            alert("An error occurred while logging in. Please try again.");
        } else if (data.length > 0) {
            alert("Login successful!");
            console.log('User Data:', data);
            // Redirect or perform next actions here
        } else {
            alert("Invalid email or password. Please try again.");
            document.getElementById('login-email').value = "";
            document.getElementById('login-password').value = "";
        }
    });
});
