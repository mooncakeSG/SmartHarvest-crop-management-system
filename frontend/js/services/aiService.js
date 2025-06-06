import config from '../config';

class AIService {
    static async analyzeImage(imageData) {
        try {
            const response = await fetch(`${config.api.backend.baseUrl}/.netlify/functions/ai-analysis`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ image: imageData })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to analyze image');
            }

            const result = await response.json();
            
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