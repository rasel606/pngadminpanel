import React from 'react'
import { useLocation } from 'react-router-dom'
import BaseWidthrawalView from '../widthrawalView/BaseWidthrawalView'
import { subAdminServices } from '../../service/subAdminServices'
import { adminServices } from '../../service/adminServices'

const SubAdminDeposit = () => {
  const { pathname } = useLocation()
  let storedUser = {}
  try {
    storedUser = JSON.parse(localStorage.getItem('admin_auth_user') || '{}')
  } catch {
    storedUser = {}
  }
  const role = String(storedUser?.role || storedUser?.userType || '').toLowerCase()
  const isSubAdminAuth = role === 'subadmin' || role === 'sub_admin'
  const isSubAdminRoute = pathname.startsWith('/subAdmin/') && isSubAdminAuth
  const isSubAgentRoute = pathname.toLowerCase().includes('subagent')
  const isAffiliateRoute = pathname.toLowerCase().includes('affiliate')

  const fetchTransactions = isSubAdminRoute
    ? isAffiliateRoute
      ? subAdminServices.GetAffiliatePendingDepositList
      : isSubAgentRoute
        ? subAdminServices.GetSubAgentPendingDepositList
        : subAdminServices.GetAgentPendingDepositList
    : adminServices.AgentDepositList

  return (
    <BaseWidthrawalView
      title="Admin Withdrawal Management"
      fetchTransactions={fetchTransactions}
      updateTransactionStatus={adminServices.updateDepositwidthrowalStatus}
    />
  )
}

export default SubAdminDeposit
