# === FILENAME: admin_routes.py ===
from flask import Blueprint, request, render_template, redirect, flash, session
import sqlite3
import datetime
from core.decorators import admin_required, no_cache

admin_routes_bp = Blueprint('admin_routes', __name__)

@admin_routes_bp.route('/admin')
@admin_required
@no_cache
def admin_panel():
    """Admin panel to manage users"""
    with sqlite3.connect('database.db') as conn:
        # Get all users with their details
        users = conn.execute("""
            SELECT id, email, username, password, 
                   CASE 
                       WHEN banned_until IS NULL THEN 'Active'
                       WHEN banned_until > datetime('now') THEN 'Temporarily Banned'
                       ELSE 'Permanently Banned'
                   END as status,
                   banned_until, ban_reason
            FROM users 
            ORDER BY id
        """).fetchall()
    return {"message": "API backend is running. Please use the React frontend."}

@admin_routes_bp.route('/admin/ban-user', methods=['POST'])
@admin_required
def ban_user():
    """Ban a user temporarily or permanently"""
    user_id = request.form.get('user_id')
    ban_type = request.form.get('ban_type')  
    ban_duration = request.form.get('ban_duration')  
    ban_reason = request.form.get('ban_reason', 'No reason provided')
    
    with sqlite3.connect('database.db') as conn:
        if ban_type == 'temp':
            # Calculate ban until date
            ban_until = (datetime.datetime.now() + datetime.timedelta(days=int(ban_duration))).isoformat()
            conn.execute("""
                UPDATE users 
                SET banned_until = ?, ban_reason = ? 
                WHERE id = ?
            """, (ban_until, ban_reason, user_id))
            flash(f'User temporarily banned for {ban_duration} days', 'warning')
        else:
            # Permanent ban
            conn.execute("""
                UPDATE users 
                SET banned_until = '9999-12-31', ban_reason = ? 
                WHERE id = ?
            """, (ban_reason, user_id))
            flash('User permanently banned', 'danger')
    
    return redirect('/admin')

@admin_routes_bp.route('/admin/unban-user', methods=['POST'])
@admin_required
def unban_user():
    """Unban a user"""
    user_id = request.form.get('user_id')
    
    with sqlite3.connect('database.db') as conn:
        conn.execute("""
            UPDATE users 
            SET banned_until = NULL, ban_reason = NULL 
            WHERE id = ?
        """, (user_id,))
        flash('User unbanned successfully', 'success')
    
    return redirect('/admin')

@admin_routes_bp.route('/admin/delete-user', methods=['POST'])
@admin_required
def admin_delete_user():
    """Delete a user account"""
    user_id = request.form.get('user_id')
    
    with sqlite3.connect('database.db') as conn:
        conn.execute("DELETE FROM users WHERE id = ?", (user_id,))
        flash('User account deleted successfully', 'success')
    
    return redirect('/admin')
