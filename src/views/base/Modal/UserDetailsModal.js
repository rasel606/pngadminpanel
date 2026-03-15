import React, { useState, useEffect } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CFormInput,
  CFormLabel,
  CRow,
  CCol,
  CSpinner,
  CToaster,
  CToast,
  CToastBody,
  CToastHeader,
} from '@coreui/react'
import { adminServices } from '../../../service/adminServices'
import './UserDetailsModal.css'
import ConfirmationModal from './ConfirmationModal'

const UserDetailsModal = ({ show, onHide, userId, onUserUpdated }) => {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [verifyingEmail, setVerifyingEmail] = useState(false)
  const [verifyingPhone, setVerifyingPhone] = useState(false)
  const [toasts, setToasts] = useState([])
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false)
  const [userData, setUserData] = useState({
    username: '',
    name: '',
    email: '',
    phone: '',
    birthday: '',
    country: '',
    isVerified: { email: false, phone: false },
  })

  useEffect(() => {
    if (show && userId) fetchUserDetails()
  }, [show, userId])

  const fetchUserDetails = async () => {
    setLoading(true)
    try {
      const response = await adminServices.getUserById(userId)
      setUserData({
        username: response.user.userId || '',
        name: response.user.name || '',
        email: response.user.email || '',
        phone: response.user.phone?.[0]?.number || '',
        birthday: response.user.birthday ? response.user.birthday.split('T')[0] : '',
        country: response.user.country || '',
        isVerified: response.user.isVerified || { email: false, phone: false },
      })
    } catch (err) {
      showToast('Failed to load user details.', 'danger')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const showToast = (message, color = 'success') => {
    setToasts((prev) => [...prev, { id: Date.now(), message, color }])
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await adminServices.updateUserProfileById(userId, userData)
      showToast('User profile updated successfully!')
      onUserUpdated && onUserUpdated()
      setShowSaveConfirmation(false)
      onHide()
    } catch (err) {
      console.error(err)
      showToast('Failed to update user profile.', 'danger')
    } finally {
      setSaving(false)
    }
  }

  const handleVerifyEmail = async () => {
    setVerifyingEmail(true)
    try {
      await adminServices.verifyEmailForUser(userId)
      setUserData({ ...userData, isVerified: { ...userData.isVerified, email: true } })
      showToast('Email verified successfully!')
      onUserUpdated && onUserUpdated()
    } catch (err) {
      console.error(err)
      showToast('Failed to verify email.', 'danger')
    } finally {
      setVerifyingEmail(false)
    }
  }

  const handleVerifyPhone = async () => {
    setVerifyingPhone(true)
    try {
      await adminServices.verifyPhoneForUser(userId)
      setUserData({ ...userData, isVerified: { ...userData.isVerified, phone: true } })
      showToast('Phone verified successfully!')
      onUserUpdated && onUserUpdated()
    } catch (err) {
      console.error(err)
      showToast('Failed to verify phone.', 'danger')
    } finally {
      setVerifyingPhone(false)
    }
  }

  const handleChange = (key, value) => {
    setUserData({ ...userData, [key]: value })
  }

  return (
    <>
      {/* ✅ Toast Container */}
      <CToaster placement="top-end">
        {toasts.map((toast) => (
          <CToast
            key={toast.id}
            autohide={true}
            visible={true}
            color={toast.color}
            className="text-white user-details-toast"
            onClose={() => setToasts(toasts.filter((t) => t.id !== toast.id))}
          >
            <CToastHeader closeButton>
              {toast.color === 'success' ? '✅ Success' : '⚠️ Error'}
            </CToastHeader>
            <CToastBody>{toast.message}</CToastBody>
          </CToast>
        ))}
      </CToaster>

      {/* ✅ Modal */}
      <CModal visible={show} onClose={onHide} size="xl" className="user-details-modal-glass">
        <CModalHeader closeButton>
          <CModalTitle>
            <span className="user-details-modal-title">Edit User Details</span>
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {loading ? (
            <div className="text-center py-5 user-details-loading-wrap">
              <CSpinner color="primary" />
              <p>Loading user details...</p>
            </div>
          ) : (
            <CRow className="g-3">
              <CCol xs={12} md={6}>
                <CFormLabel className="user-details-label">Name</CFormLabel>
                <CFormInput
                  className="user-details-input"
                  value={userData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
              </CCol>
              <CCol xs={12} md={6}>
                <CFormLabel className="user-details-label">User ID</CFormLabel>
                <CFormInput className="user-details-input" value={userData.username} />
              </CCol>
              <CCol xs={12} md={6}>
                <CFormLabel className="user-details-label">Email</CFormLabel>
                <div className="d-flex gap-2 align-items-center">
                  <CFormInput
                    className="user-details-input"
                    type="email"
                    value={userData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                  />
                  <CButton
                    color={userData.isVerified.email ? 'success' : 'warning'}
                    size="sm"
                    className="user-details-action-btn"
                    onClick={handleVerifyEmail}
                    disabled={userData.isVerified.email || verifyingEmail}
                  >
                    {userData.isVerified.email
                      ? 'Verified'
                      : verifyingEmail
                        ? 'Verifying...'
                        : 'Verify Email'}
                  </CButton>
                </div>
              </CCol>
              <CCol xs={12} md={6}>
                <CFormLabel className="user-details-label">Phone</CFormLabel>
                <div className="d-flex gap-2 align-items-center">
                  <CFormInput
                    className="user-details-input"
                    value={userData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                  />
                  <CButton
                    color={userData.isVerified.phone ? 'success' : 'warning'}
                    size="sm"
                    className="user-details-action-btn"
                    onClick={handleVerifyPhone}
                    disabled={userData.isVerified.phone || verifyingPhone}
                  >
                    {userData.isVerified.phone
                      ? 'Verified'
                      : verifyingPhone
                        ? 'Verifying...'
                        : 'Verify Phone'}
                  </CButton>
                </div>
              </CCol>
              <CCol xs={12} md={6}>
                <CFormLabel className="user-details-label">Birthday</CFormLabel>
                <CFormInput
                  className="user-details-input"
                  type="date"
                  value={userData.birthday}
                  onChange={(e) => handleChange('birthday', e.target.value)}
                />
              </CCol>
              <CCol xs={12} md={6}>
                <CFormLabel className="user-details-label">Country</CFormLabel>
                <CFormInput
                  className="user-details-input"
                  value={userData.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                />
              </CCol>
            </CRow>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton
            color="success"
            className="user-details-action-btn"
            onClick={() => setShowSaveConfirmation(true)}
            disabled={saving || loading}
          >
            {saving ? <CSpinner size="sm" /> : 'Save Changes'}
          </CButton>
          <CButton color="secondary" className="user-details-action-btn" onClick={onHide}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>

      <ConfirmationModal
        visible={showSaveConfirmation}
        onClose={() => setShowSaveConfirmation(false)}
        onConfirm={handleSave}
        title="Confirm Profile Update"
        message="Save all edited user profile fields now?"
        variant="warning"
        confirmText="Save Profile"
        eventLabel={userData.username || userData.email || userId || 'User Profile'}
        loading={saving}
      />
    </>
  )
}

export default UserDetailsModal
