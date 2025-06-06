const handleAPIError = (error, context) => {
    console.error(`Error in ${context}:`, error);

    // Handle JSON parsing errors
    if (error.message.includes('Unexpected token')) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: 'Invalid response format',
                details: 'Failed to parse AI service response',
                requestId: context.requestId
            })
        };
    }

    // Handle API timeout errors
    if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
        return {
            statusCode: 504,
            body: JSON.stringify({
                error: 'Gateway Timeout',
                details: 'The AI service request timed out',
                requestId: context.requestId
            })
        };
    }

    // Default error response
    return {
        statusCode: 500,
        body: JSON.stringify({
            error: 'Internal Server Error',
            details: 'An unexpected error occurred',
            requestId: context.requestId
        })
    };
};

module.exports = {
    handleAPIError
}; 