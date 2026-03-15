import React, { useMemo, useState } from 'react'
import {
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
  CCol,
  CButton,
} from '@coreui/react'
import './DetailModal.css'
import ConfirmationModal from './ConfirmationModal'

const SENSITIVE_KEY_PATTERN = /password|token|secret|backup|securityquestion/i
const PRIORITY_KEYS = [
  'userId',
  'email',
  'firstName',
  'status',
  'role',
  'accessLevel',
  'countryCode',
  'createdAt',
  'updatedAt',
  'lastLogin',
  'lastActivity',
  'referralCode',
]

const prettifyLabel = (key) =>
  key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/^./, (char) => char.toUpperCase())

const isLikelyDate = (value) =>
  typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)

const formatPrimitive = (value) => {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (isLikelyDate(value)) return new Date(value).toLocaleString()
  return String(value)
}

const formatComplex = (value) => {
  if (Array.isArray(value)) {
    if (value.length === 0) return 'No records'
    const allPrimitive = value.every((item) => item === null || ['string', 'number', 'boolean'].includes(typeof item))
    return allPrimitive ? value.join(', ') : `${value.length} records`
  }

  if (value && typeof value === 'object') {
    return JSON.stringify(value, null, 2)
  }

  return formatPrimitive(value)
}

const DetailModal = ({ show, onHide, data, onStatusUpdate }) => {
  const [confirmState, setConfirmState] = useState({
    visible: false,
    nextStatus: null,
    title: '',
    message: '',
    variant: 'info',
    confirmText: 'Confirm',
  })

  if (!data) return null

  const isPending = String(data.status) === '0' || data.status === 'pending'
  const title = data?.transactionID ? 'Deposit Details' : 'Details'

  const sortedEntries = Object.entries(data)
    .filter(([key]) => !SENSITIVE_KEY_PATTERN.test(key))
    .sort(([a], [b]) => {
      const indexA = PRIORITY_KEYS.indexOf(a)
      const indexB = PRIORITY_KEYS.indexOf(b)

      if (indexA === -1 && indexB === -1) return a.localeCompare(b)
      if (indexA === -1) return 1
      if (indexB === -1) return -1
      return indexA - indexB
    })

  const eventLabel = useMemo(() => data?.transactionID || data?.id || data?.userId || 'Unknown', [data])

  const openStatusConfirmation = (nextStatus) => {
    const isApprove = Number(nextStatus) === 1

    setConfirmState({
      visible: true,
      nextStatus,
      title: isApprove ? 'Approve Transaction?' : 'Reject Transaction?',
      message: isApprove
        ? 'This will approve the pending request and process it immediately.'
        : 'This will reject the pending request. Please confirm before continuing.',
      variant: isApprove ? 'success' : 'danger',
      confirmText: isApprove ? 'Approve Now' : 'Reject Now',
    })
  }

  const closeConfirmation = () => {
    setConfirmState((prev) => ({ ...prev, visible: false, nextStatus: null }))
  }

  const confirmStatusUpdate = () => {
    if (!confirmState.nextStatus) return
    onStatusUpdate(data.transactionID, data.userId, confirmState.nextStatus)
    closeConfirmation()
  }

  return (
    <CModal visible={show} onClose={onHide} size="xl" className="detail-modal-glass">
      <CModalHeader closeButton>
        <CModalTitle>
          <span className="detail-modal-title">{title}</span>
        </CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CRow className="g-3">
          {sortedEntries.map(([key, value]) => (
            <CCol key={key} md={6}>
              <div className="detail-data-card">
                <p className="detail-key mb-1">{prettifyLabel(key)}</p>
                {value && typeof value === 'object' && !Array.isArray(value) ? (
                  <pre className="detail-value-pre mb-0">{formatComplex(value)}</pre>
                ) : (
                  <p className="detail-value mb-0">{formatComplex(value)}</p>
                )}
              </div>
            </CCol>
          ))}
        </CRow>
      </CModalBody>
      <CModalFooter>
        {isPending && (
          <>
            <CButton
              color="success"
              className="detail-action-btn detail-action-approve"
              onClick={() => openStatusConfirmation(1)}
            >
              Approve
            </CButton>
            <CButton
              color="danger"
              className="detail-action-btn detail-action-reject"
              onClick={() => openStatusConfirmation(2)}
            >
              Reject
            </CButton>
          </>
        )}
        <CButton color="secondary" className="detail-action-btn" onClick={onHide}>
          Close
        </CButton>
      </CModalFooter>

      <ConfirmationModal
        visible={confirmState.visible}
        onClose={closeConfirmation}
        onConfirm={confirmStatusUpdate}
        title={confirmState.title}
        message={confirmState.message}
        variant={confirmState.variant}
        confirmText={confirmState.confirmText}
        eventLabel={eventLabel}
      />
    </CModal>
  )
}

export default DetailModal
