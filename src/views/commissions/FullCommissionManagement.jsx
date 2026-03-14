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
  CTabs,
  CTabPane,
  CTabContent,
  CTabList,
  CTab,
} from '@coreui/react'
import { adminServices } from 'src/service/adminServices'
import { debounce } from 'lodash'

const FullCommissionManagement = () => {
  // Agent state
  const [agents, setAgents] = useState([])
  const [agentsLoading, setAgentsLoading] = useState(true)
  const [agentsError, setAgentsError] = useState('')
  const [agentsSuccess, setAgentsSuccess] = useState('')
  const [agentsSearch, setAgentsSearch] = useState('')
  const [agentsPagination, setAgentsPagination] = useState({ page: 1, limit: 10, total: 0 })

  // SubAgent state
  const [subAgents, setSubAgents] = useState([])
  const [subAgentsLoading, setSubAgentsLoading] = useState(true)
  const [subAgentsError, setSubAgentsError] = useState('')
  const [subAgentsSuccess, setSubAgentsSuccess] = useState('')
  const [subAgentsSearch, setSubAgentsSearch] = useState('')
  const [subAgentsPagination, setSubAgentsPagination] = useState({ page: 1, limit: 10, total: 0 })

  // Fetch Agents
  const fetchAgents = useCallback(
    async (page = 1, search = '') => {
      setAgentsLoading(true)
      setAgentsError('')
      try {
        const params = { page, limit: agentsPagination.limit, search }
        const response = await adminServices.getAgentsWithCommission(params)
        setAgents(
          response.data.data.map((agent) => ({
            ...agent,
            editableCommission: agent.commissionRate || 0,
          })),
        )
        setAgentsPagination({
          page: response.data.page || page,
          limit: response.data.limit || agentsPagination.limit,
          total: response.data.total || 0,
        })
      } catch (err) {
        setAgentsError('Failed to fetch agents. Please try again.')
        console.error(err)
      } finally {
        setAgentsLoading(false)
      }
    },
    [agentsPagination.limit],
  )

  // Fetch SubAgents
  const fetchSubAgents = useCallback(
    async (page = 1, search = '') => {
      setSubAgentsLoading(true)
      setSubAgentsError('')
      try {
        const params = { page, limit: subAgentsPagination.limit, search }
        const response = await adminServices.getSubAgentsWithCommission(params)
        setSubAgents(
          response.data.data.map((subAgent) => ({
            ...subAgent,
            editableCommission: subAgent.commissionRate || 0,
          })),
        )
        setSubAgentsPagination({
          page: response.data.page || page,
          limit: response.data.limit || subAgentsPagination.limit,
          total: response.data.total || 0,
        })
      } catch (err) {
        setSubAgentsError('Failed to fetch sub-agents. Please try again.')
        console.error(err)
      } finally {
        setSubAgentsLoading(false)
      }
    },
    [subAgentsPagination.limit],
  )

  useEffect(() => {
    fetchAgents(agentsPagination.page, agentsSearch)
  }, [fetchAgents, agentsPagination.page, agentsSearch])

  useEffect(() => {
    fetchSubAgents(subAgentsPagination.page, subAgentsSearch)
  }, [fetchSubAgents, subAgentsPagination.page, subAgentsSearch])

  // Handle Agent Commission Change
  const handleAgentCommissionChange = (id, value) => {
    setAgents(
      agents.map((agent) =>
        agent._id === id ? { ...agent, editableCommission: parseFloat(value) || 0 } : agent,
      ),
    )
  }

  // Handle SubAgent Commission Change
  const handleSubAgentCommissionChange = (id, value) => {
    setSubAgents(
      subAgents.map((subAgent) =>
        subAgent._id === id ? { ...subAgent, editableCommission: parseFloat(value) || 0 } : subAgent,
      ),
    )
  }

  // Save Agent Commission
  const handleSaveAgentCommission = async (agentId, commissionRate) => {
    setAgentsSuccess('')
    setAgentsError('')
    try {
      await adminServices.setAgentCommission(agentId, commissionRate)
      setAgentsSuccess(`Commission for agent updated successfully!`)
      setAgents(
        agents.map((agent) =>
          agent._id === agentId ? { ...agent, commissionRate: commissionRate } : agent,
        ),
      )
    } catch (err) {
      setAgentsError(`Failed to update commission for agent.`)
      console.error(err)
    }
  }

  // Save SubAgent Commission
  const handleSaveSubAgentCommission = async (subAgentId, commissionRate) => {
    setSubAgentsSuccess('')
    setSubAgentsError('')
    try {
      await adminServices.setSubAgentCommission(subAgentId, commissionRate)
      setSubAgentsSuccess(`Commission for sub-agent updated successfully!`)
      setSubAgents(
        subAgents.map((subAgent) =>
          subAgent._id === subAgentId ? { ...subAgent, commissionRate: commissionRate } : subAgent,
        ),
      )
    } catch (err) {
      setSubAgentsError(`Failed to update commission for sub-agent.`)
      console.error(err)
    }
  }

  const debouncedAgentsSearch = useCallback(debounce(setAgentsSearch, 300), [])
  const debouncedSubAgentsSearch = useCallback(debounce(setSubAgentsSearch, 300), [])

  const agentsTotalPages = Math.ceil(agentsPagination.total / agentsPagination.limit)
  const subAgentsTotalPages = Math.ceil(subAgentsPagination.total / subAgentsPagination.limit)

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Commission Management</strong>
          </CCardHeader>
          <CCardBody>
            <CTabs activeTab="agents">
              <CTabList variant="tabs">
                <CTab aria-controls="agents" tabKey="agents">
                  Agents
                </CTab>
                <CTab aria-controls="subagents" tabKey="subagents">
                  Sub-Agents
                </CTab>
              </CTabList>
              <CTabContent>
                {/* Agents Tab */}
                <CTabPane aria-labelledby="agents" tabKey="agents">
                  <CRow className="mt-3">
                    <CCol md={4}>
                      <CFormInput
                        type="search"
                        placeholder="Search by agent name or ID..."
                        onChange={(e) => debouncedAgentsSearch(e.target.value)}
                      />
                    </CCol>
                  </CRow>
                  {agentsError && <CAlert color="danger" className="mt-3">{agentsError}</CAlert>}
                  {agentsSuccess && <CAlert color="success" className="mt-3">{agentsSuccess}</CAlert>}
                  {agentsLoading ? (
                    <div className="text-center mt-5">
                      <CSpinner />
                    </div>
                  ) : (
                    <>
                      <CTable align="middle" className="mb-0 border mt-3" hover responsive>
                        <CTableHead color="light">
                          <CTableRow>
                            <CTableHeaderCell>Agent ID</CTableHeaderCell>
                            <CTableHeaderCell>Name</CTableHeaderCell>
                            <CTableHeaderCell>Email</CTableHeaderCell>
                            <CTableHeaderCell width="20%">Commission Rate (%)</CTableHeaderCell>
                            <CTableHeaderCell width="15%">Action</CTableHeaderCell>
                          </CTableRow>
                        </CTableHead>
                        <CTableBody>
                          {agents.map((agent) => (
                            <CTableRow key={agent._id}>
                              <CTableDataCell>{agent.userId}</CTableDataCell>
                              <CTableDataCell>{agent.name || 'N/A'}</CTableDataCell>
                              <CTableDataCell>{agent.email || 'N/A'}</CTableDataCell>
                              <CTableDataCell>
                                <CFormInput
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.1"
                                  value={agent.editableCommission}
                                  onChange={(e) => handleAgentCommissionChange(agent._id, e.target.value)}
                                />
                              </CTableDataCell>
                              <CTableDataCell>
                                <CButton
                                  color="primary"
                                  size="sm"
                                  onClick={() => handleSaveAgentCommission(agent._id, agent.editableCommission)}
                                >
                                  Save
                                </CButton>
                              </CTableDataCell>
                            </CTableRow>
                          ))}
                        </CTableBody>
                      </CTable>
                      <CPagination className="mt-3" aria-label="Agents pagination">
                        {Array.from({ length: agentsTotalPages }, (_, i) => i + 1).map((page) => (
                          <CPaginationItem
                            key={page}
                            active={page === agentsPagination.page}
                            onClick={() => setAgentsPagination((p) => ({ ...p, page }))}
                          >
                            {page}
                          </CPaginationItem>
                        ))}
                      </CPagination>
                    </>
                  )}
                                {/* SubAgents</CTabPane>

 Tab */}
                <CTabPane aria-labelledby="subagents" tabKey="subagents">
                  <CRow className="mt-3">
                    <CCol md={4}>
                      <CFormInput
                        type="search"
                        placeholder="Search by sub-agent name or ID..."
                        onChange={(e) => debouncedSubAgentsSearch(e.target.value)}
                      />
                    </CCol>
                  </CRow>
                  {subAgentsError && <CAlert color="danger" className="mt-3">{subAgentsError}</CAlert>}
                  {subAgentsSuccess && <CAlert color="success" className="mt-3">{subAgentsSuccess}</CAlert>}
                  {subAgentsLoading ? (
                    <div className="text-center mt-5">
                      <CSpinner />
                    </div>
                  ) : (
                    <>
                      <CTable align="middle" className="mb-0 border mt-3" hover responsive>
                        <CTableHead color="light">
                          <CTableRow>
                            <CTableHeaderCell>Sub-Agent ID</CTableHeaderCell>
                            <CTableHeaderCell>Name</CTableHeaderCell>
                            <CTableHeaderCell>Email</CTableHeaderCell>
                            <CTableHeaderCell width="20%">Commission Rate (%)</CTableHeaderCell>
                            <CTableHeaderCell width="15%">Action</CTableHeaderCell>
                          </CTableRow>
                        </CTableHead>
                        <CTableBody>
                          {subAgents.map((subAgent) => (
                            <CTableRow key={subAgent._id}>
                              <CTableDataCell>{subAgent.userId}</CTableDataCell>
                              <CTableDataCell>{subAgent.name || 'N/A'}</CTableDataCell>
                              <CTableDataCell>{subAgent.email || 'N/A'}</CTableDataCell>
                              <CTableDataCell>
                                <CFormInput
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.1"
                                  value={subAgent.editableCommission}
                                  onChange={(e) => handleSubAgentCommissionChange(subAgent._id, e.target.value)}
                                />
                              </CTableDataCell>
                              <CTableDataCell>
                                <CButton
                                  color="primary"
                                  size="sm"
                                  onClick={() => handleSaveSubAgentCommission(subAgent._id, subAgent.editableCommission)}
                                >
                                  Save
                                </CButton>
                              </CTableDataCell>
                            </CTableRow>
                          ))}
                        </CTableBody>
                      </CTable>
                      <CPagination className="mt-3" aria-label="SubAgents pagination">
                        {Array.from({ length: subAgentsTotalPages }, (_, i) => i + 1).map((page) => (
                          <CPaginationItem
                            key={page}
                            active={page === subAgentsPagination.page}
                            onClick={() => setSubAgentsPagination((p) => ({ ...p, page }))}
                          >
                            {page}
                          </CPaginationItem>
                        ))}
                      </CPagination>
                    </>
                  )}
                </CTabPane>
              </CTabContent>
            </CTabs>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default FullCommissionManagement

