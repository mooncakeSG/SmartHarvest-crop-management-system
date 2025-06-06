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
    // Parse incoming data from FormData
    const formData = event.body;
    if (!formData) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Form data is required' })
      };
    }

    // TODO: Implement actual color analysis here
    // For now, return a dummy response
    const result = {
      disease: 'Leaf Spot Disease',
      confidence: 75,
      recommendations: [
        'Prune affected areas',
        'Improve drainage',
        'Apply copper-based fungicide'
      ],
      symptoms: [
        'Dark brown spots',
        'Circular lesions',
        'Leaf discoloration'
      ],
      analysis_method: 'color'
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
        message: error.message
      })
    };
  }
}; 