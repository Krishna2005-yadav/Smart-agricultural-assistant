# === FILENAME: disease_routes.py ===
from flask import Blueprint, request, session
import tensorflow as tf
import numpy as np
import os
from PIL import Image
import io
import json

disease_routes_bp = Blueprint('disease_routes', __name__)

# Global cache for MobileNetV2
mobilenet_model_cache = None

def get_mobilenet_model():
    global mobilenet_model_cache
    if mobilenet_model_cache is None:
        print("Loading MobileNetV2 gatekeeper model...")
        mobilenet_model_cache = tf.keras.applications.MobileNetV2(weights='imagenet')
    return mobilenet_model_cache

# Only block images that are OBVIOUSLY not a plant.
# If MobileNetV2 is 70%+ confident it's one of these → block.
# Everything else (including ambiguous / low-confidence) → let through.
BLOCK_CATEGORIES = [
    # People
    'person', 'face', 'suit', 'lipstick', 'wig', 'jersey',
    # Vehicles
    'car', 'truck', 'bus', 'motorcycle', 'bicycle', 'airplane',
    # Electronics
    'laptop', 'monitor', 'keyboard', 'mouse', 'phone', 'television', 'screen',
    'desktop_computer', 'notebook', 'iPod', 'remote_control',
    # Buildings / urban
    'skyscraper', 'church', 'mosque', 'palace',
]
BLOCK_THRESHOLD = 0.70  # only block at very high confidence

# Load the plant disease model
def load_disease_model():
    try:
        print("Attempting to load disease model...")
        
        
        try:
            model = tf.keras.models.load_model("trained_plant_disease_model.keras")
            print("Successfully loaded .keras model")
            return model
        except:
            print("Failed to load .keras model, trying .h5 version...")
            try:
                model = tf.keras.models.load_model("plant_disease_model.h5")
                print("Successfully loaded .h5 model")
                return model
            except Exception as e:
                print(f"Failed to load .h5 model: {e}")
        
        print("No model files found or all failed to load")
        return None
        
    except Exception as e:
        print(f"Error in load_disease_model: {e}")
        return None

# Class names for plant diseases
DISEASE_CLASSES = [
    'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot',
    'Corn_(maize)___Common_rust_',
    'Corn_(maize)___Northern_Leaf_Blight',
    'Corn_(maize)___healthy',
    'Potato___Early_blight',
    'Potato___Late_blight',
    'Potato___healthy',
    'Raspberry___healthy',
    'Soybean___healthy',
    'Squash___Powdery_mildew',
    'Strawberry___Leaf_scorch',
    'Strawberry___healthy',
    'Tomato___Bacterial_spot',
    'Tomato___Early_blight',
    'Tomato___Late_blight',
    'Tomato___Leaf_Mold',
    'Tomato___Septoria_leaf_spot',
    'Tomato___Spider_mites Two-spotted_spider_mite',
    'Tomato___Target_Spot',
    'Tomato___Tomato_Yellow_Leaf_Curl_Virus',
    'Tomato___Tomato_mosaic_virus',
    'Tomato___healthy'
]

# Detailed disease information
DISEASE_DETAILS = {
    'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot': {
        'plant': 'Corn (Maize)',
        'status': 'Diseased Leaf',
        'name': 'Gray Leaf Spot',
        'symptoms': 'Small, rectangular brown to gray lesions running parallel to veins.',
        'treatment': 'Use resistant hybrids, rotate crops, and apply fungicides if severe.'
    },
    'Corn_(maize)___Common_rust_': {
        'plant': 'Corn (Maize)',
        'status': 'Diseased Leaf',
        'name': 'Common Rust',
        'symptoms': 'Reddish-brown pustules on leaves and stems.',
        'treatment': 'Plant resistant varieties and apply fungicides early if needed.'
    },
    'Corn_(maize)___Northern_Leaf_Blight': {
        'plant': 'Corn (Maize)',
        'status': 'Diseased Leaf',
        'name': 'Northern Leaf Blight',
        'symptoms': 'Long, cigar-shaped grayish-green to tan lesions.',
        'treatment': 'Manage crop residue and apply fungicides during growth.'
    },
    'Corn_(maize)___healthy': {
        'plant': 'Corn (Maize)',
        'status': 'Healthy Leaf',
        'name': 'Healthy',
        'symptoms': 'No disease symptoms observed. Vibrant green leaves.',
        'treatment': 'Continue regular monitoring and good agricultural practices.'
    },
    'Potato___Early_blight': {
        'plant': 'Potato',
        'status': 'Diseased Leaf',
        'name': 'Early Blight',
        'symptoms': 'Dark brown spots with concentric rings (target spots) on older leaves.',
        'treatment': 'Apply fungicides, improve air circulation, and rotate crops.'
    },
    'Potato___Late_blight': {
        'plant': 'Potato',
        'status': 'Diseased Leaf',
        'name': 'Late Blight',
        'symptoms': 'Water-soaked lesions turning brown/black with white fungal growth.',
        'treatment': 'Destroy infected plants and apply fungicides (metalaxyl).'
    },
    'Potato___healthy': {
        'plant': 'Potato',
        'status': 'Healthy Leaf',
        'name': 'Healthy',
        'symptoms': 'No signs of blight or spots. Vigorous foliage.',
        'treatment': 'Maintain regular watering and fertilization.'
    },
    'Raspberry___healthy': {
        'plant': 'Raspberry',
        'status': 'Healthy Leaf',
        'name': 'Healthy',
        'symptoms': 'Vibrant green leaves, no signs of rust or blight.',
        'treatment': 'Prune to improve airflow and monitor for pests.'
    },
    'Soybean___healthy': {
        'plant': 'Soybean',
        'status': 'Healthy Leaf',
        'name': 'Healthy',
        'symptoms': 'Clean green leaves without mottling or spots.',
        'treatment': 'Maintain crop rotation to prevent soil-borne diseases.'
    },
    'Squash___Powdery_mildew': {
        'plant': 'Squash',
        'status': 'Diseased Leaf',
        'name': 'Powdery Mildew',
        'symptoms': 'White powdery spots on surfaces, looks like flour.',
        'treatment': 'Improve air circulation, use sulfur or neem oil sprays.'
    },
    'Strawberry___Leaf_scorch': {
        'plant': 'Strawberry',
        'status': 'Diseased Leaf',
        'name': 'Leaf Scorch',
        'symptoms': 'Irregular purplish-brown blotches that dry up and curl.',
        'treatment': 'Remove debris, increase spacing, and apply fungicides.'
    },
    'Strawberry___healthy': {
        'plant': 'Strawberry',
        'status': 'Healthy Leaf',
        'name': 'Healthy',
        'symptoms': 'Vibrant green foliage, high fruit yield.',
        'treatment': 'Keep fruit off soil and maintain proper spacing.'
    },
    'Tomato___Bacterial_spot': {
        'plant': 'Tomato',
        'status': 'Diseased Leaf',
        'name': 'Bacterial Spot',
        'symptoms': 'Small water-soaked areas turning black or dark brown.',
        'treatment': 'Avoid overhead watering and rotate crops.'
    },
    'Tomato___Early_blight': {
        'plant': 'Tomato',
        'status': 'Diseased Leaf',
        'name': 'Early Blight',
        'symptoms': 'Target-like spots on lower leaves with yellow halos.',
        'treatment': 'Remove lower infected leaves and apply copper fungicides.'
    },
    'Tomato___Late_blight': {
        'plant': 'Tomato',
        'status': 'Diseased Leaf',
        'name': 'Late Blight',
        'symptoms': 'Large, irregular water-soaked patches on leaves and stems.',
        'treatment': 'Destroy infected plants immediately to prevent spread.'
    },
    'Tomato___Leaf_Mold': {
        'plant': 'Tomato',
        'status': 'Diseased Leaf',
        'name': 'Leaf Mold',
        'symptoms': 'Yellow spots on top with grayish mold growth underneath.',
        'treatment': 'Increase ventilation and avoid wetting foliage.'
    },
    'Tomato___Septoria_leaf_spot': {
        'plant': 'Tomato',
        'status': 'Diseased Leaf',
        'name': 'Septoria Leaf Spot',
        'symptoms': 'Circular lesions with dark margins and tan centers.',
        'treatment': 'Remove debris and avoid splashing water on leaves.'
    },
    'Tomato___Spider_mites Two-spotted_spider_mite': {
        'plant': 'Tomato',
        'status': 'Diseased Leaf',
        'name': 'Spider Mites',
        'symptoms': 'Tiny yellow/bronze stippling with fine webbing.',
        'treatment': 'Use insecticidal soap or neem oil targeting leaf undersides.'
    },
    'Tomato___Target_Spot': {
        'plant': 'Tomato',
        'status': 'Diseased Leaf',
        'name': 'Target Spot',
        'symptoms': 'Circular necrotic lesions with concentric target rings.',
        'treatment': 'Improve airflow and use fungicides before symptoms appear.'
    },
    'Tomato___Tomato_Yellow_Leaf_Curl_Virus': {
        'plant': 'Tomato',
        'status': 'Diseased Leaf',
        'name': 'Yellow Leaf Curl Virus',
        'symptoms': 'Severe stunting and upward curling of leaf margins.',
        'treatment': 'Control whiteflies and remove infected plants immediately.'
    },
    'Tomato___Tomato_mosaic_virus': {
        'plant': 'Tomato',
        'status': 'Diseased Leaf',
        'name': 'Mosaic Virus',
        'symptoms': 'Mottling of leaves with light and dark green spots.',
        'treatment': 'Practice strict sanitation; pull and destroy infected plants.'
    },
    'Tomato___healthy': {
        'plant': 'Tomato',
        'status': 'Healthy Leaf',
        'name': 'Healthy',
        'symptoms': 'Vibrant green leaves without spots or mottling.',
        'treatment': 'Continue regular preventative care and monitoring.'
    }
}

@disease_routes_bp.route('/test', methods=['GET'])
def test_endpoint():
    return {'success': True, 'message': 'Flask server is working!'}

@disease_routes_bp.route('/test-model', methods=['GET'])
def test_model_loading():
    try:
        print("Testing model loading...")
        model = load_disease_model()
        if model is not None:
            return {'success': True, 'message': 'Model loaded successfully', 'model_summary': str(model.summary())}
        else:
            return {'success': False, 'message': 'Failed to load model'}
    except Exception as e:
        return {'success': False, 'message': f'Error testing model: {str(e)}'}

@disease_routes_bp.route('/test-upload', methods=['POST'])
def test_image_upload():
    try:
        print("Testing image upload...")
        if 'image' not in request.files:
            return {'success': False, 'error': 'No image file provided'}
        
        file = request.files['image']
        if file.filename == '':
            return {'success': False, 'error': 'No image file selected'}
        
        
        return {
            'success': True,
            'filename': file.filename,
            'content_type': file.content_type,
            'file_size': len(file.read()),
            'message': 'Image upload test successful'
        }
        
    except Exception as e:
        print(f"Image upload test error: {e}")
        return {'success': False, 'error': f'Upload test failed: {str(e)}'}

@disease_routes_bp.route('/predict-disease', methods=['POST'])
def predict_disease():
    try:
        # Check if image file is present
        if 'image' not in request.files:
            return {'success': False, 'error': 'No image file provided'}
        
        file = request.files['image']
        if file.filename == '':
            return {'success': False, 'error': 'No image file selected'}
        
        # Save uploaded file temporarily for both models
        temp_path = f"temp_{file.filename}"
        file.save(temp_path)

        # --- GATEKEEPER: only block obvious non-plant images ---
        print("Running gatekeeper check on image...")
        try:
            mn_model = get_mobilenet_model()
            mn_image = tf.keras.preprocessing.image.load_img(temp_path, target_size=(224, 224))
            mn_arr = tf.keras.preprocessing.image.img_to_array(mn_image)
            mn_arr = np.expand_dims(mn_arr, axis=0)
            mn_arr = tf.keras.applications.mobilenet_v2.preprocess_input(mn_arr)
            
            mn_preds = mn_model.predict(mn_arr, verbose=0)
            decoded_preds = tf.keras.applications.mobilenet_v2.decode_predictions(mn_preds, top=5)[0]
            
            top_classes = [f"{lbl.lower()} ({p:.2f})" for _, lbl, p in decoded_preds]
            print(f"MobileNetV2 Top 5: {', '.join(top_classes)}")
            
            # Simple check: block ONLY if a top prediction is a known non-plant at high confidence
            blocked = False
            for _, label, prob in decoded_preds:
                if prob >= BLOCK_THRESHOLD:
                    label_lower = label.lower()
                    for cat in BLOCK_CATEGORIES:
                        if cat in label_lower:
                            print(f"Gatekeeper blocked: {label_lower} ({prob:.0%})")
                            os.remove(temp_path)
                            blocked = True
                            return {
                                'success': False,
                                'error': 'This image appears to be a non-plant object. Please upload an image of a crop leaf.'
                            }
            
            if not blocked:
                print("Gatekeeper passed: image allowed.")
                
        except Exception as gatekeeper_err:
            print(f"Gatekeeper error (bypassing): {gatekeeper_err}")
            # If gatekeeper fails, fall through to main logic
            
        # --- MAIN DISEASE MODEL ---
        # Load the disease model
        model = load_disease_model()
        if model is None:
            return {'success': False, 'error': 'Disease model not available'}
        
        # Debug: Check model input shape
        print(f"Model input shape: {model.input_shape}")
        print(f"Model output shape: {model.output_shape}")
        
        # ──────────────────────────────────────────────────────────
        # ROBUST PREPROCESSING FOR WEB IMAGES
        # ──────────────────────────────────────────────────────────
        print("Processing image with robust preprocessing pipeline...")
        
        # 1. Open with PIL for full control
        pil_img = Image.open(temp_path).convert("RGB")
        
        # 2. Strip JPEG artifacts by re-encoding at high quality
        buf = io.BytesIO()
        pil_img.save(buf, format="PNG")
        buf.seek(0)
        pil_img = Image.open(buf).convert("RGB")
        
        # 3. Center-crop to square (preserve aspect ratio, avoid stretch distortion)
        w, h = pil_img.size
        short_edge = min(w, h)
        left = (w - short_edge) // 2
        top = (h - short_edge) // 2
        pil_img = pil_img.crop((left, top, left + short_edge, top + short_edge))
        
        # 4. Resize to model input size
        pil_img = pil_img.resize((128, 128), Image.LANCZOS)
        
        # 5. Convert to numpy float32 array, keep 0-255 range (matching training)
        base_arr = np.array(pil_img, dtype=np.float32)
        
        print(f"Image array shape: {base_arr.shape}")
        print(f"Image array dtype: {base_arr.dtype}")
        print(f"Image array min/max: {base_arr.min():.1f}/{base_arr.max():.1f}")
        
        # ──────────────────────────────────────────────────────────
        # TEST-TIME AUGMENTATION (TTA) — average 5 predictions
        # Web images vary in orientation, lighting, etc. — TTA stabilizes output.
        # ──────────────────────────────────────────────────────────
        augmented_batch = [base_arr]  # original
        
        # Horizontal flip
        augmented_batch.append(np.fliplr(base_arr).copy())
        
        # Slight brightness increase (+10%)
        bright_up = np.clip(base_arr * 1.10, 0, 255)
        augmented_batch.append(bright_up)
        
        # Slight brightness decrease (-10%)
        bright_dn = np.clip(base_arr * 0.90, 0, 255)
        augmented_batch.append(bright_dn)
        
        # Vertical flip
        augmented_batch.append(np.flipud(base_arr).copy())
        
        # Stack into a single batch: (5, 128, 128, 3)
        tta_batch = np.stack(augmented_batch, axis=0)
        
        # Clean up temp file
        os.remove(temp_path)
        
        # ──────────────────────────────────────────────────────────
        # PREDICTION — average across TTA
        # ──────────────────────────────────────────────────────────
        print("Making prediction with TTA (5 augmentations)...")
        all_preds = model.predict(tta_batch, verbose=0)  # (5, num_classes)
        predictions = np.mean(all_preds, axis=0, keepdims=True)  # (1, num_classes)
        
        print(f"TTA raw predictions (averaged): {predictions}")
        print(f"Individual TTA confidences: {[f'{np.max(p)*100:.1f}%' for p in all_preds]}")
        
        # Store single-image array for saving later
        input_arr = np.expand_dims(base_arr, axis=0)
        
        # Debug: Check if predictions are all the same
        unique_predictions = np.unique(predictions)
        print(f"Unique prediction values: {unique_predictions}")
        print(f"Are all predictions identical? {len(unique_predictions) == 1}")
        
        predicted_class_index = np.argmax(predictions)
        confidence = float(np.max(predictions) * 100)
        
        # Get predicted class name
        predicted_class = DISEASE_CLASSES[predicted_class_index]
        
        # Confidence threshold — only reject at very low levels
        # The gatekeeper already filters non-plants; this catches truly random noise
        MIN_CONFIDENCE_THRESHOLD = 25.0
        
        # If confidence is below threshold, still return the prediction but flagged
        if confidence < MIN_CONFIDENCE_THRESHOLD:
            print(f"⚠️ Very low confidence: {confidence:.1f}% (threshold: {MIN_CONFIDENCE_THRESHOLD}%)")
            
            top_3_indices = np.argsort(predictions[0])[-3:][::-1]
            print("Top 3 predictions:")
            for i, idx in enumerate(top_3_indices):
                prob = predictions[0][idx] * 100
                print(f"  {i+1}. {DISEASE_CLASSES[idx]}: {prob:.1f}%")
            
            # Still reject only at extremely low confidence
            return {
                'success': False,
                'error': 'Could not identify the plant disease with sufficient confidence. Try a clearer, close-up image of the leaf.'
            }
        
        # Additional validation for potato diseases (common confusion)
        if 'Potato' in predicted_class:
            potato_early_idx = 4  # Potato___Early_blight
            potato_late_idx = 5   # Potato___Late_blight
            
            early_prob = predictions[0][potato_early_idx] * 100
            late_prob = predictions[0][potato_late_idx] * 100
            
            print(f"Potato disease analysis:")
            print(f"  Early blight: {early_prob:.1f}%")
            print(f"  Late blight: {late_prob:.1f}%")
            print(f"  Difference: {abs(early_prob - late_prob):.1f}%")
            
            # If the difference is small, flag as uncertain
            if abs(early_prob - late_prob) < 15.0:
                print(f"⚠️ Uncertain potato disease classification - small difference between early/late blight")
        
        # Debug: Print all prediction probabilities
        print(f"All prediction probabilities: {[float(p) for p in predictions[0]]}")
        print(f"Predicted class index: {int(predicted_class_index)}")
        print(f"Predicted class: {predicted_class}")
        print(f"Confidence: {float(confidence):.2f}%")
        
        # Debug: Check if this is always the same prediction
        print(f"Model file being used: {'trained_plant_disease_model.keras' if os.path.exists('trained_plant_disease_model.keras') else 'plant_disease_model.h5'}")
        
        # Get all class probabilities for debugging
        all_probabilities = {}
        for i, prob in enumerate(predictions[0]):
            all_probabilities[DISEASE_CLASSES[i]] = float(prob * 100)
        

        
        # Save the uploaded image (optional)
        upload_folder = 'static/uploads'
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder)
        
        # Generate unique filename
        import uuid
        filename = f"crop_{uuid.uuid4().hex[:8]}.jpg"
        filepath = os.path.join(upload_folder, filename)
        
        # Convert TensorFlow image to PIL for saving
        pil_image = tf.keras.preprocessing.image.array_to_img(input_arr[0])
        pil_image.save(filepath)
        
        return {
            'success': True,
            'prediction': predicted_class,
            'confidence': float(confidence),  
            'image_path': f'/static/uploads/{filename}',
            'all_probabilities': all_probabilities,
            'disease_details': DISEASE_DETAILS.get(predicted_class, {
                'plant': 'Unknown',
                'status': 'Unknown',
                'name': predicted_class.replace('_', ' '),
                'symptoms': 'No specific info available.',
                'treatment': 'Consult an expert.'
            }),
            'confidence_level': 'high' if confidence >= 80 else 'medium' if confidence >= 60 else 'low',
            'debug_info': {
                'predicted_index': int(predicted_class_index), 
                'all_predictions': [float(p) for p in predictions[0].tolist()]
            }
        }
        
    except Exception as e:
        print(f"Disease prediction error: {e}")
        return {'success': False, 'error': f'Prediction failed: {str(e)}'}

@disease_routes_bp.route('/test-model-prediction', methods=['GET'])
def test_model_prediction():
    try:
        print("Testing model prediction with random input...")
        model = load_disease_model()
        if model is None:
            return {'success': False, 'message': 'Failed to load model'}
        
        # Test with random input
        test_input = np.random.random((1, 128, 128, 3))
        print(f"Test input shape: {test_input.shape}")
        print(f"Test input range: {test_input.min():.3f} to {test_input.max():.3f}")
        
        predictions = model.predict(test_input)
        print(f"Test predictions shape: {predictions.shape}")
        print(f"Test predictions: {predictions}")
        
        # Check if predictions vary
        unique_predictions = np.unique(predictions)
        print(f"Unique test prediction values: {unique_predictions}")
        print(f"Are test predictions identical? {len(unique_predictions) == 1}")
        
        predicted_class_index = np.argmax(predictions)
        confidence = float(np.max(predictions) * 100)
        predicted_class = DISEASE_CLASSES[predicted_class_index]
        
        return {
            'success': True,
            'message': 'Model prediction test completed',
            'test_predictions': predictions.tolist(),
            'predicted_class': predicted_class,
            'confidence': confidence,
            'unique_predictions': unique_predictions.tolist(),
            'predictions_vary': len(unique_predictions) > 1
        }
        
    except Exception as e:
        print(f"Model prediction test error: {e}")
        return {'success': False, 'error': f'Test failed: {str(e)}'}

@disease_routes_bp.route('/api/detections', methods=['POST'])
def api_post_detection():
    """Accepts JSON: { plant_name, disease, confidence, image_url }
    Stores the detection for the logged-in user (if any) or user_id NULL.
    """
    data = request.get_json() or {}
    plant = data.get('plant_name')
    disease = data.get('disease')
    confidence = float(data.get('confidence') or 0)
    image_url = data.get('image_url')
    # Store all_probabilities as a JSON string
    import json
    all_probabilities = json.dumps(data.get('all_probabilities') or {})
    user_id = session.get('user_id')

    if not plant or disease is None:
        return { 'error': 'Missing fields' }, 400

    try:
        import sqlite3
        with sqlite3.connect('database.db') as conn:
            cur = conn.cursor()
            cur.execute(
                "INSERT INTO detection_logs (user_id, plant_name, disease, confidence, image_url, all_probabilities) VALUES (?,?,?,?,?,?)",
                (user_id, plant, disease, confidence, image_url, all_probabilities)
            )
            detection_id = cur.lastrowid
        return { 'success': True, 'detection_id': detection_id }
    except Exception as e:
        return { 'error': str(e) }, 500

@disease_routes_bp.route('/api/detections', methods=['GET'])
def api_get_detections():
    """Returns detections for the logged-in user (or all if admin)."""
    user_id = session.get('user_id')
    try:
        import sqlite3
        with sqlite3.connect('database.db') as conn:
            cur = conn.cursor()
            if user_id == 2:  # admin: return all
                cur.execute("SELECT id, user_id, plant_name, disease, confidence, image_url, created_at, all_probabilities FROM detection_logs ORDER BY created_at DESC")
            else:
                cur.execute("SELECT id, user_id, plant_name, disease, confidence, image_url, created_at, all_probabilities FROM detection_logs WHERE user_id=? ORDER BY created_at DESC", (user_id,))
            rows = cur.fetchall()
        
        results = []
        import json
        for r in rows:
            probs = {}
            try:
                probs = json.loads(r[7] or '{}')
            except:
                pass
            disease_key = (r[3] or "").strip()
            results.append(dict(
                id=r[0], 
                user_id=r[1], 
                plant_name=r[2], 
                disease=r[3], 
                confidence=r[4], 
                image_url=r[5], 
                created_at=r[6],
                all_probabilities=probs,
                disease_details=DISEASE_DETAILS.get(disease_key, {
                    'plant': r[2] or 'Plant',
                    'status': 'Unknown',
                    'name': disease_key.replace('___', ': ').replace('_', ' ') or 'Unknown Disease',
                    'symptoms': 'No specific info available for this historical record.',
                    'treatment': 'Maintain general crop health and monitor for changes.'
                })
            ))
        return { 'detections': results }
    except Exception as e:
        return { 'error': str(e) }, 500


@disease_routes_bp.route('/api/detections/<int:detection_id>', methods=['DELETE'])
def api_delete_detection(detection_id):
    """Delete a specific detection log entry."""
    user_id = session.get('user_id')
    
    if not user_id:
        return { 'error': 'Authentication required' }, 401
    
    try:
        import sqlite3
        with sqlite3.connect('database.db') as conn:
            cur = conn.cursor()
            
            # Check if the detection exists and belongs to the user (or user is admin)
            if user_id == 2:  # admin can delete any detection
                cur.execute("SELECT id, image_url FROM detection_logs WHERE id = ?", (detection_id,))
            else:
                cur.execute("SELECT id, image_url FROM detection_logs WHERE id = ? AND user_id = ?", (detection_id, user_id))
            
            detection = cur.fetchone()
            
            if not detection:
                return { 'error': 'Detection not found or access denied' }, 404
            
            # Delete the associated image file if it exists
            if detection[1]:  # image_url exists
                import os
                image_path = os.path.join('static', detection[1].lstrip('/static/'))
                if os.path.exists(image_path):
                    try:
                        os.remove(image_path)
                        print(f"Deleted image file: {image_path}")
                    except Exception as e:
                        print(f"Warning: Could not delete image file {image_path}: {e}")
            
            # Delete the detection log entry
            cur.execute("DELETE FROM detection_logs WHERE id = ?", (detection_id,))
            
        return { 'success': True, 'message': 'Detection deleted successfully' }
    except Exception as e:
        return { 'error': str(e) }, 500
