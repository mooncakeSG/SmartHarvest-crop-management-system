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

        // First get the response as JSON directly
        const groqResponse = await response.json();
        console.log('Groq API Response:', JSON.stringify(groqResponse, null, 2));

        // Extract the content from the message
        const messageContent = groqResponse.choices?.[0]?.message?.content;
        if (!messageContent) {
            throw new Error('Invalid response structure from Groq API');
        }

        // Try to parse the content if it's a string, otherwise use it directly
        let parsedData;
        try {
            parsedData = typeof messageContent === 'string' 
                ? JSON.parse(messageContent) 
                : messageContent;
        } catch (parseError) {
            console.error('Failed to parse message content:', messageContent);
            throw new Error('Invalid JSON in AI response content');
        }

        // Create the formatted response
        const formattedResponse = {
            disease: parsedData.disease || "Unknown",
            confidence: parseFloat(parsedData.confidence) || 0,
            data: {
                name: parsedData.disease || "Unknown",
                confidence_threshold: 0.7,
                color_ranges: parsedData.color_ranges || {},
                recommendations: Array.isArray(parsedData.recommendations) ? parsedData.recommendations : [],
                symptoms: Array.isArray(parsedData.symptoms) ? parsedData.symptoms : []
            }
        };

        // Log the final formatted response
        console.log('Formatted Response:', JSON.stringify(formattedResponse, null, 2));

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(formattedResponse)
        };

    } catch (error) {
        console.error('Analysis Error:', {
            message: error.message,
            stack: error.stack,
            context: context
        });
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
        if (!data.image) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Image data is required' })
            };
        }
        return await analyzeImage(data.image, context);
    } catch (error) {
        return handleAPIError(error, {
            requestId: context.requestId,
            service: 'Request Handler'
        });
    }
}; 