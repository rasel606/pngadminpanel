import React, { useState, useEffect, useCallback } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CButton,
  CFormInput,
  CSpinner,
  CAlert,
  CPagination,
  CPaginationItem,
} from '@coreui/react'
import { adminServices } from 'src/service/adminServices'
import { debounce } from 'lodash'

const CommissionManagement = () => {
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 })

  const fetchAgents = useCallback(
    async (page = 1, search = '') => {
      setLoading(true)
      setError('')
      try {
        const params = { page, limit: pagination.limit, search }
        const response = await adminServices.AgentList(params)
        setAgents(
          response.data.data.map((agent) => ({
            ...agent,
            editableCommission: agent.commissionRate || 0,
          })),
        )
        setPagination({
          page: response.data.page,
          limit: response.data.limit,
          total: response.data.total,
        })
      } catch (err) {
        setError('Failed to fetch agents. Please try again.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    },
    [pagination.limit],
  )

  useEffect(() => {
    fetchAgents(pagination.page, searchTerm)
  }, [fetchAgents, pagination.page, searchTerm])

  const handleCommissionChange = (id, value) => {
    setAgents(
      agents.map((agent) =>
        agent._id === id ? { ...agent, editableCommission: parseFloat(value) || 0 } : agent,
      ),
    )
  }

  const handleSaveCommission = async (agentId, commissionRate) => {
    setSuccess('')
    setError('')
    try {
      await adminServices.setAgentCommission(agentId, commissionRate)
      setSuccess(`Commission for agent ${agentId} updated successfully!`)
      // Optionally re-fetch or just update local state to reflect saved state
      setAgents(
        agents.map((agent) =>
          agent._id === agentId ? { ...agent, commissionRate: commissionRate } : agent,
        ),
      )
    } catch (err) {
      setError(`Failed to update commission for agent ${agentId}.`)
      console.error(err)
    }
  }

  const debouncedSearch = useCallback(debounce(setSearchTerm, 300), [])

  const totalPages = Math.ceil(pagination.total / pagination.limit)

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Agent Commission Management</strong>
          </CCardHeader>
          <CCardBody>
            {error && <CAlert color="danger">{error}</CAlert>}
            {success && <CAlert color="success">{success}</CAlert>}
            <CRow className="mb-3">
              <CCol md={4}>
                <CFormInput
                  type="search"
                  placeholder="Search by agent name or ID..."
                  onChange={(e) => debouncedSearch(e.target.value)}
                />
              </CCol>
            </CRow>
            {loading ? (
              <div className="text-center">
                <CSpinner />
              </div>
            ) : (
              <>
                <CTable align="middle" className="mb-0 border" hover responsive>
                  <CTableHead color="light">
                    <CTableRow>
                      <CTableHeaderCell>Agent ID</CTableHeaderCell>
                      <CTableHeaderCell>Name</CTableHeaderCell>
                      <CTableHeaderCell>Role</CTableHeaderCell>
                      <CTableHeaderCell width="20%">Commission Rate (%)</CTableHeaderCell>
                      <CTableHeaderCell width="15%">Action</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {agents.map((agent) => (
                      <CTableRow key={agent._id}>
                        <CTableDataCell>{agent.userId}</CTableDataCell>
                        <CTableDataCell>{agent.name}</CTableDataCell>
                        <CTableDataCell>{agent.role}</CTableDataCell>
                        <CTableDataCell>
                          <CFormInput
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={agent.editableCommission}
                            onChange={(e) => handleCommissionChange(agent._id, e.target.value)}
                          />
                        </CTableDataCell>
                        <CTableDataCell>
                          <CButton
                            color="primary"
                            size="sm"
                            onClick={() => handleSaveCommission(agent._id, agent.editableCommission)}
                          >
                            Save
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
                <CPagination className="mt-3">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <CPaginationItem key={page} active={page === pagination.page} onClick={() => setPagination(p => ({...p, page}))}>{page}</CPaginationItem>
                  ))}
                </CPagination>
              </>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default CommissionManagement