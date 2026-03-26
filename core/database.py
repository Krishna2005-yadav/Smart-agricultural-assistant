# === FILENAME: database.py ===
import sqlite3

def init_db():
    with sqlite3.connect('database.db') as conn:
        conn.execute('''CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            banned_until TEXT,
            ban_reason TEXT,
            profile_picture TEXT,
            is_admin BOOLEAN DEFAULT 0
        )''')
        # Log of crop recommendations
        conn.execute('''CREATE TABLE IF NOT EXISTS recommendation_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            crop TEXT,
            nitrogen REAL,
            phosphorus REAL,
            potassium REAL,
            temperature REAL,
            humidity REAL,
            ph REAL,
            rainfall REAL,
            created_at TEXT DEFAULT (datetime('now'))
        )''')
        # Detection logs for storing plant disease detection results
        conn.execute('''CREATE TABLE IF NOT EXISTS detection_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            plant_name TEXT,
            disease TEXT,
            confidence REAL,
            image_url TEXT,
            all_probabilities TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        )''')
        
        # New table for Fertilizer Recommendations
        conn.execute('''CREATE TABLE IF NOT EXISTS fertilizer_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            crop TEXT,
            nitrogen_current REAL,
            phosphorus_current REAL,
            potassium_current REAL,
            recommendation TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        )''')
        
        # New table for Global Site Settings (Key-Value)
        conn.execute('''CREATE TABLE IF NOT EXISTS site_settings (
            key TEXT PRIMARY KEY,
            value TEXT
        )''')
        
        # Initialize default settings
        default_settings = {
            'bg_crop_rec': 'true',
            'bg_disease_det': 'true',
            'bg_fert_calc': 'true',
            'bg_history': 'true',
            'bg_admin': 'true'
        }
        for key, val in default_settings.items():
            conn.execute('INSERT OR IGNORE INTO site_settings (key, value) VALUES (?, ?)', (key, val))
        
        # Add ban columns if they don't exist (for existing databases)
        try:
            conn.execute('ALTER TABLE users ADD COLUMN banned_until TEXT')
        except:
            pass 
        try:
            conn.execute('ALTER TABLE users ADD COLUMN ban_reason TEXT')
        except:
            pass  
        try:
            conn.execute('ALTER TABLE users ADD COLUMN profile_picture TEXT')
        except:
            pass
        try:
            conn.execute('ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT 0')
            # Set user ID 2 as admin default
            conn.execute('UPDATE users SET is_admin = 1 WHERE id = 2')
        except:
            pass  
        try:
            conn.execute('ALTER TABLE detection_logs ADD COLUMN all_probabilities TEXT')
        except:
            pass
        try:
            conn.execute('ALTER TABLE recommendation_logs ADD COLUMN humidity REAL')
        except:
            pass
        try:
            conn.execute('ALTER TABLE recommendation_logs ADD COLUMN rainfall REAL')
        except:
            pass
