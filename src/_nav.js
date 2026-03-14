import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilSpeedometer,
  cilMoney,
  cilArrowCircleTop,
  cilPeople,
  cilCommentBubble,
  cilGlobeAlt,
  cilChart,
  cilBadge,
  cilSettings,
  cilAccountLogout,
  cilEnvelopeClosed,
  cilList,
  cilCheck,
  cilWarning,
  cilUserFollow,
  cilApps,
  cilImage ,


} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  // 📌 Dashboard Section
  {
    component: CNavTitle,
    name: 'Dashboard',
  },
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Advanced Dashboard',
    to: '/advanced-dashboard',
    icon: <CIcon icon={cilChart} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Unified Dashboard',
    to: '/unified-dashboard',
    icon: <CIcon icon={cilGlobeAlt} customClassName="nav-icon" />,
    badge: {
      color: 'info',
      text: 'NEW',
    },
  },

  // 📌 Transactions Section
  {
    component: CNavTitle,
    name: 'Transactions',
  },

  {
    component: CNavItem,
    name: 'Deposit',
    to: '/subAdminDeposit',
    icon: <CIcon icon={cilCheck} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Withdraw',
    to: '/subAdminwidthrow',
    icon: <CIcon icon={cilArrowCircleTop} customClassName="nav-icon" />,
  },

  // 📌 Gateway Section

  {
    component: CNavTitle,
    name: 'Gateways',
  },
  {
    component: CNavItem,
    name: 'Deposit Gateway',
    to: '/subAdmingetway',
    icon: <CIcon icon={cilGlobeAlt} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Withdraw Gateway',
    to: '/SubAdminGetwayWidthraw',
    icon: <CIcon icon={cilGlobeAlt} customClassName="nav-icon" />,
  },

  // 📌 Users Section
  {
    component: CNavTitle,
    name: 'Users',
  },
  {
    component: CNavItem,
    name: 'All Users',
    to: '/userReport',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
  },

  // 📌 Communication Section
  {
    component: CNavTitle,
    name: 'Communication',
  },
  {
    component: CNavGroup,
    name: 'Live Contact',
    icon: <CIcon icon={cilCommentBubble} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Live Chat',
        to: '/liveChat',
        icon: <CIcon icon={cilEnvelopeClosed} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Social Links',
        to: '/updateAndcreateSocialLinks',
        icon: <CIcon icon={cilGlobeAlt} customClassName="nav-icon" />,
      },
    ],
  },

  // 📌 Reports Section
  {
    component: CNavTitle,
    name: 'Reports',
  },
  {
    component: CNavGroup,
    name: 'Report',
    icon: <CIcon icon={cilChart} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Transaction Report',
        to: '/transaction/report',
        icon: <CIcon icon={cilCheck} customClassName="nav-icon" />,
      },

      {
        component: CNavItem,
        name: 'User Report',
        to: '/userReport',
        icon: <CIcon icon={cilList} customClassName="nav-icon" />,
      },
    ],
  },

  // 📌 Sub Admin Section
  {
    component: CNavTitle,
    name: 'Sub Admin',
  },
  {
    component: CNavGroup,
    name: 'Sub Admin',
    icon: <CIcon icon={cilBadge} customClassName="nav-icon" />,
    items: [
      // general sub-admin tools
      {
        component: CNavItem,
        name: 'Main Panel',
        to: '/subAdmin',
        icon: <CIcon icon={cilApps} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'SubAdmin List',
        to: '/subAdminList',
        icon: <CIcon icon={cilBadge} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Users',
        to: '/subAdmin/subAdminUser',
        icon: <CIcon icon={cilUserFollow} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Deposit',
        to: '/subAdmin/subAdminDeposit',
        icon: <CIcon icon={cilMoney} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Withdrawal',
        to: '/subAdmin/subAdminWidthrow',
        icon: <CIcon icon={cilArrowCircleTop} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Agent Balance Transfer',
        to: '/subadmin/agent-balance-transfer',
        icon: <CIcon icon={cilMoney} customClassName="nav-icon" />,
      },
      {
        component: CNavTitle,
        name: 'Sub Admin Agent',
      },
      {
        component: CNavGroup,
        name: 'Agents',
        icon: <CIcon icon={cilBadge} customClassName="nav-icon" />,
        items: [
          { component: CNavItem, name: 'Agent List', to: '/subAdmin/agentList', icon: <CIcon icon={cilBadge} /> },
          { component: CNavItem, name: 'Agent Users', to: '/subAdmin/agentUsers', icon: <CIcon icon={cilUserFollow} /> },
          { component: CNavItem, name: 'Agent Deposit', to: '/subAdmin/agentDeposit', icon: <CIcon icon={cilMoney} /> },
          { component: CNavItem, name: 'Agent Withdraw', to: '/subAdmin/agentWithdraw', icon: <CIcon icon={cilArrowCircleTop} /> },
        ],
      },
      {
        component: CNavTitle,
        name: 'Sub Admin Sub‑Agent',
      },
      {
        component: CNavGroup,
        name: 'Sub‑Agents',
        icon: <CIcon icon={cilBadge} customClassName="nav-icon" />,
        items: [
          { component: CNavItem, name: 'Sub‑Agent List', to: '/subAdmin/subAgentList', icon: <CIcon icon={cilBadge} /> },
          { component: CNavItem, name: 'Sub‑Agent Users', to: '/subAdmin/subAgentUsers', icon: <CIcon icon={cilUserFollow} /> },
          { component: CNavItem, name: 'Sub‑Agent Balance Transfer', to: '/subadmin/sub-agent-balance-transfer', icon: <CIcon icon={cilMoney} /> },
          { component: CNavItem, name: 'Sub‑Agent Deposits', to: '/subAdmin/subAgentDeposit', icon: <CIcon icon={cilMoney} /> },
          { component: CNavItem, name: 'Sub‑Agent Withdrawals', to: '/subAdmin/subAgentWithdraw', icon: <CIcon icon={cilArrowCircleTop} /> },
        ],
      },
      {
        component: CNavTitle,
        name: 'Affiliate Management',
      },
      {
        component: CNavGroup,
        name: 'Affiliates',
        icon: <CIcon icon={cilBadge} customClassName="nav-icon" />,
        items: [
          { component: CNavItem, name: 'Affiliate List', to: '/subAdmin/affiliateList', icon: <CIcon icon={cilBadge} /> },
          { component: CNavItem, name: 'Affiliate Users', to: '/subAdmin/affiliateUsers', icon: <CIcon icon={cilUserFollow} /> },
          { component: CNavItem, name: 'Affiliate Balance Transfer', to: '/subadmin/affiliate-balance-transfer', icon: <CIcon icon={cilMoney} /> },
          { component: CNavItem, name: 'Affiliate Deposits', to: '/subAdmin/affiliateDeposit', icon: <CIcon icon={cilMoney} /> },
          { component: CNavItem, name: 'Affiliate Withdrawals', to: '/subAdmin/affiliateWithdraw', icon: <CIcon icon={cilArrowCircleTop} /> },
        ],
      },
    ],
  },

  // 📌 Agent Section
  // {
  //   component: CNavTitle,
  //   name: 'Agent',
  // },
  // {
  //   component: CNavGroup,
  //   name: 'Agent',
  //   icon: <CIcon icon={cilBadge} customClassName="nav-icon" />,
  //   items: [
  //     { component: CNavItem, name: 'Agent List', to: '/admin/agentList', icon: <CIcon icon={cilBadge} customClassName="nav-icon" /> },
  //     { component: CNavItem, name: 'Agent User', to: '/admin/AgentUser', icon: <CIcon icon={cilUserFollow} customClassName="nav-icon" /> },
  //     { component: CNavItem, name: 'Agent Deposit', to: '/admin/AgentDeposit', icon: <CIcon icon={cilMoney} customClassName="nav-icon" /> },
  //     { component: CNavItem, name: 'Agent User Deposit', to: '/agent/agentUserDeposit', icon: <CIcon icon={cilMoney} customClassName="nav-icon" /> },
  //     { component: CNavItem, name: 'Agent User Withdraw', to: '/admin/AgentWidthrow', icon: <CIcon icon={cilArrowCircleTop} customClassName="nav-icon" /> },
  //   ],
  // },
  {
    component: CNavTitle,
    name: 'Affiliate',
  },
  {
    component: CNavGroup,
    name: 'Affiliate',
    icon: <CIcon icon={cilBadge} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Affiliate List',
        to: '/admin/affiliateList',
        icon: <CIcon icon={cilBadge} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Affiliate User',
        to: '/affiliate/affiliateUser',
        icon: <CIcon icon={cilUserFollow} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Affiliate commission',
        to: '/admin/affiliate/affiliateCommission',
        icon: <CIcon icon={cilMoney} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Affiliate User Deposit',
        to: '/affiliate/affiliateserDeposit',
        icon: <CIcon icon={cilMoney} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Affiliate User Withdraw',
        to: '/affiliate/affiliateWithdraw',
        icon: <CIcon icon={cilArrowCircleTop} customClassName="nav-icon" />,
      },
    ],
  },

  // 📌 Others Section
  {
    component: CNavTitle,
    name: 'Other',
  },
  {
    component: CNavItem,
    name: 'Promotion Settings',
    to: '/promotionSettings',
    icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Games',
    to: '/Games',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Announcements',
  },
  {
    component: CNavItem,
    name: 'AannouncementList',
    to: '/announcement/announcementList',
    icon: <CIcon icon={cilUserFollow} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Legal Control',
  },
  {
    component: CNavItem,
    name: 'Legal Content Manager',
    to: '/admin/legal-content',
    icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'FAQ Manager',
    to: '/admin/faq-management',
    icon: <CIcon icon={cilList} customClassName="nav-icon" />,
  },
  
  // 📌 Content Management
  {
    component: CNavTitle,
    name: 'Content Management',
  },
  {
    component: CNavItem,
    name: 'Widget Management',
    to: '/admin/widget-management',
    icon: <CIcon icon={cilApps} customClassName="nav-icon" />,
    badge: {
      color: 'success',
      text: 'NEW',
    },
  },
  {
    component: CNavItem,
    name: 'Banner Management',
    to: '/admin/banner-management',
    icon: <CIcon icon={cilImage} customClassName="nav-icon" />,
    badge: {
      color: 'info',
      text: 'NEW',
    },
  },
  {
    component: CNavItem,
    name: 'Advertisement Management',
    to: '/admin/advertisement-management',
    icon: <CIcon icon={cilImage} customClassName="nav-icon" />,
    badge: {
      color: 'warning',
      text: 'NEW',
    },
  },
  
  // 📌 Account Section
  {
    component: CNavTitle,
    name: 'Account',
  },
  {
    component: CNavItem,
    name: 'My Account',
    to: '/profile',
    icon: <CIcon icon={cilUserFollow} customClassName="nav-icon" />,
  },

  {
    component: CNavItem,
    name: 'Logout',
    to: '/logout',
    icon: <CIcon icon={cilAccountLogout} customClassName="nav-icon" />,
  },
]

export default _nav
