import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function DecisionPanel({ applicationId, onDecisionMade }) {
  const [decision, setDecision] = useState('')
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [checklistItems, setChecklistItems] = useState({
    documents: false,
    identity: false,
    business: false,
    compliance: false
  })

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
    'Incomplete application',
    'Invalid business type',
    'Insufficient supporting documents'
  ]

  const handleDecision = (type) => {
    setDecision(type)
    setShowModal(true)
  }

  const handleChecklistChange = (item) => {
    setChecklistItems(prev => ({
      ...prev,
      [item]: !prev[item]
    }))
  }

  const submitDecision = async () => {
    if (!applicationId) {
      alert('Application ID is required')
      return
    }

    setSubmitting(true)
    try {
      const updateData = {
        updated_at: new Date().toISOString()
      }

      if (decision === 'approve') {
        updateData.status = 'approved'
        updateData.approved_at = new Date().toISOString()
        updateData.current_step = 'approved'
      } else if (decision === 'reject') {
        if (!reason) {
          alert('Please select a rejection reason')
          setSubmitting(false)
          return
        }
        updateData.status = 'rejected'
        updateData.rejected_at = new Date().toISOString()
        updateData.rejection_reason = reason
        updateData.notes = notes
        updateData.current_step = 'rejected'
      } else if (decision === 'request-changes') {
        if (!notes) {
          alert('Please provide feedback for requested changes')
          setSubmitting(false)
          return
        }
        updateData.status = 'revision_required'
        updateData.notes = notes
        updateData.current_step = 'revision_required'
      }

      const { error } = await supabase
        .from('business_applications')
        .update(updateData)
        .eq('id', applicationId)

      if (error) {
        console.error('Error updating application:', error)
        alert('Failed to update application: ' + error.message)
        return
      }

      // Reset form
      setShowModal(false)
      setDecision('')
      setReason('')
      setNotes('')
      
      // Notify parent component
      if (onDecisionMade) {
        onDecisionMade(decision, updateData)
      }

      alert(`Application ${decision === 'approve' ? 'approved' : decision === 'reject' ? 'rejected' : 'marked for revision'} successfully!`)

    } catch (error) {
      console.error('Error submitting decision:', error)
      alert('An unexpected error occurred')
    } finally {
      setSubmitting(false)
    }
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
          type="button"
        >
          <i className="fas fa-check"></i>
          Approve
        </button>
        <button 
          className="decision-btn reject"
          onClick={() => handleDecision('reject')}
          type="button"
        >
          <i className="fas fa-times"></i>
          Reject
        </button>
        <button 
          className="decision-btn request-changes"
          onClick={() => handleDecision('request-changes')}
          type="button"
        >
          <i className="fas fa-edit"></i>
          Request Changes
        </button>
      </div>

      <div className="decision-checklist">
        <h4>Review Checklist</h4>
        <div className="checklist-items">
          <label className="checklist-item">
            <input 
              type="checkbox" 
              id="documents-check"
              checked={checklistItems.documents}
              onChange={() => handleChecklistChange('documents')}
            />
            <span>All required documents submitted</span>
          </label>
          <label className="checklist-item">
            <input 
              type="checkbox" 
              id="identity-check"
              checked={checklistItems.identity}
              onChange={() => handleChecklistChange('identity')}
            />
            <span>Identity verification completed</span>
          </label>
          <label className="checklist-item">
            <input 
              type="checkbox" 
              id="business-check"
              checked={checklistItems.business}
              onChange={() => handleChecklistChange('business')}
            />
            <span>Business information validated</span>
          </label>
          <label className="checklist-item">
            <input 
              type="checkbox" 
              id="compliance-check"
              checked={checklistItems.compliance}
              onChange={() => handleChecklistChange('compliance')}
            />
            <span>No compliance concerns identified</span>
          </label>
        </div>
        
        <div className="checklist-summary">
          <small className="checklist-note">
            Complete checklist before making final decision
          </small>
          <div className="checklist-progress">
            {Object.values(checklistItems).filter(Boolean).length} of 4 items completed
          </div>
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
                  <div className="decision-summary">
                    <i className="fas fa-check-circle" style={{color: 'var(--success-500)', fontSize: '2rem', marginBottom: '1rem'}}></i>
                    <p>You're about to approve application <strong>{applicationId}</strong>.</p>
                    <p>This will:</p>
                    <ul>
                      <li>Move the application to <strong>Approved</strong> status</li>
                      <li>Notify the applicant via email/SMS</li>
                      <li>Generate the business registration certificate</li>
                      <li>Set the approval timestamp</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="rejection-content">
                  <div className="decision-summary">
                    <i className="fas fa-exclamation-triangle" style={{color: 'var(--warning-500)', fontSize: '2rem', marginBottom: '1rem'}}></i>
                    <p>You're about to {decision === 'reject' ? 'reject' : 'request changes for'} application <strong>{applicationId}</strong>.</p>
                  </div>

                  {decision === 'reject' && (
                    <div className="form-group">
                      <label>Rejection Reason *</label>
                      <select
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        required
                      >
                        <option value="">Select a reason</option>
                        {reasonCodes.map((code, index) => (
                          <option key={index} value={code}>{code}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="form-group">
                    <label>
                      {decision === 'reject' ? 'Additional Notes' : 'Feedback for Applicant *'}
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={decision === 'reject' 
                        ? "Add any additional comments for the applicant..." 
                        : "Specify what changes are needed and provide clear instructions..."}
                      rows="4"
                      required={decision === 'request-changes'}
                    />
                    <small className="help-text">
                      {decision === 'reject' 
                        ? "This will be sent to the applicant explaining the rejection."
                        : "Be specific about what needs to be corrected or updated."}
                    </small>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button 
                className="btn btn-ghost"
                onClick={() => setShowModal(false)}
                type="button"
                disabled={submitting}
              >
                Cancel
              </button>
              <button 
                className={`btn ${decision === 'approve' ? 'btn-success' : 'btn-danger'}`}
                onClick={submitDecision}
                type="button"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner" style={{width: '16px', height: '16px', marginRight: '8px'}}></span>
                    Processing...
                  </>
                ) : (
                  <>
                    {decision === 'approve' ? 'Approve Application' :
                     decision === 'reject' ? 'Reject Application' :
                     'Request Changes'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}