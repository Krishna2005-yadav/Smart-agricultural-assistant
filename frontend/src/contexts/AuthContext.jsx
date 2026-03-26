import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = useCallback(async () => {
        try {
            const { data } = await api.get('/api/auth/me');
            if (data.authenticated) {
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const login = async (email, password) => {
        const { data } = await api.post('/api/auth/login', { email, password });
        if (data.success) {
            setUser(data.user);
            return { success: true };
        }
        return { success: false, error: data.error };
    };

    const signup = async (email, username, password) => {
        const { data } = await api.post('/api/auth/signup', { email, username, password });
        if (data.success) {
            return { success: true };
        }
        return { success: false, error: data.error };
    };

    const logout = async () => {
        await api.post('/api/auth/logout');
        setUser(null);
    };

    const refreshUser = async () => {
        await checkAuth();
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
