# === FILENAME: fertilizer_routes.py ===
from flask import Blueprint, request, session
import sqlite3
from core.decorators import login_required
from core.security import rate_limiter

fertilizer_routes_bp = Blueprint('fertilizer_routes', __name__)

# Ideal N-P-K values for various crops (per hectare/acre basis generic values)
FERTILIZER_DATA = {
    "Rice": {"N": 80, "P": 40, "K": 40},
    "Maize": {"N": 100, "P": 50, "K": 50},
    "Chickpea": {"N": 40, "P": 60, "K": 80},
    "Kidneybeans": {"N": 20, "P": 60, "K": 20},
    "Pigeonpeas": {"N": 20, "P": 60, "K": 20},
    "Mothbeans": {"N": 20, "P": 40, "K": 20},
    "Mungbean": {"N": 20, "P": 40, "K": 20},
    "Blackgram": {"N": 20, "P": 40, "K": 20},
    "Lentil": {"N": 20, "P": 60, "K": 20},
    "Pomegranate": {"N": 60, "P": 30, "K": 30},
    "Banana": {"N": 110, "P": 40, "K": 150},
    "Mango": {"N": 100, "P": 50, "K": 100},
    "Grapes": {"N": 60, "P": 40, "K": 120},
    "Watermelon": {"N": 100, "P": 10, "K": 50},
    "Muskmelon": {"N": 100, "P": 10, "K": 50},
    "Apple": {"N": 100, "P": 50, "K": 100},
    "Orange": {"N": 60, "P": 30, "K": 30},
    "Papaya": {"N": 50, "P": 50, "K": 50},
    "Coconut": {"N": 40, "P": 30, "K": 100},
    "Cotton": {"N": 120, "P": 60, "K": 60},
    "Jute": {"N": 80, "P": 40, "K": 40},
    "Coffee": {"N": 100, "P": 20, "K": 30}
}

@fertilizer_routes_bp.route('/api/fertilizer/recommend', methods=['POST'])
@login_required
@rate_limiter.limit("10 per minute")
def api_recommend_fertilizer():
    """Calculates required fertilizers based on current N-P-K and target crop."""
    data = request.get_json() or {}
    crop = data.get('crop')
    n_curr = float(data.get('nitrogen') or 0)
    p_curr = float(data.get('phosphorus') or 0)
    k_curr = float(data.get('potassium') or 0)
    user_id = session.get('user_id')

    if not crop or crop not in FERTILIZER_DATA:
        return {'error': 'Invalid or missing crop name'}, 400

    ideal = FERTILIZER_DATA[crop]
    n_diff = ideal['N'] - n_curr
    p_diff = ideal['P'] - p_curr
    k_diff = ideal['K'] - k_curr

    recommendations = []
    
    # Simple logic to suggest fertilizers:
    # Urea: ~46% Nitrogen
    # DAP: ~18% Nitrogen, 46% Phosphorus
    # MOP: ~60% Potassium
    
    if n_diff > 0:
        urea_needed = round(n_diff / 0.46, 2)
        recommendations.append(f"Apply {urea_needed} kg/acre of Urea to increase Nitrogen.")
    elif n_diff < -10:
        recommendations.append("Nitrogen levels are very high. Avoid adding nitrogenous fertilizers and consider water flushing.")
        
    if p_diff > 0:
        dap_needed = round(p_diff / 0.46, 2)
        recommendations.append(f"Apply {dap_needed} kg/acre of DAP to increase Phosphorus.")
    elif p_diff < -10:
        recommendations.append("Phosphorus levels are high. Avoid adding phosphate fertilizers.")
        
    if k_diff > 0:
        mop_needed = round(k_diff / 0.60, 2)
        recommendations.append(f"Apply {mop_needed} kg/acre of MOP to increase Potassium.")
    elif k_diff < -10:
        recommendations.append("Potassium levels are sufficient/high. Avoid adding potash fertilizers.")

    if not recommendations:
        final_rec = "Your soil nutrient levels are optimal for this crop! No additional chemical fertilizers needed."
    else:
        final_rec = " ".join(recommendations)

    try:
        with sqlite3.connect('database.db') as conn:
            conn.execute(
                "INSERT INTO fertilizer_logs (user_id, crop, nitrogen_current, phosphorus_current, potassium_current, recommendation) VALUES (?,?,?,?,?,?)",
                (user_id, crop, n_curr, p_curr, k_curr, final_rec)
            )
        return {
            'success': True,
            'crop': crop,
            'ideal': ideal,
            'current': {'N': n_curr, 'P': p_curr, 'K': k_curr},
            'recommendation': final_rec
        }
    except Exception as e:
        return {'error': str(e)}, 500

@fertilizer_routes_bp.route('/api/fertilizer/history', methods=['GET'])
@login_required
def api_get_fertilizer_history():
    user_id = session.get('user_id')
    try:
        with sqlite3.connect('database.db') as conn:
            conn.row_factory = sqlite3.Row
            if user_id == 2:  # admin: return all
                rows = conn.execute("SELECT * FROM fertilizer_logs ORDER BY created_at DESC").fetchall()
            else:
                rows = conn.execute("SELECT * FROM fertilizer_logs WHERE user_id = ? ORDER BY created_at DESC", (user_id,)).fetchall()
            history = [dict(r) for r in rows]
        return {'success': True, 'history': history}
    except Exception as e:
        return {'error': str(e)}, 500

@fertilizer_routes_bp.route('/api/fertilizer/history/<int:fert_id>', methods=['DELETE'])
@login_required
def api_delete_fertilizer(fert_id):
    """Delete a specific fertilizer calculation log entry."""
    user_id = session.get('user_id')
    try:
        with sqlite3.connect('database.db') as conn:
            cur = conn.cursor()
            if user_id == 2:
                cur.execute("DELETE FROM fertilizer_logs WHERE id = ?", (fert_id,))
            else:
                cur.execute("DELETE FROM fertilizer_logs WHERE id = ? AND user_id = ?", (fert_id, user_id))
            if cur.rowcount == 0:
                return { 'error': 'Fertilizer record not found or access denied' }, 404
        return { 'success': True, 'message': 'Fertilizer record deleted successfully' }
    except Exception as e:
        return { 'error': str(e) }, 500
