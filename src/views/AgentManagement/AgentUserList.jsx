import React from 'react'
import { useLocation } from 'react-router-dom'
import BaseUserManagementView from '../UserManagement/BaseUserManagementView'
import { adminServices } from '../../service/adminServices'
import { subAdminServices } from '../../service/subAdminServices'

const AgentUserList = () => {
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

  const fetchUsers = isSubAdminRoute
    ? isAffiliateRoute
      ? subAdminServices.GetAffiliateUserList
      : isSubAgentRoute
        ? subAdminServices.GetSubAgentUserList
        : subAdminServices.GetAgentUserList
    : adminServices.AgentUserList

  return (
    <BaseUserManagementView
      title="User Management"
      fetchUsers={fetchUsers}
      updateUserStatus={adminServices.updateUserStatus}
    />
  )
}

export default AgentUserList
