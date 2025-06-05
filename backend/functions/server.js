const express = require('express');
const cors = require('cors');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const axios = require('axios');
const serverless = require('serverless-http');

const app = express();

// Load environment variables
require('dotenv').config();

// Logger utility
const logger = {
    separator: '\n' + '='.repeat(80) + '\n',
    
    info: (label, data) => {
        console.log('\n👉', label);
        if (data) {
            if (typeof data === 'object') {
                console.log(JSON.stringify(data, null, 2));
            } else {
                console.log(data);
            }
        }
    },
    
    error: (label, error) => {
        console.error('\n❌', label);
        if (error.response) {
            console.error('Response Error:', {
                status: error.response.status,
                data: error.response.data
            });
        } else {
            console.error('Error:', error.message);
        }
    },
    
    success: (label, data) => {
        console.log('\n✅', label);
        if (data) {
            console.log(JSON.stringify(data, null, 2));
        }
    },

    startRequest: () => {
        console.log(logger.separator + 'New Diagnosis Request Started' + logger.separator);
    },

    endRequest: () => {
        console.log(logger.separator + 'Request Complete' + logger.separator);
    }
};

// Initialize GROQ client
const groqClient = axios.create({
    baseURL: 'https://api.groq.com/openai/v1',
    headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for image upload
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "image/png" || file.mimetype === "image/jpeg") {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('Only .png and .jpg formats allowed!'));
        }
    }
});

// Disease database with comprehensive crop coverage
const DISEASE_DATABASE = {
    tomato: {
        leaf_blight: {
            name: 'Leaf Blight',
            confidence_threshold: 0.7,
            color_ranges: {
                infected: { r: [120, 180], g: [70, 120], b: [0, 50] },
                healthy: { r: [0, 100], g: [120, 200], b: [0, 100] }
            },
            symptoms: ['spots on leaves', 'yellowing leaves', 'brown patches'],
            recommendations: [
                'Remove infected leaves immediately',
                'Apply copper-based fungicide',
                'Improve air circulation between plants'
            ]
        },
        early_blight: {
            name: 'Early Blight',
            confidence_threshold: 0.75,
            color_ranges: {
                infected: { r: [150, 200], g: [100, 150], b: [0, 50] },
                healthy: { r: [0, 100], g: [150, 255], b: [0, 100] }
            },
            symptoms: ['concentric rings', 'dark brown spots', 'yellowing'],
            recommendations: [
                'Apply fungicide treatment',
                'Remove and destroy infected plant parts',
                'Maintain proper plant spacing'
            ]
        }
    },
    corn: {
        northern_leaf_blight: {
            name: 'Northern Leaf Blight',
            confidence_threshold: 0.7,
            color_ranges: {
                infected: { r: [130, 190], g: [80, 130], b: [0, 60] },
                healthy: { r: [0, 100], g: [140, 220], b: [0, 100] }
            },
            symptoms: ['long elliptical lesions', 'gray-green spots', 'leaf wilting'],
            recommendations: [
                'Apply fungicide at first sign of disease',
                'Rotate crops annually',
                'Plant resistant varieties next season'
            ]
        },
        rust: {
            name: 'Common Rust',
            confidence_threshold: 0.75,
            color_ranges: {
                infected: { r: [160, 210], g: [60, 110], b: [20, 70] },
                healthy: { r: [0, 100], g: [140, 220], b: [0, 100] }
            },
            symptoms: ['rusty spots', 'yellow spots', 'brown pustules'],
            recommendations: [
                'Apply appropriate fungicide',
                'Improve air circulation',
                'Avoid overhead irrigation'
            ]
        }
    },
    wheat: {
        powdery_mildew: {
            name: 'Powdery Mildew',
            confidence_threshold: 0.7,
            color_ranges: {
                infected: { r: [180, 255], g: [180, 255], b: [180, 255] },
                healthy: { r: [0, 100], g: [140, 220], b: [0, 100] }
            },
            symptoms: ['white powdery coating', 'yellowing leaves', 'stunted growth'],
            recommendations: [
                'Apply sulfur-based fungicide',
                'Improve air circulation',
                'Reduce nitrogen fertilization'
            ]
        },
        leaf_rust: {
            name: 'Leaf Rust',
            confidence_threshold: 0.75,
            color_ranges: {
                infected: { r: [170, 220], g: [70, 120], b: [0, 50] },
                healthy: { r: [0, 100], g: [140, 220], b: [0, 100] }
            },
            symptoms: ['orange pustules', 'yellow spots', 'premature drying'],
            recommendations: [
                'Apply triazole fungicide',
                'Plant resistant varieties',
                'Monitor humidity levels'
            ]
        }
    },
    rice: {
        blast: {
            name: 'Rice Blast',
            confidence_threshold: 0.7,
            color_ranges: {
                infected: { r: [100, 150], g: [70, 120], b: [0, 50] },
                healthy: { r: [0, 100], g: [140, 220], b: [0, 100] }
            },
            symptoms: ['diamond-shaped lesions', 'white-gray centers', 'brown margins'],
            recommendations: [
                'Apply systemic fungicide',
                'Maintain proper water levels',
                'Balance nitrogen fertilization'
            ]
        },
        bacterial_blight: {
            name: 'Bacterial Blight',
            confidence_threshold: 0.75,
            color_ranges: {
                infected: { r: [140, 190], g: [90, 140], b: [0, 50] },
                healthy: { r: [0, 100], g: [140, 220], b: [0, 100] }
            },
            symptoms: ['yellow-orange stripes', 'leaf wilting', 'bacterial ooze'],
            recommendations: [
                'Remove infected plants',
                'Use copper-based bactericides',
                'Improve drainage'
            ]
        }
    },
    soybean: {
        asian_rust: {
            name: 'Asian Rust',
            confidence_threshold: 0.7,
            color_ranges: {
                infected: { r: [150, 200], g: [80, 130], b: [0, 50] },
                healthy: { r: [0, 100], g: [140, 220], b: [0, 100] }
            },
            symptoms: ['small brown spots', 'yellow haloes', 'premature defoliation'],
            recommendations: [
                'Apply preventive fungicide',
                'Monitor humidity levels',
                'Use early-maturing varieties'
            ]
        },
        bacterial_pustule: {
            name: 'Bacterial Pustule',
            confidence_threshold: 0.75,
            color_ranges: {
                infected: { r: [130, 180], g: [90, 140], b: [0, 50] },
                healthy: { r: [0, 100], g: [140, 220], b: [0, 100] }
            },
            symptoms: ['raised pustules', 'yellow halos', 'leaf spots'],
            recommendations: [
                'Plant resistant varieties',
                'Practice crop rotation',
                'Improve field drainage'
            ]
        }
    },
    potato: {
        late_blight: {
            name: 'Late Blight',
            confidence_threshold: 0.7,
            color_ranges: {
                infected: { r: [80, 130], g: [60, 110], b: [0, 50] },
                healthy: { r: [0, 100], g: [140, 220], b: [0, 100] }
            },
            symptoms: ['dark brown spots', 'white fuzzy growth', 'water-soaked areas'],
            recommendations: [
                'Apply fungicide immediately',
                'Remove infected plants',
                'Improve air circulation'
            ]
        },
        early_blight: {
            name: 'Early Blight',
            confidence_threshold: 0.75,
            color_ranges: {
                infected: { r: [140, 190], g: [80, 130], b: [0, 50] },
                healthy: { r: [0, 100], g: [140, 220], b: [0, 100] }
            },
            symptoms: ['concentric rings', 'brown spots', 'yellowing leaves'],
            recommendations: [
                'Apply copper-based fungicide',
                'Practice crop rotation',
                'Maintain plant vigor'
            ]
        }
    }
};

function calculateRegionColors(data, width, startY, endY) {
    let r = 0, g = 0, b = 0;
    let pixelCount = 0;

    for (let y = startY; y < endY; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 3;
            r += data[idx];
            g += data[idx + 1];
            b += data[idx + 2];
            pixelCount++;
        }
    }

    return {
        r: r / pixelCount,
        g: g / pixelCount,
        b: b / pixelCount
    };
}

function calculateColorMatch(avgColor, targetRange) {
    // Calculate how well each color channel matches the target range
    const rMatch = getChannelMatchScore(avgColor.r, targetRange.r);
    const gMatch = getChannelMatchScore(avgColor.g, targetRange.g);
    const bMatch = getChannelMatchScore(avgColor.b, targetRange.b);
    // Weight green channel more as it's more important for plant health
    const weightedScore = (rMatch * 0.3 + gMatch * 0.4 + bMatch * 0.3) * 100;
    return Math.min(Math.max(weightedScore, 0), 100);
}

function getChannelMatchScore(value, range) {
    if (value >= range[0] && value <= range[1]) {
        return 1;
    }
    // Calculate distance to nearest range boundary
    const distToRange = Math.min(
        Math.abs(value - range[0]),
        Math.abs(value - range[1])
    );
    // Convert distance to a score between 0 and 1
    return Math.max(0, 1 - (distToRange / 50));
}

async function analyzeImage(imageBuffer, cropType) {
    try {
        // Read and process image from buffer
        const image = sharp(imageBuffer);
        const { data, info } = await image
            .resize(300, 300, { fit: 'inside' })
            .raw()
            .toBuffer({ resolveWithObject: true });

        // Calculate average colors for different regions
        const regions = {
            top: calculateRegionColors(data, info.width, 0, Math.floor(info.height / 3)),
            middle: calculateRegionColors(data, info.width, Math.floor(info.height / 3), Math.floor(2 * info.height / 3)),
            bottom: calculateRegionColors(data, info.width, Math.floor(2 * info.height / 3), info.height)
        };

        // Check against known disease patterns
        const diseases = DISEASE_DATABASE[cropType];
        if (!diseases) {
            logger.error('Unsupported Crop Type', { cropType });
            return null;
        }

        const results = [];
        for (const [diseaseName, diseaseData] of Object.entries(diseases)) {
            const { color_ranges } = diseaseData;
            // Calculate match scores for each region
            const regionScores = Object.values(regions).map(regionColor => 
                calculateColorMatch(regionColor, color_ranges.infected)
            );
            // Get the highest match score
            const maxScore = Math.max(...regionScores);
            const avgScore = regionScores.reduce((a, b) => a + b, 0) / regionScores.length;
            // Calculate final confidence score
            const confidence = (maxScore * 0.7 + avgScore * 0.3);
            if (confidence > diseaseData.confidence_threshold) {
                results.push({
                    disease: diseaseName,
                    confidence: Math.min(confidence * 1.2, 100), // Scale up but cap at 100
                    data: diseaseData,
                    regionScores
                });
            }
        }

        // Sort by confidence and return the best match
        results.sort((a, b) => b.confidence - a.confidence);
        return results.length > 0 ? results[0] : null;

    } catch (error) {
        logger.error('Image Analysis Error', error);
        return null;
    }
}

// API Routes
app.post('/api/diagnose', upload.single('image'), async (req, res) => {
    try {
        logger.startRequest();
        
        if (!req.file) {
            throw new Error('No image file provided');
        }

        const cropType = req.body.cropType || 'tomato';
        
        // Process the image
        const imageBuffer = req.file.buffer;
        const processedImage = await sharp(imageBuffer)
            .resize(800, 600, { fit: 'inside' })
            .toBuffer();

        // Analyze the image
        const analysis = await analyzeImage(processedImage, cropType);
        
        logger.success('Analysis complete', analysis);
        logger.endRequest();
        
        res.json(analysis);
    } catch (error) {
        logger.error('Diagnosis failed', error);
        res.status(500).json({ error: error.message });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Export the serverless handler
module.exports.handler = serverless(app, {
  basePath: '/.netlify/functions/server'
}); 