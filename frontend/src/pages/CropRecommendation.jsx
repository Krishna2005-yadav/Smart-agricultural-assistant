import { useState, useEffect } from "react";
import { Sprout, Sun, Leaf, Snowflake } from "lucide-react";
import api from '../api/axios';
import './CropRecommendation.css';

// ─── DATA ────────────────────────────────────────────────────────────────────
const PRESETS = {
  Alluvial:    { n: 82,  p: 45, k: 42, temp: 26, humidity: 68, rainfall: 1100, ph: 7.0 },
  Black:       { n: 73,  p: 36, k: 51, temp: 28, humidity: 55, rainfall: 800,  ph: 7.5 },
  "Red/Laterite": { n: 37, p: 20, k: 28, temp: 30, humidity: 50, rainfall: 900, ph: 6.2 },
  Sandy:       { n: 25,  p: 15, k: 20, temp: 32, humidity: 40, rainfall: 600,  ph: 6.5 },
  Loamy:       { n: 90,  p: 55, k: 60, temp: 24, humidity: 65, rainfall: 1200, ph: 6.8 },
  Clay:        { n: 60,  p: 40, k: 80, temp: 22, humidity: 72, rainfall: 1400, ph: 7.2 },
  Peaty:       { n: 120, p: 30, k: 25, temp: 18, humidity: 85, rainfall: 1800, ph: 4.5 },
  Silt:        { n: 75,  p: 48, k: 55, temp: 23, humidity: 60, rainfall: 1000, ph: 6.9 },
};

const SEASONS = ["Spring", "Summer", "Autumn", "Winter"];
const SEASON_ICONS = { 
  Spring: <Sprout size={15} strokeWidth={2.5} />, 
  Summer: <Sun size={15} strokeWidth={2.5} />, 
  Autumn: <Leaf size={15} strokeWidth={2.5} />, 
  Winter: <Snowflake size={15} strokeWidth={2.5} /> 
};

// ─── COMPONENTS ──────────────────────────────────────────────────────────────
function MetricBar({ label, value, animate }) {
  return (
    <div className="ci-metric">
      <span className="ci-metric-name">{label}</span>
      <div className="ci-metric-track">
        <div className="ci-metric-fill" style={{ width: animate ? `${value}%` : "0%" }} />
      </div>
      <span className="ci-metric-pct">{value}%</span>
    </div>
  );
}



// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function CropRecommendation() {
  const [fields, setFields] = useState({ n: "", p: "", k: "", temp: "", humidity: "", rainfall: "" });
  const [ph, setPh] = useState(6.5);
  const [activePreset, setActivePreset] = useState(null);
  const [activeSeason, setActiveSeason] = useState("Summer");
  const [activeNav, setActiveNav] = useState("Analysis");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadBar, setLoadBar] = useState(0);
  const [animateMetrics, setAnimateMetrics] = useState(false);
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (result) {
      setAnimateMetrics(false);
      const t = setTimeout(() => setAnimateMetrics(true), 80);
      return () => clearTimeout(t);
    }
  }, [result]);

  const filledCount = Object.values(fields).filter(v => v !== "").length + 1; // +1 for pH

  function applyPreset(name) {
    const d = PRESETS[name];
    setFields({ n: d.n, p: d.p, k: d.k, temp: d.temp, humidity: d.humidity, rainfall: d.rainfall });
    setPh(d.ph);
    setActivePreset(name);
  }

  function setField(key, val) {
    setFields(f => ({ ...f, [key]: val }));
    setActivePreset(null);
  }

  async function runAnalysis() {
    // Validate that at least the core fields are filled
    const requiredKeys = ["n", "p", "k", "temp"];
    const missing = requiredKeys.filter(k => !fields[k] || fields[k] === "");
    if (missing.length > 0) {
      alert("Please fill in at least Nitrogen, Phosphorus, Potassium, and Temperature before running the analysis.");
      return;
    }

    setLoading(true);
    setLoadBar(25);
    
    try {
        const { data } = await api.post('/api/recommendation', {
            nitrogen: parseFloat(fields.n) || 0,
            phosphorus: parseFloat(fields.p) || 0,
            potassium: parseFloat(fields.k) || 0,
            temperature: parseFloat(fields.temp) || 0,
            humidity: parseFloat(fields.humidity) || 0,
            ph: ph,
            rainfall: parseFloat(fields.rainfall) || 0,
        });

        setLoadBar(75);

        // Use the rich response directly from the backend
        const crop = {
            name: data.recommended,
            conf: Math.round(data.confidence),
            desc: data.description,
            metrics: data.metrics,
            alts: data.alternatives || [],
            season: data.crop_info?.season || "Varies",
            soilType: data.crop_info?.soilType || "General",
            waterReq: data.crop_info?.waterReq || "Moderate",
            seasonScores: data.season_scores || {},
            inputMatch: data.crop_info?.inputMatch || 0,
            npkStatus: data.crop_info?.npkStatus || "---",
        };

        const now = new Date();
        setResult({ ...crop, timestamp: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) });
        // Auto-select the season with the highest suitability score
        if (crop.seasonScores && Object.keys(crop.seasonScores).length > 0) {
            const bestSeason = Object.entries(crop.seasonScores).sort((a, b) => b[1] - a[1])[0][0];
            setActiveSeason(bestSeason);
        } else if (crop.season && SEASONS.includes(crop.season)) {
            setActiveSeason(crop.season);
        }

        setLoadBar(100);
        setTimeout(() => setAnimateMetrics(true), 50);
    } catch (err) {
        console.error(err);
        setLoadBar(100);
        const errorMsg = err.response?.data?.error || "Failed to run analysis. Please check your model connection.";
        alert(errorMsg);
    } finally {
        setTimeout(() => { setLoadBar(0); setLoading(false); }, 300);
    }
  }

  const FIELD_DEFS = [
    { key: "n",        label: "Nitrogen",    unit: "kg/ha" },
    { key: "p",        label: "Phosphorus",  unit: "kg/ha" },
    { key: "k",        label: "Potassium",   unit: "kg/ha" },
    { key: "temp",     label: "Temperature", unit: "°C"    },
    { key: "humidity", label: "Humidity",    unit: "%"     },
    { key: "rainfall", label: "Rainfall",    unit: "mm/yr" },
  ];

  const emptyResult = {
    name: "---",
    desc: "Awaiting data input. Fill in your soil profile and run the AI prediction to see soil analysis, climate alignment, and optimal crop recommendations.",
    conf: 0,
    timestamp: "---",
    metrics: { "Soil compatibility": 0, "Climate alignment": 0, "Yield potential": 0, "Cultivation ease": 0 },
    alts: [ { name: "---", score: 0 }, { name: "---", score: 0 } ],
    soilType: "---",
    season: "---",
    waterReq: "---",
    seasonScores: { Spring: 0, Summer: 0, Autumn: 0, Winter: 0 },
    inputMatch: 0,
    npkStatus: "---",
  };

  const activeResult = result || emptyResult;

  return (
      <div className="ci-root">
          <div className="ci-load-bar" style={{ width: `${loadBar}%` }} />


          <div className="ci-layout">
              <aside className="ci-sidebar">
                  <div className="ci-sidebar-head">
                      <div className="ci-eyebrow">Soil Profile Input</div>
                      <h1 className="ci-sidebar-title">Enter your<br /><em>field data.</em></h1>
                  </div>

                  <div className="ci-section">
                      <div className="ci-section-label">Quick presets</div>
                      <div className="ci-preset-grid">
                          {Object.keys(PRESETS).map(name => (
                              <button key={name} className={`ci-chip${activePreset === name ? " active" : ""}`} onClick={() => applyPreset(name)}>{name}</button>
                          ))}
                      </div>
                  </div>

                  <div className="ci-fields">
                      {FIELD_DEFS.map(({ key, label, unit }) => (
                          <div key={key} className="ci-field">
                              <div className="ci-field-label">{label} <span className="ci-field-unit">{unit}</span></div>
                              <input
                                  className="ci-input" type="number" placeholder="—"
                                  value={fields[key]}
                                  onChange={e => setField(key, e.target.value)}
                              />
                          </div>
                      ))}

                      <div className="ci-field full">
                          <div className="ci-field-label">pH Level <span className="ci-field-unit">{ph.toFixed(1)}</span></div>
                          <div className="ci-ph-val">{ph.toFixed(1)}</div>
                          <div className="ci-ph-bar-wrap">
                              <div className="ci-ph-bar" />
                              <div className="ci-ph-thumb" style={{ left: `${(ph / 14) * 100}%` }} />
                              <input
                                  type="range" className="ci-ph-range"
                                  min="0" max="14" step="0.1" value={ph}
                                  onChange={e => setPh(parseFloat(e.target.value))}
                              />
                          </div>
                          <div className="ci-ph-labels"><span>0 · Acidic</span><span>7 · Neutral</span><span>14 · Alkaline</span></div>
                      </div>
                  </div>

                  <div className="ci-submit">
                      <button className="ci-btn" onClick={runAnalysis} disabled={loading}>
                          <span>{loading ? "Running analysis…" : "Run AI Prediction"}</span>
                          <span className="ci-btn-arrow">→</span>
                      </button>
                  </div>
              </aside>

              <main className="ci-main">
                  <div className={`ci-hero ${result ? "filled" : "empty"}`}>
                      <div className="ci-result-reveal" style={{ opacity: loading ? 0.5 : 1, transition: 'opacity 0.3s' }}>
                          <div className="ci-result-label">ML Recommended crop</div>
                          <div className="ci-result-name"><em>{activeResult.name}</em></div>
                          <div className="ci-result-meta">
                              <span className="ci-conf-badge">{activeResult.conf}% certainty</span>
                              <span className="ci-timestamp">Analyzed at {activeResult.timestamp}</span>
                              {result && <button className="ci-reset-btn" onClick={() => setResult(null)}>Analyze Again</button>}
                          </div>
                          <div className="ci-hero-stats">
                              <span className="ci-hero-stat">Soil <span>{activeResult.soilType}</span></span>
                              <span className="ci-hero-stat">Season <span>{activeResult.season}</span></span>
                              <span className="ci-hero-stat">Water req. <span>{activeResult.waterReq}</span></span>
                          </div>
                      </div>
                  </div>

                  <div className="ci-body" style={{ opacity: loading ? 0.5 : 1, transition: 'opacity 0.3s' }}>
                      <div className="ci-body-main">
                          <p className="ci-desc">{activeResult.desc}</p>
                          <div className="ci-metrics-label">Performance indicators</div>
                          {Object.entries(activeResult.metrics).map(([label, val]) => (
                              <MetricBar key={label} label={label} value={val} animate={animateMetrics} />
                          ))}

                          <div style={{ marginTop: "2.5rem" }}>
                              <div className="ci-metrics-label">Alternative crops</div>
                              <div className="ci-alt-list">
                                  {activeResult.alts.map((a, i) => (
                                      <div key={i} className="ci-alt">
                                          <span>{a.name}</span>
                                          <span className="ci-alt-score">{a.score}%</span>
                                      </div>
                                  ))}
                              </div>
                          </div>

                          <div style={{ marginTop: "1.5rem" }}>
                              <div className="ci-metrics-label">Crop details</div>
                              <div className="ci-crop-info">
                                  <div className="ci-crop-info-row"><span className="ci-info-key">Soil type</span><span className="ci-info-val">{activeResult.soilType}</span></div>
                                  <div className="ci-crop-info-row"><span className="ci-info-key">Best season</span><span className="ci-info-val">{activeResult.season}</span></div>
                                  <div className="ci-crop-info-row"><span className="ci-info-key">Water req.</span><span className="ci-info-val">{activeResult.waterReq}</span></div>
                                  <div className="ci-crop-info-row"><span className="ci-info-key">Input match</span><span className="ci-info-val" style={{color: activeResult.inputMatch >= 70 ? 'var(--green-sat)' : activeResult.inputMatch >= 40 ? 'var(--amber)' : 'var(--ink-3)'}}>{result ? `${activeResult.inputMatch}%` : "---"}</span></div>
                                  <div className="ci-crop-info-row"><span className="ci-info-key">NPK status</span><span className="ci-info-val">{activeResult.npkStatus}</span></div>
                                  <div className="ci-crop-info-row"><span className="ci-info-key">Model</span><span className="ci-info-val" style={{color:"var(--green-sat)"}}>{result ? "RandomForest" : "---"}</span></div>
                              </div>
                          </div>

                          <div style={{ marginTop: "1.5rem", paddingBottom: "1.5rem" }}>
                              <div className="ci-metrics-label">Season suitability</div>
                              <div className="ci-seasons">
                                  {SEASONS.map(s => {
                                      const score = activeResult.seasonScores?.[s] || 0;
                                      return (
                                          <button key={s} className={`ci-season${activeSeason === s ? " active" : ""}`} onClick={() => setActiveSeason(s)} disabled={!result} style={{ opacity: !result ? 0.6 : 1 }}>
                                              <span className="ci-season-left"><span>{SEASON_ICONS[s]}</span><span>{s}</span></span>
                                              <span className="ci-season-check">{result ? `${score}%` : "✓"}</span>
                                          </button>
                                      );
                                  })}
                              </div>
                          </div>
                      </div>
                  </div>

                  <div className="ci-tips">
                      {[
                          ["01", "Sample NPK from at least 5 field locations and average the readings before entering values."],
                          ["02", "Temperature should reflect the average over the growing season, not peak or minimum values."],
                          ["03", "Use a calibrated pH meter — home test kits can read up to 0.8 units off, which affects recommendations."],
                      ].map(([num, text]) => (
                          <div key={num} className="ci-tip">
                              <span className="ci-tip-num">{num}</span>
                              <span className="ci-tip-text">{text}</span>
                          </div>
                      ))}
                  </div>
              </main>
          </div>

          <div className="ci-statusbar">
              <span>CropIntel — ML Analysis Endpoint v3.1</span>
              <div className="ci-statusbar-right hide-mobile">
                  <span>Fields: {filledCount}/7</span>
                  <span>Engine: Python FastAPI</span>
                  <span>{time}</span>
              </div>
          </div>
      </div>
  );
}
