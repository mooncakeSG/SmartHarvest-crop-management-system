from datetime import datetime
from .user import db

class Crop(db.Model):
    __tablename__ = 'crops'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    variety = db.Column(db.String(100))
    planting_date = db.Column(db.Date, nullable=False)
    expected_harvest_date = db.Column(db.Date)
    area = db.Column(db.Float)  # in hectares
    status = db.Column(db.String(20), default='growing')  # growing, harvested, failed
    health_status = db.Column(db.String(20), default='healthy')  # healthy, diseased, stressed
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign Keys
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Relationships
    diseases = db.relationship('CropDisease', backref='crop', lazy=True)
    activities = db.relationship('CropActivity', backref='crop', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'variety': self.variety,
            'planting_date': self.planting_date.isoformat() if self.planting_date else None,
            'expected_harvest_date': self.expected_harvest_date.isoformat() if self.expected_harvest_date else None,
            'area': self.area,
            'status': self.status,
            'health_status': self.health_status,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'user_id': self.user_id
        }

class CropDisease(db.Model):
    __tablename__ = 'crop_diseases'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    severity = db.Column(db.String(20))  # low, medium, high
    detected_date = db.Column(db.Date, nullable=False)
    treatment = db.Column(db.Text)
    status = db.Column(db.String(20), default='active')  # active, treated, resolved
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Foreign Keys
    crop_id = db.Column(db.Integer, db.ForeignKey('crops.id'), nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'severity': self.severity,
            'detected_date': self.detected_date.isoformat() if self.detected_date else None,
            'treatment': self.treatment,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'crop_id': self.crop_id
        }

class CropActivity(db.Model):
    __tablename__ = 'crop_activities'
    
    id = db.Column(db.Integer, primary_key=True)
    activity_type = db.Column(db.String(50), nullable=False)  # watering, fertilizing, pruning, etc.
    description = db.Column(db.Text)
    date = db.Column(db.Date, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Foreign Keys
    crop_id = db.Column(db.Integer, db.ForeignKey('crops.id'), nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'activity_type': self.activity_type,
            'description': self.description,
            'date': self.date.isoformat() if self.date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'crop_id': self.crop_id
        } 