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

// --- Profile Dropdown Toggle ---
// --- NEW: User Session Management Script ---
const loginButton = document.getElementById('login-button');
const profileMenu = document.getElementById('profile-menu');
const profileIcon = document.getElementById('profile-icon');
const profileDropdown = document.getElementById('profile-dropdown');
const logoutLink = document.getElementById('logout-link');

const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));

if (currentUser) {
    loginButton.classList.add('hidden');
    profileMenu.classList.remove('hidden');
    profileIcon.textContent = currentUser.username.charAt(0).toUpperCase();
    document.getElementById('dropdown-username').textContent = currentUser.username;
    document.getElementById('dropdown-email').textContent = currentUser.email;
} else {
    loginButton.classList.remove('hidden');
    profileMenu.classList.add('hidden');
}

profileIcon.addEventListener('click', () => {
    profileDropdown.classList.toggle('show');
});

logoutLink.addEventListener('click', (e) => {
    e.preventDefault();
    sessionStorage.removeItem('currentUser');
    window.location.reload();
});

window.addEventListener('click', (e) => {
    if (!profileMenu.contains(e.target)) {
        profileDropdown.classList.remove('show');
    }
});

// --- Changelog Toggle ---
const changelogBubble = document.getElementById('changelog-bubble');
const changelogPanel = document.getElementById('changelog-panel');
changelogBubble.addEventListener('click', (event) => {
    event.stopPropagation();
    changelogPanel.classList.toggle('hidden');
});

document.addEventListener('click', (event) => {
    if (!changelogPanel.classList.contains('hidden') && !changelogPanel.contains(event.target) && !changelogBubble.contains(event.target)) {
        changelogPanel.classList.add('hidden');
    }
});

// --- Active Nav Link Styling on Scroll ---
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('main section');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (pageYOffset >= sectionTop - 70) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').substring(1) === current) {
            link.classList.add('active');
        }
    });
});