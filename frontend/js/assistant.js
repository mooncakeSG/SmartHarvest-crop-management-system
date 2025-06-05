// Smart Assistant Functionality
class SmartAssistant {
    constructor() {
        this.chatContainer = document.querySelector('#assistant .chat-container');
        this.messageInput = document.querySelector('#assistant .form-input');
        this.sendButton = document.querySelector('#assistant .btn-primary');
        
        // Only initialize if we're on the assistant page
        if (this.chatContainer && this.messageInput && this.sendButton) {
            this.initialize();
        }
    }

    initialize() {
        // Send message on button click
        this.sendButton.addEventListener('click', () => this.sendMessage());

        // Send message on Enter key
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Add initial message
        this.addMessage('Hello! How can I help you with your crops today?', 'bot');
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;

        // Add user message
        this.addMessage(message, 'user');
        this.messageInput.value = '';

        // Show typing indicator
        const typingIndicator = this.addTypingIndicator();

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Remove typing indicator
            typingIndicator.remove();

            // Mock response based on keywords
            let response = this.generateResponse(message);
            this.addMessage(response, 'bot');
        } catch (error) {
            typingIndicator.remove();
            this.addMessage('Sorry, I encountered an error. Please try again.', 'bot');
        }
    }

    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `flex items-start space-x-3 mb-4 ${sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`;
        
        const iconClass = sender === 'user' ? 'fa-user' : 'fa-robot';
        const bgClass = sender === 'user' ? 'bg-green-100' : 'bg-gray-100';
        const iconBgClass = sender === 'user' ? 'bg-green-100' : 'bg-gray-100';
        const iconColorClass = sender === 'user' ? 'text-green-600' : 'text-gray-600';

        messageDiv.innerHTML = `
            <div class="w-8 h-8 ${iconBgClass} rounded-full flex items-center justify-center">
                <i class="fas ${iconClass} ${iconColorClass}"></i>
            </div>
            <div class="${bgClass} rounded-lg p-3 max-w-3/4">
                <p>${this.formatMessage(text)}</p>
            </div>
        `;

        this.chatContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    addTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'flex items-start space-x-3 mb-4';
        indicator.innerHTML = `
            <div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <i class="fas fa-robot text-gray-600"></i>
            </div>
            <div class="bg-gray-100 rounded-lg p-3">
                <div class="flex space-x-2">
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
                </div>
            </div>
        `;
        this.chatContainer.appendChild(indicator);
        this.scrollToBottom();
        return indicator;
    }

    generateResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // Basic keyword matching
        if (lowerMessage.includes('disease') || lowerMessage.includes('pest')) {
            return 'To diagnose potential diseases or pests, please use the Diagnose Crop feature where you can upload photos of the affected plants. This will give you a more accurate assessment.';
        }
        
        if (lowerMessage.includes('water') || lowerMessage.includes('irrigation')) {
            return 'The optimal watering schedule depends on various factors including crop type, growth stage, and weather conditions. I recommend checking the soil moisture level daily and maintaining consistent moisture without overwatering.';
        }
        
        if (lowerMessage.includes('fertilizer') || lowerMessage.includes('nutrient')) {
            return 'For fertilizer recommendations, please specify your crop type and growth stage. Generally, a balanced NPK fertilizer is recommended, but specific needs vary by crop and soil conditions.';
        }
        
        if (lowerMessage.includes('weather') || lowerMessage.includes('forecast')) {
            return 'I can help you plan around weather conditions. Please check the Analysis section for detailed weather forecasts and recommendations for your crops.';
        }
        
        // Default response
        return 'I understand you\'re asking about ' + message.substring(0, 30) + '... Could you provide more specific details about your crops and concerns?';
    }

    formatMessage(text) {
        // Convert URLs to links
        text = text.replace(
            /(https?:\/\/[^\s]+)/g,
            '<a href="$1" target="_blank" class="text-blue-500 hover:underline">$1</a>'
        );
        
        // Convert line breaks to <br>
        text = text.replace(/\n/g, '<br>');
        
        return text;
    }

    scrollToBottom() {
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }
}

// Initialize Smart Assistant when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SmartAssistant();
}); 