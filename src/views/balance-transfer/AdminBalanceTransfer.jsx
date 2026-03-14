import React, { useState, useEffect, useCallback } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CForm,
  CFormLabel,
  CFormSelect,
  CFormInput,
  CButton,
  CSpinner,
  CAlert,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CTabs,
  CTabPane,
  CTabContent,
  CTabList,
  CTab,
} from '@coreui/react'
import { adminServices } from 'src/service/adminServices'

const AdminBalanceTransfer = () => {
  // Transfer type: 'subadmin', 'agent', 'subagent'
  const [transferType, setTransferType] = useState('subadmin')
  const [recipients, setRecipients] = useState([])
  const [selectedRecipient, setSelectedRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [history, setHistory] = useState([])
  const [recipientsLoading, setRecipientsLoading] = useState(false)

  // Fetch recipients based on transfer type
  const fetchRecipients = useCallback(async () => {
    setRecipientsLoading(true)
    setError('')
    try {
      let response
      switch (transferType) {
        case 'subadmin':
          response = await adminServices.getUserTransactionsById('', { role: 'subAdmin' })
          break
        case 'agent':
          response = await adminServices.getAgentsWithCommission({ limit: 100 })
          break
        case 'subagent':
          response = await adminServices.getSubAgentsWithCommission({ limit: 100 })
          break
        default:
          response = { data: { data: [] } }
      }
      setRecipients(response.data.data || [])
    } catch (err) {
      setError(`Failed to fetch ${transferType}s.`)
      console.error(err)
    } finally {
      setRecipientsLoading(false)
    }
  }, [transferType])

  // Fetch transfer history
  const fetchHistory = useCallback(async () => {
    try {
      let response
      switch (transferType) {
        case 'subadmin':
          response = await adminServices.getSubAdminBalanceTransfers({ limit: 20 })
          break
        case 'agent':
          response = await adminServices.getAgentBalanceTransfers({ limit: 20 })
          break
        case 'subagent':
          response = await adminServices.getSubAgentBalanceTransfers({ limit: 20 })
          break
        default:
          response = { data: { data: [] } }
      }
      setHistory(response.data.data || [])
    } catch (err) {
      console.error('Failed to fetch history', err)
    }
  }, [transferType])

  useEffect(() => {
    fetchRecipients()
    fetchHistory()
  }, [fetchRecipients, fetchHistory])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedRecipient || !amount || amount <= 0) {
      setError('Please select a recipient and enter a valid amount.')
      return
    }
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      let response
      switch (transferType) {
        case 'subadmin':
          response = await adminServices.transferBalanceToSubAdmin({
            subAdminId: selectedRecipient,
            amount: parseFloat(amount),
            notes,
          })
          break
        case 'agent':
          response = await adminServices.transferBalanceToAgent({
            agentId: selectedRecipient,
            amount: parseFloat(amount),
            notes,
          })
          break
        case 'subagent':
          response = await adminServices.transferBalanceToSubAgent({
            subAgentId: selectedRecipient,
            amount: parseFloat(amount),
            notes,
          })
          break
        default:
          throw new Error('Invalid transfer type')
      }
      setSuccess(response.data.message || `Successfully transferred ${amount}!`)
      setAmount('')
      setNotes('')
      setSelectedRecipient('')
      fetchHistory()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Transfer failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getRecipientLabel = () => {
    switch (transferType) {
      case 'subadmin':
        return 'Select Sub-Admin'
      case 'agent':
        return 'Select Agent'
      case 'subagent':
        return 'Select Sub-Agent'
      default:
        return 'Select Recipient'
    }
  }

  const getRecipientDisplayName = (recipient) => {
    switch (transferType) {
      case 'subadmin':
        return `${recipient.name || recipient.userId} (${recipient.email})`
      case 'agent':
        return `${recipient.name || ''} (${recipient.userId})`
      case 'subagent':
        return `${recipient.name || ''} (${recipient.userId})`
      default:
        return recipient.userId || recipient._id
    }
  }

  return (
    <CRow>
      <CCol md={6}>
        <CCard>
          <CCardHeader>
            <strong>Transfer Balance</strong>
          </CCardHeader>
          <CCardBody>
            {error && <CAlert color="danger">{error}</CAlert>}
            {success && <CAlert color="success">{success}</CAlert>}
            <CForm onSubmit={handleSubmit}>
              <div className="mb-3">
                <CFormLabel>Transfer Type</CFormLabel>
                <CFormSelect
                  value={transferType}
                  onChange={(e) => {
                    setTransferType(e.target.value)
                    setSelectedRecipient('')
                  }}
                >
                  <option value="subadmin">To Sub-Admin</option>
                  <option value="agent">To Agent</option>
                  <option value="subagent">To Sub-Agent</option>
                </CFormSelect>
              </div>
              <div className="mb-3">
                <CFormLabel>{getRecipientLabel()}</CFormLabel>
                <CFormSelect
                  value={selectedRecipient}
                  onChange={(e) => setSelectedRecipient(e.target.value)}
                  required
                  disabled={recipientsLoading}
                >
                  <option value="">
                    {recipientsLoading ? 'Loading...' : 'Choose...'}
                  </option>
                  {recipients.map((recipient) => (
                    <option key={recipient._id} value={recipient._id}>
                      {getRecipientDisplayName(recipient)}
                    </option>
                  ))}
                </CFormSelect>
              </div>
              <div className="mb-3">
                <CFormLabel htmlFor="amount">Amount</CFormLabel>
                <CFormInput
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                  min="1"
                />
              </div>
              <div className="mb-3">
                <CFormLabel htmlFor="notes">Notes (Optional)</CFormLabel>
                <CFormInput
                  type="text"
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., Monthly commission"
                />
              </div>
              <CButton type="submit" color="primary" disabled={loading}>
                {loading ? <CSpinner size="sm" /> : 'Transfer'}
              </CButton>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol md={6}>
        <CCard>
          <CCardHeader>
            <strong>Transfer History</strong>
          </CCardHeader>
          <CCardBody>
            <CTabs activeTab={transferType}>
              <CTabList variant="tabs">
                <CTab aria-controls="subadmin" tabKey="subadmin" onClick={() => setTransferType('subadmin')}>
                  Sub-Admins
                </CTab>
                <CTab aria-controls="agent" tabKey="agent" onClick={() => setTransferType('agent')}>
                  Agents
                </CTab>
                <CTab aria-controls="subagent" tabKey="subagent" onClick={() => setTransferType('subagent')}>
                  Sub-Agents
                </CTab>
              </CTabList>
              <CTabContent>
                <CTabPane aria-labelledby="history" tabKey={transferType}>
                  <CTable hover className="mt-3">
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>Recipient</CTableHeaderCell>
                        <CTableHeaderCell>Amount</CTableHeaderCell>
                        <CTableHeaderCell>Date</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {history.length === 0 ? (
                        <CTableRow>
                          <CTableDataCell colSpan={3} className="text-center">
                            No transfer history
                          </CTableDataCell>
                        </CTableRow>
                      ) : (
                        history.map((tx) => (
                          <CTableRow key={tx._id}>
                            <CTableDataCell>
                              {tx.recipientId?.name || tx.recipientId?.userId || tx.recipientId?.email || 'N/A'}
                            </CTableDataCell>
                            <CTableDataCell>{tx.amount}</CTableDataCell>
                            <CTableDataCell>
                              {new Date(tx.createdAt).toLocaleDateString()}
                            </CTableDataCell>
                          </CTableRow>
                        ))
                      )}
                    </CTableBody>
                  </CTable>
                </CTabPane>
              </CTabContent>
            </CTabs>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default AdminBalanceTransfer

