import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('mams_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Unauthorized: clear storage if token is invalid
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('mams_token');
        localStorage.removeItem('mams_user');
        window.location.href = '/login';
      }
    }
    const message = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

// Auth endpoints
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  getUsers: () => api.get('/users'),
};

// Dashboard endpoints
export const dashboardApi = {
  getMetrics: (params) => api.get('/dashboard/metrics', { params }),
  getNetMovementDetails: (params) => api.get('/dashboard/net-movement-details', { params }),
  getCategorySummary: (params) => api.get('/dashboard/category-summary', { params }),
  getBaseDistribution: (params) => api.get('/dashboard/base-distribution', { params }),
};

// Inventory endpoints
export const inventoryApi = {
  getInventory: (params) => api.get('/inventory', { params }),
  getInventoryByBase: (baseId) => api.get(`/inventory/base/${baseId}`),
};

// Purchases endpoints
export const purchasesApi = {
  getPurchases: (params) => api.get('/purchases', { params }),
  getPurchaseById: (id) => api.get(`/purchases/${id}`),
  recordPurchase: (data) => api.post('/purchases', data),
};

// Transfers endpoints
export const transfersApi = {
  getTransfers: (params) => api.get('/transfers', { params }),
  getTransferById: (id) => api.get(`/transfers/${id}`),
  initiateTransfer: (data) => api.post('/transfers', data),
  updateStatus: (id, status) => api.patch(`/transfers/${id}/status`, { status }),
};

// Assignments endpoints
export const assignmentsApi = {
  getAssignments: (params) => api.get('/assignments', { params }),
  getAssignmentById: (id) => api.get(`/assignments/${id}`),
  assignAsset: (data) => api.post('/assignments', data),
  returnAsset: (id, data) => api.post(`/assignments/${id}/return`, data),
};

// Expenditures endpoints
export const expendituresApi = {
  getExpenditures: (params) => api.get('/expenditures', { params }),
  getExpenditureById: (id) => api.get(`/expenditures/${id}`),
  recordExpenditure: (data) => api.post('/expenditures', data),
};

// Bases & Assets endpoints
export const basesApi = {
  getAllBases: () => api.get('/bases'),
  getBaseById: (id) => api.get(`/bases/${id}`),
};

export const assetsApi = {
  getAllAssets: (params) => api.get('/assets', { params }),
  getCategories: () => api.get('/assets/categories'),
};

// Audit logs
export const auditApi = {
  getLogs: () => api.get('/audit-logs'),
};

export default api;
