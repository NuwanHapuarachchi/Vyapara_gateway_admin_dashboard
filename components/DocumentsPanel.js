import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function DocumentsPanel({ documents, detailed = false }) {
  const [downloadingId, setDownloadingId] = useState(null)
  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'fas fa-check-circle'
      case 'rejected': return 'fas fa-times-circle'
      case 'pending': return 'fas fa-clock'
      default: return 'fas fa-question-circle'
    }
  }

  async function handleDownload(doc){
    if(!doc.storagePath) return
    try {
      setDownloadingId(doc.id)
      const { data, error } = await supabase
        .storage
        .from('business-documents')
        .createSignedUrl(doc.storagePath, 60)
      if (error) throw error
      if (data?.signedUrl) {
        const a = document.createElement('a')
        a.href = data.signedUrl
        a.download = doc.name || 'document'
        document.body.appendChild(a)
        a.click()
        a.remove()
      }
    } catch (e){
      console.error('Download failed', e)
      alert('Download failed')
    } finally {
      setDownloadingId(null)
    }
  }

  async function handleView(doc){
    if(!doc.storagePath) return
    try {
      const { data, error } = await supabase
        .storage
        .from('business-documents')
        .createSignedUrl(doc.storagePath, 60)
      if (error) throw error
      if (data?.signedUrl) window.open(data.signedUrl, '_blank')
    } catch (e){
      console.error('Open failed', e)
      alert('Unable to open document')
    }
  }

  const empty = !documents || !documents.length

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

      {empty && <div style={{padding:'0.75rem', fontStyle:'italic'}}>No documents uploaded.</div>}
      {!empty && <div className="documents-list">
        {documents.map((doc, index) => (
          <div key={index} className="document-item">
            <div className="document-info">
              <div className="document-icon">
                <i className="fas fa-file-pdf"></i>
              </div>
              <div className="document-details">
                <h4>{doc.name}</h4>
                <p>Uploaded: {doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString() : '—'}</p>
              </div>
            </div>

            <div className="document-status">
              <span className={`status-badge ${doc.status.toLowerCase()}`}>
                <i className={getStatusIcon(doc.status)}></i>
                {doc.status}
              </span>
            </div>

            <div className="document-actions">
              <button className="action-btn" title="View" disabled={!doc.storagePath} onClick={()=>handleView(doc)}>
                <i className="fas fa-eye"></i>
              </button>
              <button className="action-btn" title="Download" disabled={!doc.storagePath || downloadingId===doc.id} onClick={()=>handleDownload(doc)}>
                <i className={downloadingId===doc.id ? 'fas fa-spinner fa-spin' : 'fas fa-download'}></i>
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
      </div>}

  {detailed && !empty && (
        <div className="documents-summary">
          <div className="summary-stats">
            <div className="stat-item approved">
      <span className="stat-number">{documents.filter(d=>d.status.toLowerCase()==='approved').length}</span>
              <span className="stat-label">Approved</span>
            </div>
            <div className="stat-item pending">
      <span className="stat-number">{documents.filter(d=>d.status.toLowerCase()==='pending').length}</span>
              <span className="stat-label">Pending</span>
            </div>
            <div className="stat-item rejected">
      <span className="stat-number">{documents.filter(d=>d.status.toLowerCase()==='rejected').length}</span>
              <span className="stat-label">Rejected</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}