// /js/admin-login.js

document.addEventListener('DOMContentLoaded', () => {
    // --- YOUR SUPABASE CREDENTIALS ---
    const SUPABASE_URL = 'https://fyobccfvksrhymgwomgh.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5b2JjY2Z2a3NyaHltZ3dvbWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNzk3MTAsImV4cCI6MjA3MDg1NTcxMH0.osLjVvGFH2bVP6M021JC-NGsImx-6GikhK6VrYQYjVk';

    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');

    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            // Call the secure 'login_admin' function we created in Supabase
            const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/login_admin`, {
                method: 'POST', // Use POST to send data securely in the body
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email_input: email,
                    password_input: password
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Login request failed');
            }

            const data = await response.json();

            if (data.length > 0) {
                // If the function returns an admin user
                sessionStorage.setItem('isAdminLoggedIn', 'true');
                window.location.href = 'admin.html';
            } else {
                // If the function returns an empty array (no match found)
                throw new Error('Invalid credentials or not an admin.');
            }
        } catch (error) {
            errorMessage.textContent = error.message;
            errorMessage.style.display = 'block';
        }
    });
});
