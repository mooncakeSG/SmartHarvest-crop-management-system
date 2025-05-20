from app import db
from datetime import datetime

class Crop(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    variety = db.Column(db.String(100))
    planting_date = db.Column(db.Date, nullable=False)
    expected_harvest_date = db.Column(db.Date)
    growth_stage = db.Column(db.String(50))
    watering_schedule = db.Column(db.String(200))
    fertilizer_applications = db.Column(db.Text)
    pest_issues = db.Column(db.Text)
    disease_issues = db.Column(db.Text)
    notes = db.Column(db.Text)
    image_url = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'variety': self.variety,
            'planting_date': self.planting_date.isoformat() if self.planting_date else None,
            'expected_harvest_date': self.expected_harvest_date.isoformat() if self.expected_harvest_date else None,
            'growth_stage': self.growth_stage,
            'watering_schedule': self.watering_schedule,
            'fertilizer_applications': self.fertilizer_applications,
            'pest_issues': self.pest_issues,
            'disease_issues': self.disease_issues,
            'notes': self.notes,
            'image_url': self.image_url,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'user_id': self.user_id
        } 