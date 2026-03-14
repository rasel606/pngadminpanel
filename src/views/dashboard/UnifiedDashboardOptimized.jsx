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
  CAlert,
  CFormSelect,
  CFormInput,
  CFormLabel,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
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
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import moment from 'moment'
import {
  cilPeople,
  cilMoney,
  cilGamepad,
  cilStar,
  cilReload,
  cilUserFollow,
  cilChartLine,
  cilCreditCard,
  cilGift,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { apiService, dashboard } from 'src/service/api'

// Register charts
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

const CACHE_DURATION = 5 * 60 * 1000 // 5 min

const CacheManager = {
  get(key) {
    const cached = localStorage.getItem(`cache_${key}`)
    if (!cached) return null
    const { data, timestamp } = JSON.parse(cached)
    if (Date.now() - timestamp > CACHE_DURATION) {
      this.remove(key)
      return null
    }
    return data
  },
  set(key, data) {
    localStorage.setItem(`cache_${key}`, JSON.stringify({ data, timestamp: Date.now() }))
  },
  remove(key) {
    localStorage.removeItem(`cache_${key}`)
  },
  clear() {
    Object.keys(localStorage).filter(k => k.startsWith('cache_')).forEach(k => localStorage.removeItem(k))
  }
}

const UnifiedDashboardOptimized = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dashboardData, setDashboardData] = useState(null)
  const [realtimeStats, setRealtimeStats] = useState(null)
  const [filters, setFilters] = useState({
    startDate: moment().subtract(7, 'days').format('YYYY-MM-DD'),
    endDate: moment().format('YYYY-MM-DD'),
    timeZone: 'UTC',
  })
  const [liveUpdates, setLiveUpdates] = useState(true)
  const [page, setPage] = useState(1)
  const pageSize = 10

  useEffect(() => {
    const token =
      localStorage.getItem('admin_auth_token') ||
      localStorage.getItem('adminToken') ||
      localStorage.getItem('token')
    if (token) apiService.setToken(token)
  }, [])

  const fetchDashboardData = useCallback(async (useCache = true) => {
    try {
      setLoading(true)
      setError(null)

      const cacheKey = `unified_${JSON.stringify(filters)}`
      if (useCache) {
        const cached = CacheManager.get(cacheKey)
        if (cached) {
          setDashboardData(cached)
          setLoading(false)
          return
        }
      }

      const [unifiedRes, realtimeRes] = await Promise.all([
        dashboard.getUnifiedDashboard(filters),
        dashboard.getRealtimeStats()
      ])

      const data = unifiedRes || {}
      setDashboardData(data)
      setRealtimeStats(realtimeRes)
      CacheManager.set(cacheKey, data)
    } catch (err) {
      setError(err.message || 'Failed to load data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchDashboardData()
    const interval = setInterval(() => liveUpdates && dashboard.getRealtimeStats().then(setRealtimeStats), 30000)
    return () => clearInterval(interval)
  }, [fetchDashboardData, liveUpdates])

  const handleRefresh = () => {
    CacheManager.clear()
    fetchDashboardData(false)
  }

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }))
    setPage(1)
  }

  const summary = dashboardData?.summary || {}
  const transactions = dashboardData?.transactions || {}
  const betting = dashboardData?.betting || {}
  const bonuses = dashboardData?.bonuses || {}
  const recentUsers = Array.isArray(dashboardData?.recentUsers) ? dashboardData.recentUsers : []
  const totalPages = Math.max(1, Math.ceil(recentUsers.length / pageSize))
  const pagedUsers = recentUsers.slice((page - 1) * pageSize, page * pageSize)
  const totalDeposits = Number(transactions?.deposits?.total || 0)
  const totalWithdrawals = Number(transactions?.withdrawals?.total || 0)
  const revenue = Number(summary.revenue || 0)
  const expenses = Number(summary.expenses || 0)
  const profit = Number(summary.profit || 0)

  const transactionChartData = {
    labels: ['Deposits', 'Withdrawals', 'Net'],
    datasets: [{
      data: [
        totalDeposits,
        totalWithdrawals,
        profit
      ],
      backgroundColor: ['#36A2EB', '#FF6384', '#4BC0C0']
    }]
  }

  const financeChartData = {
    labels: ['Revenue', 'Expenses', 'Profit'],
    datasets: [{
      data: [revenue, expenses, profit],
      backgroundColor: ['#36A2EB', '#FF9F40', '#4BC0C0']
    }]
  }

  const StatCard = ({ title, value, subtitle, icon, color }) => (
    <CCard className="mb-4 hover-card">
      <CCardBody>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <div className="text-medium-emphasis small">{title}</div>
            <div className="fs-4 fw-semibold mt-1">{value}</div>
            {subtitle && <div className="small text-medium-emphasis mt-1">{subtitle}</div>}
          </div>
          <CIcon icon={icon} size="3xl" className={`text-${color}`} />
        </div>
      </CCardBody>
    </CCard>
  )

  if (loading && !dashboardData) {
    return <div className="text-center py-5"><CSpinner /> <p>Loading...</p></div>
  }

  return (
    <div>
      <CRow className="mb-4">
        <CCol>
          <h2>Unified Dashboard</h2>
          <p>Last update: {dashboardData?.timestamp ? moment(dashboardData.timestamp).fromNow() : 'just now'}</p>
        </CCol>
        <CCol xs="auto">
          <CButton color="primary" onClick={handleRefresh}><CIcon icon={cilReload} /> Refresh</CButton>
          <CButton color={liveUpdates ? 'success' : 'outline'} className="ms-2" onClick={() => setLiveUpdates(p => !p)}>
            Live: {liveUpdates ? 'ON' : 'OFF'}
          </CButton>
        </CCol>
      </CRow>

      {/* Filters */}
      <CCard className="mb-4">
        <CCardBody>
          <CRow>
            <CCol md={3}>
              <CFormLabel>Start</CFormLabel>
              <CFormInput type="date" value={filters.startDate} onChange={e => handleFilterChange('startDate', e.target.value)} />
            </CCol>
            <CCol md={3}>
              <CFormLabel>End</CFormLabel>
              <CFormInput type="date" value={filters.endDate} onChange={e => handleFilterChange('endDate', e.target.value)} />
            </CCol>
            <CCol md={3}>
              <CFormLabel>Timezone</CFormLabel>
              <CFormSelect value={filters.timeZone} onChange={e => handleFilterChange('timeZone', e.target.value)}>
                <option>UTC</option>
                <option>Asia/Dhaka</option>
              </CFormSelect>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>

      {/* Stats */}
      <CRow>
        <CCol lg={3}>
          <StatCard title="Total Users" value={summary.totalUsers?.toLocaleString?.() || summary.totalUsers || 0} icon={cilPeople} color="primary" subtitle={`${realtimeStats?.onlineUsers || summary.onlineUsers || 0} online`} />
        </CCol>
        <CCol lg={3}>
          <StatCard title="Revenue" value={`$${revenue.toLocaleString()}`} icon={cilMoney} color="success" subtitle={`Profit $${profit.toLocaleString()}`} />
        </CCol>
        <CCol lg={3}>
          <StatCard title="Total Bets" value={betting.totalBets?.toLocaleString?.() || betting.totalBets || 0} icon={cilGamepad} color="warning" />
        </CCol>
        <CCol lg={3}>
          <StatCard title="Agents" value={summary.totalAgents?.toLocaleString?.() || summary.totalAgents || 0} icon={cilUserFollow} color="info" />
        </CCol>
        <CCol lg={3}>
          <StatCard title="Affiliates" value={summary.totalAffiliates?.toLocaleString?.() || summary.totalAffiliates || 0} icon={cilUserFollow} color="secondary" />
        </CCol>
        <CCol lg={3}>
          <StatCard title="Deposits" value={`$${totalDeposits.toLocaleString()}`} icon={cilCreditCard} color="success" />
        </CCol>
        <CCol lg={3}>
          <StatCard title="VIP Users" value={summary.vipUsers?.toLocaleString?.() || summary.vipUsers || 0} icon={cilStar} color="warning" />
        </CCol>
        <CCol lg={3}>
          <StatCard title="Bonuses" value={`$${Number(bonuses.totalPaid || 0).toLocaleString()}`} icon={cilGift} color="danger" />
        </CCol>
      </CRow>

      {/* Charts */}
      <CRow className="mt-4">
        <CCol lg={6}>
          <CCard>
            <CCardHeader>Transaction Overview</CCardHeader>
            <CCardBody><Bar data={transactionChartData} /></CCardBody>
          </CCard>
        </CCol>
        <CCol lg={6}>
          <CCard>
            <CCardHeader>Financials</CCardHeader>
            <CCardBody><Doughnut data={financeChartData} /></CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Recent Users */}
      <CCol lg={12} className="mt-4">
        <CCard>
          <CCardHeader>Recent Users</CCardHeader>
          <CCardBody>
            <CTable hover>
              <CTableHead>
                <CTableHeaderCell>User</CTableHeaderCell>
                <CTableHeaderCell>Balance</CTableHeaderCell>
                <CTableHeaderCell>Joined</CTableHeaderCell>
              </CTableHead>
              <CTableBody>
                {pagedUsers.map((u, i) => (
                  <CTableRow key={i}>
                    <CTableDataCell>{u.userId || u.email}</CTableDataCell>
                    <CTableDataCell>${u.balance?.toLocaleString() || 0}</CTableDataCell>
                    <CTableDataCell>{moment(u.createdAt || u.timestamp).format('MMM DD')}</CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
            <div className="d-flex justify-content-between mt-3">
              <span>Page {page} of {totalPages}</span>
              <div>
                <CButton size="sm" onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</CButton>
                <CButton size="sm" className="ms-2" onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</CButton>
              </div>
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      {error && (
        <CAlert color="danger">{error}</CAlert>
      )}
    </div>
  )
}

export default UnifiedDashboardOptimized

