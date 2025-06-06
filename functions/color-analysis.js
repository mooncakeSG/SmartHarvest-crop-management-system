const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Accept',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

exports.handler = async function(event, context) {
  // Log all incoming request details
  console.log('Color Analysis function called with:');
  console.log('HTTP Method:', event.httpMethod);
  console.log('Headers:', JSON.stringify(event.headers, null, 2));
  console.log('Body:', event.body);
  console.log('Path:', event.path);

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // Parse the request body
    let data;
    try {
      data = JSON.parse(event.body);
      console.log('Parsed request data:', data);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Invalid JSON',
          details: parseError.message
        })
      };
    }

    // Validate required fields
    if (!data || !data.cropType) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Bad Request',
          message: 'cropType is required'
        })
      };
    }

    // Process the request and return response
    const response = {
      result: `Color analysis completed for ${data.cropType}.`,
      confidence: 75,
      recommendations: [
        'Prune affected areas',
        'Improve drainage',
        'Apply copper-based fungicide'
      ]
    };

    console.log('Sending response:', response);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response)
    };
  } catch (error) {
    console.error('Function Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal Server Error',
        message: error.message,
        stack: error.stack
      })
    };
  }
}; 