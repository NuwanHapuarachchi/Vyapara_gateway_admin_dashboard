export default function DocumentsPanel({ documents, detailed = false }) {
  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'fas fa-check-circle'
      case 'rejected': return 'fas fa-times-circle'
      case 'pending': return 'fas fa-clock'
      default: return 'fas fa-question-circle'
    }
  }

  return (
    <div className="documents-panel">
      <div className="panel-header">
        <h3>Submitted Documents</h3>
        {!detailed && (
          <button className="btn btn-ghost btn-sm">
            View All <i className="fas fa-arrow-right"></i>
          </button>
        )}
      </div>

      <div className="documents-list">
        {documents.map((doc, index) => (
          <div key={index} className="document-item">
            <div className="document-info">
              <div className="document-icon">
                <i className="fas fa-file-pdf"></i>
              </div>
              <div className="document-details">
                <h4>{doc.name}</h4>
                <p>Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="document-status">
              <span className={`status-badge ${doc.status.toLowerCase()}`}>
                <i className={getStatusIcon(doc.status)}></i>
                {doc.status}
              </span>
            </div>

            <div className="document-actions">
              <button className="action-btn" title="View">
                <i className="fas fa-eye"></i>
              </button>
              <button className="action-btn" title="Download">
                <i className="fas fa-download"></i>
              </button>
              {detailed && (
                <>
                  <button className="action-btn" title="Replace">
                    <i className="fas fa-sync"></i>
                  </button>
                  <button className="action-btn" title="Request Re-upload">
                    <i className="fas fa-upload"></i>
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {detailed && (
        <div className="documents-summary">
          <div className="summary-stats">
            <div className="stat-item approved">
              <span className="stat-number">1</span>
              <span className="stat-label">Approved</span>
            </div>
            <div className="stat-item pending">
              <span className="stat-number">1</span>
              <span className="stat-label">Pending</span>
            </div>
            <div className="stat-item rejected">
              <span className="stat-number">1</span>
              <span className="stat-label">Rejected</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}