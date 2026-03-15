import React, { useState, useEffect } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CFormInput,
  CSpinner,
} from '@coreui/react'
import { adminServices } from '../../../service/adminServices'
import { useToast } from '../../../context/ToastContext'
import ConfirmationModal from './ConfirmationModal'

const ChangeEmailModal = ({ show, onHide, userId, onEmailChanged }) => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const { addToast } = useToast()
  useEffect(() => {
    if (show && userId) {
      fetchUserDetails()
    }
  }, [show, userId])

  const fetchUserDetails = async () => {
    setLoading(true)
    try {
      const response = await adminServices.getUserById(userId)
      setEmail(response.email || '')
    } catch (err) {
      console.error('Failed to fetch user details:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = async () => {
    setSaving(true)
    try {
      await adminServices.updateUserProfileById(userId, { email })
      onEmailChanged && onEmailChanged() // ✅ Refresh parent
      addToast('Email changed successfully!', 'success')
      onHide()
    } catch (err) {
      console.error('Failed to update email:', err)
      addToast('Failed to update email.', 'danger')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <CModal visible={show} onClose={onHide}>
        <CModalHeader closeButton>
          <CModalTitle>Change Email</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {loading ? (
            <div className="text-center py-3">
              <CSpinner color="primary" />
              <p>Loading user email...</p>
            </div>
          ) : (
            <CFormInput
              type="email"
              placeholder="New email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          )}
        </CModalBody>
        <CModalFooter>
          <CButton
            color="success"
            onClick={() => setShowConfirmation(true)}
            disabled={saving || loading || !email}
          >
            {saving ? <CSpinner size="sm" /> : 'Change Email'}
          </CButton>
          <CButton color="secondary" onClick={onHide}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>

      <ConfirmationModal
        visible={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleChange}
        title="Confirm Email Update"
        message="Are you sure you want to update this user email address?"
        variant="warning"
        confirmText="Update Email"
        eventLabel={email || userId || 'Email Update'}
        loading={saving}
      />
    </>
  )
}

export default ChangeEmailModal
