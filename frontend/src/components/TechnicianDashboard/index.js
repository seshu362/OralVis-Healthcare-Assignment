import React, { useState, useEffect } from 'react';
import Header from '../Header';
import UploadScan from '../UploadScan';
import axios from 'axios';
import './index.css';

const TechnicianDashboard = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [scans, setScans] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [editingScan, setEditingScan] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (activeTab === 'scans') {
      fetchMyScans();
    } else if (activeTab === 'stats') {
      fetchStats();
    }
  }, [activeTab, searchTerm, selectedRegion, currentPage]);

  const fetchMyScans = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/technician/scans', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {
          search: searchTerm,
          region: selectedRegion,
          page: currentPage,
          limit: 8
        }
      });

      if (response.data.message === 'success') {
        setScans(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching scans:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.message === 'success') {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleRegionFilter = (e) => {
    setSelectedRegion(e.target.value);
    setCurrentPage(1);
  };

  const onScanUploaded = () => {
    if (activeTab === 'scans') {
      fetchMyScans();
    }
    fetchStats();
  };

  const handleEditScan = (scan) => {
    setEditingScan(scan);
    setShowEditModal(true);
  };

  const handleUpdateScan = async (updatedScanData) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/scans/${editingScan.id}`,
        updatedScanData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.message === 'Scan updated successfully') {
        setShowEditModal(false);
        setEditingScan(null);
        fetchMyScans();
        alert('Scan updated successfully!');
      }
    } catch (error) {
      console.error('Error updating scan:', error);
      alert('Failed to update scan. Please try again.');
    }
  };

  const handleDeleteScan = async (scanId) => {
    if (!window.confirm('Are you sure you want to delete this scan?')) {
      return;
    }

    try {
      const response = await axios.delete(
        `http://localhost:5000/api/scans/${scanId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.message === 'Scan deleted successfully') {
        fetchMyScans();
        fetchStats();
        alert('Scan deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting scan:', error);
      alert('Failed to delete scan. Please try again.');
    }
  };

  return (
    <div>
      <Header />
      <div className="dashboard-container">
        <div className="dashboard-sidebar">
          <nav className="dashboard-nav">
            <button 
              className={`nav-item ${activeTab === 'upload' ? 'active' : ''}`}
              onClick={() => setActiveTab('upload')}
            >
              Upload Scan
            </button>
            <button 
              className={`nav-item ${activeTab === 'scans' ? 'active' : ''}`}
              onClick={() => setActiveTab('scans')}
            >
              My Scans
            </button>
            <button 
              className={`nav-item ${activeTab === 'stats' ? 'active' : ''}`}
              onClick={() => setActiveTab('stats')}
            >
              Statistics
            </button>
          </nav>
        </div>

        <div className="dashboard-main">
          {activeTab === 'upload' && (
            <div className="tab-content">
              <h2>Upload Patient Scan</h2>
              <UploadScan onScanUploaded={onScanUploaded} />
            </div>
          )}

          {activeTab === 'scans' && (
            <div className="tab-content">
              <h2>My Uploaded Scans</h2>
              
              <div className="search-filters">
                <div className="form-group">
                  <label className="form-label">Search</label>
                  <input
                    type="text"
                    placeholder="Search by patient name or ID..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Region</label>
                  <select 
                    value={selectedRegion} 
                    onChange={handleRegionFilter}
                    className="form-select"
                  >
                    <option value="">All Regions</option>
                    <option value="Frontal">Frontal</option>
                    <option value="Upper Arch">Upper Arch</option>
                    <option value="Lower Arch">Lower Arch</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="loading">Loading scans...</div>
              ) : (
                <>
                  <div className="scans-grid">
                    {scans.map(scan => (
                      <div key={scan.id} className="scan-card">
                        <div className="scan-image">
                          <img src={scan.image_url} alt={`${scan.patient_name} scan`} />
                        </div>
                        <div className="scan-details">
                          <h3>{scan.patient_name}</h3>
                          <p><strong>Patient ID:</strong> {scan.patient_id}</p>
                          <p><strong>Region:</strong> {scan.region}</p>
                          <p><strong>Uploaded:</strong> {new Date(scan.upload_date).toLocaleDateString()}</p>
                        </div>
                        <div className="scan-actions">
                          <button 
                            className="btn btn-secondary"
                            onClick={() => handleEditScan(scan)}
                          >
                            Edit
                          </button>
                          <button 
                            className="btn btn-danger"
                            onClick={() => handleDeleteScan(scan.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {scans.length === 0 && !loading && (
                    <div className="no-data">
                      <p>No scans found. Upload your first scan to get started!</p>
                    </div>
                  )}

                  {pagination.total_pages > 1 && (
                    <div className="pagination">
                      <button 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                      >
                        Previous
                      </button>
                      <span>Page {currentPage} of {pagination.total_pages}</span>
                      <button 
                        disabled={currentPage === pagination.total_pages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="tab-content">
              <h2>My Statistics</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Scans</h3>
                  <p className="stat-number">{stats.total_scans || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Patients</h3>
                  <p className="stat-number">{stats.total_patients || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>Today's Uploads</h3>
                  <p className="stat-number">{stats.today_uploads || 0}</p>
                </div>
              </div>

              {stats.scans_by_region && stats.scans_by_region.length > 0 && (
                <div className="region-stats">
                  <h3>Scans by Region</h3>
                  <div className="region-list">
                    {stats.scans_by_region.map(item => (
                      <div key={item.region} className="region-item">
                        <span>{item.region}</span>
                        <span className="region-count">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Scan Modal */}
      {showEditModal && editingScan && (
        <EditScanModal
          scan={editingScan}
          onUpdate={handleUpdateScan}
          onClose={() => {
            setShowEditModal(false);
            setEditingScan(null);
          }}
        />
      )}
    </div>
  );
};

// Edit Scan Modal Component
const EditScanModal = ({ scan, onUpdate, onClose }) => {
  const [formData, setFormData] = useState({
    patient_name: scan.patient_name,
    patient_id: scan.patient_id,
    region: scan.region,
    image_url: scan.image_url
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Edit Scan</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-content">
          <div className="form-group">
            <label className="form-label">Patient Name</label>
            <input
              type="text"
              name="patient_name"
              value={formData.patient_name}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Patient ID</label>
            <input
              type="text"
              name="patient_id"
              value={formData.patient_id}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Region</label>
            <select
              name="region"
              value={formData.region}
              onChange={handleInputChange}
              className="form-select"
              required
            >
              <option value="">Select Region</option>
              <option value="Frontal">Frontal</option>
              <option value="Upper Arch">Upper Arch</option>
              <option value="Lower Arch">Lower Arch</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Image URL</label>
            <input
              type="url"
              name="image_url"
              value={formData.image_url}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Update Scan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TechnicianDashboard;