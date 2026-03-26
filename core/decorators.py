# === FILENAME: decorators.py ===
from flask import session, request, jsonify, redirect, flash, current_app
from functools import wraps

# Login required decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            if request.path.startswith('/api/'):
                return jsonify({'error': 'Unauthorized', 'authenticated': False}), 401
            flash('Please log in to access this page.', 'danger')
            return redirect('/login')
        return f(*args, **kwargs)
    return decorated_function

# Admin required decorator
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            if request.path.startswith('/api/'):
                return jsonify({'error': 'Unauthorized', 'authenticated': False}), 401
            flash('Please log in to access this page.', 'danger')
            return redirect('/login')
        
        # Check if user is admin
        import sqlite3
        with sqlite3.connect('database.db') as conn:
            user = conn.execute("SELECT is_admin FROM users WHERE id = ?", (session['user_id'],)).fetchone()
            if not user or not user[0]:
                if request.path.startswith('/api/'):
                    return jsonify({'error': 'Admin privileges required'}), 403
                flash('Access denied. Admin privileges required.', 'danger')
                return redirect('/')

        return f(*args, **kwargs)
    return decorated_function

# Cache control decorator
def no_cache(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        rv = f(*args, **kwargs)
        response = current_app.make_response(rv)
        response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate, max-age=0'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'
        return response
    return decorated_function
