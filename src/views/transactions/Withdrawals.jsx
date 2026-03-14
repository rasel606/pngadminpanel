import React, { useState, useEffect } from 'react';
import { CCard, CCardHeader, CCardBody, CRow, CCol, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableDataCell, CTableBody, CButton, CFormInput, CSpinner } from '@coreui/react';
import { cilSearch, cilSync } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import { transactions } from '../../service/api.js';

const Withdrawals = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ userId: '', status: '', startDate: '', endDate: '' });

  const loadWithdrawals = async () => {
    setLoading(true);
    try {
      const data = await transactions.searchWithdrawals(filters);
      setWithdrawals(data.data || []);
    } catch (error) {
      console.error('Error loading withdrawals:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadWithdrawals();
  }, []);

  const handleApprove = async (id) => {
    if (confirm('Approve this withdrawal?')) {
      try {
        await transactions.approveWithdrawal(id);
        loadWithdrawals();
      } catch (error) {
        alert('Approve failed: ' + error.message);
      }
    }
  };

  const handleReject = async (id) => {
    if (confirm('Reject this withdrawal?')) {
      try {
        await transactions.rejectWithdrawal(id, { remark: prompt('Reject reason:') });
        loadWithdrawals();
      } catch (error) {
        alert('Reject failed: ' + error.message);
      }
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilters = () => loadWithdrawals();

  return (
    <CRow>
      <CCol lg={12}>
        <CCard>
          <CCardHeader>
            <strong>Withdrawal Transactions Management</strong>
            <CButton className="ms-auto" color="info" onClick={loadWithdrawals} disabled={loading}>
              <CIcon icon={cilSync} /> Refresh
            </CButton>
          </CCardHeader>
          <CCardBody>
            {/* Filters */}
            <div className="mb-4 p-3 bg-light rounded">
              <CRow>
                <CCol md={3}>
                  <CFormInput name="userId" placeholder="User ID" value={filters.userId} onChange={handleFilterChange} />
                </CCol>
                <CCol md={2}>
                  <CFormInput type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
                </CCol>
                <CCol md={2}>
                  <CFormInput type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
                </CCol>
                <CCol md={2}>
                  <CButton color="primary" onClick={applyFilters}>
                    <CIcon icon={cilSearch} /> Search
                  </CButton>
                </CCol>
              </CRow>
            </div>

            <CTable responsive hover>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>ID</CTableHeaderCell>
                  <CTableHeaderCell>User</CTableHeaderCell>
                  <CTableHeaderCell>Amount</CTableHeaderCell>
                  <CTableHeaderCell>Gateway</CTableHeaderCell>
                  <CTableHeaderCell>Status</CTableHeaderCell>
                  <CTableHeaderCell>Date</CTableHeaderCell>
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {loading ? (
                  <CTableRow>
                    <CTableDataCell colSpan={7}><CSpinner /> Loading...</CTableDataCell>
                  </CTableRow>
                ) : withdrawals.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan={7}>No withdrawals found</CTableDataCell>
                  </CTableRow>
                ) : (
                  withdrawals.map((withdrawal) => (
                    <CTableRow key={withdrawal._id}>
                      <CTableDataCell>{withdrawal._id}</CTableDataCell>
                      <CTableDataCell>{withdrawal.userId}</CTableDataCell>
                      <CTableDataCell>{withdrawal.amount}</CTableDataCell>
                      <CTableDataCell>{withdrawal.gateway}</CTableDataCell>
                      <CTableDataCell>
                        <span className={`badge badge-${withdrawal.status === 0 ? 'warning' : withdrawal.status === 1 ? 'success' : 'danger'}`}>
                          {withdrawal.status === 0 ? 'Hold' : withdrawal.status === 1 ? 'Approved' : 'Rejected'}
                        </span>
                      </CTableDataCell>
                      <CTableDataCell>{new Date(withdrawal.createdAt).toLocaleString()}</CTableDataCell>
                      <CTableDataCell>
                        {withdrawal.status === 0 && (
                          <div className="d-flex gap-1">
                            <CButton size="sm" color="success" onClick={() => handleApprove(withdrawal._id)}>
                              Approve
                            </CButton>
                            <CButton size="sm" color="danger" onClick={() => handleReject(withdrawal._id)}>
                              Reject
                            </CButton>
                          </div>
                        )}
                      </CTableDataCell>
                    </CTableRow>
                  ))
                )}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default Withdrawals;

