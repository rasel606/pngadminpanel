import React, { useState, useEffect } from 'react';
import { 
CCardHeader,CCard, CCardBody, CTable, CTableHead, CTableBody, CTableRow, CTableHeaderCell, CTableDataCell,
  CButton, CForm, CFormLabel, CFormInput, CFormSelect, CModal, CModalHeader, CModalTitle, 
  CModalBody, CModalFooter, CSpinner, CAlert, CCol, CRow, CCardFooter 
} from '@coreui/react';
import { cilTrash, cilPencil, cilCheckCircle, cilXCircle, cilPlus } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import { adminServices } from '../../service/adminServices';

const BannerManagement = () => {
  const [banners, setBanners] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    link: '',
    promotionId: '',
    isActive: true,
    targetPlatform: 'both'
  });
  const [error, setError] = useState('');

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await adminServices.getBanners();
      setBanners(response.data || []);
    } catch (err) {
      setError('Failed to fetch banners');
    } finally {
      setLoading(false);
    }
  };

  const fetchPromotions = async () => {
    try {
      const response = await adminServices.getPromotionsForBanner();
      setPromotions(response.data || []);
    } catch (err) {
      console.error('Failed to fetch promotions:', err);
    }
  };

  useEffect(() => {
    fetchBanners();
    fetchPromotions();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBanner) {
        await adminServices.updateBanner(editingBanner._id, formData);
      } else {
        await adminServices.createBanner(formData);
      }
      fetchBanners();
      setShowCreateModal(false);
      setShowEditModal(false);
      setFormData({ title: '', description: '', image: '', link: '', promotionId: '', isActive: true, targetPlatform: 'both' });
      setEditingBanner(null);
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this banner?')) {
      try {
        await adminServices.deleteBanner(id);
        fetchBanners();
      } catch (err) {
        alert('Delete failed');
      }
    }
  };

  const handleToggle = async (id) => {
    try {
      await adminServices.toggleBanner(id, { isActive: !banners.find(b => b._id === id)?.isActive });
      fetchBanners();
    } catch (err) {
      alert('Toggle failed');
    }
  };

  const openEditModal = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      description: banner.description || '',
      image: banner.image,
      link: banner.link || '',
      promotionId: banner.promotionId?._id || '',
      isActive: banner.isActive,
      targetPlatform: banner.targetPlatform || 'both'
    });
    setShowEditModal(true);
  };

  if (loading) return <CSpinner color="primary" />;

  return (
    <CRow>
      <CCol xs={12}>
        <CCard>
          <CCardHeader>
            <h5>Admin Banner Management</h5>
            <CButton color="primary" onClick={() => setShowCreateModal(true)}>
              <CIcon icon={cilPlus} /> Create New Banner
            </CButton>
          </CCardHeader>
          <CCardBody>
            {error && <CAlert color="danger">{error}</CAlert>}
            <CTable responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Title</CTableHeaderCell>
                  <CTableHeaderCell>Image</CTableHeaderCell>
                  <CTableHeaderCell>Promotion</CTableHeaderCell>
                  <CTableHeaderCell>Status</CTableHeaderCell>
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {banners.map((banner) => (
                  <CTableRow key={banner._id}>
                    <CTableDataCell>{banner.title}</CTableDataCell>
                    <CTableDataCell>
                      <img src={banner.image} alt={banner.title} style={{width: '50px', height: '30px', objectFit: 'cover'}} />
                    </CTableDataCell>
                    <CTableDataCell>{banner.promotionId?.name || 'Manual'}</CTableDataCell>
                    <CTableDataCell>
                      <CButton size="sm" color={banner.isActive ? "success" : "danger"} onClick={() => handleToggle(banner._id)}>
                        {banner.isActive ? 'Active' : 'Inactive'}
                      </CButton>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CButton size="sm" color="warning" onClick={() => openEditModal(banner)}>
                        <CIcon icon={cilPencil} />
                      </CButton>
                      <CButton size="sm" color="danger" className="ms-1" onClick={() => handleDelete(banner._id)}>
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

      {/* Create Modal */}
      <CModal visible={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <CModalHeader closeButton>
          <CModalTitle>Create Banner</CModalTitle>
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
            <CFormLabel className="mt-3">Promotion</CFormLabel>
            <CFormSelect name="promotionId" value={formData.promotionId} onChange={handleInputChange}>
              <option value="">Manual Banner</option>
              {promotions.map(p => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </CFormSelect>
            <CFormLabel className="mt-3">Target Platform</CFormLabel>
            <CFormSelect name="targetPlatform" value={formData.targetPlatform} onChange={handleInputChange}>
              <option value="web">Web</option>
              <option value="mobile">Mobile</option>
              <option value="both">Both</option>
            </CFormSelect>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setShowCreateModal(false)}>Cancel</CButton>
            <CButton color="primary" type="submit">Create</CButton>
          </CModalFooter>
        </CForm>
      </CModal>

      {/* Edit Modal */}
      <CModal visible={showEditModal} onClose={() => setShowEditModal(false)}>
        <CModalHeader closeButton>
          <CModalTitle>Edit Banner</CModalTitle>
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
            <CFormLabel className="mt-3">Promotion</CFormLabel>
            <CFormSelect name="promotionId" value={formData.promotionId} onChange={handleInputChange}>
              <option value="">Manual Banner</option>
              {promotions.map(p => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </CFormSelect>
            <CFormLabel className="mt-3">Target Platform</CFormLabel>
            <CFormSelect name="targetPlatform" value={formData.targetPlatform} onChange={handleInputChange}>
              <option value="web">Web</option>
              <option value="mobile">Mobile</option>
              <option value="both">Both</option>
            </CFormSelect>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setShowEditModal(false)}>Cancel</CButton>
            <CButton color="primary" type="submit">Update</CButton>
          </CModalFooter>
        </CForm>
      </CModal>
    </CRow>
  );
};

export default BannerManagement;

