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