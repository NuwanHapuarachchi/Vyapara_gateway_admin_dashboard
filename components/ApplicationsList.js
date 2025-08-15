import React, { useState, useEffect } from 'react'

const ApplicationsList = () => {
  const [applications, setApplications] = useState([])
  const [stats, setStats] = useState({
    total: 1,
    recent: 1, 
    pending: 1,
    approved: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load mock data
  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      const mockApplications = [
        {
          id: '1',
          application_number: 'VG202508000001',
          business_name: 'Test Business Ltd',
          business_type: 'Sole Proprietorship',
          status: 'SUBMITTED',
          created_at: '2025-08-15T10:00:00Z',
          applicant: {
            full_name: 'John Doe',
            email: 'john@example.com'
          }
        }
      ]
      
      setApplications(mockApplications)
      setLoading(false)
    }, 500)
  }, [])

  if (loading) {
    return <div className="loading">Loading applications...</div>
  }

  if (error) {
    return <div className="error">Error: {error}</div>
  }

  return (
    <div className="applications-list">
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Applications</h3>
          <p className="stat-number">{stats.total}</p>
        </div>
        <div className="stat-card">
          <h3>Recent (30 days)</h3>
          <p className="stat-number">{stats.recent}</p>
        </div>
        <div className="stat-card">
          <h3>Pending</h3>
          <p className="stat-number">{stats.pending}</p>
        </div>
        <div className="stat-card">
          <h3>Approved</h3>
          <p className="stat-number">{stats.approved}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="filters-section">
        <input 
          type="text" 
          placeholder="Search by application number"
          className="search-input"
        />
        <select className="filter-select">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select className="filter-select">
          <option value="">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {/* Applications Table */}
      <div className="applications-table">
        <div className="table-header">
          <div className="header-cell">Application #</div>
          <div className="header-cell">Business Name</div>
          <div className="header-cell">Type</div>
          <div className="header-cell">Status</div>
          <div className="header-cell">Submitted</div>
        </div>
        
        {applications.map((app) => (
          <div key={app.id} className="table-row">
            <div className="cell">
              <span className="application-number">{app.application_number}</span>
            </div>
            <div className="cell">
              <div>
                <div className="business-name">{app.business_name}</div>
                <div className="applicant-name">{app.applicant?.full_name}</div>
              </div>
            </div>
            <div className="cell">
              <span className="business-type">{app.business_type}</span>
            </div>
            <div className="cell">
              <span className={`status-badge status-${app.status.toLowerCase()}`}>
                {app.status}
              </span>
            </div>
            <div className="cell">
              <span className="date">
                {new Date(app.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ApplicationsList
