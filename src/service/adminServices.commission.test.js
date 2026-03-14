import { adminServices } from '../../service/adminServices'
import { apiService } from '../../service/api'

// Mock the API service
jest.mock('../../service/api', () => ({
  apiService: {
    patch: jest.fn(),
    get: jest.fn(),
    post: jest.fn(),
  },
}))

describe('Admin Services - Commission Management', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Agent Commission Methods', () => {
    test('setMySubAgentCommission should call correct endpoint', async () => {
      const subAgentId = '123'
      const rate = 15

      apiService.patch.mockResolvedValue({ success: true })

      await adminServices.setMySubAgentCommission(subAgentId, rate)

      expect(apiService.patch).toHaveBeenCalledWith(`/agent/subagents/${subAgentId}/commission`, {
        commissionRate: rate,
      })
    })

    test('getMySubAgentsWithCommission should call correct endpoint', async () => {
      const mockData = {
        users: [
          { _id: '123', username: 'SubAgent1', commissionRate: 0.15 },
        ],
      }

      apiService.get.mockResolvedValue(mockData)

      const result = await adminServices.getMySubAgentsWithCommission()

      expect(apiService.get).toHaveBeenCalledWith('/agent/subagents_with_commission')
      expect(result).toEqual(mockData)
    })

    test('setMySubAgentCommission should convert percentage to decimal', async () => {
      const subAgentId = '123'
      const rate = 25

      apiService.patch.mockResolvedValue({ success: true })

      await adminServices.setMySubAgentCommission(subAgentId, rate)

      expect(apiService.patch).toHaveBeenCalledWith(`/agent/subagents/${subAgentId}/commission`, {
        commissionRate: 25,
      })
    })
  })

  describe('SubAdmin Commission Methods', () => {
    test('setMyUserCommission should call correct endpoint', async () => {
      const userId = '456'
      const rate = 20

      apiService.patch.mockResolvedValue({ success: true })

      await adminServices.setMyUserCommission(userId, rate)

      expect(apiService.patch).toHaveBeenCalledWith(`/subadmin/users/${userId}/commission`, {
        commissionRate: rate,
      })
    })

    test('getMyUsersWithCommission should call correct endpoint', async () => {
      const mockData = {
        users: [
          { _id: '456', username: 'User1', role: 'affiliate', commissionRate: 0.20 },
          { _id: '457', username: 'Agent1', role: 'agent', commissionRate: 0.15 },
        ],
      }

      apiService.get.mockResolvedValue(mockData)

      const result = await adminServices.getMyUsersWithCommission()

      expect(apiService.get).toHaveBeenCalledWith('/subadmin/users_with_commission')
      expect(result).toEqual(mockData)
    })
  })

  describe('Error Handling', () => {
    test('setMySubAgentCommission should propagate errors', async () => {
      const error = new Error('API Error')
      apiService.patch.mockRejectedValue(error)

      await expect(adminServices.setMySubAgentCommission('123', 15)).rejects.toThrow('API Error')
    })

    test('getMySubAgentsWithCommission should propagate errors', async () => {
      const error = new Error('Network Error')
      apiService.get.mockRejectedValue(error)

      await expect(adminServices.getMySubAgentsWithCommission()).rejects.toThrow('Network Error')
    })
  })

  describe('Response Handling', () => {
    test('should handle successful commission update response', async () => {
      const response = {
        message: 'Commission updated',
        user: {
          _id: '123',
          username: 'SubAgent1',
          commissionRate: 0.25,
        },
      }

      apiService.patch.mockResolvedValue(response)

      const result = await adminServices.setMySubAgentCommission('123', 25)

      expect(result).toEqual(response)
      expect(result.user.commissionRate).toBe(0.25)
    })

    test('should handle array response from get methods', async () => {
      const response = {
        users: [
          { _id: '123', username: 'SubAgent1', commissionRate: 0.15 },
          { _id: '124', username: 'SubAgent2', commissionRate: 0.20 },
        ],
      }

      apiService.get.mockResolvedValue(response)

      const result = await adminServices.getMySubAgentsWithCommission()

      expect(Array.isArray(result.users)).toBe(true)
      expect(result.users.length).toBe(2)
    })
  })
})
