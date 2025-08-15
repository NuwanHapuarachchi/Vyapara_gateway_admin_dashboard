import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import ApplicationSnapshot from '../../components/ApplicationSnapshot'
import StatusStepper from '../../components/StatusStepper'
import DocumentsPanel from '../../components/DocumentsPanel'
import IdentityPanel from '../../components/IdentityPanel'
import DecisionPanel from '../../components/DecisionPanel'
import SecureMessages from '../../components/SecureMessages'
import AuditLog from '../../components/AuditLog'
import { supabase } from '../../lib/supabaseClient'

export default function ApplicationDetail() {
  const router = useRouter()
  const { id } = router.query
  const [loading, setLoading] = useState(true)
  const [application, setApplication] = useState(null)
  const [documents, setDocuments] = useState([])
  const [err, setErr] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [loadingDocs, setLoadingDocs] = useState(false)

  const loadData = useCallback(async (appId) => {
    setLoading(true)
    setErr('')
    try {
      // Fetch application with related business + applicant
      const { data: app, error: appErr } = await supabase
        .from('business_applications')
        .select(`
          id,
          application_number,
            status,
            submitted_at,
            applicant:applicant_id ( id, full_name, email ),
            business:business_id ( id, business_name, business_type, owner_id ),
            steps:application_steps ( step_name, step_order, is_completed, assigned_to )
        `)
        .eq('id', appId)
        .single()
      if (appErr) throw appErr

      // Derive current stage from status or steps
      let currentStage = 'Application Submitted'
      if (app.status === 'submitted') currentStage = 'Application Submitted'
      else if (app.status === 'in_review' || app.status === 'in-review' || app.status === 'review') currentStage = 'In Review'
      else if (app.status === 'approved') currentStage = 'Approval Granted'
      else if (app.status === 'completed' || app.status === 'registered') currentStage = 'Registration Complete'

      const snapshot = {
        id: app.id,
        applicantName: app.applicant?.full_name || '—',
        email: app.applicant?.email || '—',
        phone: app.applicant?.phone || '—', // may not exist in selected fields
        businessName: app.business?.business_name || '—',
        businessType: app.business?.business_type || '—',
        submittedDate: app.submitted_at || new Date().toISOString(),
        currentStage,
        assignee: 'Unassigned',
        identity: { method: 'NIC', status: 'Pending' }, // placeholder until identity data source defined
      }
      setApplication(snapshot)
      loadDocuments(app)
    } catch (e) {
      console.error('Application load failed', e)
      setErr('Failed to load application.')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadDocuments = useCallback(async (appRecord) => {
    if (!appRecord) return
    setLoadingDocs(true)
    try {
      // Fetch document records tied to application
      const { data: docRows, error: docErr } = await supabase
        .from('business_documents')
        .select('id, document_name, document_type, status, created_at, updated_at, business_id, application_id')
        .eq('application_id', appRecord.id)
      if (docErr) throw docErr

      // Additionally list storage bucket folder using applicant id (folder naming rule provided)
  let storageFiles = []
      if (appRecord.applicant?.id) {
        const { data: listData, error: listErr } = await supabase
          .storage
          .from('business-documents')
          .list(appRecord.applicant.id, { limit: 100 })
        if (!listErr && Array.isArray(listData)) storageFiles = listData
      }

      // Merge table rows with storage presence
      const mappedRows = (docRows || []).map(r => {
        const match = storageFiles.find(f => f.name && f.name.toLowerCase().includes(r.document_name.toLowerCase())) || null
        return {
          id: r.id,
            name: r.document_name,
            type: r.document_type,
            status: (r.status || 'pending').replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase()),
            uploadDate: r.created_at || r.updated_at,
            storagePath: match ? `${appRecord.applicant.id}/${match.name}` : null
        }
      })

      // Add storage-only files not represented in table
      const tableNamesLower = new Set(mappedRows.map(r => (r.name || '').toLowerCase()))
      const storageOnly = storageFiles
        .filter(f => f.name && !tableNamesLower.has(f.name.toLowerCase()))
        .map(f => ({
          id: f.id || f.name,
          name: humanizeFileName(f.name),
          type: guessDocType(f.name),
          status: 'Pending',
          uploadDate: f.created_at || f.updated_at || new Date().toISOString(),
          storagePath: `${appRecord.applicant.id}/${f.name}`
        }))

      setDocuments([...mappedRows, ...storageOnly])
    } catch (e) {
      console.error('Documents load failed', e)
      setErr(prev => prev || 'Failed to load documents.')
    } finally {
      setLoadingDocs(false)
    }
  }, [])

  // helpers for file name -> type
  function humanizeFileName(name=''){ return name.replace(/[_-]/g,' ').replace(/\.[^.]+$/,'').replace(/\b\w/g,c=>c.toUpperCase()) }
  function guessDocType(name=''){ if(/permit/i.test(name)) return 'Permit'; if(/plan/i.test(name)) return 'Plan'; if(/report/i.test(name)) return 'Report'; if(/form/i.test(name)) return 'Form'; return 'Document' }

  useEffect(() => {
    const auth = localStorage.getItem('auth')
    if (!auth) {
      router.push('/')
      return
    }

    if (id) loadData(id)
  }, [id, router, loadData])

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
      </div>
    )
  }

  if (!application) return <Layout><div className="application-detail-container"><p>{err || 'Application not found'}</p></div></Layout>

  return (
    <Layout>
      <div className="application-detail-container">
        <div className="application-header">
          <div className="header-content">
            <div className="breadcrumb">
              <a href="/applications">Applications</a>
              <i className="fas fa-chevron-right"></i>
              <span>{application.id}</span>
            </div>
            <h1>{application.businessName}</h1>
            <p>{application.applicantName} • {application.businessType}</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-ghost">
              <i className="fas fa-print"></i>
              Print
            </button>
            <button className="btn btn-ghost">
              <i className="fas fa-share"></i>
              Share
            </button>
          </div>
        </div>

        {/* Application Snapshot */}
        <ApplicationSnapshot application={application} />

        {/* Status Stepper */}
        <div className="application-card">
          <div className="card-header">
            <h3>Application Progress</h3>
          </div>
          <StatusStepper currentStage={application.currentStage} />
        </div>

        {/* Tabbed Content */}
        <div className="application-tabs">
          <div className="tab-nav">
            <button 
              className={activeTab === 'overview' ? 'tab-btn active' : 'tab-btn'}
              onClick={() => setActiveTab('overview')}
            >
              <i className="fas fa-eye"></i>
              Overview
            </button>
            <button 
              className={activeTab === 'identity' ? 'tab-btn active' : 'tab-btn'}
              onClick={() => setActiveTab('identity')}
            >
              <i className="fas fa-id-card"></i>
              Identity
            </button>
            <button 
              className={activeTab === 'documents' ? 'tab-btn active' : 'tab-btn'}
              onClick={() => setActiveTab('documents')}
            >
              <i className="fas fa-folder"></i>
              Documents
            </button>
            <button 
              className={activeTab === 'messages' ? 'tab-btn active' : 'tab-btn'}
              onClick={() => setActiveTab('messages')}
            >
              <i className="fas fa-comments"></i>
              Messages
            </button>
            <button 
              className={activeTab === 'audit' ? 'tab-btn active' : 'tab-btn'}
              onClick={() => setActiveTab('audit')}
            >
              <i className="fas fa-history"></i>
              Audit
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'overview' && (
              <div className="tab-grid">
        <DocumentsPanel documents={documents} />
                <DecisionPanel applicationId={application.id} />
              </div>
            )}
      {activeTab === 'identity' && <IdentityPanel identity={application.identity || { method:'NIC', status:'Pending' }} />}
      {activeTab === 'documents' && <DocumentsPanel documents={documents} detailed={true} />}
            {activeTab === 'messages' && <SecureMessages applicationId={application.id} />}
            {activeTab === 'audit' && <AuditLog applicationId={application.id} />}
          </div>
        </div>
    {loadingDocs && <div style={{marginTop:'1rem'}}>Loading documents...</div>}
    {err && <div className="error-banner" style={{marginTop:'1rem'}}>{err}</div>}
      </div>
    </Layout>
  )
}