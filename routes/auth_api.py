# === FILENAME: auth_api.py ===
from flask import Blueprint, request, session, jsonify
import sqlite3
import os
from werkzeug.security import generate_password_hash, check_password_hash
from core.decorators import login_required, no_cache

auth_api_bp = Blueprint('auth_api', __name__)

@auth_api_bp.route('/api/auth/signup', methods=['POST'])
def api_signup():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
        
    email = data.get('email')
    username = data.get('username')
    password = data.get('password')
    
    if not email or not username or not password:
        return jsonify({'error': 'Missing required fields'}), 400

    hashed_password = generate_password_hash(password)

    try:
        with sqlite3.connect('database.db') as conn:
            conn.execute("INSERT INTO users (email, username, password) VALUES (?, ?, ?)",
                     (email, username, hashed_password))
        return jsonify({'success': True, 'message': 'Signup successful'}), 201
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Email or username already exists'}), 409
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_api_bp.route('/api/auth/login', methods=['POST'])
def api_login():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
        
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'Missing email or password'}), 400

    try:
        with sqlite3.connect('database.db') as conn:
            user = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()

        if user and check_password_hash(user[3], password):
            # Check if user is banned
            if user[4]:  # banned_until column
                if user[4] == '9999-12-31':
                    return jsonify({'error': 'Your account has been permanently banned.'}), 403
                else:
                    # Check if temporary ban is still active
                    with sqlite3.connect('database.db') as conn:
                        ban_check = conn.execute("""
                            SELECT CASE 
                                WHEN banned_until > datetime('now') THEN 1 
                                ELSE 0 
                            END as still_banned 
                            FROM users WHERE id = ?
                        """, (user[0],)).fetchone()
                        
                        if ban_check and ban_check[0]:
                            return jsonify({'error': f"Your account is temporarily banned until {user[4]}. Reason: {user[5] or 'No reason provided'}"}), 403
                        else:
                            # Ban has expired, clear it
                            conn.execute("UPDATE users SET banned_until = NULL, ban_reason = NULL WHERE id = ?", (user[0],))
            
            # Store user info in session
            session.permanent = True
            session['user_id'] = user[0]
            session['email'] = user[1]
            session['username'] = user[2]
            
            # Check for profile picture
            profile_picture = None
            # Need to check if column exists in tuple (it was added via migration in init_db)
            if len(user) > 6:
                profile_picture = user[6]
            
            return jsonify({
                'success': True, 
                'user': {
                    'id': user[0],
                    'email': user[1],
                    'username': user[2],
                    'profile_picture': profile_picture,
                    'is_admin': bool(user[7]) if len(user) > 7 else False
                }
            })
        else:
            return jsonify({'error': 'Invalid credentials'}), 401
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_api_bp.route('/api/auth/logout', methods=['POST'])
def api_logout():
    session.clear()
    return jsonify({'success': True, 'message': 'Logged out successfully'})

@auth_api_bp.route('/api/auth/me', methods=['GET'])
@no_cache
def api_auth_me():
    """Returns the current logged-in user's information."""
    user_id = session.get('user_id')
    if not user_id:
        return {'authenticated': False}, 200
    
    try:
        with sqlite3.connect('database.db') as conn:
            user = conn.execute(
                "SELECT id, email, username, profile_picture, is_admin FROM users WHERE id = ?",
                (user_id,)
            ).fetchone()
            
        if not user:
            return {'authenticated': False}, 200
            
        return {
            'authenticated': True,
            'user': {
                'id': user[0],
                'email': user[1],
                'username': user[2],
                'profile_picture': user[3],
                'is_admin': bool(user[4])
            }
        }
    except Exception as e:
        return {'error': str(e)}, 500

@auth_api_bp.route('/api/auth/profile', methods=['PUT'])
@login_required
def api_update_profile():
    """Updates the user's username and profile picture."""
    data = request.get_json() or {}
    username = data.get('username')
    profile_picture = data.get('profile_picture')
    user_id = session.get('user_id')
    
    if not username:
        return {'error': 'Username is required'}, 400
        
    try:
        with sqlite3.connect('database.db') as conn:
            # Check if username is taken by another user
            existing = conn.execute(
                "SELECT id FROM users WHERE username = ? AND id != ?",
                (username, user_id)
            ).fetchone()
            
            if existing:
                return {'error': 'Username already taken'}, 409
            
            if profile_picture is not None:
                conn.execute(
                    "UPDATE users SET username = ?, profile_picture = ? WHERE id = ?",
                    (username, profile_picture, user_id)
                )
            else:
                conn.execute(
                    "UPDATE users SET username = ? WHERE id = ?",
                    (username, user_id)
                )
            conn.commit()
        return {'success': True, 'message': 'Profile updated successfully'}
    except Exception as e:
        return {'error': str(e)}, 500

@auth_api_bp.route('/api/auth/update-profile-picture', methods=['POST'])
@login_required
def api_update_profile_picture():
    """API to upload/update user's profile picture"""
    user_id = session.get('user_id')
    
    if 'profile_picture' not in request.files:
        return jsonify({'error': 'No file selected'}), 400
    
    file = request.files['profile_picture']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    # Check file type
    allowed_extensions = {'png', 'jpg', 'jpeg', 'gif'}
    if not '.' in file.filename or file.filename.rsplit('.', 1)[1].lower() not in allowed_extensions:
        return jsonify({'error': 'Only PNG, JPG, JPEG, and GIF files are allowed'}), 400
    
    # Check file size (max 5MB)
    file.seek(0, os.SEEK_END)
    size = file.tell()
    file.seek(0)
    
    if size > 5 * 1024 * 1024:
        return jsonify({'error': 'File size must be less than 5MB'}), 400
    
    try:
        # Generate unique filename
        import uuid
        ext = file.filename.rsplit('.', 1)[1].lower()
        uid = uuid.uuid4().hex
        filename = f"profile_{user_id}_{uid[:8]}.{ext}"
        
        # Create uploads directory in project root if it doesn't exist
        # dirname(__file__) is current routes folder, so go up one level
        project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        upload_dir = os.path.join(project_root, 'static', 'uploads')
        os.makedirs(upload_dir, exist_ok=True)
        
        # Save file
        file_path = os.path.join(upload_dir, filename)
        file.save(file_path)
        
        # Relative path for DB/Frontend
        relative_path = f"/static/uploads/{filename}"
        
        with sqlite3.connect('database.db') as conn:
            # Delete old profile picture if exists
            old_picture = conn.execute("SELECT profile_picture FROM users WHERE id = ?", (user_id,)).fetchone()
            if old_picture and old_picture[0] and old_picture[0].startswith('/static/uploads/'):
                 try:
                     # Calculate absolute path to delete
                     old_filename = old_picture[0].split('/')[-1]
                     old_path = os.path.join(upload_dir, old_filename)
                     if os.path.exists(old_path):
                         os.remove(old_path)
                 except:
                     pass

            # Update with new picture
            conn.execute("UPDATE users SET profile_picture = ? WHERE id = ?", (relative_path, user_id))
            conn.commit()
            
        return jsonify({'success': True, 'profile_picture': relative_path, 'message': 'Profile picture updated successfully'})
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@auth_api_bp.route('/api/auth/password', methods=['PUT'])
@login_required
def api_change_password():
    """Changes the user's password after verifying the current one."""
    data = request.get_json() or {}
    current_password = data.get('current_password')
    new_password = data.get('new_password')
    user_id = session.get('user_id')
    
    if not current_password or not new_password:
        return {'error': 'Current and new passwords are required'}, 400
        
    try:
        with sqlite3.connect('database.db') as conn:
            user = conn.execute("SELECT password FROM users WHERE id = ?", (user_id,)).fetchone()
            
            if not user or not check_password_hash(user[0], current_password):
                return {'error': 'Incorrect current password'}, 401
                
            hashed_new_password = generate_password_hash(new_password)
            conn.execute("UPDATE users SET password = ? WHERE id = ?", (hashed_new_password, user_id))
            
        return {'success': True, 'message': 'Password changed successfully'}
    except Exception as e:
        return {'error': str(e)}, 500

@auth_api_bp.route('/api/auth/account', methods=['DELETE'])
@login_required
def api_delete_account():
    """Permanently deletes the user's account and all associated logs."""
    user_id = session.get('user_id')
    
    try:
        with sqlite3.connect('database.db') as conn:
            # Delete detection logs and their images first
            cur = conn.execute("SELECT image_url FROM detection_logs WHERE user_id = ?", (user_id,))
            for row in cur.fetchall():
                if row[0]:
                    image_path = os.path.join('static', row[0].lstrip('/static/'))
                    if os.path.exists(image_path):
                        try:
                            os.remove(image_path)
                        except:
                            pass
            
            conn.execute("DELETE FROM detection_logs WHERE user_id = ?", (user_id,))
            conn.execute("DELETE FROM recommendation_logs WHERE user_id = ?", (user_id,))
            conn.execute("DELETE FROM users WHERE id = ?", (user_id,))
            
        session.clear()
        return {'success': True, 'message': 'Account deleted successfully'}
    except Exception as e:
        return {'error': str(e)}, 500
