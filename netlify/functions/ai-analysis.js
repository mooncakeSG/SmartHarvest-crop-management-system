import { Handler } from '@netlify/functions';

const headers = {
  'Access-Control-Allow-Origin': '*',  // Temporarily allow all origins for testing
  'Access-Control-Allow-Headers': 'Content-Type, Accept',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

export const handler = async (event, context) => {
  console.log('AI Analysis function called');
  console.log('Request method:', event.httpMethod);
  console.log('Request headers:', event.headers);
  
  // Handle OPTIONS request for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    console.log('Request body:', event.body);
    const { cropType, symptomsCount = 0 } = JSON.parse(event.body || '{}');

    if (!cropType) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Crop type is required' })
      };
    }

    // Return the diagnosis in the required format
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        diagnosis: `AI diagnosed ${cropType} with ${symptomsCount} symptoms.`,
        confidence: 85,
        recommendations: [
          'Remove infected leaves',
          'Apply appropriate fungicide',
          'Improve air circulation'
        ]
      })
    };
  } catch (error) {
    console.error('AI Analysis Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal Server Error',
        message: error.message
      })
    };
  }
}; 