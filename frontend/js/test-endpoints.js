// Test utility for serverless functions
async function testEndpoints() {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '<p>Testing serverless functions...</p>';
    let testResults = [];

    // Test AI Analysis
    try {
        console.log('Testing AI Analysis endpoint...');
        resultsDiv.innerHTML += '<p>Testing AI Analysis endpoint...</p>';
        
        const aiResponse = await fetch('https://smartharvestbackend.netlify.app/.netlify/functions/ai-analysis', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                cropType: 'corn',
                symptomsCount: 2
            })
        });
        
        const responseText = await aiResponse.text();
        console.log('Raw AI Response:', responseText);
        
        let aiData;
        try {
            aiData = JSON.parse(responseText);
        } catch (e) {
            throw new Error(`Failed to parse AI response: ${responseText}`);
        }
        
        console.log('AI Analysis Response:', aiData);
        testResults.push({
            test: 'AI Analysis',
            status: 'Success',
            data: aiData
        });
    } catch (error) {
        console.error('AI Analysis Test Failed:', error);
        testResults.push({
            test: 'AI Analysis',
            status: 'Failed',
            error: error.message
        });
    }

    // Test Color Analysis
    try {
        console.log('Testing Color Analysis endpoint...');
        resultsDiv.innerHTML += '<p>Testing Color Analysis endpoint...</p>';
        
        const colorResponse = await fetch('https://smartharvestbackend.netlify.app/.netlify/functions/color-analysis', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                cropType: 'tomato',
                symptomsCount: 3
            })
        });
        
        const responseText = await colorResponse.text();
        console.log('Raw Color Response:', responseText);
        
        let colorData;
        try {
            colorData = JSON.parse(responseText);
        } catch (e) {
            throw new Error(`Failed to parse color response: ${responseText}`);
        }
        
        console.log('Color Analysis Response:', colorData);
        testResults.push({
            test: 'Color Analysis',
            status: 'Success',
            data: colorData
        });
    } catch (error) {
        console.error('Color Analysis Test Failed:', error);
        testResults.push({
            test: 'Color Analysis',
            status: 'Failed',
            error: error.message
        });
    }

    // Display results
    resultsDiv.innerHTML = testResults.map(result => `
        <div style="margin: 10px 0; padding: 10px; border-radius: 4px; background: ${result.status === 'Success' ? '#e8f5e9' : '#ffebee'}">
            <h3 style="margin: 0 0 10px 0">${result.test}: ${result.status}</h3>
            ${result.status === 'Success' 
                ? `<pre style="margin: 0; white-space: pre-wrap">${JSON.stringify(result.data, null, 2)}</pre>`
                : `<p style="color: #c62828; margin: 0">${result.error}</p>`
            }
        </div>
    `).join('');
}

// Create a simple HTML interface for testing
const testHtml = `
<div style="padding: 20px; font-family: Arial, sans-serif;">
    <h2>SmartHarvest Serverless Functions Test</h2>
    <button onclick="testEndpoints()" style="padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;">
        Run Tests
    </button>
    <div id="results" style="margin-top: 20px; padding: 10px; background: #f5f5f5; border-radius: 4px;"></div>
</div>
`;

document.body.innerHTML = testHtml; 