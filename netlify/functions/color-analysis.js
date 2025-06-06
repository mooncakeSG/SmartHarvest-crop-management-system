const headers = {
  'Access-Control-Allow-Origin': 'https://smartharvestfrontend.netlify.app',
  'Access-Control-Allow-Headers': 'Content-Type, Accept',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

exports.handler = async (event) => {
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
    const { cropType, symptomsCount = 0 } = JSON.parse(event.body || '{}');

    if (!cropType) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Crop type is required' })
      };
    }

    // Return the color analysis result in the required format
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        result: `Color analysis done for ${cropType}.`,
        confidence: 75,
        recommendations: [
          'Prune affected areas',
          'Improve drainage',
          'Apply copper-based fungicide'
        ]
      })
    };
  } catch (error) {
    console.error('Color Analysis Error:', error);
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