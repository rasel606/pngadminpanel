/**
 * Widget Service
 * API service for widget management
 */

import { apiService as api } from './api'

const WIDGET_ENDPOINTS = {
  // Public endpoints
  getActive: '/widgets/active',
  track: '/widgets/track',
  
  // Admin endpoints
  getAll: '/admin/widgets',
  getById: (id) => `/admin/widgets/${id}`,
  create: '/admin/widgets',
  update: (id) => `/admin/widgets/${id}`,
  delete: (id) => `/admin/widgets/${id}`,
  updateStatus: (id) => `/admin/widgets/${id}/status`,
  reorder: '/admin/widgets/reorder',
  clone: (id) => `/admin/widgets/${id}/clone`,
  upload: '/admin/widgets/upload',
  analytics: (id) => `/admin/widgets/${id}/analytics`,
}

class WidgetService {
  /**
   * Get all active widgets (public)
   */
  async getActiveWidgets(position = null) {
    try {
      const params = position ? `?position=${position}` : ''
      const response = await api.get(`${WIDGET_ENDPOINTS.getActive}${params}`)
      return response
    } catch (error) {
      console.error('Error fetching active widgets:', error)
      throw error
    }
  }

  /**
   * Get all widgets (admin)
   */
  async getAllWidgets(filters = {}) {
    try {
      const params = new URLSearchParams()
      if (filters.status) params.append('status', filters.status)
      if (filters.type) params.append('type', filters.type)
      if (filters.position) params.append('position', filters.position)
      
      const queryString = params.toString()
      const endpoint = queryString ? `${WIDGET_ENDPOINTS.getAll}?${queryString}` : WIDGET_ENDPOINTS.getAll
      
      const response = await api.get(endpoint)
      return response
    } catch (error) {
      console.error('Error fetching all widgets:', error)
      throw error
    }
  }

  /**
   * Get single widget by ID (admin)
   */
  async getWidget(id) {
    try {
      const response = await api.get(WIDGET_ENDPOINTS.getById(id))
      return response
    } catch (error) {
      console.error('Error fetching widget:', error)
      throw error
    }
  }

  /**
   * Create new widget (admin)
   */
  async createWidget(widgetData) {
    try {
      const response = await api.post(WIDGET_ENDPOINTS.create, widgetData)
      return response
    } catch (error) {
      console.error('Error creating widget:', error)
      throw error
    }
  }

  /**
   * Update widget (admin)
   */
  async updateWidget(id, updates) {
    try {
      const response = await api.put(WIDGET_ENDPOINTS.update(id), updates)
      return response
    } catch (error) {
      console.error('Error updating widget:', error)
      throw error
    }
  }

  /**
   * Delete widget (admin)
   */
  async deleteWidget(id) {
    try {
      const response = await api.delete(WIDGET_ENDPOINTS.delete(id))
      return response
    } catch (error) {
      console.error('Error deleting widget:', error)
      throw error
    }
  }

  /**
   * Update widget status (admin)
   */
  async updateWidgetStatus(id, status) {
    try {
      const response = await api.patch(WIDGET_ENDPOINTS.updateStatus(id), { status })
      return response
    } catch (error) {
      console.error('Error updating widget status:', error)
      throw error
    }
  }

  /**
   * Reorder widgets (admin)
   */
  async reorderWidgets(position, widgetIds) {
    try {
      const response = await api.post(WIDGET_ENDPOINTS.reorder, {
        position,
        widgetIds,
        widgets: Array.isArray(widgetIds)
          ? widgetIds.map((id, index) => ({ id, order: index + 1 }))
          : [],
      })
      return response
    } catch (error) {
      console.error('Error reordering widgets:', error)
      throw error
    }
  }

  /**
   * Clone widget (admin)
   */
  async cloneWidget(id) {
    try {
      const response = await api.post(WIDGET_ENDPOINTS.clone(id))
      return response
    } catch (error) {
      console.error('Error cloning widget:', error)
      throw error
    }
  }

  /**
   * Upload widget image (admin)
   */
  async uploadImage(file) {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await api.uploadFile(WIDGET_ENDPOINTS.upload, formData)
      return response
    } catch (error) {
      console.error('Error uploading image:', error)
      throw error
    }
  }

  /**
   * Get widget analytics (admin)
   */
  async getWidgetAnalytics(id, startDate, endDate) {
    try {
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      
      const queryString = params.toString()
      const endpoint = queryString 
        ? `${WIDGET_ENDPOINTS.analytics(id)}?${queryString}` 
        : WIDGET_ENDPOINTS.analytics(id)
      
      const response = await api.get(endpoint)
      return response
    } catch (error) {
      console.error('Error fetching widget analytics:', error)
      throw error
    }
  }

  /**
   * Track widget interaction (public)
   */
  async trackInteraction(widgetId, action, metadata = {}) {
    try {
      const response = await api.post(WIDGET_ENDPOINTS.track, {
        widgetId,
        action,
        metadata,
        timestamp: new Date().toISOString(),
      })
      return response
    } catch (error) {
      console.error('Error tracking widget interaction:', error)
      // Don't throw error for tracking failures
      return null
    }
  }

  /**
   * Batch operations
   */
  async batchUpdateStatus(widgetIds, status) {
    try {
      const promises = widgetIds.map(id => this.updateWidgetStatus(id, status))
      const results = await Promise.allSettled(promises)
      
      const successful = results.filter(r => r.status === 'fulfilled').length
      const failed = results.filter(r => r.status === 'rejected').length
      
      return {
        successful,
        failed,
        total: widgetIds.length,
      }
    } catch (error) {
      console.error('Error in batch status update:', error)
      throw error
    }
  }

  async batchDelete(widgetIds) {
    try {
      const promises = widgetIds.map(id => this.deleteWidget(id))
      const results = await Promise.allSettled(promises)
      
      const successful = results.filter(r => r.status === 'fulfilled').length
      const failed = results.filter(r => r.status === 'rejected').length
      
      return {
        successful,
        failed,
        total: widgetIds.length,
      }
    } catch (error) {
      console.error('Error in batch delete:', error)
      throw error
    }
  }
}

export default new WidgetService()
