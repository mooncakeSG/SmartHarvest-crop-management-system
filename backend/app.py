from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from datetime import timedelta
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-here')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///smart_harvest.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key-here')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)

# Initialize extensions
from models.user import db
db.init_app(app)
jwt = JWTManager(app)

# Import and register blueprints
from routes.auth import auth_bp
from routes.crops import crops_bp
from routes.livestock import livestock_bp

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(crops_bp, url_prefix='/api/crops')
app.register_blueprint(livestock_bp, url_prefix='/api/livestock')

# Create database tables
with app.app_context():
    db.create_all()

# For PythonAnywhere
application = app

if __name__ == '__main__':
    port = int(os.getenv('PORT', 8080))
    app.run(host='0.0.0.0', port=port) 