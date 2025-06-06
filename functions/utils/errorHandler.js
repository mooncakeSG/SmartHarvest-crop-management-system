const handleAPIError = (error, context) => {
    console.error(`Error in ${context.service}:`, {
        error: error.message,
        stack: error.stack,
        requestId: context.requestId
    });

    // Handle JSON parsing errors
    if (error.message.includes('Unexpected token') || error.message.includes('Invalid JSON')) {
        return {
            statusCode: 400,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                error: 'Invalid response format',
                details: error.message,
                requestId: context.requestId,
                errorType: 'PARSING_ERROR'
            })
        };
    }

    // Handle API timeout errors
    if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
        return {
            statusCode: 504,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                error: 'Gateway Timeout',
                details: 'The AI service request timed out',
                requestId: context.requestId,
                errorType: 'TIMEOUT_ERROR'
            })
        };
    }

    // Default error response
    return {
        statusCode: 500,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            error: 'Internal Server Error',
            details: error.message,
            requestId: context.requestId,
            errorType: 'INTERNAL_ERROR'
        })
    };
};

module.exports = {
    handleAPIError
}; 