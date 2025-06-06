// Test utility for serverless functions
async function testEndpoints() {
    console.log('Testing serverless functions...');

    // Test AI Analysis
    try {
        console.log('Testing AI Analysis endpoint...');
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
        
        const aiData = await aiResponse.json();
        console.log('AI Analysis Response:', aiData);
    } catch (error) {
        console.error('AI Analysis Test Failed:', error);
    }

    // Test Color Analysis
    try {
        console.log('Testing Color Analysis endpoint...');
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
        
        const colorData = await colorResponse.json();
        console.log('Color Analysis Response:', colorData);
    } catch (error) {
        console.error('Color Analysis Test Failed:', error);
    }
}

// Create a simple HTML interface for testing
const testHtml = `
<div style="padding: 20px;">
    <h2>Serverless Functions Test</h2>
    <button onclick="testEndpoints()" style="padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">
        Run Tests
    </button>
    <div id="results" style="margin-top: 20px; padding: 10px; background: #f5f5f5;"></div>
</div>
`;

document.body.innerHTML = testHtml; 