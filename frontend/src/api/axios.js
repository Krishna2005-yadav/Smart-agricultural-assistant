import axios from 'axios';

const api = axios.create({
    baseURL: '',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const isAuthPage = window.location.pathname === '/login' || window.location.pathname === '/signup';
            if (!isAuthPage && !error.config.url.includes('/api/auth/me')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
