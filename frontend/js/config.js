// Configuration management for SmartHarvest application
const config = {
    // API Configuration
    api: {
        groq: {
            endpoint: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/diagnose',
            apiKey: 'your_groq_api_key_here',
            model: 'meta-llama/llama-4-scout-17b-16e-instruct'
        }
    },

    // Application Settings
    app: {
        env: 'development',
        port: 3000,
        host: 'localhost'
    },

    // Image Upload Settings
    upload: {
        maxSize: 5 * 1024 * 1024, // 5MB
        supportedFormats: ['image/jpeg', 'image/png'],
        uploadDir: 'uploads/images'
    },

    // AI Model Settings
    ai: {
        confidenceThreshold: 0.7,
        maxRetries: 3,
        requestTimeout: 30000 // 30 seconds
    },

    // Cache Settings
    cache: {
        enabled: false,
        ttl: 3600, // 1 hour
        redisUrl: 'redis://localhost:6379'
    },

    // Security Settings
    security: {
        jwtSecret: 'default_jwt_secret_change_in_production',
        corsOrigins: ['http://localhost:3000'],
        rateLimit: {
            window: 900000, // 15 minutes
            maxRequests: 100
        }
    },

    // Feature Flags
    features: {
        aiDiagnosis: true,
        weatherIntegration: false,
        emailNotifications: false,
        realTimeMonitoring: false
    },

    // Logging Configuration
    logging: {
        level: 'debug',
        filePath: 'logs/app.log'
    },

    // Development Tools
    development: {
        debug: true,
        enableSwagger: true,
        testMode: false
    }
};

// Validate critical configuration
function validateConfig() {
    const requiredInProduction = [
        'GROQ_API_KEY',
        'JWT_SECRET',
        'DB_PASSWORD'
    ];

    if (config.app.env === 'production') {
        for (const key of requiredInProduction) {
            if (!process.env[key]) {
                throw new Error(`Missing required environment variable in production: ${key}`);
            }
        }
    }

    // Validate image upload size
    if (config.upload.maxSize > 10 * 1024 * 1024) { // 10MB
        console.warn('Warning: Maximum upload size is set above recommended 10MB limit');
    }

    // Validate AI confidence threshold
    if (config.ai.confidenceThreshold < 0 || config.ai.confidenceThreshold > 1) {
        throw new Error('AI confidence threshold must be between 0 and 1');
    }
}

// Export configuration
export default {
    ...config,
    validate: validateConfig
}; 