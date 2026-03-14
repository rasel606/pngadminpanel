import React, { useEffect, useState } from 'react'
import { getLogs } from '../../service/api'
import { withAdminAccess } from '../../context/AuthContext'
import {
  CCard,
  CCardBody,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CSpinner,
  CAlert,
} from '@coreui/react'

const LogsView = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getLogs()
      .then((data) => {
        setLogs(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  return (
    <CCard className="mb-4">
      <CCardBody>
        <h2>System Logs & Audit Trails</h2>
        {loading && <CSpinner color="primary" />}
        {error && <CAlert color="danger">Error: {error}</CAlert>}
        {Array.isArray(logs) && logs.length > 0 ? (
          <CTable striped hover responsive>
            <CTableHead>
              <CTableRow>
                {Object.keys(logs[0]).map((key) => (
                  <CTableHeaderCell key={key}>{key}</CTableHeaderCell>
                ))}
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {logs.map((log, idx) => (
                <CTableRow key={idx}>
                  {Object.values(log).map((val, i) => (
                    <CTableHeaderCell key={i}>{val}</CTableHeaderCell>
                  ))}
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        ) : (
          !loading && <p>No logs found.</p>
        )}
      </CCardBody>
    </CCard>
  )
}

export default withAdminAccess(LogsView)
