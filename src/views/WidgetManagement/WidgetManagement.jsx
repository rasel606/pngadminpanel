import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CButton,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CBadge,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilList, cilChartLine, cilSettings } from '@coreui/icons'
import WidgetList from './WidgetList'
import WidgetForm from './WidgetForm'
import WidgetAnalytics from './WidgetAnalytics'
import widgetService from '../../service/widgetService'
import { WIDGET_STATUS } from './widgetConstants'

const WidgetManagement = () => {
  const [activeTab, setActiveTab] = useState('list')
  const [widgets, setWidgets] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedWidget, setSelectedWidget] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    position: '',
  })

  // Load widgets
  const loadWidgets = async () => {
    try {
      setLoading(true)
      const response = await widgetService.getAllWidgets(filters)
      setWidgets(response.widgets || response.data?.widgets || [])
    } catch (error) {
      console.error('Error loading widgets:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWidgets()
  }, [filters])

  // Calculate stats
  const stats = {
    total: widgets.length,
    active: widgets.filter((w) => w.status === WIDGET_STATUS.ACTIVE).length,
    inactive: widgets.filter((w) => w.status === WIDGET_STATUS.INACTIVE).length,
    draft: widgets.filter((w) => w.status === WIDGET_STATUS.DRAFT).length,
  }

  // Handle create new widget
  const handleCreate = () => {
    setSelectedWidget(null)
    setIsEditing(false)
    setActiveTab('form')
  }

  // Handle edit widget
  const handleEdit = (widget) => {
    setSelectedWidget(widget)
    setIsEditing(true)
    setActiveTab('form')
  }

  // Handle delete widget
  const handleDelete = async (widgetId) => {
    if (window.confirm('Are you sure you want to delete this widget?')) {
      try {
        await widgetService.deleteWidget(widgetId)
        await loadWidgets()
      } catch (error) {
        console.error('Error deleting widget:', error)
        alert('Failed to delete widget')
      }
    }
  }

  // Handle clone widget
  const handleClone = async (widgetId) => {
    try {
      await widgetService.cloneWidget(widgetId)
      await loadWidgets()
      alert('Widget cloned successfully!')
    } catch (error) {
      console.error('Error cloning widget:', error)
      alert('Failed to clone widget')
    }
  }

  // Handle status toggle
  const handleStatusToggle = async (widgetId, currentStatus) => {
    const newStatus =
      currentStatus === WIDGET_STATUS.ACTIVE ? WIDGET_STATUS.INACTIVE : WIDGET_STATUS.ACTIVE
    try {
      await widgetService.updateWidgetStatus(widgetId, newStatus)
      await loadWidgets()
    } catch (error) {
      console.error('Error updating widget status:', error)
      alert('Failed to update widget status')
    }
  }

  // Handle form save
  const handleSave = async () => {
    await loadWidgets()
    setActiveTab('list')
    setSelectedWidget(null)
    setIsEditing(false)
  }

  // Handle form cancel
  const handleCancel = () => {
    setActiveTab('list')
    setSelectedWidget(null)
    setIsEditing(false)
  }

  // Handle filter change
  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <strong className="me-3">Widget Management</strong>
              <div className="d-flex gap-2">
                <CBadge color="info">Total: {stats.total}</CBadge>
                <CBadge color="success">Active: {stats.active}</CBadge>
                <CBadge color="secondary">Inactive: {stats.inactive}</CBadge>
                <CBadge color="warning">Draft: {stats.draft}</CBadge>
              </div>
            </div>
            <CButton
              color="primary"
              onClick={handleCreate}
              disabled={loading}
            >
              <CIcon icon={cilPlus} className="me-2" />
              Create Widget
            </CButton>
          </CCardHeader>

          <CCardBody>
            {/* Tabs Navigation */}
            <CNav variant="tabs" className="mb-3">
              <CNavItem>
                <CNavLink
                  active={activeTab === 'list'}
                  onClick={() => setActiveTab('list')}
                  style={{ cursor: 'pointer' }}
                >
                  <CIcon icon={cilList} className="me-2" />
                  Widget List
                </CNavLink>
              </CNavItem>
              {(isEditing || activeTab === 'form') && (
                <CNavItem>
                  <CNavLink
                    active={activeTab === 'form'}
                    onClick={() => setActiveTab('form')}
                    style={{ cursor: 'pointer' }}
                  >
                    <CIcon icon={cilSettings} className="me-2" />
                    {isEditing ? 'Edit Widget' : 'Create Widget'}
                  </CNavLink>
                </CNavItem>
              )}
              <CNavItem>
                <CNavLink
                  active={activeTab === 'analytics'}
                  onClick={() => setActiveTab('analytics')}
                  style={{ cursor: 'pointer' }}
                >
                  <CIcon icon={cilChartLine} className="me-2" />
                  Analytics
                </CNavLink>
              </CNavItem>
            </CNav>

            {/* Tab Content */}
            {loading && activeTab === 'list' ? (
              <div className="text-center py-5">
                <CSpinner color="primary" />
                <p className="mt-3">Loading widgets...</p>
              </div>
            ) : (
              <CTabContent>
                {/* List Tab */}
                <CTabPane visible={activeTab === 'list'}>
                  <WidgetList
                    widgets={widgets}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onClone={handleClone}
                    onStatusToggle={handleStatusToggle}
                    onRefresh={loadWidgets}
                  />
                </CTabPane>

                {/* Form Tab */}
                <CTabPane visible={activeTab === 'form'}>
                  <WidgetForm
                    widget={selectedWidget}
                    isEditing={isEditing}
                    onSave={handleSave}
                    onCancel={handleCancel}
                  />
                </CTabPane>

                {/* Analytics Tab */}
                <CTabPane visible={activeTab === 'analytics'}>
                  <WidgetAnalytics widgets={widgets} />
                </CTabPane>
              </CTabContent>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default WidgetManagement
