import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({ baseURL: API_BASE, timeout: 30000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("shopx_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("shopx_token");
      localStorage.removeItem("shopx_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
  updateProfile: (data) => api.put("/auth/profile", data),
  addAddress: (data) => api.post("/auth/address", data),
  getAllUsers: (params) => api.get("/auth/users", { params }),
  updateUserRole: (id, role) => api.put(`/auth/users/${id}/role`, { role }),
  toggleUserStatus: (id) => api.put(`/auth/users/${id}/toggle`),
};

// Products
export const productsAPI = {
  getAll: (params) => api.get("/products", { params }),
  getOne: (id) => api.get(`/products/${id}`),
  create: (data) => api.post("/products", data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  addReview: (id, data) => api.post(`/products/${id}/reviews`, data),
  getCategories: () => api.get("/products/categories"),
  createCategory: (data) => api.post("/products/categories", data),
  updateCategory: (id, data) => api.put(`/products/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/products/categories/${id}`),
};

// Cart
export const cartAPI = {
  get: () => api.get("/cart"),
  add: (productId, quantity) => api.post("/cart", { productId, quantity }),
  update: (itemId, quantity) => api.put(`/cart/${itemId}`, { quantity }),
  remove: (itemId) => api.delete(`/cart/${itemId}`),
  clear: () => api.delete("/cart/clear"),
  sync: (items) => api.post("/cart/sync", { items }),
};

// Orders
export const ordersAPI = {
  create: (data) => api.post("/orders", data),
  getMy: (params) => api.get("/orders/my", { params }),
  getOne: (id) => api.get(`/orders/${id}`),
  getAll: (params) => api.get("/orders/all", { params }),
  updateStatus: (id, status, note) => api.put(`/orders/${id}/status`, { status, note }),
  getDashboardStats: () => api.get("/orders/dashboard/stats"),
};

// Settings
export const settingsAPI = {
  get: () => api.get("/settings"),
  update: (data) => api.put("/settings", data),
  getLayout: () => api.get("/settings/layout"),
  updateLayout: (sections) => api.put("/settings/layout", { sections }),
  toggleSection: (sectionId, isEnabled) => api.put("/settings/layout/toggle", { sectionId, isEnabled }),
  reorderSections: (orderedIds) => api.put("/settings/layout/reorder", { orderedIds }),
};

// Payment
export const paymentAPI = {
  initiatePayhere: (orderId) => api.post("/payment/payhere/initiate", { orderId }),
  getStatus: (orderId) => api.get(`/payment/status/${orderId}`),
};


// Pricing
export const pricingAPI = {
  getConfig: () => api.get("/pricing/config"),
  updateTaxCharges: (taxCharges) => api.put("/pricing/tax-charges", { taxCharges }),
  updateDistrictFees: (data) => api.put("/pricing/district-fees", data),
  updateInternational: (data) => api.put("/pricing/international", data),
  updateFull: (data) => api.put("/pricing/config", data),
  calculateTotal: (data) => api.post("/pricing/calculate", data),
  validateDriveLink: (url) => api.post("/pricing/validate-drive-link", { url }),
  getDistricts: () => api.get("/pricing/districts"),
};
