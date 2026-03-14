import React, { useEffect, useState } from 'react'
import { CCard, CCardBody, CAlert, CListGroup, CListGroupItem } from '@coreui/react'
import { getWebSocketUrl } from '../../utils/socketUtils'

const wsUrl = (() => {
  const base = import.meta.env.VITE_SOCKET_URL || 'https://api.tiger55.online'
  return getWebSocketUrl(base, '/notifications')
})()

const RealTimeNotifications = () => {
  const [notifications, setNotifications] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    let ws
    try {
      ws = new window.WebSocket(wsUrl)
      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data)
        setNotifications((prev) => [msg, ...prev])
      }
      ws.onerror = () => setError('WebSocket error')
      ws.onclose = () => setError('Connection closed')
    } catch (err) {
      setError('WebSocket not supported or failed to connect')
    }
    return () => ws && ws.close()
  }, [])

  return (
    <CCard className="mb-4">
      <CCardBody>
        <h2>Real-Time Notifications</h2>
        {error && <CAlert color="danger">{error}</CAlert>}
        <CListGroup>
          {notifications.length === 0 && <CListGroupItem>No notifications yet.</CListGroupItem>}
          {notifications.map((notif, idx) => (
            <CListGroupItem key={idx} color={notif.type === 'error' ? 'danger' : 'info'}>
              <strong>{notif.title || 'Notification'}:</strong> {notif.message}
            </CListGroupItem>
          ))}
        </CListGroup>
      </CCardBody>
    </CCard>
  )
}

export default RealTimeNotifications
