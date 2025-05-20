from app import db
from datetime import datetime

class Livestock(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    animal_type = db.Column(db.String(50), nullable=False)  # e.g., 'goat', 'chicken', 'cow'
    breed = db.Column(db.String(100))
    age = db.Column(db.Integer)  # in months
    gender = db.Column(db.String(20))
    health_status = db.Column(db.String(50))
    last_vaccination = db.Column(db.Date)
    last_deworming = db.Column(db.Date)
    feeding_schedule = db.Column(db.String(200))
    medical_history = db.Column(db.Text)
    notes = db.Column(db.Text)
    image_url = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'animal_type': self.animal_type,
            'breed': self.breed,
            'age': self.age,
            'gender': self.gender,
            'health_status': self.health_status,
            'last_vaccination': self.last_vaccination.isoformat() if self.last_vaccination else None,
            'last_deworming': self.last_deworming.isoformat() if self.last_deworming else None,
            'feeding_schedule': self.feeding_schedule,
            'medical_history': self.medical_history,
            'notes': self.notes,
            'image_url': self.image_url,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'user_id': self.user_id
        } 