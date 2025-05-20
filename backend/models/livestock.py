from datetime import datetime
from .user import db

class Livestock(db.Model):
    __tablename__ = 'livestock'
    
    id = db.Column(db.Integer, primary_key=True)
    animal_type = db.Column(db.String(50), nullable=False)  # cow, chicken, sheep, etc.
    breed = db.Column(db.String(100))
    quantity = db.Column(db.Integer, nullable=False)
    purchase_date = db.Column(db.Date)
    status = db.Column(db.String(20), default='healthy')  # healthy, sick, quarantined
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign Keys
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Relationships
    health_records = db.relationship('LivestockHealth', backref='livestock', lazy=True)
    activities = db.relationship('LivestockActivity', backref='livestock', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'animal_type': self.animal_type,
            'breed': self.breed,
            'quantity': self.quantity,
            'purchase_date': self.purchase_date.isoformat() if self.purchase_date else None,
            'status': self.status,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'user_id': self.user_id
        }

class LivestockHealth(db.Model):
    __tablename__ = 'livestock_health'
    
    id = db.Column(db.Integer, primary_key=True)
    condition = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    severity = db.Column(db.String(20))  # low, medium, high
    diagnosis_date = db.Column(db.Date, nullable=False)
    treatment = db.Column(db.Text)
    status = db.Column(db.String(20), default='active')  # active, treated, resolved
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Foreign Keys
    livestock_id = db.Column(db.Integer, db.ForeignKey('livestock.id'), nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'condition': self.condition,
            'description': self.description,
            'severity': self.severity,
            'diagnosis_date': self.diagnosis_date.isoformat() if self.diagnosis_date else None,
            'treatment': self.treatment,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'livestock_id': self.livestock_id
        }

class LivestockActivity(db.Model):
    __tablename__ = 'livestock_activities'
    
    id = db.Column(db.Integer, primary_key=True)
    activity_type = db.Column(db.String(50), nullable=False)  # feeding, vaccination, milking, etc.
    description = db.Column(db.Text)
    date = db.Column(db.Date, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Foreign Keys
    livestock_id = db.Column(db.Integer, db.ForeignKey('livestock.id'), nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'activity_type': self.activity_type,
            'description': self.description,
            'date': self.date.isoformat() if self.date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'livestock_id': self.livestock_id
        } 