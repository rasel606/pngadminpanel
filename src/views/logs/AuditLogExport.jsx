import React, { useState } from 'react'
import { CCard, CCardBody, CButton, CAlert } from '@coreui/react'

const mockLogs = [
  { id: 1, action: 'Login', user: 'Alice', time: '2026-02-27 10:00' },
  { id: 2, action: 'Delete User', user: 'Bob', time: '2026-02-27 11:00' },
  { id: 3, action: 'Update Settings', user: 'Charlie', time: '2026-02-27 12:00' },
]

const AuditLogExport = () => {
  const [exported, setExported] = useState(false)

  const handleExport = () => {
    const csv = [
      ['ID', 'Action', 'User', 'Time'],
      ...mockLogs.map((log) => [log.id, log.action, log.user, log.time]),
    ]
      .map((row) => row.join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'audit_logs.csv'
    a.click()
    setExported(true)
  }

  return (
    <CCard className="mb-4">
      <CCardBody>
        <h2>Audit Log Export</h2>
        <CButton color="primary" onClick={handleExport}>
          Export Logs as CSV
        </CButton>
        {exported && (
          <CAlert color="success" className="mt-2">
            Logs exported successfully!
          </CAlert>
        )}
      </CCardBody>
    </CCard>
  )
}

export default AuditLogExport
