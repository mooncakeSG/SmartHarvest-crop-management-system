from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.crop import Crop
from app import db
import os
from werkzeug.utils import secure_filename
from datetime import datetime

crops_bp = Blueprint('crops', __name__)

# Configure upload folder
UPLOAD_FOLDER = 'uploads/crops'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@crops_bp.route('/', methods=['POST'])
@jwt_required()
def create_crop():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    crop = Crop(
        name=data['name'],
        variety=data.get('variety'),
        planting_date=datetime.strptime(data['planting_date'], '%Y-%m-%d').date(),
        expected_harvest_date=datetime.strptime(data['expected_harvest_date'], '%Y-%m-%d').date() if data.get('expected_harvest_date') else None,
        growth_stage=data.get('growth_stage'),
        watering_schedule=data.get('watering_schedule'),
        fertilizer_applications=data.get('fertilizer_applications'),
        pest_issues=data.get('pest_issues'),
        disease_issues=data.get('disease_issues'),
        notes=data.get('notes'),
        user_id=current_user_id
    )
    
    db.session.add(crop)
    db.session.commit()
    
    return jsonify(crop.to_dict()), 201

@crops_bp.route('/', methods=['GET'])
@jwt_required()
def get_crops():
    current_user_id = get_jwt_identity()
    crops = Crop.query.filter_by(user_id=current_user_id).all()
    return jsonify([crop.to_dict() for crop in crops]), 200

@crops_bp.route('/<int:crop_id>', methods=['GET'])
@jwt_required()
def get_crop(crop_id):
    current_user_id = get_jwt_identity()
    crop = Crop.query.filter_by(id=crop_id, user_id=current_user_id).first()
    
    if not crop:
        return jsonify({'error': 'Crop not found'}), 404
    
    return jsonify(crop.to_dict()), 200

@crops_bp.route('/<int:crop_id>', methods=['PUT'])
@jwt_required()
def update_crop(crop_id):
    current_user_id = get_jwt_identity()
    crop = Crop.query.filter_by(id=crop_id, user_id=current_user_id).first()
    
    if not crop:
        return jsonify({'error': 'Crop not found'}), 404
    
    data = request.get_json()
    
    # Update crop fields
    for field in ['name', 'variety', 'growth_stage', 'watering_schedule', 
                 'fertilizer_applications', 'pest_issues', 'disease_issues', 'notes']:
        if field in data:
            setattr(crop, field, data[field])
    
    if 'planting_date' in data:
        crop.planting_date = datetime.strptime(data['planting_date'], '%Y-%m-%d').date()
    if 'expected_harvest_date' in data:
        crop.expected_harvest_date = datetime.strptime(data['expected_harvest_date'], '%Y-%m-%d').date()
    
    db.session.commit()
    
    return jsonify(crop.to_dict()), 200

@crops_bp.route('/<int:crop_id>/upload-image', methods=['POST'])
@jwt_required()
def upload_crop_image(crop_id):
    current_user_id = get_jwt_identity()
    crop = Crop.query.filter_by(id=crop_id, user_id=current_user_id).first()
    
    if not crop:
        return jsonify({'error': 'Crop not found'}), 404
    
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(f"{crop_id}_{file.filename}")
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        
        # Create directory if it doesn't exist
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        
        file.save(filepath)
        crop.image_url = filepath
        db.session.commit()
        
        # TODO: Implement disease detection logic here
        # For now, return a placeholder response
        return jsonify({
            'message': 'Image uploaded successfully',
            'image_url': filepath,
            'disease_detection': 'Placeholder for future ML integration'
        }), 200
    
    return jsonify({'error': 'Invalid file type'}), 400

@crops_bp.route('/<int:crop_id>', methods=['DELETE'])
@jwt_required()
def delete_crop(crop_id):
    current_user_id = get_jwt_identity()
    crop = Crop.query.filter_by(id=crop_id, user_id=current_user_id).first()
    
    if not crop:
        return jsonify({'error': 'Crop not found'}), 404
    
    db.session.delete(crop)
    db.session.commit()
    
    return jsonify({'message': 'Crop deleted successfully'}), 200 