from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.livestock import Livestock
from app import db
import os
from werkzeug.utils import secure_filename
from datetime import datetime

livestock_bp = Blueprint('livestock', __name__)

# Configure upload folder
UPLOAD_FOLDER = 'uploads/livestock'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@livestock_bp.route('/', methods=['POST'])
@jwt_required()
def create_livestock():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    livestock = Livestock(
        animal_type=data['animal_type'],
        breed=data.get('breed'),
        age=data.get('age'),
        gender=data.get('gender'),
        health_status=data.get('health_status'),
        last_vaccination=datetime.strptime(data['last_vaccination'], '%Y-%m-%d').date() if data.get('last_vaccination') else None,
        last_deworming=datetime.strptime(data['last_deworming'], '%Y-%m-%d').date() if data.get('last_deworming') else None,
        feeding_schedule=data.get('feeding_schedule'),
        medical_history=data.get('medical_history'),
        notes=data.get('notes'),
        user_id=current_user_id
    )
    
    db.session.add(livestock)
    db.session.commit()
    
    return jsonify(livestock.to_dict()), 201

@livestock_bp.route('/', methods=['GET'])
@jwt_required()
def get_livestock():
    current_user_id = get_jwt_identity()
    livestock = Livestock.query.filter_by(user_id=current_user_id).all()
    return jsonify([animal.to_dict() for animal in livestock]), 200

@livestock_bp.route('/<int:livestock_id>', methods=['GET'])
@jwt_required()
def get_livestock_item(livestock_id):
    current_user_id = get_jwt_identity()
    livestock = Livestock.query.filter_by(id=livestock_id, user_id=current_user_id).first()
    
    if not livestock:
        return jsonify({'error': 'Livestock not found'}), 404
    
    return jsonify(livestock.to_dict()), 200

@livestock_bp.route('/<int:livestock_id>', methods=['PUT'])
@jwt_required()
def update_livestock(livestock_id):
    current_user_id = get_jwt_identity()
    livestock = Livestock.query.filter_by(id=livestock_id, user_id=current_user_id).first()
    
    if not livestock:
        return jsonify({'error': 'Livestock not found'}), 404
    
    data = request.get_json()
    
    # Update livestock fields
    for field in ['animal_type', 'breed', 'age', 'gender', 'health_status',
                 'feeding_schedule', 'medical_history', 'notes']:
        if field in data:
            setattr(livestock, field, data[field])
    
    if 'last_vaccination' in data:
        livestock.last_vaccination = datetime.strptime(data['last_vaccination'], '%Y-%m-%d').date()
    if 'last_deworming' in data:
        livestock.last_deworming = datetime.strptime(data['last_deworming'], '%Y-%m-%d').date()
    
    db.session.commit()
    
    return jsonify(livestock.to_dict()), 200

@livestock_bp.route('/<int:livestock_id>/upload-image', methods=['POST'])
@jwt_required()
def upload_livestock_image(livestock_id):
    current_user_id = get_jwt_identity()
    livestock = Livestock.query.filter_by(id=livestock_id, user_id=current_user_id).first()
    
    if not livestock:
        return jsonify({'error': 'Livestock not found'}), 404
    
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(f"{livestock_id}_{file.filename}")
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        
        # Create directory if it doesn't exist
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        
        file.save(filepath)
        livestock.image_url = filepath
        db.session.commit()
        
        return jsonify({
            'message': 'Image uploaded successfully',
            'image_url': filepath
        }), 200
    
    return jsonify({'error': 'Invalid file type'}), 400

@livestock_bp.route('/<int:livestock_id>', methods=['DELETE'])
@jwt_required()
def delete_livestock(livestock_id):
    current_user_id = get_jwt_identity()
    livestock = Livestock.query.filter_by(id=livestock_id, user_id=current_user_id).first()
    
    if not livestock:
        return jsonify({'error': 'Livestock not found'}), 404
    
    db.session.delete(livestock)
    db.session.commit()
    
    return jsonify({'message': 'Livestock deleted successfully'}), 200 