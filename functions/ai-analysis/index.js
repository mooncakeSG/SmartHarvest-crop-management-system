const { handleAPIError } = require('../utils/errorHandler');

async function analyzeImage(imageData, context) {
    try {
        const response = await fetch(process.env.GROQ_API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "llama2-70b-4096",
                messages: [
                    {
                        role: "system",
                        content: "You are an expert agricultural AI assistant. Analyze the image and provide disease detection results in valid JSON format."
                    },
                    {
                        role: "user",
                        content: `Analyze this image data: ${imageData}`
                    }
                ],
                temperature: 0.1,
                max_tokens: 500,
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const rawData = await response.text();
        let parsedData;
        
        try {
            parsedData = JSON.parse(rawData);
        } catch (parseError) {
            console.error('Failed to parse AI response:', rawData);
            throw new Error('Invalid JSON response from AI service');
        }

        // Ensure the response matches our expected format
        const formattedResponse = {
            disease: parsedData.disease || "Unknown",
            confidence: parseFloat(parsedData.confidence) || 0,
            data: {
                name: parsedData.disease || "Unknown",
                confidence_threshold: 0.7,
                color_ranges: parsedData.color_ranges || {},
                recommendations: parsedData.recommendations || [],
                symptoms: parsedData.symptoms || []
            }
        };

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(formattedResponse)
        };

    } catch (error) {
        return handleAPIError(error, {
            requestId: context.requestId,
            service: 'AI Analysis'
        });
    }
}

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const data = JSON.parse(event.body);
        return await analyzeImage(data.image, context);
    } catch (error) {
        return handleAPIError(error, {
            requestId: context.requestId,
            service: 'Request Handler'
        });
    }
}; 