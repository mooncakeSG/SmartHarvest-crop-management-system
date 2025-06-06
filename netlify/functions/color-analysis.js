import { Handler } from '@netlify/functions';

const headers = {
  'Access-Control-Allow-Origin': '*',  // Temporarily allow all origins for testing
  'Access-Control-Allow-Headers': 'Content-Type, Accept',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

export const handler = async (event, context) => {
  console.log('Color Analysis function called');
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
    let data;
    
    // Parse the request body based on content type
    if (event.headers['content-type']?.includes('application/json')) {
      data = JSON.parse(event.body);
    } else {
      // Assume form data and try to parse it
      const rawBody = event.body;
      try {
        data = JSON.parse(rawBody);
      } catch (e) {
        // If JSON parsing fails, try to parse as URLSearchParams
        const params = new URLSearchParams(rawBody);
        data = {
          cropType: params.get('cropType'),
          symptomsCount: parseInt(params.get('symptomsCount') || '0', 10)
        };
      }
    }

    if (!data || !data.cropType) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Invalid request data',
          message: 'cropType is required'
        })
      };
    }

    console.log('Parsed data:', data);

    // Process the request and return response
    const result = {
      result: `Color analysis done for ${data.cropType}.`,
      confidence: 75,
      recommendations: [
        'Prune affected areas',
        'Improve drainage',
        'Apply copper-based fungicide'
      ]
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error('Color Analysis Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal Server Error',
        message: error.message,
        details: error.stack
      })
    };
  }
}; 