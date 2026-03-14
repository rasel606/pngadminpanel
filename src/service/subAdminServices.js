// src/service/getWayService.js
import { apiService } from './api'

const isAuthError = (error) => {
  const status = error?.status
  const message = String(error?.message || '').toLowerCase()
  return status === 401 || status === 403 || message.includes('token') || message.includes('unauthorized')
}

const buildEmptyListResponse = (params = {}) => ({
  success: false,
  data: [],
  pagination: {
    page: Number(params.page) || 1,
    limit: Number(params.limit) || 10,
    total: 0,
    totalPages: 0,
  },
})

const getWithFallback = async (
  primaryEndpoint,
  params = {},
  { fallbackEndpoint, emptyOnAuthError = false } = {},
) => {
  try {
    return await apiService.get(primaryEndpoint, params)
  } catch (error) {
    if (fallbackEndpoint) {
      try {
        return await apiService.get(fallbackEndpoint, params)
      } catch (fallbackError) {
        if (emptyOnAuthError && isAuthError(fallbackError)) {
          return buildEmptyListResponse(params)
        }
        throw fallbackError
      }
    }

    if (emptyOnAuthError && isAuthError(error)) {
      return buildEmptyListResponse(params)
    }

    throw error
  }
}

export const subAdminServices = {
  SubAdminList: async (params = {}) => {
    // ✅ use GET with query params
    const response = await apiService.get('/admin/get_sub_adminList', params)
    return response // apiService.get already returns parsed JSON
  },
  SubAdminUserList: async (params = {}) => {
    // ✅ use GET with query params
    const response = await apiService.get('/admin/get_sub_admin_user_list', params)
    return response.data // apiService.get already returns parsed JSON
  },
  SubAdminDepositList: async (params = {}) => {
    // ✅ use GET with query params
    const response = await apiService.get('/admin/get_sub_admin_pending_deposit_user_list', params)
    return response.data // apiService.get already returns parsed JSON
  },
  SubAdminWithdrawList: async (params = {}) => {
    // ✅ use GET with query params
    const response = await apiService.get('/admin/get_sub_admin_withdraw_deposit_user_list', params)
    return response.data // apiService.get already returns parsed JSON
  },
  SubAdminAffiliateList: async (params = {}) => {
    // ✅ use GET with query params
    const response = await apiService.get('/admin/get_sub_admin_affiliateList', params)
    return response // apiService.get already returns parsed JSON
  },

  // -------- Sub-admin own downline management --------
  GetAgentList: async (params = {}) => {
    return getWithFallback('/subadmin/get_agent_List', params, {
      fallbackEndpoint: '/admin/get_admin_agent_list',
      emptyOnAuthError: true,
    })
  },

  GetAgentUserList: async (params = {}) => {
    return getWithFallback('/subadmin/sub_agent_deposit_transactions_user', params, {
      fallbackEndpoint: '/admin/get_admin_agent_user_list',
      emptyOnAuthError: true,
    })
  },

  GetAgentPendingDepositList: async (params = {}) => {
    return getWithFallback('/subadmin/get_agent_pending_deposit_list', params, {
      fallbackEndpoint: '/admin/get_admin_agent_user_pending_deposit_user_list',
      emptyOnAuthError: true,
    })
  },

  GetAgentPendingWidthrawalList: async (params = {}) => {
    return getWithFallback('/subadmin/get_agent_pending_widthrow_list', params, {
      fallbackEndpoint: '/admin/get_admin_agent_user_withdraw__user_list',
      emptyOnAuthError: true,
    })
  },

  GetSubAgentList: async (params = {}) => {
    return getWithFallback('/subadmin/get_sub_agent_List', params, { emptyOnAuthError: true })
  },

  GetSubAgentUserList: async (params = {}) => {
    try {
      return await getWithFallback('/subadmin/get_sub_agent_user_List', params, {
        emptyOnAuthError: true,
      })
    } catch (error) {
      if (isAuthError(error)) {
        return buildEmptyListResponse(params)
      }
      // fallback for legacy typo route in backend
      return getWithFallback('/subadmin/get_sub_agent_usert_List', params, { emptyOnAuthError: true })
    }
  },

  GetSubAgentPendingDepositList: async (params = {}) => {
    return getWithFallback('/subadmin/get_sub_agent_pending_deposit_List', params, {
      emptyOnAuthError: true,
    })
  },

  GetSubAgentPendingWidthrawalList: async (params = {}) => {
    return getWithFallback('/subadmin/get_sub_agent_pending_widthrow_List', params, {
      emptyOnAuthError: true,
    })
  },

  GetAffiliateList: async (params = {}) => {
    try {
      return await getWithFallback('/subadmin/get_affiliate_List', params, {
        fallbackEndpoint: '/admin/get_admin_affiliateList',
        emptyOnAuthError: true,
      })
    } catch (error) {
      if (isAuthError(error)) {
        return buildEmptyListResponse(params)
      }
      // fallback for legacy double-underscore route in backend
      return getWithFallback('/subadmin/get_affiliate__List', params, {
        fallbackEndpoint: '/admin/get_admin_affiliateList',
        emptyOnAuthError: true,
      })
    }
  },

  GetAffiliateUserList: async (params = {}) => {
    return getWithFallback('/subadmin/get_affiliate_user_List', params, {
      fallbackEndpoint: '/admin/get_admin_UserList',
      emptyOnAuthError: true,
    })
  },

  GetAffiliatePendingDepositList: async (params = {}) => {
    return getWithFallback('/subadmin/get_affiliate_pending_deposit_List', params, {
      emptyOnAuthError: true,
    })
  },

  GetAffiliatePendingWidthrawalList: async (params = {}) => {
    return getWithFallback('/subadmin/get_affiliate_pending_widthrow_List', params, {
      emptyOnAuthError: true,
    })
  },

  //   searchTransactionsWidthrawal: async (params = {}) => {
  //     // ✅ use GET with query params
  //     const response = await apiService.get('/transactions/search_Widthrawal_transactions', params);
  //     return response; // apiService.get already returns parsed JSON
  //   },
  //   TransactionsDepositGetways: async (params = {}) => {
  //     // ✅ use GET with query params
  //     const response = await apiService.get('/transactions/search_deposit_getways', params);
  //     return response; // apiService.get already returns parsed JSON
  //   },
  //   TransactionsWEidthrawalGetways: async (params = {}) => {
  //     // ✅ use GET with query params
  //     const response = await apiService.get('/transactions/search_widthrawal_getways', params);
  //     return response; // apiService.get already returns parsed JSON
  //   },

  //   updateDepositStatus: async (transactionId, userId, status) => {
  //     const response = await apiService.put(`/transactions/update-deposit/${transactionId}/status/${userId}`, { status });
  //     return response;
  //   },
  //   updateDepositStatus: async (transactionId, userId, status) => {
  //     const response = await apiService.put(`/transactions/update-deposit/${transactionId}/status/${userId}`, { status });
  //     return response;
  //   },

  //   getDepositTotals: async (referredBy) => {
  //     const response = await apiService.get('/transactions/deposit-totals', { referredBy });
  //     return response;
  //   },

  // getTotalDeposit: async (referredBy) => {
  //   const response = await apiService.get('/transactions/total-deposit', { referredBy });
  //   return response;
  // }
}
