// /js/login.js

document.addEventListener('DOMContentLoaded', () => {
    // --- YOUR SUPABASE CREDENTIALS ---
    const SUPABASE_URL = 'https://fyobccfvksrhymgwomgh.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5b2JjY2Z2a3NyaHltZ3dvbWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNzk3MTAsImV4cCI6MjA3MDg1NTcxMH0.osLjVvGFH2bVP6M021JC-NGsImx-6GikhK6VrYQYjVk';

    // --- Element Selectors ---
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const formsWrapper = document.querySelector('.forms-wrapper');

    // --- UI Functions ---
    function showForm(formToShow, tabToActivate) {
        if (tabToActivate.classList.contains('active')) return;
        formsWrapper.style.height = `${formToShow.scrollHeight}px`;
        loginForm.classList.remove('active');
        registerForm.classList.remove('active');
        loginTab.classList.remove('active');
        registerTab.classList.remove('active');
        formToShow.classList.add('active');
        tabToActivate.classList.add('active');
    }

    loginTab.addEventListener('click', () => showForm(loginForm, loginTab));
    registerTab.addEventListener('click', () => showForm(registerForm, registerTab));

    window.addEventListener('resize', () => {
        const activeForm = document.querySelector('.auth-form.active');
        if (activeForm) formsWrapper.style.height = `${activeForm.scrollHeight}px`;
    });

    // --- Student Login Form Submission (Supabase) ---
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        try {
            // Query the 'users' table for a matching email and password
            const response = await fetch(`${SUPABASE_URL}/rest/v1/users?email=eq.${email}&password_hash=eq.${password}&select=*`, {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                }
            });

            if (!response.ok) {
                 const errorData = await response.json();
                 throw new Error(errorData.message || 'Login request failed');
            }
            
            const data = await response.json();
            
            if (data.length > 0) { // If Supabase returns at least one matching user
                sessionStorage.setItem('currentUser', JSON.stringify(data[0]));
                window.location.href = 'index.html';
            } else {
                throw new Error('Invalid email or password.');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert(`Login failed: ${error.message}`);
        }
    });

    // --- Registration Form Submission (Supabase) ---
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        
        const registrationData = {
            username: document.getElementById('register-username').value,
            email: document.getElementById('register-email').value,
            password_hash: password, // Match the database column name
            role: 'student'
        };

        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal' // We don't need the created object back
                },
                body: JSON.stringify(registrationData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                // Supabase provides a detailed error for unique constraints
                if (errorData.message.includes('duplicate key value violates unique constraint')) {
                    throw new Error('This email is already registered.');
                }
                throw new Error(errorData.message || 'Registration failed.');
            }
            
            alert('Registration successful! Please log in.');
            showForm(loginForm, loginTab);
        } catch (error) {
            console.error('Registration error:', error);
            alert(`Registration failed: ${error.message}`);
        }
    });

    // Initial form setup
    showForm(loginForm, loginTab);
});
