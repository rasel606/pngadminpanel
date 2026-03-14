import React from 'react'
import BaseUserManagementView from '../UserManagement/BaseUserManagementView'
import { subAdminServices } from '../../service/subAdminServices'
import { adminServices } from '../../service/adminServices'

const SubAdminAgentUserList = () => {
  let storedUser = {}
  try {
    storedUser = JSON.parse(localStorage.getItem('admin_auth_user') || '{}')
  } catch {
    storedUser = {}
  }
  const role = String(storedUser?.role || storedUser?.userType || '').toLowerCase()
  const isSubAdminAuth = role === 'subadmin' || role === 'sub_admin'

  return (
    <BaseUserManagementView
      title="Sub-Admin Agent User Management"
      fetchUsers={isSubAdminAuth ? subAdminServices.GetAgentUserList : adminServices.AgentUserList}
      updateUserStatus={adminServices.updateUserStatus}
    />
  )
}

export default SubAdminAgentUserList