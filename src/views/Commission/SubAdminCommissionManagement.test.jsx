import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SubAdminCommissionManagement from '../SubAdminCommissionManagement'
import * as adminServices from '../../../../service/adminServices'

// Mock the service
jest.mock('../../../../service/adminServices')

describe('SubAdminCommissionManagement Component', () => {
  const mockUsers = [
    {
      _id: '123',
      userId: 'affiliate_001',
      username: 'Affiliate One',
      role: 'affiliate',
      commissionRate: 0.20,
    },
    {
      _id: '124',
      userId: 'agent_001',
      username: 'Agent One',
      role: 'agent',
      commissionRate: 0.15,
    },
    {
      _id: '125',
      userId: 'subagent_001',
      username: 'SubAgent One',
      role: 'sub-agent',
      commissionRate: 0.10,
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should render commission management page', () => {
    adminServices.getMyUsersWithCommission.mockResolvedValue({
      users: mockUsers,
    })

    render(<SubAdminCommissionManagement />)

    expect(screen.getByText(/Commission Management/i)).toBeInTheDocument()
    expect(
      screen.getByText(
        /Set and manage commission rates for your affiliates, agents, and sub-agents/i,
      ),
    ).toBeInTheDocument()
  })

  test('should load and display all users on mount', async () => {
    adminServices.getMyUsersWithCommission.mockResolvedValue({
      users: mockUsers,
    })

    render(<SubAdminCommissionManagement />)

    await waitFor(() => {
      expect(screen.getByText('Affiliate One')).toBeInTheDocument()
      expect(screen.getByText('Agent One')).toBeInTheDocument()
      expect(screen.getByText('SubAgent One')).toBeInTheDocument()
    })
  })

  test('should display user roles with appropriate badges', async () => {
    adminServices.getMyUsersWithCommission.mockResolvedValue({
      users: mockUsers,
    })

    render(<SubAdminCommissionManagement />)

    await waitFor(() => {
      expect(screen.getByText('affiliate')).toBeInTheDocument()
      expect(screen.getByText('agent')).toBeInTheDocument()
      expect(screen.getByText('sub-agent')).toBeInTheDocument()
    })
  })

  test('should filter users by role', async () => {
    adminServices.getMyUsersWithCommission.mockResolvedValue({
      users: mockUsers,
    })

    render(<SubAdminCommissionManagement />)

    await waitFor(() => {
      expect(screen.getByText('Affiliate One')).toBeInTheDocument()
    })

    // Filter by affiliate
    const roleSelect = screen.getByDisplayValue('All Roles')
    await userEvent.selectOption(roleSelect, 'affiliate')

    expect(screen.getByText('Affiliate One')).toBeInTheDocument()
    expect(screen.queryByText('Agent One')).not.toBeInTheDocument()
    expect(screen.queryByText('SubAgent One')).not.toBeInTheDocument()
  })

  test('should search users by name', async () => {
    adminServices.getMyUsersWithCommission.mockResolvedValue({
      users: mockUsers,
    })

    render(<SubAdminCommissionManagement />)

    await waitFor(() => {
      expect(screen.getByText('Affiliate One')).toBeInTheDocument()
    })

    // Search
    const searchInput = screen.getByPlaceholderText(/Search by name or ID/i)
    await userEvent.type(searchInput, 'Agent')

    expect(screen.getByText('Agent One')).toBeInTheDocument()
    expect(screen.queryByText('Affiliate One')).not.toBeInTheDocument()
  })

  test('should open edit modal when Edit button is clicked', async () => {
    adminServices.getMyUsersWithCommission.mockResolvedValue({
      users: mockUsers,
    })

    render(<SubAdminCommissionManagement />)

    const editButtons = await screen.findAllByRole('button', { name: /Edit/i })
    fireEvent.click(editButtons[0])

    expect(screen.getByText(/Update Commission Rate/i)).toBeInTheDocument()
  })

  test('should update user commission rate on save', async () => {
    adminServices.getMyUsersWithCommission.mockResolvedValue({
      users: mockUsers,
    })
    adminServices.setMyUserCommission.mockResolvedValue({ success: true })

    render(<SubAdminCommissionManagement />)

    // Open edit modal
    const editButtons = await screen.findAllByRole('button', { name: /Edit/i })
    fireEvent.click(editButtons[0])

    // Change rate
    const input = screen.getByDisplayValue('20')
    await userEvent.clear(input)
    await userEvent.type(input, '30')

    // Save
    const saveButton = screen.getByRole('button', { name: /Save Changes/i })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(adminServices.setMyUserCommission).toHaveBeenCalledWith('123', 30)
    })
  })

  test('should validate commission rate range', async () => {
    adminServices.getMyUsersWithCommission.mockResolvedValue({
      users: mockUsers,
    })

    render(<SubAdminCommissionManagement />)

    // Open edit modal
    const editButtons = await screen.findAllByRole('button', { name: /Edit/i })
    fireEvent.click(editButtons[0])

    // Enter invalid rate
    const input = screen.getByDisplayValue('20')
    await userEvent.clear(input)
    await userEvent.type(input, '200')

    // Try to save
    const saveButton = screen.getByRole('button', { name: /Save Changes/i })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(screen.getByText(/between 0-100%/i)).toBeInTheDocument()
    })

    // Should not call the service
    expect(adminServices.setMyUserCommission).not.toHaveBeenCalled()
  })

  test('should combine search and role filters', async () => {
    adminServices.getMyUsersWithCommission.mockResolvedValue({
      users: mockUsers,
    })

    render(<SubAdminCommissionManagement />)

    await waitFor(() => {
      expect(screen.getByText('Affiliate One')).toBeInTheDocument()
    })

    // Filter by role
    const roleSelect = screen.getByDisplayValue('All Roles')
    await userEvent.selectOption(roleSelect, 'agent')

    // Then search
    const searchInput = screen.getByPlaceholderText(/Search by name or ID/i)
    await userEvent.type(searchInput, 'one')

    expect(screen.getByText('Agent One')).toBeInTheDocument()
    expect(screen.queryByText('Affiliate One')).not.toBeInTheDocument()
  })

  test('should display commission rates as percentages', async () => {
    adminServices.getMyUsersWithCommission.mockResolvedValue({
      users: mockUsers,
    })

    render(<SubAdminCommissionManagement />)

    await waitFor(() => {
      expect(screen.getByText(/20%/)).toBeInTheDocument()
      expect(screen.getByText(/15%/)).toBeInTheDocument()
      expect(screen.getByText(/10%/)).toBeInTheDocument()
    })
  })

  test('should show empty state when no users found', async () => {
    adminServices.getMyUsersWithCommission.mockResolvedValue({
      users: [],
    })

    render(<SubAdminCommissionManagement />)

    await waitFor(() => {
      expect(
        screen.getByText(
          /Create affiliates, agents, or sub-agents to manage their rates/i,
        ),
      ).toBeInTheDocument()
    })
  })

  test('should show error alert on fetch failure', async () => {
    adminServices.getMyUsersWithCommission.mockRejectedValue(
      new Error('Network error'),
    )

    render(<SubAdminCommissionManagement />)

    await waitFor(() => {
      expect(screen.getByText(/Failed to load users/i)).toBeInTheDocument()
    })
  })

  test('should handle API error in save operation', async () => {
    adminServices.getMyUsersWithCommission.mockResolvedValue({
      users: mockUsers,
    })
    adminServices.setMyUserCommission.mockRejectedValue({
      response: { data: { message: 'Permission denied' } },
    })

    render(<SubAdminCommissionManagement />)

    // Open edit modal
    const editButtons = await screen.findAllByRole('button', { name: /Edit/i })
    fireEvent.click(editButtons[0])

    // Change rate and save
    const input = screen.getByDisplayValue('20')
    await userEvent.clear(input)
    await userEvent.type(input, '25')

    const saveButton = screen.getByRole('button', { name: /Save Changes/i })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(screen.getByText(/Permission denied/i)).toBeInTheDocument()
    })
  })

  test('should refresh data when Refresh button is clicked', async () => {
    adminServices.getMyUsersWithCommission.mockResolvedValue({
      users: mockUsers,
    })

    render(<SubAdminCommissionManagement />)

    await waitFor(() => {
      expect(adminServices.getMyUsersWithCommission).toHaveBeenCalled()
    })

    const refreshButton = screen.getByRole('button', { name: /Refresh/i })
    fireEvent.click(refreshButton)

    await waitFor(() => {
      expect(adminServices.getMyUsersWithCommission).toHaveBeenCalledTimes(2)
    })
  })
})
