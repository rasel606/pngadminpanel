// services/api.js
import { getSecureHttpUrl } from '../utils/socketUtils'

// Configure based on environment (Vite: use import.meta.env.VITE_*)
const API_BASE_URL = getSecureHttpUrl(import.meta.env.VITE_API_URL || 'https://api.tiger55.online/api')
const API_FALLBACK_URL = (import.meta.env.VITE_API_FALLBACK_URL || '').trim()
const API_ENABLE_FALLBACK = import.meta.env.VITE_ENABLE_API_FALLBACK === 'true'

const normalizeBaseUrl = (baseUrl) => baseUrl.replace(/\/$/, '')

class ApiService {
  constructor() {
    this.token = null
  }

  setToken(token) {
    this.token = token
  }

  async request(endpoint, options = {}) {
    const browserToken =
      this.token ||
      localStorage.getItem('admin_auth_token') ||
      localStorage.getItem('adminToken') ||
      localStorage.getItem('token')

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (browserToken) {
      headers['Authorization'] = `Bearer ${browserToken}`
    }

    const config = {
      ...options,
      headers,
    }

    if (options.body) {
      config.body = JSON.stringify(options.body)
    }

    const primaryBase = normalizeBaseUrl(API_BASE_URL)
    const fallbackBase = normalizeBaseUrl(API_FALLBACK_URL)
    const method = (options.method || 'GET').toUpperCase()
    const isAuthEndpoint = /\/admin\/auth\/|\/auth\//i.test(endpoint)

    const callApi = async (baseUrl) => {
      const url = `${baseUrl}${endpoint}`
      const response = await fetch(url, config)

      if (!response.ok) {
        let errorMessage = `API Error (${response.status})`
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorMessage
        } catch {
          // Ignore JSON parsing errors
        }
        const err = new Error(errorMessage)
        err.status = response.status
        throw err
      }

      return response.json()
    }

    try {
      return await callApi(primaryBase)
    } catch (error) {
      const shouldRetryWithFallback =
        API_ENABLE_FALLBACK &&
        fallbackBase &&
        fallbackBase !== primaryBase &&
        method === 'GET' &&
        !isAuthEndpoint &&
        (!error.status || error.status >= 500)

      if (shouldRetryWithFallback) {
        return callApi(fallbackBase)
      }

      throw error
    }
  }

  // get(endpoint) {
  //   return this.request(endpoint, { method: 'GET' });
  // }

  get(endpoint, params) {
    let url = endpoint
    if (params && typeof params === 'object') {
      const queryString = new URLSearchParams(params).toString()
      url += `?${queryString}`
    }
    return this.request(url, { method: 'GET' })
  }

  post(endpoint, body) {
    return this.request(endpoint, { method: 'POST', body })
  }

  put(endpoint, body) {
    return this.request(endpoint, { method: 'PUT', body })
  }

  patch(endpoint, body = {}) {
    return this.request(endpoint, { method: 'PATCH', body })
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' })
  }

  uploadFile(endpoint, formData) {
    const headers = {}
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    return fetch(`${normalizeBaseUrl(API_BASE_URL)}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    }).then(async (response) => {
      if (!response.ok) {
        let errorMessage = `Upload failed (${response.status})`
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorMessage
        } catch {
          // ignore parse error
        }
        throw new Error(errorMessage)
      }
      return response.json()
    })
  }
}

export const apiService = new ApiService()

const unwrapApiData = (response) => response?.data ?? response

// Admin-specific endpoints
export function getUserProfile() {
  return apiService.get('/affiliate/Auth/me')
}

export function getReports() {
  // Placeholder: update with actual reports endpoint
  return apiService.get('/reports')
}

export function getLogs() {
  // Placeholder: update with actual logs endpoint
  return apiService.get('/logs')
}

export function getRoles() {
  // Placeholder: update with actual roles endpoint
  return apiService.get('/roles')
}

// Dashboard API functions
export const dashboard = {
  getAdvancedDashboard: (params) =>
    apiService.get('/unified-dashboard/summary/advanced', params).then(unwrapApiData),
  getUnifiedDashboard: (params) =>
    apiService.get('/unified-dashboard/summary', params).then(unwrapApiData),
  getRealtimeStats: () => apiService.get('/unified-dashboard/realtime').then(unwrapApiData),
  getProviderStats: () =>
    apiService.get('/unified-dashboard/games').then((response) => unwrapApiData(response)?.providers || []),
  getTimeSeriesData: (params) =>
    apiService.get('/unified-dashboard/analytics', params).then((response) => unwrapApiData(response)?.growth || []),
};

// Transaction API functions
export const transactions = {
  searchDeposits: (params) => apiService.get('/transactions/deposits/search', params),
  searchWithdrawals: (params) => apiService.get('/transactions/withdrawals/search', params),
  approveDeposit: (id, data) => apiService.post(`/transactions/deposits/${id}/approve`, data),
  rejectDeposit: (id, data) => apiService.post(`/transactions/deposits/${id}/reject`, data),
  approveWithdrawal: (id, data) => apiService.post(`/transactions/withdrawals/${id}/approve`, data),
  rejectWithdrawal: (id, data) => apiService.post(`/transactions/withdrawals/${id}/reject`, data)
};

