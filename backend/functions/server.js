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

// Your existing routes and middleware here...

// Export the serverless handler
module.exports.handler = serverless(app); 