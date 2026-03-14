// src/service/getWayService.js
import { apiService, transactions } from './api'

const tryGetFromEndpoints = async (endpoints, params = {}, fallbackValue = null) => {
  let lastError

  for (const endpoint of endpoints) {
    try {
      return await apiService.get(endpoint, params)
    } catch (error) {
      lastError = error
    }
  }

  if (fallbackValue !== null) {
    return fallbackValue
  }

  throw lastError || new Error('Request failed for all fallback endpoints')
}

export const getWayService = {
  searchTransactionsDeposit: async (params = {}) => {
    try {
      return await transactions.searchDeposits(params)
    } catch (error) {
      const message = String(error?.message || '').toLowerCase()
      const shouldTryLegacy =
        error?.status === 404 ||
        error?.status >= 500 ||
        message.includes('searchdeposits is not a function') ||
        message.includes('transactionservice.searchdeposits')

      if (!shouldTryLegacy) {
        throw error
      }

      return tryGetFromEndpoints(
        [
          '/transactions/search_deposit_transactions',
          '/transactions/search_Deposit_transactions',
          '/transactions/search_deposit_transaction',
        ],
        params,
      )
    }
  },
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
    return tryGetFromEndpoints(
      [
        '/transactions/search_deposit_getways',
        '/transactions/search_deposit_gateways',
        '/transactions/deposit-gateways/search',
      ],
      params,
      { success: true, transactions: [], count: 0 },
    )
  },
  TransactionsWEidthrawalGetways: async (params = {}) => {
    return tryGetFromEndpoints(
      [
        '/transactions/search_widthrawal_getways',
        '/transactions/search_withdrawal_getways',
        '/transactions/search_withdrawal_gateways',
        '/transactions/withdrawal-gateways/search',
      ],
      params,
      { success: true, transactions: [], count: 0 },
    )
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
