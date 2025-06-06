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
    // Parse incoming data
    const { image, cropType, symptoms = [] } = JSON.parse(event.body || '{}');

    if (!image) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Image data is required' })
      };
    }

    // TODO: Implement actual AI analysis here
    // For now, return a dummy response
    const result = {
      disease: 'Sample Disease',
      confidence: 85,
      data: {
        name: 'Sample Disease',
        recommendations: [
          'Remove infected leaves',
          'Apply appropriate fungicide',
          'Improve air circulation'
        ],
        symptoms: [
          'Yellow spots on leaves',
          'Brown patches',
          'Wilting'
        ]
      }
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result)
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