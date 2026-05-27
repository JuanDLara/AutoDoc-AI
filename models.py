from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class HistoryItem(db.Model):
    __tablename__ = 'history_items'

    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=True)
    language = db.Column(db.String(50), nullable=False)
    original_code = db.Column(db.Text, nullable=False)
    documented_code = db.Column(db.Text, nullable=True)
    markdown_guide = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'filename': self.filename,
            'language': self.language,
            'original_code': self.original_code,
            'documented_code': self.documented_code,
            'markdown_guide': self.markdown_guide,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
