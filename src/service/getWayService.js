// src/service/getWayService.js
import { apiService, transactions } from './api'

export const getWayService = {
  searchTransactionsDeposit: (params) => transactions.searchDeposits(params),
  searchTransactionsWidthrawal: async (params) => {
    const emptyResult = {
      success: true,
      data: [],
      transactions: [],
      pagination: {
        page: Number(params?.page) || 1,
        limit: Number(params?.limit) || 10,
        total: 0,
        totalPages: 0,
      },
      totalAmount: 0,
      totalUsers: 0,
      total: 0,
      count: 0,
    }

    try {
      return await transactions.searchWithdrawals(params)
    } catch (error) {
      const message = String(error?.message || '').toLowerCase()
      const isParentQueryIssue = error?.status === 400 && message.includes('parent not found')

      if (isParentQueryIssue) {
        // Fallback for backends that still expose the legacy withdrawals search route.
        try {
          return await apiService.get('/transactions/search_Widthrawal_transactions', params)
        } catch (fallbackError) {
          const fallbackMessage = String(fallbackError?.message || '').toLowerCase()
          const isSameParentIssue =
            fallbackError?.status === 400 && fallbackMessage.includes('parent not found')

          if (isSameParentIssue) {
            return emptyResult
          }

          throw fallbackError
        }
      }

      throw error
    }
  },
  TransactionsReport: async (params = {}) => {
    // ✅ use GET with query params
    const response = await apiService.get('/admin/get_user_transaction_report', params)
    return response // apiService.get already returns parsed JSON
  },
  TransactionsDepositGetways: async (params = {}) => {
    // ✅ use GET with query params
    const response = await apiService.get('/transactions/search_deposit_getways', params)
    return response // apiService.get already returns parsed JSON
  },
  TransactionsWEidthrawalGetways: async (params = {}) => {
    // ✅ use GET with query params
    const response = await apiService.get('/transactions/search_widthrawal_getways', params)
    return response // apiService.get already returns parsed JSON
  },

  updateDepositStatus: async (transactionID, userId, actionType) => {
    console.log(transactionID, userId, actionType)
    // actionType: 1 = accept, 2 = reject
    const action = actionType === 1 ? 'accept' : 'reject'
    const response = await apiService.post('/transactions/update-deposit-Widthrowal', {
      transactionID,
      userId,
      action,
    })
    return response
  },
  // updateDepositStatus: async (transactionId, userId, status) => {
  //   const response = await apiService.put(`/transactions/update-deposit/${transactionId}/status/${userId}`, { status });
  //   return response;
  // },

  getDepositTotals: async (referredBy) => {
    const response = await apiService.get('/transactions/deposit-totals', { referredBy })
    return response
  },

  // getTotalDeposit: async (referredBy) => {
  //   const response = await apiService.get('/transactions/total-deposit', { referredBy });
  //   return response;
  // }
}
