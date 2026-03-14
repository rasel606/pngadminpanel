import React from 'react'
import { Link } from 'react-router-dom'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CButton,
  CListGroup,
  CListGroupItem,
  CBadge,
} from '@coreui/react'

const SubAdminMainPanel = () => {
  const subAdminAgentLinks = [
    { label: 'Sub-Admin Agent List', to: '/subAdmin/agentList' },
    { label: 'Sub-Admin Agent User List', to: '/subAdmin/agentUsers' },
    { label: 'Sub-Admin Agent User Deposit', to: '/subAdmin/agentDeposit' },
    { label: 'Sub-Admin Agent User Withdraw', to: '/subAdmin/agentWithdraw' },
  ]

  const subAgentLinks = [
    { label: 'Sub-Admin Sub-Agent List', to: '/subAdmin/subAgentList' },
    { label: 'Sub-Admin Sub-Agent User List', to: '/subAdmin/subAgentUsers' },
    {
      label: 'Sub-Admin Sub-Agent User Balance Transfer',
      to: '/subadmin/sub-agent-balance-transfer',
    },
    { label: 'Sub-Admin Sub-Agent User Deposit', to: '/subAdmin/subAgentDeposit' },
    { label: 'Sub-Admin Sub-Agent User Withdraw', to: '/subAdmin/subAgentWithdraw' },
  ]

  const affiliateLinks = [
    { label: 'Sub-Admin Affiliate List', to: '/subAdmin/affiliateList' },
    { label: 'Sub-Admin Affiliate User List', to: '/subAdmin/affiliateUsers' },
    {
      label: 'Sub-Admin Affiliate User Balance Transfer',
      to: '/subadmin/affiliate-balance-transfer',
    },
    { label: 'Sub-Admin Affiliate User Deposit', to: '/subAdmin/affiliateDeposit' },
    { label: 'Sub-Admin Affiliate User Withdraw', to: '/subAdmin/affiliateWithdraw' },
  ]

  const directAgentLinks = [
    { label: 'Direct Agent List', to: '/admin/agentList' },
    { label: 'Direct Agent User List', to: '/admin/AgentUser' },
    { label: 'Direct Sub-Agent List', to: '/subAdmin/subAgentList' },
    { label: 'Direct Sub-Agent User List', to: '/subAdmin/subAgentUsers' },
  ]

  const directUserLinks = [{ label: 'Direct User', to: '/userReport' }]

  const renderLinkGroup = (title, items, color = 'primary') => (
    <CCard className="h-100">
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <strong>{title}</strong>
        <CBadge color={color}>{items.length}</CBadge>
      </CCardHeader>
      <CCardBody>
        <CListGroup flush>
          {items.map((item) => (
            <CListGroupItem key={item.to + item.label} className="d-flex justify-content-between">
              <span>{item.label}</span>
              <CButton component={Link} to={item.to} color={color} size="sm" variant="outline">
                Open
              </CButton>
            </CListGroupItem>
          ))}
        </CListGroup>
      </CCardBody>
    </CCard>
  )

  return (
    <>
      <CRow className="mb-4">
        <CCol xs={12}>
          <CCard>
            <CCardBody>
              <h4 className="mb-2">Sub Admin Main Panel</h4>
              <p className="text-body-secondary mb-0">
                Central navigation for Admin → Sub Admin, Direct Agent, and Direct User flows.
              </p>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CRow className="g-4">
        <CCol xl={6}>{renderLinkGroup('SubAdmin → Agent', subAdminAgentLinks, 'primary')}</CCol>
        <CCol xl={6}>{renderLinkGroup('SubAdmin → SubAgent', subAgentLinks, 'info')}</CCol>
        <CCol xl={6}>{renderLinkGroup('SubAdmin → Affiliate', affiliateLinks, 'success')}</CCol>
        <CCol xl={6}>{renderLinkGroup('Admin → Direct Agent', directAgentLinks, 'warning')}</CCol>
        <CCol xl={6}>{renderLinkGroup('Admin → Direct User', directUserLinks, 'dark')}</CCol>
      </CRow>
    </>
  )
}

export default SubAdminMainPanel
