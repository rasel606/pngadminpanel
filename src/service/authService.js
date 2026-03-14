// services/authService.js
import { apiService } from './api'

export const authService = {
  register: async (userData) => {
    return await apiService.post('/admin/auth/register_admin', userData)
  },
  subAdminRegister: async (userData) => {
    return await apiService.post('/admin/auth/register_Sub_admin', userData)
  },
  agentRegister: async (userData) => {
    return await apiService.post('/admin/auth/register_agent', userData)
  },
  subAgentRegister: async (userData) => {
    return await apiService.post('/admin/auth/register_Sub_agent', userData)
  },
  AffiliateRegister: async (userData) => {
    return await apiService.post('/admin/auth/register_affiliate', userData)
  },
  registerUser: async (userData) => {
    return await apiService.post('/admin/auth/createUser', userData)
  },

  login: async (credentials) => {
    const rawIdentifier = (credentials?.email || credentials?.userId || '').trim()
    const isEmail = rawIdentifier.includes('@')

    const payload = {
      password: credentials?.password,
      language: credentials?.language,
      ...(isEmail ? { email: rawIdentifier } : { userId: rawIdentifier }),
    }

    const response = await apiService.post('/admin/auth/login_admin', payload)
    console.log('Login response:', response.token)
    if (response && response.token) {
      const token = response.token
      localStorage.setItem('admin_auth_token', token)
      apiService.setToken(token)
    }

    return response
  },

  getProfile: async () => {
    try {
      const profileEndpoints = ['/admin/auth/main_admin', '/auth/main_admin', '/admin/main_admin']
      let response
      let lastError

      for (const endpoint of profileEndpoints) {
        try {
          response = await apiService.get(endpoint)
          break
        } catch (error) {
          lastError = error
          if (error?.status !== 404 && error?.status !== 405) {
            throw error
          }
        }
      }

      if (!response) throw lastError

      // Handle different response structures
      if (response.data) {
        return response.data // If backend returns { success: true, data: user }
      } else if (response.user) {
        return response.user // If backend returns { user }
      } else {
        return response // If backend returns user object directly
      }
    } catch (error) {
      console.error('getProfile error:', error)
      throw error
    }
  },

  updateProfile: async (profileData) => {
    try {
      const updateEndpoints = [
        '/admin/auth/main_admin/update',
        '/auth/main_admin/update',
        '/auth/profile/update',
        '/admin/main_admin/update',
      ]

      let response
      let lastError

      for (const endpoint of updateEndpoints) {
        try {
          response = await apiService.put(endpoint, profileData)
          break
        } catch (error) {
          lastError = error
          if (error?.status !== 404 && error?.status !== 405) {
            throw error
          }
        }
      }

      if (!response) throw lastError

      return response?.data ?? response
    } catch (error) {
      console.error('updateProfile error:', error)
      throw error
    }
  },

  changePassword: async (passwordData) => {
    return await apiService.put('/auth/register_sub_admin', passwordData)
  },
  // GetActiveAdminSessions: async () => {
  //   return await apiService.get('/Admin/auth/sessions/active');
  // },
  // ForceLogoutAdmin: async () => {
  //   return await apiService.get('/Admin/auth/force-logout/admin/:userId');
  // },

  logout: () => {
    localStorage.removeItem('admin_auth_token')
    apiService.setToken(null)
  },

  setToken: (token) => {
    apiService.setToken(token)
    if (token) localStorage.setItem('admin_auth_token', token)
    else localStorage.removeItem('admin_auth_token')
  },

  init: () => {
    const token = localStorage.getItem('admin_auth_token')
    if (token) {
      apiService.setToken(token)
    }
  },
}

export default authService
