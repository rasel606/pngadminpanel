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
  CFormCheck,
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

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All Categories' },
  { value: 'account', label: 'Account' },
  { value: 'deposit', label: 'Deposit' },
  { value: 'withdrawal', label: 'Withdrawal' },
  { value: 'games', label: 'Games' },
  { value: 'bonus', label: 'Bonus' },
  { value: 'security', label: 'Security' },
  { value: 'technical', label: 'Technical' },
  { value: 'general', label: 'General' },
]

const LANG_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'bn', label: 'Bengali' },
  { value: 'hi', label: 'Hindi' },
]

const initialFaqForm = {
  category: 'general',
  question: '',
  answer: '',
  keywordsText: '',
  order: 0,
  language: 'en',
  isFeatured: false,
}

const FAQManager = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [items, setItems] = useState([])
  const [message, setMessage] = useState({ type: '', text: '' })

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [language, setLanguage] = useState('en')

  const [showFormModal, setShowFormModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [form, setForm] = useState(initialFaqForm)

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const flash = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 3500)
  }

  const isSearching = useMemo(() => Boolean(search.trim()), [search])

  useEffect(() => {
    fetchFAQs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, language])

  const fetchFAQs = async () => {
    try {
      setLoading(true)
      const response = await legalContentService.getFAQItems({ category, lang: language })
      const data = response?.data?.items || response?.items || []
      setItems(data)
    } catch (error) {
      flash('danger', error.message || 'Failed to load FAQ items')
    } finally {
      setLoading(false)
    }
  }

  const runSearch = async () => {
    if (!search.trim()) {
      fetchFAQs()
      return
    }

    try {
      setLoading(true)
      const response = await legalContentService.searchFAQ({
        q: search.trim(),
        category,
        lang: language,
      })
      const data = response?.data?.items || response?.items || []
      setItems(data)
    } catch (error) {
      flash('danger', error.message || 'Failed to search FAQ')
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = () => {
    setEditingItem(null)
    setForm({ ...initialFaqForm, language })
    setShowFormModal(true)
  }

  const openEditModal = (item) => {
    setEditingItem(item)
    setForm({
      category: item.category || 'general',
      question: item.question || '',
      answer: item.answer || '',
      keywordsText: Array.isArray(item.keywords) ? item.keywords.join(', ') : '',
      order: item.order ?? 0,
      language: item.language || language,
      isFeatured: !!item.isFeatured,
    })
    setShowFormModal(true)
  }

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const submitFAQ = async (e) => {
    e.preventDefault()

    if (!form.question.trim() || !form.answer.trim()) {
      flash('warning', 'Question and answer are required')
      return
    }

    const payload = {
      category: form.category,
      question: form.question.trim(),
      answer: form.answer,
      keywords: form.keywordsText
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean),
      order: Number(form.order || 0),
      language: form.language,
      isFeatured: !!form.isFeatured,
    }

    try {
      setSaving(true)
      if (editingItem?._id) {
        await legalContentService.updateFAQ(editingItem._id, payload)
        flash('success', 'FAQ updated successfully')
      } else {
        await legalContentService.createFAQ(payload)
        flash('success', 'FAQ created successfully')
      }

      setShowFormModal(false)
      await fetchFAQs()
    } catch (error) {
      flash('danger', error.message || 'Failed to save FAQ')
    } finally {
      setSaving(false)
    }
  }

  const toggleStatus = async (item) => {
    try {
      await legalContentService.toggleFAQStatus(item._id)
      flash('success', 'FAQ status updated')
      await fetchFAQs()
    } catch (error) {
      flash('danger', error.message || 'Failed to toggle FAQ status')
    }
  }

  const confirmDelete = (item) => {
    setDeleteTarget(item)
    setShowDeleteModal(true)
  }

  const deleteFAQ = async () => {
    try {
      if (!deleteTarget?._id) return
      await legalContentService.deleteFAQ(deleteTarget._id)
      flash('success', 'FAQ deleted successfully')
      setShowDeleteModal(false)
      setDeleteTarget(null)
      await fetchFAQs()
    } catch (error) {
      flash('danger', error.message || 'Failed to delete FAQ')
    }
  }

  const updateOrder = async (item, newOrder) => {
    try {
      await legalContentService.updateFAQ(item._id, { order: Number(newOrder || 0) })
      flash('success', 'FAQ order updated')
      await fetchFAQs()
    } catch (error) {
      flash('danger', error.message || 'Failed to update order')
    }
  }

  return (
    <>
      <CCard>
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <strong>FAQ Manager</strong>
          <CButton color="primary" onClick={openCreateModal}>
            Create FAQ
          </CButton>
        </CCardHeader>
        <CCardBody>
          {message.text && <CAlert color={message.type}>{message.text}</CAlert>}

          <CRow className="mb-3">
            <CCol md={3}>
              <CFormLabel>Language</CFormLabel>
              <CFormSelect
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                options={LANG_OPTIONS}
              />
            </CCol>
            <CCol md={3}>
              <CFormLabel>Category</CFormLabel>
              <CFormSelect
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                options={CATEGORY_OPTIONS}
              />
            </CCol>
            <CCol md={4}>
              <CFormLabel>Search</CFormLabel>
              <CFormInput
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search question/answer"
              />
            </CCol>
            <CCol md={2} className="d-flex align-items-end">
              <div className="d-flex gap-2 w-100">
                <CButton color="info" className="w-100" onClick={runSearch}>
                  Search
                </CButton>
                <CButton
                  color="secondary"
                  variant="outline"
                  className="w-100"
                  onClick={() => {
                    setSearch('')
                    fetchFAQs()
                  }}
                >
                  Reset
                </CButton>
              </div>
            </CCol>
          </CRow>

          {loading ? (
            <div className="text-center my-4">
              <CSpinner color="primary" />
            </div>
          ) : (
            <CTable hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>#</CTableHeaderCell>
                  <CTableHeaderCell>Question</CTableHeaderCell>
                  <CTableHeaderCell>Category</CTableHeaderCell>
                  <CTableHeaderCell>Order</CTableHeaderCell>
                  <CTableHeaderCell>Status</CTableHeaderCell>
                  <CTableHeaderCell>Featured</CTableHeaderCell>
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {items.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan={7} className="text-center">
                      {isSearching ? 'No FAQ matched your search' : 'No FAQ found'}
                    </CTableDataCell>
                  </CTableRow>
                ) : (
                  items.map((item, index) => (
                    <CTableRow key={item._id}>
                      <CTableDataCell>{index + 1}</CTableDataCell>
                      <CTableDataCell style={{ maxWidth: 380 }}>
                        <div className="fw-semibold text-truncate">{item.question}</div>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CBadge color="info">{item.category}</CBadge>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CFormInput
                          type="number"
                          min={0}
                          defaultValue={item.order || 0}
                          onBlur={(e) => updateOrder(item, e.target.value)}
                          style={{ width: 90 }}
                        />
                      </CTableDataCell>
                      <CTableDataCell>
                        <CBadge color={item.isActive ? 'success' : 'secondary'}>
                          {item.isActive ? 'Active' : 'Inactive'}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CBadge color={item.isFeatured ? 'warning' : 'light'}>
                          {item.isFeatured ? 'Featured' : 'Normal'}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell>
                        <div className="d-flex gap-2">
                          <CButton size="sm" color="warning" onClick={() => openEditModal(item)}>
                            Edit
                          </CButton>
                          <CButton size="sm" color={item.isActive ? 'secondary' : 'success'} onClick={() => toggleStatus(item)}>
                            {item.isActive ? 'Disable' : 'Enable'}
                          </CButton>
                          <CButton size="sm" color="danger" onClick={() => confirmDelete(item)}>
                            Delete
                          </CButton>
                        </div>
                      </CTableDataCell>
                    </CTableRow>
                  ))
                )}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>

      <CModal size="lg" visible={showFormModal} onClose={() => setShowFormModal(false)}>
        <CModalHeader closeButton>{editingItem ? 'Edit FAQ' : 'Create FAQ'}</CModalHeader>
        <CModalBody>
          <CForm onSubmit={submitFAQ}>
            <CRow>
              <CCol md={6}>
                <div className="mb-3">
                  <CFormLabel>Category</CFormLabel>
                  <CFormSelect
                    value={form.category}
                    onChange={(e) => handleFormChange('category', e.target.value)}
                    options={CATEGORY_OPTIONS.filter((x) => x.value !== 'all')}
                  />
                </div>
              </CCol>
              <CCol md={3}>
                <div className="mb-3">
                  <CFormLabel>Language</CFormLabel>
                  <CFormSelect
                    value={form.language}
                    onChange={(e) => handleFormChange('language', e.target.value)}
                    options={LANG_OPTIONS}
                  />
                </div>
              </CCol>
              <CCol md={3}>
                <div className="mb-3">
                  <CFormLabel>Order</CFormLabel>
                  <CFormInput
                    type="number"
                    min={0}
                    value={form.order}
                    onChange={(e) => handleFormChange('order', e.target.value)}
                  />
                </div>
              </CCol>
            </CRow>

            <div className="mb-3">
              <CFormLabel>Question</CFormLabel>
              <CFormInput
                value={form.question}
                onChange={(e) => handleFormChange('question', e.target.value)}
                placeholder="Enter FAQ question"
                required
              />
            </div>

            <div className="mb-3">
              <CFormLabel>Answer (HTML supported)</CFormLabel>
              <CFormTextarea
                rows={8}
                value={form.answer}
                onChange={(e) => handleFormChange('answer', e.target.value)}
                placeholder="Enter answer content"
                required
              />
            </div>

            <div className="mb-3">
              <CFormLabel>Keywords (comma separated)</CFormLabel>
              <CFormInput
                value={form.keywordsText}
                onChange={(e) => handleFormChange('keywordsText', e.target.value)}
                placeholder="account, signup, verification"
              />
            </div>

            <div className="mb-2">
              <CFormCheck
                id="faq-featured"
                label="Featured FAQ"
                checked={form.isFeatured}
                onChange={(e) => handleFormChange('isFeatured', e.target.checked)}
              />
            </div>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowFormModal(false)}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={submitFAQ} disabled={saving}>
            {saving ? 'Saving...' : editingItem ? 'Update FAQ' : 'Create FAQ'}
          </CButton>
        </CModalFooter>
      </CModal>

      <CModal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <CModalHeader closeButton>Delete FAQ</CModalHeader>
        <CModalBody>
          Are you sure you want to delete this FAQ?
          <div className="mt-2 text-muted">{deleteTarget?.question}</div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </CButton>
          <CButton color="danger" onClick={deleteFAQ}>
            Delete
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default FAQManager
