import React, { useState, useEffect } from 'react'
import {
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CFormSelect,
  CBadge,
  CProgress,
  CProgressBar,
} from '@coreui/react'
import { cilChartLine, cilFire, cilCursor } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import widgetService from '../../service/widgetService'
import { WIDGET_STATUS, STATUS_COLORS, WIDGET_TYPE_CONFIGS } from './widgetConstants'

const WidgetAnalytics = ({ widgets }) => {
  const [selectedWidget, setSelectedWidget] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(false)

  const getWidgetId = (widget) => widget?.id ?? widget?._id ?? null

  // Calculate summary statistics
  const stats = {
    total: widgets.length,
    active: widgets.filter((w) => w.status === WIDGET_STATUS.ACTIVE).length,
    totalViews: widgets.reduce((sum, w) => sum + (w.settings?.viewCount || 0), 0),
    avgPriority: widgets.length
      ? (widgets.reduce((sum, w) => sum + (w.priority || 0), 0) / widgets.length).toFixed(1)
      : 0,
  }

  // Top performing widgets
  const topWidgets = [...widgets]
    .sort((a, b) => (b.settings?.viewCount || 0) - (a.settings?.viewCount || 0))
    .slice(0, 5)

  // Widgets by type
  const widgetsByType = widgets.reduce((acc, widget) => {
    const type = widget.type
    if (!acc[type]) {
      acc[type] = { count: 0, views: 0 }
    }
    acc[type].count++
    acc[type].views += widget.settings?.viewCount || 0
    return acc
  }, {})

  // Fetch detailed analytics for selected widget
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!selectedWidget) {
        setAnalytics(null)
        return
      }

      try {
        setLoading(true)
        const response = await widgetService.getWidgetAnalytics(selectedWidget)
        setAnalytics(response.data || response)
      } catch (error) {
        console.error('Error fetching widget analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [selectedWidget])

  return (
    <>
      {/* Summary Statistics */}
      <CRow className="mb-4">
        <CCol sm={6} lg={3}>
          <CCard className="text-center">
            <CCardBody>
              <div className="fs-4 fw-semibold">{stats.total}</div>
              <div className="text-uppercase text-medium-emphasis small">Total Widgets</div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={6} lg={3}>
          <CCard className="text-center">
            <CCardBody>
              <div className="fs-4 fw-semibold text-success">{stats.active}</div>
              <div className="text-uppercase text-medium-emphasis small">Active Widgets</div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={6} lg={3}>
          <CCard className="text-center">
            <CCardBody>
              <div className="fs-4 fw-semibold text-info">{stats.totalViews}</div>
              <div className="text-uppercase text-medium-emphasis small">Total Views</div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={6} lg={3}>
          <CCard className="text-center">
            <CCardBody>
              <div className="fs-4 fw-semibold text-warning">{stats.avgPriority}</div>
              <div className="text-uppercase text-medium-emphasis small">Avg Priority</div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CRow>
        {/* Left Column */}
        <CCol lg={6}>
          {/* Top Performing Widgets */}
          <CCard className="mb-4">
            <CCardHeader>
              <strong>
                <CIcon icon={cilFire} className="me-2" />
                Top Performing Widgets
              </strong>
            </CCardHeader>
            <CCardBody>
              {topWidgets.length === 0 ? (
                <p className="text-muted">No widgets found</p>
              ) : (
                <CTable small>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Widget</CTableHeaderCell>
                      <CTableHeaderCell>Type</CTableHeaderCell>
                      <CTableHeaderCell className="text-end">Views</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {topWidgets.map((widget, index) => (
                      <CTableRow key={getWidgetId(widget) || `${widget.title || 'widget'}-${index}`}>
                        <CTableDataCell>
                          {widget.title || 'Untitled'}
                          <br />
                          <small className="text-muted">ID: {getWidgetId(widget) || 'N/A'}</small>
                        </CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={WIDGET_TYPE_CONFIGS[widget.type]?.color || 'secondary'}>
                            {WIDGET_TYPE_CONFIGS[widget.type]?.icon}{' '}
                            {WIDGET_TYPE_CONFIGS[widget.type]?.label || widget.type}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell className="text-end">
                          <strong>{widget.settings?.viewCount || 0}</strong>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              )}
            </CCardBody>
          </CCard>

          {/* Widgets by Type */}
          <CCard className="mb-4">
            <CCardHeader>
              <strong>
                <CIcon icon={cilChartLine} className="me-2" />
                Widgets by Type
              </strong>
            </CCardHeader>
            <CCardBody>
              {Object.entries(widgetsByType).map(([type, data]) => (
                <div key={type} className="mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <div>
                      <CBadge color={WIDGET_TYPE_CONFIGS[type]?.color || 'secondary'} className="me-2">
                        {WIDGET_TYPE_CONFIGS[type]?.icon} {WIDGET_TYPE_CONFIGS[type]?.label || type}
                      </CBadge>
                      <strong>{data.count}</strong> widget{data.count !== 1 ? 's' : ''}
                    </div>
                    <div>
                      <CIcon icon={cilChartLine} className="me-1" />
                      {data.views} views
                    </div>
                  </div>
                  <CProgress thin>
                    <CProgressBar
                      value={(data.count / stats.total) * 100}
                      color={WIDGET_TYPE_CONFIGS[type]?.color || 'secondary'}
                    />
                  </CProgress>
                </div>
              ))}
            </CCardBody>
          </CCard>
        </CCol>

        {/* Right Column */}
        <CCol lg={6}>
          {/* Widget Details */}
          <CCard className="mb-4">
            <CCardHeader>
              <strong>
                <CIcon icon={cilCursor} className="me-2" />
                Widget Details
              </strong>
            </CCardHeader>
            <CCardBody>
              <div className="mb-3">
                <CFormSelect
                  value={selectedWidget || ''}
                  onChange={(e) => setSelectedWidget(e.target.value || null)}
                >
                  <option value="">Select a widget to view details</option>
                  {widgets.map((widget, index) => {
                    const widgetId = getWidgetId(widget)
                    return (
                    <option key={widgetId || `widget-option-${index}`} value={widgetId || ''}>
                      {widget.title || 'Untitled'} (ID: {widgetId || 'N/A'})
                    </option>
                    )
                  })}
                </CFormSelect>
              </div>

              {loading ? (
                <p className="text-muted">Loading analytics...</p>
              ) : selectedWidget && widgets.find((w) => String(getWidgetId(w)) === String(selectedWidget)) ? (
                (() => {
                  const widget = widgets.find((w) => String(getWidgetId(w)) === String(selectedWidget))
                  return (
                    <div>
                      <h5>{widget.title || 'Untitled Widget'}</h5>
                      
                      <CTable small borderless>
                        <CTableBody>
                          <CTableRow>
                            <CTableDataCell className="text-muted">Type</CTableDataCell>
                            <CTableDataCell>
                              <CBadge color={WIDGET_TYPE_CONFIGS[widget.type]?.color || 'secondary'}>
                                {WIDGET_TYPE_CONFIGS[widget.type]?.label || widget.type}
                              </CBadge>
                            </CTableDataCell>
                          </CTableRow>
                          <CTableRow>
                            <CTableDataCell className="text-muted">Status</CTableDataCell>
                            <CTableDataCell>
                              <CBadge color={STATUS_COLORS[widget.status] || 'secondary'}>
                                {widget.status}
                              </CBadge>
                            </CTableDataCell>
                          </CTableRow>
                          <CTableRow>
                            <CTableDataCell className="text-muted">Position</CTableDataCell>
                            <CTableDataCell>{widget.position}</CTableDataCell>
                          </CTableRow>
                          <CTableRow>
                            <CTableDataCell className="text-muted">Priority</CTableDataCell>
                            <CTableDataCell>
                              <CBadge color="info">{widget.priority || 0}</CBadge>
                            </CTableDataCell>
                          </CTableRow>
                          <CTableRow>
                            <CTableDataCell className="text-muted">Display Mode</CTableDataCell>
                            <CTableDataCell>{widget.displayMode}</CTableDataCell>
                          </CTableRow>
                          <CTableRow>
                            <CTableDataCell className="text-muted">Total Views</CTableDataCell>
                            <CTableDataCell>
                              <strong>{widget.settings?.viewCount || 0}</strong>
                            </CTableDataCell>
                          </CTableRow>
                          <CTableRow>
                            <CTableDataCell className="text-muted">Created</CTableDataCell>
                            <CTableDataCell>
                              {widget.metadata?.createdAt
                                ? new Date(widget.metadata.createdAt).toLocaleDateString()
                                : 'N/A'}
                            </CTableDataCell>
                          </CTableRow>
                          <CTableRow>
                            <CTableDataCell className="text-muted">Last Updated</CTableDataCell>
                            <CTableDataCell>
                              {widget.metadata?.updatedAt
                                ? new Date(widget.metadata.updatedAt).toLocaleDateString()
                                : 'N/A'}
                            </CTableDataCell>
                          </CTableRow>
                        </CTableBody>
                      </CTable>

                      {widget.settings?.startDate && (
                        <div className="mt-3">
                          <h6>Schedule</h6>
                          <p className="small">
                            <strong>Start:</strong>{' '}
                            {new Date(widget.settings.startDate).toLocaleString()}
                            <br />
                            {widget.settings.endDate && (
                              <>
                                <strong>End:</strong>{' '}
                                {new Date(widget.settings.endDate).toLocaleString()}
                              </>
                            )}
                          </p>
                        </div>
                      )}

                      {widget.settings?.maxViews && (
                        <div className="mt-3">
                          <h6>View Limit</h6>
                          <CProgress>
                            <CProgressBar
                              value={
                                ((widget.settings.viewCount || 0) / widget.settings.maxViews) * 100
                              }
                              color="info"
                            >
                              {widget.settings.viewCount || 0} / {widget.settings.maxViews}
                            </CProgressBar>
                          </CProgress>
                        </div>
                      )}

                      {/* Additional analytics data if available */}
                      {analytics && (
                        <div className="mt-3">
                          <h6>Detailed Analytics</h6>
                          <CTable small borderless>
                            <CTableBody>
                              {analytics.clicks !== undefined && (
                                <CTableRow>
                                  <CTableDataCell className="text-muted">Clicks</CTableDataCell>
                                  <CTableDataCell>
                                    <strong>{analytics.clicks}</strong>
                                  </CTableDataCell>
                                </CTableRow>
                              )}
                              {analytics.dismissals !== undefined && (
                                <CTableRow>
                                  <CTableDataCell className="text-muted">Dismissals</CTableDataCell>
                                  <CTableDataCell>
                                    <strong>{analytics.dismissals}</strong>
                                  </CTableDataCell>
                                </CTableRow>
                              )}
                              {analytics.conversions !== undefined && (
                                <CTableRow>
                                  <CTableDataCell className="text-muted">Conversions</CTableDataCell>
                                  <CTableDataCell>
                                    <strong>{analytics.conversions}</strong>
                                  </CTableDataCell>
                                </CTableRow>
                              )}
                            </CTableBody>
                          </CTable>
                        </div>
                      )}
                    </div>
                  )
                })()
              ) : (
                <p className="text-muted">Select a widget to view analytics</p>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default WidgetAnalytics
