import React, { useState } from 'react';
import axios from 'axios';
import './index.css';

const UploadScan = ({ onScanUploaded }) => {
  const [formData, setFormData] = useState({
    patient_name: '',
    patient_id: '',
    region: '',
    image_url: '',
    scan_type: 'RGB'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  const token = localStorage.getItem('token');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear messages when user starts typing
    setError('');
    setSuccess('');

    // Update image preview when URL changes
    if (name === 'image_url') {
      setImagePreview(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.patient_name || !formData.patient_id || !formData.region || !formData.image_url) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('http://localhost:5000/api/scans', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.message === 'Scan uploaded successfully') {
        setSuccess('Scan uploaded successfully!');
        setFormData({
          patient_name: '',
          patient_id: '',
          region: '',
          image_url: '',
          scan_type: 'RGB'
        });
        setImagePreview('');
        
        // Call the callback to refresh parent component data
        if (onScanUploaded) {
          onScanUploaded();
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.response?.data?.error || 'Failed to upload scan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = () => {
    setImagePreview('');
  };

  const generatePatientId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const patientId = `PAT${timestamp.toString().slice(-6)}${random.toString().padStart(3, '0')}`;
    setFormData(prev => ({
      ...prev,
      patient_id: patientId
    }));
  };

  return (
    <div className="upload-scan-container">
      <div className="upload-form-card">
        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Patient Name <span className="required">*</span>
              </label>
              <input
                type="text"
                name="patient_name"
                value={formData.patient_name}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter patient's full name"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Patient ID <span className="required">*</span>
              </label>
              <div className="input-with-button">
                <input
                  type="text"
                  name="patient_id"
                  value={formData.patient_id}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter or generate patient ID"
                  required
                />
                <button
                  type="button"
                  onClick={generatePatientId}
                  className="btn btn-secondary generate-btn"
                >
                  Generate
                </button>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Region <span className="required">*</span>
              </label>
              <select
                name="region"
                value={formData.region}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="">Select region</option>
                <option value="Frontal">Frontal</option>
                <option value="Upper Arch">Upper Arch</option>
                <option value="Lower Arch">Lower Arch</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Scan Type</label>
              <select
                name="scan_type"
                value={formData.scan_type}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="RGB">RGB</option>
                <option value="Infrared">Infrared</option>
                <option value="UV">UV</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Image URL <span className="required">*</span>
            </label>
            <input
              type="url"
              name="image_url"
              value={formData.image_url}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
              required
            />
            <small className="form-help">
              Paste a direct link to the scan image. Supported formats: JPG, PNG, GIF
            </small>
          </div>

          {imagePreview && (
            <div className="image-preview">
              <label className="form-label">Preview</label>
              <div className="preview-container">
                <img 
                  src={imagePreview} 
                  alt="Scan preview" 
                  onError={handleImageError}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              {success}
            </div>
          )}

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary submit-btn"
              disabled={loading}
            >
              {loading ? 'Uploading...' : 'Upload Scan'}
            </button>
            
            <button
              type="button"
              onClick={() => {
                setFormData({
                  patient_name: '',
                  patient_id: '',
                  region: '',
                  image_url: '',
                  scan_type: 'RGB'
                });
                setImagePreview('');
                setError('');
                setSuccess('');
              }}
              className="btn btn-secondary"
              disabled={loading}
            >
              Clear Form
            </button>
          </div>
        </form>

        <div className="upload-info">
          <h4>Upload Guidelines</h4>
          <ul>
            <li>Ensure the image URL is publicly accessible</li>
            <li>Use high-quality images for better analysis</li>
            <li>Patient ID should be unique for each patient</li>
            <li>Select the appropriate region for accurate classification</li>
            <li>RGB is the standard scan type for most cases</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UploadScan;