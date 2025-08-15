// /js/material-details.js

// --- PASTE YOUR SUPABASE CREDENTIALS HERE ---
const SUPABASE_URL = 'https://fyobccfvksrhymgwomgh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5b2JjY2Z2a3NyaHltZ3dvbWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNzk3MTAsImV4cCI6MjA3MDg1NTcxMH0.osLjVvGFH2bVP6M021JC-NGsImx-6GikhK6VrYQYjVk';


// --- This code can run immediately as it just sets up listeners ---

// Mobile Menu Toggle
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');
if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
}

// Dark Mode Toggle
const darkModeToggle = document.getElementById('dark-mode-toggle');
const darkModeToggleMobile = document.getElementById('dark-mode-toggle-mobile');
const htmlElement = document.documentElement;

if (darkModeToggle && darkModeToggleMobile) {
    const toggleDarkMode = () => {
        htmlElement.classList.toggle('dark');
        if (htmlElement.classList.contains('dark')) {
            localStorage.setItem('theme', 'dark');
        } else {
            localStorage.setItem('theme', 'light');
        }
    };
    darkModeToggle.addEventListener('click', toggleDarkMode);
    darkModeToggleMobile.addEventListener('click', toggleDarkMode);
}


// --- This code runs after the HTML document is fully loaded ---
document.addEventListener('DOMContentLoaded', async () => {
    const topicTitle = document.getElementById('topic-title');
    const materialsList = document.getElementById('materials-list');
    const backLink = document.getElementById('back-link');
    const backLinkText = document.querySelector('#back-link span');

    // 1. Get the topic ID from the URL parameter
    const params = new URLSearchParams(window.location.search);
    const topicId = params.get('topic_id');

    if (!topicId) {
        topicTitle.textContent = 'Topic not specified';
        return;
    }

    try {
        // 2. Fetch both the topic details and the materials for that topic from Supabase
        const [topicRes, materialsRes] = await Promise.all([
            fetch(`${SUPABASE_URL}/rest/v1/topics?id=eq.${topicId}&select=*`, {
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
            }),
            fetch(`${SUPABASE_URL}/rest/v1/materials?topic_id=eq.${topicId}&select=*`, {
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
            })
        ]);

        if (!topicRes.ok || !materialsRes.ok) {
            throw new Error('Failed to fetch data from Supabase.');
        }

        const topicData = await topicRes.json();
        const topic = topicData[0]; // Supabase returns an array, we want the first item
        const materials = await materialsRes.json();

        // 3. Update the page titles and back link
        topicTitle.textContent = `${topic.name} Materials`;
        backLink.href = `topic-selection.html?year=${topic.year}`;
        if(backLinkText) backLinkText.textContent = `Back to Year ${topic.year} Topics`;

        if (materials.length === 0) {
            materialsList.innerHTML = '<li>No materials found for this topic.</li>';
            return;
        }

        // 4. Build the materials list dynamically
        materialsList.innerHTML = ''; // Clear any placeholders
        materials.forEach(material => {
            const listItem = document.createElement('li');
            listItem.className = 'material-item';
            listItem.innerHTML = `
                <div class="material-icon"><i class="fas fa-file-alt"></i></div>
                <div class="material-info">
                    <h3>${material.title}</h3>
                    <p>${material.description} (${material.material_type})</p>
                </div>
                <a href="${material.file_url}" class="btn-download" target="_blank" rel="noopener noreferrer">Download</a>
            `;
            materialsList.appendChild(listItem);
        });

    } catch (error) {
        console.error('Failed to fetch materials:', error);
        materialsList.innerHTML = '<li>Error loading materials. Please try again later.</li>';
    }
});
