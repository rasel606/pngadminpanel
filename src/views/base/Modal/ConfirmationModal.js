import React from 'react'
import { CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle, CButton } from '@coreui/react'
import './ConfirmationModal.css'

const VARIANT_META = {
  info: { badge: 'SYNC', icon: '✦' },
  success: { badge: 'GREENLIGHT', icon: '✓' },
  danger: { badge: 'CRITICAL', icon: '⚠' },
  warning: { badge: 'CAUTION', icon: '!' },
}

const ConfirmationModal = ({
  visible,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Please confirm this operation.',
  eventLabel = 'Event',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info',
  loading = false,
}) => {
  const meta = VARIANT_META[variant] || VARIANT_META.info

  return (
    <CModal visible={visible} onClose={onClose} alignment="center" className={`cosmic-confirm-modal variant-${variant}`}>
      <CModalHeader closeButton>
        <CModalTitle className="cosmic-title">
          <span className="cosmic-icon" aria-hidden="true">
            {meta.icon}
          </span>
          {title}
        </CModalTitle>
      </CModalHeader>

      <CModalBody>
        <div className="cosmic-bg-orbit" aria-hidden="true" />
        <div className="cosmic-content-card">
          <span className="cosmic-badge">{meta.badge}</span>
          <p className="cosmic-message mb-2">{message}</p>
          <p className="cosmic-event-label mb-0">
            Event Node: <strong>{eventLabel}</strong>
          </p>
        </div>
      </CModalBody>

      <CModalFooter>
        <CButton color="secondary" variant="outline" className="cosmic-btn" onClick={onClose} disabled={loading}>
          {cancelText}
        </CButton>
        <CButton
          color={variant === 'danger' ? 'danger' : 'primary'}
          className="cosmic-btn cosmic-btn-confirm"
          onClick={onConfirm}
          disabled={loading}
        >
          {confirmText}
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default ConfirmationModal
