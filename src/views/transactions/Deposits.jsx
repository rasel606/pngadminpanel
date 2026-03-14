import React, { useState, useEffect, useContext } from 'react';
import { CCard, CCardHeader, CCardBody, CRow, CCol, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableDataCell, CTableBody, CButton, CFormInput, CFormSelect, CSpinner } from '@coreui/react';
import { cilSearch, cilFilter, cilSync } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import { transactions } from '../../service/api.js';

const Deposits = () => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    userId: '',
    startDate: '',
    endDate: '',
    gateway: ''
  });

  const loadDeposits = async () => {
    setLoading(true);
    try {
      const data = await transactions.searchDeposits(filters);
      setDeposits(data.data || []);
    } catch (error) {
      console.error('Error loading deposits:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDeposits();
  }, []);

  const handleApprove = async (id) => {
    if (confirm('Approve this deposit?')) {
      try {
        await transactions.approveDeposit(id);
        loadDeposits(); // Reload
      } catch (error) {
        alert('Approve failed: ' + error.message);
      }
    }
  };

  const handleReject = async (id) => {
    if (confirm('Reject this deposit?')) {
      try {
        await transactions.rejectDeposit(id, { remark: prompt('Reject reason:') });
        loadDeposits();
      } catch (error) {
        alert('Reject failed: ' + error.message);
      }
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilters = () => {
    loadDeposits();
  };

  return (
    <CRow>
      <CCol lg={12}>
        <CCard>
          <CCardHeader>
            <strong>Deposit Transactions Search & Management</strong>
            <div className="d-flex gap-2 ms-auto">
              <CButton color="info" onClick={loadDeposits} disabled={loading}>
                <CIcon icon={cilSync} /> Refresh
              </CButton>
            </div>
          </CCardHeader>
          <CCardBody>
            {/* Filters */}
            <div className="mb-4 p-3 bg-light rounded">
              <CRow>
                <CCol md={3}>
                  <CFormInput name="userId" placeholder="User ID" value={filters.userId} onChange={handleFilterChange} />
                </CCol>
                <CCol md={2}>
                  <CFormSelect name="status" value={filters.status} onChange={handleFilterChange}>
                    <option value="">All Status</option>
                    <option value="0">Hold</option>
                    <option value="1">Approved</option>
                    <option value="2">Rejected</option>
                  </CFormSelect>
                </CCol>
                <CCol md={2}>
                  <CFormInput type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
                </CCol>
                <CCol md={2}>
                  <CFormInput type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
                </CCol>
                <CCol md={3}>
                  <div className="d-flex gap-2">
                    <CButton color="primary" onClick={applyFilters}>
                      <CIcon icon={cilSearch} /> Search
                    </CButton>
                  </div>
                </CCol>
              </CRow>
            </div>

            {/* Table */}
            <CTable responsive hover>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>ID</CTableHeaderCell>
                  <CTableHeaderCell>User</CTableHeaderCell>
                  <CTableHeaderCell>Amount</CTableHeaderCell>
                  <CTableHeaderCell>Currency</CTableHeaderCell>
                  <CTableHeaderCell>Gateway</CTableHeaderCell>
                  <CTableHeaderCell>Status</CTableHeaderCell>
                  <CTableHeaderCell>Date</CTableHeaderCell>
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {loading ? (
                  <CTableRow>
                    <CTableDataCell colSpan={8}>
                      <div className="text-center">
                        <CSpinner /> Loading...
                      </div>
                    </CTableDataCell>
                  </CTableRow>
                ) : deposits.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan={8}>No deposits found</CTableDataCell>
                  </CTableRow>
                ) : (
                  deposits.map((deposit) => (
                    <CTableRow key={deposit._id}>
                      <CTableDataCell>{deposit.deposit_id}</CTableDataCell>
                      <CTableDataCell>{deposit.deposit_user_id}</CTableDataCell>
                      <CTableDataCell>{deposit.amount}</CTableDataCell>
                      <CTableDataCell>{deposit.currency}</CTableDataCell>
                      <CTableDataCell>{deposit.gateway_name}</CTableDataCell>
                      <CTableDataCell>
                        <span className={`badge badge-${deposit.status === 0 ? 'warning' : deposit.status === 1 ? 'success' : 'danger'}`}>
                          {deposit.status === 0 ? 'Hold' : deposit.status === 1 ? 'Approved' : 'Rejected'}
                        </span>
                      </CTableDataCell>
                      <CTableDataCell>{new Date(deposit.datetime).toLocaleString()}</CTableDataCell>
                      <CTableDataCell>
                        {deposit.status === 0 && (
                          <div className="d-flex gap-1">
                            <CButton size="sm" color="success" onClick={() => handleApprove(deposit._id)}>
                              Approve
                            </CButton>
                            <CButton size="sm" color="danger" onClick={() => handleReject(deposit._id)}>
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

export default Deposits;

