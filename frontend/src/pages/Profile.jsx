import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './Profile.css';

export default function Profile() {
    const { user, refreshUser, logout } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState(user?.username || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [deletePassword, setDeletePassword] = useState('');
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(null);

    const showMsg = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), 4000);
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading('profile');
        try {
            await api.put('/api/auth/profile', { username });
            await refreshUser();
            showMsg('Profile updated successfully');
        } catch (err) {
            showMsg(err.response?.data?.error || 'Update failed', 'error');
        }
        setLoading(null);
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            showMsg('Passwords do not match', 'error');
            return;
        }
        setLoading('password');
        try {
            await api.put('/api/auth/password', { current_password: currentPassword, new_password: newPassword });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            showMsg('Password changed successfully');
        } catch (err) {
            showMsg(err.response?.data?.error || 'Password change failed', 'error');
        }
        setLoading(null);
    };

    const handleDeleteAccount = async (e) => {
        e.preventDefault();
        if (!confirm('This will permanently delete your account and all data. Are you sure?')) return;
        setLoading('delete');
        try {
            await api.delete('/api/auth/account');
            await logout();
            navigate('/');
        } catch (err) {
            showMsg(err.response?.data?.error || 'Deletion failed', 'error');
        }
        setLoading(null);
    };

    const handleUploadPicture = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('profile_picture', file);
        setLoading('picture');
        try {
            await api.post('/api/auth/update-profile-picture', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            await refreshUser();
            showMsg('Profile picture updated');
        } catch (err) {
            showMsg(err.response?.data?.error || 'Upload failed', 'error');
        }
        setLoading(null);
    };

    return (
        <div className="profile-app-container">
            {/* Header Content */}
            <div className="profile-topbar">
                <div>
                    <h1>Welcome, {user?.username}</h1>
                    <span className="profile-date">{new Date().toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' })}</span>
                </div>
                
                {message && (
                    <motion.div
                        className={`profile-msg-toast ${message.type}`}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        {message.text}
                    </motion.div>
                )}
            </div>

            {/* Profile White Card Context */}
            <div className="profile-saas-card">
                <div className="profile-banner"></div>
                
                <div className="profile-card-content">
                    {/* Avatar Header overlap */}
                    <div className="profile-avatar-row">
                        <div className="profile-avatar-inner">
                            <div className="profile-avatar-lg">
                                {user?.profile_picture ? (
                                    <img src={user.profile_picture} alt={user.username} />
                                ) : (
                                    <span>{user?.username?.[0]?.toUpperCase()}</span>
                                )}
                            </div>
                            <div className="profile-titles">
                                <h2>{user?.username}</h2>
                                <p>{user?.email}</p>
                            </div>
                        </div>
                        
                        <label className="btn-edit-photo" style={{ cursor: 'pointer' }}>
                            {loading === 'picture' ? '...' : 'Edit'}
                            <input type="file" accept="image/*" onChange={handleUploadPicture} hidden />
                        </label>
                    </div>

                    {/* Content Grid */}
                    <div className="profile-forms-grid">
                        
                        {/* Column 1: Personal Details */}
                        <form onSubmit={handleUpdateProfile} className="profile-form-col">
                            <div className="input-group-saas">
                                <label>Username</label>
                                <input 
                                    type="text" 
                                    value={username} 
                                    onChange={(e) => setUsername(e.target.value)} 
                                    required 
                                    className="saas-input"
                                />
                            </div>
                            
                            <div className="input-group-saas">
                                <label>Account Status</label>
                                <input 
                                    type="text" 
                                    value="Active Member"
                                    disabled
                                    className="saas-input readonly"
                                />
                            </div>

                            <button type="submit" className="btn-save-saas" disabled={loading === 'profile'}>
                                {loading === 'profile' ? <span className="btn-spinner-sm" /> : 'Save Profile'}
                            </button>
                        </form>

                        {/* Column 2: Password Management */}
                        <form onSubmit={handleChangePassword} className="profile-form-col">
                            <div className="input-group-saas">
                                <label>Current Password</label>
                                <input 
                                    type="password" 
                                    value={currentPassword} 
                                    onChange={(e) => setCurrentPassword(e.target.value)} 
                                    required 
                                    className="saas-input"
                                    placeholder="••••••••"
                                />
                            </div>
                            
                            <div className="input-group-saas">
                                <label>New Password</label>
                                <input 
                                    type="password" 
                                    value={newPassword} 
                                    onChange={(e) => setNewPassword(e.target.value)} 
                                    required minLength={8}
                                    className="saas-input"
                                    placeholder="••••••••"
                                />
                            </div>
                            
                            <div className="input-group-saas">
                                <label>Confirm Password</label>
                                <input 
                                    type="password" 
                                    value={confirmPassword} 
                                    onChange={(e) => setConfirmPassword(e.target.value)} 
                                    required 
                                    className="saas-input"
                                    placeholder="••••••••"
                                />
                            </div>

                            <button type="submit" className="btn-save-saas" disabled={loading === 'password'}>
                                {loading === 'password' ? <span className="btn-spinner-sm" /> : 'Update Password'}
                            </button>
                        </form>
                    </div>

                    {/* Bottom Area: Email & Danger */}
                    <div className="profile-bottom-sections">
                        <div className="profile-email-block">
                            <h4>My email Address</h4>
                            <div className="email-row">
                                <div className="email-icon">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                                </div>
                                <div className="email-texts">
                                    <p className="email-address">{user?.email}</p>
                                    <p className="email-subtext">Primary Account</p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleDeleteAccount} className="profile-danger-block">
                            <h4>Danger Zone</h4>
                            <div className="danger-row">
                                <p>Delete your account permanently</p>
                                <button type="submit" className="btn-delete-saas" disabled={loading === 'delete'}>
                                    {loading === 'delete' ? '...' : 'Delete Account'}
                                </button>
                            </div>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
}
