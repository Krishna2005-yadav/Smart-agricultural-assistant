# === FILENAME: admin_api.py ===
from flask import Blueprint, request, session, jsonify
import sqlite3
import datetime
from core.decorators import admin_required, no_cache

admin_api_bp = Blueprint('admin_api', __name__)

@admin_api_bp.route('/api/admin/stats', methods=['GET'])
@admin_required
@no_cache
def api_admin_stats():
    """Returns platform-wide statistics for the admin dashboard."""
    try:
        with sqlite3.connect('database.db') as conn:
            cur = conn.cursor()
            
            # Key Metrics
            total_users = cur.execute("SELECT COUNT(*) FROM users").fetchone()[0]
            total_detections = cur.execute("SELECT COUNT(*) FROM detection_logs").fetchone()[0]
            total_recommendations = cur.execute("SELECT COUNT(*) FROM recommendation_logs").fetchone()[0]
            total_fertilizer_recs = cur.execute("SELECT COUNT(*) FROM fertilizer_logs").fetchone()[0]
            
            # Disease Distribution (Most/Least Predicted)
            cur.execute("SELECT disease, COUNT(*) as c FROM detection_logs GROUP BY disease ORDER BY c DESC")
            disease_stats = [{'name': row[0], 'count': row[1]} for row in cur.fetchall()]
            
            # Crop Recommendation Distribution
            cur.execute("SELECT crop, COUNT(*) as c FROM recommendation_logs GROUP BY crop ORDER BY c DESC")
            crop_stats = [{'name': row[0], 'count': row[1]} for row in cur.fetchall()]
            
            # Monthly Activity (Last 6 months)
            month_stats = []
            now = datetime.datetime.now()
            for i in range(5, -1, -1):
                dt = now - datetime.timedelta(days=30*i)
                month_str = dt.strftime('%Y-%m')
                det_count = cur.execute("SELECT COUNT(*) FROM detection_logs WHERE strftime('%Y-%m', created_at) = ?", (month_str,)).fetchone()[0]
                rec_count = cur.execute("SELECT COUNT(*) FROM recommendation_logs WHERE strftime('%Y-%m', created_at) = ?", (month_str,)).fetchone()[0]
                fer_count = cur.execute("SELECT COUNT(*) FROM fertilizer_logs WHERE strftime('%Y-%m', created_at) = ?", (month_str,)).fetchone()[0]
                month_stats.append({
                    'month': dt.strftime('%b'),
                    'detections': det_count,
                    'recommendations': rec_count,
                    'fertilizer': fer_count
                })

        return {
            'total_users': total_users,
            'total_detections': total_detections,
            'total_recommendations': total_recommendations,
            'total_fertilizer_recs': total_fertilizer_recs,
            'disease_stats': disease_stats,
            'crop_stats': crop_stats,
            'activity_stats': month_stats
        }
    except Exception as e:
        return {'error': str(e)}, 500

@admin_api_bp.route('/api/admin/users', methods=['GET'])
@admin_required
@no_cache
def api_admin_users():
    """Returns a list of all users with activity summaries."""
    try:
        with sqlite3.connect('database.db') as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            query = """
                SELECT 
                    u.id, u.username, u.email, u.is_admin, u.banned_until, u.ban_reason,
                    (SELECT COUNT(*) FROM detection_logs WHERE user_id = u.id) as detection_count,
                    (SELECT COUNT(*) FROM recommendation_logs WHERE user_id = u.id) as recommendation_count,
                    (SELECT COUNT(*) FROM fertilizer_logs WHERE user_id = u.id) as fertilizer_count
                FROM users u
                ORDER BY u.id DESC
            """
            users = [dict(row) for row in cursor.execute(query).fetchall()]
            
        return {'users': users}
    except Exception as e:
        print(f"Error fetching users: {e}")
        return {'error': str(e)}, 500

@admin_api_bp.route('/api/admin/users/<int:user_id>/status', methods=['PUT'])
@admin_required
def api_admin_update_user_status(user_id):
    """Updates user ban status."""
    data = request.get_json() or {}
    action = data.get('action') # 'ban', 'unban', 'permanent_ban'
    reason = data.get('reason', '')
    
    if not action:
        return {'error': 'Action is required'}, 400
        
    try:
        with sqlite3.connect('database.db') as conn:
            if action == 'unban':
                conn.execute("UPDATE users SET banned_until = NULL, ban_reason = NULL WHERE id = ?", (user_id,))
            elif action == 'ban':
                duration_days = data.get('duration_days', 7)
                banned_until = (datetime.datetime.now() + datetime.timedelta(days=duration_days)).isoformat()
                conn.execute("UPDATE users SET banned_until = ?, ban_reason = ? WHERE id = ?", (banned_until, reason, user_id))
            elif action == 'permanent_ban':
                banned_until = (datetime.datetime.now() + datetime.timedelta(days=36500)).isoformat()
                conn.execute("UPDATE users SET banned_until = ?, ban_reason = ? WHERE id = ?", (banned_until, reason, user_id))
            else:
                return {'error': 'Invalid action'}, 400
                
        return {'success': True}
    except Exception as e:
        return {'error': str(e)}, 500

@admin_api_bp.route('/api/admin/users/<int:user_id>', methods=['DELETE'])
@admin_required
def api_admin_delete_user(user_id):
    """Admin deletes a user account."""
    if user_id == session.get('user_id'):
        return {'error': 'Cannot self-delete via this endpoint'}, 400
        
    try:
        with sqlite3.connect('database.db') as conn:
             # Delete detection logs and their images first
            cur = conn.execute("SELECT image_url FROM detection_logs WHERE user_id = ?", (user_id,))
            for row in cur.fetchall():
                if row[0]:
                    import os
                    image_path = os.path.join('static', row[0].lstrip('/static/'))
                    if os.path.exists(image_path):
                        try:
                            os.remove(image_path)
                        except:
                            pass
            
            conn.execute("DELETE FROM detection_logs WHERE user_id = ?", (user_id,))
            conn.execute("DELETE FROM recommendation_logs WHERE user_id = ?", (user_id,))
            conn.execute("DELETE FROM users WHERE id = ?", (user_id,))
            
        return {'success': True}
    except Exception as e:
        return {'error': str(e)}, 500

@admin_api_bp.route('/api/settings', methods=['GET'])
def get_site_settings():
    try:
        with sqlite3.connect('database.db') as conn:
            settings = conn.execute("SELECT key, value FROM site_settings").fetchall()
            return jsonify({s[0]: s[1] == 'true' for s in settings})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_api_bp.route('/api/admin/settings', methods=['POST'])
@admin_required
def update_site_settings():
    data = request.json
    if not data or 'key' not in data or 'value' not in data:
        return jsonify({'error': 'Invalid data'}), 400
    
    key = data['key']
    value = 'true' if data['value'] else 'false'
    
    try:
        with sqlite3.connect('database.db') as conn:
            conn.execute("INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)", (key, value))
            return jsonify({'success': True, 'key': key, 'value': value == 'true'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
