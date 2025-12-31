import axios from 'axios'
import { useAuthStore } from '../store/authStore'

// Configure baseURL for API requests
// If VITE_API_URL is set, use it (should be full backend URL, e.g., https://backend.railway.app)
// If not set, use '/api' for local development (Vite proxy will handle it)
const apiUrl = import.meta.env.VITE_API_URL;
const baseURL = apiUrl 
  ? (apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`)  // Ensure /api suffix
  : '/api';  // Fallback for local development

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  // For blob requests, don't set Content-Type (let browser set it)
  if (config.responseType === 'blob') {
    delete config.headers['Content-Type']
  }
  return config
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
