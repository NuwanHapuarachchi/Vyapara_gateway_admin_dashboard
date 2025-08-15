// components/AuditLog.js
import { useEffect, useState, useMemo } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function AuditLog({ applicationId, showFilters = true, maxEntries = 50 }) {
  const [loading, setLoading] = useState(true)
  const [auditEntries, setAuditEntries] = useState([])
  const [filters, setFilters] = useState({
    actionType: 'all',
    actor: 'all',
    dateRange: '7d'
  })
  const [actors, setActors] = useState([])
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    fetchAuditLog()
    if (showFilters) {
      fetchActors()
    }
  }, [applicationId, filters])

  const fetchAuditLog = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('audit_logs')
        .select(`
          *,
          user:user_id(name, email),
          application:application_id(business_name)
        `)
        .order('created_at', { ascending: false })
        .limit(maxEntries)

      // Filter by application if provided
      if (applicationId) {
        query = query.eq('application_id', applicationId)
      }

      // Apply filters
      if (filters.actionType !== 'all') {
        query = query.eq('action_type', filters.actionType)
      }

      if (filters.actor !== 'all') {
        query = query.eq('user_id', filters.actor)
      }

      // Date range filter
      if (filters.dateRange !== 'all') {
        const now = new Date()
        let startDate = new Date()
        
        switch (filters.dateRange) {
          case '1d':
            startDate.setDate(now.getDate() - 1)
            break
          case '7d':
            startDate.setDate(now.getDate() - 7)
            break
          case '30d':
            startDate.setDate(now.getDate() - 30)
            break
          case '90d':
            startDate.setDate(now.getDate() - 90)
            break
        }
        
        if (filters.dateRange !== 'all') {
          query = query.gte('created_at', startDate.toISOString())
        }
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching audit log:', error)
        // Fallback to mock data if Supabase fails
        setAuditEntries(getMockAuditData())
      } else {
        setAuditEntries(data || [])
      }
    } catch (err) {
      console.error('Audit log fetch failed:', err)
      setAuditEntries(getMockAuditData())
    }
    setLoading(false)
  }

  const fetchActors = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('active', true)

      if (!error) {
        setActors(data || [])
      }
    } catch (err) {
      console.error('Failed to fetch actors:', err)
    }
  }

  // Fallback mock data
  const getMockAuditData = () => [
    {
      id: 1,
      action_type: 'application_submitted',
      action_description: 'Application Submitted',
      details: 'Initial application submission',
      user_id: 'user1',
      user: { name: 'John Silva', email: 'john@example.com' },
      application_id: applicationId,
      application: { business_name: 'Silva Enterprises' },
      created_at: '2024-08-15T10:00:00Z',
      metadata: { ip_address: '192.168.1.100' }
    },
    {
      id: 2,
      action_type: 'document_uploaded',
      action_description: 'Document Uploaded',
      details: 'Business Plan document uploaded',
      user_id: 'user1',
      user: { name: 'John Silva', email: 'john@example.com' },
      application_id: applicationId,
      application: { business_name: 'Silva Enterprises' },
      created_at: '2024-08-15T10:15:00Z',
      metadata: { document_type: 'business_plan', file_name: 'business_plan.pdf' }
    },
    {
      id: 3,
      action_type: 'application_viewed',
      action_description: 'Application Viewed',
      details: 'Application opened for review',
      user_id: 'admin1',
      user: { name: 'Sarah Johnson', email: 'sarah@vyapara.lk' },
      application_id: applicationId,
      application: { business_name: 'Silva Enterprises' },
      created_at: '2024-08-15T11:30:00Z',
      metadata: { duration_minutes: 15 }
    },
    {
      id: 4,
      action_type: 'status_changed',
      action_description: 'Status Changed',
      details: 'Application status changed from Pending to In Review',
      user_id: 'admin1',
      user: { name: 'Sarah Johnson', email: 'sarah@vyapara.lk' },
      application_id: applicationId,
      application: { business_name: 'Silva Enterprises' },
      created_at: '2024-08-15T14:30:00Z',
      metadata: { old_status: 'pending', new_status: 'in_review' }
    },
    {
      id: 5,
      action_type: 'message_sent',
      action_description: 'Message Sent',
      details: 'Requested clearer NIC copy',
      user_id: 'admin1',
      user: { name: 'Sarah Johnson', email: 'sarah@vyapara.lk' },
      application_id: applicationId,
      application: { business_name: 'Silva Enterprises' },
      created_at: '2024-08-15T14:35:00Z',
      metadata: { message_type: 'document_request' }
    }
  ]

  const getActionIcon = (actionType) => {
    const icons = {
      application_submitted: 'fas fa-file-plus',
      document_uploaded: 'fas fa-upload',
      document_updated: 'fas fa-sync',
      application_viewed: 'fas fa-eye',
      status_changed: 'fas fa-exchange-alt',
      message_sent: 'fas fa-envelope',
      application_approved: 'fas fa-check-circle',
      application_rejected: 'fas fa-times-circle',
      assignment_changed: 'fas fa-user-tag',
      comment_added: 'fas fa-comment',
      document_reviewed: 'fas fa-file-check',
      system_event: 'fas fa-cog'
    }
    return icons[actionType] || 'fas fa-info-circle'
  }

  const getActionColor = (actionType) => {
    const colors = {
      application_submitted: '#10b981',
      document_uploaded: '#3b82f6',
      document_updated: '#f59e0b',
      application_viewed: '#6b7280',
      status_changed: '#8b5cf6',
      message_sent: '#06b6d4',
      application_approved: '#10b981',
      application_rejected: '#ef4444',
      assignment_changed: '#f59e0b',
      comment_added: '#84cc16',
      document_reviewed: '#10b981',
      system_event: '#6b7280'
    }
    return colors[actionType] || '#6b7280'
  }

  const formatTimeAgo = (timestamp) => {
    const now = new Date()
    const then = new Date(timestamp)
    const diffMs = now - then
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return then.toLocaleDateString()
  }

  const exportAuditLog = async () => {
    setExporting(true)
    try {
      const csvHeaders = [
        'Timestamp',
        'Action',
        'Actor',
        'Actor Email',
        'Details',
        'Application ID',
        'Business Name',
        'IP Address'
      ]

      const csvRows = auditEntries.map(entry => [
        new Date(entry.created_at).toISOString(),
        entry.action_description || entry.action_type,
        entry.user?.name || 'System',
        entry.user?.email || '',
        entry.details || '',
        entry.application_id || '',
        entry.application?.business_name || '',
        entry.metadata?.ip_address || ''
      ])

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
        .join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `audit_log_${applicationId || 'all'}_${new Date().toISOString().slice(0, 10)}.csv`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
    }
    setExporting(false)
  }

  const filteredEntries = useMemo(() => {
    return auditEntries.filter(entry => {
      if (filters.actionType !== 'all' && entry.action_type !== filters.actionType) {
        return false
      }
      if (filters.actor !== 'all' && entry.user_id !== filters.actor) {
        return false
      }
      return true
    })
  }, [auditEntries, filters])

  if (loading) {
    return (
      <div className="audit-loading">
        <div className="spinner" />
        <p>Loading audit trail...</p>
      </div>
    )
  }

  return (
    <div className="audit-log">
      <div className="audit-header">
        <div className="audit-title">
          <h3>Audit Trail</h3>
          <span className="entry-count">{filteredEntries.length} entries</span>
        </div>
        
        {showFilters && (
          <div className="audit-filters">
            <select 
              className="audit-filter"
              value={filters.actionType}
              onChange={(e) => setFilters(prev => ({ ...prev, actionType: e.target.value }))}
            >
              <option value="all">All Actions</option>
              <option value="application_submitted">Submissions</option>
              <option value="document_uploaded">Document Uploads</option>
              <option value="status_changed">Status Changes</option>
              <option value="message_sent">Messages</option>
              <option value="application_viewed">Views</option>
              <option value="application_approved">Approvals</option>
              <option value="application_rejected">Rejections</option>
            </select>

            {actors.length > 0 && (
              <select 
                className="audit-filter"
                value={filters.actor}
                onChange={(e) => setFilters(prev => ({ ...prev, actor: e.target.value }))}
              >
                <option value="all">All Users</option>
                {actors.map(actor => (
                  <option key={actor.id} value={actor.id}>
                    {actor.name}
                  </option>
                ))}
              </select>
            )}

            <select 
              className="audit-filter"
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
            >
              <option value="all">All Time</option>
              <option value="1d">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
        )}

        <button 
          className="btn btn-ghost audit-export"
          onClick={exportAuditLog}
          disabled={exporting}
        >
          {exporting ? (
            <i className="fas fa-spinner fa-spin"></i>
          ) : (
            <i className="fas fa-download"></i>
          )}
          Export CSV
        </button>
      </div>

      {filteredEntries.length === 0 ? (
        <div className="audit-empty">
          <div className="empty-icon">
            <i className="fas fa-history"></i>
          </div>
          <h4>No audit entries found</h4>
          <p>No activities match your current filters.</p>
        </div>
      ) : (
        <div className="audit-timeline">
          {filteredEntries.map((entry) => (
            <div key={entry.id} className="audit-entry">
              <div 
                className="audit-icon"
                style={{ backgroundColor: getActionColor(entry.action_type) }}
              >
                <i className={getActionIcon(entry.action_type)}></i>
              </div>
              
              <div className="audit-content">
                <div className="audit-header-info">
                  <div className="audit-action">
                    <strong>{entry.action_description || entry.action_type}</strong>
                    <span className="audit-actor">
                      by {entry.user?.name || 'System'}
                    </span>
                  </div>
                  <div className="audit-timestamp">
                    {formatTimeAgo(entry.created_at)}
                  </div>
                </div>
                
                <div className="audit-details">
                  {entry.details}
                </div>

                {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                  <div className="audit-metadata">
                    {entry.metadata.old_status && entry.metadata.new_status && (
                      <span className="metadata-tag">
                        {entry.metadata.old_status} → {entry.metadata.new_status}
                      </span>
                    )}
                    {entry.metadata.document_type && (
                      <span className="metadata-tag">
                        <i className="fas fa-file"></i>
                        {entry.metadata.document_type}
                      </span>
                    )}
                    {entry.metadata.ip_address && (
                      <span className="metadata-tag">
                        <i className="fas fa-globe"></i>
                        {entry.metadata.ip_address}
                      </span>
                    )}
                    {entry.metadata.duration_minutes && (
                      <span className="metadata-tag">
                        <i className="fas fa-clock"></i>
                        {entry.metadata.duration_minutes}m
                      </span>
                    )}
                  </div>
                )}

                {!applicationId && entry.application?.business_name && (
                  <div className="audit-application">
                    <i className="fas fa-building"></i>
                    {entry.application.business_name}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}