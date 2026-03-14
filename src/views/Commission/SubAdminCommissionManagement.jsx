import React, { useState, useEffect, useCallback } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CForm,
  CFormInput,
  CSpinner,
  CAlert,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CBadge,
  CFormSelect,
} from '@coreui/react'
import { adminServices } from 'src/service/adminServices'

const SubAdminCommissionManagement = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editRate, setEditRate] = useState(0)
  const [alert, setAlert] = useState({ show: false, type: '', message: '' })
  const [saveLoading, setSaveLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all') // 'all', 'affiliate', 'agent', 'sub-agent'

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const response = await adminServices.getMyUsersWithCommission()
      if (response && response.users) {
        setUsers(response.users)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      setAlert({ show: true, type: 'danger', message: 'Failed to load users' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleEditClick = (user) => {
    setEditingId(user._id)
    setEditRate(Math.round((user.commissionRate || 0) * 100))
    setShowModal(true)
  }

  const handleSaveCommission = async () => {
    if (editRate < 0 || editRate > 100) {
      setAlert({ show: true, type: 'warning', message: 'Commission rate must be between 0-100%' })
      return
    }

    setSaveLoading(true)
    setAlert({ show: false })

    try {
      await adminServices.setMyUserCommission(editingId, editRate)
      setAlert({ show: true, type: 'success', message: 'Commission rate updated successfully!' })
      setShowModal(false)
      await fetchUsers()
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update commission'
      setAlert({ show: true, type: 'danger', message: errorMessage })
    } finally {
      setSaveLoading(false)
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.userId?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  if (loading) {
    return (
      <CRow className="justify-content-center">
        <CCol xs={12} className="text-center p-5">
          <CSpinner color="primary" />
        </CCol>
      </CRow>
    )
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Commission Management</strong>
            <p className="text-muted small mb-0 mt-2">
              Set and manage commission rates for your affiliates, agents, and sub-agents.
            </p>
          </CCardHeader>
          <CCardBody>
            {alert.show && <CAlert color={alert.type}>{alert.message}</CAlert>}

            <CRow className="mb-4">
              <CCol md={4}>
                <CFormInput
                  type="text"
                  placeholder="Search by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </CCol>
              <CCol md={4}>
                <CFormSelect
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="all">All Roles</option>
                  <option value="affiliate">Affiliates</option>
                  <option value="agent">Agents</option>
                  <option value="sub-agent">Sub-Agents</option>
                </CFormSelect>
              </CCol>
              <CCol md={4} className="text-end">
                <CButton color="info" onClick={fetchUsers} disabled={loading}>
                  {loading ? <CSpinner size="sm" /> : 'Refresh'}
                </CButton>
              </CCol>
            </CRow>

            {filteredUsers.length === 0 ? (
              <div className="text-center text-muted p-5">
                <p>No users found. Create affiliates, agents, or sub-agents to manage their rates.</p>
              </div>
            ) : (
              <CTable align="middle" className="mb-0 border" hover responsive>
                <CTableHead color="light">
                  <CTableRow>
                    <CTableHeaderCell>User ID</CTableHeaderCell>
                    <CTableHeaderCell>Username</CTableHeaderCell>
                    <CTableHeaderCell>Role</CTableHeaderCell>
                    <CTableHeaderCell>Commission Rate</CTableHeaderCell>
                    <CTableHeaderCell>Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {filteredUsers.map((user) => (
                    <CTableRow key={user._id}>
                      <CTableDataCell>
                        <strong>{user.userId || 'N/A'}</strong>
                      </CTableDataCell>
                      <CTableDataCell>{user.username || 'N/A'}</CTableDataCell>
                      <CTableDataCell>
                        <CBadge
                          color={
                            user.role === 'affiliate'
                              ? 'info'
                              : user.role === 'agent'
                                ? 'warning'
                                : 'danger'
                          }
                        >
                          {user.role}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CBadge color={user.commissionRate > 0 ? 'success' : 'secondary'}>
                          {Math.round((user.commissionRate || 0) * 100)}%
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CButton
                          color="warning"
                          size="sm"
                          onClick={() => handleEditClick(user)}
                          disabled={saveLoading}
                        >
                          Edit
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            )}
          </CCardBody>
        </CCard>
      </CCol>

      {/* Edit Commission Modal */}
      <CModal visible={showModal} onClose={() => setShowModal(false)}>
        <CModalHeader>
          <CModalTitle>Update Commission Rate</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <div className="mb-3">
              <label className="form-label">Commission Rate (%)</label>
              <CFormInput
                type="number"
                value={editRate}
                onChange={(e) => setEditRate(Number(e.target.value))}
                min="0"
                max="100"
                step="0.1"
              />
              <small className="text-muted">Enter a value between 0 and 100</small>
            </div>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowModal(false)} disabled={saveLoading}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={handleSaveCommission} disabled={saveLoading}>
            {saveLoading ? <CSpinner size="sm" /> : 'Save Changes'}
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default SubAdminCommissionManagement
