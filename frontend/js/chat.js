// Chatbot configuration
const CHATBOT_URL = 'http://localhost:5001/chat';
const SUPPORTED_LANGUAGES = {
    'en': 'English',
    'zu': 'isiZulu',
    'xh': 'isiXhosa'
};

// Chat widget elements
const chatWidget = document.getElementById('chatWidget');
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.querySelector('.send-btn');
const imageUpload = document.getElementById('imageUpload');
const minimizeButton = document.querySelector('.minimize-btn');

// Current language
let currentLanguage = 'en';

// Initialize chat widget
function initChatWidget() {
    // Add language selector
    const chatHeader = document.querySelector('.chat-header');
    const languageSelector = document.createElement('select');
    languageSelector.className = 'language-selector';
    
    Object.entries(SUPPORTED_LANGUAGES).forEach(([code, name]) => {
        const option = document.createElement('option');
        option.value = code;
        option.textContent = name;
        languageSelector.appendChild(option);
    });
    
    chatHeader.insertBefore(languageSelector, minimizeButton);
    
    // Add event listeners
    languageSelector.addEventListener('change', (e) => {
        currentLanguage = e.target.value;
    });
    
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    imageUpload.addEventListener('change', handleImageUpload);
    minimizeButton.addEventListener('click', toggleChatWidget);
}

// Send message to chatbot
async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;
    
    // Add user message to chat
    addMessageToChat(message, 'user');
    messageInput.value = '';
    
    try {
        const response = await fetch(CHATBOT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message,
                language: currentLanguage
            })
        });
        
        const data = await response.json();
        
        // Add bot response to chat
        addMessageToChat(data.response, 'bot');
        
        // Handle image analysis if present
        if (data.image_analysis) {
            addMessageToChat(data.image_analysis, 'bot');
        }
    } catch (error) {
        console.error('Error sending message:', error);
        addMessageToChat('Sorry, I encountered an error. Please try again.', 'bot');
    }
}

// Handle image upload
async function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Add user message indicating image upload
    addMessageToChat('Uploading image...', 'user');
    
    try {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('message', 'Analyze this image');
        formData.append('language', currentLanguage);
        
        const response = await fetch(CHATBOT_URL, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        // Add bot response to chat
        if (data.image_analysis) {
            addMessageToChat(data.image_analysis, 'bot');
        }
    } catch (error) {
        console.error('Error uploading image:', error);
        addMessageToChat('Sorry, I encountered an error while processing the image.', 'bot');
    }
    
    // Reset file input
    event.target.value = '';
}

// Add message to chat
function addMessageToChat(message, sender) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${sender}`;
    messageElement.textContent = message;
    
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Toggle chat widget visibility
function toggleChatWidget() {
    const isMinimized = chatWidget.classList.contains('minimized');
    
    if (isMinimized) {
        chatWidget.classList.remove('minimized');
        minimizeButton.innerHTML = '<i class="fas fa-minus"></i>';
    } else {
        chatWidget.classList.add('minimized');
        minimizeButton.innerHTML = '<i class="fas fa-plus"></i>';
    }
}

// Add CSS for minimized state
const style = document.createElement('style');
style.textContent = `
    .chat-widget.minimized {
        height: 50px;
        overflow: hidden;
    }
    
    .chat-widget.minimized .chat-messages,
    .chat-widget.minimized .chat-input {
        display: none;
    }
    
    .language-selector {
        background: none;
        border: 1px solid white;
        color: white;
        padding: 2px 5px;
        border-radius: 4px;
        margin-right: 10px;
    }
    
    .activity-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.75rem;
        border-bottom: 1px solid #dfe6e9;
    }
    
    .activity-item:last-child {
        border-bottom: none;
    }
    
    .activity-item i {
        color: #0984e3;
    }
    
    .activity-details p {
        margin: 0;
    }
    
    .activity-details small {
        color: #636e72;
    }
`;
document.head.appendChild(style);

// Initialize chat widget when DOM is loaded
document.addEventListener('DOMContentLoaded', initChatWidget); 