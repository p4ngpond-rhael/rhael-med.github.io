// --- Mobile Menu Toggle ---
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');
mobileMenuButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
});

// --- Dark Mode Toggle ---
const darkModeToggle = document.getElementById('dark-mode-toggle');
const darkModeToggleMobile = document.getElementById('dark-mode-toggle-mobile');
const htmlElement = document.documentElement;

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

document.addEventListener('DOMContentLoaded', async () => {
    const yearTitle = document.getElementById('year-title');
    const topicGrid = document.getElementById('topic-grid');

    // 1. Get the year from the URL parameter
    const params = new URLSearchParams(window.location.search);
    const year = params.get('year');

    if (!year) {
        yearTitle.textContent = 'Year not specified';
        return;
    }

    yearTitle.textContent = `Year ${year} Topics`;

    // 2. Fetch topics for that year from the server
    try {
        // Paste your own URL and Key here
        const SUPABASE_URL = 'https://fyobccfvksrhymgwomgh.supabase.co';
        const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5b2JjY2Z2a3NyaHltZ3dvbWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNzk3MTAsImV4cCI6MjA3MDg1NTcxMH0.osLjVvGFH2bVP6M021JC-NGsImx-6GikhK6VrYQYjVk';

        // The URL now includes Supabase's structure and a filter
        const response = await fetch(`${SUPABASE_URL}/rest/v1/topics?year=eq.${year}&select=*`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });
        const topics = await response.json();

        if (topics.length === 0) {
            topicGrid.innerHTML = '<p>No topics found for this year.</p>';
            return;
        }

        // 3. Build the topic cards dynamically
        topics.forEach(topic => {
            const card = document.createElement('a');
            card.className = 'topic-card';
            // This link now passes the topic's unique ID
            card.href = `material-details.html?topic_id=${topic.id}`;
            card.innerHTML = `
                <div>
                    <div class="topic-card-icon"><i class="fas fa-brain"></i></div>
                    <h3>${topic.name}</h3>
                    <p>${topic.description}</p>
                </div>
                <div class="topic-card-footer">
                    <span>View Materials <i class="fas fa-arrow-right"></i></span>
                </div>
            `;
            topicGrid.appendChild(card);
        });

    } catch (error) {
        console.error('Failed to fetch topics:', error);
        topicGrid.innerHTML = '<p>Error loading topics. Please try again later.</p>';
    }
});
