import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, ChevronLeft, Sprout, Sun, Droplets, Thermometer, Beaker, Leaf, Shield, TrendingUp, Lightbulb, AlertTriangle, Calendar } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getAllCrops } from '../data/crops';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import './CropDetail.css';

// ── localStorage helpers ──
const FAV_KEY = 'agri_favorites';
function getFavorites() { try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; } catch { return []; } }
function setFavorites(arr) { localStorage.setItem(FAV_KEY, JSON.stringify(arr)); }

// ── NutrientBar component ──
function NutrientBar({ label, symbol, level, color }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const pct = level === 'High' ? 85 : level === 'Medium' ? 55 : 30;
  
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { 
        if (e.isIntersecting) { setVisible(true); obs.disconnect(); } 
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="cd-nutrient-bar" ref={ref}>
      <span className="cd-nutrient-label">{label} <span className="cd-nutrient-symbol">({symbol})</span></span>
      <div className="cd-nutrient-track">
        <div className="cd-nutrient-fill" style={{ width: visible ? `${pct}%` : '0%', background: color }} />
      </div>
      <span className="cd-nutrient-level" style={{ color }}>{level}</span>
    </div>
  );
}

// ── Custom Recharts tooltip ──
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="cd-chart-tooltip">
      <p className="cd-tooltip-label">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
}

export default function CropDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [crop, setCrop] = useState(null);
    const [favorites, setFavState] = useState(getFavorites());
    const allCrops = getAllCrops();

    useEffect(() => {
        const found = allCrops.find(c => c.id === id);
        if (found) setCrop(found);
        window.scrollTo(0, 0);
    }, [id, allCrops]);

    const toggleFav = useCallback((e) => {
        if (!crop) return;
        const next = favorites.includes(crop.id) ? favorites.filter(f => f !== crop.id) : [...favorites, crop.id];
        setFavState(next);
        setFavorites(next);
    }, [crop, favorites]);

    if (!crop) return <div className="cd-loading">Loading...</div>;

    return (
        <div className="cd-page-root">
            <Navbar />
            
            {/* FULL WIDTH HERO (Parallax via GSAP + Framer Motion) */}
            <HeroSection
                image={crop.image}
                title={crop.name}
                subtitle={crop.tagline}
                eyebrow="Plant Intelligence"
                height="100vh"
            >
                <button className="cd-hero-back" onClick={() => navigate('/crops')}>
                    <ChevronLeft size={16} /> Back to Library
                </button>
                <span className="cd-badge">{crop.season} Crop</span>
                <button className={`cd-fav-btn ${favorites.includes(crop.id) ? 'active' : ''}`} onClick={toggleFav}>
                    <Heart size={20} fill={favorites.includes(crop.id) ? 'currentColor' : 'none'} />
                </button>
            </HeroSection>

            {/* MAIN CONTENT */}
            <div className="cd-main container--narrow">
                
                {/* Overview */}
                <div className="cd-overview">
                    <div className="cd-desc-col">
                        <p className="cd-desc">{crop.description}</p>
                        <div className="cd-field"><span className="cd-label">Origin</span><span>{crop.origin}</span></div>
                        <div className="cd-field cd-uses">
                            <span className="cd-label">Primary Uses</span>
                            <div className="cd-tags">
                                {crop.uses.map(u => <span key={u} className="cd-tag">{u}</span>)}
                            </div>
                        </div>
                    </div>
                    <div className="cd-stats-col">
                        <div className="cd-stat-row"><Thermometer size={16} /><span className="cd-stat-label">Temperature</span><span className="cd-stat-val">{crop.tempRange}</span></div>
                        <div className="cd-stat-row"><Droplets size={16} /><span className="cd-stat-label">Rainfall</span><span className="cd-stat-val">{crop.rainfall}</span></div>
                        <div className="cd-stat-row"><Beaker size={16} /><span className="cd-stat-label">pH Range</span><span className="cd-stat-val">{crop.phRange}</span></div>
                        <div className="cd-stat-row"><Leaf size={16} /><span className="cd-stat-label">Soil Type</span><span className="cd-stat-val">{crop.soil}</span></div>
                        <div className="cd-stat-row"><Sun size={16} /><span className="cd-stat-label">Climate</span><span className="cd-stat-val">{crop.climate}</span></div>
                    </div>
                </div>

                {/* Nutrient Requirements */}
                <section className="cd-section">
                    <h3 className="cd-section-title">Soil & Nutrient Needs</h3>
                    <NutrientBar label="Nitrogen" symbol="N" level={crop.nutrients.n} color="var(--color-forest)" />
                    <NutrientBar label="Phosphorus" symbol="P" level={crop.nutrients.p} color="var(--color-amber)" />
                    <NutrientBar label="Potassium" symbol="K" level={crop.nutrients.k} color="var(--color-water)" />
                </section>

                {/* Disease Intelligence */}
                <section className="cd-section">
                    <h3 className="cd-section-title">Disease Intelligence</h3>
                    <div className="cd-disease-grid">
                        {crop.diseases.map(d => (
                            <div key={d.name} className="cd-disease-card">
                                <div className="cd-disease-header">
                                    <span className="cd-disease-name">{d.name}</span>
                                    <span className={`cd-risk-badge cd-risk-${d.risk.toLowerCase()}`}>{d.risk}</span>
                                </div>
                                <p className="cd-disease-alert">{d.symptoms}</p>
                                <p className="cd-disease-prev"><strong>Prevention:</strong> {d.prevention}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Fertilizer Insights */}
                <section className="cd-section">
                    <h3 className="cd-section-title">Recommended Inputs</h3>
                    <div className="cd-fert-ratio">
                        {crop.fertilizers.npkRatio.split(':').map((v, i) => (
                            <div key={i} className="cd-fert-item">
                                <span className="cd-fert-val">{v.trim()}</span>
                                <span className="cd-fert-label">{['N', 'P₂O₅', 'K₂O'][i]}</span>
                            </div>
                        ))}
                    </div>
                    <div className="cd-tags" style={{marginTop: '16px'}}>
                        {crop.fertilizers.suggested.map(f => <span key={f} className="cd-tag">{f}</span>)}
                    </div>
                    <p className="cd-fert-note">{crop.fertilizers.dosageNote}</p>
                    <Link to="/fertilizer" className="cd-action-link">Open Fertilizer Calculator →</Link>
                </section>

                {/* AI Insights */}
                <section className="cd-section cd-insights-section">
                    <h3 className="cd-section-title"><Lightbulb size={20} /> AI Insights</h3>
                    <div className="cd-insights-grid">
                        <div className="cd-insight-card">
                            <Calendar size={20} className="cd-icon" />
                            <h4>Best Season</h4>
                            <p>{crop.aiInsights.bestSeason}</p>
                        </div>
                        <div className="cd-insight-card">
                            <TrendingUp size={20} className="cd-icon" />
                            <h4>Optimization Tips</h4>
                            <p>{crop.aiInsights.yieldTips}</p>
                        </div>
                        <div className="cd-insight-card">
                            <AlertTriangle size={20} className="cd-icon" />
                            <h4>Risk Factors</h4>
                            <p>{crop.aiInsights.riskFactors}</p>
                        </div>
                        <div className="cd-insight-card">
                            <Sprout size={20} className="cd-icon" />
                            <h4>Planting Strategy</h4>
                            <p>{crop.aiInsights.plantingSuggestions}</p>
                        </div>
                    </div>
                </section>

                {/* Charts */}
                <section className="cd-section">
                    <h3 className="cd-section-title">Growth Timeline</h3>
                    <div className="cd-chart-box">
                        <ResponsiveContainer width="100%" height={260}>
                            <LineChart data={crop.growthData} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
                                <CartesianGrid stroke="#eae5df" vertical={false} />
                                <XAxis dataKey="week" tickFormatter={w => `W${w}`} tick={{ fontSize: 12, fill: '#6b6159' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 12, fill: '#6b6159' }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Line type="monotone" dataKey="height" stroke="var(--color-forest)" strokeWidth={3} dot={false} name="Height (cm)" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </section>

                <section className="cd-section">
                    <h3 className="cd-section-title">Nutrient Usage Pattern</h3>
                    <div className="cd-chart-box">
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={crop.nutrientUsage} barGap={4} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
                                <CartesianGrid stroke="#eae5df" vertical={false} />
                                <XAxis dataKey="phase" tick={{ fontSize: 12, fill: '#6b6159' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 12, fill: '#6b6159' }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="n" name="Nitrogen" fill="var(--color-forest)" radius={[4,4,0,0]} />
                                <Bar dataKey="p" name="Phosphorus" fill="var(--color-amber)" radius={[4,4,0,0]} />
                                <Bar dataKey="k" name="Potassium" fill="var(--color-water)" radius={[4,4,0,0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </section>

                {/* Smart Action Buttons */}
                <section className="cd-section">
                    <div className="cd-action-grid">
                        <Link to="/detect" className="cd-big-btn">
                            <Shield size={20} />
                            <span>Detect Disease</span>
                            <span className="cd-arrow">→</span>
                        </Link>
                        <Link to="/recommend" className="cd-big-btn">
                            <Sprout size={20} />
                            <span>Crop Intelligence</span>
                            <span className="cd-arrow">→</span>
                        </Link>
                        <Link to="/fertilizer" className="cd-big-btn">
                            <Beaker size={20} />
                            <span>Fertilizer Calculator</span>
                            <span className="cd-arrow">→</span>
                        </Link>
                    </div>
                </section>

                {/* Related Crops */}
                <section className="cd-section">
                    <h3 className="cd-section-title">Related Crops</h3>
                    <div className="cd-related-track">
                        {crop.relatedCrops.map(rid => {
                            const rc = allCrops.find(c => c.id === rid);
                            if (!rc) return null;
                            return (
                                <Link to={`/crops/${rc.id}`} key={rc.id} className="cd-related-card">
                                    <img src={rc.image} alt={rc.name} />
                                    <div className="cd-rc-info">
                                        <span className="cd-rc-name">{rc.name}</span>
                                        <span className="cd-rc-badge">{rc.season === crop.season ? 'Same Season' : 'Related'}</span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </section>

            </div>
        </div>
    );
}
