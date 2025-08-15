export default function IdentityPanel({ identity }) {
  return (
    <div className="identity-panel">
      <div className="panel-header">
        <h3>Identity Verification</h3>
        <span className={`status-badge ${identity.status.toLowerCase()}`}>
          {identity.status}
        </span>
      </div>

      <div className="identity-content">
        <div className="method-selector">
          <h4>Verification Method</h4>
          <div className="method-cards">
            <div className={`method-card ${identity.method === 'NIC' ? 'selected' : ''}`}>
              <div className="method-icon">
                <i className="fas fa-id-card"></i>
              </div>
              <span>National ID Card</span>
            </div>
            <div className={`method-card ${identity.method === 'Passport' ? 'selected' : ''}`}>
              <div className="method-icon">
                <i className="fas fa-passport"></i>
              </div>
              <span>Passport</span>
            </div>
            <div className={`method-card ${identity.method === 'License' ? 'selected' : ''}`}>
              <div className="method-icon">
                <i className="fas fa-id-badge"></i>
              </div>
              <span>Driving License</span>
            </div>
          </div>
        </div>

        {identity.method === 'NIC' && (
          <div className="identity-details">
            <h4>NIC Details</h4>
            <div className="details-grid">
              <div className="detail-item">
                <label>NIC Number</label>
                <span>{identity.nicNumber}</span>
              </div>
              <div className="detail-item">
                <label>Name on Document</label>
                <span>{identity.nameOnDoc}</span>
              </div>
              <div className="detail-item">
                <label>Date of Birth</label>
                <span>{new Date(identity.dateOfBirth).toLocaleDateString()}</span>
              </div>
              <div className="detail-item">
                <label>Issue Date</label>
                <span>{new Date(identity.issueDate).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="document-images">
              <h4>Uploaded Images</h4>
              <div className="image-grid">
                <div className="image-placeholder">
                  <i className="fas fa-image"></i>
                  <span>NIC Front</span>
                </div>
                <div className="image-placeholder">
                  <i className="fas fa-image"></i>
                  <span>NIC Back</span>
                </div>
              </div>
            </div>

            <div className="verification-actions">
              <button className="btn btn-success">
                <i className="fas fa-check"></i>
                Approve Identity
              </button>
              <button className="btn btn-danger">
                <i className="fas fa-times"></i>
                Reject
              </button>
              <button className="btn btn-secondary">
                <i className="fas fa-redo"></i>
                Request Re-upload
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}