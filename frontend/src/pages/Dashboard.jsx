import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios';
import './Dashboard.css';

export default function Dashboard() {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Interactive State
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filterValue, setFilterValue] = useState('');
    
    // Dropdown Toggles
    const [isDateOpen, setIsDateOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isDownloadOpen, setIsDownloadOpen] = useState(false);

    // Fetch dashboard data with filters
    const fetchDashboardData = () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        if (filterValue) params.append('filter', filterValue);
        
        api.get(`/api/dashboard-data?${params.toString()}`)
            .then(res => setData(res.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchDashboardData();
    }, [startDate, endDate, filterValue]);
    
    // Handle CSV Download
    const handleDownload = (type) => {
        const params = new URLSearchParams();
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        
        window.open(`/api/export-csv/${type}?${params.toString()}`, '_blank');
        setIsDownloadOpen(false);
    };

    // Helper to generate deterministic heatmaps based on real metric counts
    const generateHeatmap = (seedCount) => Array(12).fill(0).map((_, i) => (seedCount * (i + 1)) % 3 !== 0);

    // Activity Data (Real Data)
    const activityData = data?.activity_data || [
        { month: 'Jan', value: 0 }, { month: 'Feb', value: 0 }, { month: 'Mar', value: 0 },
        { month: 'Apr', value: 0 }, { month: 'May', value: 0 }, { month: 'Jun', value: 0 },
    ];
    
    // Dynamic month labels
    const startMonthLabel = activityData[0]?.month || 'Jan';
    const currentMonthLabel = activityData[activityData.length - 1]?.month || 'Jun';

    // Recent Detections mapped to 'Top Categories' list style
    const categories = (data?.recent_detections?.length > 0)
        ? data.recent_detections.slice(0, 5).map(det => ({
            id: det.id,
            name: det.plant_name || det.disease || 'Unknown',
            weight: det.confidence ? `${det.confidence.toFixed(0)}%` : 'N/A',
            trend: det.confidence > 90 ? '+5%' : '-2%',
            isPositive: det.confidence >= 90
        }))
        : [];

    const recommendationTypes = data?.request_types || [];
    
    // Total scans for donut
    const totalDetections = data?.total_detections || 0;
    const totalRecs = data?.total_recs || 0;
    const totalFerts = data?.total_ferts || 0;
    const totalOverall = totalDetections + totalRecs + totalFerts;
    const donutDetections = totalOverall ? (totalDetections / totalOverall) * 100 : 0;
    const donutRecs = totalOverall ? (totalRecs / totalOverall) * 100 : 0;
    const donutFerts = totalOverall ? (totalFerts / totalOverall) * 100 : 0;

    return (
        <div className="saas-dashboard">
            <div className="saas-dashboard-container">
                {/* Header Area */}
                <div className="saas-header">
                    <h1>Dashboard</h1>
                    <div className="saas-header-actions">
                        
                        {/* Date Picker */}
                        <div className="saas-dropdown-wrapper">
                            <div className="saas-date-picker" onClick={() => { setIsDateOpen(!isDateOpen); setIsFilterOpen(false); setIsDownloadOpen(false); }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                <span>{startDate || endDate ? `${startDate || 'Start'} - ${endDate || 'End'}` : 'All Time'}</span>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                            </div>
                            {isDateOpen && (
                                <motion.div className="saas-popover" initial={{opacity:0, y:5}} animate={{opacity:1, y:0}}>
                                    <div className="saas-popover-row">
                                        <label>From</label>
                                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                                    </div>
                                    <div className="saas-popover-row">
                                        <label>To</label>
                                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                                    </div>
                                    <button className="saas-btn-small" onClick={() => {setStartDate(''); setEndDate(''); setIsDateOpen(false);}}>Clear</button>
                                </motion.div>
                            )}
                        </div>

                        {/* Filter Menu */}
                        <div className="saas-dropdown-wrapper">
                            <button className="saas-btn-outline" onClick={() => { setIsFilterOpen(!isFilterOpen); setIsDateOpen(false); setIsDownloadOpen(false); }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                                Filter {filterValue && <span className="saas-filter-dot"></span>}
                            </button>
                            {isFilterOpen && (
                                <motion.div className="saas-popover" initial={{opacity:0, y:5}} animate={{opacity:1, y:0}}>
                                    <div className="saas-popover-row">
                                        <label>Keyword</label>
                                        <input type="text" placeholder="e.g. Corn" value={filterValue} onChange={e => setFilterValue(e.target.value)} />
                                    </div>
                                    <button className="saas-btn-small" onClick={() => {setFilterValue(''); setIsFilterOpen(false);}}>Clear</button>
                                </motion.div>
                            )}
                        </div>

                        {/* Download Menu */}
                        <div className="saas-dropdown-wrapper">
                            <button className="saas-btn-primary" onClick={() => { setIsDownloadOpen(!isDownloadOpen); setIsDateOpen(false); setIsFilterOpen(false); }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                Download
                            </button>
                            {isDownloadOpen && (
                                <motion.div className="saas-popover popover-right" initial={{opacity:0, y:5}} animate={{opacity:1, y:0}}>
                                    <div className="saas-popover-item" onClick={() => handleDownload('detections')}>Detection History (.csv)</div>
                                    <div className="saas-popover-item" onClick={() => handleDownload('recommendations')}>Crop Recommendations (.csv)</div>
                                    <div className="saas-popover-item" onClick={() => handleDownload('fertilizers')}>Fertilizer Logs (.csv)</div>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="saas-grid">
                    {/* Top Left: Activity Heatmaps */}
                    <motion.div className="saas-card col-span-2" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}}>
                        <div className="saas-card-header">
                            <h3>Activity Heatmaps</h3>
                            <div className="saas-legend">
                                <span className="legend-item"><span className="dot dot-orange"></span> High</span>
                                <span className="legend-item"><span className="dot dot-beige"></span> Low</span>
                                <span className="legend-item"><span className="dot dot-light"></span> Empty</span>
                            </div>
                        </div>
                        <div className="heatmap-grid-container">
                            {[
                                { name: 'Detections', highlight: 'orange', seed: totalDetections },
                                { name: 'Recommendations', highlight: 'orange', seed: totalRecs },
                                { name: 'Fertilizers', highlight: 'orange', seed: totalFerts }
                            ].map((field, i) => (
                                <div key={i} className="heatmap-group">
                                    <div className="heatmap-grid">
                                        {generateHeatmap(field.seed).map((isActive, j) => (
                                            <div key={j} className={`heatmap-cell ${isActive ? `active-${field.highlight}` : 'inactive'}`}></div>
                                        ))}
                                    </div>
                                    <div className="heatmap-label">{field.name}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Top Right: Recent List */}
                    <motion.div className="saas-card" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} transition={{delay: 0.1}}>
                        <div className="saas-card-header">
                            <h3>Recent Detections</h3>
                            <Link to="/history" className="saas-link">See All &gt;</Link>
                        </div>
                        <div className="category-list">
                            {categories.length > 0 ? categories.map((cat, i) => (
                                <div key={i} className="category-item">
                                    <span className="cat-name">{cat.name}</span>
                                    <span className="cat-weight">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                                        {cat.weight}
                                    </span>
                                    <span className={`cat-trend ${cat.isPositive ? 'trend-up' : 'trend-down'}`}>
                                        {cat.trend} 
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="17 7 12 12 7 7"></polyline><line x1="12" y1="18" x2="12" y2="7"></line></svg>
                                    </span>
                                </div>
                            )) : <p className="saas-empty">No detections yet.</p>}
                        </div>
                    </motion.div>

                    {/* Bottom Left: Bar Chart */}
                    <motion.div className="saas-card" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} transition={{delay: 0.2}}>
                        <div className="saas-card-header">
                            <h3>Activity Growth</h3>
                            <div className="saas-dropdown">{startMonthLabel} - {currentMonthLabel} <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg></div>
                        </div>
                        <div className="saas-bar-chart-container">
                            <div className="saas-bar-chart-y-axis">
                                <span>{data?.max_activity_val || 0}</span>
                            </div>
                        <div className="saas-bar-chart">
                                {activityData.map((d, i) => (
                                    <div key={i} className="saas-bar-col">
                                        <div className={`saas-bar ${d.active ? 'saas-bar-active' : ''}`} style={{ height: `${d.value}%` }}></div>
                                        <span className="saas-bar-label">{d.month}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Bottom Middle: Progress Bars */}
                    <motion.div className="saas-card" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} transition={{delay: 0.3}}>
                        <div className="saas-card-header">
                            <h3>Request Types</h3>
                            <Link to="/history" className="saas-link">See All &gt;</Link>
                        </div>
                        <div className="progress-list">
                            {recommendationTypes.length > 0 ? recommendationTypes.map((type, i) => (
                                <div key={i} className="progress-item">
                                    <span className="p-name">{type.name}</span>
                                    <div className="p-bar-track">
                                        <div className="p-bar-fill" style={{ width: `${(type.value / type.total) * 100}%`, backgroundColor: type.color }}></div>
                                    </div>
                                    <div className="p-stats">
                                        <span className="p-val">{type.value}</span>
                                        <span className="p-unit">Reqs</span>
                                    </div>
                                </div>
                            )) : <p className="saas-empty">No requests yet.</p>}
                        </div>
                    </motion.div>

                    {/* Bottom Right: Donut Chart */}
                    <motion.div className="saas-card" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} transition={{delay: 0.4}}>
                        <div className="saas-card-header">
                            <h3>Total Activity</h3>
                            <div className="saas-dropdown">{currentMonthLabel} <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg></div>
                        </div>
                        <div className="donut-chart-container">
                            <div className="donut-wrapper">
                                <svg viewBox="0 0 36 36" className="donut-svg">
                                    {/* Detections (Orange) */}
                                    <path className="donut-segment orange" strokeDasharray={`${donutDetections} ${100 - donutDetections}`} strokeDashoffset="25" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                    {/* Recommendations (Blue) */}
                                    <path className="donut-segment blue" strokeDasharray={`${donutRecs} ${100 - donutRecs}`} strokeDashoffset={25 - donutDetections} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                    {/* Fertilizers (Green) */}
                                    <path className="donut-segment green" strokeDasharray={`${donutFerts} ${100 - donutFerts}`} strokeDashoffset={25 - donutDetections - donutRecs} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                </svg>
                                <div className="donut-center">
                                    <span className="donut-num">{totalOverall}</span>
                                    <span className="donut-label">Total Scans</span>
                                </div>
                            </div>
                            <div className="donut-legend">
                                <div className="legend-row">
                                    <span className="d-dot orange"></span> Detections
                                </div>
                                <div className="legend-row">
                                    <span className="d-dot blue"></span> Recommendations
                                </div>
                                <div className="legend-row">
                                    <span className="d-dot green"></span> Fertilizers
                                </div>
                                <div className="legend-row">
                                    <span className="d-dot red"></span> Others
                                </div>
                            </div>
                        </div>
                        <div className="donut-footer">
                            <span className="trend-badge-inline">+25% <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="17 7 12 12 7 7"></polyline><line x1="12" y1="18" x2="12" y2="7"></line></svg></span>
                            <span className="trend-text">From Last Month</span>
                        </div>
                    </motion.div>

                </div>
            </div>
        </div>
    );
}
