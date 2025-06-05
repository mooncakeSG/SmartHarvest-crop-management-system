// Import and initialize modules
import './config.js';
import './diagnose.js';
import './assistant.js';
import './analysis.js';

// Initialize Chart.js
import Chart from 'chart.js/auto';
window.Chart = Chart;

// DOM Elements
const sidebar = document.querySelector('.sidebar');
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mainContent = document.querySelector('main');

// Navigation
function navigateToSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section-container').forEach(section => {
        section.classList.remove('active');
    });

    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        // Update active state in sidebar
        document.querySelectorAll('.sidebar a').forEach(link => {
            link.classList.remove('text-green-600', 'bg-green-50');
            link.classList.add('text-gray-700');
        });
        const activeLink = document.querySelector(`.sidebar a[href="#${sectionId}"]`);
        if (activeLink) {
            activeLink.classList.remove('text-gray-700');
            activeLink.classList.add('text-green-600', 'bg-green-50');
        }
    }

    // Close sidebar on mobile after navigation
    if (window.innerWidth < 768) {
        sidebar.classList.remove('open');
        sidebar.classList.add('closed');
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    console.log('Application initialized');
    // Mobile menu toggle
    mobileMenuButton.addEventListener('click', () => {
        sidebar.classList.toggle('closed');
        sidebar.classList.toggle('open');
    });

    // Handle navigation clicks
    document.querySelectorAll('.sidebar a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('href').substring(1);
            navigateToSection(sectionId);
            history.pushState(null, '', `#${sectionId}`);
        });
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth < 768) {
            if (!sidebar.contains(e.target) && !mobileMenuButton.contains(e.target)) {
                sidebar.classList.remove('open');
                sidebar.classList.add('closed');
            }
        }
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 768) {
            sidebar.classList.remove('closed');
            sidebar.classList.remove('open');
        } else {
            sidebar.classList.add('closed');
        }
    });

    // Handle browser back/forward
    window.addEventListener('popstate', () => {
        const sectionId = window.location.hash.substring(1) || 'home';
        navigateToSection(sectionId);
    });

    // Navigate to initial section
    const initialSection = window.location.hash.substring(1) || 'home';
    navigateToSection(initialSection);
});

// Utility Functions
function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

function showLoading() {
    const loader = document.getElementById('loading');
    if (loader) loader.classList.remove('hidden');
}

function hideLoading() {
    const loader = document.getElementById('loading');
    if (loader) loader.classList.add('hidden');
} 