const express = require('express');
const cors = require('cors');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const axios = require('axios');

const app = express();
const port = 3000;

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
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

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

// Ensure uploads directory exists
(async () => {
    try {
        await fs.mkdir('uploads', { recursive: true });
    } catch (err) {
        console.error('Error creating uploads directory:', err);
    }
})();

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

// Helper function to encode image to base64
async function imageToBase64(filePath) {
    const imageBuffer = await fs.readFile(filePath);
    return imageBuffer.toString('base64');
}

// AI Analysis function
async function analyzeImageWithAI(imagePath, cropType, symptoms = []) {
    logger.info('Starting AI Analysis', {
        cropType,
        symptoms,
        imagePath
    });

    try {
        const base64Image = await imageToBase64(imagePath);
        logger.info('Image converted to base64');

        // Ensure symptoms is an array
        if (typeof symptoms === 'string') {
            try {
                symptoms = JSON.parse(symptoms);
            } catch (err) {
                logger.error('Invalid symptoms format', err);
                symptoms = [];
            }
        }

        // Improved prompt for Groq Llama model with insights field
        const prompt = `You are an expert agricultural pathologist. Analyze the following plant image for disease detection and severity assessment.

Crop type: ${cropType}
${symptoms && symptoms.length ? `Reported symptoms: ${symptoms.join(', ')}` : 'No specific symptoms reported.'}
${typeof req !== 'undefined' && req.body && req.body.plantAge ? `Plant age: ${req.body.plantAge} weeks.` : ''}
${typeof req !== 'undefined' && req.body && req.body.notes ? `Additional notes: ${req.body.notes}` : ''}

Instructions:
- Carefully examine the image and provided information.
- Identify the most likely disease (if any), its severity, and visible symptoms.
- Suggest immediate treatment and preventive measures.
- If the plant appears healthy, state so clearly.
- Include a field "insights" with a concise summary of your reasoning or any additional observations.
- Respond ONLY in the following JSON format:
{
  "disease_name": "name of the detected disease or 'Healthy'",
  "confidence": number between 0-100,
  "symptoms_detected": ["list", "of", "visible", "symptoms"],
  "severity": "mild/moderate/severe/none",
  "recommendations": ["list", "of", "treatment", "steps"],
  "preventive_measures": ["list", "of", "preventive", "measures"],
  "insights": "..."
}`;

        logger.info('Sending request to GROQ API', { prompt });

        const response = await groqClient.post('/chat/completions', {
            model: 'meta-llama/llama-4-scout-17b-16e-instruct',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert agricultural pathologist. Analyze the image and symptoms to diagnose crop diseases.'
                },
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: prompt
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:image/jpeg;base64,${base64Image}`
                            }
                        }
                    ]
                }
            ],
            temperature: 0.3,
            max_tokens: 500
        });

        logger.success('GROQ API Response Received', response.data);

        if (!response.data.choices || !response.data.choices[0]) {
            throw new Error('Invalid response format from GROQ API');
        }

        let content = response.data.choices[0].message.content.trim();
        // Remove code block markers if present
        if (content.startsWith('```')) {
            content = content.replace(/^```(\w+)?/, '').replace(/```$/, '').trim();
        }
        const aiAnalysis = JSON.parse(content);
        logger.success('AI Analysis Result', aiAnalysis);
        return aiAnalysis;

    } catch (error) {
        logger.error('AI Analysis Failed', error);
        if (error.response) {
            logger.error('GROQ API Error Response', error.response.data);
        }
        return null;
    }
}

// Image analysis functions
async function analyzeImage(imagePath, cropType) {
    try {
        // Read and process image
        const image = sharp(imagePath);
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

// Modified diagnosis endpoint
app.post('/api/diagnose', upload.array('images', 5), async (req, res) => {
    logger.startRequest();

    try {
        // Log request details
        logger.info('Request Details', {
            body: req.body,
            files: req.files?.length || 0
        });

        // Input validation
        if (!req.files || req.files.length === 0) {
            logger.error('Validation Error', new Error('No images uploaded'));
            return res.status(400).json({ error: 'No images uploaded' });
        }

        const { cropType, plantAge } = req.body;
        
        if (!cropType) {
            logger.error('Validation Error', new Error('Crop type is required'));
            return res.status(400).json({ error: 'Crop type is required' });
        }

        if (!DISEASE_DATABASE[cropType]) {
            logger.error('Validation Error', new Error(`Unsupported crop type: ${cropType}`));
            return res.status(400).json({ 
                error: `Unsupported crop type: ${cropType}`,
                supported_types: Object.keys(DISEASE_DATABASE)
            });
        }

        // Parse symptoms
        let symptoms = req.body.symptoms;
        logger.info('Processing Symptoms', { raw: symptoms });
        
        if (typeof symptoms === 'string') {
            try {
                symptoms = JSON.parse(symptoms);
                logger.success('Symptoms Parsed', symptoms);
            } catch (e) {
                logger.error('Symptoms Parse Error', e);
                symptoms = [];
            }
        }

        // Always try AI analysis if GROQ_API_KEY is set
        if (process.env.GROQ_API_KEY) {
            logger.info('AI path: GROQ_API_KEY is set, entering AI analysis block.');
            try {
                logger.info('Starting AI Analysis Pipeline');
                const aiResults = [];
                for (const file of req.files) {
                    logger.info(`Calling analyzeImageWithAI for file: ${file.path}`);
                    const aiAnalysis = await analyzeImageWithAI(file.path, cropType, symptoms);
                    if (aiAnalysis) {
                        aiResults.push(aiAnalysis);
                    } else {
                        logger.error('AI analysis returned null or invalid response for file:', file.path);
                    }
                }
                if (aiResults.length > 0) {
                    logger.success('AI Analysis Successful');
                    const bestResult = aiResults.reduce((best, current) => {
                        return (!best || current.confidence > best.confidence) ? current : best;
                    });
                    const response = {
                        status: 'disease_detected',
                        disease: bestResult.disease_name,
                        confidence: bestResult.confidence,
                        severity: bestResult.severity,
                        symptoms: bestResult.symptoms_detected,
                        recommendations: bestResult.recommendations,
                        preventive_measures: bestResult.preventive_measures,
                        analysis_method: 'ai',
                        details: bestResult.insights || `AI-based analysis of ${req.files.length} images. ` +
                                `Plant age: ${plantAge || 'unknown'} weeks. ` +
                                `Reported symptoms: ${symptoms && symptoms.length ? symptoms.join(', ') : 'None'}`
                    };
                    // Clean up files
                    await Promise.all(req.files.map(file => fs.unlink(file.path)));
                    logger.success('Final Response', response);
                    logger.endRequest();
                    return res.json(response);
                } else {
                    logger.error('AI path: No valid AI results, falling back to color-based analysis.');
                }
            } catch (error) {
                logger.error('AI Analysis Pipeline Failed', error);
                if (error.response) {
                    logger.error('GROQ API Error Response', error.response.data);
                }
                logger.error('AI path: Exception thrown, falling back to color-based analysis.');
                // Continue to fallback analysis
            }
        } else {
            logger.info('AI path: GROQ_API_KEY not set, skipping AI analysis.');
        }

        // Fallback to enhanced color analysis
        logger.info('Starting Enhanced Color-based Analysis');
        const analysisResults = await Promise.all(req.files.map(file => analyzeImage(file.path, cropType)));
        
        // Clean up files
        await Promise.all(req.files.map(file => fs.unlink(file.path)));

        // Filter out null results and sort by confidence
        const validResults = analysisResults
            .filter(result => result !== null)
            .sort((a, b) => b.confidence - a.confidence);

        let response;
        if (validResults.length === 0) {
            response = {
                status: 'healthy',
                confidence: 95,
                analysis_method: 'color',
                message: 'No disease detected. Plant appears healthy.',
                recommendations: [
                    'Continue regular maintenance',
                    'Monitor for any changes',
                    'Maintain good watering practices'
                ],
                details: `Enhanced color analysis of ${req.files.length} images shows no signs of disease. ` +
                        `Plant age: ${plantAge || 'unknown'} weeks. ` +
                        (symptoms.length ? `Reported symptoms: ${symptoms.join(', ')}` : 'No symptoms reported.')
            };
        } else {
            const bestMatch = validResults[0];
            response = {
                status: 'disease_detected',
                disease: bestMatch.data.name,
                confidence: Math.round(bestMatch.confidence),
                analysis_method: 'color',
                symptoms: bestMatch.data.symptoms,
                recommendations: bestMatch.data.recommendations,
                region_analysis: bestMatch.regionScores,
                details: `Enhanced color-based analysis of ${req.files.length} images ` +
                        (symptoms.length ? `and reported symptoms (${symptoms.join(', ')}) ` : '') +
                        `detected ${bestMatch.data.name} with ${Math.round(bestMatch.confidence)}% confidence. ` +
                        `Plant age: ${plantAge || 'unknown'} weeks.`
            };
        }

        logger.success('Final Response', response);
        logger.endRequest();
        return res.json(response);

    } catch (error) {
        logger.error('Request Failed', error);
        logger.endRequest();
        res.status(500).json({ 
            error: 'Internal server error during diagnosis',
            details: error.message
        });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 