# === FILENAME: dashboard_routes.py ===
from flask import Blueprint, request, render_template, session, jsonify, Response
import sqlite3
import datetime
import calendar
import io
import csv
from core.decorators import login_required, no_cache

dashboard_routes_bp = Blueprint('dashboard_routes', __name__)

@dashboard_routes_bp.route('/')
@no_cache
def home():
    user = None
    if 'user_id' in session:
        with sqlite3.connect('database.db') as conn:
            user = conn.execute("SELECT id, email, username FROM users WHERE id = ?", (session['user_id'],)).fetchone()
    return {"message": "API backend is running. Please use the React frontend."}

@dashboard_routes_bp.route('/index')
@no_cache
def index():
    user = None
    if 'user_id' in session:
        with sqlite3.connect('database.db') as conn:
            user = conn.execute("SELECT id, email, username FROM users WHERE id = ?", (session['user_id'],)).fetchone()
    # allow result passed via query string after redirect
    result = request.args.get('result')
    return {"message": "API backend is running. Please use the React frontend."}

@dashboard_routes_bp.route('/dashboard')
@login_required
@no_cache
def dashboard():
    user = None
    if 'user_id' in session:
        with sqlite3.connect('database.db') as conn:
            user = conn.execute("SELECT id, email, username, profile_picture FROM users WHERE id = ?", (session['user_id'],)).fetchone()
    return {"message": "API backend is running. Please use the React frontend."}

@dashboard_routes_bp.route('/plant-dashboard')
@login_required
@no_cache
def plant_dashboard():
    """Modern, responsive dashboard page for Plant Disease Detection & Crop Recommendation.
    This is a separate page and does not modify existing UIs.
    """
    # Fetch logged-in user (id, email, username, profile_picture)
    user = None
    if 'user_id' in session:
        with sqlite3.connect('database.db') as conn:
            user = conn.execute(
                "SELECT id, email, username, profile_picture FROM users WHERE id = ?",
                (session['user_id'],)
            ).fetchone()

    # Build last 12 months keys and labels (e.g., '2025-01', label 'Jan')
    now = datetime.datetime.now()
    month_keys = []  # e.g., '2025-01'
    month_labels = []  # e.g., 'Jan'
    y, m = now.year, now.month
    for i in range(11, -1, -1):
        yy = y
        mm = m - i
        while mm <= 0:
            mm += 12
            yy -= 1
        month_keys.append(f"{yy:04d}-{mm:02d}")
        month_labels.append(calendar.month_abbr[mm])

    # Recommendation metrics from logs
    crop_recommendations = 0
    recs_by_month = {k: 0 for k in month_keys}
    with sqlite3.connect('database.db') as conn:
        # Total recommendations
        cur = conn.execute("SELECT COUNT(*) FROM recommendation_logs")
        row = cur.fetchone()
        crop_recommendations = row[0] if row and row[0] is not None else 0

        # Count per month for last 12 months
        cur = conn.execute(
            """
            SELECT strftime('%Y-%m', created_at) as ym, COUNT(*)
            FROM recommendation_logs
            GROUP BY ym
            """
        )
        for ym, cnt in cur.fetchall():
            if ym in recs_by_month:
                recs_by_month[ym] = int(cnt)

    recs_per_month = [recs_by_month[k] for k in month_keys]

    # Rec growth = change between last month and previous month in percent
    last_month_cnt = recs_per_month[-1] if len(recs_per_month) >= 1 else 0
    prev_month_cnt = recs_per_month[-2] if len(recs_per_month) >= 2 else 0
    if prev_month_cnt == 0:
        rec_growth = 100 if last_month_cnt > 0 else 0
    else:
        rec_growth = int(round((last_month_cnt - prev_month_cnt) * 100 / prev_month_cnt))

    # Other KPIs remain placeholders for now; can be wired to real data later
    total_analyses = crop_recommendations  # treat as total processed recommendations for now
    healthy_crops = 0
    detected_diseases = 0
    analyses_growth = rec_growth
    healthy_growth = 0
    disease_change = 0

    # Chart placeholders for diseases until logs are added for detections
    diseases_per_month = [0 for _ in month_keys]
    
    # Recent detections table (sample data)
    recent_detections = [
        { 'plant_name': 'Corn',   'disease': 'Northern Leaf Blight', 'confidence': 92.4, 'date': '2025-09-28' },
        { 'plant_name': 'Potato', 'disease': 'Early Blight',          'confidence': 88.1, 'date': '2025-09-26' },
        { 'plant_name': 'Corn',   'disease': 'Common Rust',           'confidence': 81.6, 'date': '2025-09-24' },
        { 'plant_name': 'Corn',   'disease': 'Gray Leaf Spot',        'confidence': 84.9, 'date': '2025-09-18' },
    ]

    return {"message": "API backend is running. Please use the React frontend."}

@dashboard_routes_bp.route('/dashboard_complete')
@login_required
@no_cache
def dashboard_complete():
    """Route for dashboard_complete.html template"""
    # Fetch logged-in user (id, email, username, profile_picture)
    user = None
    if 'user_id' in session:
        with sqlite3.connect('database.db') as conn:
            user = conn.execute(
                "SELECT id, email, username, profile_picture FROM users WHERE id = ?",
                (session['user_id'],)
            ).fetchone()

    return {"message": "API backend is running. Please use the React frontend."}

@dashboard_routes_bp.route('/api/dashboard-data', methods=['GET'])
def api_dashboard_data():
    """Returns aggregated numbers and chart data for the current user (or admin sees all)."""
    user_id = session.get('user_id')
    now = datetime.datetime.now()
    
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    filter_val = request.args.get('filter')
    
    month_keys = []
    month_labels = []
    for i in range(5, -1, -1):
        dt = now - datetime.timedelta(days=30*i)
        month_keys.append(dt.strftime('%Y-%m'))
        month_labels.append(dt.strftime('%b'))

    try:
        with sqlite3.connect('database.db') as conn:
            cur = conn.cursor()
            
            is_admin = (user_id == 2)
            base_where = []
            base_params = []
            
            if not is_admin:
                base_where.append("user_id = ?")
                base_params.append(user_id)
                
            if start_date:
                base_where.append("created_at >= ?")
                base_params.append(f"{start_date} 00:00:00")
            if end_date:
                base_where.append("created_at <= ?")
                base_params.append(f"{end_date} 23:59:59")
                
            # Detections
            where_str_det = base_where.copy()
            params_det = base_params.copy()
            if filter_val:
                where_str_det.append("(plant_name LIKE ? OR disease LIKE ?)")
                params_det.extend([f"%{filter_val}%", f"%{filter_val}%"])
            where_clause_det = " WHERE " + " AND ".join(where_str_det) if where_str_det else ""
            
            cur.execute(f'SELECT COUNT(*) FROM detection_logs{where_clause_det}', params_det)
            total_detections = cur.fetchone()[0] or 0
            
            # Recommendations
            where_str_rec = base_where.copy()
            params_rec = base_params.copy()
            if filter_val:
                where_str_rec.append("crop LIKE ?")
                params_rec.append(f"%{filter_val}%")
            where_clause_rec = " WHERE " + " AND ".join(where_str_rec) if where_str_rec else ""
            cur.execute(f'SELECT COUNT(*) FROM recommendation_logs{where_clause_rec}', params_rec)
            total_recs = cur.fetchone()[0] or 0

            # Fertilizers
            where_str_fert = base_where.copy()
            params_fert = base_params.copy()
            if filter_val:
                where_str_fert.append("crop LIKE ?")
                params_fert.append(f"%{filter_val}%")
            where_clause_fert = " WHERE " + " AND ".join(where_str_fert) if where_str_fert else ""
            try:
                cur.execute(f'SELECT COUNT(*) FROM fertilizer_logs{where_clause_fert}', params_fert)
                total_ferts = cur.fetchone()[0] or 0
            except:
                total_ferts = 0

            # Disease distribution
            cur.execute(f'SELECT disease, COUNT(*) FROM detection_logs{where_clause_det} GROUP BY disease', params_det)
            dist = cur.fetchall()

            # Activity Growth (Bar Chart) - 6 months
            activity_data = []
            max_val = 0
            for i, mk in enumerate(month_keys):
                mk_where = base_where.copy()
                mk_params = base_params.copy()
                mk_where.append("strftime('%Y-%m', created_at) = ?")
                mk_params.append(mk)
                mk_clause = " WHERE " + " AND ".join(mk_where)
                
                # Default empty counts
                d_c = 0; r_c = 0; f_c = 0
                try:
                    cur.execute(f"SELECT COUNT(*) FROM detection_logs{mk_clause}", mk_params)
                    d_c = cur.fetchone()[0] or 0
                    cur.execute(f"SELECT COUNT(*) FROM recommendation_logs{mk_clause}", mk_params)
                    r_c = cur.fetchone()[0] or 0
                    cur.execute(f"SELECT COUNT(*) FROM fertilizer_logs{mk_clause}", mk_params)
                    f_c = cur.fetchone()[0] or 0
                except: pass
                
                total_month = d_c + r_c + f_c
                if total_month > max_val: max_val = total_month
                
                activity_data.append({
                    'month': month_labels[i],
                    'value': total_month,
                    'active': (i == 4)  # 5th item acts as active
                })
            
            # Normalize to 0-100 for CSS height
            if max_val > 0:
                for a in activity_data:
                    a['raw_value'] = a['value']
                    a['value'] = int((int(a['value']) / int(max_val)) * 100)

            # Request Types (Recommendations Distribution)
            cur.execute(f"SELECT crop, COUNT(*) FROM recommendation_logs{where_clause_rec} GROUP BY crop ORDER BY count(*) DESC LIMIT 5", params_rec)
            crop_groups = cur.fetchall()
            req_types = []
            colors = ['#e74c3c', '#2ecc71', '#f39c12', '#3498db', '#9b59b6']
            for i, r in enumerate(crop_groups):
                req_types.append({
                    'name': r[0].capitalize(),
                    'value': r[1],
                    'total': total_recs,
                    'color': colors[i % len(colors)]
                })

            # Recent 5 detections
            cur.execute(f"SELECT id, user_id, plant_name, disease, confidence, image_url, created_at FROM detection_logs{where_clause_det} ORDER BY created_at DESC LIMIT 5", params_det)
            recent_rows = cur.fetchall()
            recent_detections = []
            for r in recent_rows:
                recent_detections.append({
                    'id': r[0], 'user_id': r[1], 'plant_name': r[2], 
                    'disease': r[3], 'confidence': r[4], 
                    'image_url': r[5], 'created_at': r[6]
                })

        return {
            'total_detections': total_detections,
            'total_recs': total_recs,
            'total_ferts': total_ferts,
            'disease_distribution': [{ 'disease': r[0], 'count': r[1] } for r in dist],
            'activity_data': activity_data,
            'request_types': req_types,
            'max_activity_val': max_val,
            'recent_detections': recent_detections
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        return { 'error': str(e) }, 500

@dashboard_routes_bp.route('/api/export-csv/<log_type>', methods=['GET'])
def export_csv(log_type):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    
    # Optional date filters for export
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    try:
        with sqlite3.connect('database.db') as conn:
            cur = conn.cursor()
            
            query = ""
            params = []
            headers = []
            
            # Base logic handles admins (user_id 2) vs normal users
            is_admin = (user_id == 2)
            
            where_clauses = []
            if not is_admin:
                where_clauses.append("user_id = ?")
                params.append(user_id)
                
            if start_date:
                where_clauses.append("created_at >= ?")
                params.append(f"{start_date} 00:00:00")
            if end_date:
                where_clauses.append("created_at <= ?")
                params.append(f"{end_date} 23:59:59")
                
            where_str = " WHERE " + " AND ".join(where_clauses) if where_clauses else ""
            
            if log_type == 'detections':
                query = f"SELECT id, plant_name, disease, confidence, created_at FROM detection_logs{where_str} ORDER BY created_at DESC"
                headers = ['ID', 'Plant Name', 'Disease', 'Confidence', 'Created At']
            elif log_type == 'recommendations':
                query = f"SELECT id, crop, nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall, created_at FROM recommendation_logs{where_str} ORDER BY created_at DESC"
                headers = ['ID', 'Crop', 'Nitrogen', 'Phosphorus', 'Potassium', 'Temp', 'Humidity', 'pH', 'Rainfall', 'Created At']
            elif log_type == 'fertilizers':
                query = f"SELECT id, crop, nitrogen_current, phosphorus_current, potassium_current, recommendation, created_at FROM fertilizer_logs{where_str} ORDER BY created_at DESC"
                headers = ['ID', 'Crop', 'N Current', 'P Current', 'K Current', 'Recommendation', 'Created At']
            else:
                return jsonify({'error': 'Invalid log type'}), 400
                
            cur.execute(query, params)
            rows = cur.fetchall()
            
            si = io.StringIO()
            cw = csv.writer(si)
            cw.writerow(headers)
            cw.writerows(rows)
            
            output = si.getvalue()
            
            return Response(
                output,
                mimetype='text/csv',
                headers={'Content-Disposition': f'attachment; filename={log_type}_history.csv'}
            )
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@dashboard_routes_bp.route('/chatbot')
@login_required
@no_cache
def chatbot():
    user = None
    if 'user_id' in session:
        with sqlite3.connect('database.db') as conn:
            user = conn.execute("SELECT id, email, username FROM users WHERE id = ?", (session['user_id'],)).fetchone()
    return {"message": "API backend is running. Please use the React frontend."}

@dashboard_routes_bp.route('/api/public/stats', methods=['GET'])
def public_stats():
    """Returns real-time aggregated counts for the landing page."""
    try:
        with sqlite3.connect('database.db') as conn:
            cur = conn.cursor()
            cur.execute("SELECT COUNT(*) FROM users")
            users_count = cur.fetchone()[0] or 0
            cur.execute("SELECT COUNT(*) FROM detection_logs")
            scans_count = cur.fetchone()[0] or 0
            cur.execute("SELECT COUNT(*) FROM recommendation_logs")
            recs_count = cur.fetchone()[0] or 0
            
            # Use fetchone(), handle table absence just in case
            try:
                cur.execute("SELECT COUNT(*) FROM fertilizer_logs")
                fert_count = cur.fetchone()[0] or 0
            except:
                fert_count = 0
            
        return {
            'users': users_count,
            'scans': scans_count,
            'recommendations': recs_count,
            'fertilizer_plans': fert_count
        }
    except Exception as e:
        return {'error': str(e)}, 500
