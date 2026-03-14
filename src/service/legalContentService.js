import { apiService } from './api'

const BASE = '/legal'

const normalize = (response) => {
  if (response?.data !== undefined) return response.data
  return response
}

export const legalContentService = {
  // Legal pages
  async getLegalPages(lang = 'en') {
    const response = await apiService.get(`${BASE}/pages`, { lang })
    return normalize(response)
  },

  async getLegalContent(type, lang = 'en') {
    const response = await apiService.get(`${BASE}/${type}`, { lang })
    return normalize(response)
  },

  async saveLegalContent(payload) {
    const response = await apiService.post(`${BASE}/content`, payload)
    return normalize(response)
  },

  async toggleLegalContent(type, lang = 'en') {
    const response = await apiService.patch(`${BASE}/${type}/toggle?lang=${encodeURIComponent(lang)}`)
    return normalize(response)
  },

  async getLegalContentVersions(type, lang = 'en') {
    const response = await apiService.get(`${BASE}/${type}/versions`, { lang })
    return normalize(response)
  },

  async restoreLegalContentVersion(type, version, lang = 'en') {
    const response = await apiService.put(
      `${BASE}/${type}/restore/${version}?lang=${encodeURIComponent(lang)}`,
      {},
    )
    return normalize(response)
  },

  // FAQ
  async getFAQItems(params = {}) {
    const response = await apiService.get(`${BASE}/faq`, params)
    return normalize(response)
  },

  async getFAQItem(id) {
    const response = await apiService.get(`${BASE}/faq/item/${id}`)
    return normalize(response)
  },

  async searchFAQ(params = {}) {
    const response = await apiService.get(`${BASE}/faq/search`, params)
    return normalize(response)
  },

  async voteFAQ(id, helpful = true) {
    const response = await apiService.post(`${BASE}/faq/${id}/vote`, { helpful })
    return normalize(response)
  },

  async createFAQ(payload) {
    const response = await apiService.post(`${BASE}/faq`, payload)
    return normalize(response)
  },

  async updateFAQ(id, payload) {
    const response = await apiService.put(`${BASE}/faq/${id}`, payload)
    return normalize(response)
  },

  async deleteFAQ(id) {
    const response = await apiService.delete(`${BASE}/faq/${id}`)
    return normalize(response)
  },

  async toggleFAQStatus(id) {
    const response = await apiService.patch(`${BASE}/faq/${id}/toggle`)
    return normalize(response)
  },

  async bulkUpdateFAQOrder(items) {
    const response = await apiService.put(`${BASE}/faq/bulk/order`, { items })
    return normalize(response)
  },
}

export default legalContentService
