from flask import Flask, request, jsonify
from flask_cors import CORS
from langdetect import detect
from googletrans import Translator
import os
from dotenv import load_dotenv
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Load environment variables
load_dotenv()

# Initialize translator
translator = Translator()

# Configure upload folder
UPLOAD_FOLDER = 'uploads/chatbot'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Simple knowledge base for crop and livestock advice
KNOWLEDGE_BASE = {
    'crops': {
        'maize': {
            'planting': 'Plant maize in well-drained soil with pH 5.8-7.0. Space plants 30cm apart.',
            'watering': 'Water maize regularly, especially during flowering and grain filling stages.',
            'fertilizer': 'Apply NPK fertilizer at planting and top-dress with nitrogen during growth.',
            'diseases': 'Common diseases include rust, leaf blight, and stalk rot. Use resistant varieties.'
        },
        'tomatoes': {
            'planting': 'Plant tomatoes in rich, well-drained soil. Space plants 45-60cm apart.',
            'watering': 'Water consistently to prevent blossom end rot. Avoid wetting leaves.',
            'fertilizer': 'Use balanced fertilizer with higher phosphorus for fruit development.',
            'diseases': 'Watch for blight, wilt, and leaf spot. Practice crop rotation.'
        }
    },
    'livestock': {
        'goats': {
            'feeding': 'Provide fresh water, hay, and grain. Allow grazing when possible.',
            'health': 'Regular deworming and vaccination against common diseases.',
            'housing': 'Clean, dry shelter with good ventilation.'
        },
        'chickens': {
            'feeding': 'Layer feed for egg-laying hens, broiler feed for meat birds.',
            'health': 'Vaccinate against common diseases. Maintain clean coops.',
            'housing': 'Well-ventilated coop with nesting boxes and perches.'
        }
    }
}

def get_response(query, language='en'):
    """Generate a response based on the query and translate if needed."""
    query = query.lower()
    
    # Detect language if not specified
    if language == 'auto':
        try:
            language = detect(query)
        except:
            language = 'en'
    
    # Simple keyword matching
    response = "I'm sorry, I don't have information about that. Please ask about crops or livestock."
    
    if 'crop' in query or 'plant' in query:
        for crop, info in KNOWLEDGE_BASE['crops'].items():
            if crop in query:
                if 'plant' in query:
                    response = info['planting']
                elif 'water' in query:
                    response = info['watering']
                elif 'fertilizer' in query:
                    response = info['fertilizer']
                elif 'disease' in query:
                    response = info['diseases']
                else:
                    response = f"Here's what I know about {crop}: {info['planting']}"
                break
    
    elif 'livestock' in query or 'animal' in query:
        for animal, info in KNOWLEDGE_BASE['livestock'].items():
            if animal in query:
                if 'feed' in query:
                    response = info['feeding']
                elif 'health' in query:
                    response = info['health']
                elif 'house' in query or 'shelter' in query:
                    response = info['housing']
                else:
                    response = f"Here's what I know about {animal}: {info['feeding']}"
                break
    
    # Translate response if needed
    if language != 'en':
        try:
            response = translator.translate(response, dest=language).text
        except:
            pass
    
    return response

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    message = data.get('message', '')
    language = data.get('language', 'en')
    
    # Handle image upload if present
    image_analysis = None
    if 'image' in request.files:
        file = request.files['image']
        if file and allowed_file(file.filename):
            filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{file.filename}"
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            
            # Create directory if it doesn't exist
            os.makedirs(UPLOAD_FOLDER, exist_ok=True)
            
            file.save(filepath)
            # TODO: Implement image analysis logic here
            image_analysis = "Image received. Analysis feature coming soon."
    
    response = get_response(message, language)
    
    return jsonify({
        'response': response,
        'image_analysis': image_analysis
    })

@app.route('/health')
def health_check():
    return jsonify({"status": "healthy"}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5001) 