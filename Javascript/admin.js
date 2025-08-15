// /js/admin.js

document.addEventListener('DOMContentLoaded', () => {
    // --- YOUR SUPABASE CREDENTIALS ---
    const SUPABASE_URL = 'https://fyobccfvksrhymgwomgh.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5b2JjY2Z2a3NyaHltZ3dvbWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNzk3MTAsImV4cCI6MjA3MDg1NTcxMH0.osLjVvGFH2bVP6M021JC-NGsImx-6GikhK6VrYQYjVk';

    // --- Cache of all DOM elements ---
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.main-content section');
    const logoutBtn = document.getElementById('logout-btn');

    // Topic Elements
    const topicsTableBody = document.getElementById('topics-table-body');
    const topicModal = document.getElementById('topic-modal');
    const topicForm = document.getElementById('topic-form');
    const addTopicBtn = document.getElementById('add-topic-btn');

    // User Elements
    const usersTableBody = document.getElementById('users-table-body');
    const userModal = document.getElementById('user-modal');
    const userForm = document.getElementById('user-form');
    const addUserBtn = document.getElementById('add-user-btn');

    // --- State Cache ---
    let allTopics = [];
    let allUsers = [];

    // --- Supabase API Helper Function ---
    async function supabaseRequest(tableName, method = 'GET', body = null, id = null) {
        let url = `${SUPABASE_URL}/rest/v1/${tableName}`;
        const options = {
            method,
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation', // Asks Supabase to return the new/updated data
            },
        };

        if (id) {
            url += `?id=eq.${id}`; // Add filter for a specific ID
        } else if (method === 'GET') {
            url += '?select=*'; // Get all columns for a general GET request
        }

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'API request failed');
        }
        // DELETE doesn't return content, so we handle it specially
        return (method !== 'DELETE' && response.status !== 204) ? response.json() : null;
    }

    // --- User Management (Updated for Supabase) ---
    async function loadUsers() {
        try {
            allUsers = await supabaseRequest('users');
            usersTableBody.innerHTML = '';
            allUsers.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user.username}</td>
                    <td>${user.email}</td>
                    <td>${user.role}</td>
                    <td class="actions">
                        <button class="btn btn-secondary edit-user-btn" data-id="${user.id}"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-danger delete-user-btn" data-id="${user.id}"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                usersTableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Failed to load users:', error);
        }
    }

    function openUserModal(mode = 'add', user = null) {
        userForm.reset();
        const passwordGroup = document.getElementById('password-group');
        const passwordInput = document.getElementById('user-password');

        if (mode === 'edit' && user) {
            document.getElementById('user-modal-title').textContent = 'Edit User';
            document.getElementById('user-id').value = user.id;
            document.getElementById('user-username').value = user.username;
            document.getElementById('user-email').value = user.email;
            document.getElementById('user-role').value = user.role;
            passwordGroup.style.display = 'none';
            passwordInput.required = false;
        } else {
            document.getElementById('user-modal-title').textContent = 'Add New User';
            document.getElementById('user-id').value = '';
            passwordGroup.style.display = 'block';
            passwordInput.required = true;
        }
        userModal.classList.remove('hidden');
    }

    addUserBtn.addEventListener('click', () => openUserModal('add'));

    userForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const id = document.getElementById('user-id').value;
        const userData = {
            username: document.getElementById('user-username').value,
            email: document.getElementById('user-email').value,
            role: document.getElementById('user-role').value,
        };
        if (!id) {
            // Match the database column name
            userData.password_hash = document.getElementById('user-password').value;
        }

        const method = id ? 'PATCH' : 'POST'; // Supabase uses PATCH for updates

        try {
            await supabaseRequest('users', method, userData, id);
            userModal.classList.add('hidden');
            loadUsers();
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    });

    usersTableBody.addEventListener('click', async (event) => {
        const target = event.target.closest('button');
        if (!target) return;
        const id = target.dataset.id;

        if (target.classList.contains('edit-user-btn')) {
            const userToEdit = allUsers.find(u => u.id == id);
            if (userToEdit) openUserModal('edit', userToEdit);
        }

        if (target.classList.contains('delete-user-btn')) {
            if (confirm('Are you sure you want to delete this user?')) {
                try {
                    await supabaseRequest('users', 'DELETE', null, id);
                    loadUsers();
                } catch (error) {
                    alert(`Error: ${error.message}`);
                }
            }
        }
    });

    // --- Topic Management (Updated for Supabase) ---
    async function loadTopics() {
        try {
            allTopics = await supabaseRequest('topics');
            topicsTableBody.innerHTML = '';
            allTopics.forEach(topic => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${topic.year}</td>
                    <td>${topic.name}</td>
                    <td>${topic.description}</td>
                    <td class="actions">
                        <button class="btn btn-secondary edit-topic-btn" data-id="${topic.id}"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-danger delete-topic-btn" data-id="${topic.id}"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                topicsTableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Failed to load topics:', error);
        }
    }

    function openTopicModal(mode = 'add', topic = null) {
        topicForm.reset();
        if (mode === 'edit' && topic) {
            document.getElementById('topic-modal-title').textContent = 'Edit Topic';
            document.getElementById('topic-id').value = topic.id;
            document.getElementById('topic-year').value = topic.year;
            document.getElementById('topic-name').value = topic.name;
            document.getElementById('topic-description').value = topic.description;
        } else {
            document.getElementById('topic-modal-title').textContent = 'Add New Topic';
            document.getElementById('topic-id').value = '';
        }
        topicModal.classList.remove('hidden');
    }

    addTopicBtn.addEventListener('click', () => openTopicModal('add'));

    topicForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const id = document.getElementById('topic-id').value;
        const topicData = {
            year: document.getElementById('topic-year').value,
            name: document.getElementById('topic-name').value,
            description: document.getElementById('topic-description').value,
        };
        const method = id ? 'PATCH' : 'POST'; // Supabase uses PATCH for updates
        try {
            await supabaseRequest('topics', method, topicData, id);
            topicModal.classList.add('hidden');
            loadTopics();
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    });

    topicsTableBody.addEventListener('click', async (event) => {
        const target = event.target.closest('button');
        if (!target) return;
        const id = target.dataset.id;
        if (target.classList.contains('edit-topic-btn')) {
            const topicToEdit = allTopics.find(t => t.id == id);
            if (topicToEdit) openTopicModal('edit', topicToEdit);
        }
        if (target.classList.contains('delete-topic-btn')) {
            if (confirm('Are you sure you want to delete this topic?')) {
                try {
                    await supabaseRequest('topics', 'DELETE', null, id);
                    loadTopics();
                } catch (error) {
                    alert(`Error: ${error.message}`);
                }
            }
        }
    });

    // --- General Page Logic ---
    function showSection(targetId) {
        sections.forEach(section => section.classList.add('hidden'));
        const targetSection = document.getElementById(targetId);
        if (targetSection) targetSection.classList.remove('hidden');
    }

    navItems.forEach(item => {
        item.addEventListener('click', (event) => {
            if (item.dataset.section) {
                event.preventDefault();
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                const sectionId = item.dataset.section;
                showSection(sectionId);
                if (sectionId === 'materials') loadTopics();
                if (sectionId === 'users') loadUsers();
            }
        });
    });

    logoutBtn.addEventListener('click', (event) => {
        event.preventDefault();
        sessionStorage.removeItem('isAdminLoggedIn');
        window.location.href = 'admin-login.html';
    });

    showSection('dashboard');
    document.querySelector('.nav-item[data-section="dashboard"]').classList.add('active');
});
