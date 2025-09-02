import React from 'react';
import './index.css';

const ScanViewer = ({ scan, onClose }) => {
  if (!scan) return null;

  return (
    <div className="scan-viewer-overlay">
      <div className="scan-viewer-modal">
        <div className="scan-viewer-header">
          <h2>Scan Details</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="scan-viewer-content">
          <div className="scan-viewer-image">
            <img src={scan.image_url} alt="Scan" />
          </div>
          <div className="scan-viewer-info">
            <div className="info-row">
              <span className="label">Patient Name:</span>
              <span className="value">{scan.patient_name}</span>
            </div>
            <div className="info-row">
              <span className="label">Patient ID:</span>
              <span className="value">{scan.patient_id}</span>
            </div>
            <div className="info-row">
              <span className="label">Region:</span>
              <span className="value">{scan.region}</span>
            </div>
            <div className="info-row">
              <span className="label">Scan Type:</span>
              <span className="value">{scan.scan_type}</span>
            </div>
            <div className="info-row">
              <span className="label">Uploaded:</span>
              <span className="value">
                {new Date(scan.upload_date).toLocaleString()}
              </span>
            </div>
            <div className="info-row">
              <span className="label">Uploaded By:</span>
              <span className="value">{scan.uploaded_by_email}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanViewer;
