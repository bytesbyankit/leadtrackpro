import axios from 'axios';

/**
 * Centralized Axios instance with JWT Bearer token.
 * Reads token from localStorage and attaches as Authorization header.
 */
const api = axios.create({
    baseURL: '',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Attach JWT token to every request if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('lt_token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

// Auto-logout on 401 responses (expired/invalid token)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Don't clear on login attempt failures
            const isLoginRequest = error.config?.url?.includes('/api/auth/login');
            if (!isLoginRequest) {
                localStorage.removeItem('lt_token');
                localStorage.removeItem('lt_user');
                window.location.reload();
            }
        }
        return Promise.reject(error);
    }
);

export default api;
