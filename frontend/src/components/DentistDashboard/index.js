import React, { useState, useEffect } from 'react';
import Header from '../Header';
import ScanViewer from '../ScanViewer';
import axios from 'axios';
import './index.css';

const DentistDashboard = () => {
  const [activeTab, setActiveTab] = useState('scans');
  const [scans, setScans] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [selectedScan, setSelectedScan] = useState(null);
  const [showScanViewer, setShowScanViewer] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (activeTab === 'scans') {
      fetchAllScans();
    } else if (activeTab === 'stats') {
      fetchStats();
    }
  }, [activeTab, searchTerm, selectedRegion, currentPage]);

  const fetchAllScans = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/scans', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {
          search: searchTerm,
          region: selectedRegion,
          page: currentPage,
          limit: 12
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

  const fetchScanDetails = async (scanId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/scans/${scanId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.message === 'success') {
        setSelectedScan(response.data.data);
        setShowScanViewer(true);
      }
    } catch (error) {
      console.error('Error fetching scan details:', error);
      alert('Failed to load scan details');
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

  const handleViewScan = (scan) => {
    fetchScanDetails(scan.id);
  };

  const closeScanViewer = () => {
    setShowScanViewer(false);
    setSelectedScan(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRegionColor = (region) => {
    const colors = {
      'Frontal': '#007bff',
      'Upper Arch': '#28a745',
      'Lower Arch': '#ffc107'
    };
    return colors[region] || '#6c757d';
  };

  return (
    <div>
      <Header />
      <div className="dashboard-container">
        <div className="dashboard-sidebar">
          <nav className="dashboard-nav">
            <button 
              className={`nav-item ${activeTab === 'scans' ? 'active' : ''}`}
              onClick={() => setActiveTab('scans')}
            >
              All Scans
            </button>
            <button 
              className={`nav-item ${activeTab === 'stats' ? 'active' : ''}`}
              onClick={() => setActiveTab('stats')}
            >
              Analytics
            </button>
            <button 
              className={`nav-item ${activeTab === 'patients' ? 'active' : ''}`}
              onClick={() => setActiveTab('patients')}
            >
              Patients
            </button>
          </nav>
        </div>

        <div className="dashboard-main">
          {activeTab === 'scans' && (
            <div className="tab-content">
              <div className="tab-header">
                <h2>Patient Scans Database</h2>
                <div className="scan-summary">
                  <span className="scan-count">
                    {pagination.total_records || 0} total scans
                  </span>
                </div>
              </div>
              
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
                  <label className="form-label">Filter by Region</label>
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
                <div className="loading">
                  <div className="loading-spinner"></div>
                  <p>Loading scans...</p>
                </div>
              ) : (
                <>
                  <div className="scans-grid">
                    {scans.map(scan => (
                      <div key={scan.id} className="scan-card">
                        <div className="scan-image">
                          <img src={scan.image_url} alt={`${scan.patient_name} scan`} />
                          <div className="scan-overlay">
                            <button 
                              className="view-btn"
                              onClick={() => handleViewScan(scan)}
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                        
                        <div className="scan-info">
                          <div className="scan-header">
                            <h3>{scan.patient_name}</h3>
                            <span 
                              className="region-badge"
                              style={{ backgroundColor: getRegionColor(scan.region) }}
                            >
                              {scan.region}
                            </span>
                          </div>
                          
                          <div className="scan-details">
                            <div className="detail-item">
                              <span className="detail-label">Patient ID:</span>
                              <span className="detail-value">{scan.patient_id}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Scan Type:</span>
                              <span className="detail-value">{scan.scan_type}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Uploaded:</span>
                              <span className="detail-value">{formatDate(scan.upload_date)}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Technician:</span>
                              <span className="detail-value">{scan.uploaded_by_email}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {scans.length === 0 && !loading && (
                    <div className="no-data">
                      <div className="no-data-icon">📊</div>
                      <h3>No scans found</h3>
                      <p>Try adjusting your search criteria or check back later for new uploads.</p>
                    </div>
                  )}

                  {pagination.total_pages > 1 && (
                    <div className="pagination">
                      <button 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                        className="pagination-btn"
                      >
                        ← Previous
                      </button>
                      
                      <div className="pagination-info">
                        <span>Page {currentPage} of {pagination.total_pages}</span>
                        <small>({pagination.total_records} total records)</small>
                      </div>
                      
                      <button 
                        disabled={currentPage === pagination.total_pages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                        className="pagination-btn"
                      >
                        Next →
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="tab-content">
              <h2>Analytics Dashboard</h2>
              
              <div className="stats-overview">
                <div className="stat-card primary">
                  <div className="stat-icon">📊</div>
                  <div className="stat-content">
                    <h3>Total Scans</h3>
                    <p className="stat-number">{stats.total_scans || 0}</p>
                    <span className="stat-description">All time uploads</span>
                  </div>
                </div>

                <div className="stat-card success">
                  <div className="stat-icon">👥</div>
                  <div className="stat-content">
                    <h3>Unique Patients</h3>
                    <p className="stat-number">{stats.total_patients || 0}</p>
                    <span className="stat-description">Individual records</span>
                  </div>
                </div>

                <div className="stat-card warning">
                  <div className="stat-icon">📈</div>
                  <div className="stat-content">
                    <h3>Today's Uploads</h3>
                    <p className="stat-number">{stats.today_uploads || 0}</p>
                    <span className="stat-description">New scans today</span>
                  </div>
                </div>
              </div>

              {stats.scans_by_region && stats.scans_by_region.length > 0 && (
                <div className="region-analysis">
                  <h3>Distribution by Region</h3>
                  <div className="region-chart">
                    {stats.scans_by_region.map(item => {
                      const percentage = ((item.count / stats.total_scans) * 100).toFixed(1);
                      return (
                        <div key={item.region} className="region-bar">
                          <div className="region-info">
                            <span className="region-name">{item.region}</span>
                            <span className="region-stats">
                              {item.count} scans ({percentage}%)
                            </span>
                          </div>
                          <div className="progress-bar">
                            <div 
                              className="progress-fill"
                              style={{ 
                                width: `${percentage}%`,
                                backgroundColor: getRegionColor(item.region)
                              }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'patients' && (
            <div className="tab-content">
              <h2>Patient Management</h2>
              <div className="coming-soon">
                <div className="coming-soon-icon">🚧</div>
                <h3>Coming Soon</h3>
                <p>Patient management features are under development.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scan Viewer Modal */}
      {showScanViewer && selectedScan && (
        <ScanViewer 
          scan={selectedScan} 
          onClose={closeScanViewer}
        />
      )}
    </div>
  );
};

export default DentistDashboard;