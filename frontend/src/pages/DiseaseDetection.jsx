import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import './DiseaseDetection.css';

const EMPTY_PREDS = Array(5).fill(0).map((_, i) => ({ label: `Prediction ${i+1}`, pct: 0, hi: false }));

export default function DiseaseDetection() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const loadFile = useCallback((f) => {
    if (!f || !f.type.startsWith("image/")) return;
    setFile(f); 
    setResult(null);
    const r = new FileReader();
    r.onload = e => setPreview(e.target.result);
    r.readAsDataURL(f);
  }, []);

  const onDrop = e => {
    e.preventDefault(); 
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      loadFile(e.dataTransfer.files[0]);
    }
  };

  const analyze = async () => {
    if (!file) return;
    setLoading(true);
    try {
        const formData = new FormData();
        formData.append('image', file);
        const { data } = await api.post('/predict-disease', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (data.success) {
            setResult(data);
            // Save detection history
            try {
                await api.post('/api/detections', {
                    plant_name: data.disease_details?.plant || 'Unknown',
                    disease: data.prediction,
                    confidence: data.confidence,
                    image_url: data.image_path,
                    all_probabilities: data.all_probabilities,
                });
            } catch { /* ignore save error */ }
        } else {
            setResult({ error: data.error || 'Analysis failed' });
        }
    } catch (err) {
        setResult({ error: err.response?.data?.error || 'Analysis failed due to server error' });
    } finally {
        setLoading(false);
    }
  };

  const clear = () => { 
    setFile(null); 
    setPreview(null); 
    setResult(null); 
    setLoading(false); 
  };

  // Process the result for the UI
  const hasResult = !!result && !result.error && !loading;
  const isError = !!result?.error;
  
  // Format predictions array for display
  let preds = EMPTY_PREDS;
  if (hasResult && result.all_probabilities) {
      preds = Object.entries(result.all_probabilities)
        .map(([key, val]) => ({
            label: key.replace(/___/g, ' - ').replace(/_/g, ' '),
            pct: val,
            hi: val === Math.max(...Object.values(result.all_probabilities))
        }))
        .sort((a, b) => b.pct - a.pct)
        .slice(0, 5); // Show top 5
  }

  return (
    <div className="disease-shell">
        {/* ══ LEFT ══ */}
        <div className="left">

          {/* brand (Removed because Navbar has it, but keeping structure for layout) */}
          <div className="brand" style={{ opacity: 0, pointerEvents: 'none' }}>
            <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
              <path d="M14 4C8 4 4 10 4 16c0 4 3 7 7 8" stroke="#3d6128" strokeWidth="1.6" strokeLinecap="round"/>
              <path d="M14 4c6 0 10 6 10 12 0 4-3 7-7 8" stroke="#3d6128" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
            <span className="brand-name">AgriNova</span>
          </div>

          {/* top row: heading left, drop zone right */}
          <div className="top-row">
            <div className="heading-block">
              <h1 className="page-title">
                Crop<br /><em>Disease</em><br />Analysis
              </h1>
              <p className="page-desc">
                Upload a leaf or stem image for AI-powered disease detection.
              </p>
              <div className="actions">
                <button className="btn-analyze" onClick={analyze} disabled={!preview || loading}>
                  {loading ? <div className="spinner" /> : (
                    <>
                      <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width: 16, height: 16}}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                      </svg>
                      Analyze Crop
                    </>
                  )}
                </button>
                {preview && (
                  <button className="btn-clear" onClick={() => { setPreview(null); setResult(null); setFile(null); }}>
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* compact square drop zone */}
            <div
              className={`drop-zone${dragging ? " drag" : ""}${preview ? " filled" : ""}`}
              onClick={() => !preview && inputRef.current.click()}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
            >
              {preview ? (
                <>
                  <img className="preview-img" src={preview} alt="crop" />
                  <div className="change-overlay" onClick={() => inputRef.current.click()}>
                    <span>Change</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="dz-icon">
                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                  </div>
                  <span className="dz-label">Drop image here</span>
                  <span className="dz-sub">or click to browse</span>
                </>
              )}
            </div>
          </div>

          <div className="results-label" style={{ marginTop: '14px', marginBottom: '14px' }}>Analysis Results</div>

          {isError && (
            <div className={`r-card animate`} style={{ background: 'rgba(181, 86, 78, 0.05)', borderColor: 'rgba(181, 86, 78, 0.2)', borderWidth: '1px', borderStyle: 'solid', marginBottom: '14px' }}>
                <p style={{ color: '#b5564e', fontSize: '14px', textAlign: 'center', margin: 0 }}>
                    {result.error}
                </p>
            </div>
          )}

          {/* ── HERO ── */}
          <div className={`r-card${hasResult ? " animate" : ""}`}>
            <div className="hero-row">
              <div className={`big-pct${hasResult ? "" : " empty"}`}>
                {hasResult ? <>{result.confidence?.toFixed(0)}<sup>%</sup></> : <>—<sup>%</sup></>}
              </div>
              <div className="hero-meta">
                <div className={`hero-disease${hasResult ? "" : " empty"}`}>
                  {hasResult ? (result.disease_details?.name || result.prediction) : "No disease detected"}
                </div>
                <div className={`hero-crop${hasResult ? "" : " empty"}`}>
                  {hasResult ? `${result.disease_details?.plant || 'Plant'} — ${result.disease_details?.status || 'Status Unknown'}` : "Upload an image to begin"}
                </div>
                <div className={`status-badge${hasResult ? "" : " hidden"}`}>
                  <span className="badge-dot" />
                  {hasResult ? `${result.confidence_level} confidence` : "high confidence"}
                </div>
              </div>
            </div>
            <div className="hero-bar-wrap">
              <div className="hero-bar" style={{ width: hasResult ? `${result.confidence}%` : "0%" }} />
            </div>
          </div>
          
          {/* Reserved space for future content */}
          <div style={{ flex: 1 }}></div>

        </div>

        {/* ══ RIGHT ══ */}
        <div className="right" data-lenis-prevent="true">

          {/* ── PREDICTIONS — always visible ── */}
          <div className={`r-card${hasResult ? " animate" : ""}`} style={hasResult ? { animationDelay:"0.07s" } : {}}>
            <div className="card-title">Top Predictions</div>
            <div className="pred-list">
              {preds.map(p => (
                <div key={p.label} className="pred-item">
                  <div className="pred-row-top">
                    <span className={`pred-name${p.hi ? " hi" : ""}`}>{p.label}</span>
                    <span className={`pred-val${p.hi ? " hi" : ""}`}>{p.pct.toFixed(1)}%</span>
                  </div>
                  <div className="pred-track">
                    <div
                      className={`pred-fill${p.hi ? " hi" : ""}`}
                      style={{ width: p.pct === 0 ? "0%" : `${p.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── INFO GRID — always visible, fades in content ── */}
          <div className="info-grid">
            <div className="info-card">
              <div className="info-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="#c4685a" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                </svg>
              </div>
              <div className="info-label">Symptoms</div>
              <div className={`info-body${hasResult ? "" : " empty"}`}>
                {hasResult ? result.disease_details?.symptoms : "—"}
              </div>
            </div>
            <div className="info-card">
              <div className="info-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="#3d6128" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div className="info-label">Treatment</div>
              <div className={`info-body${hasResult ? "" : " empty"}`}>
                {hasResult ? result.disease_details?.treatment : "—"}
              </div>
            </div>
          </div>

        </div>

        <input ref={inputRef} type="file" accept="image/*"
          onChange={e => {
              if(e.target.files && e.target.files[0]) {
                  loadFile(e.target.files[0]);
              }
          }} 
          hidden />
      </div>
  );
}
