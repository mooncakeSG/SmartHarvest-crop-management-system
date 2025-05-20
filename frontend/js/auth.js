// API endpoints
const API_BASE_URL = 'http://localhost:5000/api';
const AUTH_ENDPOINTS = {
    register: `${API_BASE_URL}/auth/register`,
    login: `${API_BASE_URL}/auth/login`,
    profile: `${API_BASE_URL}/auth/profile`
};

// Check if user is logged in
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }
    return token;
}

// Handle user registration
async function registerUser(userData) {
    try {
        const response = await fetch(AUTH_ENDPOINTS.register, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Registration failed');
        }

        return data;
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
}

// Handle user login
async function loginUser(credentials) {
    try {
        const response = await fetch(AUTH_ENDPOINTS.login, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }

        // Store token and user data
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));

        return data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

// Get user profile
async function getUserProfile() {
    const token = checkAuth();
    try {
        const response = await fetch(AUTH_ENDPOINTS.profile, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch profile');
        }

        return data;
    } catch (error) {
        console.error('Profile fetch error:', error);
        throw error;
    }
}

// Update user profile
async function updateUserProfile(profileData) {
    const token = checkAuth();
    try {
        const response = await fetch(AUTH_ENDPOINTS.profile, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(profileData)
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Profile update failed');
        }

        // Update stored user data
        localStorage.setItem('user', JSON.stringify(data));

        return data;
    } catch (error) {
        console.error('Profile update error:', error);
        throw error;
    }
}

// Handle logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
}

// Update UI with user data
function updateUserUI() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        const userNameElement = document.querySelector('.user-name');
        if (userNameElement) {
            userNameElement.textContent = user.full_name || user.username;
        }
    }
}

// Initialize auth-related UI elements
document.addEventListener('DOMContentLoaded', () => {
    updateUserUI();
    
    // Add logout functionality to user menu if it exists
    const userMenu = document.querySelector('.user-menu');
    if (userMenu) {
        userMenu.addEventListener('click', () => {
            logout();
        });
    }
}); 