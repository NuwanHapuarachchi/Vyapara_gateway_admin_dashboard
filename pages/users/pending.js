// pages/users/pending.js
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import { supabase } from '../../lib/supabaseClient'

export default function PendingUsers() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [pendingUsers, setPendingUsers] = useState([])
  const [selectedUsers, setSelectedUsers] = useState(new Set())
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    const authed = typeof window !== 'undefined' && localStorage.getItem('auth') === 'true'
    if (!authed) router.replace('/')
    else fetchPendingUsers()
  }, [router])

  const fetchPendingUsers = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('user_profiles')
        .select(`
          *,
          applications(id, status, submitted_at)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true })

      const { data, error } = await query
      if (error) throw error
      setPendingUsers(data || [])
    } catch (err) {
      console.error('Error fetching pending users:', err)
      setPendingUsers([])
    } finally {
      setLoading(false)
    }
  }

  const handleUserSelect = (userId, checked) => {
    const s = new Set(selectedUsers)
    checked ? s.add(userId) : s.delete(userId)
    setSelectedUsers(s)
  }

  const handleSelectAll = (checked) => {
    setSelectedUsers(checked ? new Set(pendingUsers.map(u => u.id)) : new Set())
  }

  const handleBulkAction = async (action) => {
    if (selectedUsers.size === 0) return
    setActionLoading(true)
    try {
      const ids = Array.from(selectedUsers)
      // TODO: real update with Supabase here
      console.log(`${action} users:`, ids)
      await fetchPendingUsers()
      setSelectedUsers(new Set())
      alert(`Successfully ${action}ed ${ids.length} user(s)`)
    } catch (err) {
      console.error(`Error during ${action}:`, err)
      alert(`Error ${action}ing users`)
    } finally {
      setActionLoading(false)
    }
  }

  const handleIndividualAction = async (userId, action) => {
    setActionLoading(true)
    try {
      // TODO: real update with Supabase here
      console.log(`${action} user:`, userId)
      await fetchPendingUsers()
      alert(`User ${action}ed successfully`)
    } catch (err) {
      console.error(`Error ${action}ing user:`, err)
      alert(`Error ${action}ing user`)
    } finally {
      setActionLoading(false)
    }
  }

  const getDaysWaiting = (createdAt) => {
    const created = new Date(createdAt)
    const now = new Date()
    return Math.ceil(Math.abs(now - created) / (1000 * 60 * 60 * 24))
  }

  if (loading) {
    return (
      <Layout>
        <div className="loading-screen"><div className="spinner" /></div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="applications-container">
        <div className="applications-header">
          <div className="header-content">
            <h1>Pending Sign-ups</h1>
            <p>Review and approve users awaiting verification ({pendingUsers.length} pending)</p>
          </div>
          <div className="header-actions">
            {selectedUsers.size > 0 && (
              <>
                <button
                  className="btn btn-success"
                  onClick={() => handleBulkAction('approve')}
                  disabled={actionLoading}
                >
                  <i className="fas fa-check" /> Approve Selected ({selectedUsers.size})
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleBulkAction('reject')}
                  disabled={actionLoading}
                >
                  <i className="fas fa-times" /> Reject Selected
                </button>
              </>
            )}
          </div>
        </div>

        {/* Quick stats */}
        <div className="stats-row" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="stat-card">
            <div className="stat-icon"><i className="fas fa-clock" style={{ color: '#ff9500' }} /></div>
            <div className="stat-content">
              <div className="stat-number">{pendingUsers.length}</div>
              <div className="stat-label">Pending Approval</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><i className="fas fa-exclamation-triangle" style={{ color: '#dc3545' }} /></div>
            <div className="stat-content">
              <div className="stat-number">
                {pendingUsers.filter(u => getDaysWaiting(u.created_at) > 3).length}
              </div>
              <div className="stat-label">Overdue (3+ days)</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><i className="fas fa-business-time" style={{ color: '#007bff' }} /></div>
            <div className="stat-content">
              <div className="stat-number">
                {pendingUsers.filter(u => u.applications?.some(a => a.status === 'under_review')).length}
              </div>
              <div className="stat-label">In Review</div>
            </div>
          </div>
        </div>

        {pendingUsers.length === 0 ? (
          <div className="dashboard-card">
            <div className="empty-state">
              <i className="fas fa-users-check" style={{ fontSize: 48, color: '#28a745', marginBottom: '1rem' }} />
              <h3>All caught up!</h3>
              <p>No pending sign-ups to review at the moment.</p>
            </div>
          </div>
        ) : (
          <div className="dashboard-card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedUsers.size === pendingUsers.length && pendingUsers.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                  <span className="checkmark" />
                  Select All
                </label>
                {selectedUsers.size > 0 && (
                  <span className="selection-count">{selectedUsers.size} selected</span>
                )}
              </div>
            </div>

            <div className="pending-users-grid">
              {pendingUsers.map((user) => (
                <div key={user.id} className="pending-user-card">
                  <div className="user-card-header">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(user.id)}
                        onChange={(e) => handleUserSelect(user.id, e.target.checked)}
                      />
                      <span className="checkmark" />
                    </label>
                    <div className="waiting-badge">
                      <i className="fas fa-clock" /> {getDaysWaiting(user.created_at)} days waiting
                    </div>
                  </div>

                  <div className="user-info">
                    <div className="user-avatar"><i className="fas fa-user-circle" /></div>
                    <div className="user-details">
                      <h4>{user.full_name}</h4>
                      <p className="user-email">{user.email}</p>
                      <p className="user-phone">{user.phone}</p>
                    </div>
                  </div>

                  {user.business_name && (
                    <div className="business-info">
                      <h5><i className="fas fa-building" /> {user.business_name}</h5>
                      <p className="business-type">{user.business_type}</p>
                      <p className="business-desc">{user.business_description}</p>
                    </div>
                  )}

                  {user.applications && user.applications.length > 0 && (
                    <div className="applications-info">
                      <h6>Related Applications:</h6>
                      {user.applications.map((app, idx) => (
                        <div key={idx} className="app-link">
                          <i className="fas fa-file-alt" />
                          <span>{app.id}</span>
                          <span className={`status-badge ${app.status}`}>{app.status}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {user.verification_notes && (
                    <div className="verification-notes">
                      <i className="fas fa-sticky-note" />
                      <span>{user.verification_notes}</span>
                    </div>
                  )}

                  <div className="user-actions">
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleIndividualAction(user.id, 'approve')}
                      disabled={actionLoading}
                    >
                      <i className="fas fa-check" /> Approve
                    </button>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => router.push(`/users/${user.id}`)}
                    >
                      <i className="fas fa-eye" /> Review
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleIndividualAction(user.id, 'reject')}
                      disabled={actionLoading}
                    >
                      <i className="fas fa-times" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
