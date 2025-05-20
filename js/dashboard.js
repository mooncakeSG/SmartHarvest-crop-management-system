// API endpoints
const API_BASE_URL = 'http://localhost:5000/api';
const ENDPOINTS = {
    crops: `${API_BASE_URL}/crops`,
    livestock: `${API_BASE_URL}/livestock`
};

// Fetch and display dashboard data
async function loadDashboardData() {
    try {
        const [crops, livestock] = await Promise.all([
            fetchCrops(),
            fetchLivestock()
        ]);

        updateStats(crops, livestock);
        updateRecentActivity(crops, livestock);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showError('Failed to load dashboard data');
    }
}

// Fetch crops data
async function fetchCrops() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(ENDPOINTS.crops, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch crops');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching crops:', error);
        throw error;
    }
}

// Fetch livestock data
async function fetchLivestock() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(ENDPOINTS.livestock, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch livestock');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching livestock:', error);
        throw error;
    }
}

// Update statistics cards
function updateStats(crops, livestock) {
    // Update active crops count
    const activeCrops = crops.filter(crop => {
        const harvestDate = new Date(crop.expected_harvest_date);
        return harvestDate > new Date();
    });
    document.querySelector('.stat-card:nth-child(1) .stat-number').textContent = activeCrops.length;

    // Update livestock count
    document.querySelector('.stat-card:nth-child(2) .stat-number').textContent = livestock.length;

    // Update tasks due (crops needing attention)
    const tasksDue = crops.filter(crop => {
        const plantingDate = new Date(crop.planting_date);
        const daysSincePlanting = Math.floor((new Date() - plantingDate) / (1000 * 60 * 60 * 24));
        return daysSincePlanting % 7 === 0; // Example: tasks due weekly
    }).length;
    document.querySelector('.stat-card:nth-child(3) .stat-number').textContent = tasksDue;

    // Update yield forecast (placeholder calculation)
    const yieldForecast = calculateYieldForecast(crops);
    document.querySelector('.stat-card:nth-child(4) .stat-number').textContent = `${yieldForecast}%`;
}

// Calculate yield forecast (placeholder logic)
function calculateYieldForecast(crops) {
    if (crops.length === 0) return 0;
    
    // Simple placeholder calculation
    const healthyCrops = crops.filter(crop => 
        !crop.disease_issues && !crop.pest_issues
    ).length;
    
    return Math.round((healthyCrops / crops.length) * 100);
}

// Update recent activity section
function updateRecentActivity(crops, livestock) {
    const activityList = document.querySelector('.activity-list');
    if (!activityList) return;

    // Combine and sort activities
    const activities = [
        ...crops.map(crop => ({
            type: 'crop',
            name: crop.name,
            date: new Date(crop.updated_at),
            action: 'updated'
        })),
        ...livestock.map(animal => ({
            type: 'livestock',
            name: animal.animal_type,
            date: new Date(animal.updated_at),
            action: 'updated'
        }))
    ].sort((a, b) => b.date - a.date)
    .slice(0, 5); // Show only 5 most recent activities

    // Clear existing activities
    activityList.innerHTML = '';

    // Add activities to the list
    activities.forEach(activity => {
        const activityElement = document.createElement('div');
        activityElement.className = 'activity-item';
        activityElement.innerHTML = `
            <i class="fas fa-${activity.type === 'crop' ? 'seedling' : 'cow'}"></i>
            <div class="activity-details">
                <p>${activity.name} ${activity.action}</p>
                <small>${formatDate(activity.date)}</small>
            </div>
        `;
        activityList.appendChild(activityElement);
    });
}

// Format date for display
function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

// Show error message
function showError(message) {
    // Implement error notification system
    console.error(message);
    // You could add a toast notification here
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    loadDashboardData();
    
    // Refresh data every 5 minutes
    setInterval(loadDashboardData, 5 * 60 * 1000);
}); 