import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Only redirect if not already on login/register pages
      if (!window.location.pathname.includes('/login') && 
          !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/password', data),
  logout: () => api.post('/auth/logout'),
  checkEmail: (email) => api.post('/auth/check-email', { email })
};

// Users API
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getStats: () => api.get('/users/stats'),
  searchDonors: (params) => api.get('/users/donors/search', { params }),
  getHospitals: (params) => api.get('/users/hospitals', { params }),
  getDonorDashboard: () => api.get('/users/donor/dashboard'),
  getPatientDashboard: () => api.get('/users/patient/dashboard'),
  getHospitalDashboard: () => api.get('/users/hospital/dashboard')
};

// Inventory API
export const inventoryAPI = {
  getAll: (params) => api.get('/inventory', { params }),
  getById: (id) => api.get(`/inventory/${id}`),
  add: (data) => api.post('/inventory', data),
  update: (id, data) => api.put(`/inventory/${id}`, data),
  delete: (id) => api.delete(`/inventory/${id}`),
  getSummary: (params) => api.get('/inventory/summary', { params }),
  getLowStock: (params) => api.get('/inventory/alerts/low-stock', { params }),
  getExpiring: (params) => api.get('/inventory/alerts/expiring', { params }),
  search: (params) => api.get('/inventory/search', { params }),
  getAllInventory: (params) => api.get('/inventory/all', { params })
};

// Emergency Requests API
export const requestsAPI = {
  getAll: (params) => api.get('/requests', { params }),
  getById: (id) => api.get(`/requests/${id}`),
  create: (data) => api.post('/requests', data),
  updateStatus: (id, data) => api.put(`/requests/${id}/status`, data),
  cancel: (id) => api.put(`/requests/${id}/cancel`),
  getMyRequests: () => api.get('/requests/my-requests'),
  getCritical: () => api.get('/requests/critical'),
  getStats: () => api.get('/requests/stats'),
  assign: (id, hospitalId) => api.put(`/requests/${id}/assign`, { hospitalId }),
  delete: (id) => api.delete(`/requests/${id}`)
};

// Donations API
export const donationsAPI = {
  getAll: (params) => api.get('/donations', { params }),
  getById: (id) => api.get(`/donations/${id}`),
  create: (data) => api.post('/donations', data),
  update: (id, data) => api.put(`/donations/${id}`, data),
  getMyDonations: () => api.get('/donations/my-donations'),
  getHospitalDonations: () => api.get('/donations/hospital'),
  getStats: () => api.get('/donations/stats'),
  getRecent: (params) => api.get('/donations/recent', { params }),
  delete: (id) => api.delete(`/donations/${id}`)
};

export default api;