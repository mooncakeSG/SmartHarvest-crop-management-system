import config from './config.js';
import AIService from './services/aiService.js';

// AI Model Configuration
const AI_CONFIG = {
    groqApiEndpoint: config.api.groq.endpoint,
    groqApiKey: config.api.groq.apiKey,
    model: config.api.groq.model,
    maxImageSize: config.upload.maxSize,
    supportedFormats: config.upload.supportedFormats
};

// Disease Database with detailed symptoms and treatments
const DISEASE_DATABASE = {
    tomato: {
        'leaf_blight': {
            symptoms: ['spots on leaves', 'yellowing leaves', 'brown patches', 'wilting'],
            severity_levels: {
                mild: 'Small, isolated spots on few leaves',
                moderate: 'Multiple spots, yellowing on several leaves',
                severe: 'Widespread infection, leaf death'
            },
            recommendations: {
                immediate: [
                    'Remove and destroy infected leaves',
                    'Apply appropriate fungicide',
                    'Improve air circulation'
                ],
                preventive: [
                    'Maintain proper plant spacing',
                    'Water at soil level',
                    'Regular inspection'
                ]
            }
        },
        'early_blight': {
            symptoms: ['concentric ring spots', 'yellowing', 'leaf drop'],
            severity_levels: {
                mild: 'Few spots on lower leaves',
                moderate: 'Multiple spots, affecting middle leaves',
                severe: 'Widespread infection, significant defoliation'
            },
            recommendations: {
                immediate: [
                    'Remove infected plant parts',
                    'Apply copper-based fungicide',
                    'Reduce leaf wetness'
                ],
                preventive: [
                    'Rotate crops annually',
                    'Maintain plant vigor',
                    'Use disease-resistant varieties'
                ]
            }
        }
    },
    // Add more crops as needed
};

// Accessibility and ARIA support utilities
const a11y = {
    announce(message) {
        const announcer = document.getElementById('screen-reader-announcer');
        announcer.textContent = message;
    },

    setLoading(isLoading) {
        const loadingIndicator = document.getElementById('loading-indicator');
        const startButton = document.getElementById('start-diagnosis');
        
        if (isLoading) {
            loadingIndicator.classList.remove('hidden');
            loadingIndicator.setAttribute('aria-busy', 'true');
            startButton.setAttribute('aria-disabled', 'true');
            startButton.disabled = true;
            this.announce('Analysis in progress, please wait...');
        } else {
            loadingIndicator.classList.add('hidden');
            loadingIndicator.setAttribute('aria-busy', 'false');
            startButton.removeAttribute('aria-disabled');
            startButton.disabled = false;
        }
    },

    updateResults(results) {
        const resultsSection = document.getElementById('diagnosis-results');
        resultsSection.classList.remove('hidden');
        resultsSection.setAttribute('aria-expanded', 'true');
        
        // Update primary diagnosis
        const primaryDiagnosis = document.getElementById('primary-diagnosis');
        primaryDiagnosis.textContent = results.disease;
        primaryDiagnosis.setAttribute('aria-label', `Primary diagnosis: ${results.disease}`);

        // Update confidence score
        const confidenceScore = document.getElementById('confidence-score');
        const confidenceBar = document.getElementById('confidence-bar');
        const score = Math.round(results.confidence);
        
        confidenceScore.textContent = `${score}%`;
        confidenceBar.style.width = `${score}%`;
        confidenceBar.setAttribute('aria-valuenow', score);
        
        // Update recommended actions
        const actionsList = document.getElementById('recommended-actions');
        actionsList.innerHTML = '';
        results.recommendations.forEach(action => {
            const li = document.createElement('li');
            li.textContent = action;
            li.setAttribute('role', 'listitem');
            actionsList.appendChild(li);
        });

        // Update additional insights
        const insights = document.getElementById('additional-insights');
        insights.textContent = results.insights || results.details;
        
        this.announce('Analysis complete. Results are now available.');
    },

    handleError(error) {
        const errorMessage = `Error: ${error.message}`;
        this.announce(errorMessage);
        
        // Create and show error notification
        const notification = document.createElement('div');
        notification.className = 'error-message';
        notification.setAttribute('role', 'alert');
        notification.textContent = errorMessage;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    }
};

// Crop Diagnosis Implementation
class CropDiagnosis {
    constructor() {
        this.uploadedImages = [];
        this.maxImages = 5;
        this.maxFileSize = 5 * 1024 * 1024; // 5MB
        this.supportedFormats = ['image/jpeg', 'image/png'];
        this.isAnalyzing = false;
        
        this.initialize();
    }

    initialize() {
        // Initialize DOM elements with ARIA attributes
        this.uploadArea = document.getElementById('upload-area');
        this.imageInput = document.getElementById('image-input');
        this.imagePreview = document.getElementById('image-preview');
        this.startButton = document.getElementById('start-diagnosis');
        this.clearButton = document.getElementById('clear-form');
        this.resultsSection = document.getElementById('diagnosis-results');
        this.loadingIndicator = document.getElementById('loading-indicator');
        this.form = document.getElementById('diagnosis-form');

        // Set up ARIA attributes
        this.uploadArea.setAttribute('aria-label', 'Drop zone for uploading images');
        this.uploadArea.setAttribute('role', 'button');
        this.uploadArea.setAttribute('tabindex', '0');
        
        // Event listeners with keyboard support
        this.setupEventListeners();
    }

    setupEventListeners() {
        // File upload handling
        this.uploadArea.addEventListener('click', () => this.imageInput.click());
        this.uploadArea.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.imageInput.click();
            }
        });

        this.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadArea.classList.add('border-green-500');
        });

        this.uploadArea.addEventListener('dragleave', () => {
            this.uploadArea.classList.remove('border-green-500');
        });

        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('border-green-500');
            this.handleFileUpload(e.dataTransfer.files);
        });

        this.imageInput.addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files);
        });

        // Form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.startDiagnosis();
        });

        // Start diagnosis button
        this.startButton.addEventListener('click', () => this.startDiagnosis());
        this.startButton.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.startDiagnosis();
            }
        });

        // Clear form button
        this.clearButton.addEventListener('click', () => this.clearForm());
        this.clearButton.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.clearForm();
            }
        });
    }

    handleFileUpload(files) {
        const fileArray = Array.from(files);
        const validFiles = fileArray.filter(file => {
            if (!this.supportedFormats.includes(file.type)) {
                a11y.announce(`File ${file.name} is not a supported format. Please use JPG or PNG files.`);
                return false;
            }
            if (file.size > this.maxFileSize) {
                a11y.announce(`File ${file.name} exceeds the maximum size of 5MB.`);
                return false;
            }
            return true;
        });

        // Only allow one image at a time
        if (validFiles.length > 0) {
            this.uploadedImages = [validFiles[0]];
        } else {
            this.uploadedImages = [];
        }
        this.updateImagePreview();
        const fileCount = this.uploadedImages.length;
        a11y.announce(`${fileCount} ${fileCount === 1 ? 'image' : 'images'} uploaded successfully.`);
    }

    updateImagePreview() {
        this.imagePreview.innerHTML = '';
        this.imagePreview.classList.remove('hidden');

        this.uploadedImages.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.createElement('div');
                preview.className = 'relative';
                
                const img = document.createElement('img');
                img.src = e.target.result;
                img.className = 'w-full h-48 object-cover rounded-lg';
                img.alt = `Preview of uploaded image ${index + 1}`;
                img.setAttribute('role', 'img');
                
                const removeButton = document.createElement('button');
                removeButton.type = 'button';
                removeButton.className = 'absolute top-2 right-2 bg-red-500 text-white rounded-full p-2';
                removeButton.setAttribute('aria-label', `Remove image ${index + 1}`);
                removeButton.innerHTML = '<i class="fas fa-times" aria-hidden="true"></i>';
                removeButton.addEventListener('click', () => this.removeImage(index));
                
                preview.appendChild(img);
                preview.appendChild(removeButton);
                this.imagePreview.appendChild(preview);
            };
            reader.readAsDataURL(file);
        });
    }

    removeImage(index) {
        this.uploadedImages.splice(index, 1);
        this.updateImagePreview();
        a11y.announce('Image removed successfully.');
    }

    async startDiagnosis() {
        if (this.isAnalyzing || this.uploadedImages.length === 0) {
            return;
        }

        try {
            this.isAnalyzing = true;
            a11y.setLoading(true);

            const cropType = document.getElementById('crop-type').value;
            const symptoms = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
                .map(checkbox => checkbox.value);

            console.log('Starting diagnosis:', { cropType, symptomsCount: symptoms.length });

            // Convert image to base64
            const imageData = await this.fileToBase64(this.uploadedImages[0]);

            try {
                // Try AI analysis first
                console.log('Attempting AI analysis...');
                const aiResult = await AIService.analyzeCropImage(imageData, cropType, symptoms);
                
                if (aiResult && aiResult.disease) {
                    console.log('AI analysis successful:', aiResult);
                    // Update UI with AI results
                    a11y.updateResults({
                        disease: aiResult.disease,
                        confidence: aiResult.confidence,
                        recommendations: aiResult.data.recommendations || [],
                        symptoms: aiResult.data.symptoms || [],
                        details: `Analysis completed using AI. Detected ${aiResult.disease} with ${aiResult.confidence}% confidence.`
                    });
                    return;
                }
            } catch (aiError) {
                console.error('AI analysis failed:', aiError);
                // Fall back to color analysis
                try {
                    console.log('Attempting color analysis...');
                    const colorResult = await this.performColorAnalysis(this.uploadedImages[0], cropType, symptoms);
                    if (colorResult) {
                        console.log('Color analysis successful:', colorResult);
                        a11y.updateResults({
                            disease: colorResult.disease,
                            confidence: colorResult.confidence,
                            recommendations: colorResult.recommendations,
                            symptoms: colorResult.symptoms,
                            details: 'Analysis completed using color analysis due to AI service unavailability.'
                        });
                    } else {
                        throw new Error('Color analysis returned no results');
                    }
                } catch (colorError) {
                    console.error('Color analysis failed:', colorError);
                    throw new Error('Both AI and color analysis failed. Please try again.');
                }
            }

        } catch (error) {
            console.error('Diagnosis error:', error);
            a11y.handleError(error);
        } finally {
            this.isAnalyzing = false;
            a11y.setLoading(false);
        }
    }

    async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    }

    async performColorAnalysis(file, cropType, symptoms) {
        try {
            const endpoint = `${config.api.backend.baseUrl}${config.api.backend.functions.colorAnalysis}`;
            console.log('Starting color analysis:', { cropType, symptomsCount: symptoms.length });

            const formData = new FormData();
            formData.append('image', file);
            formData.append('cropType', cropType);
            formData.append('plantAge', document.getElementById('plant-age').value || '');
            formData.append('symptoms', JSON.stringify(symptoms));
            formData.append('notes', document.getElementById('notes').value || '');

            console.log('Calling color analysis endpoint:', endpoint);
            const response = await fetch(endpoint, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: response.statusText }));
                console.error('Color analysis error:', errorData);
                throw new Error(errorData.error || `Failed to analyze image: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('Color analysis result:', result);

            // Ensure the response has the required fields
            return {
                disease: result.disease || 'Unknown',
                confidence: result.confidence || 0,
                recommendations: Array.isArray(result.recommendations) ? result.recommendations : [],
                symptoms: Array.isArray(result.symptoms) ? result.symptoms : [],
                analysis_method: 'color'
            };
        } catch (error) {
            console.error('Color analysis error:', error);
            throw error;
        }
    }

    clearForm() {
        this.uploadedImages = [];
        this.imagePreview.innerHTML = '';
        this.imagePreview.classList.add('hidden');
        this.form.reset();
        this.resultsSection.classList.add('hidden');
        this.resultsSection.setAttribute('aria-expanded', 'false');
        a11y.announce('Form cleared successfully.');
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new CropDiagnosis();
    
    // Add skip to main content link
    const skipLink = document.createElement('a');
    skipLink.href = '#main';
    skipLink.className = 'skip-to-main';
    skipLink.textContent = 'Skip to main content';
    document.body.insertBefore(skipLink, document.body.firstChild);
}); 