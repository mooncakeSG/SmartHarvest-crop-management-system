// Analysis Charts Implementation
class AnalysisCharts {
    constructor() {
        this.charts = {};
        this.initialize();
    }

    initialize() {
        // Only initialize if we're on the analysis page
        if (document.getElementById('analysis').classList.contains('hidden')) {
            return;
        }

        this.initializeYieldChart();
        this.initializeSoilChart();
        this.initializeMoistureChart();

        // Handle date range changes
        const dateRange = document.getElementById('date-range');
        if (dateRange) {
            dateRange.addEventListener('change', () => this.updateCharts(dateRange.value));
        }
    }

    initializeYieldChart() {
        const ctx = document.getElementById('yield-chart')?.getContext('2d');
        if (!ctx) return;

        this.charts.yield = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Actual Yield',
                    data: [65, 72, 78, 74, 81, 85],
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'Predicted Yield',
                    data: [null, null, null, null, 83, 88],
                    borderColor: '#60A5FA',
                    borderDash: [5, 5],
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Crop Yield Trends (tons/hectare)'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Yield (tons)'
                        }
                    }
                }
            }
        });
    }

    initializeSoilChart() {
        const ctx = document.getElementById('soil-chart')?.getContext('2d');
        if (!ctx) return;

        this.charts.soil = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['pH Level', 'Nitrogen', 'Phosphorus', 'Potassium', 'Organic Matter', 'Moisture'],
                datasets: [{
                    label: 'Current Levels',
                    data: [85, 75, 82, 78, 90, 88],
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    borderColor: '#10B981',
                    pointBackgroundColor: '#10B981'
                }, {
                    label: 'Optimal Range',
                    data: [80, 80, 80, 80, 80, 80],
                    backgroundColor: 'rgba(96, 165, 250, 0.2)',
                    borderColor: '#60A5FA',
                    borderDash: [5, 5],
                    pointBackgroundColor: '#60A5FA'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            stepSize: 20
                        }
                    }
                }
            }
        });
    }

    initializeMoistureChart() {
        const ctx = document.getElementById('moisture-chart')?.getContext('2d');
        if (!ctx) return;

        // Generate 24 hours of mock data
        const labels = Array.from({length: 24}, (_, i) => `${i}:00`);
        const moistureData = Array.from({length: 24}, () => Math.floor(Math.random() * (85 - 65) + 65));

        this.charts.moisture = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Moisture Level',
                    data: moistureData,
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Soil Moisture Levels (%)'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Moisture (%)'
                        }
                    }
                }
            }
        });
    }

    updateCharts(dateRange) {
        // Simulate data update based on selected date range
        const ranges = {
            'week': { dataPoints: 7, label: 'days' },
            'month': { dataPoints: 30, label: 'days' },
            'quarter': { dataPoints: 90, label: 'days' },
            'year': { dataPoints: 12, label: 'months' }
        };

        const range = ranges[dateRange];
        if (!range) return;

        // Update yield chart with new data
        if (this.charts.yield) {
            const newData = Array.from({length: range.dataPoints}, 
                () => Math.floor(Math.random() * (90 - 60) + 60));
            
            this.charts.yield.data.labels = Array.from({length: range.dataPoints}, 
                (_, i) => `${i + 1}`);
            this.charts.yield.data.datasets[0].data = newData;
            this.charts.yield.update();
        }

        // Similarly update other charts...
    }
}

// Initialize charts when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AnalysisCharts();
});

// Re-initialize charts when Analysis tab becomes visible
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        if (link.getAttribute('href') === '#analysis') {
            new AnalysisCharts();
        }
    });
});

// Add export functionality
const exportButton = document.getElementById('export-data');
if (exportButton) {
    exportButton.addEventListener('click', function() {
        // Simulate export functionality
        const data = {
            yield: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Crop Yield (tons)',
                    data: [30, 35, 40, 38, 42, 45],
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true
                }]
            },
            soil: {
                labels: ['pH Level', 'Nitrogen', 'Phosphorus', 'Potassium', 'Organic Matter'],
                datasets: [{
                    label: 'Current Levels',
                    data: [6.5, 75, 82, 68, 90],
                    backgroundColor: 'rgba(59, 130, 246, 0.5)',
                    borderColor: 'rgb(59, 130, 246)',
                    borderWidth: 1
                }]
            },
            moisture: {
                labels: Array.from({length: 24}, (_, i) => `${i}:00`),
                datasets: [{
                    label: 'Soil Moisture (%)',
                    data: Array.from({length: 24}, () => Math.floor(Math.random() * (85 - 60) + 60)),
                    borderColor: '#8B5CF6',
                    tension: 0.4
                }]
            }
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'crop-analysis-data.json';
        a.click();
        window.URL.revokeObjectURL(url);
    });
} 