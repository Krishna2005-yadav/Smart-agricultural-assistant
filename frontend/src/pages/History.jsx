import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import './History.css';

const TABS = [
    { key: 'detections', label: 'Disease Detections' },
    { key: 'recommendations', label: 'Crop Suggestions' },
    { key: 'fertilizer', label: 'Fertilizer Calculations' },
];

export default function History() {
    const [tab, setTab] = useState('detections');
    const [data, setData] = useState({ detections: [], recommendations: [], fertilizer: [] });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);

    const fetchData = () => {
        setLoading(true);
        Promise.all([
            api.get('/api/detections').then(r => r.data.detections || []).catch(() => []),
            api.get('/api/recommendations').then(r => r.data.recommendations || []).catch(() => []),
            api.get('/api/fertilizer/history').then(r => r.data.history || []).catch(() => []),
        ]).then(([det, rec, fert]) => {
            setData({ detections: det, recommendations: rec, fertilizer: fert });
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id, category) => {
        if (!confirm('Are you sure you want to delete this record?')) return;

        try {
            let endpoint = '';
            if (category === 'detections') endpoint = `/api/detections/${id}`;
            else if (category === 'recommendations') endpoint = `/api/recommendations/${id}`;
            else if (category === 'fertilizer') endpoint = `/api/fertilizer/history/${id}`;

            await api.delete(endpoint);
            // Refresh data
            fetchData();
        } catch (error) {
            console.error('Error deleting record:', error);
            alert('Failed to delete record.');
        }
    };

    const filtered = (data[tab] || []).filter((item) => {
        if (!search) return true;
        const s = search.toLowerCase();
        return JSON.stringify(item).toLowerCase().includes(s);
    });

    return (
        <div className="history-page">
            <div className="page-header">
                <h1>History</h1>
                <p>Review your past analyses, recommendations, and fertilizer plans.</p>
            </div>

            <div className="history-tabs">
                {TABS.map((t) => (
                    <button
                        key={t.key}
                        className={`tab-btn ${tab === t.key ? 'active' : ''}`}
                        onClick={() => setTab(t.key)}
                    >
                        {t.label}
                        <span className="tab-count">{data[t.key]?.length || 0}</span>
                    </button>
                ))}
            </div>

            <div className="history-search">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                    type="text"
                    placeholder="Search history..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="history-loading">
                    {[1, 2, 3].map(i => <div key={i} className="shimmer shimmer-card" />)}
                </div>
            ) : filtered.length === 0 ? (
                <div className="history-empty">
                    <p>No records found.</p>
                </div>
            ) : (
                <div className="history-list">
                    {tab === 'detections' && filtered.map((item, i) => (
                        <motion.div
                            key={item.id || i}
                            className="history-card card"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <div className="history-card-top">
                                {item.image_url && (
                                    <div
                                        className="history-thumb"
                                        onClick={() => setSelectedImage(item.image_url)}
                                        title="Click to view full image"
                                    >
                                        <img src={item.image_url} alt={item.disease} loading="lazy" />
                                        <div className="thumb-overlay">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                                        </div>
                                    </div>
                                )}
                                <div className="history-info">
                                    <h3>{item.disease_details?.name || item.disease?.replace(/_/g, ' ')}</h3>
                                    <p className="history-meta">{item.plant_name} — {item.confidence?.toFixed(1)}% confidence</p>
                                    <p className="history-date">{item.created_at ? new Date(item.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}</p>
                                </div>
                                <span className={`badge ${item.confidence >= 80 ? 'badge-green' : 'badge-yellow'}`}>
                                    {item.confidence?.toFixed(0)}%
                                </span>
                                <button
                                    className="delete-btn"
                                    onClick={() => handleDelete(item.id, 'detections')}
                                    title="Delete record"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                </button>
                            </div>
                            {item.disease_details && (
                                <div className="history-details">
                                    <div className="detail-row">
                                        <span className="detail-label">Symptoms</span>
                                        <p>{item.disease_details.symptoms}</p>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Treatment</span>
                                        <p>{item.disease_details.treatment}</p>
                                    </div>
                                </div>
                            )}
                            {item.all_probabilities && Object.keys(item.all_probabilities).length > 0 && (
                                <div className="history-probs">
                                    {Object.entries(item.all_probabilities)
                                        .sort((a, b) => b[1] - a[1])
                                        .slice(0, 3)
                                        .map(([name, prob]) => (
                                            <div key={name} className="mini-prob">
                                                <span>{name.replace(/_/g, ' ').substring(0, 30)}</span>
                                                <span>{prob.toFixed(1)}%</span>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </motion.div>
                    ))}

                    {tab === 'recommendations' && filtered.map((item, i) => (
                        <motion.div
                            key={item.id || i}
                            className="history-card card"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <div className="history-card-top">
                                <div className="history-info">
                                    <h3>{item.crop}</h3>
                                    <p className="history-meta">
                                        N: {item.nitrogen} · P: {item.phosphorus} · K: {item.potassium} · Temp: {item.temperature}°C · pH: {item.ph}
                                    </p>
                                    <p className="history-date">{item.created_at ? new Date(item.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}</p>
                                </div>
                                <span className="badge badge-green">{item.crop}</span>
                                <button
                                    className="delete-btn"
                                    onClick={() => handleDelete(item.id, 'recommendations')}
                                    title="Delete record"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                </button>
                            </div>
                        </motion.div>
                    ))}

                    {tab === 'fertilizer' && filtered.map((item, i) => (
                        <motion.div
                            key={item.id || i}
                            className="history-card card"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <div className="history-card-top">
                                <div className="history-info">
                                    <h3>Fertilizer Plan — {item.crop}</h3>
                                    <p className="history-meta">
                                        Soil N: {item.nitrogen_current} · P: {item.phosphorus_current} · K: {item.potassium_current}
                                    </p>
                                    <p className="history-date">{item.created_at ? new Date(item.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}</p>
                                </div>
                                <button
                                    className="delete-btn"
                                    onClick={() => handleDelete(item.id, 'fertilizer')}
                                    title="Delete record"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                </button>
                            </div>
                            <div className="history-recommendation">
                                <p>{item.recommendation}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Image Modal for Disease Detections */}
            {selectedImage && (
                <div className="image-modal-overlay" onClick={() => setSelectedImage(null)}>
                    <div className="image-modal-content" onClick={e => e.stopPropagation()}>
                        <button className="image-modal-close" onClick={() => setSelectedImage(null)}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                        <img src={selectedImage} alt="Enlarged plant leaf" />
                    </div>
                </div>
            )}
        </div>
    );
}
