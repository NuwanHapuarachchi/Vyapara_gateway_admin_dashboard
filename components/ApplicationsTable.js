import { useState, useMemo } from 'react'
import Link from 'next/link'

export default function ApplicationsTable({ applications }) {
  const [selectedRows, setSelectedRows] = useState([]) // array of IDs
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })

  const handleSort = (key) => {
    setSortConfig((prev) => {
      const direction = prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
      return { key, direction }
    })
  }

  const toggleRow = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const allSelected = selectedRows.length > 0 && selectedRows.length === applications.length
  const toggleAll = () => {
    setSelectedRows(allSelected ? [] : applications.map(a => a.id))
  }

  const sortedApps = useMemo(() => {
    if (!sortConfig.key) return applications
    const { key, direction } = sortConfig
    const mul = direction === 'asc' ? 1 : -1
    return [...applications].sort((a, b) => {
      let av = a[key], bv = b[key]

      // handle dates & numbers
      if (key === 'submittedDate') {
        av = new Date(av).getTime(); bv = new Date(bv).getTime()
      } else if (key === 'aging') {
        av = Number(av); bv = Number(bv)
      } else {
        av = String(av ?? '').toLowerCase()
        bv = String(bv ?? '').toLowerCase()
      }

      if (av < bv) return -1 * mul
      if (av > bv) return  1 * mul
      return 0
    })
  }, [applications, sortConfig])

  return (
    <div className="applications-table-container">
      <div className="table-header">
        <div className="table-controls">
          <div className="selected-info">
            {selectedRows.length > 0 && <span>{selectedRows.length} selected</span>}
          </div>
          <div className="bulk-actions">
            <select className="bulk-select" disabled={selectedRows.length === 0}>
              <option>Bulk Actions</option>
              <option>Assign to Reviewer</option>
              <option>Move to Review</option>
              <option>Export Selected</option>
            </select>
          </div>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="applications-table">
          <thead>
            <tr>
              <th>
                <input type="checkbox" checked={allSelected} onChange={toggleAll} />
              </th>
              <th onClick={() => handleSort('id')}>Application ID <i className="fa-solid fa-sort"></i></th>
              <th onClick={() => handleSort('applicantName')}>Applicant Name <i className="fa-solid fa-sort"></i></th>
              <th onClick={() => handleSort('businessName')}>Business Name <i className="fa-solid fa-sort"></i></th>
              <th onClick={() => handleSort('businessType')}>Business Type <i className="fa-solid fa-sort"></i></th>
              <th onClick={() => handleSort('status')}>Status <i className="fa-solid fa-sort"></i></th>
              <th onClick={() => handleSort('submittedDate')}>Submitted Date <i className="fa-solid fa-sort"></i></th>
              <th>Assignee</th>
              <th onClick={() => handleSort('aging')}>Aging <i className="fa-solid fa-sort"></i></th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedApps.map((app) => (
              <tr key={app.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(app.id)}
                    onChange={() => toggleRow(app.id)}
                  />
                </td>
                <td>
                  <Link href={`/applications/${app.id}`} className="app-id-link">
                    {app.id}
                  </Link>
                </td>
                <td>
                  <div className="applicant-cell">
                    <div className="applicant-avatar">
                      {app.applicantName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span>{app.applicantName}</span>
                  </div>
                </td>
                <td>{app.businessName}</td>
                <td><span className="business-type-badge">{app.businessType}</span></td>
                <td>
                  <span className={`status-badge ${
                    (app.status || '').toLowerCase() === 'pending' ? 'pending'
                    : (app.status || '').toLowerCase() === 'approved' ? 'approved'
                    : (app.status || '').toLowerCase() === 'rejected' ? 'rejected'
                    : 'review'
                  }`}>
                    {app.status}
                  </span>
                </td>
                <td>{new Date(app.submittedDate).toLocaleDateString()}</td>
                <td>
                  <div className="assignee-cell">
                    <div className="assignee-avatar">
                      {app.assignee?.split(' ').map(n => n[0]).join('') || 'UN'}
                    </div>
                    <span>{app.assignee || 'Unassigned'}</span>
                  </div>
                </td>
                <td>
                  <span className={`aging-badge ${app.aging > 5 ? 'critical' : app.aging > 3 ? 'warning' : 'normal'}`}>
                    {app.aging}d
                  </span>
                </td>
                <td>
                  <div className="action-dropdown">
                    <button className="action-btn"><i className="fa-solid fa-ellipsis-vertical"></i></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-pagination">
        <div className="pagination-info">Showing 1 to 10 of 24 entries</div>
        <div className="pagination-controls">
          <button className="pagination-btn">Previous</button>
          <button className="pagination-btn active">1</button>
          <button className="pagination-btn">2</button>
          <button className="pagination-btn">3</button>
          <button className="pagination-btn">Next</button>
        </div>
      </div>
    </div>
  )
}
