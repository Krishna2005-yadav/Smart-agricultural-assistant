# === FILENAME: app.py ===
import os
# Suppress annoying TensorFlow and oneDNN logs
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

import warnings
# Suppress unpickling/version mismatch warnings from sklearn
warnings.filterwarnings('ignore', category=UserWarning)

from flask import Flask
import secrets
import datetime

# =============================================================================
# CONFIGURATION - Load from environment variables with secure defaults
# =============================================================================

def get_secret_key():
    """Get secret key from environment or generate a secure one for development."""
    key = os.environ.get('SECRET_KEY')
    if key:
        return key
    # Development fallback - generate a random key
    return secrets.token_hex(32)

app = Flask(__name__)
from flask_cors import CORS
CORS(app, supports_credentials=True)
app.secret_key = get_secret_key()

# Security configurations
app.config['PERMANENT_SESSION_LIFETIME'] = datetime.timedelta(days=7)
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_HTTPONLY'] = True  # Prevent XSS access to session cookie
app.config['SESSION_COOKIE_SECURE'] = os.environ.get('FLASK_ENV') == 'production'  # HTTPS only in prod
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload size

# Environment detection
IS_PRODUCTION = os.environ.get('FLASK_ENV') == 'production'

# Import security utilities
from core.security import (
    add_security_headers
)

# Add security headers to all responses
@app.after_request
def apply_security_headers(response):
    return add_security_headers(response)

# Load models
import pickle
model = pickle.load(open('model.pkl', 'rb'))
mx = pickle.load(open('minmaxscaler.pkl', 'rb'))
sc = pickle.load(open('standscaler.pkl', 'rb'))

# Crop dictionary
crop_dict = {
    1: "Rice", 2: "Maize", 3: "Chickpea", 4: "Kidneybeans", 5: "Pigeonpeas",
    6: "Mothbeans", 7: "Mungbean", 8: "Blackgram", 9: "Lentil",
    10: "Pomegranate", 11: "Banana", 12: "Mango", 13: "Grapes", 14: "Watermelon",
    15: "Muskmelon", 16: "Apple", 17: "Orange", 18: "Papaya", 19: "Coconut",
    20: "Cotton", 21: "Jute", 22: "Coffee"
}

# Initialize database
from core.database import init_db
init_db()

# Register Blueprints
from routes.auth_routes import auth_routes_bp
from routes.auth_api import auth_api_bp
from routes.profile_routes import profile_routes_bp
from routes.crop_routes import crop_routes_bp
from routes.disease_routes import disease_routes_bp
from routes.fertilizer_routes import fertilizer_routes_bp
from routes.admin_routes import admin_routes_bp
from routes.admin_api import admin_api_bp
from routes.dashboard_routes import dashboard_routes_bp

app.register_blueprint(auth_routes_bp)
app.register_blueprint(auth_api_bp)
app.register_blueprint(profile_routes_bp)
app.register_blueprint(crop_routes_bp)
app.register_blueprint(disease_routes_bp)
app.register_blueprint(fertilizer_routes_bp)
app.register_blueprint(admin_routes_bp)
app.register_blueprint(admin_api_bp)
app.register_blueprint(dashboard_routes_bp)

if __name__ == '__main__':
    app.run(debug=True, use_reloader=False)
