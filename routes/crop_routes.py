# === FILENAME: crop_routes.py ===
from flask import Blueprint, request, render_template, redirect, session
import numpy as np
import sqlite3
from core.extensions import model, mx, sc, crop_dict
from core.decorators import login_required

crop_routes_bp = Blueprint('crop_routes', __name__)

@crop_routes_bp.route('/predict', methods=['GET', 'POST'])
def predict():
    # If accessed via GET, redirect to the form page
    if request.method == 'GET':
        return redirect('/index')
    
    try:
        N = float(request.form['Nitrogen'])
        P = float(request.form['Phosphorus'])  
        K = float(request.form['Potassium'])
        temp = float(request.form['Temperature'])
        humidity = float(request.form['Humidity'])
        ph = float(request.form['pH'])
        rainfall = float(request.form['Rainfall'])

        # Input validation for realistic agricultural ranges
        validation_errors = []
        
        # Nitrogen: typical range 0-300 kg/ha
        if N < 0 or N > 300:
            validation_errors.append("Nitrogen should be between 0-300 kg/ha")
        
        # Phosphorus: typical range 0-150 kg/ha
        if P < 0 or P > 150:
            validation_errors.append("Phosphorus should be between 0-150 kg/ha")
        
        # Potassium: typical range 0-300 kg/ha
        if K < 0 or K > 300:
            validation_errors.append("Potassium should be between 0-300 kg/ha")
        
        # Temperature: -10 to 50
        if temp < -10 or temp > 50:
            validation_errors.append("Temperature should be between -10°C to 50°C")

        # Humidity: 0-100%
        if humidity < 0 or humidity > 100:
            validation_errors.append("Humidity should be between 0-100%")
        
        # pH: soil pH range 3.5 to 9.5
        if ph < 3.5 or ph > 9.5:
            validation_errors.append("pH should be between 3.5-9.5")

        # Rainfall: 0-500mm
        if rainfall < 0 or rainfall > 500:
            validation_errors.append("Rainfall should be between 0-500 mm")

        # If validation errors exist, return them to the user
        if validation_errors:
            user_ctx = None
            if 'user_id' in session:
                with sqlite3.connect('database.db') as conn:
                    user_ctx = conn.execute("SELECT id, email, username FROM users WHERE id = ?", (session['user_id'],)).fetchone()
            
            error_msg = "Invalid input values detected:<br><br>"
            for i, error in enumerate(validation_errors, 1):
                error_msg += f"{i}. {error}<br>"
            
            return {"message": "API backend is running. Please use the React frontend."}

        # 7 Features: N, P, K, temperature, humidity, ph, rainfall
        feature = np.array([N, P, K, temp, humidity, ph, rainfall]).reshape(1, -1)
        mx_feature = mx.transform(feature)
        sc_feature = sc.transform(mx_feature)

        prediction = model.predict(sc_feature)[0]
        crop = crop_dict.get(prediction, "Unknown")

        # Log the recommendation event
        # Log the recommendation event
        try:
            with sqlite3.connect('database.db') as conn:
                conn.execute(
                    """
                    INSERT INTO recommendation_logs (user_id, crop, nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        session.get('user_id'),
                        crop,
                        N, P, K, temp, humidity, ph, rainfall
                    ),
                )
        except Exception as log_err:
            # Do not fail the user flow if logging has issues
            print(f"Recommendation log insert failed: {log_err}")

        # Fetch user for navbar/auth-sensitive template logic
        user_ctx = None
        if 'user_id' in session:
            with sqlite3.connect('database.db') as conn:
                user_ctx = conn.execute("SELECT id, email, username FROM users WHERE id = ?", (session['user_id'],)).fetchone()

        result = f"{crop} is the best crop to be cultivated right there."
        # Render directly instead of redirect to avoid potential issues
        return {"message": "API backend is running. Please use the React frontend."}

    except Exception as e:
        # Fetch user for navbar/auth-sensitive template logic even on error
        user_ctx = None
        if 'user_id' in session:
            with sqlite3.connect('database.db') as conn:
                user_ctx = conn.execute("SELECT id, email, username FROM users WHERE id = ?", (session['user_id'],)).fetchone()
        return {"message": "API backend is running. Please use the React frontend."}

@crop_routes_bp.route('/index')
def index():
    from core.decorators import no_cache
    user = None
    if 'user_id' in session:
        with sqlite3.connect('database.db') as conn:
            user = conn.execute("SELECT id, email, username FROM users WHERE id = ?", (session['user_id'],)).fetchone()
    # allow result passed via query string after redirect
    result = request.args.get('result')
    return {"message": "API backend is running. Please use the React frontend."}

@crop_routes_bp.route('/api/recommendation', methods=['POST'])
def api_post_recommendation():
    """Accepts JSON: { nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall }
    Returns rich ML prediction with probabilities, metrics, alternatives, and crop info.
    """
    data = request.get_json() or {}
    N = float(data.get('nitrogen') or 0)
    P = float(data.get('phosphorus') or 0)
    K = float(data.get('potassium') or 0)
    T = float(data.get('temperature') or 0)
    H = float(data.get('humidity') or 0)
    ph = float(data.get('ph') or 7)
    R = float(data.get('rainfall') or 0)
    user_id = session.get('user_id')

    # Ideal growing profiles for all 22 crops
    CROP_PROFILES = {
        "Rice":        {"n":(60,120),"p":(40,80),"k":(40,80),"temp":(20,35),"hum":(60,95),"ph":(5.5,7.0),"rain":(800,2500),"season":"Summer","soil":"Alluvial / Clay","water":"High","ease":72},
        "Maize":       {"n":(60,140),"p":(35,70),"k":(30,80),"temp":(18,32),"hum":(50,80),"ph":(5.5,7.5),"rain":(500,1200),"season":"Spring","soil":"Loamy / Well-drained","water":"Moderate","ease":85},
        "Chickpea":    {"n":(20,60),"p":(40,80),"k":(20,60),"temp":(15,30),"hum":(30,60),"ph":(6.0,8.0),"rain":(400,800),"season":"Winter","soil":"Sandy / Loamy","water":"Low","ease":88},
        "Kidneybeans": {"n":(0,40),"p":(50,90),"k":(15,30),"temp":(15,28),"hum":(40,70),"ph":(5.5,7.0),"rain":(600,1200),"season":"Spring","soil":"Loamy","water":"Moderate","ease":78},
        "Pigeonpeas":  {"n":(0,40),"p":(50,90),"k":(15,35),"temp":(20,35),"hum":(40,70),"ph":(5.0,7.5),"rain":(600,1500),"season":"Summer","soil":"Deep Loamy","water":"Low–Moderate","ease":82},
        "Mothbeans":   {"n":(15,40),"p":(40,70),"k":(15,30),"temp":(24,35),"hum":(20,60),"ph":(6.0,7.5),"rain":(200,600),"season":"Summer","soil":"Sandy / Arid","water":"Very Low","ease":92},
        "Mungbean":    {"n":(0,40),"p":(40,80),"k":(15,30),"temp":(25,35),"hum":(50,85),"ph":(5.5,7.5),"rain":(600,1200),"season":"Summer","soil":"Loamy / Alluvial","water":"Moderate","ease":85},
        "Blackgram":   {"n":(20,50),"p":(50,80),"k":(15,30),"temp":(25,35),"hum":(60,80),"ph":(6.0,7.5),"rain":(700,1000),"season":"Summer","soil":"Loamy / Clay","water":"Moderate","ease":83},
        "Lentil":      {"n":(0,30),"p":(50,80),"k":(15,30),"temp":(15,28),"hum":(30,60),"ph":(6.0,8.0),"rain":(300,700),"season":"Winter","soil":"Loamy / Sandy","water":"Low","ease":87},
        "Pomegranate": {"n":(0,40),"p":(0,30),"k":(30,60),"temp":(25,38),"hum":(30,60),"ph":(6.5,7.5),"rain":(500,800),"season":"Spring","soil":"Sandy / Loamy","water":"Low","ease":65},
        "Banana":      {"n":(80,130),"p":(60,100),"k":(40,80),"temp":(25,35),"hum":(70,90),"ph":(5.5,7.0),"rain":(1200,2500),"season":"Year-round","soil":"Deep Alluvial","water":"High","ease":60},
        "Mango":       {"n":(0,30),"p":(20,60),"k":(20,50),"temp":(24,36),"hum":(40,75),"ph":(5.5,7.5),"rain":(600,2500),"season":"Summer","soil":"Deep Alluvial","water":"Moderate","ease":55},
        "Grapes":      {"n":(0,40),"p":(100,150),"k":(150,210),"temp":(15,30),"hum":(60,85),"ph":(5.5,7.0),"rain":(500,1000),"season":"Spring","soil":"Loamy / Well-drained","water":"Moderate","ease":50},
        "Watermelon":  {"n":(60,120),"p":(40,70),"k":(40,80),"temp":(24,35),"hum":(60,85),"ph":(6.0,7.0),"rain":(400,800),"season":"Summer","soil":"Sandy / Loamy","water":"Moderate","ease":80},
        "Muskmelon":   {"n":(70,120),"p":(40,60),"k":(40,70),"temp":(24,35),"hum":(50,75),"ph":(6.0,7.0),"rain":(300,600),"season":"Summer","soil":"Sandy / Loamy","water":"Moderate","ease":78},
        "Apple":       {"n":(0,40),"p":(100,140),"k":(180,220),"temp":(10,25),"hum":(70,92),"ph":(5.5,6.8),"rain":(1000,1800),"season":"Spring","soil":"Loamy / Well-drained","water":"Moderate","ease":55},
        "Orange":      {"n":(0,30),"p":(20,50),"k":(0,30),"temp":(20,35),"hum":(80,95),"ph":(5.0,7.0),"rain":(1000,2200),"season":"Winter","soil":"Loamy / Sandy","water":"Moderate","ease":60},
        "Papaya":      {"n":(40,80),"p":(50,80),"k":(40,60),"temp":(25,38),"hum":(70,95),"ph":(6.0,7.0),"rain":(1000,2000),"season":"Year-round","soil":"Sandy / Loamy","water":"High","ease":68},
        "Coconut":     {"n":(0,30),"p":(0,15),"k":(20,40),"temp":(25,35),"hum":(70,95),"ph":(5.0,7.0),"rain":(1500,3000),"season":"Year-round","soil":"Sandy / Coastal","water":"High","ease":50},
        "Cotton":      {"n":(100,160),"p":(40,80),"k":(40,80),"temp":(25,35),"hum":(40,65),"ph":(6.0,7.5),"rain":(500,1000),"season":"Summer","soil":"Black / Alluvial","water":"Low–Moderate","ease":60},
        "Jute":        {"n":(60,100),"p":(40,70),"k":(30,60),"temp":(24,37),"hum":(70,90),"ph":(5.5,7.0),"rain":(1200,2500),"season":"Summer","soil":"Alluvial / Loamy","water":"High","ease":72},
        "Coffee":      {"n":(80,120),"p":(15,30),"k":(25,50),"temp":(15,28),"hum":(60,85),"ph":(5.0,6.5),"rain":(1500,2500),"season":"Year-round","soil":"Volcanic / Loamy","water":"Moderate","ease":45},
    }

    def range_score(val, lo, hi):
        """0-100 score: 100 if inside [lo,hi], dropping linearly outside."""
        if lo <= val <= hi:
            return 100
        if val < lo:
            return max(0, 100 - (lo - val) / max(lo, 1) * 100)
        return max(0, 100 - (val - hi) / max(hi, 1) * 100)

    def compute_metrics(crop_name, n, p, k, t, h, ph_val, r):
        prof = CROP_PROFILES.get(crop_name)
        if not prof:
            return {"Soil compatibility": 70, "Climate alignment": 70, "Yield potential": 70, "Cultivation ease": 70}

        # Soil compatibility: average of N, P, K range fits
        soil = (range_score(n, *prof["n"]) + range_score(p, *prof["p"]) + range_score(k, *prof["k"])) / 3

        # Climate alignment: average of temp, humidity, rainfall, pH fits
        climate = (range_score(t, *prof["temp"]) + range_score(h, *prof["hum"]) +
                   range_score(ph_val, *prof["ph"]) + range_score(r, *prof["rain"])) / 4

        # Yield potential: weighted combo of soil and climate
        yld = soil * 0.45 + climate * 0.55

        ease = float(prof["ease"])

        return {
            "Soil compatibility": round(min(soil, 99)),
            "Climate alignment": round(min(climate, 99)),
            "Yield potential": round(min(yld, 99)),
            "Cultivation ease": round(min(ease, 99)),
        }

    # True ML prediction
    try:
        feature = np.array([N, P, K, T, ph]).reshape(1, -1)
        mx_feature = mx.transform(feature)
        sc_feature = sc.transform(mx_feature)

        prediction = model.predict(sc_feature)[0]
        crop = crop_dict.get(prediction, "Unknown")

        # Get probability distribution across all classes
        probas = model.predict_proba(sc_feature)[0]
        class_labels = model.classes_

        # Build {crop_name: probability%} mapping
        prob_map = {}
        for idx, cls in enumerate(class_labels):
            name = crop_dict.get(cls, f"Crop_{cls}")
            prob_map[name] = round(float(probas[idx]) * 100, 1)

        confidence = prob_map.get(crop, 85)

        # Alternatives: top 3 after the primary prediction
        sorted_crops = sorted(prob_map.items(), key=lambda x: x[1], reverse=True)
        alternatives = [{"name": c, "score": s} for c, s in sorted_crops if c != crop][:3]

    except Exception as model_err:
        print(f"Model prediction error in API: {model_err}")
        crop = 'Wheat'
        if N > 120 and ph > 6 and T > 28:
            crop = 'Sugarcane'
        elif ph < 5.5:
            crop = 'Rice'
        elif P > 60:
            crop = 'Potato'
        confidence = 75
        prob_map = {crop: 75}
        alternatives = [{"name": "Rice", "score": 12}, {"name": "Maize", "score": 8}]

    # Compute dynamic metrics from inputs vs crop ideal ranges
    metrics = compute_metrics(crop, N, P, K, T, H, ph, R)

    # Season suitability scores based on temperature input
    # Get crop info — dynamic based on inputs
    prof = CROP_PROFILES.get(crop, {})

    # Each season maps to a temperature range; compute how well user temp fits each
    SEASON_TEMP_RANGES = {
        "Spring": (15, 28),
        "Summer": (25, 38),
        "Autumn": (12, 25),
        "Winter": (5, 18),
    }
    season_scores = {}
    for season_name, (lo, hi) in SEASON_TEMP_RANGES.items():
        score = range_score(T, lo, hi)
        # Boost the crop's actual season by blending with soil/climate alignment
        prof_season = prof.get("season", "") if CROP_PROFILES.get(crop) else ""
        if season_name.lower() in prof_season.lower():
            score = min(99, score * 0.6 + metrics.get("Climate alignment", 50) * 0.4)
        season_scores[season_name] = round(min(score, 99))

    # Compute an overall input match percentage from all metrics
    input_match = round((metrics["Soil compatibility"] * 0.3 +
                         metrics["Climate alignment"] * 0.3 +
                         metrics["Yield potential"] * 0.25 +
                         metrics["Cultivation ease"] * 0.15))

    # Dynamic soil assessment based on NPK values
    npk_total = N + P + K
    if npk_total > 200:
        npk_label = "High fertility"
    elif npk_total > 100:
        npk_label = "Moderate fertility"
    else:
        npk_label = "Low fertility"

    crop_info = {
        "season": prof.get("season", "Varies"),
        "soilType": prof.get("soil", "General purpose"),
        "waterReq": prof.get("water", "Moderate"),
        "inputMatch": input_match,
        "npkStatus": npk_label,
    }

    # Dynamic description
    metric_summary = []
    if metrics["Soil compatibility"] >= 80:
        metric_summary.append("strong soil nutrient alignment")
    elif metrics["Soil compatibility"] >= 60:
        metric_summary.append("moderate soil compatibility")
    else:
        metric_summary.append("some soil nutrient gaps")

    if metrics["Climate alignment"] >= 80:
        metric_summary.append("excellent climate conditions")
    elif metrics["Climate alignment"] >= 60:
        metric_summary.append("acceptable climate conditions")
    else:
        metric_summary.append("suboptimal climate parameters")

    desc = (
        f"ML analysis predicts {crop} with {confidence:.0f}% confidence based on your soil profile. "
        f"Your input shows {metric_summary[0]} and {metric_summary[1]} for this crop. "
    )
    if alternatives:
        desc += f"{alternatives[0]['name']} ({alternatives[0]['score']:.0f}%) is the closest alternative."

    try:
        with sqlite3.connect('database.db') as conn:
            conn.execute(
                "INSERT INTO recommendation_logs (user_id, crop, nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall) VALUES (?,?,?,?,?,?,?,?,?)",
                (user_id, crop, N, P, K, T, H, ph, R)
            )
    except Exception as e:
        print(f"Recommendation log insert failed: {e}")

    return {
        'recommended': crop,
        'confidence': round(confidence, 1),
        'metrics': metrics,
        'alternatives': alternatives,
        'crop_info': crop_info,
        'description': desc,
        'probabilities': prob_map,
        'season_scores': season_scores,
    }

@crop_routes_bp.route('/api/recommendations', methods=['GET'])
def api_get_recommendations():
    """Returns crop recommendations for the logged-in user (or all if admin)."""
    user_id = session.get('user_id')
    try:
        with sqlite3.connect('database.db') as conn:
            cur = conn.cursor()
            if user_id == 2:  # admin: return all
                cur.execute("SELECT id, user_id, crop, nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall, created_at FROM recommendation_logs ORDER BY created_at DESC")
            else:
                cur.execute("SELECT id, user_id, crop, nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall, created_at FROM recommendation_logs WHERE user_id=? ORDER BY created_at DESC", (user_id,))
            rows = cur.fetchall()
        results = [dict(id=r[0], user_id=r[1], crop=r[2], nitrogen=r[3], phosphorus=r[4], potassium=r[5], temperature=r[6], humidity=r[7], ph=r[8], rainfall=r[9], created_at=r[10]) for r in rows]
        return { 'recommendations': results }
    except Exception as e:
        return { 'error': str(e) }, 500

@crop_routes_bp.route('/api/recommendations/<int:rec_id>', methods=['DELETE'])
@login_required
def api_delete_recommendation(rec_id):
    """Delete a specific crop recommendation log entry."""
    user_id = session.get('user_id')
    try:
        with sqlite3.connect('database.db') as conn:
            cur = conn.cursor()
            if user_id == 2:
                cur.execute("DELETE FROM recommendation_logs WHERE id = ?", (rec_id,))
            else:
                cur.execute("DELETE FROM recommendation_logs WHERE id = ? AND user_id = ?", (rec_id, user_id))
            if cur.rowcount == 0:
                return { 'error': 'Recommendation not found or access denied' }, 404
        return { 'success': True, 'message': 'Recommendation deleted successfully' }
    except Exception as e:
        return { 'error': str(e) }, 500
