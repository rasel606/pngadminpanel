import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
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
  Filler,
} from 'chart.js'
import { Line, Pie } from 'react-chartjs-2'
import axios from 'axios'
import moment from 'moment-timezone'
import {
  cilArrowBottom,
  cilArrowTop,
  cilDollar,
  cilPeople,
  cilChartPie,
  cilStar,
  cilReload,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
)
import { getSecureHttpUrl } from '../../utils/socketUtils'

const API_BASE_URL = getSecureHttpUrl(import.meta.env.VITE_API_URL || 'https://api.tiger55.online/api')
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes cache

// Optimized cache manager
class CacheManager {
  static get(key) {
    try {
      const item = localStorage.getItem(`dashboard_${key}`)
      if (!item) return null
      
      const { data, timestamp } = JSON.parse(item)
      if (Date.now() - timestamp > CACHE_DURATION) {
        this.remove(key)
        return null
      }
      
      return data
    } catch {
      return null
    }
  }

  static set(key, data) {
    try {
      const item = {
        data,
        timestamp: Date.now(),
      }
      localStorage.setItem(`dashboard_${key}`, JSON.stringify(item))
    } catch {
      // Ignore storage errors
    }
  }

  static remove(key) {
    localStorage.removeItem(`dashboard_${key}`)
  }

  static clear() {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('dashboard_')) {
        localStorage.removeItem(key)
      }
    })
  }
}

// Debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

const AdvancedDashboardOptimized = () => {
  // State management
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const abortControllerRef = useRef(null)

  // Filters with debouncing
  const [filters, setFilters] = useState({
    startDate: moment().subtract(7, 'days').format('YYYY-MM-DD'),
    endDate: moment().format('YYYY-MM-DD'),
    timeZone: 'UTC',
  })

  const debouncedFilters = useDebounce(filters, 500)

  // Memoized cache key
  const cacheKey = useMemo(() => {
    return `${debouncedFilters.startDate}_${debouncedFilters.endDate}_${debouncedFilters.timeZone}`
  }, [debouncedFilters])

  // Optimized data fetch - single API call instead of 9
  const fetchDashboardData = useCallback(
    async (forceRefresh = false) => {
      // Check cache first
      if (!forceRefresh) {
        const cachedData = CacheManager.get(cacheKey)
        if (cachedData) {
          setDashboardData(cachedData)
          setLoading(false)
          return
        }
      }

      try {
        // Cancel previous request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort()
        }

        abortControllerRef.current = new AbortController()
        setLoading(true)
        setError(null)

        const token = localStorage.getItem('admin_auth_token')
        
        // Single optimized API call
        const response = await axios.get(`${API_BASE_URL}/dashboard/analytics/summary`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            startDate: debouncedFilters.startDate,
            endDate: debouncedFilters.endDate,
            timeZone: debouncedFilters.timeZone,
          },
          signal: abortControllerRef.current.signal,
        })

        if (response.data?.success) {
          const data = response.data.data
          setDashboardData(data)
          CacheManager.set(cacheKey, data)
        }

        setLoading(false)
      } catch (err) {
        if (err.name === 'AbortError') return
        
        console.error('Error fetching dashboard data:', err)
        setError('Failed to load dashboard data. Please refresh.')
        setLoading(false)
      }
    },
    [cacheKey, debouncedFilters],
  )

  // Fetch data on mount and filter changes
  useEffect(() => {
    fetchDashboardData()

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchDashboardData])

  // Handlers
  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleRefresh = () => {
    CacheManager.clear()
    fetchDashboardData(true)
    setToastMessage('Dashboard refreshed successfully')
    setShowToast(true)
  }

  // Memoized chart data
  const revenueChartData = useMemo(() => {
    if (!dashboardData?.timeSeries) return null

    return {
      labels: dashboardData.timeSeries.labels || [],
      datasets: [
        {
          label: 'Revenue',
          data: dashboardData.timeSeries.revenue || [],
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.1)',
          tension: 0.4,
          fill: true,
        },
      ],
    }
  }, [dashboardData?.timeSeries])

  const revenueBreakdownData = useMemo(() => {
    if (!dashboardData?.revenueBreakdown) return null

    return {
      labels: dashboardData.revenueBreakdown.labels || [],
      datasets: [
        {
          data: dashboardData.revenueBreakdown.data || [],
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)',
          ],
        },
      ],
    }
  }, [dashboardData?.revenueBreakdown])

  // Statistics Card Component
  const StatCard = React.memo(
    ({ icon: Icon, title, value, change, color = 'primary', suffix = '' }) => (
      <CCard className="mb-4 stat-card">
        <CCardBody className="p-4">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <small className="text-muted">{title}</small>
              <h3 className="mb-1">
                {typeof value === 'number' ? `${value.toLocaleString()}${suffix}` : value}
              </h3>
              {change !== undefined && (
                <CBadge color={change >= 0 ? 'success' : 'danger'} className="mt-2">
                  <CIcon icon={change >= 0 ? cilArrowTop : cilArrowBottom} className="me-1" />
                  {Math.abs(change).toFixed(1)}%
                </CBadge>
              )}
            </div>
            <div className={`text-${color} display-6`}>
              <CIcon icon={Icon} />
            </div>
          </div>
        </CCardBody>
      </CCard>
    ),
  )

  if (loading && !dashboardData) {
    return (
      <div className="text-center py-5">
        <CSpinner color="primary" />
        <p className="mt-3 text-muted">Loading dashboard...</p>
      </div>
    )
  }

  if (error && !dashboardData) {
    return (
      <CAlert color="danger" dismissible onClose={() => setError(null)}>
        {error}
        <CButton color="danger" size="sm" className="ms-3" onClick={handleRefresh}>
          Retry
        </CButton>
      </CAlert>
    )
  }

  return (
    <div className="advanced-dashboard">
      {/* Header Section */}
      <CRow className="mb-4">
        <CCol lg={12}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="m-0">⚡ Advanced Analytics Dashboard</h2>
            <CButton
              color="primary"
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              <CIcon icon={cilReload} className="me-1" />
              Refresh
            </CButton>
          </div>
        </CCol>
      </CRow>

      {/* Filters */}
      <CCard className="mb-4">
        <CCardBody>
          <CRow>
            <CCol md={4} className="mb-3">
              <CFormLabel>Start Date</CFormLabel>
              <CFormInput
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                max={filters.endDate}
              />
            </CCol>
            <CCol md={4} className="mb-3">
              <CFormLabel>End Date</CFormLabel>
              <CFormInput
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                min={filters.startDate}
                max={moment().format('YYYY-MM-DD')}
              />
            </CCol>
            <CCol md={4} className="mb-3">
              <CFormLabel>Time Zone</CFormLabel>
              <CFormSelect name="timeZone" value={filters.timeZone} onChange={handleFilterChange}>
                <option value="UTC">UTC</option>
                <option value="Asia/Dhaka">Asia/Dhaka (GMT+6)</option>
                <option value="America/New_York">New York (GMT-5)</option>
                <option value="Europe/London">London (GMT+0)</option>
              </CFormSelect>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>

      {loading && dashboardData && (
        <CAlert color="info" className="mb-3">
          <CSpinner size="sm" className="me-2" />
          Updating data...
        </CAlert>
      )}

      {/* Real-time Statistics Cards */}
      {dashboardData?.summary && (
        <CRow className="mb-4">
          <CCol md={6} lg={3} className="mb-3">
            <StatCard
              icon={cilDollar}
              title="Total Revenue"
              value={`$${dashboardData.summary.totalRevenue?.toLocaleString() || 0}`}
              change={dashboardData.summary.revenueChange}
              color="success"
            />
          </CCol>
          <CCol md={6} lg={3} className="mb-3">
            <StatCard
              icon={cilPeople}
              title="Total Users"
              value={dashboardData.summary.totalUsers || 0}
              change={dashboardData.summary.userChange}
              color="primary"
            />
          </CCol>
          <CCol md={6} lg={3} className="mb-3">
            <StatCard
              icon={cilStar}
              title="Active Users"
              value={dashboardData.summary.activeUsers || 0}
              change={dashboardData.summary.activeChange}
              color="info"
            />
          </CCol>
          <CCol md={6} lg={3} className="mb-3">
            <StatCard
              icon={cilChartPie}
              title="Total Bets"
              value={dashboardData.summary.totalBets || 0}
              change={dashboardData.summary.betsChange}
              color="warning"
            />
          </CCol>
        </CRow>
      )}

      {/* Revenue Trend Chart */}
      {revenueChartData && (
        <CRow className="mb-4">
          <CCol>
            <CCard>
              <CCardHeader>📈 Revenue Trend</CCardHeader>
              <CCardBody style={{ height: '300px' }}>
                <Line
                  data={revenueChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: true,
                        position: 'top',
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }}
                />
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      )}

      {/* Revenue Breakdown */}
      {revenueBreakdownData && (
        <CRow className="mb-4">
          <CCol md={6}>
            <CCard>
              <CCardHeader>💰 Revenue Breakdown</CCardHeader>
              <CCardBody style={{ height: '300px' }}>
                <Pie
                  data={revenueBreakdownData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                      },
                    },
                  }}
                />
              </CCardBody>
            </CCard>
          </CCol>
          <CCol md={6}>
            <CCard>
              <CCardHeader>📊 Top Games</CCardHeader>
              <CCardBody style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <CTable striped hover size="sm">
                  <CTableHead>
                    <tr>
                      <CTableHeaderCell>Game</CTableHeaderCell>
                      <CTableHeaderCell>Bets</CTableHeaderCell>
                      <CTableHeaderCell>Amount</CTableHeaderCell>
                    </tr>
                  </CTableHead>
                  <CTableBody>
                    {dashboardData?.topGames?.slice(0, 10).map((game, idx) => (
                      <tr key={idx}>
                        <CTableDataCell>{game.name || game._id}</CTableDataCell>
                        <CTableDataCell>{game.count}</CTableDataCell>
                        <CTableDataCell>${game.amount?.toLocaleString()}</CTableDataCell>
                      </tr>
                    ))}
                  </CTableBody>
                </CTable>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      )}

      {/* Transaction Summary */}
      {dashboardData?.transactions && (
        <CRow className="mb-4">
          <CCol>
            <CCard>
              <CCardHeader>💳 Transaction Summary</CCardHeader>
              <CCardBody>
                <CRow className="text-center">
                  <CCol md={3}>
                    <div className="p-3">
                      <h5 className="text-success">${dashboardData.transactions.deposits?.toLocaleString()}</h5>
                      <small className="text-muted">Total Deposits</small>
                    </div>
                  </CCol>
                  <CCol md={3}>
                    <div className="p-3">
                      <h5 className="text-danger">${dashboardData.transactions.withdrawals?.toLocaleString()}</h5>
                      <small className="text-muted">Total Withdrawals</small>
                    </div>
                  </CCol>
                  <CCol md={3}>
                    <div className="p-3">
                      <h5 className="text-warning">{dashboardData.transactions.pending || 0}</h5>
                      <small className="text-muted">Pending</small>
                    </div>
                  </CCol>
                  <CCol md={3}>
                    <div className="p-3">
                      <h5 className="text-info">{dashboardData.transactions.successRate || 0}%</h5>
                      <small className="text-muted">Success Rate</small>
                    </div>
                  </CCol>
                </CRow>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      )}

      {/* Quick Stats */}
      {dashboardData?.quickStats && (
        <CRow className="mb-4">
          <CCol md={6}>
            <CCard>
              <CCardHeader>🎯 User Statistics</CCardHeader>
              <CCardBody>
                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-2">
                    <small>New Users (Last 7 days)</small>
                    <strong>{dashboardData.quickStats.newUsers || 0}</strong>
                  </div>
                  <div className="progress" style={{ height: '5px' }}>
                    <div className="progress-bar bg-primary" style={{ width: '100%' }}></div>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-2">
                    <small>Active Today</small>
                    <strong>{dashboardData.quickStats.activeToday || 0}</strong>
                  </div>
                  <div className="progress" style={{ height: '5px' }}>
                    <div className="progress-bar bg-success" style={{ width: '100%' }}></div>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-2">
                    <small>VIP Users</small>
                    <strong>{dashboardData.quickStats.vipUsers || 0}</strong>
                  </div>
                  <div className="progress" style={{ height: '5px' }}>
                    <div className="progress-bar bg-warning" style={{ width: '100%' }}></div>
                  </div>
                </div>
              </CCardBody>
            </CCard>
          </CCol>
          <CCol md={6}>
            <CCard>
              <CCardHeader>📱 Real-time Activity</CCardHeader>
              <CCardBody>
                <div className="mb-3 d-flex justify-content-between">
                  <small>Online Users</small>
                  <strong className="text-primary">{dashboardData.quickStats.onlineUsers || 0}</strong>
                </div>
                <div className="mb-3 d-flex justify-content-between">
                  <small>Active Bets</small>
                  <strong>{dashboardData.quickStats.activeBets || 0}</strong>
                </div>
                <div className="mb-3 d-flex justify-content-between">
                  <small>Pending Withdrawals</small>
                  <strong className="text-warning">
                    {dashboardData.quickStats.pendingWithdrawals || 0}
                  </strong>
                </div>
                <div className="mt-3 pt-3 border-top">
                  <small className="text-muted">Last Update</small>
                  <p className="mb-0">{moment().format('LLL')}</p>
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      )}

      {/* Toast Notification */}
      <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999 }}>
        <CToast
          autohide={true}
          delay={3000}
          visible={showToast}
          onClose={() => setShowToast(false)}
          color="success"
        >
          <CToastBody>{toastMessage}</CToastBody>
        </CToast>
      </div>
    </div>
  )
}

export default AdvancedDashboardOptimized
