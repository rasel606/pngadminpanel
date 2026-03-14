// import React from 'react'
// import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components/index'

// const DefaultLayout = () => {
//   return (
//     <div>
//       <AppSidebar />
//       <div className="wrapper d-flex flex-column min-vh-100">
//         <AppHeader />
//         <div className="body flex-grow-1">
//           <AppContent />
//         </div>
//         <AppFooter />
//       </div>
//     </div>
//   )
// }

// export default DefaultLayout

import React from 'react'
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components/index'
import { useAuth } from '../context/AuthContext'
import { cilBell } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { CBadge, CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle } from '@coreui/react'
import { useContext } from 'react'
import { NotificationContext } from '../context/NotificationContext'
import { Navigate } from 'react-router-dom'

const DefaultLayout = () => {
  const { isAuthenticated, isLoading } = useAuth()
  const { notifications, unreadCount, markAllAsRead } = useContext(NotificationContext)

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="position-relative">
          {/* Notification Bell Dropdown */}
          <CDropdown className="position-absolute top-0 end-0 mt-3 me-4 z-index-10">
            <CDropdownToggle color="primary">
              <CIcon icon={cilBell} size="lg" />
              {unreadCount > 0 && (
                <CBadge color="danger" shape="pill" className="ms-1 position-absolute top-0 start-100 translate-middle">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </CBadge>
              )}
            </CDropdownToggle>
            <CDropdownMenu className="dropdown-menu-lg">
              {notifications.slice(0, 5).map((notification) => (
                <CDropdownItem key={notification._id} href={notification.data.url}>
                  <div className="d-flex">
                    <div className="flex-fill">
                      <strong>{notification.title}</strong>
                      <p className="small mb-0">{notification.message}</p>
                    </div>
                  </div>
                </CDropdownItem>
              ))}
              <CDropdownItem className="text-center border-top">
                <strong>Mark all as read</strong>
              </CDropdownItem>
            </CDropdownMenu>
          </CDropdown>
        </div>
        <div className="body flex-grow-1 px-4">
          <AppContent />
        </div>
        <AppFooter />
      </div>
    </div>
  )
}

export default DefaultLayout
