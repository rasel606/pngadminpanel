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
  CFormSelect,
  CFormTextarea,
  CSpinner,
  CAlert,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CPagination,
  CPaginationItem,
} from '@coreui/react'
import { adminServices } from 'src/service/adminServices'

const SubAdminBalanceTransfer = () => {
  const [subAdmins, setSubAdmins] = useState([])
  const [transfers, setTransfers] = useState([])
  const [loading, setLoading] = useState(true)
  const [formLoading, setFormLoading] = useState(false)
  const [alert, setAlert] = useState({ show: false, type: '', message: '' })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  })

  const [formData, setFormData] = useState({
    subAdminId: '',
    amount: '',
    notes: '',
  })

  const fetchSubAdmins = useCallback(async () => {
    try {
      const response = await adminServices.AdminAgentList({ role: 'subAdmin' }) // Assuming this fetches sub-admins
      if (response && response.data) {
        setSubAdmins(response.data)
      }
    } catch (error) {
      console.error('Error fetching sub-admins:', error)
    }
  }, [])

  const fetchTransfers = useCallback(async (page = 1, limit = 10) => {
    try {
      const response = await adminServices.getSubAdminBalanceTransfers({ page, limit })
      if (response && response.data) {
        setTransfers(response.data)
        if (response.pagination) {
          setPagination(response.pagination)
        }
      }
    } catch (error) {
      console.error('Error fetching transfers:', error)
    }
  }, [])

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchSubAdmins(), fetchTransfers(pagination.page, pagination.limit)])
      setLoading(false)
    }
    loadData()
  }, [fetchSubAdmins, fetchTransfers, pagination.page, pagination.limit])

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages && newPage !== pagination.page) {
      setPagination((prev) => ({ ...prev, page: newPage }))
    }
  }

  const handleItemsPerPageChange = (e) => {
    const newLimit = parseInt(e.target.value, 10)
    setPagination({ ...pagination, page: 1, limit: newLimit })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setAlert({ show: false })

    try {
      await adminServices.transferBalanceToSubAdmin({
        ...formData,
        amount: Number(formData.amount),
      })
      setAlert({ show: true, type: 'success', message: 'Balance transferred successfully!' })
      setFormData({ subAdminId: '', amount: '', notes: '' }) // Reset form
      fetchTransfers(1, pagination.limit) // Refresh list to page 1
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'An error occurred.'
      setAlert({ show: true, type: 'danger', message: errorMessage })
    } finally {
      setFormLoading(false)
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Admin to Sub-Admin Balance Transfer</strong>
          </CCardHeader>
          <CCardBody>
            {alert.show && <CAlert color={alert.type}>{alert.message}</CAlert>}
            <CForm onSubmit={handleSubmit}>
              <CRow className="mb-3">
                <CCol md={4}>
                  <CFormSelect
                    id="subAdminId"
                    name="subAdminId"
                    label="Select Sub-Admin"
                    value={formData.subAdminId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Choose...</option>
                    {subAdmins.map((sa) => (
                      <option key={sa._id} value={sa._id}>
                        {sa.username} ({sa.userId})
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol md={4}>
                  <CFormInput
                    type="number"
                    id="amount"
                    name="amount"
                    label="Amount"
                    placeholder="e.g., 1000"
                    value={formData.amount}
                    onChange={handleInputChange}
                    required
                    min="1"
                  />
                </CCol>
                <CCol md={4}>
                  <CFormTextarea
                    id="notes"
                    name="notes"
                    label="Notes (Optional)"
                    rows={1}
                    value={formData.notes}
                    onChange={handleInputChange}
                  ></CFormTextarea>
                </CCol>
              </CRow>
              <CButton type="submit" color="primary" disabled={formLoading}>
                {formLoading ? <CSpinner size="sm" /> : 'Transfer Balance'}
              </CButton>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Transfer History</strong>
          </CCardHeader>
          <CCardBody>
            {loading ? (
              <CSpinner />
            ) : (
              <CTable align="middle" className="mb-0 border" hover responsive>
                <CTableHead color="light">
                  <CTableRow>
                    <CTableHeaderCell>Date</CTableHeaderCell>
                    <CTableHeaderCell>From</CTableHeaderCell>
                    <CTableHeaderCell>To (Sub-Admin)</CTableHeaderCell>
                    <CTableHeaderCell>Amount</CTableHeaderCell>
                    <CTableHeaderCell>Notes</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {transfers.length > 0 ? (
                    transfers.map((item) => (
                      <CTableRow v-for="item in tableItems" key={item._id}>
                        <CTableDataCell>
                          {new Date(item.createdAt).toLocaleString()}
                        </CTableDataCell>
                        <CTableDataCell>{item.from?.username || 'Admin'}</CTableDataCell>
                        <CTableDataCell>{item.to?.username}</CTableDataCell>
                        <CTableDataCell>
                          <strong>{item.amount.toFixed(2)}</strong>
                        </CTableDataCell>
                        <CTableDataCell>{item.notes || '-'}</CTableDataCell>
                        <CTableDataCell>{item.status}</CTableDataCell>
                      </CTableRow>
                    ))
                  ) : (
                    <CTableRow>
                      <CTableDataCell colSpan="6" className="text-center">
                        No transfer history found.
                      </CTableDataCell>
                    </CTableRow>
                  )}
                </CTableBody>
              </CTable>
            )}
            {pagination.total > 0 && !loading && (
              <CRow className="mt-4 align-items-center">
                <CCol xs={12} md={4} className="mb-3 mb-md-0">
                  <div className="d-flex align-items-center">
                    <span className="me-2">Show</span>
                    <CFormSelect
                      value={pagination.limit}
                      onChange={handleItemsPerPageChange}
                      style={{ width: '80px' }}
                    >
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="50">50</option>
                    </CFormSelect>
                    <span className="ms-2">entries</span>
                  </div>
                </CCol>
                <CCol xs={12} md={8}>
                  <div className="d-flex justify-content-md-end align-items-center">
                    <span className="me-3 text-muted small">
                      Page {pagination.page} of {pagination.totalPages} ({pagination.total} total
                      items)
                    </span>
                    <CPagination aria-label="Page navigation">
                      <CPaginationItem
                        disabled={pagination.page === 1}
                        onClick={() => handlePageChange(pagination.page - 1)}
                      >
                        Previous
                      </CPaginationItem>
                      <CPaginationItem
                        disabled={pagination.page === pagination.totalPages}
                        onClick={() => handlePageChange(pagination.page + 1)}
                      >
                        Next
                      </CPaginationItem>
                    </CPagination>
                  </div>
                </CCol>
              </CRow>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default SubAdminBalanceTransfer