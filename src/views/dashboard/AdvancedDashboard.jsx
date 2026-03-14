import React, { useState, useEffect, useCallback } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CButton,
  CBadge,
  CSpinner,
  CToast,
  CToastBody,
  CAlert,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CTable,
  CTableHead,
  CTableBody,
  CTableHeaderCell,
  CTableDataCell,
} from '@coreui/react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line, Bar, Pie } from 'react-chartjs-2'
import moment from 'moment'
import {
  cilArrowBottom,
  cilArrowTop,
  cilDollar,
  cilPeople,
  cilChartPie,
  cilReload,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { apiService, dashboard } from 'src/service/api'

// ChartJS register
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

const AdvancedDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [realtimeStats, setRealtimeStats] = useState(null)
  const [providerStats, setProviderStats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [filters, setFilters] = useState({
    startDate: moment().subtract(30, 'days').format('YYYY-MM-DD'),
    endDate: moment().format('YYYY-MM-DD'),
  })

  // Set token for apiService
  useEffect(() => {
    const token = localStorage.getItem('adminToken') // or 'token'
    if (token) {
      apiService.setToken(token)
    }
  }, [])

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const [advancedRes, realtimeRes, providerRes] = await Promise.all([
        dashboard.getAdvancedDashboard(filters),
        dashboard.getRealtimeStats(),
        dashboard.getProviderStats()
      ])

      setDashboardData(advancedRes)
      setRealtimeStats(realtimeRes)
      setProviderStats(providerRes || [])
      setLoading(false)
    } catch (err) {
      console.error('Dashboard fetch error:', err)
      setError(err.message || 'Failed to load dashboard')
      setLoading(false)
    }
  }, [filters])

  // Poll realtime every 30s
  useEffect(() => {
    fetchDashboardData()
    const interval = setInterval(() => {
      dashboard.getRealtimeStats().then(setRealtimeStats)
    }, 30000)
    return () => clearInterval(interval)
  }, [fetchDashboardData])

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const handleExport = () => {
    const dataStr = JSON.stringify(dashboardData, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
    const link = document.createElement('a')
    link.setAttribute('href', dataUri)
    link.setAttribute('download', `dashboard-${moment().format('YYYY-MM-DD')}.json`)
    link.click()
    setToastMessage('Dashboard exported as JSON')
    setShowToast(true)
  }

  const StatCard = ({ title, value, change, color = 'primary', icon: Icon }) => (
    <CCard className="mb-4">
      <CCardBody className="p-4">
        <div className="d-flex justify-content-between">
          <div>
            <small className="text-muted">{title}</small>
            <h3 className="mt-1 mb-0">{value}</h3>
            {change && (
              <CBadge color={change >= 0 ? 'success' : 'danger'}>
                <CIcon icon={change >= 0 ? cilArrowTop : cilArrowBottom} className="me-1" />
                {Math.abs(change)}%
              </CBadge>
            )}
          </div>
          <div className={`text-${color} fs-1`}>
            <CIcon icon={Icon} />
          </div>
        </div>
      </CCardBody>
    </CCard>
  )

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <CSpinner color="primary" />
      </div>
    )
  }

  if (error) {
    return (
      <CAlert color="danger" className="mb-4">
        {error}
        <CButton color="primary" className="ms-3" onClick={fetchDashboardData}>
          Retry
        </CButton>
      </CAlert>
    )
  }

  const summary = dashboardData?.summary || {}
  const growth = dashboardData?.growth || {}

  // Mock time series for chart (use real getTimeSeriesData later)
  const chartData = {
    labels: ['30d ago', '25d', '20d', '15d', '10d', '5d', 'Today'],
    datasets: [{
      label: 'Revenue',
      data: [12000, 19000, 15000, 22000, 28000, 25000, summary.revenue || 32000],
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.4,
      fill: true,
      backgroundColor: 'rgba(75, 192, 192, 0.1)'
    }]
  }

  const pieData = {
    labels: ['Deposits', 'Bets Revenue', 'Commissions', 'Other'],
    datasets: [{
      data: [summary.totalDeposits || 0, (summary.revenue || 0) * 0.6, summary.totalCommissions || 0, (summary.revenue || 0) * 0.1],
      backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0']
    }]
  }

  return (
    <div>
      {/* Header & Filters */}
      <CRow className="mb-4">
        <CCol>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2>Advanced Dashboard</h2>
            <div>
              <CButton color="secondary" className="me-2" onClick={handleExport}>
                <CIcon icon={cilArrowBottom} className="me-1" /> Export
              </CButton>
              <CButton color="info" onClick={fetchDashboardData}>
                <CIcon icon={cilReload} className="me-1" /> Refresh
              </CButton>
            </div>
          </div>
          <CCard className="mb-4">
            <CCardBody>
              <CRow>
                <CCol md={4}>
                  <CFormLabel>Start Date</CFormLabel>
                  <CFormInput type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
                </CCol>
                <CCol md={4}>
                  <CFormLabel>End Date</CFormLabel>
                  <CFormInput type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* KPIs */}
      <CRow className="mb-4">
        <CCol lg={3} md={6}>
          <StatCard
            title="Total Users"
            value={summary.totalUsers?.toLocaleString() || 0}
            Icon={cilPeople}
            color="primary"
          />
        </CCol>
        <CCol lg={3} md={6}>
          <StatCard
            title="Online Users"
            value={summary.onlineUsers || realtimeStats?.onlineUsers || 0}
            Icon={cilPeople}
            color="info"
          />
        </CCol>
        <CCol lg={3} md={6}>
          <StatCard
            title="Revenue"
            value={`$${summary.revenue ? parseFloat(summary.revenue).toLocaleString() : 0}`}
            Icon={cilDollar}
            color="success"
          />
        </CCol>
        <CCol lg={3} md={6}>
          <StatCard
            title="Total Bets"
            value={summary.totalBets?.toLocaleString() || 0}
            Icon={cilChartPie}
            color="warning"
          />
        </CCol>
        <CCol lg={3} md={6}>
          <StatCard
            title="Deposits"
            value={`$${summary.totalDeposits ? parseFloat(summary.totalDeposits).toLocaleString() : 0}`}
            change={growth.depositGrowth}
            Icon={cilDollar}
            color="success"
          />
        </CCol>
        <CCol lg={3} md={6}>
          <StatCard
            title="Profit"
            value={`$${summary.profit ? parseFloat(summary.profit).toLocaleString() : 0}`}
            Icon={cilDollar}
            color="success"
          />
        </CCol>
      </CRow>

      {/* Charts */}
      <CRow className="mb-4">
        <CCol lg={8}>
          <CCard>
            <CCardHeader>Revenue Trend (Last 30 Days)</CCardHeader>
            <CCardBody>
              <Line data={chartData} />
            </CCardBody>
          </CCard>
        </CCol>
        <CCol lg={4}>
          <CCard>
            <CCardHeader>Revenue Breakdown</CCardHeader>
            <CCardBody>
              <Pie data={pieData} />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Top Providers */}
      <CRow className="mb-4">
        <CCol>
          <CCard>
            <CCardHeader>Top Providers</CCardHeader>
            <CCardBody>
              <CTable responsive>
                <CTableHead>
                  <CTableHeaderCell>Provider</CTableHeaderCell>
                  <CTableHeaderCell>Bets</CTableHeaderCell>
                  <CTableHeaderCell>Revenue</CTableHeaderCell>
                </CTableHead>
                <CTableBody>
                  {providerStats.slice(0, 10).map((provider, idx) => (
                    <tr key={idx}>
                      <CTableDataCell>{provider.providerInfo?.[0]?.name || provider._id}</CTableDataCell>
                      <CTableDataCell>{provider.bets || 0}</CTableDataCell>
                      <CTableDataCell>${provider.revenue?.toLocaleString() || 0}</CTableDataCell>
                    </tr>
                  ))}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Toast */}
      <CToast
        visible={showToast}
        autohide={4000}
        fade
        className="position-fixed top-0 end-0 m-3"
        onClose={() => setShowToast(false)}
      >
        <CToastBody>{toastMessage}</CToastBody>
      </CToast>
    </div>
  )
}

export default AdvancedDashboard

