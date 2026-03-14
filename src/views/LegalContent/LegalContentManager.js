import React, { useEffect, useMemo, useState } from 'react'
import {
  CAlert,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CRow,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import legalContentService from '../../service/legalContentService'

const LEGAL_TYPES = [
  { value: 'terms', label: 'Terms & Conditions' },
  { value: 'privacy', label: 'Privacy Policy' },
  { value: 'rules', label: 'Rules & Regulations' },
  { value: 'responsible-gambling', label: 'Responsible Gambling' },
  { value: 'about', label: 'About Us' },
  { value: 'contact', label: 'Contact' },
]

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'bn', label: 'Bengali' },
  { value: 'hi', label: 'Hindi' },
]

const initialForm = {
  type: 'terms',
  language: 'en',
  title: '',
  content: '',
  metaDescription: '',
  metaKeywords: '',
  isActive: true,
}

const LegalContentManager = () => {
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [showVersions, setShowVersions] = useState(false)
  const [versions, setVersions] = useState([])
  const [versionsLoading, setVersionsLoading] = useState(false)

  const selectedTypeLabel = useMemo(
    () => LEGAL_TYPES.find((item) => item.value === form.type)?.label || form.type,
    [form.type],
  )

  useEffect(() => {
    fetchContent()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.type, form.language])

  const setFlash = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 3500)
  }

  const fetchContent = async () => {
    try {
      setLoading(true)
      const response = await legalContentService.getLegalContent(form.type, form.language)
      const payload = response?.data || response

      if (!payload) {
        setForm((prev) => ({ ...prev, title: '', content: '', metaDescription: '', metaKeywords: '' }))
        return
      }

      setForm((prev) => ({
        ...prev,
        title: payload.title || '',
        content: payload.content || '',
        metaDescription: payload.metaDescription || '',
        metaKeywords: payload.metaKeywords || '',
        isActive: payload.isActive ?? true,
      }))
    } catch (error) {
      if (String(error?.message || '').includes('404')) {
        setForm((prev) => ({ ...prev, title: '', content: '', metaDescription: '', metaKeywords: '' }))
        setFlash('warning', `No existing ${selectedTypeLabel} content for ${form.language}. Create it now.`)
      } else {
        setFlash('danger', error.message || 'Failed to load legal content')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async (e) => {
    e.preventDefault()

    if (!form.title.trim() || !form.content.trim()) {
      setFlash('warning', 'Title and content are required')
      return
    }

    try {
      setSaving(true)
      await legalContentService.saveLegalContent({
        type: form.type,
        language: form.language,
        title: form.title,
        content: form.content,
        metaDescription: form.metaDescription,
        metaKeywords: form.metaKeywords,
      })

      setFlash('success', `${selectedTypeLabel} saved successfully`)
      await fetchContent()
    } catch (error) {
      setFlash('danger', error.message || 'Failed to save content')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleStatus = async () => {
    try {
      await legalContentService.toggleLegalContent(form.type, form.language)
      setFlash('success', `${selectedTypeLabel} status updated`)
      await fetchContent()
    } catch (error) {
      setFlash('danger', error.message || 'Failed to toggle status')
    }
  }

  const openVersions = async () => {
    try {
      setShowVersions(true)
      setVersionsLoading(true)
      const response = await legalContentService.getLegalContentVersions(form.type, form.language)
      setVersions(response?.data || [])
    } catch (error) {
      setFlash('danger', error.message || 'Failed to load versions')
    } finally {
      setVersionsLoading(false)
    }
  }

  const restoreVersion = async (versionNumber) => {
    try {
      await legalContentService.restoreLegalContentVersion(form.type, versionNumber, form.language)
      setFlash('success', `Restored version ${versionNumber}`)
      await openVersions()
      await fetchContent()
    } catch (error) {
      setFlash('danger', error.message || 'Failed to restore version')
    }
  }

  return (
    <>
      <CCard>
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <strong>Legal Content Manager</strong>
          <div className="d-flex gap-2">
            <CButton color="info" variant="outline" onClick={openVersions}>
              Version History
            </CButton>
            <CButton color={form.isActive ? 'warning' : 'success'} variant="outline" onClick={handleToggleStatus}>
              {form.isActive ? 'Deactivate' : 'Activate'}
            </CButton>
          </div>
        </CCardHeader>
        <CCardBody>
          {message.text && <CAlert color={message.type}>{message.text}</CAlert>}

          <CRow className="mb-3">
            <CCol md={4}>
              <CFormLabel>Legal Page Type</CFormLabel>
              <CFormSelect
                value={form.type}
                onChange={(e) => handleChange('type', e.target.value)}
                options={LEGAL_TYPES}
              />
            </CCol>
            <CCol md={4}>
              <CFormLabel>Language</CFormLabel>
              <CFormSelect
                value={form.language}
                onChange={(e) => handleChange('language', e.target.value)}
                options={LANGUAGES}
              />
            </CCol>
            <CCol md={4} className="d-flex align-items-end">
              <div>
                <CFormLabel>Current Status</CFormLabel>
                <div>
                  <CBadge color={form.isActive ? 'success' : 'secondary'}>
                    {form.isActive ? 'Active' : 'Inactive'}
                  </CBadge>
                </div>
              </div>
            </CCol>
          </CRow>

          {loading ? (
            <div className="text-center my-4">
              <CSpinner color="primary" />
            </div>
          ) : (
            <CForm onSubmit={handleSave}>
              <CRow>
                <CCol md={8}>
                  <div className="mb-3">
                    <CFormLabel>Page Title</CFormLabel>
                    <CFormInput
                      value={form.title}
                      onChange={(e) => handleChange('title', e.target.value)}
                      placeholder="Enter page title"
                      required
                    />
                  </div>
                </CCol>
                <CCol md={4}>
                  <div className="mb-3">
                    <CFormLabel>Meta Keywords</CFormLabel>
                    <CFormInput
                      value={form.metaKeywords}
                      onChange={(e) => handleChange('metaKeywords', e.target.value)}
                      placeholder="terms, privacy, legal"
                    />
                  </div>
                </CCol>
              </CRow>

              <div className="mb-3">
                <CFormLabel>Meta Description</CFormLabel>
                <CFormInput
                  value={form.metaDescription}
                  onChange={(e) => handleChange('metaDescription', e.target.value)}
                  placeholder="SEO description"
                  maxLength={160}
                />
              </div>

              <div className="mb-3">
                <CFormLabel>HTML Content</CFormLabel>
                <CFormTextarea
                  rows={16}
                  value={form.content}
                  onChange={(e) => handleChange('content', e.target.value)}
                  placeholder="Enter HTML content for this legal page"
                  required
                />
              </div>

              <div className="d-flex gap-2">
                <CButton type="submit" color="primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Content'}
                </CButton>
                <CButton type="button" color="secondary" variant="outline" onClick={fetchContent}>
                  Reload
                </CButton>
              </div>
            </CForm>
          )}
        </CCardBody>
      </CCard>

      <CCard className="mt-3">
        <CCardHeader>
          <strong>Live Preview</strong>
        </CCardHeader>
        <CCardBody>
          {form.content ? (
            <div dangerouslySetInnerHTML={{ __html: form.content }} />
          ) : (
            <div className="text-muted">No content to preview</div>
          )}
        </CCardBody>
      </CCard>

      <CModal size="xl" visible={showVersions} onClose={() => setShowVersions(false)}>
        <CModalHeader closeButton>Version History - {selectedTypeLabel}</CModalHeader>
        <CModalBody>
          {versionsLoading ? (
            <div className="text-center py-4">
              <CSpinner color="primary" />
            </div>
          ) : (
            <CTable hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Version</CTableHeaderCell>
                  <CTableHeaderCell>Updated At</CTableHeaderCell>
                  <CTableHeaderCell>Status</CTableHeaderCell>
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {(versions || []).length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan={4} className="text-center">
                      No versions found.
                    </CTableDataCell>
                  </CTableRow>
                ) : (
                  (versions || []).map((version) => (
                    <CTableRow key={`${version.version}-${version.updatedAt}`}>
                      <CTableDataCell>v{version.version}</CTableDataCell>
                      <CTableDataCell>
                        {version.updatedAt ? new Date(version.updatedAt).toLocaleString() : '-'}
                      </CTableDataCell>
                      <CTableDataCell>
                        {version.isCurrent ? <CBadge color="success">Current</CBadge> : <CBadge color="secondary">History</CBadge>}
                      </CTableDataCell>
                      <CTableDataCell>
                        {!version.isCurrent && (
                          <CButton size="sm" color="warning" onClick={() => restoreVersion(version.version)}>
                            Restore
                          </CButton>
                        )}
                      </CTableDataCell>
                    </CTableRow>
                  ))
                )}
              </CTableBody>
            </CTable>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowVersions(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default LegalContentManager
