import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import './Admin.css';

export default function Admin() {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        Promise.all([
            api.get('/api/admin/stats').then(r => r.data).catch(() => null),
            api.get('/api/admin/users').then(r => r.data.users || []).catch(() => []),
        ]).then(([s, u]) => {
            setStats(s);
            setUsers(u);
            setLoading(false);
        });
    }, []);

    const handleBan = async (userId, action, reason = '') => {
        setActionLoading(userId);
        try {
            await api.put(`/api/admin/users/${userId}/status`, { action, reason, duration_days: 7 });
            const { data } = await api.get('/api/admin/users');
            setUsers(data.users || []);
        } catch { /* ignore */ }
        setActionLoading(null);
    };

    const handleDelete = async (userId) => {
        if (!confirm('Permanently delete this user?')) return;
        setActionLoading(userId);
        try {
            await api.delete(`/api/admin/users/${userId}`);
            setUsers(users.filter(u => u.id !== userId));
        } catch { /* ignore */ }
        setActionLoading(null);
    };

    const filteredUsers = users.filter(u => {
        if (!search) return true;
        const s = search.toLowerCase();
        return u.username?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s);
    });

    const statCards = stats ? [
        { label: 'Total Users', value: stats.total_users, color: 'green' },
        { label: 'Disease Detections', value: stats.total_detections, color: 'green' },
        { label: 'Recommendations', value: stats.total_recommendations, color: 'brown' },
        { label: 'Fertilizer Calcs', value: stats.total_fertilizer_recs, color: 'blue' },
    ] : [];

    const maxDiseaseCount = stats?.disease_stats?.length ? Math.max(...stats.disease_stats.map(d => d.count)) : 1;
    const maxCropCount = stats?.crop_stats?.length ? Math.max(...stats.crop_stats.map(c => c.count)) : 1;

    return (
        <div className="admin-page">
            <div className="page-header">
                <h1>System Administration</h1>
                <p>Monitor platform activity and manage users.</p>
            </div>

            {/* Stat Cards */}
            <div className="admin-stats">
                {loading ? (
                    [1, 2, 3, 4].map(i => <div key={i} className="shimmer" style={{ height: 100, borderRadius: 14 }} />)
                ) : (
                    statCards.map((s, i) => (
                        <motion.div
                            key={s.label}
                            className={`stat-card-dash stat-${s.color}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                        >
                            <div className="stat-info">
                                <div className="stat-number">{s.value?.toLocaleString()}</div>
                                <div className="stat-name">{s.label}</div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Charts */}
            {stats && (
                <div className="admin-charts">
                    {stats.disease_stats?.length > 0 && (
                        <div className="chart-card card">
                            <h3>Disease Distribution</h3>
                            <div className="bar-chart">
                                {stats.disease_stats.slice(0, 7).map((d) => (
                                    <div key={d.name} className="bar-row">
                                        <span className="bar-label">{d.name?.replace(/_/g, ' ').substring(0, 25)}</span>
                                        <div className="bar-track">
                                            <motion.div
                                                className="bar-fill bar-green"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(d.count / maxDiseaseCount) * 100}%` }}
                                                transition={{ duration: 0.6, delay: 0.3 }}
                                            />
                                        </div>
                                        <span className="bar-value">{d.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {stats.crop_stats?.length > 0 && (
                        <div className="chart-card card">
                            <h3>Most Recommended Crops</h3>
                            <div className="bar-chart">
                                {stats.crop_stats.slice(0, 7).map((c) => (
                                    <div key={c.name} className="bar-row">
                                        <span className="bar-label">{c.name}</span>
                                        <div className="bar-track">
                                            <motion.div
                                                className="bar-fill bar-brown"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(c.count / maxCropCount) * 100}%` }}
                                                transition={{ duration: 0.6, delay: 0.3 }}
                                            />
                                        </div>
                                        <span className="bar-value">{c.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* User Management */}
            <div className="admin-users-section">
                <div className="section-header">
                    <h2>User Management</h2>
                    <div className="history-search" style={{ maxWidth: 320, marginBottom: 0 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="users-table-wrapper">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Email</th>
                                <th>Status</th>
                                <th>Activity</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5"><div className="shimmer" style={{ height: 40 }} /></td></tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr><td colSpan="5" className="text-center" style={{ padding: '2rem', color: 'var(--text-tertiary)' }}>No users found</td></tr>
                            ) : (
                                filteredUsers.map((user) => {
                                    const isBanned = user.banned_until && new Date(user.banned_until) > new Date();
                                    return (
                                        <tr key={user.id}>
                                            <td>
                                                <div className="user-cell">
                                                    <div className="user-avatar-sm">{user.username?.[0]?.toUpperCase()}</div>
                                                    <div>
                                                        <span className="user-name-cell">{user.username}</span>
                                                        {user.is_admin ? <span className="badge badge-blue" style={{ marginLeft: 6 }}>Admin</span> : null}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-secondary">{user.email}</td>
                                            <td>
                                                <span className={`badge ${isBanned ? 'badge-red' : 'badge-green'}`}>
                                                    {isBanned ? 'Banned' : 'Active'}
                                                </span>
                                            </td>
                                            <td className="text-secondary">
                                                {user.detection_count || 0} scans · {user.recommendation_count || 0} recs
                                            </td>
                                            <td>
                                                <div className="action-btns">
                                                    {!user.is_admin && (
                                                        <>
                                                            {isBanned ? (
                                                                <button
                                                                    className="btn btn-sm btn-ghost"
                                                                    onClick={() => handleBan(user.id, 'unban')}
                                                                    disabled={actionLoading === user.id}
                                                                >
                                                                    Unban
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    className="btn btn-sm btn-ghost"
                                                                    onClick={() => handleBan(user.id, 'ban', 'Violation of terms')}
                                                                    disabled={actionLoading === user.id}
                                                                >
                                                                    Ban
                                                                </button>
                                                            )}
                                                            <button
                                                                className="btn btn-sm btn-ghost"
                                                                style={{ color: 'var(--red-500)' }}
                                                                onClick={() => handleDelete(user.id)}
                                                                disabled={actionLoading === user.id}
                                                            >
                                                                Delete
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
