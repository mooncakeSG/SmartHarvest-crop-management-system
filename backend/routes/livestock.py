from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.livestock import Livestock, LivestockHealth, LivestockActivity, db
import os
from werkzeug.utils import secure_filename
from datetime import datetime

livestock_bp = Blueprint('livestock', __name__)

# Configure upload folder
UPLOAD_FOLDER = 'uploads/livestock'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@livestock_bp.route('/', methods=['GET'])
@jwt_required()
def get_livestock():
    user_id = get_jwt_identity()
    livestock = Livestock.query.filter_by(user_id=user_id).all()
    return jsonify([animal.to_dict() for animal in livestock]), 200

@livestock_bp.route('/<int:livestock_id>', methods=['GET'])
@jwt_required()
def get_livestock_item(livestock_id):
    user_id = get_jwt_identity()
    livestock = Livestock.query.filter_by(id=livestock_id, user_id=user_id).first()
    
    if not livestock:
        return jsonify({'error': 'Livestock not found'}), 404
    
    return jsonify(livestock.to_dict()), 200

@livestock_bp.route('/', methods=['POST'])
@jwt_required()
def create_livestock():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    livestock = Livestock(
        animal_type=data['animal_type'],
        breed=data.get('breed', ''),
        quantity=data['quantity'],
        purchase_date=datetime.strptime(data['purchase_date'], '%Y-%m-%d').date() if data.get('purchase_date') else None,
        status=data.get('status', 'healthy'),
        notes=data.get('notes', ''),
        user_id=user_id
    )
    
    try:
        db.session.add(livestock)
        db.session.commit()
        return jsonify(livestock.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@livestock_bp.route('/<int:livestock_id>', methods=['PUT'])
@jwt_required()
def update_livestock(livestock_id):
    user_id = get_jwt_identity()
    livestock = Livestock.query.filter_by(id=livestock_id, user_id=user_id).first()
    
    if not livestock:
        return jsonify({'error': 'Livestock not found'}), 404
    
    data = request.get_json()
    
    # Update livestock fields
    if 'animal_type' in data:
        livestock.animal_type = data['animal_type']
    if 'breed' in data:
        livestock.breed = data['breed']
    if 'quantity' in data:
        livestock.quantity = data['quantity']
    if 'purchase_date' in data:
        livestock.purchase_date = datetime.strptime(data['purchase_date'], '%Y-%m-%d').date()
    if 'status' in data:
        livestock.status = data['status']
    if 'notes' in data:
        livestock.notes = data['notes']
    
    try:
        db.session.commit()
        return jsonify(livestock.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@livestock_bp.route('/<int:livestock_id>', methods=['DELETE'])
@jwt_required()
def delete_livestock(livestock_id):
    user_id = get_jwt_identity()
    livestock = Livestock.query.filter_by(id=livestock_id, user_id=user_id).first()
    
    if not livestock:
        return jsonify({'error': 'Livestock not found'}), 404
    
    try:
        db.session.delete(livestock)
        db.session.commit()
        return jsonify({'message': 'Livestock deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@livestock_bp.route('/<int:livestock_id>/health', methods=['GET'])
@jwt_required()
def get_livestock_health(livestock_id):
    user_id = get_jwt_identity()
    livestock = Livestock.query.filter_by(id=livestock_id, user_id=user_id).first()
    
    if not livestock:
        return jsonify({'error': 'Livestock not found'}), 404
    
    health_records = LivestockHealth.query.filter_by(livestock_id=livestock_id).all()
    return jsonify([record.to_dict() for record in health_records]), 200

@livestock_bp.route('/<int:livestock_id>/health', methods=['POST'])
@jwt_required()
def add_livestock_health(livestock_id):
    user_id = get_jwt_identity()
    livestock = Livestock.query.filter_by(id=livestock_id, user_id=user_id).first()
    
    if not livestock:
        return jsonify({'error': 'Livestock not found'}), 404
    
    data = request.get_json()
    health_record = LivestockHealth(
        condition=data['condition'],
        description=data.get('description', ''),
        severity=data.get('severity', 'low'),
        diagnosis_date=datetime.strptime(data['diagnosis_date'], '%Y-%m-%d').date(),
        treatment=data.get('treatment', ''),
        status=data.get('status', 'active'),
        livestock_id=livestock_id
    )
    
    try:
        db.session.add(health_record)
        livestock.status = 'sick'
        db.session.commit()
        return jsonify(health_record.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@livestock_bp.route('/<int:livestock_id>/activities', methods=['GET'])
@jwt_required()
def get_livestock_activities(livestock_id):
    user_id = get_jwt_identity()
    livestock = Livestock.query.filter_by(id=livestock_id, user_id=user_id).first()
    
    if not livestock:
        return jsonify({'error': 'Livestock not found'}), 404
    
    activities = LivestockActivity.query.filter_by(livestock_id=livestock_id).all()
    return jsonify([activity.to_dict() for activity in activities]), 200

@livestock_bp.route('/<int:livestock_id>/activities', methods=['POST'])
@jwt_required()
def add_livestock_activity(livestock_id):
    user_id = get_jwt_identity()
    livestock = Livestock.query.filter_by(id=livestock_id, user_id=user_id).first()
    
    if not livestock:
        return jsonify({'error': 'Livestock not found'}), 404
    
    data = request.get_json()
    activity = LivestockActivity(
        activity_type=data['activity_type'],
        description=data.get('description', ''),
        date=datetime.strptime(data['date'], '%Y-%m-%d').date(),
        livestock_id=livestock_id
    )
    
    try:
        db.session.add(activity)
        db.session.commit()
        return jsonify(activity.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

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