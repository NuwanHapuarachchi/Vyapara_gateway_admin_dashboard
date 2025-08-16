export default function ApplicationSnapshot({ application }) {
  return (
    <div className="application-card snapshot-card">
      <div className="card-header">
        <h3>Application Overview</h3>
        <div className="snapshot-actions">
          <button className="btn btn-ghost btn-sm">
            <i className="fas fa-edit"></i>
            Edit
          </button>
          <button className="btn btn-ghost btn-sm">
            <i className="fas fa-user-plus"></i>
            Assign
          </button>
        </div>
      </div>

      <div className="snapshot-grid">
        <div className="snapshot-section">
          <h4>Applicant Information</h4>
          <div className="info-grid">
            <div className="info-item">
              <label>Name</label>
              <span>{application.applicantName}</span>
            </div>
            <div className="info-item">
              <label>Email</label>
              <span>{application.email}</span>
            </div>
            <div className="info-item">
              <label>Phone</label>
              <span>{application.phone}</span>
            </div>
          </div>
        </div>

        <div className="snapshot-section">
          <h4>Business Information</h4>
          <div className="info-grid">
            <div className="info-item">
              <label>Business Name</label>
              <span>{application.businessName}</span>
            </div>
            <div className="info-item">
              <label>Business Type</label>
              <span>{application.businessType}</span>
            </div>
            <div className="info-item">
              <label>Submitted Date</label>
              <span>{new Date(application.submittedDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="snapshot-section">
          <h4>Current Status</h4>
          <div className="status-info">
            <div className="status-row">
              <span className={`status-badge status-${(application.status || '').toLowerCase()}`}>
                {application.status || 'Unknown'}
              </span>
              <span className="current-stage">{application.currentStage}</span>
            </div>
            <div className="status-details">
              <span className="assignee">Assigned to: {application.assignee}</span>
              {application.rejected_at && application.rejection_reason && (
                <div className="rejection-info">
                  <strong>Rejection Reason:</strong> {application.rejection_reason}
                </div>
              )}
              {application.notes && (
                <div className="admin-notes">
                  <strong>Admin Notes:</strong> {application.notes}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}