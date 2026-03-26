# === FILENAME: auth_routes.py ===
from flask import Blueprint, request, render_template, redirect, flash, session
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash
from core.decorators import no_cache
from core.security import (
    rate_limiter, 
    validate_email, 
    validate_password, 
    validate_username,
    brute_force
)

auth_routes_bp = Blueprint('auth_routes', __name__)

@auth_routes_bp.route('/signup', methods=['GET', 'POST'])
@no_cache
@rate_limiter.limit("3 per hour", error_message="Too many signup attempts. Please try again later.")
def signup():
    # If already logged in, avoid showing signup
    if request.method == 'GET' and 'user_id' in session:
        return redirect('/')
    if request.method == 'POST':
        email = request.form.get('email', '').strip()
        username = request.form.get('username', '').strip()
        raw_password = request.form.get('password', '')

        # Input validation
        is_valid, error = validate_email(email)
        if not is_valid:
            flash(error, "danger")
            return redirect('/signup')
        
        is_valid, error = validate_username(username)
        if not is_valid:
            flash(error, "danger")
            return redirect('/signup')
        
        is_valid, error = validate_password(raw_password)
        if not is_valid:
            flash(error, "danger")
            return redirect('/signup')

        password = generate_password_hash(raw_password)

        try:
            with sqlite3.connect('database.db') as conn:
                conn.execute("INSERT INTO users (email, username, password) VALUES (?, ?, ?)",
                         (email, username, password))
            flash("Signup successful. Please log in.", "success")
            return redirect('/login')
        except sqlite3.IntegrityError:
            flash("Email or username already exists.", "danger")
            return redirect('/signup')

    return {"message": "API backend is running. Please use the React frontend."}

@auth_routes_bp.route('/login', methods=['GET', 'POST'])
@no_cache
@rate_limiter.limit("10 per minute", error_message="Too many login attempts. Please try again later.")
def login():
    # If user is already authenticated and tries to access login page (e.g., via back button),
    # redirect them to home page to avoid showing login again.
    if request.method == 'GET' and 'user_id' in session:
        return redirect('/')
    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')

        # Check for brute force lockout
        is_locked, remaining = brute_force.is_locked_out(email)
        if is_locked:
            flash(f"Too many failed attempts. Try again in {remaining} seconds.", "danger")
            return redirect('/login')

        with sqlite3.connect('database.db') as conn:
            user = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()

        if user and check_password_hash(user[3], password):
            # Clear brute force tracking on successful login
            brute_force.record_success(email)
            
            # Check if user is banned
            if user[4]:  # banned_until column
                if user[4] == '9999-12-31':
                    flash("Your account has been permanently banned.", "danger")
                    return redirect('/login')
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
                            flash(f"Your account is temporarily banned until {user[4]}. Reason: {user[5] or 'No reason provided'}", "danger")
                            return redirect('/login')
                        else:
                            # Ban has expired, clear it
                            conn.execute("UPDATE users SET banned_until = NULL, ban_reason = NULL WHERE id = ?", (user[0],))
            
            # Store user info in session
            session.permanent = True
            session['user_id'] = user[0]
            session['email'] = user[1]
            session['username'] = user[2]
            flash("Login successful!", "success")
            return redirect('/dashboard')
        else:
            # Record failed attempt for brute force protection
            brute_force.record_failure(email)
            remaining = brute_force.get_remaining_attempts(email)
            if remaining > 0:
                flash(f"Invalid credentials. {remaining} attempts remaining.", "danger")
            else:
                flash("Too many failed attempts. Your account is temporarily locked.", "danger")
            return redirect('/login')

    return {"message": "API backend is running. Please use the React frontend."}

@auth_routes_bp.route('/logout')
def logout():
    # Clear session
    session.clear()
    flash("Logged out successfully.", "info")
    
    # Create response with cache control headers
    response = redirect('/login')
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

@auth_routes_bp.route('/forgot')
def forgot():
    return {"message": "API backend is running. Please use the React frontend."}

@auth_routes_bp.route('/reset', methods=['GET', 'POST'])
def reset():
    if request.method == 'POST':
        email = request.form['email']
        new_password = request.form['new_password']
        confirm_password = request.form.get('confirm_password', '') 

        if new_password != confirm_password:
            flash("Passwords do not match.", "danger")
            return redirect('/reset')

        with sqlite3.connect('database.db') as conn:
            user = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()

            if not user:
                flash("Email not found.", "danger")
                return redirect('/reset')

            conn.execute("UPDATE users SET password = ? WHERE email = ?",
                     (generate_password_hash(new_password), email))
            flash("Password reset successful.", "success")
            return redirect('/login')

    return {"message": "API backend is running. Please use the React frontend."}

@auth_routes_bp.route('/check-auth')
def check_auth():
    """Check if user is authenticated - used for back button prevention"""
    if 'user_id' in session:
        return {'authenticated': True}
    return {'authenticated': False}
