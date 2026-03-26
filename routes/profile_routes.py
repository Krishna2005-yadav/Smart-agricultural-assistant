# === FILENAME: profile_routes.py ===
from flask import Blueprint, request, render_template, redirect, flash, session
import sqlite3
import os
import uuid
from werkzeug.security import check_password_hash, generate_password_hash
from core.decorators import login_required, no_cache

profile_routes_bp = Blueprint('profile_routes', __name__)

@profile_routes_bp.route('/profile')
@login_required
@no_cache
def profile():
    user = None
    if 'user_id' in session:
        with sqlite3.connect('database.db') as conn:
            user = conn.execute("SELECT id, email, username, profile_picture FROM users WHERE id = ?", (session['user_id'],)).fetchone()
    return {"message": "API backend is running. Please use the React frontend."}

@profile_routes_bp.route('/update-username', methods=['POST'])
@login_required
def update_username():
    """Update user's username"""
    if 'user_id' not in session:
        return redirect('/login')
    
    new_username = request.form.get('new_username', '').strip()
    password = request.form.get('password', '')
    
    if not new_username or not password:
        flash('Please provide both new username and password.', 'warning')
        return redirect('/profile')
    
    with sqlite3.connect('database.db') as conn:
        # Verify password first
        user = conn.execute("SELECT * FROM users WHERE id = ?", (session['user_id'],)).fetchone()
        if not user or not check_password_hash(user[3], password):
            flash('Incorrect password.', 'danger')
            return redirect('/profile')
        
        # Check if username already exists
        existing_user = conn.execute("SELECT id FROM users WHERE username = ? AND id != ?", (new_username, session['user_id'])).fetchone()
        if existing_user:
            flash('Username already exists. Please choose another one.', 'danger')
            return redirect('/profile')
        
        # Update username
        conn.execute("UPDATE users SET username = ? WHERE id = ?", (new_username, session['user_id']))
        session['username'] = new_username
        flash('Username updated successfully!', 'success')
    
    return redirect('/profile')

@profile_routes_bp.route('/update-password', methods=['POST'])
@login_required
def update_password():
    """Update user's password"""
    if 'user_id' not in session:
        return redirect('/login')
    
    current_password = request.form.get('current_password', '')
    new_password = request.form.get('new_password', '')
    confirm_password = request.form.get('confirm_password', '')
    
    if not current_password or not new_password or not confirm_password:
        flash('Please fill in all password fields.', 'warning')
        return redirect('/profile')
    
    if new_password != confirm_password:
        flash('New passwords do not match.', 'danger')
        return redirect('/profile')
    
    if len(new_password) < 6:
        flash('New password must be at least 6 characters long.', 'warning')
        return redirect('/profile')
    
    with sqlite3.connect('database.db') as conn:
        # Verify current password
        user = conn.execute("SELECT * FROM users WHERE id = ?", (session['user_id'],)).fetchone()
        if not user or not check_password_hash(user[3], current_password):
            flash('Current password is incorrect.', 'danger')
            return redirect('/profile')
        
        # Update password
        new_password_hash = generate_password_hash(new_password)
        conn.execute("UPDATE users SET password = ? WHERE id = ?", (new_password_hash, session['user_id']))
        flash('Password updated successfully!', 'success')
    
    return redirect('/profile')

@profile_routes_bp.route('/upload-profile-picture', methods=['POST'])
@login_required
def upload_profile_picture():
    """Upload or update user's profile picture"""
    if 'user_id' not in session:
        return redirect('/login')
    
    if 'profile_picture' not in request.files:
        flash('No file selected.', 'warning')
        return redirect('/profile')
    
    file = request.files['profile_picture']
    if file.filename == '':
        flash('No file selected.', 'warning')
        return redirect('/profile')
    
    # Check file type
    allowed_extensions = {'png', 'jpg', 'jpeg', 'gif'}
    if not file.filename.lower().rsplit('.', 1)[1] in allowed_extensions:
        flash('Only PNG, JPG, JPEG, and GIF files are allowed.', 'danger')
        return redirect('/profile')
    
    # Check file size (max 5MB)
    if len(file.read()) > 5 * 1024 * 1024:
        flash('File size must be less than 5MB.', 'danger')
        return redirect('/profile')
    
    # Reset file pointer
    file.seek(0)
    
    # Generate unique filename
    import os
    import uuid
    ext = file.filename.rsplit('.', 1)[1].lower()
    uid = uuid.uuid4().hex
    filename = f"profile_{session['user_id']}_{uid[:8]}.{ext}"
    
    # Create uploads directory in project root if it doesn't exist
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    upload_dir = os.path.join(project_root, 'static', 'uploads')
    os.makedirs(upload_dir, exist_ok=True)
    
    # Save file
    file_path = os.path.join(upload_dir, filename)
    file.save(file_path)
    
    # Update database with relative path
    relative_path = f"/static/uploads/{filename}"
    
    with sqlite3.connect('database.db') as conn:
        # Delete old profile picture if exists
        old_picture = conn.execute("SELECT profile_picture FROM users WHERE id = ?", (session['user_id'],)).fetchone()
        if old_picture and old_picture[0] and old_picture[0].startswith('/static/uploads/'):
            try:
                old_filename = old_picture[0].split('/')[-1]
                old_file_path = os.path.join(upload_dir, old_filename)
                if os.path.exists(old_file_path):
                    os.remove(old_file_path)
            except:
                pass
        
        # Update with new picture
        conn.execute("UPDATE users SET profile_picture = ? WHERE id = ?", (relative_path, session['user_id']))
        conn.commit()
    
    flash('Profile picture updated successfully!', 'success')
    return redirect('/profile')

@profile_routes_bp.route('/delete-profile-picture', methods=['POST'])
@login_required
def delete_profile_picture():
    """Delete user's profile picture"""
    if 'user_id' not in session:
        return redirect('/login')
    
    with sqlite3.connect('database.db') as conn:
        # Get current profile picture
        user = conn.execute("SELECT profile_picture FROM users WHERE id = ?", (session['user_id'],)).fetchone()
        if user and user[0]:
            # Delete file from filesystem
            import os
            file_path = os.path.join(os.path.dirname(__file__), 'static', user[0])
            if os.path.exists(file_path):
                os.remove(file_path)
            
            # Remove from database
            conn.execute("UPDATE users SET profile_picture = NULL WHERE id = ?", (session['user_id'],))
            flash('Profile picture deleted successfully!', 'success')
        else:
            flash('No profile picture to delete.', 'info')
    
    return redirect('/profile')

@profile_routes_bp.route('/delete-account', methods=['POST'])
def delete_account():
    if 'user_id' not in session:
        flash("Please log in to delete your account.", "warning")
        return redirect('/profile')
    
    password = request.form['password']
    with sqlite3.connect('database.db') as conn:
        user = conn.execute("SELECT * FROM users WHERE id = ?", (session['user_id'],)).fetchone()
        if user and check_password_hash(user[3], password):
            conn.execute("DELETE FROM users WHERE id = ?", (session['user_id'],))
            session.clear()
            flash("Account deleted successfully.", "success")
            
            # Create response with cache control headers
            response = redirect('/signup')
            response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate, max-age=0'
            response.headers['Pragma'] = 'no-cache'
            response.headers['Expires'] = '0'
            return response
        else:
            flash("Incorrect password. Account not deleted.", "danger")
            return redirect('/profile')
