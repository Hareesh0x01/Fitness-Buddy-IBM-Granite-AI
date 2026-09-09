import axios from 'axios';

// ============================================================
// API Service — all backend communication
// ============================================================

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — log but never expose secrets
api.interceptors.request.use((config) => {
  return config;
});

// Response interceptor — normalize errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const message = error.response.data?.error || 'Something went wrong. Please try again.';
      return Promise.reject(new Error(message));
    }
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Request timed out. Please check your connection.'));
    }
    return Promise.reject(new Error('Unable to connect to Fitness Buddy server. Please check your connection.'));
  }
);

// ============================================================
// Chat API
// ============================================================
export const chatAPI = {
  send: (message: string, sessionId?: string) =>
    api.post('/chat', { message, sessionId }),
  getHistory: (sessionId: string) =>
    api.get(`/chat/history/${sessionId}`),
};

// ============================================================
// Profile API
// ============================================================
export const profileAPI = {
  get: () => api.get('/profile'),
  create: (data: Record<string, unknown>) => api.post('/profile', data),
  update: (data: Record<string, unknown>) => api.put('/profile', data),
};

// ============================================================
// Workout API
// ============================================================
export const workoutAPI = {
  generate: (params?: Record<string, unknown>) => api.post('/workout/generate', params || {}),
  getToday: () => api.get('/workout/today'),
  complete: (data: Record<string, unknown>) => api.post('/workout/complete', data),
  getMotivation: () => api.get('/workout/motivation'),
};

// ============================================================
// Nutrition API
// ============================================================
export const nutritionAPI = {
  recommend: (params: Record<string, unknown>) => api.post('/nutrition/recommend', params),
  getHistory: () => api.get('/nutrition/history'),
};

// ============================================================
// Habits API
// ============================================================
export const habitsAPI = {
  get: (date?: string) => api.get('/habits', { params: date ? { date } : {} }),
  update: (date: string, habits: Record<string, boolean>) =>
    api.post('/habits', { date, habits }),
  getAll: () => api.get('/habits/all'),
};

// ============================================================
// Progress & Dashboard API
// ============================================================
export const dashboardAPI = {
  getProgress: () => api.get('/progress'),
  getHistory: () => api.get('/history'),
  getDailyPlan: () => api.get('/daily-plan'),
  getHealth: () => api.get('/health'),
};

export default api;
