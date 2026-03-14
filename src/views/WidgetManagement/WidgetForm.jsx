import React, { useState, useEffect } from 'react'
import {
  CForm,
  CRow,
  CCol,
  CFormLabel,
  CFormInput,
  CFormSelect,
  CFormTextarea,
  CFormCheck,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CAlert,
  CSpinner,
  CInputGroup,
  CInputGroupText,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSave, cilX } from '@coreui/icons'
import widgetService from '../../service/widgetService'
import {
  WIDGET_TYPES,
  WIDGET_POSITIONS,
  WIDGET_STATUS,
  WIDGET_DISPLAY_MODES,
  WIDGET_ANIMATIONS,
  WIDGET_TYPE_CONFIGS,
  POSITION_LABELS,
  DEFAULT_WIDGET,
} from './widgetConstants'

const WidgetForm = ({ widget = null, isEditing = false, onSave, onCancel }) => {
  const [formData, setFormData] = useState(DEFAULT_WIDGET)
  const [contentJson, setContentJson] = useState('{}')
  const [contentJsonError, setContentJsonError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    if (widget) {
      const normalized = {
        ...DEFAULT_WIDGET,
        ...widget,
        settings: {
          ...DEFAULT_WIDGET.settings,
          ...widget.settings,
        },
      }
      setFormData(normalized)
      setContentJson(JSON.stringify(normalized.content || {}, null, 2))
    } else {
      setFormData(DEFAULT_WIDGET)
      setContentJson(JSON.stringify(DEFAULT_WIDGET.content || {}, null, 2))
    }
  }, [widget])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleContentChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        [field]: value,
      },
    }))
  }

  const handleSettingChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        [field]: value,
      },
    }))
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB')
      return
    }

    try {
      setUploadingImage(true)
      setError(null)
      const response = await widgetService.uploadImage(file)
      const imageUrl = response.imageUrl || response.data?.imageUrl
      handleContentChange('imageUrl', imageUrl)
      setSuccess('Image uploaded successfully!')
    } catch (err) {
      console.error('Error uploading image:', err)
      setError('Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (isAdvancedType) {
        try {
          const parsed = contentJson ? JSON.parse(contentJson) : {}
          setFormData((prev) => ({ ...prev, content: parsed }))
          setContentJsonError(null)
        } catch (jsonError) {
          setContentJsonError('Invalid JSON content. Please fix and save again.')
          setLoading(false)
          return
        }
      }

      // Backend requires `name`; if user only filled title, reuse it
      const payload = {
        ...formData,
        name: formData.name || formData.title || 'Untitled Widget',
        content: isAdvancedType ? (contentJson ? JSON.parse(contentJson) : {}) : formData.content,
      }

      if (isEditing) {
        await widgetService.updateWidget(formData.id || formData._id, payload)
        setSuccess('Widget updated successfully!')
      } else {
        await widgetService.createWidget(payload)
        setSuccess('Widget created successfully!')
      }

      setTimeout(() => {
        onSave()
      }, 1500)
    } catch (err) {
      console.error('Error saving widget:', err)
      setError(err.message || 'Failed to save widget')
    } finally {
      setLoading(false)
    }
  }

  const renderContentFields = () => {
    const typeConfig = WIDGET_TYPE_CONFIGS[formData.type]
    if (!typeConfig) return null

    return (
      <CRow className="g-3">
        {typeConfig.fields?.includes('imageUrl') && (
          <CCol md={12}>
            <CFormLabel>Image</CFormLabel>
            <CInputGroup className="mb-2">
              <CFormInput
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
              />
              {uploadingImage && (
                <CInputGroupText>
                  <CSpinner size="sm" />
                </CInputGroupText>
              )}
            </CInputGroup>
            <CFormInput
              type="text"
              placeholder="Or enter image URL"
              value={formData.content?.imageUrl || ''}
              onChange={(e) => handleContentChange('imageUrl', e.target.value)}
            />
            {formData.content?.imageUrl && (
              <div className="mt-2">
                <img
                  src={formData.content.imageUrl}
                  alt="Preview"
                  style={{ maxWidth: '200px', maxHeight: '150px', borderRadius: '5px' }}
                />
              </div>
            )}
          </CCol>
        )}

        {typeConfig.fields?.includes('title') && (
          <CCol md={12}>
            <CFormLabel>Content Title</CFormLabel>
            <CFormInput
              type="text"
              value={formData.content?.title || ''}
              onChange={(e) => handleContentChange('title', e.target.value)}
              placeholder="Enter title"
            />
          </CCol>
        )}

        {typeConfig.fields?.includes('description') && (
          <CCol md={12}>
            <CFormLabel>Description</CFormLabel>
            <CFormTextarea
              rows={3}
              value={formData.content?.description || ''}
              onChange={(e) => handleContentChange('description', e.target.value)}
              placeholder="Enter description"
            />
          </CCol>
        )}

        {typeConfig.fields?.includes('message') && (
          <CCol md={12}>
            <CFormLabel>Message</CFormLabel>
            <CFormTextarea
              rows={3}
              value={formData.content?.message || ''}
              onChange={(e) => handleContentChange('message', e.target.value)}
              placeholder="Enter message"
            />
          </CCol>
        )}

        {typeConfig.fields?.includes('ctaText') && (
          <CCol md={6}>
            <CFormLabel>CTA Button Text</CFormLabel>
            <CFormInput
              type="text"
              value={formData.content?.ctaText || ''}
              onChange={(e) => handleContentChange('ctaText', e.target.value)}
              placeholder="e.g., Learn More, Sign Up"
            />
          </CCol>
        )}

        {typeConfig.fields?.includes('ctaLink') && (
          <CCol md={6}>
            <CFormLabel>CTA Link</CFormLabel>
            <CFormInput
              type="text"
              value={formData.content?.ctaLink || ''}
              onChange={(e) => handleContentChange('ctaLink', e.target.value)}
              placeholder="/path or https://..."
            />
          </CCol>
        )}

        {typeConfig.fields?.includes('html') && (
          <CCol md={12}>
            <CFormLabel>Custom HTML</CFormLabel>
            <CFormTextarea
              rows={5}
              value={formData.content?.html || ''}
              onChange={(e) => handleContentChange('html', e.target.value)}
              placeholder="Enter custom HTML"
              style={{ fontFamily: 'monospace', fontSize: '12px' }}
            />
          </CCol>
        )}

        {typeConfig.fields?.includes('css') && (
          <CCol md={12}>
            <CFormLabel>Custom CSS</CFormLabel>
            <CFormTextarea
              rows={4}
              value={formData.content?.css || ''}
              onChange={(e) => handleContentChange('css', e.target.value)}
              placeholder="Enter custom CSS"
              style={{ fontFamily: 'monospace', fontSize: '12px' }}
            />
          </CCol>
        )}

        {typeConfig.fields?.includes('items') && (
          <CCol md={12}>
            <CFormLabel>Items (one per line)</CFormLabel>
            <CFormTextarea
              rows={4}
              value={
                Array.isArray(formData.content?.items)
                  ? formData.content.items.join('\n')
                  : formData.content?.items || ''
              }
              onChange={(e) =>
                handleContentChange('items', e.target.value.split('\n').filter(Boolean))
              }
              placeholder="Enter items, one per line"
            />
          </CCol>
        )}

        {typeConfig.fields?.includes('targetDate') && (
          <CCol md={6}>
            <CFormLabel>Target Date & Time</CFormLabel>
            <CFormInput
              type="datetime-local"
              value={formData.content?.targetDate?.slice(0, 16) || ''}
              onChange={(e) => handleContentChange('targetDate', e.target.value)}
            />
          </CCol>
        )}

        {typeConfig.fields?.includes('completionMessage') && (
          <CCol md={6}>
            <CFormLabel>Completion Message</CFormLabel>
            <CFormInput
              type="text"
              value={formData.content?.completionMessage || ''}
              onChange={(e) => handleContentChange('completionMessage', e.target.value)}
              placeholder="Message when countdown ends"
            />
          </CCol>
        )}

        {typeConfig.fields?.includes('gameIds') && (
          <CCol md={12}>
            <CFormLabel>Game IDs (comma-separated)</CFormLabel>
            <CFormInput
              type="text"
              value={
                Array.isArray(formData.content?.gameIds)
                  ? formData.content.gameIds.join(', ')
                  : formData.content?.gameIds || ''
              }
              onChange={(e) =>
                handleContentChange(
                  'gameIds',
                  e.target.value.split(',').map((id) => id.trim()).filter(Boolean)
                )
              }
              placeholder="e.g., 1, 2, 3, 4"
            />
          </CCol>
        )}

        {typeConfig.fields?.includes('layout') && (
          <CCol md={6}>
            <CFormLabel>Layout</CFormLabel>
            <CFormSelect
              value={formData.content?.layout || 'grid'}
              onChange={(e) => handleContentChange('layout', e.target.value)}
            >
              <option value="grid">Grid</option>
              <option value="carousel">Carousel</option>
              <option value="list">List</option>
            </CFormSelect>
          </CCol>
        )}

        {typeConfig.fields?.includes('type') && (
        <CCol md={6}>
            <CFormLabel>Announcement Type</CFormLabel>
            <CFormSelect
              value={formData.content?.type || 'info'}
              onChange={(e) => handleContentChange('type', e.target.value)}
            >
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="success">Success</option>
              <option value="error">Error</option>
            </CFormSelect>
          </CCol>
        )}
      </CRow>
    )
  }

  const advancedTypes = new Set([
    WIDGET_TYPES.HERO_CAROUSEL,
    WIDGET_TYPES.NOTICE_MARQUEE,
    WIDGET_TYPES.CATEGORY_NAV,
    WIDGET_TYPES.IMAGE_SCROLLER,
    WIDGET_TYPES.GAME_GRID,
    WIDGET_TYPES.PAYMENT_METHODS,
    WIDGET_TYPES.FOOTER_LINKS,
    WIDGET_TYPES.FLOATING_BANNER,
    WIDGET_TYPES.TOOLBAR_MENU,
  ])
  const isAdvancedType = advancedTypes.has(formData.type)

  return (
    <CForm onSubmit={handleSubmit}>
      {error && <CAlert color="danger" dismissible onClose={() => setError(null)}>{error}</CAlert>}
      {success && <CAlert color="success" dismissible onClose={() => setSuccess(null)}>{success}</CAlert>}

      {/* Basic Information */}
      <CCard className="mb-3">
        <CCardHeader>
          <strong>Basic Information</strong>
        </CCardHeader>
        <CCardBody>
      <CRow className="g-3">
        <CCol md={6}>
          <CFormLabel>
            Widget Name *
          </CFormLabel>
          <CFormInput
            value={formData.name || ''}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Internal name (required)"
            required
          />
        </CCol>
        <CCol md={6}>
          <CFormLabel>Widget Type *</CFormLabel>
          <CFormSelect
            value={formData.type}
            onChange={(e) => handleInputChange('type', e.target.value)}
                required
              >
                {Object.entries(WIDGET_TYPE_CONFIGS).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.icon} {config.label}
                  </option>
                ))}
              </CFormSelect>
              <small className="text-muted">
                {WIDGET_TYPE_CONFIGS[formData.type]?.description}
              </small>
            </CCol>

            <CCol md={6}>
              <CFormLabel>Position *</CFormLabel>
              <CFormSelect
                value={formData.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                required
              >
                {Object.entries(POSITION_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </CFormSelect>
            </CCol>

            <CCol md={12}>
              <CFormLabel>Widget Title</CFormLabel>
              <CFormInput
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter widget title (for admin reference)"
              />
            </CCol>

            <CCol md={3}>
              <CFormLabel>Status *</CFormLabel>
              <CFormSelect
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                required
              >
                {Object.values(WIDGET_STATUS).map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </CFormSelect>
            </CCol>

            <CCol md={3}>
              <CFormLabel>Display Mode *</CFormLabel>
              <CFormSelect
                value={formData.displayMode}
                onChange={(e) => handleInputChange('displayMode', e.target.value)}
                required
              >
                {Object.values(WIDGET_DISPLAY_MODES).map((mode) => (
                  <option key={mode} value={mode}>
                    {mode.replace('_', ' ').charAt(0).toUpperCase() + mode.slice(1).replace('_', ' ')}
                  </option>
                ))}
              </CFormSelect>
            </CCol>

            <CCol md={3}>
              <CFormLabel>Animation</CFormLabel>
              <CFormSelect
                value={formData.animation}
                onChange={(e) => handleInputChange('animation', e.target.value)}
              >
                {Object.values(WIDGET_ANIMATIONS).map((animation) => (
                  <option key={animation} value={animation}>
                    {animation.replace('_', ' ').charAt(0).toUpperCase() + animation.slice(1).replace('_', ' ')}
                  </option>
                ))}
              </CFormSelect>
            </CCol>

            <CCol md={3}>
              <CFormLabel>Priority (0-100)</CFormLabel>
              <CFormInput
                type="number"
                min="0"
                max="100"
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', parseInt(e.target.value) || 0)}
              />
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>

      {/* Content Configuration */}
      <CCard className="mb-3">
        <CCardHeader>
          <strong>Content Configuration</strong>
        </CCardHeader>
        <CCardBody>
          {renderContentFields()}
          {isAdvancedType && (
            <CRow className="g-3 mt-1">
              <CCol md={12}>
                <CFormLabel>Advanced Content JSON</CFormLabel>
                <CFormTextarea
                  rows={14}
                  value={contentJson}
                  onChange={(e) => {
                    setContentJson(e.target.value)
                    setContentJsonError(null)
                  }}
                  placeholder='{"items":[{"title":"Item 1","imageUrl":"https://...","link":"/"}]}'
                  style={{ fontFamily: 'monospace', fontSize: '12px' }}
                />
                {contentJsonError && <small className="text-danger">{contentJsonError}</small>}
              </CCol>
            </CRow>
          )}
        </CCardBody>
      </CCard>

      {/* Settings */}
      <CCard className="mb-3">
        <CCardHeader>
          <strong>Display Settings</strong>
        </CCardHeader>
        <CCardBody>
          <CRow className="g-3">
            <CCol md={12}>
              <CFormCheck
                type="checkbox"
                id="dismissible"
                label="Allow users to dismiss this widget"
                checked={formData.settings?.dismissible || false}
                onChange={(e) => handleSettingChange('dismissible', e.target.checked)}
              />
            </CCol>

            <CCol md={6}>
              <CFormCheck
                type="checkbox"
                id="autoHide"
                label="Auto-hide widget after delay"
                checked={formData.settings?.autoHide || false}
                onChange={(e) => handleSettingChange('autoHide', e.target.checked)}
              />
            </CCol>

            {formData.settings?.autoHide && (
              <CCol md={6}>
                <CFormLabel>Auto-hide Delay (ms)</CFormLabel>
                <CFormInput
                  type="number"
                  min="0"
                  value={formData.settings?.autoHideDelay || 0}
                  onChange={(e) => handleSettingChange('autoHideDelay', parseInt(e.target.value) || 0)}
                />
              </CCol>
            )}

            <CCol md={6}>
              <CFormLabel>Start Date</CFormLabel>
              <CFormInput
                type="datetime-local"
                value={formData.settings?.startDate?.slice(0, 16) || ''}
                onChange={(e) => handleSettingChange('startDate', e.target.value)}
              />
            </CCol>

            <CCol md={6}>
              <CFormLabel>End Date</CFormLabel>
              <CFormInput
                type="datetime-local"
                value={formData.settings?.endDate?.slice(0, 16) || ''}
                onChange={(e) => handleSettingChange('endDate', e.target.value)}
              />
            </CCol>

            <CCol md={6}>
              <CFormLabel>Max Views per User</CFormLabel>
              <CFormInput
                type="number"
                min="0"
                placeholder="Leave empty for unlimited"
                value={formData.settings?.maxViews || ''}
                onChange={(e) =>
                  handleSettingChange('maxViews', e.target.value ? parseInt(e.target.value) : null)
                }
              />
            </CCol>

            <CCol md={6}>
              <CFormLabel>Show Only On Pages (comma-separated paths)</CFormLabel>
              <CFormInput
                type="text"
                value={formData.settings?.showOnPages?.join(', ') || ''}
                onChange={(e) =>
                  handleSettingChange(
                    'showOnPages',
                    e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                  )
                }
                placeholder="e.g., /home, /promotions"
              />
            </CCol>

            <CCol md={6}>
              <CFormLabel>Hide On Pages (comma-separated paths)</CFormLabel>
              <CFormInput
                type="text"
                value={formData.settings?.hideOnPages?.join(', ') || ''}
                onChange={(e) =>
                  handleSettingChange(
                    'hideOnPages',
                    e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                  )
                }
                placeholder="e.g., /login, /register"
              />
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>

      {/* Actions */}
      <div className="d-flex justify-content-end gap-2">
        <CButton color="secondary" onClick={onCancel} disabled={loading}>
          <CIcon icon={cilX} className="me-2" />
          Cancel
        </CButton>
        <CButton color="primary" type="submit" disabled={loading}>
          {loading ? (
            <>
              <CSpinner size="sm" className="me-2" />
              Saving...
            </>
          ) : (
            <>
              <CIcon icon={cilSave} className="me-2" />
              {isEditing ? 'Update Widget' : 'Create Widget'}
            </>
          )}
        </CButton>
      </div>
    </CForm>
  )
}

export default WidgetForm
