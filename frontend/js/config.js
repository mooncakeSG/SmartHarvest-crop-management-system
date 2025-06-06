// Configuration management for SmartHarvest application
const config = {
    // API Configuration
    api: {
        groq: {
            endpoint: 'https://api.groq.com/openai/v1/chat/completions',
            // Use environment variables from Vite if available
            apiKey: import.meta.env.VITE_GROQ_API_KEY || 'your_groq_api_key_here',
            model: 'llama2-70b-4096',  // Updated to LLama 2 model
            maxRetries: 2,
            timeout: 30000, // 30 seconds
            systemPrompt: `You are an expert agricultural AI assistant specializing in crop disease detection.
                         Your task is to analyze plant images and symptoms to identify diseases with high accuracy.
                         Always provide structured responses with disease name, confidence level, symptoms, and recommendations.
                         Base your analysis on visual patterns, reported symptoms, and known disease characteristics.`,
            // Add response validation
            validateResponse: (response) => {
                try {
                    if (typeof response === 'string') {
                        response = JSON.parse(response);
                    }
                    return response;
                } catch (error) {
                    console.error('Failed to parse Groq API response:', error);
                    throw new Error('Invalid response format from AI service');
                }
            }
        },
        backend: {
            baseUrl: import.meta.env.VITE_NODE_ENV === 'production' 
                ? import.meta.env.VITE_API_URL || 'https://your-production-url.com'
                : 'http://localhost:3000'
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
        maxImages: 5
    },

    // AI Analysis Settings
    ai: {
        confidenceThreshold: 0.7,
        fallbackToColor: true,
        enhancedAnalysis: true,
        regionAnalysis: true,
        responseFormat: {
            structure: {
                disease: "string",
                confidence: "number (0-100)",
                symptoms: "array of strings",
                recommendations: "array of strings",
                details: "string"
            },
            example: {
                disease: "Leaf Blight",
                confidence: 85,
                symptoms: ["yellowing leaves", "brown spots", "wilting"],
                recommendations: ["remove infected leaves", "apply fungicide"],
                details: "Analysis shows characteristic patterns of Leaf Blight"
            }
        }
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
        multiImageAnalysis: true,
        symptomTracking: true,
        treatmentRecommendations: true
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