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
                    'Origin': 'https://smartharvestfrontend.netlify.app',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Accept'
                },
                mode: 'cors',
                credentials: 'omit',
                body: JSON.stringify({ 
                    image: imageData,
                    model: config.api.groq.model,
                    timestamp: new Date().toISOString()
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Raw error response:', errorText);
                
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch (e) {
                    errorData = { error: errorText || response.statusText || 'Unknown error' };
                }
                
                console.error('AI service error:', errorData);
                throw new Error(errorData.error || `Failed to analyze image: ${response.statusText}`);
            }

            const rawResponse = await response.text();
            console.log('Raw AI response:', rawResponse);

            let result;
            try {
                result = JSON.parse(rawResponse);
            } catch (e) {
                console.error('Failed to parse AI response:', rawResponse);
                throw new Error('Invalid JSON response from AI service');
            }

            console.log('Parsed AI analysis result:', result);
            
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