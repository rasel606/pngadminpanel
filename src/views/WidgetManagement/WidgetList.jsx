import React, { useState } from 'react'
import {
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CBadge,
  CButton,
  CButtonGroup,
  CFormSelect,
  CInputGroup,
  CFormInput,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CTooltip,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilPencil,
  cilTrash,
  cilCopy,
  cilCheckCircle,
  cilXCircle,
  cilSearch,
} from '@coreui/icons'
import {
  WIDGET_TYPES,
  WIDGET_POSITIONS,
  WIDGET_STATUS,
  WIDGET_TYPE_CONFIGS,
  POSITION_LABELS,
  STATUS_COLORS,
} from './widgetConstants'

const WidgetList = ({
  widgets,
  filters,
  onFilterChange,
  onEdit,
  onDelete,
  onClone,
  onStatusToggle,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('')

  // Filter and search widgets
  const filteredWidgets = widgets.filter((widget) => {
    const matchesSearch =
      searchTerm === '' ||
      widget.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      widget.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      widget.content?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      widget.type?.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

  // Sort by priority and creation date
  const sortedWidgets = [...filteredWidgets].sort((a, b) => {
    if (a.priority !== b.priority) {
      return (b.priority || 0) - (a.priority || 0)
    }
    return new Date(b.createdAt || b.metadata?.createdAt || 0) - new Date(a.createdAt || a.metadata?.createdAt || 0)
  })

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <>
      {/* Filters */}
      <CCard className="mb-3">
        <CCardBody>
          <CRow className="g-3">
            <CCol md={3}>
              <CInputGroup>
                <span className="input-group-text">
                  <CIcon icon={cilSearch} />
                </span>
                <CFormInput
                  placeholder="Search widgets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </CInputGroup>
            </CCol>
            <CCol md={3}>
              <CFormSelect
                value={filters.status}
                onChange={(e) => onFilterChange({ status: e.target.value })}
              >
                <option value="">All Statuses</option>
                {Object.values(WIDGET_STATUS).map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={3}>
              <CFormSelect
                value={filters.type}
                onChange={(e) => onFilterChange({ type: e.target.value })}
              >
                <option value="">All Types</option>
                {Object.entries(WIDGET_TYPE_CONFIGS).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.icon} {config.label}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={3}>
              <CFormSelect
                value={filters.position}
                onChange={(e) => onFilterChange({ position: e.target.value })}
              >
                <option value="">All Positions</option>
                {Object.entries(POSITION_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>

      {/* Widgets Table */}
      {sortedWidgets.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted">No widgets found</p>
        </div>
      ) : (
        <CTable hover responsive>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell scope="col">Type</CTableHeaderCell>
              <CTableHeaderCell scope="col">Title</CTableHeaderCell>
              <CTableHeaderCell scope="col">Position</CTableHeaderCell>
              <CTableHeaderCell scope="col">Status</CTableHeaderCell>
              <CTableHeaderCell scope="col">Priority</CTableHeaderCell>
              <CTableHeaderCell scope="col">Display Mode</CTableHeaderCell>
              <CTableHeaderCell scope="col">Schedule</CTableHeaderCell>
              <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {sortedWidgets.map((widget) => (
              <CTableRow key={widget._id || widget.id}>
                <CTableDataCell>
                  <CBadge color={WIDGET_TYPE_CONFIGS[widget.type]?.color || 'secondary'}>
                    {WIDGET_TYPE_CONFIGS[widget.type]?.icon || ''}{' '}
                    {WIDGET_TYPE_CONFIGS[widget.type]?.label || widget.type}
                  </CBadge>
                </CTableDataCell>

                <CTableDataCell>
                  <strong>{widget.title || widget.name || 'Untitled'}</strong>
                  <br />
                  <small className="text-muted">ID: {widget._id || widget.id}</small>
                </CTableDataCell>

                <CTableDataCell>
                  <small>{POSITION_LABELS[widget.position] || widget.position}</small>
                </CTableDataCell>

                <CTableDataCell>
                  <CBadge color={STATUS_COLORS[widget.status] || 'secondary'}>
                    {widget.status}
                  </CBadge>
                </CTableDataCell>

                <CTableDataCell className="text-center">
                  <CBadge color="info">{widget.priority || 0}</CBadge>
                </CTableDataCell>

                <CTableDataCell>
                  <small>{widget.displayMode || 'always'}</small>
                </CTableDataCell>

                <CTableDataCell>
                  <small>
                    {widget.settings?.startDate ? (
                      <>
                        <div>Start: {formatDate(widget.settings.startDate)}</div>
                        {widget.settings?.endDate && (
                          <div>End: {formatDate(widget.settings.endDate)}</div>
                        )}
                      </>
                    ) : (
                      'No schedule'
                    )}
                  </small>
                </CTableDataCell>

                <CTableDataCell>
                  <CButtonGroup size="sm">
                    <CTooltip content={widget.status === WIDGET_STATUS.ACTIVE ? 'Deactivate' : 'Activate'}>
                      <CButton
                        color={widget.status === WIDGET_STATUS.ACTIVE ? 'success' : 'secondary'}
                        variant="ghost"
                        onClick={() => onStatusToggle(widget._id || widget.id, widget.status)}
                      >
                        <CIcon icon={widget.status === WIDGET_STATUS.ACTIVE ? cilCheckCircle : cilXCircle} />
                      </CButton>
                    </CTooltip>

                    <CTooltip content="Edit">
                      <CButton color="primary" variant="ghost" onClick={() => onEdit(widget)}>
                        <CIcon icon={cilPencil} />
                      </CButton>
                    </CTooltip>

                    <CTooltip content="Clone">
                      <CButton color="info" variant="ghost" onClick={() => onClone(widget._id || widget.id)}>
                        <CIcon icon={cilCopy} />
                      </CButton>
                    </CTooltip>

                    <CTooltip content="Delete">
                      <CButton color="danger" variant="ghost" onClick={() => onDelete(widget._id || widget.id)}>
                        <CIcon icon={cilTrash} />
                      </CButton>
                    </CTooltip>
                  </CButtonGroup>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      )}

      <div className="text-end mt-3">
        <small className="text-muted">
          Showing {sortedWidgets.length} of {widgets.length} widgets
        </small>
      </div>
    </>
  )
}

export default WidgetList
