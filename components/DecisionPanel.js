import { useState } from 'react'

export default function DecisionPanel({ applicationId }) {
  const [decision, setDecision] = useState('')
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')
  const [showModal, setShowModal] = useState(false)

  const reasonCodes = [
    'Document Issues - Blurry/Unreadable',
    'Document Issues - Cropped',
    'Document Issues - Missing Page',
    'Document Issues - Expired',
    'Data Mismatch - Name mismatch',
    'Data Mismatch - Address mismatch',
    'Data Mismatch - ID number mismatch',
    'Compliance - Sanctions/PEP hit',
    'Compliance - Additional due diligence required',
    'Incomplete application'
  ]

  const handleDecision = (type) => {
    setDecision(type)
    setShowModal(true)
  }

  const submitDecision = () => {
    // Handle decision submission
    console.log('Decision:', decision, 'Reason:', reason, 'Notes:', notes)
    setShowModal(false)
    setDecision('')
    setReason('')
    setNotes('')
  }

  return (
    <div className="decision-panel">
      <div className="panel-header">
        <h3>Make Decision</h3>
      </div>

      <div className="decision-buttons">
        <button 
          className="decision-btn approve"
          onClick={() => handleDecision('approve')}
        >
          <i className="fas fa-check"></i>
          Approve
        </button>
        <button 
          className="decision-btn reject"
          onClick={() => handleDecision('reject')}
        >
          <i className="fas fa-times"></i>
          Reject
        </button>
        <button 
          className="decision-btn request-changes"
          onClick={() => handleDecision('request-changes')}
        >
          <i className="fas fa-edit"></i>
          Request Changes
        </button>
      </div>

      <div className="decision-checklist">
        <h4>Review Checklist</h4>
        <div className="checklist-items">
          <label className="checklist-item">
            <input type="checkbox" />
            <span>All required documents submitted</span>
          </label>
          <label className="checklist-item">
            <input type="checkbox" />
            <span>Identity verification completed</span>
          </label>
          <label className="checklist-item">
            <input type="checkbox" />
            <span>Business information validated</span>
          </label>
          <label className="checklist-item">
            <input type="checkbox" />
            <span>No compliance concerns identified</span>
          </label>
        </div>
      </div>

      {/* Decision Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal decision-modal">
            <div className="modal-header">
              <h3>
                {decision === 'approve' ? 'Approve Application' :
                 decision === 'reject' ? 'Reject Application' :
                 'Request Changes'}
              </h3>
              <button 
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              {decision === 'approve' ? (
                <div className="approval-content">
                  <p>You're approving <strong>{applicationId}</strong>. This will notify the applicant and move the application to <strong>Approval Granted</strong>.</p>
                </div>
              ) : (
                <div className="rejection-content">
                  <div className="form-group">
                    <label>Reason Code</label>
                    <select
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    >
                      <option value="">Select a reason</option>
                      {reasonCodes.map((code, index) => (
                        <option key={index} value={code}>{code}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Additional Notes</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add any additional comments for the applicant..."
                      rows="4"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button 
                className="btn btn-ghost"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button 
                className={`btn ${decision === 'approve' ? 'btn-success' : 'btn-danger'}`}
                onClick={submitDecision}
              >
                {decision === 'approve' ? 'Approve Application' :
                 decision === 'reject' ? 'Reject Application' :
                 'Request Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}