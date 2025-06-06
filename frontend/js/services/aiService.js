import config from '../config.js';

class AIService {
    static async analyzeImage(imageData) {
        try {
            const endpoint = `${config.api.backend.baseUrl}${config.api.backend.functions.aiAnalysis}`;
            console.log('Calling AI analysis endpoint:', endpoint);

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Origin': 'https://smartharvestfrontend.netlify.app'
                },
                body: JSON.stringify({ 
                    image: imageData,
                    model: config.api.groq.model
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: response.statusText }));
                console.error('AI service error:', errorData);
                throw new Error(errorData.error || `Failed to analyze image: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('AI analysis result:', result);
            
            // Validate the response structure
            if (!result.disease || typeof result.confidence !== 'number') {
                throw new Error('Invalid response format from AI service');
            }

            return {
                disease: result.disease,
                confidence: result.confidence,
                data: {
                    ...result.data,
                    recommendations: Array.isArray(result.data?.recommendations) 
                        ? result.data.recommendations 
                        : [],
                    symptoms: Array.isArray(result.data?.symptoms) 
                        ? result.data.symptoms 
                        : []
                }
            };
        } catch (error) {
            console.error('AI Analysis Error:', error);
            throw error;
        }
    }

    static async analyzeCropImage(imageData, cropType, symptoms = []) {
        try {
            console.log('Starting crop analysis with:', { cropType, symptomsCount: symptoms.length });
            const result = await this.analyzeImage(imageData);
            
            return {
                disease: result.disease,
                confidence: result.confidence,
                cropType,
                reportedSymptoms: symptoms,
                analysis_method: 'ai',
                data: {
                    name: result.disease,
                    recommendations: result.data.recommendations,
                    symptoms: result.data.symptoms,
                    confidence_threshold: config.ai.confidenceThreshold
                }
            };
        } catch (error) {
            console.error('Crop Analysis Error:', error);
            throw error;
        }
    }

    static validateAnalysisResult(result) {
        return {
            isValid: Boolean(
                result?.disease &&
                typeof result.confidence === 'number' &&
                result.data?.name
            ),
            confidence: result?.confidence || 0,
            meetsThreshold: (result?.confidence || 0) >= config.ai.confidenceThreshold
        };
    }
}

export default AIService; 