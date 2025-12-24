import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: any) => api.post('/auth/register', data),
};

// Admin APIs
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (page = 1, limit = 10) =>
    api.get(`/admin/users?page=${page}&limit=${limit}`),
  getStudents: (page = 1, limit = 10) =>
    api.get(`/admin/students?page=${page}&limit=${limit}`),
};

// Loans APIs
export const loansAPI = {
  getAll: (page = 1, limit = 10, status?: string) => {
    let url = `/loans?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    return api.get(url);
  },
  getById: (id: string) => api.get(`/loans/${id}`),
  approve: (id: string, notes?: string) =>
    api.post(`/loans/${id}/approve`, { adminNotes: notes }),
  reject: (id: string, reason: string) =>
    api.post(`/loans/${id}/reject`, { rejectionReason: reason }),
  disburse: (id: string) => api.post(`/loans/${id}/disburse`),
  getStats: () => api.get('/loans/stats/overview'),
};

// Repayments APIs
export const repaymentsAPI = {
  getAll: (page = 1, limit = 10) =>
    api.get(`/repayments?page=${page}&limit=${limit}`),
  getById: (id: string) => api.get(`/repayments/${id}`),
  getByLoan: (loanId: string) => api.get(`/repayments/loan/${loanId}`),
};

// Transactions APIs
export const transactionsAPI = {
  getAll: (page = 1, limit = 10, type?: string) => {
    let url = `/transactions?page=${page}&limit=${limit}`;
    if (type) url += `&type=${type}`;
    return api.get(url);
  },
  getStats: () => api.get('/transactions/stats'),
};

// Students APIs
export const studentsAPI = {
  getScore: (userId: string) => api.get(`/students/${userId}/score`),
};

export default api;
