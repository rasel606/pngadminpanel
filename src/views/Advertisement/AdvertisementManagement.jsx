import React, { useState, useEffect } from 'react';
import { 
  CCard, CCardHeader, CCardBody, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableDataCell, 
  CButton, CForm, CFormLabel, CFormInput, CFormSelect, CModal, CModalHeader, CModalTitle, 
  CModalBody, CModalFooter, CSpinner, CAlert, CCol, CRow 
} from '@coreui/react';
import { cilTrash, cilPencil, cilCheckCircle, cilXCircle, cilPlus } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import { adminServices } from '../../service/adminServices';

const AdvertisementManagement = () => {
  const [ads, setAds] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    link: '',
    gameId: '',
    isActive: true,
    priority: 0
  });
  const [error, setError] = useState('');

  const fetchAds = async () => {
    try {
      setLoading(true);
      const response = await adminServices.getAdvertisements();
      setAds(response.data || []);
    } catch (err) {
      setError('Failed to fetch ads');
    } finally {
      setLoading(false);
    }
  };

  const fetchGames = async () => {
    try {
      const response = await adminServices.getGamesForAd();
      setGames(response.data || []);
    } catch (err) {
      console.error('Failed to fetch games:', err);
    }
  };

  useEffect(() => {
    fetchAds();
    fetchGames();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAd) {
        await adminServices.updateAdvertisement(editingAd._id, formData);
      } else {
        await adminServices.createAdvertisement(formData);
      }
      fetchAds();
      setShowCreateModal(false);
      setShowEditModal(false);
      setFormData({ title: '', description: '', image: '', link: '', gameId: '', isActive: true, priority: 0 });
      setEditingAd(null);
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this ad?')) {
      try {
        await adminServices.deleteAdvertisement(id);
        fetchAds();
      } catch (err) {
        alert('Delete failed');
      }
    }
  };

  const handleToggle = async (id) => {
    try {
      await adminServices.toggleAdvertisement(id, { isActive: !ads.find(a => a._id === id)?.isActive });
      fetchAds();
    } catch (err) {
      alert('Toggle failed');
    }
  };

  const openEditModal = (ad) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      description: ad.description || '',
      image: ad.image,
      link: ad.link || '',
      gameId: ad.gameId?._id || '',
      isActive: ad.isActive,
      priority: ad.priority || 0
    });
    setShowEditModal(true);
  };

  if (loading) return <CSpinner color="primary" />;

  return (
    <CRow>
      <CCol xs={12}>
        <CCard>
          <CCardHeader>
            <h5>Admin Advertisement Management</h5>
            <CButton color="primary" onClick={() => setShowCreateModal(true)}>
              <CIcon icon={cilPlus} /> Create New Ad
            </CButton>
          </CCardHeader>
          <CCardBody>
            {error && <CAlert color="danger">{error}</CAlert>}
            <CTable responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Title</CTableHeaderCell>
                  <CTableHeaderCell>Image</CTableHeaderCell>
                  <CTableHeaderCell>Game</CTableHeaderCell>
                  <CTableHeaderCell>Status</CTableHeaderCell>
                  <CTableHeaderCell>Priority</CTableHeaderCell>
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {ads.map((ad) => (
                  <CTableRow key={ad._id}>
                    <CTableDataCell>{ad.title}</CTableDataCell>
                    <CTableDataCell>
                      <img src={ad.image} alt={ad.title} style={{width: '50px', height: '30px', objectFit: 'cover'}} />
                    </CTableDataCell>
                    <CTableDataCell>{ad.gameId?.name || 'General'}</CTableDataCell>
                    <CTableDataCell>
                      <CButton size="sm" color={ad.isActive ? "success" : "danger"} onClick={() => handleToggle(ad._id)}>
                        {ad.isActive ? 'Active' : 'Inactive'}
                      </CButton>
                    </CTableDataCell>
                    <CTableDataCell>{ad.priority}</CTableDataCell>
                    <CTableDataCell>
                      <CButton size="sm" color="warning" onClick={() => openEditModal(ad)}>
                        <CIcon icon={cilPencil} />
                      </CButton>
                      <CButton size="sm" color="danger" className="ms-1" onClick={() => handleDelete(ad._id)}>
                        <CIcon icon={cilTrash} />
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      </CCol>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <CModal visible={showCreateModal || showEditModal} onClose={() => {
          setShowCreateModal(false);
          setShowEditModal(false);
        }}>
          <CModalHeader closeButton>
            <CModalTitle>{editingAd ? 'Edit Ad' : 'Create Ad'}</CModalTitle>
          </CModalHeader>
          <CForm onSubmit={handleSubmit}>
            <CModalBody>
              <CFormLabel>Title</CFormLabel>
              <CFormInput name="title" value={formData.title} onChange={handleInputChange} required />
              <CFormLabel className="mt-3">Description</CFormLabel>
              <CFormInput name="description" value={formData.description} onChange={handleInputChange} />
              <CFormLabel className="mt-3">Image URL</CFormLabel>
              <CFormInput name="image" value={formData.image} onChange={handleInputChange} required />
              <CFormLabel className="mt-3">Link</CFormLabel>
              <CFormInput name="link" value={formData.link} onChange={handleInputChange} />
              <CFormLabel className="mt-3">Game</CFormLabel>
              <CFormSelect name="gameId" value={formData.gameId} onChange={handleInputChange}>
                <option value="">General Ad</option>
                {games.map(g => (
                  <option key={g._id} value={g._id}>{g.name}</option>
                ))}
              </CFormSelect>
              <CFormLabel className="mt-3">Priority</CFormLabel>
              <CFormInput type="number" name="priority" value={formData.priority} onChange={handleInputChange} />
            </CModalBody>
            <CModalFooter>
              <CButton color="secondary" onClick={() => {
                setShowCreateModal(false);
                setShowEditModal(false);
              }}>Cancel</CButton>
              <CButton color="primary" type="submit">Save</CButton>
            </CModalFooter>
          </CForm>
        </CModal>
      )}
    </CRow>
  );
};

export default AdvertisementManagement;

